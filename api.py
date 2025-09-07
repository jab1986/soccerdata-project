from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
import glob
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)  # Enable CORS for React app

DATA_DIR = 'data'

@app.route('/api/fixtures', methods=['GET'])
def get_fixtures():
    """Get all available fixtures data"""
    try:
        # Find the most recent comprehensive fixtures file
        fixtures_files = glob.glob(os.path.join(DATA_DIR, 'fixtures_*_simplified.csv'))
        if not fixtures_files:
            return jsonify({'error': 'No fixtures data found. Please run comprehensive scraper first.'}), 404

        # Get the most recent file
        latest_file = max(fixtures_files, key=os.path.getctime)

        # Load the data
        df = pd.read_csv(latest_file)

        # Convert to list of dicts for JSON response
        fixtures = df.to_dict('records')

        return jsonify({
            'fixtures': fixtures,
            'total_count': len(fixtures),
            'file': os.path.basename(latest_file)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/fixtures/filter', methods=['POST'])
def filter_fixtures():
    """Filter fixtures based on user criteria"""
    try:
        data = request.get_json()
        leagues = data.get('leagues', [])
        date_from = data.get('date_from')
        date_to = data.get('date_to')
        teams = data.get('teams', [])

        # Find the most recent fixtures file
        fixtures_files = glob.glob(os.path.join(DATA_DIR, 'fixtures_*_simplified.csv'))
        if not fixtures_files:
            return jsonify({'error': 'No fixtures data found'}), 404

        latest_file = max(fixtures_files, key=os.path.getctime)
        df = pd.read_csv(latest_file)

        # Apply filters
        if leagues:
            df = df[df['league'].isin(leagues)]

        if date_from:
            df['date'] = pd.to_datetime(df['date'])
            df = df[df['date'] >= pd.to_datetime(date_from)]

        if date_to:
            df['date'] = pd.to_datetime(df['date'])
            df = df[df['date'] <= pd.to_datetime(date_to)]

        if teams:
            df = df[df['home_team'].isin(teams) | df['away_team'].isin(teams)]

        # Convert to list of dicts
        filtered_fixtures = df.to_dict('records')

        return jsonify({
            'fixtures': filtered_fixtures,
            'count': len(filtered_fixtures),
            'filters_applied': {
                'leagues': leagues,
                'date_from': date_from,
                'date_to': date_to,
                'teams': teams
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/fixtures/export', methods=['POST'])
def export_fixtures():
    """Export filtered fixtures to CSV"""
    try:
        data = request.get_json()
        fixtures = data.get('fixtures', [])
        filename = data.get('filename', f'filtered_fixtures_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv')

        if not fixtures:
            return jsonify({'error': 'No fixtures to export'}), 400

        # Convert to DataFrame and save
        df = pd.DataFrame(fixtures)
        output_path = os.path.join(DATA_DIR, filename)
        df.to_csv(output_path, index=False)

        return jsonify({
            'message': f'Successfully exported {len(fixtures)} fixtures',
            'filename': filename,
            'path': output_path
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/scrape', methods=['POST'])
def scrape_data():
    """Legacy endpoint for backward compatibility"""
    return jsonify({
        'message': 'Scraping is now handled by comprehensive_fixtures.py. Use /api/fixtures to access data.',
        'note': 'Run python scripts/comprehensive_fixtures.py to update the data.'
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)