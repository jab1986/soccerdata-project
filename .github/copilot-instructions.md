# Copilot instructions for this repository

This repo is a small full-stack app:
- Backend: Flask API in `api.py` (port 5000)
- Frontend: React app in `frontend/` (dev server on port 3000) with a dev proxy to the API
- Data flow: Python scripts in `scripts/` write CSVs into `data/`, API reads the latest simplified CSV, frontend fetches fixtures and filters client-side
- Runner: `run.py` orchestrates common commands

Keep changes minimal and focused. Prefer small diffs and avoid unrelated refactors.

## What you can build or change
- Backend endpoints in `api.py` (fixtures fetch, filter, export)
- Frontend behavior and UI in `frontend/src/` (notably `App.js`, `App.css`)
- Scraper scripts in `scripts/` if data shape changes are needed
- Tests and diagnostics in root (`test_filtering.py`, `test_react_filtering.py`, `create_debug.py`)

If you add dependencies:
- Python: pin in `requirements.txt`
- Frontend: add to `frontend/package.json`

## How to run locally
- Backend (from repo root):
  - Activate venv (if needed): `source soccerdata_venv/bin/activate`
  - Start API: `python run.py api` (serves http://localhost:5000)
- Frontend:
  - `cd frontend && npm install && npm start` (opens http://localhost:3000)
  - Dev proxy is set to `http://localhost:5000` in `frontend/package.json` so `fetch('/api/...')` works in dev

Data files live in `data/` (ignored by Git). API reads the most recent `fixtures_*_simplified.csv`.

## API contract (current)
- GET `/api/fixtures`
  - Returns: `{ fixtures: Array<Record>, total_count: number, file: string }`
- POST `/api/fixtures/filter`
  - Body: `{ leagues?: string[], date_from?: string (YYYY-MM-DD), date_to?: string (YYYY-MM-DD), teams?: string[] }`
  - Returns: `{ fixtures: Array<Record>, count: number, filters_applied: {...} }`
- POST `/api/fixtures/export`
  - Body: `{ fixtures: Array<Record>, filename?: string }`
  - Returns: `{ message: string, filename: string, path: string }`

Note: The backend converts CSV rows using pandas, so field names must match the CSV headers (`league`, `date`, `home_team`, `away_team`, `home_score`, `away_score`, ...).

## Frontend behavior notes
- `App.js` loads all fixtures on mount via `fetch('/api/fixtures')`
- Filters are applied client-side over in-memory fixtures:
  - League filter: match `fixture.league`
  - Team filter: match `home_team` or `away_team`
  - Date filter: compares ISO strings `YYYY-MM-DD` (safe for lexical compare)
- Leagues are derived dynamically from data (no hardcoded list)
- Dev proxy must be present; otherwise `/api` calls may return HTML and cause JSON parse errors

## Common pitfalls and fixes
- “Unexpected token '<' … not valid JSON” in the frontend means the React dev server returned HTML for `/api/...`:
  - Ensure `frontend/package.json` has `"proxy": "http://localhost:5000"`
  - Restart the frontend after adding/updating the proxy
- No fixtures returned from API:
  - Ensure there’s at least one `fixtures_*_simplified.csv` in `data/` (run scrapers if needed)
- Browser automation on Linux may fail if Chrome isn’t installed; prefer API tests or point automation to an installed Chromium binary

## Tests and quick checks
- API/data shape: run `test_filtering.py` from repo root (ensures `fixtures` array and expected counts)
- Frontend/API linkage: `test_react_filtering.py` validates servers and structure
- Debug page: generate `debug_filtering.html` via `create_debug.py` to simulate client-side filtering

When you modify public behavior, add or update a small test when practical. Keep tests fast and local.

## Coding guidelines
- Keep edits small; don’t reformat unrelated files
- Avoid inventing paths or APIs; check existing code and data shape first
- Prefer relative fetch paths (`/api/...`) so the proxy handles dev routing
- Maintain pinned versions in manifests; avoid broad upgrades unless necessary
- Python: stick to current style in files; avoid global behavior changes
- React: keep state updates simple and traceable; log sparingly (existing console logs aid debugging)

## Data and persistence
- `data/` is in `.gitignore` and should not be committed
- Export endpoint writes to `data/` with provided or timestamped filename
- If changing CSV schema, update both the scrapers and `api.py` readers, and reflect in frontend and tests

## Runner (`run.py`)
- `python run.py api` — start API
- `python run.py weekly` — run weekly fixtures scraper
- `python run.py comprehensive` — run comprehensive fixtures scraper
- `python run.py frontend` — prints frontend setup instructions

## Safe extension points
- Add new API routes under `/api/...` in `api.py` with clear JSON shapes
- Extend frontend filters/UI in `App.js` without breaking existing state shape
- Add small utility modules in `frontend/src/` if complexity grows
- Add diagnostics in root or `docs/` for maintainers

## Quality gates before you’re done
- Backend runs without tracebacks; API endpoints respond (200) and JSON parses
- Frontend dev server starts; `/api/fixtures` loads and filters apply; no console errors
- Tests you touched run and pass
- No diff to `data/` or large reformat-only changes

If blocked by missing data or environment specifics, explain briefly and propose a local alternative (e.g., stub data or a minimal fixture CSV placed in `data/`).