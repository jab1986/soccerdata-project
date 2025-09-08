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
