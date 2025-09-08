# Exact Warp Agent Settings Configuration - Betting Club Edition

Copy these exact settings into Warp's `Settings > AI > Agents > Permissions` for each specialized agent focused on building the complete betting club management system.

## Agent 1: Data Integration Agent

**Agent Name**: `Data Integration Specialist`

**Description**: `Bridges soccer data scraping with betting club system - handles fixtures, results, and data pipeline integration for the betting platform`

**Command Permissions**:

**Auto-approve commands**:
```
python run.py comprehensive
python run.py weekly  
python run.py season
python scripts/comprehensive_fixtures.py
python scripts/weekly_fixtures.py
python scripts/scraper.py
python scripts/update_results.py
ls -la data/
head -n * data/*.csv
tail -n * data/*.csv
wc -l data/*.csv
du -sh data/
mkdir -p data
source soccerdata_venv/bin/activate
pip list
find data/ -name "*.csv"
cat data/*.csv
grep -i "completed\|final\|result" data/*.csv
diff data/*.csv
```

**Require approval**:
```
rm data/*
rm -rf data/
pip install *
pip uninstall *
python -m pip install *
```

**Deny**:
```
rm -rf /
sudo *
chmod 777 *
```

**File Permissions**:
- **Auto-approve file operations**: Read/write in `/home/joe/soccerdata_project/data/`, Read in `/home/joe/soccerdata_project/scripts/`
- **Require approval**: Write to `/home/joe/soccerdata_project/scripts/`, Write to `/home/joe/soccerdata_project/*.py`
- **Deny**: Operations outside `/home/joe/soccerdata_project/`

---

## Agent 2: Betting System API Agent

**Agent Name**: `Betting System Backend`

**Description**: `Builds and manages betting club API - handles bets, players, league calculations, and WhatsApp integration backend for the betting platform`

**Command Permissions**:

**Auto-approve commands**:
```
python run.py api
python api.py
curl -X GET http://localhost:5000/api/fixtures
curl -X GET http://localhost:5000/api/betting-data
curl -X GET http://localhost:5000/api/betting/bets
curl -X GET http://localhost:5000/api/betting/standings
curl -X GET http://localhost:5000/api/betting/players
curl -X POST http://localhost:5000/api/betting/bets
python test_filtering.py
python test_betting_api.py
source soccerdata_venv/bin/activate
lsof -i :5000
ps aux | grep python
kill -9 *python*
netstat -tlnp | grep :5000
sqlite3 *.db
```

**Require approval**:
```
pip install *
pip uninstall *
python -m pip install *
sudo lsof -i :5000
```

**Deny**:
```
sudo *
rm -rf /
chmod 777 *
```

**File Permissions**:
- **Auto-approve file operations**: Read/write in `/home/joe/soccerdata_project/api.py`, Read in `/home/joe/soccerdata_project/data/`, Read/write in `/home/joe/soccerdata_project/test_*.py`
- **Require approval**: Write to `/home/joe/soccerdata_project/requirements.txt`
- **Deny**: Operations outside `/home/joe/soccerdata_project/`

---

## Agent 3: Betting Club UI Agent

**Agent Name**: `Betting Club Interface`

**Description**: `Builds mobile-first betting club dashboard with TypeScript + Tailwind - creates public league table, admin interface, and WhatsApp integration tools`

**Command Permissions**:

**Auto-approve commands**:
```
cd frontend
npm install
npm start
npm run build
npm test
npm install @types/react @types/node
npm install tailwindcss @tailwindcss/forms
npx tailwindcss init
python test_react_filtering.py
python test_betting_ui.py
python create_debug.py
lsof -i :3000
ps aux | grep node
kill -9 *node*
netstat -tlnp | grep :3000
```

**Require approval**:
```
npm install --save *
npm uninstall *
npm update *
rm -rf node_modules
```

**Deny**:
```
sudo *
rm -rf /
npm install -g *
```

**File Permissions**:
- **Auto-approve file operations**: Read/write in `/home/joe/soccerdata_project/frontend/src/`, Read/write in `/home/joe/soccerdata_project/frontend/public/`, Read in `/home/joe/soccerdata_project/frontend/package.json`
- **Require approval**: Write to `/home/joe/soccerdata_project/frontend/package.json`
- **Deny**: Operations outside `/home/joe/soccerdata_project/frontend/`

---

## Agent 4: Integration Testing Agent

**Agent Name**: `Betting Club QA Specialist`

