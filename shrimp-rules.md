# Super Cool Betting Club - AI Agent Development Rules

## Project Transformation Overview

**Current State**: Soccer data scraper with React frontend and Flask backend
**Target State**: Super Cool Betting Club with core flow: fixtures → bets → results → standings
**Transition Strategy**: Gradually transform existing soccer infrastructure into betting club functionality

### Core Project Principles

- **Open Access**: No authentication required for any functionality
- **Admin Efficiency**: Weekly data updates must complete within 10 minutes
- **Mobile-First Design**: All UI components must be responsive and mobile-optimized
- **Reliability Focus**: Core flow must work consistently without failures
- **Single Admin Model**: One admin inputs data from WhatsApp, multiple players view data

## Architecture Standards

### Current Architecture
- **Backend**: Flask API in `api.py` (port 5000)
- **Frontend**: React app in `frontend/` (dev server port 3000) with proxy to backend
- **Data Pipeline**: Python scrapers in `scripts/` → CSV files in `data/` → API reads latest simplified CSV → Frontend filters client-side
- **Database**: SQLite `betting_club.db` for betting club features
- **Orchestration**: `run.py` provides CLI commands for API and scrapers

### Target Architecture
- **Frontend**: React + TypeScript + Tailwind CSS
- **Component Pattern**: Functional components with hooks only
- **State Management**: useState and useEffect hooks, no external state management
- **API Communication**: Fetch API with proper error handling

---

## Technology Migration Standards

### JavaScript to TypeScript Migration

- **Convert files**: `.js` → `.tsx` for components, `.js` → `.ts` for utilities
- **When converting component**: Must update import statements in parent components
- **Type definitions**: Create interfaces for all API response data
- **Props typing**: All component props must have TypeScript interfaces
- **Hooks typing**: Use typed versions of useState and useEffect

**File Update Chain for TS Migration**:
1. Convert component file (`.js` → `.tsx`)
2. Update import in parent component
3. Update any test files referencing the component
4. Add TypeScript configuration if first TS file

### CSS to Tailwind CSS Migration

- **Replace**: Custom CSS classes with Tailwind utility classes
- **Mobile-first**: Always use responsive prefixes (`sm:`, `md:`, `lg:`)
- **Color scheme**: Use consistent color palette across all components
- **Remove files**: Delete `.css` files after successful Tailwind conversion

**File Update Chain for Tailwind Migration**:
1. Install Tailwind CSS dependencies in `frontend/package.json`
2. Create/update `tailwind.config.js`
3. Update component files to use Tailwind classes
4. Remove corresponding `.css` file imports
5. Clean up unused CSS files

---

## Core Betting Club Flow Implementation

### 1. Fixtures Management

- **Current**: Soccer fixture scraping and filtering
- **Transform to**: Betting fixture creation and management
- **Key files**: `api.py` (fixtures endpoints), `frontend/src/App.js` (fixture display)
- **Admin function**: Upload fixture data from WhatsApp screenshots/text

### 2. Betting System (New Functionality)

- **Implementation priority**: HIGH
- **Requirements**: 
  - Players can view available fixtures
  - Players can place bets on fixtures
  - No authentication required (open access)
  - Simple bet types (winner, score, etc.)
- **New files needed**: 
  - `frontend/src/components/BettingInterface.tsx`
  - `api.py` bet management endpoints
  - Database tables for bets and players

### 3. Results Processing (New Functionality)

- **Implementation priority**: HIGH
- **Requirements**:
  - Admin enters results from WhatsApp
  - Automatic bet resolution
  - Points/scoring calculation
- **New files needed**:
  - `frontend/src/components/ResultsEntry.tsx` (admin only)
  - `scripts/calculate_standings.py`
  - Results processing endpoints in `api.py`

### 4. Standings Display (New Functionality)

- **Implementation priority**: MEDIUM
- **Requirements**:
  - League table showing player rankings
  - Points breakdown
  - Historical performance
- **New files needed**:
  - `frontend/src/components/Standings.tsx`
  - Standings calculation logic

## File Interaction Rules

### When modifying API endpoints in `api.py`:
- **MUST** update corresponding frontend fetch calls in `frontend/src/App.js`
- **MUST** test with `test_react_filtering.py` if filtering logic changes
- **MUST** ensure CORS remains enabled for React development

### When modifying scraper logic in `scripts/`:
- **MUST** update `run.py` if new CLI commands are needed
- **MUST** verify CSV output schema matches `api.py` expectations
- **MUST** test data loading with `test_filtering.py`

### When adding new dependencies:
- **MUST** update `requirements.txt` for Python packages
- **MUST** update `frontend/package.json` for React packages
- **MUST** pin exact versions in both files

## Naming Conventions

### Python Files (`api.py`, `run.py`, `scripts/`):
- Variables/functions: `snake_case`
- Constants: `UPPER_CASE`
- Files: `lowercase_with_underscores.py`

