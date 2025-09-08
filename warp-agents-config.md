# Warp Agent Configurations for Soccer Data Scraper Project

This document outlines specialized agent configurations designed for the soccer data scraper project's specific workflows and tasks.

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

---

## Agent 2: Backend API Agent
**Purpose**: Manage Flask API development, testing, and debugging

**Specialized Tasks**:
- Start/stop API server
- Test API endpoints and responses
- Debug CORS and proxy issues
- Monitor API performance
- Handle database/CSV data integration

**Key Commands**:
```bash
# API operations
python run.py api
curl -X GET http://localhost:5000/api/fixtures
python test_filtering.py

# Development workflow
source soccerdata_venv/bin/activate
pip install -r requirements.txt
```

**Autonomy Settings**:
- Allow automatic API server startup/shutdown
- Require approval for dependency updates
- Allow port and network configuration changes
- Allow file modifications in `api.py` with review

**Error Handling**:
- Automatically restart API server on crashes
- Validate JSON responses and error codes
- Check for missing CSV files and suggest fixes
- Monitor memory usage and API response times

---

## Agent 3: Frontend Development Agent
**Purpose**: Handle React development, UI improvements, and frontend testing

**Specialized Tasks**:
- Start/stop React development server
- Manage npm dependencies and builds
- Debug proxy configuration issues
- Test UI filtering and export functionality
- Handle CSS and component updates

**Key Commands**:
```bash
# Frontend operations
cd frontend
npm install
npm start
npm run build

# Testing and debugging
python test_react_filtering.py
python create_debug.py
```

**Autonomy Settings**:
- Allow automatic npm install and development server startup
- Require approval for package.json changes
- Allow CSS and component file modifications
- Allow proxy configuration updates

**Error Handling**:
- Automatically resolve common proxy issues
- Check for missing dependencies and install them
- Validate React build process
- Monitor for console errors and fix common issues

---

## Agent 4: Testing & Quality Agent
**Purpose**: Run tests, validate code quality, and ensure project integrity

**Specialized Tasks**:
- Execute all test suites automatically
- Validate data integrity and API contracts
- Check code style and standards compliance
- Generate debug reports and diagnostics
- Monitor for common issues and anti-patterns

**Key Commands**:
```bash
# Testing operations
python test_filtering.py
python test_react_filtering.py
python create_debug.py

# Quality checks
find . -name "*.py" -exec python -m py_compile {} \;
```

**Autonomy Settings**:
- Allow automatic execution of all tests
- Allow creation of debug files and reports
- Require approval for test modifications
- Allow read-only access to all project files

**Error Handling**:
- Generate comprehensive error reports
- Suggest fixes for common test failures
- Validate data schema consistency
- Check for breaking changes across components

---

## Agent 5: DevOps & Maintenance Agent
**Purpose**: Handle deployment, maintenance, and operational tasks

**Specialized Tasks**:
- Monitor project health and dependencies
- Handle environment setup and configuration
- Manage virtual environments and secrets
- Perform routine maintenance tasks
- Handle git operations and version control

**Key Commands**:
```bash
# Environment management
source soccerdata_venv/bin/activate
pip list --outdated
cp .env.example .env

# Maintenance
git status
git add . && git commit -m "..."
du -sh data/
```

**Autonomy Settings**:
- Allow environment variable management
- Require approval for dependency updates
- Allow git operations with confirmation
- Allow cleanup operations with size limits

**Error Handling**:
- Automatically detect and fix common environment issues
- Monitor for security vulnerabilities
- Check for disk space and performance issues
- Validate git repository health

---

## Multi-Agent Workflow Examples

### Full Development Cycle
1. **Data Scraper Agent**: Refreshes data with `python run.py comprehensive`
2. **Backend API Agent**: Starts API server and validates endpoints
3. **Frontend Development Agent**: Starts React dev server and tests UI
4. **Testing & Quality Agent**: Runs full test suite and validates integration
5. **DevOps & Maintenance Agent**: Commits changes and monitors system health

### Debug Workflow
1. **Testing & Quality Agent**: Identifies failing tests or issues
2. **Backend API Agent**: Investigates API-related problems
3. **Frontend Development Agent**: Checks for UI/proxy issues
4. **Data Scraper Agent**: Validates data integrity and format
5. **DevOps & Maintenance Agent**: Reviews logs and system status

### Data Refresh Workflow
1. **Data Scraper Agent**: Runs weekly or comprehensive scraping
2. **Testing & Quality Agent**: Validates new data structure and quality
3. **Backend API Agent**: Tests API with new data
4. **Frontend Development Agent**: Verifies UI still works with new data
5. **DevOps & Maintenance Agent**: Commits data updates if needed

---

## Agent Configuration Template

For each agent, configure in Warp settings (`Settings > AI > Agents > Permissions`):

```yaml
name: "[Agent Name]"
description: "[Purpose and specialized tasks]"
permissions:
  auto_approve:
    - "command_patterns": ["python run.py *", "npm *", "cd *"]
    - "file_operations": ["read", "write_in_project"]
  require_approval:
    - "destructive_operations": true
    - "package_management": true
    - "network_changes": true
working_directory: "/home/joe/soccerdata_project"
environment_variables:
  - "PYTHONPATH=/home/joe/soccerdata_project"
  - "NODE_ENV=development"
```

---

## Benefits of This Multi-Agent Setup

1. **Specialized Expertise**: Each agent focuses on specific project areas
2. **Parallel Workflows**: Multiple agents can work simultaneously on different tasks
3. **Reduced Context Switching**: Agents maintain context within their domains
4. **Error Isolation**: Issues in one area don't affect other agents
5. **Comprehensive Coverage**: All aspects of the project are monitored and maintained

---

## Usage Tips

- Use the **Agent Management Panel** to monitor all agents simultaneously
- Set up notifications for critical tasks (data scraping failures, API errors)
- Configure autonomy levels based on your comfort with automated operations
- Use multiple terminal panes to run agents in parallel
- Regularly review agent logs and adjust configurations as needed
