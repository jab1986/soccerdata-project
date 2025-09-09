#!/bin/bash

# MCP Setup Script - This script helps configure MCP servers on a new machine
# Author: Joe
# Date: September 9, 2025

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SHRIMP_TASK_MANAGER_DIR="$PROJECT_ROOT/mcp-shrimp-task-manager"
SHRIMP_DATA_DIR="$PROJECT_ROOT/shrimp_data"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 MCP Setup Script${NC}"
echo "==============================================="
echo -e "Project root: ${GREEN}$PROJECT_ROOT${NC}"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

# Check for Node.js and npm
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "Node.js: ${GREEN}✓ $NODE_VERSION${NC}"
else
    echo -e "Node.js: ${RED}✗ Not installed${NC}"
    echo "Installing Node.js and npm..."
    
    if command_exists apt; then
        sudo apt update && sudo apt install -y nodejs npm
    elif command_exists brew; then
        brew install node
    else
        echo -e "${RED}Error: Cannot install Node.js automatically.${NC}"
        echo "Please install Node.js and npm manually, then run this script again."
        exit 1
    fi
fi

if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "npm: ${GREEN}✓ $NPM_VERSION${NC}"
else
    echo -e "npm: ${RED}✗ Not installed${NC}"
    echo "Please install npm and try again."
    exit 1
fi

# Create data directory if it doesn't exist
echo -e "\n${YELLOW}Setting up Shrimp Task Manager...${NC}"
mkdir -p "$SHRIMP_DATA_DIR"
echo -e "Created data directory: ${GREEN}$SHRIMP_DATA_DIR${NC}"

# Check if Shrimp Task Manager is already cloned
if [ -d "$SHRIMP_TASK_MANAGER_DIR" ] && [ -f "$SHRIMP_TASK_MANAGER_DIR/package.json" ]; then
    echo -e "Shrimp Task Manager: ${GREEN}✓ Already cloned${NC}"
else
    echo "Cloning Shrimp Task Manager repository..."
    git clone https://github.com/cjo4m06/mcp-shrimp-task-manager.git "$SHRIMP_TASK_MANAGER_DIR"
    echo -e "Shrimp Task Manager: ${GREEN}✓ Cloned successfully${NC}"
fi

# Install dependencies and build
echo -e "\n${YELLOW}Installing dependencies and building...${NC}"
cd "$SHRIMP_TASK_MANAGER_DIR"

# Create .env file
cat > .env << EOL
# MCP Shrimp Task Manager Environment Variables
DATA_DIR=$SHRIMP_DATA_DIR
TEMPLATES_USE=en
ENABLE_GUI=false
EOL
echo -e "Created .env file: ${GREEN}✓${NC}"

# Install dependencies
echo "Installing npm dependencies..."
npm install
echo -e "Dependencies installed: ${GREEN}✓${NC}"

# Build the project
echo "Building the project..."
npm run build
echo -e "Build completed: ${GREEN}✓${NC}"

# Set up VS Code configuration
echo -e "\n${YELLOW}Setting up VS Code configuration...${NC}"
VSCODE_DIR="$PROJECT_ROOT/.vscode"
mkdir -p "$VSCODE_DIR"

# Create settings.json
cat > "$VSCODE_DIR/settings.json" << EOL
{
    "github.copilot.agent.contextPassing.enabled": true,
    "mcp.enabled": true,
    "mcp.servers": {
        "shrimp-task-manager": {
            "command": "node",
            "args": ["$SHRIMP_TASK_MANAGER_DIR/dist/index.js"],
            "env": {
                "DATA_DIR": "$SHRIMP_DATA_DIR",
                "TEMPLATES_USE": "en",
                "ENABLE_GUI": "false"
            }
        }
    }
}
EOL
echo -e "VS Code settings created: ${GREEN}✓${NC}"

echo -e "\n${GREEN}🎉 MCP Setup Complete!${NC}"
echo "==============================================="
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Restart VS Code to apply settings"
echo "2. Install the 'Copilot MCP' and 'MCP Server Runner' extensions"
echo "3. Use the Shrimp Task Manager from VS Code"
echo -e "\nHappy coding! 🦐"
