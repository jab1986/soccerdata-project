# MCP Configuration for Multiple Machines

This directory contains scripts to help you set up and maintain your MCP (Model Context Protocol) configuration across multiple machines.

## Scripts

### `setup-mcp.sh`

This script sets up the MCP environment on a new machine:

- Checks for Node.js and npm
- Installs them if needed
- Clones the Shrimp Task Manager repository
- Sets up the correct configuration
- Creates necessary directories
- Configures VS Code settings

**Usage:**

```bash
./setup-mcp.sh
```

### `backup-mcp.sh`

This script creates a backup of your MCP configuration:

- Backs up all MCP configuration files
- Backs up VS Code settings
- Backs up Shrimp Task Manager data
- Creates a compressed archive for easy transfer

**Usage:**

```bash
./backup-mcp.sh
```

## How to Set Up on Another Machine

1. Clone your repository on the new machine:
   ```bash
   git clone https://github.com/jab1986/soccerdata-project.git
   cd soccerdata-project
   ```

2. Run the setup script:
   ```bash
   ./scripts/setup/setup-mcp.sh
   ```

3. Install the required VS Code extensions:
   - Copilot MCP
   - MCP Server Runner

4. Restart VS Code to apply the changes

## Restoring from Backup

If you've created a backup using the `backup-mcp.sh` script:

1. Copy the backup file to your project directory on the new machine
2. Extract the backup:
   ```bash
   tar -xzf mcp_backup_YYYYMMDD_HHMMSS.tar.gz -C /path/to/project
   ```
3. Run the setup script:
   ```bash
   ./scripts/setup/setup-mcp.sh
   ```

## Tips for Multiple Machines

- Keep your repository up-to-date on all machines
- Use the backup script before making significant changes
- Make sure all machines have the same VS Code extensions installed
- Check that Node.js and npm versions are compatible across machines
