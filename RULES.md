# Project Rules and Guidelines

This document defines the conventions, standards, and workflows for developing, testing, and operating the Soccer Score Scraper project.

Scope:
- Architecture and project structure
- Development environment
- Coding standards (Python + React)
- API design and contracts
- Data and schema management
- Testing and QA
- Security and secrets handling
- Operations (running, data refresh, maintenance)
- Contribution and extension patterns
- Performance, scalability, and ethics


1) Architecture and Project Structure
- Overview
  - Backend: Flask API in api.py (port 5000)
  - Frontend: React app in frontend/ (dev server on port 3000). Dev proxy to backend is configured in frontend/package.json
  - Data: Python scrapers in scripts/ generate CSVs into data/ (ignored by Git)
  - Orchestration: run.py provides convenient commands to run API and scrapers
  - Docs: README.md, docs/user_guide.md, .github/copilot-instructions.md
- Data flow
  - Scrapers fetch data via soccerdata and write CSVs (comprehensive and simplified)
  - API reads the latest simplified CSV named fixtures_*_simplified.csv
  - Frontend fetches fixtures from /api/fixtures and performs client-side filtering
- Repository layout (key paths)
  - api.py — Flask API routes
  - run.py — CLI runner for API and scrapers
  - scripts/ — Scraping scripts (comprehensive_fixtures.py, scraper.py, weekly_fixtures.py)
  - frontend/ — React UI (App.js is primary view/controller)
  - data/ — Runtime output (CSV files), ignored by Git
  - docs/ — Documentation


2) Development Environment and Tooling
- Python
  - Use Python 3.7+ (prefer project-local virtualenv)
  - Dependencies pinned in requirements.txt; add/upgrade cautiously and pin exact versions
  - Activate your venv before running commands
    ```bash path=null start=null
    source soccerdata_venv/bin/activate
    pip install -r requirements.txt
    ```
- Node/React
  - Node 16+ recommended (current frontend relies on react-scripts 5)
  - Install dependencies in frontend/ once, then use npm scripts
    ```bash path=null start=null
    cd frontend
    npm install
    npm start
    ```
  - Keep the proxy field in frontend/package.json pointing at http://localhost:5000 for dev
- Running the app
  - Backend: start API server from repo root
    ```bash path=null start=null
    python run.py api
    ```
  - Frontend: start React dev server
    ```bash path=null start=null
    cd frontend && npm start
    ```
  - Scrapers:
    ```bash path=null start=null
    # Season/full scraper
    python run.py season

    # Weekly fixtures (Fri–Mon)
    python run.py weekly

    # Comprehensive fixtures across top European leagues
    python run.py comprehensive
    ```


3) Coding Standards and Conventions
- General
  - Keep diffs minimal; avoid unrelated refactors and formatting-only changes
  - Follow existing style in touched files; prefer incremental, well-scoped changes
- Python (api.py, run.py, scripts/)
  - Use snake_case for variables and functions; UPPER_CASE for constants
  - Imports: stdlib, third-party, local (separated by blank lines)
  - Logging/print: use clear, actionable messages; don’t flood output
  - Error handling: prefer try/except with helpful context; return structured JSON errors from API
  - Data paths: write only to data/ and ensure the directory exists
- React (frontend/src)
  - Function components with hooks; keep state simple and traceable
  - Derive filter options (leagues, teams) from loaded data; do not hardcode lists
  - Keep UI logic in App.js unless complexity warrants small utils/components
  - Avoid introducing large state managers; this app is intentionally simple
  - Use the dev proxy; fetch with relative paths like /api/fixtures
- File naming
  - Python files: snake_case
  - React components: PascalCase for component files if you add new components; keep current App.js structure otherwise


4) API Design and Contracts
- Endpoints (current)
  - GET /api/fixtures → { fixtures: Array<Record>, total_count: number, file: string }
  - POST /api/fixtures/filter → { fixtures: Array<Record>, count: number, filters_applied: {...} }
  - POST /api/fixtures/export → { message: string, filename: string, path: string }
- Request/response rules
  - JSON-only; use application/json for bodies
  - On errors, return { error: string } with appropriate status codes (4xx/5xx)
  - CORS is enabled for dev usage with the React app
- Data schema expectations (simplified fixtures)
  - Columns typically include: league, season, date, home_team, away_team, home_score, away_score, match_report
  - API converts NaN to null for cleaner JSON
- Backward compatibility
  - If the schema changes, update: scrapers producing CSVs → api.py readers → frontend consumers → tests/docs


5) Data Management
- Directories and files
  - All generated data lives in data/ (git-ignored). Do not commit data files
  - Comprehensive CSV: comprehensive_fixtures_{SEASON}_{timestamp}.csv
  - Simplified CSV (API source of truth): fixtures_{SEASON}_simplified.csv
