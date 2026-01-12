# F5 Cloud Status MCP Server

MCP server for monitoring F5 Distributed Cloud service status, components, incidents, and maintenance. Get real-time access to F5 Cloud operational status with 6 comprehensive tools for status monitoring, incident tracking, and service health management.

## Prerequisites

All platforms require:

- **Node.js**: Version 18.0.0 or higher
- **npm**: Included with Node.js
- **Internet connection**: Required for API access and package downloads

Check your Node.js version:
```bash
node --version  # Should be v18.0.0 or higher
npm --version
```

## Quick Start

Get started in under 1 minute with Claude Code:

```bash
# Add MCP server to Claude Code
claude mcp add f5xc-cloudstatus npx @robinmordasiewicz/f5xc-cloudstatus-mcp@latest

# Test it immediately
# Ask Claude: "What is the current status of F5 Cloud services?"
```

Works! Now read below for detailed installation options and features.

## Platform Selection Guide

Choose the platform that best fits your workflow:

### Platform Comparison

| Feature | Claude Code | OpenCode | VS Code | Claude Desktop |
|---------|-------------|----------|---------|-----------------|
| **Type** | CLI | CLI | Editor | Desktop App |
| **Installation Difficulty** | Easy | Easy | Medium | Easy |
| **Configuration Method** | `.mcp.json` | `opencode.json` | CLI command | `claude_desktop_config.json` |
| **Restart Required** | No | No | No | Yes |
| **Best For** | Developers | Terminal users | IDE integration | General users |
| **Validation Status** | ✅ Tested | ✅ Tested | ⏳ Config only | ⏳ Config only |
| **UAT Test Results** | 15/15 (100%) | 15/15 (100%) | Not tested | Not tested |
| **Automation Friendly** | ✅ Yes* | ✅ Yes | Unknown | Unknown |
| **All 6 Tools Available** | ✅ | ✅ | ✅ | ✅ |
| **Windows Support** | ✅ | ✅ | ✅ | ✅ |
| **macOS Support** | ✅ | ✅ | ✅ | ✅ |
| **Linux Support** | ✅ | ✅ | ✅ | ❌ (Desktop only) |

\* *Claude CLI requires `--dangerously-skip-permissions` flag for automated testing. Omit flag for manual testing with interactive permission prompts.*

### Use Claude Code if:
- You're already using Claude Code for development
- You want minimal setup and fastest configuration
- You prefer command-line tools
- You need the quickest path to working

### Use OpenCode if:
- You prefer a fully-featured terminal interface
- You want advanced editor features in the terminal
- You're using OpenCode for other projects
- You like extensive customization options

### Use VS Code if:
- You're an existing VS Code user
- You want tight IDE integration
- You need advanced editing features
- You use VS Code for your primary development

### Use Claude Desktop if:
- You want a standalone desktop application
- You're non-technical or prefer GUI interaction
- You want easy access without terminal commands
- You're using macOS and prefer native applications

## Installation by Platform

### Basic Configuration

The MCP server is added via a JSON configuration in your platform's config file:

```json
{
  "mcpServers": {
    "f5xc-cloudstatus": {
      "command": "npx",
      "args": ["-y", "@robinmordasiewicz/f5xc-cloudstatus-mcp@latest"]
    }
  }
}
```

### Config File Locations

- **Claude Code**: Use command `claude mcp add f5xc-cloudstatus npx @robinmordasiewicz/f5xc-cloudstatus-mcp@latest` or edit `.mcp.json` manually
- **Claude Desktop**:
  - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
  - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- **VS Code**: Use command `code --add-mcp '{"name":"f5xc-cloudstatus","command":"npx","args":["@robinmordasiewicz/f5xc-cloudstatus-mcp@latest"]}'`
- **OpenCode**: Edit `opencode.json` configuration file
- **Cursor**: `.cursor/mcp.json`
- **Windsurf**: Plugins → Search "F5 Cloud Status" → Install

### Detailed Platform Guides

For platform-specific instructions with screenshots and troubleshooting:

