import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import {
  CHART_COLORS,
  processFixtureTrends,
  getLeagueDisplayName,
  getLeagueColor,
} from '../../utils/chartHelpers';
import { Fixture } from '../../types';

interface FixtureTrendsProps {
  fixtures: Fixture[];
  className?: string;
}

type TrendView = 'outcomes' | 'homeAdvantage' | 'leagueComparison' | 'timeline';

// Utility functions
const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

const formatNumber = (value: number): string => {
  return value.toLocaleString();
};

const TOOLTIP_STYLES = {
  backgroundColor: '#fff',
  border: '1px solid #ccc',
  borderRadius: '4px',
  padding: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
};

const FixtureTrends: React.FC<FixtureTrendsProps> = ({ 
  fixtures, 
  className = '' 
}) => {
  const [activeView, setActiveView] = useState<TrendView>('outcomes');
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [animationEnabled, setAnimationEnabled] = useState(true);

  // Process fixture trends data
  const trendsData = useMemo(() => {
    return processFixtureTrends(fixtures);
  }, [fixtures]);

  // Get unique leagues for filtering
  const availableLeagues = useMemo(() => {
    return Array.from(new Set(trendsData.map(t => t.league))).sort();
  }, [trendsData]);

  // Filter trends by selected leagues
  const filteredTrends = useMemo(() => {
    if (selectedLeagues.length === 0) return trendsData;
    return trendsData.filter(trend => selectedLeagues.includes(trend.league));
  }, [trendsData, selectedLeagues]);

  // Aggregate data for different views
  const aggregatedData = useMemo(() => {
    // Group by date for timeline view
    const byDate = new Map<string, any>();
    filteredTrends.forEach(trend => {
      if (!byDate.has(trend.date)) {
        byDate.set(trend.date, {
          date: trend.date,
          totalFixtures: 0,
          homeWins: 0,
          awayWins: 0,
          draws: 0,
        });
      }
      const dateData = byDate.get(trend.date)!;
      dateData.totalFixtures += trend.totalFixtures;
      dateData.homeWins += trend.homeWins;
      dateData.awayWins += trend.awayWins;
      dateData.draws += trend.draws;
    });

    return Array.from(byDate.values()).map(data => ({
      ...data,
      homeWinPercentage: (data.homeWins / data.totalFixtures) * 100,
      awayWinPercentage: (data.awayWins / data.totalFixtures) * 100,
      drawPercentage: (data.draws / data.totalFixtures) * 100,
      formattedDate: new Date(data.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
    })).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredTrends]);

  // League comparison data
  const leagueComparisonData = useMemo(() => {
    const leagueStats = new Map<string, any>();
    
    filteredTrends.forEach(trend => {
      if (!leagueStats.has(trend.league)) {
        leagueStats.set(trend.league, {
          league: getLeagueDisplayName(trend.league),
          totalFixtures: 0,
          homeWins: 0,
          awayWins: 0,
          draws: 0,
          color: getLeagueColor(trend.league),
        });
      }
      const leagueData = leagueStats.get(trend.league)!;
      leagueData.totalFixtures += trend.totalFixtures;
      leagueData.homeWins += trend.homeWins;
      leagueData.awayWins += trend.awayWins;
      leagueData.draws += trend.draws;
    });

    return Array.from(leagueStats.values()).map(data => ({
      ...data,
      homeWinPercentage: (data.homeWins / data.totalFixtures) * 100,
      awayWinPercentage: (data.awayWins / data.totalFixtures) * 100,
      drawPercentage: (data.draws / data.totalFixtures) * 100,
      homeAdvantage: ((data.homeWins - data.awayWins) / data.totalFixtures) * 100,
    }));
  }, [filteredTrends]);

  // Summary statistics
  const summaryStats = useMemo(() => {
    const totalFixtures = filteredTrends.reduce((sum, trend) => sum + trend.totalFixtures, 0);
    const totalHomeWins = filteredTrends.reduce((sum, trend) => sum + trend.homeWins, 0);
    const totalAwayWins = filteredTrends.reduce((sum, trend) => sum + trend.awayWins, 0);
    const totalDraws = filteredTrends.reduce((sum, trend) => sum + trend.draws, 0);

    return {
      totalFixtures,
      homeWinPercentage: totalFixtures > 0 ? (totalHomeWins / totalFixtures) * 100 : 0,
      awayWinPercentage: totalFixtures > 0 ? (totalAwayWins / totalFixtures) * 100 : 0,
      drawPercentage: totalFixtures > 0 ? (totalDraws / totalFixtures) * 100 : 0,
      homeAdvantage: totalFixtures > 0 ? ((totalHomeWins - totalAwayWins) / totalFixtures) * 100 : 0,
    };
  }, [filteredTrends]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={TOOLTIP_STYLES}>
          <p className="font-semibold text-gray-900">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.dataKey.includes('Percentage') || entry.dataKey.includes('Advantage')
                ? formatPercentage(entry.value) 
                : formatNumber(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Toggle league selection
  const toggleLeague = (league: string) => {
    setSelectedLeagues(prev => 
      prev.includes(league) 
        ? prev.filter(l => l !== league)
        : [...prev, league]
    );
  };

  const renderChart = () => {
    switch (activeView) {
      case 'outcomes':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={aggregatedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="homeWinPercentage"
                name="Home Wins %"
                stackId="1"
                stroke={CHART_COLORS.primary}
                fill={CHART_COLORS.primary}
                fillOpacity={0.7}
                animationDuration={animationEnabled ? 1000 : 0}
              />
              <Area
                type="monotone"
                dataKey="drawPercentage"
                name="Draws %"
                stackId="1"
                stroke={CHART_COLORS.secondary}
                fill={CHART_COLORS.secondary}
                fillOpacity={0.7}
                animationDuration={animationEnabled ? 1000 : 0}
              />
              <Area
                type="monotone"
                dataKey="awayWinPercentage"
                name="Away Wins %"
                stackId="1"
                stroke={CHART_COLORS.info}
                fill={CHART_COLORS.info}
                fillOpacity={0.7}
                animationDuration={animationEnabled ? 1000 : 0}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'homeAdvantage':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={aggregatedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="homeWins"
                name="Home Wins"
                fill={CHART_COLORS.primary}
                fillOpacity={0.8}
                animationDuration={animationEnabled ? 800 : 0}
              />
              <Bar
                dataKey="awayWins"
                name="Away Wins"
                fill={CHART_COLORS.info}
                fillOpacity={0.8}
                animationDuration={animationEnabled ? 800 : 0}
              />
              <Line
                type="monotone"
                dataKey="draws"
                name="Draws"
                stroke={CHART_COLORS.secondary}
                strokeWidth={3}
                dot={{ r: 4 }}
                animationDuration={animationEnabled ? 1000 : 0}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'leagueComparison':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={leagueComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="league" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="homeWinPercentage"
                name="Home Wins %"
                fill={CHART_COLORS.primary}
                animationDuration={animationEnabled ? 800 : 0}
              />
              <Bar
                dataKey="awayWinPercentage"
                name="Away Wins %"
                fill={CHART_COLORS.info}
                animationDuration={animationEnabled ? 800 : 0}
              />
              <Bar
                dataKey="drawPercentage"
                name="Draws %"
                fill={CHART_COLORS.secondary}
                animationDuration={animationEnabled ? 800 : 0}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'timeline':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={aggregatedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalFixtures"
                name="Total Fixtures"
                stroke={CHART_COLORS.dark}
                strokeWidth={2}
                dot={{ r: 4 }}
                animationDuration={animationEnabled ? 1000 : 0}
              />
              <Line
                type="monotone"
                dataKey="homeWins"
                name="Home Wins"
                stroke={CHART_COLORS.primary}
                strokeWidth={2}
                dot={{ r: 4 }}
                animationDuration={animationEnabled ? 1000 : 0}
              />
              <Line
                type="monotone"
                dataKey="awayWins"
                name="Away Wins"
                stroke={CHART_COLORS.info}
                strokeWidth={2}
                dot={{ r: 4 }}
                animationDuration={animationEnabled ? 1000 : 0}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="text-primary-yellow mr-2" role="img" aria-label="fixture trends">📈</span>
              Fixture Trends & Patterns
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Match outcome trends and home advantage analysis
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAnimationEnabled(!animationEnabled)}
              className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-primary-red focus:ring-offset-1"
              aria-label={`${animationEnabled ? 'Disable' : 'Enable'} chart animations`}
            >
              {animationEnabled ? '⏸️' : '▶️'} Animation
            </button>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatNumber(summaryStats.totalFixtures)}
            </div>
            <div className="text-xs text-gray-500">Total Fixtures</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatPercentage(summaryStats.homeWinPercentage)}
            </div>
            <div className="text-xs text-gray-500">Home Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatPercentage(summaryStats.awayWinPercentage)}
            </div>
            <div className="text-xs text-gray-500">Away Wins</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              summaryStats.homeAdvantage > 0 ? 'text-red-600' : 'text-blue-600'
            }`}>
              {formatPercentage(Math.abs(summaryStats.homeAdvantage))}
            </div>
            <div className="text-xs text-gray-500">
              {summaryStats.homeAdvantage > 0 ? 'Home' : 'Away'} Advantage
            </div>
          </div>
        </div>
      </div>

      {/* League Filter */}
      {availableLeagues.length > 1 && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 flex items-center">
              🏆 Leagues:
            </span>
            {availableLeagues.map(league => (
              <button
                key={league}
                onClick={() => toggleLeague(league)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  selectedLeagues.includes(league) || selectedLeagues.length === 0
                    ? 'text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                style={{ 
                  backgroundColor: selectedLeagues.includes(league) || selectedLeagues.length === 0
                    ? getLeagueColor(league)
                    : undefined
                }}
              >
                {getLeagueDisplayName(league)}
              </button>
            ))}
            {selectedLeagues.length > 0 && (
              <button
                onClick={() => setSelectedLeagues([])}
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-gray-600 text-white hover:bg-gray-700"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}

      {/* Chart Navigation */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <nav className="flex flex-wrap gap-1" aria-label="Chart view options">
          {[
            { key: 'outcomes', label: '📊 Outcomes', desc: 'Match outcome distribution' },
            { key: 'homeAdvantage', label: '🏠 Home vs Away', desc: 'Home field advantage analysis' },
            { key: 'leagueComparison', label: '🏆 Leagues', desc: 'Compare leagues side-by-side' },
            { key: 'timeline', label: '📈 Timeline', desc: 'Trends over time' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveView(tab.key as TrendView)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeView === tab.key
                  ? 'bg-white text-primary-red shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
              role="tab"
              aria-selected={activeView === tab.key}
              aria-label={tab.desc}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Chart Content */}
      <div className="p-6" role="region">
        {filteredTrends.length > 0 ? (
          renderChart()
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📈</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No fixture data available
            </h4>
            <p className="text-gray-500">
              {selectedLeagues.length > 0 
                ? 'No matches found for selected leagues'
                : 'Fixture data will appear here once matches are completed'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FixtureTrends;
