import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
import os
import glob
from collections import defaultdict
import json

class ChartDataProcessor:
    """
    Data processing utilities for generating chart-ready data from soccer fixtures.
    Handles statistical calculations, trend analysis, and data transformation for visualization.
    """
    
    def __init__(self, data_dir: str = 'data'):
        self.data_dir = data_dir
        self._fixtures_df = None
        self._last_load_time = None
    
    def _load_latest_fixtures(self) -> pd.DataFrame:
        """Load the most recent simplified fixtures CSV file."""
        pattern = os.path.join(self.data_dir, 'fixtures_*_simplified.csv')
        csv_files = glob.glob(pattern)
        
        if not csv_files:
            # Fall back to comprehensive fixtures if simplified not available
            pattern = os.path.join(self.data_dir, 'comprehensive_fixtures_*.csv')
            csv_files = glob.glob(pattern)
        
        if not csv_files:
            raise FileNotFoundError("No fixture data files found")
        
        # Get the most recent file
        latest_file = max(csv_files, key=os.path.getctime)
        
        try:
            df = pd.read_csv(latest_file)
            
            # Ensure we have the required columns
            required_cols = ['league', 'date', 'home_team', 'away_team']
            missing_cols = [col for col in required_cols if col not in df.columns]
            
            if missing_cols:
                print(f"Warning: Missing columns {missing_cols} in {latest_file}")
            
            # Parse dates
            if 'date' in df.columns:
                df['date'] = pd.to_datetime(df['date'], errors='coerce')
            
            # Parse scores for completed matches
            if 'score' in df.columns:
                df = self._parse_scores(df)
            
            return df
            
        except Exception as e:
            print(f"Error loading fixtures from {latest_file}: {e}")
            return pd.DataFrame()
    
    def _parse_scores(self, df: pd.DataFrame) -> pd.DataFrame:
        """Parse score column to extract home and away goals."""
        df = df.copy()
        
        # Initialize goal columns
        df['home_goals'] = None
        df['away_goals'] = None
        df['match_result'] = None  # H (home win), A (away win), D (draw)
        df['total_goals'] = None
        
        # Parse scores like "2-1" or "4–2"
        score_mask = df['score'].notna() & (df['score'] != '')
        
        if score_mask.any():
            # Handle both regular hyphen and em dash
            scores = df.loc[score_mask, 'score'].str.replace('–', '-')
            score_split = scores.str.split('-')
            
            valid_scores = score_split.str.len() == 2
            
            if valid_scores.any():
                valid_indices = df.index[score_mask][valid_scores]
                
                home_goals = pd.to_numeric(score_split[valid_scores].str[0], errors='coerce')
                away_goals = pd.to_numeric(score_split[valid_scores].str[1], errors='coerce')
                
                # Filter out invalid conversions
                valid_goals = home_goals.notna() & away_goals.notna()
                final_indices = valid_indices[valid_goals]
                
                if len(final_indices) > 0:
                    df.loc[final_indices, 'home_goals'] = home_goals[valid_goals].astype(int)
                    df.loc[final_indices, 'away_goals'] = away_goals[valid_goals].astype(int)
                    df.loc[final_indices, 'total_goals'] = home_goals[valid_goals].astype(int) + away_goals[valid_goals].astype(int)
                    
                    # Determine match result
                    df.loc[final_indices, 'match_result'] = np.where(
                        home_goals[valid_goals] > away_goals[valid_goals], 'H',
                        np.where(away_goals[valid_goals] > home_goals[valid_goals], 'A', 'D')
                    )
        
        return df
    
    @property
    def fixtures(self) -> pd.DataFrame:
        """Get fixtures data, loading if necessary."""
        # Reload data if it's been more than 5 minutes or if not loaded
        now = datetime.now()
        if (self._fixtures_df is None or 
            self._last_load_time is None or 
            (now - self._last_load_time).total_seconds() > 300):
            
            self._fixtures_df = self._load_latest_fixtures()
            self._last_load_time = now
        
        return self._fixtures_df
    
    def get_league_statistics(self, days_back: int = 30) -> List[Dict[str, Any]]:
        """Get match statistics by league for chart display."""
        df = self.fixtures
        if df.empty:
            return []
        
        # Filter recent matches with results
        cutoff_date = datetime.now() - timedelta(days=days_back)
        
        # Check if we have parsed scores
        has_parsed_scores = 'home_goals' in df.columns
        
        if has_parsed_scores:
            recent_matches = df[
                (df['date'] >= cutoff_date) & 
                df['home_goals'].notna()
            ]
        else:
            # Use all recent matches if no scores parsed
            recent_matches = df[df['date'] >= cutoff_date]
        
        if recent_matches.empty:
            return []
        
        stats = []
        for league in recent_matches['league'].unique():
            league_data = recent_matches[recent_matches['league'] == league]
            
            total_matches = len(league_data)
            
            if has_parsed_scores and 'total_goals' in league_data.columns:
                total_goals = league_data['total_goals'].sum()
                avg_goals = total_goals / total_matches if total_matches > 0 else 0
                
                home_wins = len(league_data[league_data['match_result'] == 'H'])
                away_wins = len(league_data[league_data['match_result'] == 'A'])
                draws = len(league_data[league_data['match_result'] == 'D'])
            else:
                total_goals = 0
                avg_goals = 0
                home_wins = 0
                away_wins = 0
                draws = 0
            
            stats.append({
                'league': league,
                'total_matches': total_matches,
                'total_goals': int(total_goals) if total_goals else 0,
                'avg_goals_per_match': round(avg_goals, 2),
                'home_wins': home_wins,
                'away_wins': away_wins,
                'draws': draws,
                'home_win_percentage': round((home_wins / total_matches) * 100, 1) if total_matches > 0 else 0
            })
        
        return sorted(stats, key=lambda x: x['total_matches'], reverse=True)
    
    def get_daily_match_trends(self, days_back: int = 14) -> List[Dict[str, Any]]:
        """Get daily match count trends for line chart."""
        df = self.fixtures
        if df.empty:
            return []
        
        cutoff_date = datetime.now() - timedelta(days=days_back)
        recent_matches = df[df['date'] >= cutoff_date]
        
        if recent_matches.empty:
            return []
        
        # Group by date and count matches
        if 'total_goals' in recent_matches.columns:
            daily_counts = recent_matches.groupby(recent_matches['date'].dt.date).agg({
                'home_team': 'count',
                'total_goals': ['sum', 'mean']
            }).reset_index()
            
            daily_counts.columns = ['date', 'match_count', 'total_goals', 'avg_goals']
        else:
            daily_counts = recent_matches.groupby(recent_matches['date'].dt.date).agg({
                'home_team': 'count'
            }).reset_index()
            
            daily_counts.columns = ['date', 'match_count']
            daily_counts['total_goals'] = 0
            daily_counts['avg_goals'] = 0.0
        daily_counts['date'] = daily_counts['date'].astype(str)
        daily_counts['avg_goals'] = daily_counts['avg_goals'].fillna(0).round(2)
        daily_counts['total_goals'] = daily_counts['total_goals'].fillna(0).astype(int)
        
        return daily_counts.to_dict('records')
    
    def get_team_performance_data(self, team_name: str, matches_limit: int = 10) -> Dict[str, Any]:
        """Get team performance data for detailed analysis."""
        df = self.fixtures
        if df.empty:
            return {}
        
        # Get matches involving this team (home or away)
        if 'home_goals' in df.columns:
            team_matches = df[
                ((df['home_team'] == team_name) | (df['away_team'] == team_name)) &
                df['home_goals'].notna()
            ].sort_values('date', ascending=False).head(matches_limit)
        else:
            team_matches = df[
                (df['home_team'] == team_name) | (df['away_team'] == team_name)
            ].sort_values('date', ascending=False).head(matches_limit)
        
        if team_matches.empty:
            return {'team': team_name, 'matches': [], 'summary': {}}
        
        # Check if we have score data
        has_scores = 'home_goals' in team_matches.columns and team_matches['home_goals'].notna().any()
        
        matches = []
        wins = 0
        draws = 0
        losses = 0
        goals_for = 0
        goals_against = 0
        
        for _, match in team_matches.iterrows():
            is_home = match['home_team'] == team_name
            opponent = match['away_team'] if is_home else match['home_team']
            
            if has_scores and pd.notna(match.get('home_goals')) and pd.notna(match.get('away_goals')):
                team_goals = match['home_goals'] if is_home else match['away_goals']
                opponent_goals = match['away_goals'] if is_home else match['home_goals']
                
                if team_goals > opponent_goals:
                    result = 'W'
                    wins += 1
                elif team_goals < opponent_goals:
                    result = 'L'
                    losses += 1
                else:
                    result = 'D'
                    draws += 1
                
                goals_for += team_goals
                goals_against += opponent_goals
                
                score_str = f"{int(team_goals)}-{int(opponent_goals)}"
                goals_for_match = int(team_goals)
                goals_against_match = int(opponent_goals)
            else:
                result = 'N/A'
                score_str = 'N/A'
                goals_for_match = 0
                goals_against_match = 0
            
            matches.append({
                'date': match['date'].strftime('%Y-%m-%d') if pd.notna(match['date']) else '',
                'opponent': opponent,
                'venue': 'Home' if is_home else 'Away',
                'score': score_str,
                'result': result,
                'goals_for': goals_for_match,
                'goals_against': goals_against_match
            })
        
        total_matches = len(matches)
        win_rate = (wins / total_matches * 100) if total_matches > 0 else 0
        avg_goals_for = goals_for / total_matches if total_matches > 0 else 0
        avg_goals_against = goals_against / total_matches if total_matches > 0 else 0
        
        return {
            'team': team_name,
            'matches': matches,
            'summary': {
                'total_matches': total_matches,
                'wins': wins,
                'draws': draws,
                'losses': losses,
                'win_rate': round(win_rate, 1),
                'goals_for': goals_for,
                'goals_against': goals_against,
                'goal_difference': goals_for - goals_against,
                'avg_goals_for': round(avg_goals_for, 2),
                'avg_goals_against': round(avg_goals_against, 2)
            }
        }
    
    def get_fixture_trends_by_league(self, league: str, days_back: int = 30) -> List[Dict[str, Any]]:
        """Get fixture trends for a specific league."""
        df = self.fixtures
        if df.empty:
            return []
        
        cutoff_date = datetime.now() - timedelta(days=days_back)
        
        if 'home_goals' in df.columns:
            league_matches = df[
                (df['league'] == league) & 
                (df['date'] >= cutoff_date) &
                df['home_goals'].notna()
            ].sort_values('date')
        else:
            league_matches = df[
                (df['league'] == league) & 
                (df['date'] >= cutoff_date)
            ].sort_values('date')
        
        if league_matches.empty:
            return []
        
        trends = []
        for _, match in league_matches.iterrows():
            total_goals = int(match['total_goals']) if 'total_goals' in match and pd.notna(match['total_goals']) else 0
            result = match.get('match_result', 'N/A') if 'match_result' in match else 'N/A'
            
            trends.append({
                'date': match['date'].strftime('%Y-%m-%d') if pd.notna(match['date']) else '',
                'home_team': match['home_team'],
                'away_team': match['away_team'],
                'total_goals': total_goals,
                'result': result,
                'match_name': f"{match['home_team']} vs {match['away_team']}"
            })
        
        return trends
    
    def get_weekly_summary(self) -> Dict[str, Any]:
        """Get weekly summary statistics for dashboard overview."""
        df = self.fixtures
        if df.empty:
            return {}
        
        now = datetime.now()
        week_start = now - timedelta(days=7)
        
        # This week's matches
        week_matches = df[
            (df['date'] >= week_start) & 
            (df['date'] <= now)
        ]
        
        if 'home_goals' in df.columns:
            completed_matches = week_matches[week_matches['home_goals'].notna()]
            upcoming_matches = week_matches[week_matches['home_goals'].isna()]
        else:
            completed_matches = pd.DataFrame()  # No completed matches without scores
            upcoming_matches = week_matches
        
        summary = {
            'period': f"{week_start.strftime('%Y-%m-%d')} to {now.strftime('%Y-%m-%d')}",
            'total_matches': len(week_matches),
            'completed_matches': len(completed_matches),
            'upcoming_matches': len(upcoming_matches),
            'total_goals': int(completed_matches['total_goals'].sum()) if not completed_matches.empty and 'total_goals' in completed_matches.columns else 0,
            'leagues_active': week_matches['league'].nunique() if not week_matches.empty else 0
        }
        
        if not completed_matches.empty and 'total_goals' in completed_matches.columns:
            summary['avg_goals_per_match'] = round(
                completed_matches['total_goals'].mean(), 2
            )
            max_goals_idx = completed_matches['total_goals'].idxmax()
            summary['highest_scoring_match'] = {
                'teams': f"{completed_matches.loc[max_goals_idx, 'home_team']} vs {completed_matches.loc[max_goals_idx, 'away_team']}",
                'goals': int(completed_matches.loc[max_goals_idx, 'total_goals'])
            }
        
        return summary


# Utility functions for API endpoints
def safe_json_response(data: Any) -> str:
    """Safely convert data to JSON, handling numpy types."""
    def convert_types(obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif pd.isna(obj):
            return None
        return obj
    
    return json.dumps(data, default=convert_types, indent=2)


if __name__ == "__main__":
    # Test the data processor
    processor = ChartDataProcessor()
    
    try:
        print("Testing ChartDataProcessor...")
        
        # Test league statistics
        league_stats = processor.get_league_statistics(days_back=30)
        print(f"Found {len(league_stats)} leagues with recent activity")
        
        if league_stats:
            print("Top league by matches:", league_stats[0]['league'])
        
        # Test daily trends
        daily_trends = processor.get_daily_match_trends(days_back=7)
        print(f"Daily trends for last 7 days: {len(daily_trends)} data points")
        
        # Test weekly summary
        summary = processor.get_weekly_summary()
        print(f"Weekly summary: {summary.get('total_matches', 0)} matches this week")
        
    except Exception as e:
        print(f"Error testing ChartDataProcessor: {e}")
        import traceback
        traceback.print_exc()
