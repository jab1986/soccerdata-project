## Agent 1: Data Scraper Agent
**Purpose**: Handle all data scraping operations and data management tasks

**Specialized Tasks**:
- Run comprehensive or weekly fixture scraping
- Monitor and validate CSV output files
- Handle scraper errors and retries
- Manage data directory cleanup
- Update league configurations and seasons

**Key Commands**:
```bash
# Scraping operations
python run.py comprehensive
python run.py weekly
python run.py season

# Data validation
ls -la data/
head -n 5 data/fixtures_*_simplified.csv
```

**Autonomy Settings**:
- Allow automatic execution of scraper commands
- Require approval for data directory cleanup operations
- Allow file reading/writing in `data/` directory
- Deny operations outside project directory

**Error Handling**:
- Automatically retry failed scrapes with exponential backoff
- Check for rate limiting and adjust timing
- Validate CSV structure and column presence
- Monitor disk space usage
