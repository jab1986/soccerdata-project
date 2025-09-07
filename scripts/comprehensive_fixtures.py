import soccerdata as sd
import pandas as pd
import os
from datetime import datetime

# Comprehensive European leagues configuration
EUROPEAN_LEAGUES = [
    # England
    'ENG-Premier League',

    # Spain
    'ESP-La Liga',

    # Italy
    'ITA-Serie A',

    # Germany
    'GER-Bundesliga',

    # France
    'FRA-Ligue 1',

    # International (for additional data)
    'Big 5 European Leagues Combined'
]

SEASON = '2025-2026'
OUTPUT_DIR = '../data'

def main():
    print(f"Starting comprehensive fixtures scrape for {len(EUROPEAN_LEAGUES)} leagues...")
    print(f"Season: {SEASON}")
    print("Leagues:", ", ".join(EUROPEAN_LEAGUES))

    # Create scraper instance
    fbref = sd.FBref(leagues=EUROPEAN_LEAGUES, seasons=SEASON)

    try:
        print("\nScraping fixtures... This may take several minutes...")

        # Get all fixtures
        fixtures = fbref.read_schedule()

        # Reset index if needed
        if isinstance(fixtures.index, pd.MultiIndex):
            fixtures = fixtures.reset_index()

        print(f"\nSuccessfully scraped {len(fixtures)} fixtures across {len(EUROPEAN_LEAGUES)} leagues")

        # Ensure output directory exists
        os.makedirs(OUTPUT_DIR, exist_ok=True)

        # Save comprehensive fixtures
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = os.path.join(OUTPUT_DIR, f"comprehensive_fixtures_{SEASON}_{timestamp}.csv")

        fixtures.to_csv(output_file, index=False)
        print(f"\nComprehensive fixtures saved to: {output_file}")

        # Also save a simplified version for easier filtering
        simplified_file = os.path.join(OUTPUT_DIR, f"fixtures_{SEASON}_simplified.csv")

        # Keep only essential columns
        essential_cols = ['league', 'season', 'date', 'home_team', 'away_team', 'home_score', 'away_score', 'match_report']
        available_cols = [col for col in essential_cols if col in fixtures.columns]

        simplified_fixtures = fixtures[available_cols].copy()

        # Add computed columns
        if 'date' in simplified_fixtures.columns:
            simplified_fixtures['date'] = pd.to_datetime(simplified_fixtures['date']).dt.date
            simplified_fixtures['day_of_week'] = pd.to_datetime(simplified_fixtures['date']).dt.day_name()

        simplified_fixtures.to_csv(simplified_file, index=False)
        print(f"Simplified fixtures saved to: {simplified_file}")

        # Print summary statistics
        print("\n📊 Summary Statistics:")
        print(f"Total fixtures: {len(fixtures)}")

        if 'league' in fixtures.columns:
            league_counts = fixtures['league'].value_counts()
            print("\nFixtures by league:")
            for league, count in league_counts.items():
                print(f"  {league}: {count}")

        if 'date' in fixtures.columns:
            fixtures['date'] = pd.to_datetime(fixtures['date'])
            date_range = fixtures['date'].min(), fixtures['date'].max()
            print(f"\nDate range: {date_range[0].date()} to {date_range[1].date()}")

    except Exception as e:
        print(f"Error during comprehensive scrape: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()