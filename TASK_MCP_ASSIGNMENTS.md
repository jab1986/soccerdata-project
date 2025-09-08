# Task-Specific MCP Server Assignments

This document outlines which MCP servers each task should use for optimal execution in the 5-agent parallel workflow.

## 🔍 Data Integration Agent Tasks

### DS-01: Data Pipeline Audit
**MCP Servers**: `filesystem`, `fetch`, `time`
- **filesystem**: Read/write CSV files in `data/` directory
- **fetch**: Test web scraping endpoints and data sources
- **time**: Handle match dates and scheduling validation

**Usage Examples**:
```bash
# Use filesystem to check CSV files
# Use fetch to validate scraper endpoints
# Use time to verify date formats
```

### DS-02: Data Validation System  
**MCP Servers**: `filesystem`, `sqlite`, `sequential-thinking`
- **filesystem**: Create and manage validation scripts in `scripts/`
- **sqlite**: Store validation results and data quality metrics
- **sequential-thinking**: Complex analysis of data patterns and anomalies

### DS-03: Error Handling Enhancement
**MCP Servers**: `filesystem`, `fetch`, `time`, `sequential-thinking`
- **filesystem**: Update scraper files with error handling
- **fetch**: Test retry mechanisms and network failure scenarios
- **time**: Implement timeout and scheduling logic
- **sequential-thinking**: Design robust error recovery strategies

---

## ⚙️ Betting System API Agent Tasks

### BA-01: API Reliability Audit
**MCP Servers**: `fetch`, `sqlite`, `filesystem`
- **fetch**: Test all API endpoints with various payloads
- **sqlite**: Verify database connections and query performance
- **filesystem**: Check API logs and configuration files

### BA-02: Enhanced Error Responses
**MCP Servers**: `sqlite`, `filesystem`, `sequential-thinking`
- **sqlite**: Store and analyze error patterns
- **filesystem**: Update API code with standardized error handling
- **sequential-thinking**: Design comprehensive error categorization system

---

## 🎨 Frontend Development Tasks

### FE-01: UI/UX Audit
**MCP Servers**: `filesystem`, `fetch`, `interactive`
- **filesystem**: Update frontend components and CSS files
- **fetch**: Test API integrations from frontend
- **interactive**: Gather user feedback and testing workflows

### FE-02: Responsive Design Implementation
**MCP Servers**: `filesystem`, `interactive`, `time`
- **filesystem**: Modify CSS and component files
- **interactive**: Test responsive design across viewports
- **time**: Schedule mobile testing sessions

---

## 🎯 Core Betting Features

### FB-01: Betting Interface Implementation
**MCP Servers**: `filesystem`, `sqlite`, `fetch`, `interactive`
- **filesystem**: Create new React components and update API files
- **sqlite**: Design and populate betting database tables
- **fetch**: Test API endpoints for bet placement
- **interactive**: Design user interaction workflows

### FB-02: Results Processing System
**MCP Servers**: `sqlite`, `filesystem`, `time`, `sequential-thinking`
- **sqlite**: Handle bet resolution and points calculation
- **filesystem**: Create results entry components and calculation scripts
- **time**: Handle match result timing and deadlines
- **sequential-thinking**: Design complex bet resolution algorithms

### FB-03: Standings Display
**MCP Servers**: `sqlite`, `filesystem`, `fetch`
- **sqlite**: Query and calculate league standings
- **filesystem**: Create standings display components
- **fetch**: Test standings API endpoints

### FB-04: Admin Workflow Optimization
**MCP Servers**: `interactive`, `filesystem`, `sqlite`, `time`
- **interactive**: Design efficient admin workflows and prompts
- **filesystem**: Create admin dashboard and WhatsApp parsing tools
- **sqlite**: Optimize database operations for admin tasks
- **time**: Schedule and track admin workflow efficiency

---

## 🧪 Integration Testing Tasks

### IT-01: End-to-End Testing
**MCP Servers**: `fetch`, `sqlite`, `sequential-thinking`, `github`
- **fetch**: Test complete API workflows and data flow
- **sqlite**: Verify database state throughout testing
- **sequential-thinking**: Design comprehensive test scenarios
- **github**: Integration with CI/CD testing workflows

### IT-02: Mobile Responsiveness Testing
**MCP Servers**: `fetch`, `interactive`, `filesystem`
- **fetch**: Test API responsiveness on mobile connections
- **interactive**: Simulate mobile user interactions
- **filesystem**: Create automated mobile testing scripts

---

## 🔧 System Integration Tasks

