# Warp Agent Mode MCP Server Assignments

## MCP Servers for Betting Club Project

### Selected MCP Servers (8 total - all verified working ✅)

1. **sqlite** - Database operations for betting club data (mcp-server-sqlite-npx)
2. **filesystem** - File operations for CSV data and frontend assets  
3. **fetch** - Web scraping for match results and API calls (mcp-server-fetch-typescript)
4. **github** - Version control and repository management
5. **time** - Time utilities for match scheduling and betting deadlines (time-mcp)
6. **sequential-thinking** - Complex problem solving and multi-step planning
7. **interactive** - Interactive workflows for admin efficiency (interactive-mcp-enhanced)
8. **shrimp-task-manager** - Intelligent project task management with persistent memory

---

## Agent-Specific MCP Assignments

### 🔍 **Data Integration Agent**
**Primary MCP Servers:**
- `sqlite` - Store and retrieve scraped match data
- `fetch` - Scrape match results from FBref.com
- `filesystem` - Read/write CSV files in data/ directory
- `time` - Handle match times, timezone conversions

**Use Cases:**
- Update match results from web scraping
- Convert scraped data to betting system format
- Validate data integrity across CSV and database
- Schedule automatic result updates

### ⚙️ **Betting System API Agent**  
**Primary MCP Servers:**
- `sqlite` - CRUD operations for bets, players, league table
- `time` - Handle betting deadlines, match scheduling
- `sequential-thinking` - Complex betting logic and calculations

**Secondary:**
- `fetch` - API health checks and external integrations
- `interactive` - Admin workflow prompts and confirmations

**Use Cases:**
- Create and manage betting database schema
- Process bet entries from admin interface (via interactive prompts)
- Calculate league table positions and points (using sequential thinking)
- Handle betting deadlines and match windows
- Multi-step betting workflow validation

### 🎨 **Betting Club UI Agent**
**Primary MCP Servers:**
- `interactive` - Admin interface workflows and user prompts (enhanced version)
- `filesystem` - Frontend file operations, component management
- `sequential-thinking` - UI logic planning and component architecture

**Secondary:**
- `fetch` - Data fetching for UI components
- `github` - Component version control and collaboration

**Use Cases:**
- Create mobile-first responsive components with interactive feedback
- Manage admin workflow efficiency (<10 minutes) via enhanced prompts
- Handle file operations for React/TypeScript development
- Build component architecture using sequential thinking
- Interactive clipboard support for admin efficiency

### 🧦 **Integration Testing Agent**
**Primary MCP Servers:**
- `fetch` - API endpoint testing and validation
- `interactive` - Interactive testing workflows with enhanced prompts
- `github` - CI/CD integration and automated testing
- `sequential-thinking` - Multi-step test planning and execution

**Secondary:**
- `sqlite` - Database validation
- `filesystem` - Test file management

**Use Cases:**
- Test complete betting workflow end-to-end
- Validate mobile responsiveness
- Run automated API tests
- Integrate with GitHub Actions for CI/CD

### 🔧 **System Integration Agent**
**Primary MCP Servers:**
- `github` - Repository management, issue tracking, deployments
- `filesystem` - System file operations, configuration management
- `shrimp-task-manager` - Project task planning and dependency tracking

**Secondary:**
- `sqlite` - Database administration
- `fetch` - Health checks and monitoring
- `sequential-thinking` - Complex system integration planning

**Use Cases:**
- Manage version control and deployments
- Configure production environment
- Handle system integration and monitoring
- Coordinate database backups and maintenance

---

## How to Configure in Warp

### Step 1: Install MCP Servers
```bash
# These will be auto-installed when first used by agents
# ✅ CORRECTED PACKAGE NAMES - All verified working
npm install -g mcp-server-sqlite-npx  # Fixed: was @modelcontextprotocol/server-sqlite
npm install -g @modelcontextprotocol/server-filesystem  
npm install -g mcp-server-fetch-typescript  # Fixed: was @modelcontextprotocol/server-fetch
npm install -g @modelcontextprotocol/server-github
npm install -g time-mcp  # Fixed: was @theobrigitte/mcp-time
npm install -g @modelcontextprotocol/server-sequential-thinking  # Added
npm install -g interactive-mcp-enhanced  # Enhanced version with better features
# Removed: WhatsApp server (invite-only)
```

