# Quick Start Guide - F5 Cloud Status MCP Server

Get up and running with the F5 Cloud Status MCP Server in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Claude Desktop installed (for MCP client usage)

## Installation Steps

### 1. Install Dependencies

```bash
cd /home/robin/GIT/robinmordasiewicz/www.f5cloudstatus.com
npm install
```

### 2. Build the Server

```bash
npm run build
```

### 3. Test Locally (Optional)

```bash
npm start
```

You should see:
```
[2025-10-08T...] [INFO] Configuration validated successfully
[2025-10-08T...] [INFO] MCP Server initialized
[2025-10-08T...] [INFO] Starting MCP Server
[2025-10-08T...] [INFO] MCP Server started and listening on stdio
```

Press `Ctrl+C` to stop.

### 4. Configure Claude Desktop

Edit your Claude Desktop configuration file:

**macOS:**
```bash
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Linux:**
```bash
nano ~/.config/Claude/claude_desktop_config.json
```

**Windows (PowerShell):**
```powershell
notepad $env:APPDATA\Claude\claude_desktop_config.json
```

Add this configuration (replace the path with your actual project path):

```json
{
  "mcpServers": {
    "f5-status": {
      "command": "node",
      "args": [
        "/home/robin/GIT/robinmordasiewicz/www.f5cloudstatus.com/dist/index.js"
      ]
    }
  }
}
```

### 5. Restart Claude Desktop

Completely quit and restart Claude Desktop.

### 6. Verify Connection

In Claude Desktop, look for the 🔌 icon in the bottom-right corner. You should see "f5-status" listed as a connected MCP server.

## Try It Out

Ask Claude any of these questions:

1. **"What is the current status of F5 Cloud services?"**
   - Uses: `f5-status-get-overall`

2. **"Show me all F5 Cloud components that are having issues"**
   - Uses: `f5-status-get-components` with status filter

3. **"Are there any active incidents?"**
   - Uses: `f5-status-get-incidents` with unresolved filter

4. **"What maintenance is scheduled for F5 Cloud?"**
   - Uses: `f5-status-get-maintenance`

5. **"Search for anything related to API Gateway"**
   - Uses: `f5-status-search`

## Common Issues

### "Command not found" or server not starting

Make sure you built the project:
```bash
npm run build
```

### Server connects but returns errors

Check your internet connection to https://www.f5cloudstatus.com

Enable debug logging:
```bash
LOG_LEVEL=debug npm start
```

### Playwright browser not found

Install Playwright browsers:
```bash
npx playwright install chromium
```

### Server works standalone but not in Claude Desktop

1. Use absolute paths in the configuration (not relative paths like `./dist/index.js`)
2. Check Claude Desktop logs for specific error messages
3. Ensure Node.js is in your system PATH

## Optional: Environment Configuration

For production use, create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` to customize:
- API timeouts and retry settings
- Cache TTL durations
- Log levels
- Scraper behavior

Then restart the server (or Claude Desktop if using with MCP).

## Next Steps

- Read the full [README.md](README.md) for detailed tool documentation
- Review [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system design
- Check [ANALYSIS.md](ANALYSIS.md) to see the original website analysis

## Support

For issues:
1. Check the Troubleshooting section in README.md
2. Enable debug logging: `LOG_LEVEL=debug`
3. Review Claude Desktop logs
4. Open an issue on GitHub with logs and configuration

## Development

Want to modify the server?

```bash
# Watch mode for development
npm run dev

# Run tests
npm test

# Check code quality
npm run lint
npm run format
```

See the full README.md for complete development documentation.
