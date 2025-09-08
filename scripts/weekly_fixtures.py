import soccerdata as sd
import pandas as pd
import os
from datetime import datetime, timedelta

# Import the error handling utilities
try:
    from error_handler import (
        retry_with_backoff, smart_retry, SoccerDataLogger,
        NetworkError, DataParsingError, ScrapingError,
        recovery_manager, create_error_context, classify_error
    )
    ERROR_HANDLING_AVAILABLE = True
except ImportError:
    print("Warning: Error handling utilities not available. Basic error handling will be used.")
    ERROR_HANDLING_AVAILABLE = False

# Configuration
LEAGUES = ['Big 5 European Leagues Combined']
TARGET_LEAGUE = None  # Set to 'ENG-Premier League' to filter, or None for all leagues
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')

# Initialize enhanced error handling if available
if ERROR_HANDLING_AVAILABLE:
    # Create a dedicated logger for this script
    logger = SoccerDataLogger(
        name="weekly_fixtures",
        log_file=os.path.join(OUTPUT_DIR, "logs", "weekly_fixtures.log")
    )
    # Ensure logs directory exists
    os.makedirs(os.path.join(OUTPUT_DIR, "logs"), exist_ok=True)
else:
    logger = None

@smart_retry
def robust_create_weekly_scraper(leagues):
    """Create weekly scraper with error handling and retry logic."""
    try:
        if ERROR_HANDLING_AVAILABLE:
            logger.logger.info(f"Creating weekly FBref scraper for {len(leagues)} leagues")
        
        scraper = sd.FBref(leagues=leagues)
        
        if ERROR_HANDLING_AVAILABLE:
            logger.log_success(
                "weekly_scraper_creation",
                {"leagues_count": len(leagues), "leagues": leagues}
            )
        
        return scraper
        
    except Exception as e:
        context = create_error_context(
            "weekly_scraper_creation",
            leagues=leagues,
            error_type=classify_error(e)
        ) if ERROR_HANDLING_AVAILABLE else {}
        
        if ERROR_HANDLING_AVAILABLE:
            if isinstance(e, (ConnectionError, TimeoutError)):
                raise NetworkError(f"Network error creating weekly scraper: {e}", context)
            else:
                raise ScrapingError(f"Failed to create weekly scraper: {e}", context)
        else:
            raise


@smart_retry
def robust_read_weekly_schedule(scraper):
    """Read weekly schedule with error handling and retry logic."""
    try:
        if ERROR_HANDLING_AVAILABLE:
            logger.logger.info("Starting weekly schedule scraping...")
        
        schedule = scraper.read_schedule()
        
        if ERROR_HANDLING_AVAILABLE:
            logger.log_success(
                "weekly_schedule_scraping",
                {"schedule_count": len(schedule) if hasattr(schedule, '__len__') else "unknown"}
            )
        
        return schedule
        
    except Exception as e:
        context = create_error_context(
            "weekly_schedule_scraping",
            error_type=classify_error(e)
        ) if ERROR_HANDLING_AVAILABLE else {}
        
        if ERROR_HANDLING_AVAILABLE:
            if isinstance(e, (ConnectionError, TimeoutError)):
                raise NetworkError(f"Network error reading weekly schedule: {e}", context)
            elif isinstance(e, (KeyError, ValueError, AttributeError)):
                raise DataParsingError(f"Data parsing error reading weekly schedule: {e}", context)
            else:
                raise ScrapingError(f"Failed to read weekly schedule: {e}", context)
        else:
            raise


def get_week_dates():
    """Get Friday to Monday dates of the current week."""
    try:
        today = datetime.now()
        # Find the most recent Friday
        days_since_friday = (today.weekday() - 4) % 7  # 4 is Friday
        friday = today - timedelta(days=days_since_friday)
        monday = friday + timedelta(days=3)  # Friday + 3 days = Monday
        
        if ERROR_HANDLING_AVAILABLE:
            logger.logger.info(f"Calculated week dates: {friday.date()} to {monday.date()}")
            
        return friday.date(), monday.date()
        
    except Exception as e:
        if ERROR_HANDLING_AVAILABLE:
            context = create_error_context("date_calculation", error_type=classify_error(e))
            logger.log_error(e, context)
        
        # Fallback to simple date calculation
        today = datetime.now().date()
        friday = today - timedelta(days=today.weekday() + 3)
        monday = friday + timedelta(days=3)
        return friday, monday

