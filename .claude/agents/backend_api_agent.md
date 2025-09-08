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