### React Files (`frontend/src/`):
- Components: `PascalCase`
- Hooks/utilities: `camelCase`
- Files: `PascalCase.js` for components, `camelCase.js` for utilities

## Data Pipeline Constraints

### CSV File Management:
- **MUST** write data only to `data/` directory
- **MUST** ensure `data/` directory exists before writing
- **MUST** use naming pattern: `comprehensive_fixtures_{SEASON}_{timestamp}.csv`
- **MUST** create simplified version: `fixtures_{SEASON}_simplified.csv`
- API reads most recent `fixtures_*_simplified.csv` file

### Database Schema:
- Standard columns: `league`, `season`, `date`, `home_team`, `away_team`, `home_score`, `away_score`, `match_report`
- Dates formatted as YYYY-MM-DD for lexical comparison
- League codes: 'ENG-Premier League', 'ESP-La Liga', etc.

## API Design Patterns

### Route Structure:
- All API routes **MUST** be under `/api/` prefix
- **MUST** return JSON with consistent error format: `{ error: string }`
- **MUST** use appropriate HTTP status codes
- **MUST** convert pandas NaN to null in JSON responses

### Current Endpoints:
- `GET /api/fixtures` → `{ fixtures: Array<Record>, total_count: number, file: string }`
- `POST /api/fixtures/filter` → `{ fixtures: Array<Record>, count: number, filters_applied: {...} }`
- `POST /api/fixtures/export` → `{ message: string, filename: string, path: string }`

## React Frontend Rules

### Component Structure:
- **MUST** use function components with hooks
- **MUST** keep UI logic in `App.js` unless complexity requires separation
- **MUST** derive filter options from loaded data - **NEVER** hardcode
- **MUST** use dev proxy with relative paths: `fetch('/api/fixtures')`

### Package.json Requirements:
- **MUST** maintain `"proxy": "http://localhost:5000"` for development
- **MUST** restart dev server if proxy configuration changes

## Error Handling Patterns

### Python (Scrapers/API):
- **MUST** wrap network/parse operations in try/except
- **MUST** print context and stack traces for debugging
- **MUST** return structured JSON errors from API

### React Frontend:
- **MUST** show user-friendly loading/success/error states
- **MUST** log concise diagnostics to console

## Testing Requirements

### Before modifying filtering logic:
- **MUST** run `python test_filtering.py`
- **MUST** run `python test_react_filtering.py`
- **MUST** verify CSV columns/rows after scraper changes

### After API changes:
- **MUST** test with curl or browser dev tools
- **MUST** verify CORS headers are present

## CLI Command Structure

### Available Commands via `run.py`:
- `python run.py api` - Start Flask API server
- `python run.py comprehensive` - Run full season scraper
- `python run.py weekly` - Run Friday-Monday fixtures scraper
- `python run.py frontend` - Display frontend setup instructions

## Betting Club Specific Rules

### Design Principles:
- **MUST** prioritize mobile-first responsive design
- **MUST** use bold sports colors: Black (#000000), Red (#DC2626), Yellow (#FBBF24)
- **MUST** maintain no authentication/login requirements
- **MUST** optimize for admin efficiency (<10 minutes weekly updates)

### User Access Patterns:
- Players: view-only access to league tables, stats, fixtures, bets
- Single admin: input data from WhatsApp
- **MUST** maintain public dashboard accessibility

## Prohibited Actions

- **NEVER** commit `data/`, `.env`, `node_modules/`, virtualenvs
- **NEVER** hardcode league/team lists in frontend - derive from data
- **NEVER** break React dev proxy - maintain port 5000 for API
- **NEVER** modify database schema without updating all dependent queries
- **NEVER** add authentication requirements - keep open access
- **NEVER** make unrelated refactors - focus on specific changes
- **NEVER** print/log secrets or sensitive data

## MCP Server Integration

### Active MCP Servers:
- `github` - Repository management
- `filesystem` - File operations within project
- `sqlite` - Database operations with `betting_club.db`
- `fetch` - Web scraping and HTTP requests
- `time` - Time utilities and scheduling
- `sequential-thinking` - Complex problem solving
- `interactive` - Admin workflows with notifications

### MCP Usage Rules:
- **MUST** use MCP sqlite server for database operations instead of raw SQL
- **MUST** use MCP filesystem tools for file management
- **MUST** leverage interactive MCP for admin efficiency workflows

## Decision Trees for Ambiguous Situations

### When adding new scraper functionality:
1. Add to `scripts/` directory
2. Follow `comprehensive_fixtures.py` pattern
3. Expose configurable LEAGUES/SEASON constants
4. Add CLI command to `run.py`
5. Update requirements.txt if new dependencies

### When modifying API responses:
1. Check if frontend depends on changed fields
2. Update frontend components if needed
3. Run both test files
4. Verify CORS still works
5. Update API documentation in this file

### When database schema changes:
1. Update betting_club.db schema
2. Update all related queries
3. Update frontend if UI displays affected data
4. Test admin workflows
5. Verify data migration if needed