- Writing data
  - Ensure data/ exists before writing
  - Prefer timestamped files for comprehensive outputs; keep a single simplified snapshot per season for API
- Reading data
  - API should select the most recent fixtures_*_simplified.csv when multiple exist
- Retention and cleanup
  - Periodically prune old comprehensive files if disk space becomes a concern
  - Keep at least the latest simplified CSV per season used by the UI


6) Error Handling and Observability
- Scrapers
  - Wrap network/parse operations with try/except; on errors, print context and stack traces (during dev)
  - Validate expected columns before writing simplified outputs; fail fast with clear messages
- API
  - Always guard file I/O and parsing; respond with JSON error payloads
  - Convert pandas NaN to null in JSON responses
- Frontend
  - Show user-friendly messages for loading, success, and error states
  - Log concise diagnostics (lengths of arrays, filter effects) for debugging


7) Testing and Quality Assurance
- Fast checks
  - Run simple scripts and API locally; ensure endpoints return 200 and valid JSON
- Tests in repo
  - Use test_filtering.py and test_react_filtering.py for sanity checks when changed areas are involved
  - Keep tests lightweight and deterministic; add a small test when you change public behavior
- Manual verification
  - After scraper changes, verify a small sample of rows and columns exist as expected
  - In UI, verify filters (league/team/date) and export function on a small dataset


8) Security, Privacy, and Secrets
- Secrets
  - Never commit secrets. Copy .env.example to .env and keep .env out of Git (already ignored)
  - Access secrets via environment variables in code; do not print or log them
- CORS and exposure
  - Keep API scoped to necessary endpoints under /api/
  - Avoid adding endpoints that expose filesystem paths or arbitrary file reads
- Dependencies
  - Only add well-known libraries; pin versions in requirements.txt and frontend/package.json


9) Performance and Scalability
- Scraping
  - Respect source rate limits; avoid rapid loops. If expanding scraping, consider adding polite delays/retries
  - Scope requested leagues/seasons to what is needed
- Data size
  - Favor simplified fixtures for API/UI to reduce payload size
  - If response size grows large, consider adding server-side filtering and pagination endpoints
- Frontend
  - Client-side filtering is fine for moderate datasets; if it becomes slow, move filtering to API with pagination


10) Operations: Runbooks and Maintenance
- Common run commands
  ```bash path=null start=null
  # API
  python run.py api

  # Frontend
  cd frontend && npm start

  # Weekly refresh
  python run.py weekly

  # Comprehensive refresh
  python run.py comprehensive
  ```
- Data freshness
  - Weekly fixtures: run weekly_fixtures.py for Fri–Mon data
  - Comprehensive: run comprehensive_fixtures.py when you need a full-season refresh
- Monitoring
  - Watch disk usage of data/
  - On failures, check console logs and stack traces; validate CSV columns


11) Extension and Contribution Guidelines
- Adding a new scraper
  - Place in scripts/, follow patterns in comprehensive_fixtures.py
  - Expose a constant LEAGUES or config at the top; keep SEASON configurable
  - Produce a timestamped comprehensive CSV and, if appropriate, a simplified CSV compatible with API expectations
- Extending the API
  - Add routes under /api/ in api.py; keep JSON shapes consistent and documented
  - Return clear errors; add minimal tests if possible
- Frontend changes
  - Keep fetching via /api/... and rely on dev proxy
  - Preserve existing state flow; consider small components if complexity grows
- Documentation
  - Update README.md, docs/user_guide.md, and this RULES.md when changing visible behavior or data shape


12) Backward and Cross-File Consistency
- If you change the fixture schema
  - Update: scripts outputs → api.py readers and JSON conversion → frontend accessors (properties like league, date, home_team, etc.) → tests → docs
  - Avoid breaking field names without also updating consumers


13) Ethical Use and Legal Considerations
- Respect the data source’s terms of service
- Be considerate with scraping frequency and volume
- Attribute sources where appropriate in documentation


14) Common Pitfalls and Fixes
- Frontend gets HTML instead of JSON
  - Ensure frontend/package.json has proxy set to http://localhost:5000; restart dev server
- API returns no fixtures
  - Ensure at least one fixtures_*_simplified.csv exists in data/ (run a scraper)
- Date comparisons
  - Frontend compares YYYY-MM-DD strings lexically; ensure date fields are formatted like 2025-09-07
- NaN values in JSON
  - API converts NaN to null; ensure new fields also go through this conversion


15) Version Control Practices
- Commit small, focused changes with descriptive messages
- Do not commit data/, .env, node_modules/, or virtualenvs (already covered in .gitignore)
- If introducing new dependencies, pin versions and explain why in the PR/commit body


16) Contact and Ownership
- Primary entry points: api.py, run.py, scripts/ and frontend/src/App.js
- See .github/copilot-instructions.md for additional guidance aimed at AI assistants working on this repo

