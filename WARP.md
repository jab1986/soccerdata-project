# Soccer Data Scraper + Betting Club Project Rules

This project is a comprehensive betting club management system built on a soccer data scraping foundation. The scraper provides fixtures and results data that feeds into a betting club interface for Joe, Dean, Gaz, Sean and friends.

## Project Vision
**Data Flow**: Scraped Fixtures → Betting Interface → Match Results → League Table Updates
**Users**: Players (view-only) + Single Admin (input bets from WhatsApp)
**Design**: Mobile-first, bold sports colors (black/red/yellow), no logins required

## Architecture Overview

**Backend**: Flask API in `api.py` (port 5000)  
**Frontend**: React app in `frontend/` (dev server port 3000) with proxy to backend  
**Data Pipeline**: Python scrapers in `scripts/` → CSV files in `data/` → API reads latest simplified CSV → Frontend filters client-side  
**Orchestration**: `run.py` provides CLI commands for API and scrapers  

Key files:
- `api.py` - Flask API routes for fixtures data
- `run.py` - CLI runner with commands: api, season, weekly, comprehensive  
- `scripts/comprehensive_fixtures.py` - Main scraper for European leagues
- `frontend/src/App.js` - React UI with filtering and export
- `data/` - Runtime CSV outputs (git-ignored)

## Development Environment

**Python Setup**:
```bash
source soccerdata_venv/bin/activate
pip install -r requirements.txt
```

**Frontend Setup**:
```bash
cd frontend
npm install
npm start  # Runs on port 3000 with proxy to port 5000
```

**Running the Application**:
- Backend: `python run.py api`
- Frontend: `cd frontend && npm start`
- Data refresh: `python run.py comprehensive` or `python run.py weekly`

## Coding Standards

**Python Files** (`api.py`, `run.py`, `scripts/`):
- Use snake_case for variables/functions, UPPER_CASE for constants
- Imports: stdlib, third-party, local (with blank lines between)
- Error handling: try/except with helpful context, structured JSON errors from API
- Write data only to `data/` directory (ensure it exists first)
- Print clear, actionable messages; avoid flooding output

**React Files** (`frontend/src/`):
- Function components with hooks, simple state management
- Derive filter options (leagues, teams) from loaded data - do NOT hardcode
- Keep UI logic in App.js unless complexity requires separate components
- Use dev proxy with relative paths: `fetch('/api/fixtures')`
- Avoid large state managers - this app is intentionally simple

## API Design Patterns

**Current Endpoints**:
- `GET /api/fixtures` → `{ fixtures: Array<Record>, total_count: number, file: string }`
- `POST /api/fixtures/filter` → `{ fixtures: Array<Record>, count: number, filters_applied: {...} }`
- `POST /api/fixtures/export` → `{ message: string, filename: string, path: string }`

**Standards**:
- JSON-only requests/responses with `application/json`
- Error responses: `{ error: string }` with appropriate HTTP status codes
- Convert pandas NaN to null in JSON responses
- CORS enabled for React development

## Data Management

**File Structure**:
- Comprehensive: `comprehensive_fixtures_{SEASON}_{timestamp}.csv`
- Simplified (API source): `fixtures_{SEASON}_simplified.csv`
- API reads most recent `fixtures_*_simplified.csv` file

**Schema Expectations**:
- Standard columns: `league`, `season`, `date`, `home_team`, `away_team`, `home_score`, `away_score`, `match_report`
- Dates formatted as YYYY-MM-DD for lexical comparison
- League codes: 'ENG-Premier League', 'ESP-La Liga', etc.

**Data Flow Changes**: If schema changes, update: scrapers → api.py readers → frontend consumers → tests → docs

## Error Handling

**Scrapers**: Wrap network/parse operations in try/except, print context and stack traces for debugging
**API**: Guard all file I/O and parsing, return JSON error payloads  
**Frontend**: Show user-friendly loading/success/error states, log concise diagnostics

## Testing Approach

Use existing test files: `test_filtering.py` and `test_react_filtering.py` for sanity checks
Keep tests lightweight and deterministic
Add small tests when changing public behavior
Manual verification: check CSV columns/rows after scraper changes, verify UI filters work