### Step 2: Configure in Warp Settings
1. Go to `Warp Settings > AI > Agents > MCP Servers`
2. Add each server with the configurations from `warp-mcp-setup-guide.txt`
3. Set environment variables as needed

### Step 3: Assign to Agent Profiles
1. Go to `Warp Settings > AI > Agents > Permissions`  
2. For each agent profile, configure MCP server access:
   - **MCP allowlist**: Add the agent's primary servers
   - **MCP denylist**: Leave empty or add servers not relevant to that agent

### Step 4: Test MCP Integration
```bash
# In each agent pane, test MCP connectivity
# Data Integration Agent pane:
# Should have access to sqlite, fetch, filesystem, time

# Betting System API Agent pane:  
# Should have access to sqlite, time, sequential-thinking, interactive

# Betting Club UI Agent pane:
# Should have access to interactive, filesystem, sequential-thinking

# Integration Testing Agent pane:
# Should have access to fetch, interactive, github, sequential-thinking

# System Integration Agent pane:
# Should have access to github, filesystem, sqlite
```

---

## MCP Server Benefits for Betting Club

### **sqlite MCP**
- ✅ Perfect for betting club database (local, no auth required)
- ✅ CRUD operations for bets, players, standings
- ✅ Schema management and migrations
- ✅ Query building and data validation

### **filesystem MCP**  
- ✅ CSV data management for scraped fixtures
- ✅ Frontend asset management (React components, CSS)
- ✅ Configuration file handling
- ✅ File watching for automatic updates

### **fetch MCP**
- ✅ Web scraping match results from FBref.com
- ✅ API health checks and monitoring
- ✅ External service integrations
- ✅ HTTP request debugging and testing

### **github MCP**
- ✅ Version control for betting club codebase
- ✅ Issue tracking for bugs and features
- ✅ Pull request management
- ✅ CI/CD pipeline integration

### **time MCP**
- ✅ Match scheduling with timezone handling
- ✅ Betting deadline calculations
- ✅ Time-based triggers for automated updates
- ✅ Date formatting for different regions

### **sequential-thinking MCP** ✨ NEW
- ✅ Complex multi-step problem solving and planning
- ✅ Betting logic calculations and validation
- ✅ Component architecture planning
- ✅ Test strategy development and execution
- ✅ Step-by-step workflow optimization

### **interactive MCP** (Enhanced Version)
- ✅ Admin interface workflows with enhanced UX
- ✅ User prompt handling with clipboard support
- ✅ Interactive testing and debugging with notifications
- ✅ Streamlined user experience flows
- ✅ Auto-pause countdown timers and sound alerts

---

## Usage Examples

### Data Integration Agent with MCP
```bash
# Use fetch MCP to scrape latest results
# Use sqlite MCP to update match results
# Use filesystem MCP to update CSV files
# Use time MCP to handle match scheduling
```

### Betting System API Agent with MCP  
```bash
# Use sqlite MCP for database operations
# Use sequential-thinking MCP for complex betting calculations
# Use time MCP for deadline calculations
# Use interactive MCP for admin confirmations
```

### Betting Club UI Agent with MCP
```bash
# Use interactive MCP (enhanced) for admin workflows with clipboard support
# Use filesystem MCP for component management
# Use sequential-thinking MCP for component architecture planning
# Use github MCP for version control
```

### Integration Testing Agent with MCP
```bash
# Use fetch MCP for API endpoint testing
# Use interactive MCP for test workflow prompts
# Use sequential-thinking MCP for test strategy planning
# Use github MCP for CI/CD integration
```

## ✅ **UPDATED MCP STACK - All Verified Working (2025-09-07)**

This MCP setup gives each agent specialized tools while avoiding complexity and overlap. Key improvements:

**✨ Added:**
- `sequential-thinking` - Multi-step problem solving and planning
- `interactive-mcp-enhanced` - Better UX with clipboard, notifications, auto-pause

**🔧 Fixed Package Names:**
- `mcp-server-sqlite-npx` (was @modelcontextprotocol/server-sqlite)
- `mcp-server-fetch-typescript` (was @modelcontextprotocol/server-fetch) 
- `time-mcp` (was @theobrigitte/mcp-time)

**❌ Removed:**
- WhatsApp MCP (invite-only, not publicly available)

The focus remains on core betting club functionality: data integration, betting management, mobile UI, testing, and deployment - now with enhanced interactive capabilities and complex problem-solving support.
