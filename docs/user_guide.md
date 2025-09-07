# User Guide for Soccer Score Scraper

## Introduction

This user guide provides comprehensive instructions for setting up and using the soccer score scraper project. The project leverages the `soccerdata` library to scrape match results from FBref.com.

## Installation

### Prerequisites

- Python 3.7 or higher
- Node.js 16+ and npm (for React UI)
- Git (optional, for cloning the repository)

### Step-by-Step Installation

1. **Download the Project**
   - Download or clone this project to your local machine.

2. **Navigate to Project Directory**
   ```bash
   cd soccerdata_project
   ```

3. **Python Setup**
   ```bash
   source soccerdata_venv/bin/activate
   pip install -r requirements.txt
   ```

4. **React UI Setup (Optional)**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

5. **Verify Installation**
   ```bash
   python -c "import soccerdata as sd; print('Python installation successful')"
   ```

## Basic Usage

### Web Interface (Recommended)

The easiest way to use the scraper is through the React web interface:

1. **Start the Backend API**
   ```bash
   python run.py api
   ```

2. **Start the Frontend**
   ```bash
   cd frontend
   npm start
   ```

3. **Open your browser** to http://localhost:3000

4. **Select your options**:
   - Choose scrape type (Full Season or Weekly Fixtures)
   - Select season from dropdown
   - Check desired leagues
   - Click "Start Scraping"

### Command Line Usage

#### Running Individual Scrapers

1. **Configure the Script**
   - Open `scripts/scraper.py` or `scripts/weekly_fixtures.py` in your preferred text editor.
   - Modify the league and season variables at the top of the file.

2. **Execute the Scraper**
   ```bash
   python scripts/scraper.py
   # or
   python scripts/weekly_fixtures.py
   ```

3. **Check Output**
   - Look for the generated CSV file in the `data/` directory.

### Configuration Options

- **LEAGUE**: The league to scrape (e.g., 'ENG-Premier League', 'ESP-La Liga')
- **SEASON**: The season in YYYY-YYYY format (e.g., '2025-2026')
- **OUTPUT_DIR**: Directory to save CSV files (default: '../data')

## Examples

### Example 1: Scraping English Premier League 2025-2026

```python
# In scripts/scraper.py
LEAGUE = 'ENG-Premier League'
SEASON = '2025-2026'
```

**Output**: `data/ENG_Premier_League_2025_2026_matches.csv`

### Example 2: Scraping Spanish La Liga

```python
LEAGUE = 'ESP-La Liga'
SEASON = '2024-2025'
```

**Output**: `data/ESP_La_Liga_2024_2025_matches.csv`

### Example 3: Scraping Multiple Leagues

You can modify the script to scrape multiple leagues:

```python
leagues = ['ENG-Premier League', 'ESP-La Liga', 'ITA-Serie A']
for league in leagues:
    try:
        matches = fbref.read_schedule()
        # Filter and save each league's data
    except Exception as e:
        print(f"Error scraping {league}: {e}")
```

### Example 4: Weekly Fixtures (Fri-Mon)

Use the weekly fixtures scraper to get matches for the current week:

```bash
python scripts/weekly_fixtures.py
```

This will scrape and save fixtures from Friday to Monday of the current week for Premier League and Championship. To change the leagues, modify the `LEAGUES` list in the script (e.g., add 'ENG-League One' or other European leagues).

## Understanding the Output

The CSV file contains match result data with columns such as:
- `date`: Match date
- `home_team`: Home team name
- `away_team`: Away team name
- `home_score`: Goals scored by home team
- `away_score`: Goals scored by away team
- Additional columns for venue, attendance, etc.

## Advanced Usage

### Customizing the Scraper

- **Error Handling**: The script includes try-except blocks for robust error handling.
- **Data Processing**: Add pandas operations after scraping to clean or analyze data.
- **Scheduling**: Use cron jobs or task schedulers to run the scraper periodically.

### Available Leagues

To see all available leagues, run:
```python
from scripts.scraper import fbref
print(fbref.available_leagues())
```

## Troubleshooting

### Common Issues

1. **League Not Found**
   - Ensure the league name matches exactly as listed in `available_leagues()`.
   - Check for typos or variations in league names.

2. **Season Data Not Available**
   - Future seasons may not have data yet.
   - Verify the season format (YYYY-YYYY).

3. **Import Errors**
   - Ensure the virtual environment is activated.
   - Reinstall dependencies: `pip install --upgrade soccerdata pandas`

4. **Permission Errors**
   - Ensure write permissions for the `data/` directory.

### Getting Help

- Check the console output for detailed error messages.
- Refer to the soccerdata documentation: https://soccerdata.readthedocs.io/en/latest/

## API Reference

### Key Classes and Methods

- **FBref Class**: Main scraper class from soccerdata
  - `FBref()`: Initialize scraper
  - `read_match_results(league, season)`: Scrape match results
  - `available_leagues()`: List supported leagues

### Data Format

The `read_match_results` method returns a pandas DataFrame with match data.

## Best Practices

- Respect website terms of service and scraping etiquette.
- Use delays between requests if scraping large amounts of data.
- Store scraped data responsibly and comply with data usage policies.
- Regularly update the soccerdata library for bug fixes and new features.

## Contributing

To extend the project:
- Add new features to `scripts/scraper.py`
- Create additional scripts for data analysis
- Update this guide with new examples

## License and Disclaimer

This project is for educational and personal use. Please comply with the terms of service of data sources and respect copyright laws.