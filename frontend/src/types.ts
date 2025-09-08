// Core data types for the Super Cool Betting Club
export interface Fixture {
  league: string;
  season: string;
  date: string;
  home_team: string;
  away_team: string;
  home_score?: number | null;
  away_score?: number | null;
  match_report?: string | null;
}

// API response types
export interface FixturesResponse {
  fixtures: Fixture[];
  total_count: number;
  file: string;
}

export interface ExportResponse {
  message: string;
  filename: string;
  path: string;
}

export interface ErrorResponse {
  error: string;
}

// Component prop types
export interface FixtureCardProps {
  fixture: Fixture;
  index?: number;
}

// Filter states
export interface FilterCounts {
  [key: string]: number;
}

// View modes
export type ViewMode = 'card' | 'table' | 'auto' | 'analytics';

// Touch gesture types
export interface TouchState {
  touchStart: number | null;
  touchEnd: number | null;
  isScrolling: boolean;
}

// Performance metrics
export interface PerformanceMetrics {
  renderStart: number;
  lastRender: number;
  renderCount: number;
}

// Device types for responsive design
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
