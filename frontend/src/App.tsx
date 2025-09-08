import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import {
  Fixture,
  FixturesResponse,
  ExportResponse,
  ErrorResponse,
  FixtureCardProps,
  FilterCounts,
  ViewMode,
  PerformanceMetrics,
} from './types';
import { useAccessibility } from './hooks/useAccessibility';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { createSkipLinks } from './utils/focusManagement';
import ScreenReaderAnnouncer from './components/ui/ScreenReaderAnnouncer';
import Button from './components/ui/Button';
import Card from './components/ui/Card';
// Import data visualization components
import { BettingStatistics, FixtureTrends, TeamPerformance } from './components/charts';
// Import animated components
import { PageTransition, FixtureAnimatedList } from './components/animated';
import { shouldReduceMotion } from './utils/motionConfig';

function App(): JSX.Element {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [filteredFixtures, setFilteredFixtures] = useState<Fixture[]>([]);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [allTeams, setAllTeams] = useState<string[]>([]);
  const [allLeagues, setAllLeagues] = useState<string[]>([]);
  const [teamSearchTerm, setTeamSearchTerm] = useState<string>('');
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<'fixtures' | 'analytics'>('fixtures');
  
  // Motion preferences and state
  const [reduceMotion, setReduceMotion] = useState<boolean>(shouldReduceMotion);

  // Accessibility hooks
  const {
    announcements,
    announce,
    announceFilterChange,
    announceLoading,
    announceError,
    announceSuccess,
    formatNumberForScreenReader,
    getEmojiDescription,
    skipToMain
  } = useAccessibility();

  // View mode state - default to card view on mobile, table on larger screens  
  const [viewMode, setViewMode] = useState<ViewMode>('auto');

  // Keyboard navigation for fixture cards
  const fixtureNavigation = useKeyboardNavigation({
    orientation: viewMode === 'card' ? 'grid' : 'vertical',
    gridColumns: viewMode === 'card' ? 3 : 1, // Adjust based on responsive breakpoints
    wrap: false,
    itemSelector: '[data-keyboard-item]',
    onNavigate: (info: any) => {
      announce(`Fixture ${info.index + 1} of ${info.total}`, 'polite');
    }
  });

  // Initialize skip links on mount
  useEffect(() => {
    createSkipLinks({
      skipToMain: true,
      customSkips: [
        { target: 'filters-section', text: 'Skip to filters' },
        { target: 'results-section', text: 'Skip to results' }
      ]
    });
  }, []);


  // Touch gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const tableRef = useRef<HTMLTableElement>(null);

  // Auto-detect view mode based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (viewMode === 'auto') {
        // Auto-switch based on screen width
        if (window.innerWidth < 768) {
          // mobile breakpoint
          setViewMode('card');
        } else {
          setViewMode('table');
        }
      }
    };

    // Set initial view mode
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  // Monitor reduced motion preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load fixtures data on component mount
  useEffect(() => {
    loadFixtures();
  }, []);

  const loadFixtures = async (): Promise<void> => {
    setIsLoading(true);
    setMessage('Loading fixtures data...');
    announceLoading(true, 'fixtures data');
    console.log('🔄 Loading fixtures from API...');

    try {
      const response = await fetch('/api/fixtures');
      const result: FixturesResponse | ErrorResponse = await response.json();
      console.log('📊 API Response:', result);

      if (response.ok && 'fixtures' in result) {
        setFixtures(result.fixtures);
        setFilteredFixtures(result.fixtures);
        console.log('✅ Loaded fixtures:', result.fixtures.length);

        // Extract unique teams for filtering
        const teams = Array.from(
          new Set(
            [
              ...result.fixtures.map(f => f.home_team),
              ...result.fixtures.map(f => f.away_team),
            ].filter(Boolean)
          )
        ).sort();

        // Extract unique leagues for filtering
        const leagues = Array.from(
          new Set(result.fixtures.map(f => f.league).filter(Boolean))
        ).sort();

        setAllTeams(teams);
        setAllLeagues(leagues);
        console.log('🏆 Available leagues:', leagues);
        console.log('⚽ Available teams:', teams.length);
        
        const successMessage = `Loaded ${formatNumberForScreenReader(result.total_count)} fixtures from ${result.file}`;
        setMessage(successMessage);
        announceSuccess('Fixtures loaded', `${result.total_count} fixtures available for betting`);
      } else {
        const error = 'error' in result ? result.error : 'Unknown error';
        console.error('❌ API Error:', error);
        setMessage(`Error: ${error}`);
        announceError(error, 'Please try refreshing the page or check your connection.');
      }
    } catch (error) {
      console.error('❌ API Connection Error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setMessage(`Error loading data: ${message}`);
      announceError(`Failed to load fixtures: ${message}`, 'Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeagueChange = (league: string): void => {
    const isAdded = !selectedLeagues.includes(league);
    setSelectedLeagues(prev =>
      prev.includes(league) ? prev.filter(l => l !== league) : [...prev, league]
    );
    
    // Announce filter change after state update
    setTimeout(() => {
      const cleanLeagueName = league
        .replace('ENG-', '')
        .replace('ESP-', '')
        .replace('ITA-', '')
        .replace('GER-', '')
        .replace('FRA-', '');
      announceFilterChange('League', cleanLeagueName, isAdded, filteredFixtures.length);
    }, 100);
  };

  const handleTeamChange = (team: string): void => {
    const isAdded = !selectedTeams.includes(team);
    setSelectedTeams(prev =>
      prev.includes(team) ? prev.filter(t => t !== team) : [...prev, team]
    );
    
    // Announce filter change after state update
    setTimeout(() => {
      announceFilterChange('Team', team, isAdded, filteredFixtures.length);
    }, 100);
  };

  // Apply filters whenever filter criteria change
  useEffect(() => {
    console.log('🔍 Applying filters...', {
      selectedLeagues: selectedLeagues.length,
      selectedTeams: selectedTeams.length,
      dateFrom,
      dateTo,
    });

    let filtered = fixtures;
    console.log('📊 Starting with fixtures:', filtered.length);

    if (selectedLeagues.length > 0) {
      filtered = filtered.filter(fixture => selectedLeagues.includes(fixture.league));
      console.log('🏆 After league filter:', filtered.length);
    }

    if (selectedTeams.length > 0) {
      filtered = filtered.filter(
        fixture =>
          selectedTeams.includes(fixture.home_team) || selectedTeams.includes(fixture.away_team)
      );
      console.log('⚽ After team filter:', filtered.length);
    }

    if (dateFrom) {
      filtered = filtered.filter(fixture => fixture.date >= dateFrom);
      console.log('📅 After date from filter:', filtered.length);
    }

    if (dateTo) {
      filtered = filtered.filter(fixture => fixture.date <= dateTo);
      console.log('📅 After date to filter:', filtered.length);
    }

    setFilteredFixtures(filtered);
    console.log('✅ Final filtered fixtures:', filtered.length);
  }, [fixtures, selectedLeagues, selectedTeams, dateFrom, dateTo]);

  const exportFilteredData = async (): Promise<void> => {
    if (filteredFixtures.length === 0) {
      setMessage('No fixtures to export');
      return;
    }

    setIsLoading(true);
    setMessage('Exporting data...');

    try {
      const response = await fetch('/api/fixtures/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fixtures: filteredFixtures,
          filename: `filtered_fixtures_${new Date().toISOString().split('T')[0]}.csv`,
        }),
      });

      const result: ExportResponse | ErrorResponse = await response.json();

      if (response.ok && 'message' in result) {
        setMessage(`Success! ${result.message}`);
      } else {
        const error = 'error' in result ? result.error : 'Unknown error';
        setMessage(`Error: ${error}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      setMessage(`Error: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Memoized league and team counts for performance
  const leagueCounts = useMemo((): FilterCounts => {
    const counts: FilterCounts = {};
    fixtures.forEach(fixture => {
      if (fixture.league) {
        counts[fixture.league] = (counts[fixture.league] || 0) + 1;
      }
    });
    return counts;
  }, [fixtures]);

  const teamCounts = useMemo((): FilterCounts => {
    const counts: FilterCounts = {};
    fixtures.forEach(fixture => {
      if (fixture.home_team) {
        counts[fixture.home_team] = (counts[fixture.home_team] || 0) + 1;
      }
      if (fixture.away_team) {
        counts[fixture.away_team] = (counts[fixture.away_team] || 0) + 1;
      }
    });
    return counts;
  }, [fixtures]);

  // Memoized computed values for better performance
  const filteredTeams = useMemo((): string[] => {
    if (!teamSearchTerm) return allTeams;
    const searchLower = teamSearchTerm.toLowerCase();
    return allTeams.filter(team => team.toLowerCase().includes(searchLower));
  }, [allTeams, teamSearchTerm]);

  // Optimized helper functions using memoized values
  const getLeagueCount = useCallback(
    (league: string): number => {
      return leagueCounts[league] || 0;
    },
    [leagueCounts]
  );

  const getTeamCount = useCallback(
    (team: string): number => {
      return teamCounts[team] || 0;
    },
    [teamCounts]
  );

  const clearFilters = () => {
    console.log('🗑️ Clearing all filters');
    setSelectedLeagues([]);
    setSelectedTeams([]);
    setDateFrom('');
    setDateTo('');
    setTeamSearchTerm('');
    setShowMobileFilters(false);
  };

  // Touch gesture handlers for mobile interactions
  const handleTouchStart = useCallback((e: React.TouchEvent): void => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsScrolling(false);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent): void => {
      if (!touchStart) return;

      const currentTouch = e.targetTouches[0].clientX;
      const diff = Math.abs(touchStart - currentTouch);

      // If the user is moving vertically more than horizontally, it's scrolling
      if (Math.abs(e.targetTouches[0].clientY - touchStart) > diff) {
        setIsScrolling(true);
        return;
      }

      setTouchEnd(currentTouch);
    },
    [touchStart]
  );

  const handleTouchEnd = useCallback((): void => {
    if (!touchStart || !touchEnd || isScrolling) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    // Handle swipe gestures
    if (isLeftSwipe && !showMobileFilters) {
      // Left swipe to show filters on mobile
      setShowMobileFilters(true);
      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    } else if (isRightSwipe && showMobileFilters) {
      // Right swipe to hide filters on mobile
      setShowMobileFilters(false);
      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  }, [touchStart, touchEnd, isScrolling, showMobileFilters]);

  // Enhanced clear filters with haptic feedback
  const clearFiltersWithFeedback = useCallback(() => {
    clearFilters();
    // Add haptic feedback for better mobile UX
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]); // Pattern: vibrate-pause-vibrate
    }
  }, []);

  // Performance monitoring for different device types
  const performanceMetrics = useRef<PerformanceMetrics>({
    renderStart: Date.now(),
    lastRender: Date.now(),
    renderCount: 0,
  });

  // Track performance metrics
  useEffect(() => {
    performanceMetrics.current.lastRender = Date.now();
    performanceMetrics.current.renderCount++;

    if (performanceMetrics.current.renderCount % 10 === 0) {
      console.log('Performance metrics:', {
        totalTime: Date.now() - performanceMetrics.current.renderStart,
        averageRenderTime:
          (Date.now() - performanceMetrics.current.renderStart) /
          performanceMetrics.current.renderCount,
        renderCount: performanceMetrics.current.renderCount,
        deviceType:
          window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
      });
    }
  });

  // Memoized adaptive card component for mobile-first fixture display
  const FixtureCard = memo<FixtureCardProps>(({ fixture }) => {
    const isFinished = useMemo(
      (): boolean => !!(fixture.home_score && fixture.away_score),
      [fixture.home_score, fixture.away_score]
    );

    const leagueName = useMemo(
      (): string =>
        fixture.league
          ?.replace('ENG-', '')
          .replace('ESP-', '')
          .replace('ITA-', '')
          .replace('GER-', '')
          .replace('FRA-', '') || '',
      [fixture.league]
    );

    const formattedDate = useMemo(
      (): string =>
        new Date(fixture.date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: '2-digit',
        }),
      [fixture.date]
    );

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mobile:p-5 hover:shadow-md active:shadow-lg transition-all duration-150 touch-manipulation transform active:scale-[0.98]">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mobile:space-x-3 mb-2">
              <span className="inline-flex items-center px-2 mobile:px-3 py-1 mobile:py-1.5 rounded-full text-xs mobile:text-sm font-medium bg-primary-yellow text-primary-black">
                {leagueName}
              </span>
              <span className="text-fluid-sm text-gray-500 font-medium">{formattedDate}</span>
            </div>

            {/* Match Teams */}
            <div className="space-y-1 mobile:space-y-2">
              <div className="text-fluid-base font-semibold text-gray-900">{fixture.home_team}</div>
              <div className="text-xs mobile:text-sm text-gray-400 font-medium text-center">VS</div>
              <div className="text-fluid-base font-semibold text-gray-900">{fixture.away_team}</div>
            </div>
          </div>

          {/* Score and Status */}
          <div className="text-center flex-shrink-0">
            {isFinished ? (
              <>
                <div className="text-fluid-xl font-bold text-primary-red mb-2">
                  {fixture.home_score}-{fixture.away_score}
                </div>
                <span className="inline-flex items-center px-2 mobile:px-3 py-1 mobile:py-1.5 rounded-full text-xs mobile:text-sm font-medium bg-green-100 text-green-800">
                  <span className="mr-1">✅</span>
                  <span>Finished</span>
                </span>
              </>
            ) : (
              <>
                <div className="text-fluid-lg font-medium text-gray-400 mb-2">TBD</div>
                <span className="inline-flex items-center px-2 mobile:px-3 py-1 mobile:py-1.5 rounded-full text-xs mobile:text-sm font-medium bg-primary-red text-white">
                  <span className="mr-1">🎯</span>
                  <span>Available</span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  });

  // Add display name for debugging
  FixtureCard.displayName = 'FixtureCard';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Screen reader announcements */}
      <ScreenReaderAnnouncer announcements={announcements} />
      
      {/* Skip links */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-red focus:text-white focus:rounded"
        onClick={(e) => {
          e.preventDefault();
          skipToMain();
        }}
      >
        Skip to main content
      </a>

      {/* Header */}
      <header 
        className="bg-gradient-to-r from-primary-black to-gray-800 text-white shadow-lg" 
        role="banner"
      >
        <div className="container mx-auto px-4 mobile:px-6 lg:px-8 py-6 mobile:py-8 tablet:py-10">
          <div className="text-center">
            <h1 className="text-fluid-2xl mobile:text-fluid-3xl tablet:text-fluid-4xl font-bold mb-2 xs:mb-3 lg:mb-4">
              <span className="text-primary-yellow">Super Cool</span> Betting Club
            </h1>
            <p className="text-gray-300 text-fluid-sm mobile:text-fluid-base max-w-2xl mx-auto">
              <span role="img" aria-label={getEmojiDescription('🏆')}>🏆</span> European Soccer Fixtures & Betting Hub
            </p>
            <div className="mt-4 mobile:mt-6 flex justify-center flex-wrap gap-2 mobile:gap-3 text-xs mobile:text-sm tablet:text-base">
              <span className="bg-primary-red px-3 py-1.5 mobile:px-4 mobile:py-2 rounded-full font-medium">
                {formatNumberForScreenReader(fixtures.length)} Total Fixtures
              </span>
              <span className="bg-primary-yellow text-primary-black px-3 py-1.5 mobile:px-4 mobile:py-2 rounded-full font-medium">
                {formatNumberForScreenReader(filteredFixtures.length)} Filtered
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm" aria-label="Main navigation">
        <div className="container mx-auto px-4 mobile:px-6 lg:px-8">
          <div className="flex justify-center space-x-1 py-2">
            <button
              onClick={() => setCurrentSection('fixtures')}
              className={`px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                currentSection === 'fixtures'
                  ? 'bg-primary-red text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              role="tab"
              aria-selected={currentSection === 'fixtures'}
              aria-label="View fixtures and betting opportunities"
            >
              <span className="flex items-center space-x-2">
                <span role="img" aria-label={getEmojiDescription('⚽')}>⚽</span>
                <span>Fixtures</span>
              </span>
            </button>
            <button
              onClick={() => setCurrentSection('analytics')}
              className={`px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                currentSection === 'analytics'
                  ? 'bg-primary-red text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              role="tab"
              aria-selected={currentSection === 'analytics'}
              aria-label="View data analytics and statistics"
            >
              <span className="flex items-center space-x-2">
                <span role="img" aria-label={getEmojiDescription('📊')}>📊</span>
                <span>Analytics</span>
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Filter Toggle - Only show in fixtures section */}
      {currentSection === 'fixtures' && (
        <nav className="tablet:hidden bg-white border-b border-gray-200 px-4 mobile:px-6" aria-label="Filter controls">
        <Button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 py-4 min-h-touch focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-inset rounded transition-colors hover:bg-gray-50 active:bg-gray-100"
          variant="ghost"
          aria-expanded={showMobileFilters}
          aria-controls="mobile-filters"
          aria-label={`${showMobileFilters ? 'Hide' : 'Show'} betting filters`}
        >
          <span className="flex items-center text-fluid-base">
            <span className="text-primary-red mr-2 text-lg" role="img" aria-label={getEmojiDescription('🎯')}>🎯</span>
            <span>Filters</span>
            {(selectedLeagues.length > 0 || selectedTeams.length > 0 || dateFrom || dateTo) && (
              <span className="ml-2 mobile:ml-3 bg-primary-red text-white text-xs mobile:text-sm px-2 mobile:px-3 py-1 mobile:py-1.5 rounded-full font-medium animate-pulse">
                {selectedLeagues.length +
                  selectedTeams.length +
                  (dateFrom ? 1 : 0) +
                  (dateTo ? 1 : 0)}{' '}
                Active
              </span>
            )}
          </span>
          <span
            className={`text-2xl mobile:text-3xl text-primary-red font-light transition-transform duration-200 transform ${
              showMobileFilters ? 'rotate-180' : 'rotate-0'
            }`}
            aria-hidden="true"
          >
            {showMobileFilters ? '▲' : '▼'}
          </span>
        </Button>
        
        {/* Swipe Hint for Mobile Users */}
        <div className="py-2 text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center">
            <span className="mr-1" role="img" aria-label={getEmojiDescription('👍')}>👍</span>
            <span>Swipe right to {showMobileFilters ? 'hide' : 'show'} filters</span>
          </p>
        </div>
      </nav>
      )}

      {/* Main Content */}
      <div
        className="container mx-auto px-4 mobile:px-6 tablet:px-8 py-6 mobile:py-8"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <PageTransition pageKey={currentSection} reduceMotion={reduceMotion}>
        {currentSection === 'fixtures' ? (
          <div className="tablet:grid tablet:grid-cols-12 xl:grid-cols-16 gap-6 tablet:gap-8 desktop:gap-10">
          {/* Filters Sidebar */}
          <aside
            id="filters-section"
            className={`tablet:col-span-4 xl:col-span-4 2xl:col-span-3 mb-6 tablet:mb-0 ${
              showMobileFilters
                ? 'block animate-in slide-in-from-top-2 duration-200'
                : 'hidden tablet:block'
            }`}
            aria-label="Betting filters"
          >
            <div id="mobile-filters" className="bg-white rounded-lg shadow-betting p-4 mobile:p-6 tablet:p-4 desktop:p-6 tablet:sticky tablet:top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="space-y-4 mobile:space-y-6">
                {/* League Filter */}
                <fieldset>
                  <legend className="font-bold text-fluid-lg text-gray-900 mb-3 mobile:mb-4 flex items-center tracking-tight">
                    <span className="text-primary-yellow mr-2" role="img" aria-label={getEmojiDescription('🏆')}>🏆</span>
                    <span>Leagues</span>
                  </legend>
                  <div className="space-y-2 max-h-48 overflow-y-auto" role="group" aria-label="League selection">
                    {allLeagues.map(league => (
                      <label
                        key={league}
                        className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 p-2 mobile:p-3 rounded-lg transition-colors duration-150 min-h-touch"
                      >
                        <input
                          type="checkbox"
                          checked={selectedLeagues.includes(league)}
                          onChange={() => handleLeagueChange(league)}
                          className="h-4 w-4 mobile:h-5 mobile:w-5 text-primary-red border-gray-300 rounded focus:ring-primary-red focus:ring-offset-1 transition-colors"
                          aria-describedby={`league-count-${league.replace(/\W/g, '')}`}
                        />
                        <span className="text-fluid-sm flex-1 leading-relaxed">
                          {league
                            .replace('ENG-', '')
                            .replace('ESP-', '')
                            .replace('ITA-', '')
                            .replace('GER-', '')
                            .replace('FRA-', '')}
                        </span>
                        <span 
                          id={`league-count-${league.replace(/\W/g, '')}`}
                          className="text-xs mobile:text-sm text-gray-500 bg-gray-100 px-2 mobile:px-3 py-1 mobile:py-1.5 rounded-full font-medium"
                          aria-label={`${getLeagueCount(league)} fixtures in this league`}
                        >
                          {getLeagueCount(league)}
                        </span>
                      </label>
                    ))}
                    {allLeagues.length === 0 && (
                      <div className="text-center py-4 text-gray-500" role="status" aria-live="polite">
                        <div className="animate-pulse-slow">Loading leagues...</div>
                      </div>
                    )}
                  </div>
                </fieldset>

                {/* Team Filter */}
                <fieldset>
                  <legend className="font-bold text-fluid-lg text-gray-900 mb-3 mobile:mb-4 flex items-center tracking-tight">
                    <span className="text-primary-red mr-2" role="img" aria-label={getEmojiDescription('⚽')}>⚽</span>
                    <span>Teams</span>
                  </legend>
                  <div className="mb-2">
                    <label htmlFor="team-search" className="sr-only">
                      Search teams by name
                    </label>
                    <input
                      id="team-search"
                      type="text"
                      placeholder="Search teams..."
                      value={teamSearchTerm}
                      onChange={e => setTeamSearchTerm(e.target.value)}
                      className="w-full px-4 mobile:px-5 py-3 mobile:py-4 border border-gray-300 rounded-lg text-fluid-sm focus:ring-2 focus:ring-primary-red focus:border-primary-red focus:ring-offset-1 transition-colors duration-150 placeholder:text-gray-400 min-h-touch"
                      aria-describedby="team-search-help"
                      autoComplete="off"
                      role="searchbox"
                    />
                    <div id="team-search-help" className="sr-only">
                      Type to filter teams by name. Use arrow keys to navigate results.
                    </div>
                  </div>
                  <div 
                    className="mt-2 space-y-1 max-h-32 overflow-y-auto border border-gray-200 rounded p-2"
                    role="group" 
                    aria-label="Team selection"
                    aria-live="polite"
                    aria-atomic="false"
                  >
                    {filteredTeams.slice(0, 10).map(team => (
                      <label
                        key={team}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded text-sm min-h-touch"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTeams.includes(team)}
                          onChange={() => handleTeamChange(team)}
                          className="h-3 w-3 text-primary-red border-gray-300 rounded focus:ring-primary-red"
                          aria-describedby={`team-count-${team.replace(/\W/g, '')}`}
                        />
                        <span className="flex-1 truncate">{team}</span>
                        <span 
                          id={`team-count-${team.replace(/\W/g, '')}`}
                          className="text-xs text-gray-500"
                          aria-label={`${getTeamCount(team)} fixtures for this team`}
                        >
                          ({getTeamCount(team)})
                        </span>
                      </label>
                    ))}
                    {filteredTeams.length > 10 && (
                      <p className="text-xs text-gray-500 italic text-center py-2" role="status">
                        +{filteredTeams.length - 10} more teams. Refine search to see all.
                      </p>
                    )}
                    {filteredTeams.length === 0 && teamSearchTerm && (
                      <p className="text-xs text-gray-500 text-center py-2" role="alert">
                        No teams match your search for "{teamSearchTerm}".
                      </p>
                    )}
                  </div>
                </fieldset>

                {/* Date Filter */}
                <fieldset>
                  <legend className="font-bold text-fluid-lg text-gray-900 mb-3 mobile:mb-4 flex items-center tracking-tight">
                    <span className="text-primary-yellow mr-2" role="img" aria-label={getEmojiDescription('📅')}>📅</span>
                    <span>Date Range</span>
                  </legend>
                  <div className="space-y-4 mobile:space-y-5">
                    <div>
                      <label htmlFor="date-from" className="block text-fluid-sm font-medium text-gray-700 mb-2 mobile:mb-3">
                        From Date:
                      </label>
                      <input
                        id="date-from"
                        type="date"
                        value={dateFrom}
                        onChange={e => {
                          setDateFrom(e.target.value);
                          // Announce date filter change
                          setTimeout(() => {
                            if (e.target.value) {
                              const formattedDate = new Date(e.target.value).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              });
                              announce(`Date filter updated: showing fixtures from ${formattedDate}`, 'polite');
                            } else {
                              announce('Start date filter cleared', 'polite');
                            }
                          }, 100);
                        }}
                        className="w-full px-4 mobile:px-5 py-3 mobile:py-4 border border-gray-300 rounded-lg text-fluid-sm focus:ring-2 focus:ring-primary-red focus:border-primary-red focus:ring-offset-1 transition-colors duration-150 min-h-touch"
                        aria-describedby="date-from-help"
                      />
                      <div id="date-from-help" className="sr-only">
                        Select the earliest date to show fixtures from. Leave blank to show all dates.
                      </div>
                    </div>
                    <div>
                      <label htmlFor="date-to" className="block text-fluid-sm font-medium text-gray-700 mb-2 mobile:mb-3">
                        To Date:
                      </label>
                      <input
                        id="date-to"
                        type="date"
                        value={dateTo}
                        onChange={e => {
                          setDateTo(e.target.value);
                          // Announce date filter change
                          setTimeout(() => {
                            if (e.target.value) {
                              const formattedDate = new Date(e.target.value).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              });
                              announce(`Date filter updated: showing fixtures until ${formattedDate}`, 'polite');
                            } else {
                              announce('End date filter cleared', 'polite');
                            }
                          }, 100);
                        }}
                        className="w-full px-4 mobile:px-5 py-3 mobile:py-4 border border-gray-300 rounded-lg text-fluid-sm focus:ring-2 focus:ring-primary-red focus:border-primary-red focus:ring-offset-1 transition-colors duration-150 min-h-touch"
                        aria-describedby="date-to-help"
                        min={dateFrom || undefined}
                      />
                      <div id="date-to-help" className="sr-only">
                        Select the latest date to show fixtures until. Leave blank to show all dates.
                      </div>
                    </div>
                  </div>
                </fieldset>

                {/* Action Buttons */}
                <div className="space-y-3 mobile:space-y-4" role="group" aria-labelledby="filter-actions">
                  <h4 id="filter-actions" className="sr-only">Filter Actions</h4>
                  
                  <Button
                    onClick={clearFiltersWithFeedback}
                    variant="secondary"
                    size="md"
                    className="w-full"
                    startIcon={<span role="img" aria-label={getEmojiDescription('🗑️')}>🗑️</span>}
                    announceAction={true}
                    aria-label="Clear all active filters"
                  >
                    Clear All Filters
                  </Button>
                  
                  <Button
                    onClick={exportFilteredData}
                    disabled={isLoading || filteredFixtures.length === 0}
                    variant="primary"
                    size="md"
                    loading={isLoading}
                    className="w-full"
                    startIcon={isLoading ? undefined : <span role="img" aria-label={getEmojiDescription('📥')}>📥</span>}
                    announceAction={true}
                    aria-label={`Export ${filteredFixtures.length} filtered fixtures to CSV`}
                    aria-describedby={filteredFixtures.length === 0 ? "export-help" : undefined}
                  >
                    {isLoading ? (
                      'Exporting...'
                    ) : (
                      <>
                        <span className="hidden mobile:inline">Export </span>
                        <span>{formatNumberForScreenReader(filteredFixtures.length)} Fixtures</span>
                      </>
                    )}
                  </Button>
                  
                  {filteredFixtures.length === 0 && (
                    <div id="export-help" className="sr-only">
                      Export is disabled because no fixtures match your current filters. Adjust your filters to enable export.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Results Section */}
          <main 
            id="results-section"
            className="tablet:col-span-8 xl:col-span-12 2xl:col-span-13" 
            role="main"
            aria-label="Fixtures and betting opportunities"
          >
            <section className="bg-white rounded-lg shadow-betting overflow-hidden">
              {/* Results Header */}
              <header className="px-4 mobile:px-6 tablet:px-4 desktop:px-6 py-5 mobile:py-6 border-b border-gray-200">
                <div className="flex flex-col mobile:flex-row mobile:items-center mobile:justify-between gap-3 mobile:gap-4">
                  <div className="flex-1">
                    <h2 className="text-fluid-lg tablet:text-fluid-xl font-medium text-gray-900">
                      Fixtures ({formatNumberForScreenReader(filteredFixtures.length)})
                    </h2>
                    <p className="mt-1 text-fluid-sm text-gray-500 max-w-2xl">
                      Showing betting opportunities from top European leagues
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 mobile:space-x-3" role="group" aria-label="View and data controls">
                    {/* View Toggle */}
                    <fieldset className="flex items-center bg-gray-100 rounded-lg p-1">
                      <legend className="sr-only">Choose how to display fixtures</legend>
                      <Button
                        onClick={() => {
                          setViewMode('card');
                          announce('Switched to card view', 'polite', 150);
                        }}
                        variant={viewMode === 'card' ? 'primary' : 'ghost'}
                        size="sm"
                        className={`px-3 mobile:px-4 py-2 mobile:py-2.5 text-xs mobile:text-sm font-medium rounded-md transition-colors duration-150 ${
                          viewMode === 'card'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        aria-pressed={viewMode === 'card'}
                        aria-label="Display fixtures as cards"
                      >
                        <span className="mobile:hidden" role="img" aria-label={getEmojiDescription('🃊')}>🃊</span>
                        <span className="hidden mobile:inline">Cards</span>
                      </Button>
                      <Button
                        onClick={() => {
                          setViewMode('table');
                          announce('Switched to table view', 'polite', 150);
                        }}
                        variant={viewMode === 'table' ? 'primary' : 'ghost'}
                        size="sm"
                        className={`px-3 mobile:px-4 py-2 mobile:py-2.5 text-xs mobile:text-sm font-medium rounded-md transition-colors duration-150 ${
                          viewMode === 'table'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        aria-pressed={viewMode === 'table'}
                        aria-label="Display fixtures as table"
                      >
                        <span className="mobile:hidden" role="img" aria-label="table view">☷️</span>
                        <span className="hidden mobile:inline">Table</span>
                      </Button>
                    </fieldset>

                    <Button
                      onClick={loadFixtures}
                      disabled={isLoading}
                      variant="secondary"
                      size="sm"
                      loading={isLoading}
                      startIcon={isLoading ? undefined : <span role="img" aria-label={getEmojiDescription('🔄')}>🔄</span>}
                      announceAction={true}
                      aria-label="Refresh fixture data from server"
                    >
                      {isLoading ? (
                        <span className="mobile:hidden">...</span>
                      ) : (
                        <span className="hidden mobile:inline">Refresh</span>
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Keyboard navigation instructions */}
                <div className="mt-4 text-xs text-gray-500" role="region" aria-label="Keyboard navigation instructions">
                  <p className="sr-only">
                    Use arrow keys to navigate between fixtures. Press Tab to move between interactive elements. Press Enter or Space to select a fixture.
                  </p>
                </div>
              </header>

              {/* Results Display */}
              <div className="overflow-hidden">
                {filteredFixtures.length > 0 ? (
                  viewMode === 'card' ? (
                    /* Card Layout with Keyboard Navigation */
                    <div className="p-4 mobile:p-6">
                      <FixtureAnimatedList
                        className="grid grid-cols-1 mobile:grid-cols-2 tablet:grid-cols-2 desktop:grid-cols-3 2xl:grid-cols-4 gap-4 mobile:gap-5 desktop:gap-6"
                        reduceMotion={reduceMotion}
                        loading={isLoading}
                        loadingCount={6}
                      >
                        <div 
                          ref={fixtureNavigation.containerRef}
                          className="contents"
                          onKeyDown={fixtureNavigation.handleKeyDown}
                          role="grid"
                          aria-label="Soccer fixtures for betting"
                          tabIndex={-1}
                        >
                          {filteredFixtures.slice(0, 100).map((fixture, index) => (
                            <Card
                            key={index}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mobile:p-5 hover:shadow-md active:shadow-lg transition-all duration-150 touch-manipulation transform active:scale-[0.98]"
                            interactive={true}
                            data-keyboard-item={true}
                            tabIndex={index === 0 ? 0 : -1}
                            role="gridcell"
                            aria-label={`Fixture: ${fixture.home_team} vs ${fixture.away_team} on ${new Date(fixture.date).toLocaleDateString('en-GB')} in ${fixture.league}`}
                            onClick={() => {
                              // Future: Handle fixture selection for betting
                              announce(`Selected fixture: ${fixture.home_team} versus ${fixture.away_team}`, 'polite');
                            }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mobile:space-x-3 mb-2">
                                  <span className="inline-flex items-center px-2 mobile:px-3 py-1 mobile:py-1.5 rounded-full text-xs mobile:text-sm font-medium bg-primary-yellow text-primary-black">
                                    {fixture.league
                                      ?.replace('ENG-', '')
                                      .replace('ESP-', '')
                                      .replace('ITA-', '')
                                      .replace('GER-', '')
                                      .replace('FRA-', '')}
                                  </span>
                                  <time className="text-fluid-sm text-gray-500 font-medium">
                                    {new Date(fixture.date).toLocaleDateString('en-GB', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: '2-digit',
                                    })}
                                  </time>
                                </div>

                                {/* Match Teams */}
                                <div className="space-y-1 mobile:space-y-2">
                                  <div className="text-fluid-base font-semibold text-gray-900">
                                    {fixture.home_team}
                                  </div>
                                  <div className="text-xs mobile:text-sm text-gray-400 font-medium text-center">
                                    <abbr title="versus" className="no-underline">VS</abbr>
                                  </div>
                                  <div className="text-fluid-base font-semibold text-gray-900">
                                    {fixture.away_team}
                                  </div>
                                </div>
                              </div>

                              {/* Score and Status */}
                              <div className="text-center flex-shrink-0">
                                {fixture.home_score && fixture.away_score ? (
                                  <>
                                    <div 
                                      className="text-fluid-xl font-bold text-primary-red mb-2"
                                      aria-label={`Final score: ${fixture.home_team} ${fixture.home_score}, ${fixture.away_team} ${fixture.away_score}`}
                                    >
                                      {fixture.home_score}-{fixture.away_score}
                                    </div>
                                    <span className="inline-flex items-center px-2 mobile:px-3 py-1 mobile:py-1.5 rounded-full text-xs mobile:text-sm font-medium bg-green-100 text-green-800">
                                      <span className="mr-1" role="img" aria-label={getEmojiDescription('✅')}>✅</span>
                                      <span>Finished</span>
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <div className="text-fluid-lg font-medium text-gray-400 mb-2">
                                      <abbr title="To Be Determined" className="no-underline">TBD</abbr>
                                    </div>
                                    <span className="inline-flex items-center px-2 mobile:px-3 py-1 mobile:py-1.5 rounded-full text-xs mobile:text-sm font-medium bg-primary-red text-white">
                                      <span className="mr-1" role="img" aria-label={getEmojiDescription('🎯')}>🎯</span>
                                      <span>Available</span>
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </Card>
                          ))}
                        </div>
                      </FixtureAnimatedList>
                      
                      {filteredFixtures.length > 100 && (
                        <div className="mt-6 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-center" role="status">
                          <p className="text-fluid-sm text-gray-500">
                            Showing first 100 of {formatNumberForScreenReader(filteredFixtures.length)}{' '}
                            fixtures.
                            <span className="text-primary-red font-medium">
                              Export for complete data.
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Table Layout */
                    <div className="overflow-x-auto">
                      <div className="max-h-96 overflow-y-auto">
                        <table ref={tableRef} className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                              <th className="px-2 mobile:px-4 tablet:px-3 desktop:px-4 py-3 mobile:py-4 text-left text-xs mobile:text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-2 mobile:px-4 tablet:px-3 desktop:px-4 py-3 mobile:py-4 text-left text-xs mobile:text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                League
                              </th>
                              <th className="px-2 mobile:px-4 tablet:px-3 desktop:px-4 py-3 mobile:py-4 text-left text-xs mobile:text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                Match
                              </th>
                              <th className="hidden mobile:table-cell px-4 tablet:px-3 desktop:px-4 py-3 mobile:py-4 text-left text-xs mobile:text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                Score
                              </th>
                              <th className="px-2 mobile:px-4 tablet:px-3 desktop:px-4 py-3 mobile:py-4 text-left text-xs mobile:text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredFixtures.slice(0, 100).map((fixture, index) => (
                              <tr
                                key={index}
                                className="hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150 cursor-pointer"
                              >
                                <td className="px-2 mobile:px-4 tablet:px-3 desktop:px-4 py-3 mobile:py-4 whitespace-nowrap text-fluid-sm text-gray-900">
                                  <div className="font-medium">
                                    {new Date(fixture.date).toLocaleDateString('en-GB', {
                                      day: '2-digit',
                                      month: 'short',
                                    })}
                                  </div>
                                  <div className="mobile:hidden text-xs text-gray-500 mt-1">
                                    {fixture.home_score && fixture.away_score ? (
                                      <span className="text-primary-red font-semibold">
                                        {fixture.home_score}-{fixture.away_score}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">TBD</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-2 mobile:px-4 tablet:px-3 desktop:px-4 py-3 mobile:py-4 whitespace-nowrap">
                                  <span className="inline-flex items-center px-2 mobile:px-3 py-1 mobile:py-1.5 rounded-full text-xs mobile:text-sm font-medium bg-primary-yellow text-primary-black">
                                    {fixture.league
                                      ?.replace('ENG-', '')
                                      .replace('ESP-', '')
                                      .replace('ITA-', '')
                                      .replace('GER-', '')
                                      .replace('FRA-', '')
                                      .substring(0, 8)}
                                  </span>
                                </td>
                                <td className="px-2 mobile:px-4 tablet:px-3 desktop:px-4 py-3 mobile:py-4 text-fluid-sm text-gray-900">
                                  <div className="font-medium leading-tight">
                                    <div className="mobile:hidden">
                                      <div className="text-xs text-gray-600">
                                        {fixture.home_team.substring(0, 12)}...
                                      </div>
                                      <div className="text-xs text-gray-400 my-0.5">vs</div>
                                      <div className="text-xs text-gray-600">
                                        {fixture.away_team.substring(0, 12)}...
                                      </div>
                                    </div>
                                    <div className="hidden mobile:block">
                                      {fixture.home_team}{' '}
                                      <span className="text-gray-500 mx-1">vs</span>{' '}
                                      {fixture.away_team}
                                    </div>
                                  </div>
                                </td>
                                <td className="hidden mobile:table-cell px-4 tablet:px-3 desktop:px-4 py-3 mobile:py-4 whitespace-nowrap text-fluid-sm font-medium">
                                  {fixture.home_score && fixture.away_score ? (
                                    <span className="text-primary-red text-base mobile:text-lg font-bold">
                                      {fixture.home_score}-{fixture.away_score}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">TBD</span>
                                  )}
                                </td>
                                <td className="px-2 mobile:px-4 tablet:px-3 desktop:px-4 py-3 mobile:py-4 whitespace-nowrap">
                                  {fixture.home_score && fixture.away_score ? (
                                    <span className="inline-flex items-center px-2 mobile:px-3 py-1 mobile:py-1.5 rounded-full text-xs mobile:text-sm font-medium bg-green-100 text-green-800">
                                      <span className="mobile:mr-1">✅</span>
                                      <span className="hidden mobile:inline">Finished</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 mobile:px-3 py-1 mobile:py-1.5 rounded-full text-xs mobile:text-sm font-medium bg-primary-red text-white">
                                      <span className="mobile:mr-1">🎯</span>
                                      <span className="hidden mobile:inline">Available</span>
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {filteredFixtures.length > 100 && (
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-center">
                          <p className="text-sm text-gray-500">
                            Showing first 100 of {filteredFixtures.length.toLocaleString()}{' '}
                            fixtures.
                            <span className="text-primary-red font-medium">
                              Export for complete data.
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🎯</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No fixtures found</h3>
                    <p className="text-gray-500 mb-4">
                      Adjust your filters to find betting opportunities
                    </p>
                    <button
                      onClick={clearFiltersWithFeedback}
                      className="inline-flex items-center px-4 mobile:px-6 py-3 mobile:py-4 min-h-touch border border-transparent text-fluid-sm font-medium rounded-lg text-white bg-primary-red hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-1 transition-all duration-150 touch-manipulation transform active:scale-95"
                    >
                      <span className="mr-2">🗑️</span>
                      <span>Clear Filters</span>
                    </button>
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
        ) : (
          /* Analytics Section */
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                <span className="text-primary-red mr-2" role="img" aria-label={getEmojiDescription('📊')}>📊</span>
                Data Analytics & Statistics
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Comprehensive analysis of betting patterns, fixture trends, and team performance metrics
              </p>
            </div>
            
            {/* Analytics Charts */}
            <div className="space-y-8">
              <BettingStatistics 
                fixtures={fixtures} 
                className="animate-in fade-in duration-500" 
              />
              
              <FixtureTrends 
                fixtures={fixtures} 
                className="animate-in fade-in duration-700" 
              />
              
              <TeamPerformance 
                fixtures={fixtures} 
                className="animate-in fade-in duration-1000" 
              />
            </div>
          </div>
        )}
        </PageTransition>
      </div>

      {/* Status Message */}
      {message && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg max-w-sm ${
              message.includes('Error')
                ? 'bg-red-100 border border-red-400 text-red-700'
                : 'bg-green-100 border border-green-400 text-green-700'
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">{message.includes('Error') ? '❌' : '✅'}</div>
              <div className="ml-3">
                <p className="text-sm font-medium">{message}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setMessage('')}
                  className="inline-flex text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