- **[Claude Code](installation/claude-code.md)** - CLI-based installation with command examples
- **[OpenCode](installation/opencode.md)** - Terminal editor installation guide
- **[VS Code](installation/vscode.md)** - IDE installation with extension details
- **[Claude Desktop](installation/claude-desktop.md)** - Desktop app configuration guide
- **[Troubleshooting](installation/troubleshooting.md)** - Common issues and solutions

## Available Tools

Once installed, you have access to 6 tools for comprehensive F5 Cloud status monitoring:

| Tool | Description | Example Use |
|------|-------------|-------------|
| `f5-status-get-overall` | Get current overall operational status | Check if F5 Cloud services are operational |
| `f5-status-get-components` | List all service components with filtering | View degraded components, filter by group or status |
| `f5-status-get-component` | Get detailed information about a specific component | Deep dive into API Gateway component status |
| `f5-status-get-incidents` | Track current and recent incidents | View active incidents, filter by impact or status |
| `f5-status-get-maintenance` | View scheduled maintenance windows | See upcoming maintenance, filter by status |
| `f5-status-search` | Search across components, incidents, and maintenance | Find all resources related to "API Gateway" |

## Verification

After installation, verify everything works correctly:

### Quick Test

Ask Claude this simple question:

```
What is the current status of F5 Cloud services?
```

**Expected Response**: Current F5 Cloud operational status with timestamp and status indicator (e.g., "operational", "degraded", "partial_outage")

### Additional Verification Queries

Test each tool with these queries:

```
Are there any active incidents?
Show me all components that are currently degraded
What maintenance is scheduled for this week?
Search for API Gateway related issues
Get details about the Distributed Cloud Console component
```

If these queries return valid responses, your installation is working correctly.

## Example Queries

Here are some practical ways to use the MCP server:

### Status Monitoring
```
What is the current status of F5 Cloud services?
Show me the overall health of F5 Cloud
```

### Component Management
```
List all service components
Show me components that are degraded
Get details about the API Gateway component
Filter components by Distributed Cloud Services group
```

### Incident Tracking
```
Are there any active incidents?
Show me all critical incidents
What incidents have been resolved this week?
Filter incidents by major impact level
```

### Maintenance Planning
```
What maintenance is scheduled?
Show me upcoming maintenance windows
Are there any active maintenance windows right now?
```

### Search and Discovery
```
Search for API Gateway
Find all components related to "console"
Search maintenance windows for "upgrade"
```

## NPM Package Information

The MCP server is published as a public npm package:

```
Package: @robinmordasiewicz/f5xc-cloudstatus-mcp
Version: 1.3.0+
Registry: npmjs.org
Access: Public
License: MIT
```

## Troubleshooting

If you encounter issues:

1. **MCP server not appearing**: Restart your platform (especially Claude Desktop)
2. **Node.js version error**: Ensure Node.js 18.0.0 or higher is installed
3. **npm errors**: Try clearing npm cache: `npm cache clean --force`
4. **Permission issues**: Check file permissions on config files
5. **Network errors**: Verify internet connection and firewall settings

For detailed troubleshooting steps, see the [Troubleshooting Guide](installation/troubleshooting.md).

## Support & Links

- **npm Package**: [https://www.npmjs.com/package/@robinmordasiewicz/f5xc-cloudstatus-mcp](https://www.npmjs.com/package/@robinmordasiewicz/f5xc-cloudstatus-mcp)
- **GitHub Repository**: [https://github.com/robinmordasiewicz/f5xc-cloudstatus-mcp](https://github.com/robinmordasiewicz/f5xc-cloudstatus-mcp)
- **Issues & Bug Reports**: [https://github.com/robinmordasiewicz/f5xc-cloudstatus-mcp/issues](https://github.com/robinmordasiewicz/f5xc-cloudstatus-mcp/issues)
- **GitHub Package**: [https://github.com/robinmordasiewicz/f5xc-cloudstatus-mcp/pkgs/npm/f5xc-cloudstatus-mcp](https://github.com/robinmordasiewicz/f5xc-cloudstatus-mcp/pkgs/npm/f5xc-cloudstatus-mcp)

## License

MIT License - Copyright (c) 2026 Robin Mordasiewicz

---

**Last Updated**: January 2026
**Tested On**: macOS 14.6+ (Claude Code, OpenCode, VS Code, Claude Desktop)
