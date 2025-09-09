#!/bin/bash

# MCP Backup Script - This script backs up your MCP configuration to a portable format
# Author: Joe
# Date: September 9, 2025

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/mcp-backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/mcp_backup_$TIMESTAMP.tar.gz"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 MCP Backup Script${NC}"
echo "==============================================="

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# List of files to backup
FILES_TO_BACKUP=(
  ".mcp.json"
  "mcp-config.json"
  "mcp-servers-config.json"
  ".vscode/settings.json"
  "shrimp_data"
)

echo -e "${YELLOW}Creating backup of MCP configuration...${NC}"

# Create temporary directory for the backup
TEMP_DIR=$(mktemp -d)
mkdir -p "$TEMP_DIR/vscode"
mkdir -p "$TEMP_DIR/shrimp_data"

# Copy files to temporary directory
for file in "${FILES_TO_BACKUP[@]}"; do
  if [[ "$file" == ".vscode/settings.json" ]] && [[ -f "$PROJECT_ROOT/$file" ]]; then
    cp "$PROJECT_ROOT/$file" "$TEMP_DIR/vscode/settings.json"
    echo -e "- Backed up: ${GREEN}$file${NC}"
  elif [[ "$file" == "shrimp_data" ]] && [[ -d "$PROJECT_ROOT/$file" ]]; then
    cp -r "$PROJECT_ROOT/$file"/* "$TEMP_DIR/shrimp_data/"
    echo -e "- Backed up: ${GREEN}$file${NC}"
  elif [[ -f "$PROJECT_ROOT/$file" ]]; then
    cp "$PROJECT_ROOT/$file" "$TEMP_DIR/"
    echo -e "- Backed up: ${GREEN}$file${NC}"
  else
    echo -e "- Skipped: $file (not found)"
  fi
done

# Add README with instructions
cat > "$TEMP_DIR/README.md" << EOL
# MCP Backup - $TIMESTAMP

This backup contains your MCP configuration files for the soccerdata-project.

## Restore Instructions

1. Copy all .json files to your project root directory.
2. Copy the vscode/settings.json file to your project's .vscode/settings.json
3. Copy the shrimp_data directory to your project's shrimp_data directory
4. Run the setup-mcp.sh script from the scripts/setup directory

## Files Included

- .mcp.json - Main MCP configuration
- mcp-config.json - Agent assignments
- mcp-servers-config.json - Server definitions
- vscode/settings.json - VS Code settings
- shrimp_data/ - Shrimp Task Manager data

For more information, see the setup-mcp.sh script in the scripts/setup directory.
EOL

# Create the tarball
tar -czf "$BACKUP_FILE" -C "$TEMP_DIR" .
echo -e "\n${GREEN}Backup created:${NC} $BACKUP_FILE"

# Clean up the temporary directory
rm -rf "$TEMP_DIR"

echo -e "\n${YELLOW}To restore on another machine:${NC}"
echo "1. Extract the backup file: tar -xzf $BACKUP_FILE -C /path/to/project"
echo "2. Run the setup-mcp.sh script"
echo -e "\n${GREEN}Backup complete!${NC} 📦"
