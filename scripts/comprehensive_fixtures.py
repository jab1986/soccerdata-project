import soccerdata as sd
import pandas as pd
import os
from datetime import datetime

# Import the data validation module
try:
    from data_validator import DataValidator, ValidationError
except ImportError:
    print("Warning: Data validator not available. Validation will be skipped.")
    DataValidator = None
    ValidationError = Exception

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
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')

# Initialize enhanced error handling if available
if ERROR_HANDLING_AVAILABLE:
    # Create a dedicated logger for this script
    logger = SoccerDataLogger(
        name="comprehensive_fixtures",
        log_file=os.path.join(OUTPUT_DIR, "logs", "comprehensive_fixtures.log")
    )
    
    # Ensure logs directory exists
    os.makedirs(os.path.join(OUTPUT_DIR, "logs"), exist_ok=True)
else:
    logger = None


@smart_retry
def robust_create_scraper(leagues, season):
    """Create scraper with error handling and retry logic."""
    try:
        if ERROR_HANDLING_AVAILABLE:
            logger.logger.info(f"Creating FBref scraper for {len(leagues)} leagues, season {season}")
        
        scraper = sd.FBref(leagues=leagues, seasons=season)
        
        if ERROR_HANDLING_AVAILABLE:
            logger.log_success(
                "scraper_creation",
                {"leagues_count": len(leagues), "season": season}
            )
        
        return scraper
        
    except Exception as e:
        context = create_error_context(
            "scraper_creation",
            leagues=leagues,
            season=season,
            error_type=classify_error(e)
        ) if ERROR_HANDLING_AVAILABLE else {}
        
        if ERROR_HANDLING_AVAILABLE:
            if isinstance(e, (ConnectionError, TimeoutError)):
                raise NetworkError(f"Network error creating scraper: {e}", context)
            else:
                raise ScrapingError(f"Failed to create scraper: {e}", context)
        else:
            raise


@smart_retry
def robust_read_schedule(scraper):
    """Read schedule with error handling and retry logic."""
    try:
        if ERROR_HANDLING_AVAILABLE:
            logger.logger.info("Starting schedule scraping...")
        
        fixtures = scraper.read_schedule()
        
        if ERROR_HANDLING_AVAILABLE:
            logger.log_success(
                "schedule_scraping",
                {"fixtures_count": len(fixtures) if hasattr(fixtures, '__len__') else "unknown"}
            )
        
        return fixtures
        
    except Exception as e:
        context = create_error_context(
            "schedule_scraping",
            error_type=classify_error(e)
        ) if ERROR_HANDLING_AVAILABLE else {}
        
        if ERROR_HANDLING_AVAILABLE:
            if isinstance(e, (ConnectionError, TimeoutError)):
                raise NetworkError(f"Network error reading schedule: {e}", context)
            elif isinstance(e, (KeyError, ValueError, AttributeError)):
                raise DataParsingError(f"Data parsing error reading schedule: {e}", context)
            else:
                raise ScrapingError(f"Failed to read schedule: {e}", context)
        else:
            raise


def safe_process_fixtures(fixtures):
    """Process fixtures with error handling for data transformation."""
    errors = []
    
    try:
        # Reset index if needed
        if isinstance(fixtures.index, pd.MultiIndex):
            fixtures = fixtures.reset_index()
            if ERROR_HANDLING_AVAILABLE:
                logger.logger.info("Reset MultiIndex on fixtures DataFrame")
        
        return fixtures, errors
        
    except Exception as e:
        error_context = create_error_context(
            "fixtures_processing",
            processing_step="index_reset",
            error_type=classify_error(e)
        ) if ERROR_HANDLING_AVAILABLE else {}
        
        if ERROR_HANDLING_AVAILABLE:
            logger.log_error(e, error_context)
            errors.append(e)
            # Try to continue with original fixtures
            return fixtures, errors
        else:
            raise

