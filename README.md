# Soccer Score Scraper

This project uses the `soccerdata` library to scrape soccer match scores from FBref.com.

## Features

- **Web Interface**: User-friendly React UI for selecting scrape parameters
- **Multiple Scrapers**: Full season data and weekly fixtures (Fri-Mon)
- **Flexible League Selection**: Choose from major European leagues and divisions
- **CSV Export**: Clean data output for analysis
- **API Backend**: Flask API connecting frontend to Python scripts
- **Error Handling**: Robust error handling and logging

## Setup

### Prerequisites

- Python 3.7 or higher
- Virtual environment with soccerdata installed

### Installation

1. Clone or download this project.
2. Navigate to the project directory.
3. Activate the virtual environment:
   ```bash
   source soccerdata_venv/bin/activate
   ```
4. Install dependencies (if not already installed):
   ```bash
   pip install soccerdata pandas
   ```

## Usage

### Web Interface (Recommended)
1. **Start the API backend:**
   ```bash
   python run.py api
   ```
   This starts the Flask server on http://localhost:5000

2. **Start the React frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   This opens the web interface at http://localhost:3000

3. **Use the web interface** to select leagues, seasons, and scrape type, then click "Start Scraping"

### Command Line Usage

#### Full Season Scraper
```bash
python scripts/scraper.py
```
Or use the runner:
```bash
python run.py season
```

#### Weekly Fixtures Scraper
```bash
python scripts/weekly_fixtures.py
```
Or use the runner:
```bash
python run.py weekly
```

#### API Server Only
```bash
python run.py api
```

### Configuration
- **Leagues**: Edit the `LEAGUES` list in the respective scripts
- **Season**: Modify the `SEASON` variable (format: 'YYYY-YYYY')
- **Output**: CSV files are saved in the `data/` directory

## Output

The script generates a CSV file with match results, including:
- Date
- Home team
- Away team
- Score
- Other match details

## Troubleshooting

- If you encounter errors, check the console output for available leagues.
- Ensure the league name matches exactly as listed in `fbref.available_leagues()`.
- For future seasons, data may not be available yet.

## Documentation

For more detailed usage examples and API reference, see `docs/user_guide.md`.

## License

This project is for educational purposes. Please respect the terms of service of data sources.