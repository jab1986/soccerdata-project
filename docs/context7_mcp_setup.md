# Context7 MCP setup (for VS Code MCP extensions)

Use this guide to register and run the Context7 MCP server with the MCP extensions you enabled.

## Prerequisites
- MCP Server Runner extension enabled
- VSCode MCP Server (or Copilot Chat MCP) enabled
- Context7 server details:
  - HTTP: base URL and auth token, or
  - Command (stdio): executable path, args, and any env vars

Optionally copy `.env.example` to `.env` and set values:
- CONTEXT7_URL
- CONTEXT7_TOKEN

## Register the server (HTTP)
1. Open the “MCP Server Runner” view.
2. Add Server → Type: HTTP
3. Name: Context7
4. URL: ${CONTEXT7_URL} (or paste full URL)
5. Headers (if needed): Authorization: Bearer ${CONTEXT7_TOKEN}
6. Save.

## Register the server (Command/stdio)
1. Add Server → Type: Command
2. Name: Context7
3. Command: /path/to/context7-binary
4. Args: as required
5. Env: CONTEXT7_TOKEN=${CONTEXT7_TOKEN}
6. Save.

## Start and verify
- Start the “Context7” server from the Runner and wait for status: Running.
- Open Copilot Chat → Settings → MCP, ensure MCP is enabled and “Context7” is listed/checked.
- In Copilot Chat, run a simple tool (e.g., server “info”/“ping”) to verify responses.

## Troubleshooting
- 401/403: check token and header.
- TLS/self-signed: trust the certificate or use HTTP only in trusted local networks.
- Not listed in Copilot Chat: ensure MCP is enabled and the server is Running.

## Notes
- These steps don’t commit secrets. Keep tokens in your local environment, not in Git.