def main():
    print("Starting weekly fixtures scrape...")
    
    if ERROR_HANDLING_AVAILABLE:
        print("🛡️  Enhanced error handling enabled for weekly scraping")
        logger.logger.info("Starting weekly fixtures scrape with enhanced error handling")
    else:
        print("⚠️  Basic error handling mode for weekly scraping")
    
    try:
        # Get current week's Friday to Monday with error handling
        friday, monday = get_week_dates()
        league_names = ", ".join(LEAGUES)
        print(f"Scraping fixtures from {friday} to {monday} for {league_names}...")

        # Create scraper instance with error handling
        if ERROR_HANDLING_AVAILABLE:
            fbref = recovery_manager.safe_execute(
                robust_create_weekly_scraper,
                "weekly_fbref_creation",
                LEAGUES
            )
        else:
            fbref = sd.FBref(leagues=LEAGUES)

        # Scrape schedule with error handling
        if ERROR_HANDLING_AVAILABLE:
            schedule = recovery_manager.safe_execute(
                robust_read_weekly_schedule,
                "weekly_schedule_reading",
                fbref
            )
        else:
            schedule = fbref.read_schedule()

        # Process schedule with error handling
        try:
            # Reset index if needed
            if isinstance(schedule.index, pd.MultiIndex):
                schedule = schedule.reset_index()
                if ERROR_HANDLING_AVAILABLE:
                    logger.logger.info("Reset MultiIndex on weekly schedule DataFrame")
            
            # Filter for date range
            if 'date' in schedule.columns:
                schedule['date'] = pd.to_datetime(schedule['date']).dt.date
                weekly_fixtures = schedule[(schedule['date'] >= friday) & (schedule['date'] <= monday)]
                
                if ERROR_HANDLING_AVAILABLE:
                    logger.log_success(
                        "weekly_date_filtering",
                        {
                            "friday": str(friday),
                            "monday": str(monday),
                            "total_fixtures": len(schedule),
                            "weekly_fixtures": len(weekly_fixtures)
                        }
                    )
            else:
                error_msg = "No date column found in schedule."
                if ERROR_HANDLING_AVAILABLE:
                    context = create_error_context(
                        "weekly_date_filtering",
                        available_columns=list(schedule.columns),
                        error_type="parsing"
                    )
                    logger.log_error(DataParsingError(error_msg, context), context)
                print(f"❌ {error_msg}")
                return False
                
        except Exception as e:
            if ERROR_HANDLING_AVAILABLE:
                context = create_error_context(
                    "weekly_schedule_processing",
                    friday=str(friday),
                    monday=str(monday),
                    error_type=classify_error(e)
                )
                logger.log_error(e, context)
                print(f"❌ Error processing weekly schedule: {e}")
            else:
                print(f"Error processing schedule: {e}")
            raise

        print(f"✅ Found {len(weekly_fixtures)} fixtures for the week.")

        # Ensure output directory exists
        os.makedirs(OUTPUT_DIR, exist_ok=True)

        # Save to CSV with error handling
        try:
            league_suffix = "_".join([l.replace(' ', '_').replace('-', '_') for l in LEAGUES])
            output_file = os.path.join(OUTPUT_DIR, f"{league_suffix}_weekly_fixtures_{friday}_to_{monday}.csv")
            weekly_fixtures.to_csv(output_file, index=False)
            
            print(f"💾 Weekly fixtures saved to {output_file}")
            
            if ERROR_HANDLING_AVAILABLE:
                logger.log_success(
                    "weekly_save_csv",
                    {
                        "output_file": output_file,
                        "fixtures_count": len(weekly_fixtures),
                        "file_size": os.path.getsize(output_file) if os.path.exists(output_file) else 0
                    }
                )
            
        except Exception as e:
            if ERROR_HANDLING_AVAILABLE:
                context = create_error_context(
                    "weekly_save_csv",
                    output_file=output_file,
                    fixtures_count=len(weekly_fixtures),
                    error_type=classify_error(e)
                )
                logger.log_error(e, context)
            print(f"❌ Error saving weekly fixtures: {e}")
            raise
            
        return True  # Indicate success

    except Exception as e:
        error_type = classify_error(e) if ERROR_HANDLING_AVAILABLE else "unknown"
        
        if ERROR_HANDLING_AVAILABLE:
            # Enhanced error handling with classification
            context = create_error_context(
                "weekly_scrape",
                leagues=LEAGUES,
                date_range=f"{friday} to {monday}",
                error_type=error_type
            )
            
            logger.log_error(e, context)
            
            # Provide specific error messages
            if error_type == "network":
                print(f"🌐 ❌ Network Error: {e}")
                print("   - Check your internet connection")
                print("   - Retries were automatically attempted")
            elif error_type == "parsing":
                print(f"📝 ❌ Data Parsing Error: {e}")
                print("   - The weekly data format might have changed")
            else:
                print(f"ℹ️ ❌ Weekly Scraping Error ({error_type}): {e}")
                
            # Show log file location
            log_file = os.path.join(OUTPUT_DIR, "logs", "weekly_fixtures.log")
            if os.path.exists(log_file):
                print(f"📄 Detailed error logs: {log_file}")
        else:
            print(f"❌ Error: {e}")
            
        return False  # Indicate failure

if __name__ == "__main__":
    main()