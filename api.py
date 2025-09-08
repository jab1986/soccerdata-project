from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.exceptions import BadRequest
import pandas as pd
import os
import glob
from datetime import datetime, timedelta
import logging
import traceback
from functools import wraps

# Import chart data processor
try:
    from utils.chart_data_processor import ChartDataProcessor, safe_json_response
except ImportError:
    ChartDataProcessor = None
    safe_json_response = None
    print("Warning: ChartDataProcessor not available")

app = Flask(__name__)
CORS(app)  # Enable CORS for React app

DATA_DIR = 'data'

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Error response structure
class APIError:
    def __init__(self, error_code, message, details=None, http_status=500):
        self.error_code = error_code
        self.message = message
        self.details = details or {}
        self.http_status = http_status
        self.timestamp = datetime.now().isoformat()
    
    def to_dict(self):
        return {
            'error': {
                'code': self.error_code,
                'message': self.message,
                'details': self.details,
                'timestamp': self.timestamp
            }
        }

# Enhanced error handler decorator
def handle_api_errors(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except FileNotFoundError as e:
            error = APIError(
                error_code='DATA_NOT_FOUND',
                message='Required data files not found',
                details={
                    'suggestion': 'Run the comprehensive scraper first: python run.py comprehensive',
                    'missing_files': 'fixtures_*_simplified.csv files in data/ directory'
                },
                http_status=404
            )
            logger.error(f'FileNotFoundError in {f.__name__}: {str(e)}')
            return jsonify(error.to_dict()), error.http_status
        except pd.errors.EmptyDataError as e:
            error = APIError(
                error_code='EMPTY_DATA_FILE',
                message='Data file exists but contains no data',
                details={
                    'suggestion': 'Re-run the data scraper to refresh the files',
                    'file_path': getattr(e, 'filename', 'Unknown')
                },
                http_status=404
            )
            logger.error(f'EmptyDataError in {f.__name__}: {str(e)}')
            return jsonify(error.to_dict()), error.http_status
        except pd.errors.ParserError as e:
            error = APIError(
                error_code='DATA_PARSE_ERROR',
                message='Unable to parse data file format',
                details={
                    'suggestion': 'Check if the CSV file is corrupted and re-run the scraper',
                    'parser_error': str(e)
                },
                http_status=422
            )
            logger.error(f'ParserError in {f.__name__}: {str(e)}')
            return jsonify(error.to_dict()), error.http_status
        except KeyError as e:
            error = APIError(
                error_code='MISSING_DATA_FIELD',
                message='Expected data field is missing',
                details={
                    'missing_field': str(e),
                    'suggestion': 'Verify the data schema matches expected format'
                },
                http_status=422
            )
            logger.error(f'KeyError in {f.__name__}: {str(e)}')
            return jsonify(error.to_dict()), error.http_status
        except ValueError as e:
            error = APIError(
                error_code='INVALID_DATA_VALUE',
                message='Data contains invalid values',
                details={
                    'value_error': str(e),
                    'suggestion': 'Check data format and types'
                },
                http_status=400
            )
            logger.error(f'ValueError in {f.__name__}: {str(e)}')
            return jsonify(error.to_dict()), error.http_status
        except PermissionError as e:
            error = APIError(
                error_code='PERMISSION_DENIED',
                message='Permission denied accessing required resources',
                details={
                    'suggestion': 'Check file system permissions for data directory and files',
                    'permission_error': str(e)
                },
                http_status=403
            )
            logger.error(f'PermissionError in {f.__name__}: {str(e)}')
            return jsonify(error.to_dict()), error.http_status
        except BadRequest as e:
            error = APIError(
                error_code='INVALID_REQUEST_FORMAT',
                message='Request format is invalid',
                details={
                    'suggestion': 'Ensure JSON is properly formatted and contains required fields',
                    'request_error': str(e)
                },
                http_status=400
            )
            logger.error(f'BadRequest in {f.__name__}: {str(e)}')
            return jsonify(error.to_dict()), error.http_status
        except Exception as e:
            error = APIError(
                error_code='INTERNAL_SERVER_ERROR',
                message='An unexpected error occurred',
                details={
                    'suggestion': 'Please try again or contact support if the issue persists'
                },
                http_status=500
            )
            logger.error(f'Unexpected error in {f.__name__}: {str(e)}\n{traceback.format_exc()}')
            return jsonify(error.to_dict()), error.http_status
    return decorated_function

# Input validation helper
def validate_json_request(required_fields=None, optional_fields=None):
    """Validate JSON request data with detailed field-level error reporting"""
    data = request.get_json()
    if data is None:
        raise BadRequest('Request must contain valid JSON data')
    
    errors = []
    
    # Check required fields
    if required_fields:
        for field in required_fields:
            if field not in data:
                errors.append(f"Missing required field: '{field}'")
            elif data[field] is None:
                errors.append(f"Field '{field}' cannot be null")
    
    # Validate field types if specified
    field_validations = {
        'leagues': (list, "must be an array of league names"),
        'teams': (list, "must be an array of team names"),
        'date_from': (str, "must be a date string in YYYY-MM-DD format"),
        'date_to': (str, "must be a date string in YYYY-MM-DD format"),
        'fixtures': (list, "must be an array of fixture objects")
    }
    
    for field, value in data.items():
        if field in field_validations and value is not None:
            expected_type, error_msg = field_validations[field]
            if not isinstance(value, expected_type):
                errors.append(f"Field '{field}' {error_msg}")
    
    # Validate date formats
    date_fields = ['date_from', 'date_to']
    for field in date_fields:
        if field in data and data[field] is not None:
            try:
                datetime.strptime(data[field], '%Y-%m-%d')
            except ValueError:
                errors.append(f"Field '{field}' must be in YYYY-MM-DD format")
    
    if errors:
        error = APIError(
            error_code='VALIDATION_ERROR',
            message='Request validation failed',
            details={
                'field_errors': errors,
                'suggestion': 'Fix the field errors and retry the request'
            },
            http_status=400
        )
        return jsonify(error.to_dict()), error.http_status
    
    return data

# Helper function to get latest fixtures file with detailed error handling
def get_latest_fixtures_file():
    """Get the most recent fixtures file with detailed error reporting"""
    fixtures_files = glob.glob(os.path.join(DATA_DIR, 'fixtures_*_simplified.csv'))
    if not fixtures_files:
        raise FileNotFoundError(f'No fixtures data found in {DATA_DIR} directory')
    
    latest_file = max(fixtures_files, key=os.path.getctime)
    
    # Check if file is readable and not empty
    if not os.access(latest_file, os.R_OK):
        raise PermissionError(f'Cannot read fixtures file: {latest_file}')
    
    if os.path.getsize(latest_file) == 0:
        raise pd.errors.EmptyDataError(f'Fixtures file is empty: {latest_file}')
    
    return latest_file

@app.route('/api/fixtures', methods=['GET'])
@handle_api_errors
def get_fixtures():
    """Get all available fixtures data"""
    # Get the most recent fixtures file
    latest_file = get_latest_fixtures_file()
    
    # Load and process the data
    df = pd.read_csv(latest_file)
    
    if df.empty:
        error = APIError(
            error_code='EMPTY_DATASET',
            message='No fixtures data available',
            details={
                'suggestion': 'Run the data scraper to populate fixtures data',
                'file_checked': os.path.basename(latest_file)
            },
            http_status=404
        )
        return jsonify(error.to_dict()), error.http_status
    
    # Convert to list of dicts for JSON response
    fixtures = df.to_dict('records')
    
    # Replace NaN values with None in the fixtures list
    import math
    for fixture in fixtures:
        for key, value in fixture.items():
            if isinstance(value, float) and math.isnan(value):
                fixture[key] = None
    
    logger.info(f'Successfully retrieved {len(fixtures)} fixtures from {os.path.basename(latest_file)}')
    
    return jsonify({
        'fixtures': fixtures,
        'total_count': len(fixtures),
        'file': os.path.basename(latest_file)
    })

@app.route('/api/fixtures/filter', methods=['POST'])
@handle_api_errors
def filter_fixtures():
    """Filter fixtures based on user criteria"""
    # Validate request data
    data = validate_json_request()
    if isinstance(data, tuple):  # Error response
        return data
    
    # Extract filter parameters
    leagues = data.get('leagues', [])
    date_from = data.get('date_from')
    date_to = data.get('date_to')
    teams = data.get('teams', [])
    
    # Get the most recent fixtures file
    latest_file = get_latest_fixtures_file()
    df = pd.read_csv(latest_file)
    
    if df.empty:
        error = APIError(
            error_code='EMPTY_DATASET',
            message='No fixtures data available for filtering',
            details={
                'suggestion': 'Run the data scraper to populate fixtures data',
                'file_checked': os.path.basename(latest_file)
            },
            http_status=404
        )
        return jsonify(error.to_dict()), error.http_status
    
    # Validate date range logic
    if date_from and date_to:
        try:
            from_date = datetime.strptime(date_from, '%Y-%m-%d')
            to_date = datetime.strptime(date_to, '%Y-%m-%d')
            if from_date > to_date:
                error = APIError(
                    error_code='INVALID_DATE_RANGE',
                    message='Invalid date range: from_date cannot be after to_date',
                    details={
                        'date_from': date_from,
                        'date_to': date_to,
                        'suggestion': 'Ensure date_from is before or equal to date_to'
                    },
                    http_status=400
                )
                return jsonify(error.to_dict()), error.http_status
        except ValueError as e:
            # This should be caught by validation, but just in case
            pass
    
    # Store original count for comparison
    original_count = len(df)
    
    # Apply filters
    if leagues:
        if 'league' not in df.columns:
            error = APIError(
                error_code='MISSING_DATA_FIELD',
                message='League field not found in data',
                details={
                    'available_columns': list(df.columns),
                    'suggestion': 'Check data schema or update the scraper'
                },
                http_status=422
            )
            return jsonify(error.to_dict()), error.http_status
        
        # Check if any of the requested leagues exist in the data
        available_leagues = set(df['league'].dropna().unique())
        requested_leagues = set(leagues)
        invalid_leagues = requested_leagues - available_leagues
        
        if invalid_leagues:
            logger.warning(f'Requested leagues not found in data: {invalid_leagues}')
        
        df = df[df['league'].isin(leagues)]
    
    if date_from or date_to:
        if 'date' not in df.columns:
            error = APIError(
                error_code='MISSING_DATA_FIELD',
                message='Date field not found in data',
                details={
                    'available_columns': list(df.columns),
                    'suggestion': 'Check data schema or update the scraper'
                },
                http_status=422
            )
            return jsonify(error.to_dict()), error.http_status
        
        try:
            df['date'] = pd.to_datetime(df['date'])
            
            if date_from:
                df = df[df['date'] >= pd.to_datetime(date_from)]
            
            if date_to:
                df = df[df['date'] <= pd.to_datetime(date_to)]
                
        except (ValueError, pd.errors.ParserError) as e:
            error = APIError(
                error_code='DATE_PARSING_ERROR',
                message='Unable to parse dates in data',
                details={
                    'parsing_error': str(e),
                    'suggestion': 'Check date format in the data file'
                },
                http_status=422
            )
            return jsonify(error.to_dict()), error.http_status
    
    if teams:
        required_columns = ['home_team', 'away_team']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            error = APIError(
                error_code='MISSING_DATA_FIELD',
                message='Team fields not found in data',
                details={
                    'missing_columns': missing_columns,
                    'available_columns': list(df.columns),
                    'suggestion': 'Check data schema or update the scraper'
                },
                http_status=422
            )
            return jsonify(error.to_dict()), error.http_status
        
        # Check if any of the requested teams exist in the data
        all_teams = set(df['home_team'].dropna()) | set(df['away_team'].dropna())
        requested_teams = set(teams)
        invalid_teams = requested_teams - all_teams
        
        if invalid_teams:
            logger.warning(f'Requested teams not found in data: {invalid_teams}')
        
        df = df[df['home_team'].isin(teams) | df['away_team'].isin(teams)]
    
    # Convert to list of dicts
    filtered_fixtures = df.to_dict('records')
    
    # Replace NaN values with None in the filtered fixtures
    import math
    for fixture in filtered_fixtures:
        for key, value in fixture.items():
            if isinstance(value, float) and math.isnan(value):
                fixture[key] = None
    
    filter_summary = {
        'original_count': original_count,
        'filtered_count': len(filtered_fixtures),
        'filters_applied': {
            'leagues': leagues,
            'date_from': date_from,
            'date_to': date_to,
            'teams': teams
        }
    }
    
    logger.info(f'Filtered fixtures: {original_count} -> {len(filtered_fixtures)} records')
    
    return jsonify({
        'fixtures': filtered_fixtures,
        'count': len(filtered_fixtures),
        'filters_applied': filter_summary['filters_applied'],
        'filter_summary': filter_summary
    })

@app.route('/api/fixtures/export', methods=['POST'])
@handle_api_errors
def export_fixtures():
    """Export filtered fixtures to CSV"""
    # Validate request data with required fixtures field
    data = validate_json_request(required_fields=['fixtures'])
    if isinstance(data, tuple):  # Error response
        return data
    
    fixtures = data.get('fixtures', [])
    filename = data.get('filename', f'filtered_fixtures_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv')
    
    # Validate fixtures data
    if not fixtures:
        error = APIError(
            error_code='EMPTY_EXPORT_DATA',
            message='No fixtures provided for export',
            details={
                'suggestion': 'Provide at least one fixture object in the fixtures array',
                'expected_format': 'Array of fixture objects'
            },
            http_status=400
        )
        return jsonify(error.to_dict()), error.http_status
    
    # Validate filename
    if not filename or not isinstance(filename, str):
        filename = f'filtered_fixtures_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
    
    # Ensure filename has .csv extension
    if not filename.endswith('.csv'):
        filename += '.csv'
    
    # Validate filename characters (basic security check)
    import re
    if not re.match(r'^[\w\-. ]+$', filename):
        error = APIError(
            error_code='INVALID_FILENAME',
            message='Invalid filename format',
            details={
                'filename': filename,
                'suggestion': 'Use only alphanumeric characters, spaces, dots, and dashes in filename',
                'allowed_pattern': 'Letters, numbers, spaces, dots, and dashes only'
            },
            http_status=400
        )
        return jsonify(error.to_dict()), error.http_status
    
    # Ensure data directory exists
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
    except OSError as e:
        error = APIError(
            error_code='DIRECTORY_CREATE_ERROR',
            message='Unable to create export directory',
            details={
                'directory': DATA_DIR,
                'os_error': str(e),
                'suggestion': 'Check file system permissions'
            },
            http_status=500
        )
        return jsonify(error.to_dict()), error.http_status
    
    # Convert to DataFrame and validate structure
    try:
        df = pd.DataFrame(fixtures)
        
        if df.empty:
            error = APIError(
                error_code='EMPTY_DATAFRAME',
                message='Fixtures data resulted in empty DataFrame',
                details={
                    'suggestion': 'Check that fixture objects contain valid data',
                    'fixtures_count': len(fixtures)
                },
                http_status=400
            )
            return jsonify(error.to_dict()), error.http_status
        
    except ValueError as e:
        error = APIError(
            error_code='DATAFRAME_CONVERSION_ERROR',
            message='Unable to convert fixtures to DataFrame',
            details={
                'conversion_error': str(e),
                'suggestion': 'Ensure all fixture objects have consistent structure',
                'fixtures_sample': fixtures[:2] if len(fixtures) > 2 else fixtures
            },
            http_status=400
        )
        return jsonify(error.to_dict()), error.http_status
    
    # Save to CSV
    output_path = os.path.join(DATA_DIR, filename)
    
    try:
        df.to_csv(output_path, index=False)
        
        # Verify file was created successfully
        if not os.path.exists(output_path):
            raise OSError(f'File was not created: {output_path}')
        
        file_size = os.path.getsize(output_path)
        
    except (OSError, PermissionError) as e:
        error = APIError(
            error_code='FILE_WRITE_ERROR',
            message='Unable to write export file',
            details={
                'output_path': output_path,
                'os_error': str(e),
                'suggestion': 'Check file system permissions and available disk space'
            },
            http_status=500
        )
        return jsonify(error.to_dict()), error.http_status
    
    logger.info(f'Successfully exported {len(fixtures)} fixtures to {filename} ({file_size} bytes)')
    
    return jsonify({
        'message': f'Successfully exported {len(fixtures)} fixtures',
        'filename': filename,
        'path': output_path,
        'file_size_bytes': file_size,
        'records_exported': len(fixtures)
    })

@app.route('/api/scrape', methods=['POST'])
@handle_api_errors
def scrape_data():
    """Legacy endpoint for backward compatibility"""
    logger.info('Legacy /api/scrape endpoint called')
    
    return jsonify({
        'status': 'deprecated',
        'message': 'Scraping is now handled by comprehensive_fixtures.py. Use /api/fixtures to access data.',
        'migration_info': {
            'new_command': 'python run.py comprehensive',
            'data_endpoint': '/api/fixtures',
            'filter_endpoint': '/api/fixtures/filter',
            'export_endpoint': '/api/fixtures/export'
        },
        'suggestion': 'Update your client to use the new endpoints for better functionality'
    })


# Chart Data API Endpoints
@app.route('/api/charts/league-stats', methods=['GET'])
@handle_api_errors
def get_league_statistics_chart():
    """Get league statistics for chart display"""
    if not ChartDataProcessor:
        return jsonify({'error': 'Chart data processor not available'}), 500
    
    days_back = request.args.get('days_back', default=30, type=int)
    
    try:
        processor = ChartDataProcessor(DATA_DIR)
        stats = processor.get_league_statistics(days_back=days_back)
        
        return jsonify({
            'league_statistics': stats,
            'total_leagues': len(stats),
            'days_back': days_back,
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f'Error generating league statistics: {e}')
        return jsonify({'error': f'Failed to generate league statistics: {str(e)}'}), 500


@app.route('/api/charts/daily-trends', methods=['GET'])
@handle_api_errors
def get_daily_trends_chart():
    """Get daily match trends for line chart"""
    if not ChartDataProcessor:
        return jsonify({'error': 'Chart data processor not available'}), 500
    
    days_back = request.args.get('days_back', default=14, type=int)
    
    try:
        processor = ChartDataProcessor(DATA_DIR)
        trends = processor.get_daily_match_trends(days_back=days_back)
        
        return jsonify({
            'daily_trends': trends,
            'total_days': len(trends),
            'days_back': days_back,
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f'Error generating daily trends: {e}')
        return jsonify({'error': f'Failed to generate daily trends: {str(e)}'}), 500


@app.route('/api/charts/team-performance/<team_name>', methods=['GET'])
@handle_api_errors
def get_team_performance_chart(team_name):
    """Get team performance data for detailed analysis"""
    if not ChartDataProcessor:
        return jsonify({'error': 'Chart data processor not available'}), 500
    
    matches_limit = request.args.get('matches_limit', default=10, type=int)
    
    try:
        processor = ChartDataProcessor(DATA_DIR)
        performance = processor.get_team_performance_data(team_name, matches_limit=matches_limit)
        
        return jsonify({
            'team_performance': performance,
            'team_name': team_name,
            'matches_analyzed': len(performance.get('matches', [])),
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f'Error generating team performance for {team_name}: {e}')
        return jsonify({'error': f'Failed to generate team performance data: {str(e)}'}), 500


@app.route('/api/charts/league-trends/<league>', methods=['GET'])
@handle_api_errors
def get_league_trends_chart(league):
    """Get fixture trends for a specific league"""
    if not ChartDataProcessor:
        return jsonify({'error': 'Chart data processor not available'}), 500
    
    days_back = request.args.get('days_back', default=30, type=int)
    
    try:
        processor = ChartDataProcessor(DATA_DIR)
        trends = processor.get_fixture_trends_by_league(league, days_back=days_back)
        
        return jsonify({
            'league_trends': trends,
            'league': league,
            'total_matches': len(trends),
            'days_back': days_back,
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f'Error generating league trends for {league}: {e}')
        return jsonify({'error': f'Failed to generate league trends: {str(e)}'}), 500


@app.route('/api/charts/weekly-summary', methods=['GET'])
@handle_api_errors
def get_weekly_summary_chart():
    """Get weekly summary statistics for dashboard overview"""
    if not ChartDataProcessor:
        return jsonify({'error': 'Chart data processor not available'}), 500
    
    try:
        processor = ChartDataProcessor(DATA_DIR)
        summary = processor.get_weekly_summary()
        
        return jsonify({
            'weekly_summary': summary,
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f'Error generating weekly summary: {e}')
        return jsonify({'error': f'Failed to generate weekly summary: {str(e)}'}), 500


@app.route('/api/charts/overview', methods=['GET'])
@handle_api_errors
def get_charts_overview():
    """Get comprehensive overview data for charts dashboard"""
    if not ChartDataProcessor:
        return jsonify({'error': 'Chart data processor not available'}), 500
    
    try:
        processor = ChartDataProcessor(DATA_DIR)
        
        # Get basic overview data
        league_stats = processor.get_league_statistics(days_back=30)
        daily_trends = processor.get_daily_match_trends(days_back=7)
        weekly_summary = processor.get_weekly_summary()
        
        return jsonify({
            'overview': {
                'league_statistics': league_stats[:5],  # Top 5 leagues
                'recent_daily_trends': daily_trends[-7:],  # Last 7 days
                'weekly_summary': weekly_summary,
                'total_leagues_tracked': len(league_stats),
                'data_freshness': processor._last_load_time.isoformat() if processor._last_load_time else None
            },
            'generated_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f'Error generating charts overview: {e}')
        return jsonify({'error': f'Failed to generate charts overview: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)