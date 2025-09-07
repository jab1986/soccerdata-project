import soccerdata as sd
import pandas as pd
import os
from datetime import datetime, timedelta

# Configuration
LEAGUE = 'Big 5 European Leagues Combined'
TARGET_LEAGUE = None  # Set to 'ENG-Premier League' to filter, or None for all leagues
OUTPUT_DIR = '../data'

def get_week_dates():
    """Get Friday to Monday dates of the current week."""
    today = datetime.now()
    # Find the most recent Friday
    days_since_friday = (today.weekday() - 4) % 7  # 4 is Friday
    friday = today - timedelta(days=days_since_friday)
    monday = friday + timedelta(days=3)  # Friday + 3 days = Monday
    return friday.date(), monday.date()

def main():
    # Get current week's Friday to Monday
    friday, monday = get_week_dates()
    league_names = ", ".join(LEAGUES)
    print(f"Scraping fixtures from {friday} to {monday} for {league_names}...")

    # Create scraper instance
    fbref = sd.FBref(leagues=LEAGUES)

    try:
        # Scrape schedule
        schedule = fbref.read_schedule()

        # Reset index if needed
        if isinstance(schedule.index, pd.MultiIndex):
            schedule = schedule.reset_index()

        # No additional filtering needed since we specified exact leagues

        # Filter for date range
        if 'date' in schedule.columns:
            schedule['date'] = pd.to_datetime(schedule['date']).dt.date
            weekly_fixtures = schedule[(schedule['date'] >= friday) & (schedule['date'] <= monday)]
        else:
            print("No date column found in schedule.")
            return

        print(f"Found {len(weekly_fixtures)} fixtures for the week.")

        # Ensure output directory exists
        os.makedirs(OUTPUT_DIR, exist_ok=True)

        # Save to CSV
        league_suffix = "_".join([l.replace(' ', '_').replace('-', '_') for l in LEAGUES])
        output_file = os.path.join(OUTPUT_DIR, f"{league_suffix}_weekly_fixtures_{friday}_to_{monday}.csv")
        weekly_fixtures.to_csv(output_file, index=False)
        print(f"Weekly fixtures saved to {output_file}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()