def main():
    print(f"Starting comprehensive fixtures scrape for {len(EUROPEAN_LEAGUES)} leagues...")
    print(f"Season: {SEASON}")
    print("Leagues:", ", ".join(EUROPEAN_LEAGUES))
    
    if ERROR_HANDLING_AVAILABLE:
        print("🛡️  Enhanced error handling enabled")
        logger.logger.info("Starting comprehensive fixtures scrape with enhanced error handling")
    else:
        print("⚠️  Basic error handling mode")

    try:
        # Create scraper instance with error handling
        if ERROR_HANDLING_AVAILABLE:
            fbref = recovery_manager.safe_execute(
                robust_create_scraper,
                "fbref_creation",
                EUROPEAN_LEAGUES,
                SEASON
            )
        else:
            fbref = sd.FBref(leagues=EUROPEAN_LEAGUES, seasons=SEASON)

        print("\nScraping fixtures... This may take several minutes...")
        
        # Get all fixtures with error handling
        if ERROR_HANDLING_AVAILABLE:
            fixtures = recovery_manager.safe_execute(
                robust_read_schedule,
                "schedule_reading",
                fbref
            )
        else:
            fixtures = fbref.read_schedule()

        # Process fixtures with error handling
        if ERROR_HANDLING_AVAILABLE:
            fixtures, processing_errors = safe_process_fixtures(fixtures)
            if processing_errors:
                recovery_manager.handle_partial_failure(
                    fixtures, processing_errors,
                    {"operation": "fixtures_processing", "stage": "index_reset"}
                )
        else:
            # Reset index if needed (basic version)
            if isinstance(fixtures.index, pd.MultiIndex):
                fixtures = fixtures.reset_index()

        print(f"\n✅ Successfully scraped {len(fixtures)} fixtures across {len(EUROPEAN_LEAGUES)} leagues")
        
        if ERROR_HANDLING_AVAILABLE:
            logger.log_success(
                "comprehensive_scraping",
                {
                    "fixtures_count": len(fixtures),
                    "leagues_count": len(EUROPEAN_LEAGUES),
                    "season": SEASON
                }
            )

        # Ensure output directory exists
        os.makedirs(OUTPUT_DIR, exist_ok=True)

        # Save comprehensive fixtures
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = os.path.join(OUTPUT_DIR, f"comprehensive_fixtures_{SEASON}_{timestamp}.csv")

        fixtures.to_csv(output_file, index=False)
        print(f"\nComprehensive fixtures saved to: {output_file}")

        # Also save a simplified version for easier filtering
        simplified_file = os.path.join(OUTPUT_DIR, f"fixtures_{SEASON}_simplified.csv")

        # Keep only essential columns and add score columns
        base_cols = ['league', 'season', 'date', 'home_team', 'away_team', 'match_report']
        available_cols = [col for col in base_cols if col in fixtures.columns]
        
        simplified_fixtures = fixtures[available_cols].copy()
        
        # Split score column into home_score and away_score if it exists
        if 'score' in fixtures.columns:
            # Handle scores in format "4–2" or "4-2"
            def split_score(score_str):
                if pd.isna(score_str):
                    return None, None
                try:
                    # Handle both en-dash and regular dash
                    if '–' in str(score_str):
                        home_score, away_score = str(score_str).split('–')
                    elif '-' in str(score_str):
                        home_score, away_score = str(score_str).split('-')
                    else:
                        return None, None
                    return int(home_score.strip()), int(away_score.strip())
                except (ValueError, AttributeError):
                    return None, None
            
            score_data = fixtures['score'].apply(split_score)
            simplified_fixtures['home_score'] = [s[0] for s in score_data]
            simplified_fixtures['away_score'] = [s[1] for s in score_data]
        else:
            # If no score column, add empty score columns
            simplified_fixtures['home_score'] = None
            simplified_fixtures['away_score'] = None

        # Add computed columns
        if 'date' in simplified_fixtures.columns:
            simplified_fixtures['date'] = pd.to_datetime(simplified_fixtures['date']).dt.date
            simplified_fixtures['day_of_week'] = pd.to_datetime(simplified_fixtures['date']).dt.day_name()

        simplified_fixtures.to_csv(simplified_file, index=False)
        print(f"Simplified fixtures saved to: {simplified_file}")

        # 🔍 DATA VALIDATION - Validate the simplified fixtures
        if DataValidator:
            print("\n🔍 Validating scraped data...")
            try:
                config_path = os.path.join(os.path.dirname(__file__), 'validation_config.json')
                validator = DataValidator(config_path if os.path.exists(config_path) else None)
                
                # Validate the simplified fixtures DataFrame
                validation_result = validator.validate_dataframe(simplified_fixtures, simplified_file)
                
                print(validation_result.summary)
                
                # Generate validation report
                reports_dir = os.path.join(OUTPUT_DIR, 'validation_reports')
                os.makedirs(reports_dir, exist_ok=True)
                
                report_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                json_report = os.path.join(reports_dir, f"validation_report_{report_timestamp}.json")
                html_report = os.path.join(reports_dir, f"validation_report_{report_timestamp}.html")
                
                # Generate both JSON and HTML reports
                validator.generate_report(validation_result, json_report, 'json')
                validator.generate_report(validation_result, html_report, 'html')
                
                print(f"📋 Validation reports saved:")
                print(f"  JSON: {json_report}")
                print(f"  HTML: {html_report}")
                
                # Check if validation passed
                if not validation_result.is_valid:
                    print(f"\n⚠️  Data validation found issues. Quality score: {validation_result.quality_score:.1f}/100")
                    print("   Review the validation report for details.")
                else:
                    print(f"\n✅ Data validation passed! Quality score: {validation_result.quality_score:.1f}/100")
                    
            except Exception as ve:
                print(f"\n❌ Validation error: {ve}")
                print("   Scraping completed but validation failed.")
        else:
            print("\n⚠️  Data validation skipped (validator not available)")

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
        error_type = classify_error(e) if ERROR_HANDLING_AVAILABLE else "unknown"
        
        if ERROR_HANDLING_AVAILABLE:
            # Enhanced error handling with classification
            context = create_error_context(
                "comprehensive_scrape",
                leagues=EUROPEAN_LEAGUES,
                season=SEASON,
                error_type=error_type
            )
            
            logger.log_error(e, context)
            
            # Provide specific error messages based on error type
            if error_type == "network":
                print(f"🌐 ❌ Network Error: {e}")
                print("   - Check your internet connection")
                print("   - The soccer data source might be temporarily unavailable")
                print("   - Retries were automatically attempted")
            elif error_type == "rate_limit":
                print(f"🚫 ❌ Rate Limit Error: {e}")
                print("   - Too many requests sent to the data source")
                print("   - Please wait before running the script again")
                print("   - Consider reducing the number of leagues or using smaller time windows")
            elif error_type == "parsing":
                print(f"📝 ❌ Data Parsing Error: {e}")
                print("   - The data format from the source might have changed")
                print("   - Some fixtures data might still be available")
                print("   - Check if partial data was saved")
            else:
                print(f"ℹ️ ❌ Scraping Error ({error_type}): {e}")
                print("   - An unexpected error occurred during scraping")
                print("   - Check the logs for more details")
        else:
            # Basic error handling
            print(f"❌ Error during comprehensive scrape: {e}")
            import traceback
            traceback.print_exc()
        
        # Always show the log file location if available
        if ERROR_HANDLING_AVAILABLE:
            log_file = os.path.join(OUTPUT_DIR, "logs", "comprehensive_fixtures.log")
            if os.path.exists(log_file):
                print(f"\n📄 Detailed error logs saved to: {log_file}")
        
        return False  # Indicate failure

if __name__ == "__main__":
    main()