#!/bin/bash

echo "🧪 Testing All MCP Servers..."
echo "=================================="

echo "✅ Testing GitHub MCP..."
timeout 3s npx -y @modelcontextprotocol/server-github --help 2>/dev/null && echo "✅ GitHub MCP: WORKING" || echo "❌ GitHub MCP: Check token"

echo "✅ Testing Filesystem MCP..."
timeout 3s npx -y @modelcontextprotocol/server-filesystem --help 2>/dev/null && echo "✅ Filesystem MCP: WORKING" || echo "❌ Filesystem MCP: FAILED"

echo "✅ Testing SQLite MCP..."
timeout 3s npx -y mcp-server-sqlite-npx --help 2>/dev/null && echo "✅ SQLite MCP: WORKING" || echo "❌ SQLite MCP: FAILED"

echo "✅ Testing Fetch MCP..."
timeout 3s npx -y mcp-server-fetch-typescript --help 2>/dev/null && echo "✅ Fetch MCP: WORKING" || echo "❌ Fetch MCP: FAILED"

echo "✅ Testing Time MCP..."
timeout 3s npx -y time-mcp --help 2>/dev/null && echo "✅ Time MCP: WORKING" || echo "❌ Time MCP: FAILED"

echo "✅ Testing Sequential Thinking MCP..."
timeout 3s npx -y @modelcontextprotocol/server-sequential-thinking --help 2>/dev/null && echo "✅ Sequential Thinking MCP: WORKING" || echo "❌ Sequential Thinking MCP: FAILED"

echo "✅ Testing Interactive MCP..."
timeout 3s npx -y interactive-mcp-enhanced --help 2>/dev/null && echo "✅ Interactive MCP: WORKING" || echo "❌ Interactive MCP: FAILED"

echo "✅ Testing Shrimp Task Manager..."
if [ -f "./mcp-shrimp-task-manager/dist/index.js" ]; then
    echo "✅ Shrimp Task Manager: WORKING (files present)"
else
    echo "❌ Shrimp Task Manager: Files missing"
fi

echo ""
echo "🎉 MCP Server Test Complete!"
echo "=================================="
echo "Next: Copy mcp-servers-config.json to Warp Settings > AI > Agents > MCP Servers"
