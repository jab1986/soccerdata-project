#!/bin/bash

# MCP Server Setup and Verification Script for Super Cool Betting Club
# This script ensures all required MCP servers are available for task execution

set -e

echo "🦐 Super Cool Betting Club - MCP Server Setup"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to test MCP server availability
test_mcp_server() {
    local server_name="$1"
    local package_name="$2"
    
    echo -n "Testing $server_name... "
    
    if timeout 10s npx -y "$package_name" --help >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Available${NC}"
        return 0
    else
        echo -e "${RED}✗ Not available or timed out${NC}"
        return 1
    fi
}

echo -e "\n${BLUE}1. Checking prerequisites...${NC}"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "Node.js: ${GREEN}✓ $NODE_VERSION${NC}"
else
    echo -e "Node.js: ${RED}✗ Not installed${NC}"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "npm: ${GREEN}✓ $NPM_VERSION${NC}"
else
    echo -e "npm: ${RED}✗ Not installed${NC}"
    exit 1
fi

# Check npx
if command_exists npx; then
    echo -e "npx: ${GREEN}✓ Available${NC}"
else
    echo -e "npx: ${RED}✗ Not available${NC}"
    exit 1
fi

echo -e "\n${BLUE}2. Testing MCP server availability...${NC}"

# Test each MCP server
SERVERS_FAILED=0

# Shrimp Task Manager (local)
echo -n "Testing shrimp-task-manager (local)... "
if [ -f "/home/joe/soccerdata_project/mcp-shrimp-task-manager/dist/index.js" ]; then
    echo -e "${GREEN}✓ Available${NC}"
else
    echo -e "${RED}✗ Not built or not found${NC}"
    ((SERVERS_FAILED++))
fi

# Official MCP servers
test_mcp_server "filesystem" "@modelcontextprotocol/server-filesystem" || ((SERVERS_FAILED++))
test_mcp_server "sqlite" "@modelcontextprotocol/server-sqlite" || ((SERVERS_FAILED++))
test_mcp_server "fetch" "@modelcontextprotocol/server-fetch" || ((SERVERS_FAILED++))
test_mcp_server "github" "@modelcontextprotocol/server-github" || ((SERVERS_FAILED++))
test_mcp_server "sequential-thinking" "@modelcontextprotocol/server-sequential-thinking" || ((SERVERS_FAILED++))

# Third-party MCP servers
test_mcp_server "time" "@theobrigitte/mcp-time" || ((SERVERS_FAILED++))
test_mcp_server "interactive" "@ttommyth/interactive-mcp" || ((SERVERS_FAILED++))

echo -e "\n${BLUE}3. Database and file system checks...${NC}"

# Check betting_club.db exists
if [ -f "/home/joe/soccerdata_project/betting_club.db" ]; then
    echo -e "Betting database: ${GREEN}✓ Found${NC}"
else
    echo -e "Betting database: ${YELLOW}⚠ Will be created when needed${NC}"
fi

# Check data directory
if [ -d "/home/joe/soccerdata_project/data" ]; then
    echo -e "Data directory: ${GREEN}✓ Found${NC}"
else
    echo -e "Data directory: ${YELLOW}⚠ Creating...${NC}"
    mkdir -p "/home/joe/soccerdata_project/data"
fi

# Check shrimp_data directory
if [ -d "/home/joe/soccerdata_project/shrimp_data" ]; then
    echo -e "Shrimp data directory: ${GREEN}✓ Found${NC}"
else
    echo -e "Shrimp data directory: ${YELLOW}⚠ Creating...${NC}"
    mkdir -p "/home/joe/soccerdata_project/shrimp_data"
fi

echo -e "\n${BLUE}4. Environment variables check...${NC}"

# Check for GitHub token (optional)
if [ -n "${GITHUB_PERSONAL_ACCESS_TOKEN}" ]; then
    echo -e "GitHub token: ${GREEN}✓ Configured${NC}"
else
    echo -e "GitHub token: ${YELLOW}⚠ Not set (optional for some tasks)${NC}"
    echo -e "  ${YELLOW}To set: export GITHUB_PERSONAL_ACCESS_TOKEN=your_token_here${NC}"
fi

echo -e "\n${BLUE}5. MCP Configuration verification...${NC}"

if [ -f "/home/joe/soccerdata_project/.mcp.json" ]; then
    echo -e "MCP config file: ${GREEN}✓ Found${NC}"
    
    # Validate JSON
    if jq empty "/home/joe/soccerdata_project/.mcp.json" 2>/dev/null; then
        echo -e "JSON validity: ${GREEN}✓ Valid${NC}"
    else
        echo -e "JSON validity: ${RED}✗ Invalid JSON structure${NC}"
        ((SERVERS_FAILED++))
    fi
else
    echo -e "MCP config file: ${RED}✗ Not found${NC}"
    ((SERVERS_FAILED++))
fi

echo -e "\n${BLUE}6. Task execution readiness...${NC}"

# Check if API can start
echo -n "API server readiness... "
if [ -f "/home/joe/soccerdata_project/api.py" ]; then
    echo -e "${GREEN}✓ Ready${NC}"
else
    echo -e "${RED}✗ api.py not found${NC}"
    ((SERVERS_FAILED++))
fi

# Check frontend
echo -n "Frontend readiness... "
if [ -f "/home/joe/soccerdata_project/frontend/package.json" ]; then
    echo -e "${GREEN}✓ Ready${NC}"
else
    echo -e "${RED}✗ Frontend not found${NC}"
    ((SERVERS_FAILED++))
fi

echo -e "\n=============================================="

if [ $SERVERS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All MCP servers and dependencies are ready!${NC}"
    echo -e "\n${BLUE}Next steps:${NC}"
    echo "1. Start Warp with: warp --mcp-config .mcp.json"
    echo "2. Open the Shrimp Task Viewer at: http://localhost:5173"
    echo "3. Begin task execution with the 5-agent parallel workflow"
    echo ""
    echo -e "${BLUE}Quick start commands:${NC}"
    echo "# Terminal 1: Data Integration Agent"
    echo "python run.py api"
    echo ""
    echo "# Terminal 2: Frontend Development"
    echo "cd frontend && npm start"
    echo ""
    echo "# Terminal 3: Task Viewer"
    echo "cd mcp-shrimp-task-manager/tools/task-viewer && npm run start:all"
else
    echo -e "${RED}❌ $SERVERS_FAILED issues found. Please resolve before proceeding.${NC}"
    echo -e "\n${YELLOW}Common fixes:${NC}"
    echo "- Run: npm install -g @modelcontextprotocol/server-filesystem"
    echo "- Build Shrimp Task Manager: cd mcp-shrimp-task-manager && npm run build"
    echo "- Check internet connection for npx downloads"
    exit 1
fi

echo -e "\n${BLUE}Agent-specific MCP server assignments:${NC}"
echo -e "${YELLOW}Data Integration Agent:${NC} sqlite, fetch, filesystem, time"
echo -e "${YELLOW}Betting System API Agent:${NC} sqlite, time, fetch"
echo -e "${YELLOW}Betting Club UI Agent:${NC} filesystem, interactive, fetch"
echo -e "${YELLOW}Integration Testing Agent:${NC} fetch, interactive, github"
echo -e "${YELLOW}System Integration Agent:${NC} github, filesystem, sqlite"
