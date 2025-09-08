import { Fixture } from '../types';

// Color palette for betting club - using theme colors
export const CHART_COLORS = {
  primary: '#DC2626',      // Red
  secondary: '#FBBF24',    // Yellow 
  accent: '#000000',       // Black
  success: '#10B981',      // Green
  warning: '#F59E0B',      // Orange
  info: '#3B82F6',         // Blue
  light: '#F3F4F6',        // Light Gray
  dark: '#374151',         // Dark Gray
};

// Color gradients for enhanced visual appeal
export const CHART_GRADIENTS = {
  primary: ['#DC2626', '#EF4444'],
  secondary: ['#FBBF24', '#FCD34D'],
  success: ['#10B981', '#34D399'],
  info: ['#3B82F6', '#60A5FA'],
};

// League colors for consistent visualization
export const LEAGUE_COLORS: Record<string, string> = {
  'ENG-Premier League': CHART_COLORS.primary,
  'ESP-La Liga': CHART_COLORS.secondary,
  'ITA-Serie A': CHART_COLORS.success,
  'GER-Bundesliga': CHART_COLORS.dark,
  'FRA-Ligue 1': CHART_COLORS.info,
};

// Helper function to get league display name
export const getLeagueDisplayName = (league: string): string => {
  return league
    .replace('ENG-', '')
    .replace('ESP-', '')
    .replace('ITA-', '')
    .replace('GER-', '')
    .replace('FRA-', '');
};

// Helper function to get league color
export const getLeagueColor = (league: string, fallback: string = CHART_COLORS.primary): string => {
  return LEAGUE_COLORS[league] || fallback;
};

// Data processing for fixture trends
export interface FixtureTrendData {
  date: string;
  league: string;
  homeWins: number;
  awayWins: number;
  draws: number;
  totalFixtures: number;
  homeWinPercentage: number;
  awayWinPercentage: number;
  drawPercentage: number;
}

export const processFixtureTrends = (fixtures: Fixture[]): FixtureTrendData[] => {
  // Group fixtures by date and league
  const trendMap = new Map<string, Map<string, FixtureTrendData>>();

  fixtures.forEach(fixture => {
    if (!fixture.home_score || !fixture.away_score) return; // Skip unfinished games

    const dateKey = fixture.date;
    const leagueKey = fixture.league;
    
    if (!trendMap.has(dateKey)) {
      trendMap.set(dateKey, new Map());
    }
    
    const dateMap = trendMap.get(dateKey)!;
    if (!dateMap.has(leagueKey)) {
      dateMap.set(leagueKey, {
        date: dateKey,
        league: leagueKey,
        homeWins: 0,
        awayWins: 0,
        draws: 0,
        totalFixtures: 0,
        homeWinPercentage: 0,
        awayWinPercentage: 0,
        drawPercentage: 0,
      });
    }
    
    const trend = dateMap.get(leagueKey)!;
    trend.totalFixtures++;
    
    if (fixture.home_score > fixture.away_score) {
      trend.homeWins++;
    } else if (fixture.away_score > fixture.home_score) {
      trend.awayWins++;
    } else {
      trend.draws++;
    }
  });

  // Convert to array and calculate percentages
  const trends: FixtureTrendData[] = [];
  trendMap.forEach(dateMap => {
    dateMap.forEach(trend => {
      trend.homeWinPercentage = (trend.homeWins / trend.totalFixtures) * 100;
      trend.awayWinPercentage = (trend.awayWins / trend.totalFixtures) * 100;
      trend.drawPercentage = (trend.draws / trend.totalFixtures) * 100;
      trends.push(trend);
    });
  });

  return trends.sort((a, b) => a.date.localeCompare(b.date));
};

// Data processing for team performance
export interface TeamPerformanceData {
  team: string;
  totalGames: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  winPercentage: number;
  homeWins: number;
  homeDraws: number;
  homeLosses: number;
  awayWins: number;
  awayDraws: number;
  awayLosses: number;
  form: string[]; // Last 5 results: 'W', 'D', 'L'
}

