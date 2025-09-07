
import soccerdata as sd
import pandas as pd
import os

# Configuration - Change these as needed
LEAGUE = 'Big 5 European Leagues Combined'  # Use this to access individual leagues
TARGET_LEAGUE = 'ENG-Premier League'  # The specific league to filter for
SEASON = '2025-2026'
OUTPUT_DIR = '../data'

def main():
    # Create scraper instance with specified leagues and seasons
    fbref = sd.FBref(leagues=LEAGUE, seasons=SEASON)

    # Scrape match schedule (includes scores if available)
    try:
        print(f"Scraping match schedule for {TARGET_LEAGUE} {SEASON}...")
        matches = fbref.read_schedule()

        # Filter for the target league
        if 'league' in matches.index.names and 'league' in matches.index:
            matches = matches[matches.index.get_level_values('league') == TARGET_LEAGUE]
        elif 'league' in matches.columns:
            matches = matches[matches['league'] == TARGET_LEAGUE]
        print(f"Successfully scraped {len(matches)} matches for {TARGET_LEAGUE}.")

        # Ensure output directory exists
        os.makedirs(OUTPUT_DIR, exist_ok=True)

        # Save to CSV
        output_file = os.path.join(OUTPUT_DIR, f"{TARGET_LEAGUE.replace(' ', '_').replace('-', '_')}_{SEASON}_matches.csv")
        matches.to_csv(output_file)
        print(f"Data saved to {output_file}")

    except Exception as e:
        print(f"Error scraping data: {e}")
        print("Available leagues:")
        print(fbref.available_leagues())

if __name__ == "__main__":
    main()