**Description**: `Tests complete betting club workflow from fixtures to standings - validates mobile responsiveness, data integrity, and end-to-end betting flow`

**Command Permissions**:

**Auto-approve commands**:
```
python test_filtering.py
python test_react_filtering.py
python test_betting_integration.py
python test_mobile_responsiveness.py
python create_debug.py
python -m py_compile *.py
python -m py_compile scripts/*.py
find . -name "*.py" -exec python -m py_compile {} \;
head -n 10 *.csv
wc -l data/*.csv
diff data/*.csv
curl -s http://localhost:5000/api/betting/standings | jq
curl -s http://localhost:3000 | grep -i "league\|bet\|standings"
npm run test -- --coverage
```

**Require approval**:
```
rm test_*
rm debug_*
pip install *
```

**Deny**:
```
sudo *
rm -rf /
chmod 777 *
```

**File Permissions**:
- **Auto-approve file operations**: Read all files in `/home/joe/soccerdata_project/`, Write to `/home/joe/soccerdata_project/debug_*`, Write to `/home/joe/soccerdata_project/test_*`
- **Require approval**: Write to `/home/joe/soccerdata_project/*.py` (except test and debug files)
- **Deny**: Operations outside `/home/joe/soccerdata_project/`

---

## Agent 5: System Integration Agent

**Agent Name**: `Betting Club Systems`

**Description**: `Integrates complete betting club system - handles deployment, database management, and production setup for the unified scraper + betting platform`

**Command Permissions**:

**Auto-approve commands**:
```
source soccerdata_venv/bin/activate
pip list
pip list --outdated
git status
git log --oneline -10
git diff
git add .
git branch
cp .env.example .env
du -sh *
df -h
ls -la
find . -name "*.log"
sqlite3 betting_club.db ".schema"
sqlite3 betting_club.db "SELECT * FROM players LIMIT 5;"
docker --version
docker-compose --version
```

**Require approval**:
```
git commit -m *
git push *
git pull *
pip install *
pip uninstall *
rm -rf data/*
rm .env
```

**Deny**:
```
sudo *
rm -rf /
git reset --hard HEAD~*
git force-push *
```

**File Permissions**:
- **Auto-approve file operations**: Read all files in `/home/joe/soccerdata_project/`, Write to `/home/joe/soccerdata_project/.env`
- **Require approval**: Write to `/home/joe/soccerdata_project/requirements.txt`, Write to `/home/joe/soccerdata_project/.gitignore`
- **Deny**: Operations outside `/home/joe/soccerdata_project/`

---

## Global Settings to Configure

**In `Settings > AI > Agents > General`**:
- **Default working directory**: `/home/joe/soccerdata_project`
- **Enable agent notifications**: `True`
- **Show agent status in tabs**: `True`
- **Auto-start agent management panel**: `False` (to avoid clutter)

**Environment Variables** (add to each agent):
```
PYTHONPATH=/home/joe/soccerdata_project
NODE_ENV=development
PROJECT_ROOT=/home/joe/soccerdata_project
BETTING_CLUB_MODE=development
DATABASE_URL=sqlite:///betting_club.db
ADMIN_MODE=true
MOBILE_FIRST=true
```

---

## How to Apply These Settings

1. **Open Warp Settings**: `Cmd/Ctrl + ,` → `AI` → `Agents` → `Permissions`

2. **Create each agent**:
   - Click "Add Agent Profile"
   - Copy the exact name and description
   - Paste command patterns into respective sections
   - Set file permission paths exactly as specified

3. **Test each agent**:
   - Open a new terminal pane
   - Select the agent profile
   - Try a simple auto-approved command to verify settings

4. **Adjust as needed**:
   - If an agent requests approval for something that should be auto-approved, add it to the auto-approve list
   - If an agent does something risky without asking, move it to require-approval

---

## Usage Notes

- **Command patterns support wildcards**: `*` matches any characters
- **File paths must be absolute**: Use full paths starting with `/home/joe/`
- **Agent selection**: Choose the appropriate agent before starting tasks
- **Monitor via panel**: Use the Agent Management Panel to track all agents
- **Permissions are cumulative**: More specific patterns override general ones
- **Mobile-first priority**: All agents should prioritize mobile responsiveness
- **Admin efficiency focus**: Optimize for <10 minute weekly updates
- **WhatsApp integration**: Consider WhatsApp message parsing in relevant tasks
- **Open access principle**: No authentication/login requirements in any component
- **Bold sports design**: Use black (#000000), red (#DC2626), yellow (#FBBF24) colors