## Performance Guidelines

**Scraping**: Respect rate limits, avoid rapid loops, scope requests to needed leagues/seasons
**Data Size**: Use simplified fixtures for API/UI, consider server-side filtering if payloads grow large
**Frontend**: Client-side filtering is fine for moderate datasets

## Security and Secrets

- Never commit secrets - use `.env` file (copy from `.env.example`)
- Access secrets via environment variables, never print/log them
- Keep API scoped to necessary endpoints under `/api/`
- Pin dependency versions in `requirements.txt` and `package.json`

## Extension Patterns

**New Scrapers**: Place in `scripts/`, follow `comprehensive_fixtures.py` pattern, expose configurable LEAGUES/SEASON constants
**API Extensions**: Add routes under `/api/`, maintain consistent JSON shapes, return clear errors
**Frontend Changes**: Preserve existing state flow, keep fetching via `/api/...` with dev proxy
**Documentation**: Update README.md, docs/user_guide.md when changing visible behavior

## Common Issues and Solutions

**"Unexpected token '<' in JSON"**: Frontend got HTML instead of JSON
- Fix: Ensure `frontend/package.json` has `"proxy": "http://localhost:5000"`, restart dev server

**"No fixtures data found"**: API can't find CSV files
- Fix: Run a scraper first: `python run.py comprehensive`

**Date filtering not working**: Date format issues
- Fix: Ensure dates are YYYY-MM-DD format for lexical string comparison

## Version Control

- Commit small, focused changes with descriptive messages
- Never commit `data/`, `.env`, `node_modules/`, virtualenvs (already in `.gitignore`)
- Pin new dependency versions and explain in commit message

## Ethical Considerations

- Respect FBref.com terms of service
- Be considerate with scraping frequency and volume  
- Attribute data sources in documentation
- This project is for educational/personal use

## Operational Commands

```bash
# Start API server
python run.py api

# Start React dev server  
cd frontend && npm start

# Refresh data
python run.py weekly      # Fri-Mon fixtures
python run.py comprehensive  # Full season data

# Run tests
python test_filtering.py
python test_react_filtering.py
```

## Betting Club Priorities

1. **Admin efficiency first**: Weekly updates must take <10 minutes total
2. **Mobile-first design**: Players check standings on phones - optimize for mobile
3. **Reliability over features**: Core flow (fixtures → bets → results → standings) must always work
4. **Open access**: No logins, no authentication - public dashboard accessible to all
5. **Bold sports design**: Black (#000000), Red (#DC2626), Yellow (#FBBF24) color scheme
6. **Interactive admin workflows**: Use MCP-enhanced interactive tools for admin efficiency

## Key Technical Principles

1. **Minimal diffs**: Avoid unrelated refactors and formatting-only changes
2. **Follow existing patterns**: Match the style and structure of current code
3. **Data pipeline reliability**: Scraped data must flow seamlessly to betting system
4. **Mobile responsiveness**: All components work perfectly on phone screens
5. **Clear error handling**: Provide helpful error messages at every layer
6. **TypeScript + Tailwind**: Use TypeScript for type safety, Tailwind for styling

## MCP-Enhanced Development Stack

**Active MCP Servers** (All verified working ✅):
- `github` - Repository management and collaboration
- `filesystem` - File operations within project directory  
- `sqlite` - Database operations with `betting_club.db`
- `fetch` - Web scraping and HTTP requests for match data
- `time` - Time utilities, timezone handling, match scheduling
- `sequential-thinking` - Multi-step problem solving and complex planning
- `interactive` - Enhanced admin workflows with clipboard, notifications, prompts

**MCP Configuration Files**:
- `mcp-servers-config.json` - Ready-to-use JSON config for Warp
- `warp-mcp-setup-guide.txt` - Step-by-step setup instructions
- `WARP_AGENT_MCP_ASSIGNMENTS.md` - Agent-specific MCP server assignments

**Development Benefits**:
- Interactive admin workflows reduce weekly update time to <10 minutes
- Sequential thinking for complex betting calculations and UI architecture
- Database operations through MCP instead of manual SQL
- Enhanced file management with MCP filesystem tools
- Automated web scraping with error handling via MCP fetch