export const processTeamPerformance = (fixtures: Fixture[]): TeamPerformanceData[] => {
  const teamMap = new Map<string, TeamPerformanceData>();
  
  // Initialize team data
  const initTeamData = (team: string): TeamPerformanceData => ({
    team,
    totalGames: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    winPercentage: 0,
    homeWins: 0,
    homeDraws: 0,
    homeLosses: 0,
    awayWins: 0,
    awayDraws: 0,
    awayLosses: 0,
    form: [],
  });

  // Process fixtures
  fixtures
    .filter(f => f.home_score !== null && f.away_score !== null)
    .sort((a, b) => a.date.localeCompare(b.date)) // Sort by date for form calculation
    .forEach(fixture => {
      const homeTeam = fixture.home_team;
      const awayTeam = fixture.away_team;
      const homeScore = fixture.home_score!;
      const awayScore = fixture.away_score!;

      // Initialize teams if not exists
      if (!teamMap.has(homeTeam)) {
        teamMap.set(homeTeam, initTeamData(homeTeam));
      }
      if (!teamMap.has(awayTeam)) {
        teamMap.set(awayTeam, initTeamData(awayTeam));
      }

      const homeData = teamMap.get(homeTeam)!;
      const awayData = teamMap.get(awayTeam)!;

      // Update basic stats
      homeData.totalGames++;
      awayData.totalGames++;
      homeData.goalsFor += homeScore;
      homeData.goalsAgainst += awayScore;
      awayData.goalsFor += awayScore;
      awayData.goalsAgainst += homeScore;

      // Determine result and update stats
      if (homeScore > awayScore) {
        // Home win
        homeData.wins++;
        homeData.homeWins++;
        awayData.losses++;
        awayData.awayLosses++;
        
        // Update form (keep last 5)
        homeData.form.push('W');
        awayData.form.push('L');
      } else if (awayScore > homeScore) {
        // Away win
        awayData.wins++;
        awayData.awayWins++;
        homeData.losses++;
        homeData.homeLosses++;
        
        homeData.form.push('L');
        awayData.form.push('W');
      } else {
        // Draw
        homeData.draws++;
        homeData.homeDraws++;
        awayData.draws++;
        awayData.awayDraws++;
        
        homeData.form.push('D');
        awayData.form.push('D');
      }

      // Keep only last 5 form results
      if (homeData.form.length > 5) homeData.form.shift();
      if (awayData.form.length > 5) awayData.form.shift();
    });

  // Calculate derived stats
  const teams = Array.from(teamMap.values());
  teams.forEach(team => {
    team.goalDifference = team.goalsFor - team.goalsAgainst;
    team.winPercentage = team.totalGames > 0 ? (team.wins / team.totalGames) * 100 : 0;
  });

  return teams.sort((a, b) => b.winPercentage - a.winPercentage);
};

// Betting statistics (mock data for now - could be enhanced with actual betting data)
export interface BettingStatData {
  period: string;
  totalBets: number;
  successfulBets: number;
  accuracy: number;
  profit: number;
  homeWinBets: number;
  awayWinBets: number;
  drawBets: number;
}

export const processBettingStats = (fixtures: Fixture[]): BettingStatData[] => {
  // This is mock data for demonstration - in real implementation, 
  // this would process actual betting records
  const monthlyStats: BettingStatData[] = [];
  const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
  
  months.forEach((month, index) => {
    const totalBets = 20 + Math.floor(Math.random() * 30);
    const successfulBets = Math.floor(totalBets * (0.45 + Math.random() * 0.25));
    
    monthlyStats.push({
      period: month,
      totalBets,
      successfulBets,
      accuracy: (successfulBets / totalBets) * 100,
      profit: (successfulBets * 1.8 - totalBets) * 10, // Mock profit calculation
      homeWinBets: Math.floor(totalBets * 0.4),
      awayWinBets: Math.floor(totalBets * 0.35),
      drawBets: Math.floor(totalBets * 0.25),
    });
  });
  
  return monthlyStats;
};

// Utility to format numbers for display
export const formatNumber = (num: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

// Utility to format percentage
export const formatPercentage = (num: number, decimals: number = 1): string => {
  return `${formatNumber(num, decimals)}%`;
};

// Utility to get responsive chart dimensions
export const getResponsiveChartSize = () => {
  const width = window.innerWidth;
  
  if (width < 640) { // mobile
    return { width: width - 32, height: 250 };
  } else if (width < 1024) { // tablet
    return { width: 600, height: 300 };
  } else { // desktop
    return { width: 800, height: 400 };
  }
};

// Chart animation configurations
export const CHART_ANIMATIONS = {
  fast: { duration: 300, easing: 'ease-out' },
  normal: { duration: 500, easing: 'ease-in-out' },
  slow: { duration: 800, easing: 'ease-in-out' },
};

// Custom tooltip styles
export const TOOLTIP_STYLES = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  padding: '12px',
  fontSize: '14px',
};