### General System Integration
**MCP Servers**: `github`, `filesystem`, `sqlite`, `fetch`
- **github**: Version control, branching, and deployment
- **filesystem**: File system operations and configuration management
- **sqlite**: Database administration and backup procedures
- **fetch**: Health checks and service monitoring

---

## MCP Server Usage Patterns

### Primary Usage by Agent Type

| Agent | Primary Servers | Secondary Servers | Purpose |
|-------|----------------|------------------|---------|
| **Data Integration** | filesystem, fetch, sqlite, time | sequential-thinking | Data pipeline management |
| **Betting System API** | sqlite, fetch, filesystem | time, sequential-thinking | Backend service development |
| **Betting Club UI** | filesystem, interactive, fetch | sqlite | Frontend development |
| **Integration Testing** | fetch, interactive, sequential-thinking | sqlite, filesystem, github | Quality assurance |
| **System Integration** | github, filesystem, sqlite | fetch, time | DevOps and deployment |

### Server-Specific Capabilities

#### `filesystem` Server
- Read/write files in project directory
- Create/modify components, scripts, configurations
- Manage CSV data files and logs
- **Security**: Limited to project directory only

#### `sqlite` Server  
- Database operations on `betting_club.db`
- Query execution and schema management
- Data integrity and transaction handling
- **Note**: Automatically creates database if not exists

#### `fetch` Server
- HTTP requests and web scraping
- API endpoint testing
- External data source integration
- **Rate Limiting**: Respects robots.txt and implements delays

#### `github` Server
- Repository management and version control
- Issue tracking and pull request management
- CI/CD integration and deployment
- **Requires**: GITHUB_PERSONAL_ACCESS_TOKEN environment variable

#### `time` Server
- Date/time utilities and timezone conversion
- Match scheduling and deadline management
- Timestamp generation for data files
- **Features**: Supports multiple timezone formats

#### `sequential-thinking` Server
- Complex problem-solving and analysis
- Multi-step reasoning for algorithms
- Design pattern recommendations
- **Best For**: Architecture decisions and complex logic

#### `interactive` Server
- User prompt and confirmation workflows
- Admin efficiency optimization
- Interactive testing and validation
- **Features**: Clipboard integration and notifications

---

## Environment Setup Checklist

Before starting tasks, ensure these MCP servers are accessible:

- [ ] **shrimp-task-manager**: Local task management
- [ ] **filesystem**: Project file operations
- [ ] **sqlite**: Betting database operations
- [ ] **fetch**: Web scraping and API testing
- [ ] **github**: Version control (optional, needs token)
- [ ] **time**: Date/time utilities
- [ ] **sequential-thinking**: Complex reasoning
- [ ] **interactive**: Admin workflow optimization

### Quick Setup Command
```bash
# Run the setup verification script
./setup-mcp-servers.sh

# If successful, start your agent workflow:
# Terminal 1: python run.py api
# Terminal 2: cd frontend && npm start  
# Terminal 3: cd mcp-shrimp-task-manager/tools/task-viewer && npm run start:all
```

---

## Task Execution Priority with MCP Usage

### Phase 1 (Foundation) - Parallel Execution
1. **DS-01** (filesystem, fetch, time) - Data pipeline validation
2. **BA-01** (fetch, sqlite, filesystem) - API reliability testing  
3. **FE-01** (filesystem, fetch, interactive) - UI/UX improvements

### Phase 2 (Build-up) - After Phase 1
1. **DS-02** (filesystem, sqlite, sequential-thinking) - Data validation
2. **DS-03** (filesystem, fetch, sequential-thinking) - Error handling
3. **BA-02** (sqlite, filesystem, sequential-thinking) - Enhanced API errors
4. **FE-02** (filesystem, interactive, time) - Responsive design

### Phase 3 (Core Features) - Sequential Dependencies
1. **FB-01** (filesystem, sqlite, fetch, interactive) - Betting interface
2. **FB-02** (sqlite, filesystem, time, sequential-thinking) - Results processing
3. **FB-03** (sqlite, filesystem, fetch) - Standings display
4. **FB-04** (interactive, filesystem, sqlite, time) - Admin optimization

### Phase 4 (Validation) - Final Testing
1. **IT-01** (fetch, sqlite, sequential-thinking, github) - End-to-end testing
2. **IT-02** (fetch, interactive, filesystem) - Mobile testing

This structure ensures each agent has access to the appropriate MCP servers for their specific tasks while maintaining the parallel execution capabilities of the 5-agent workflow.
