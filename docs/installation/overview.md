# F5 XC Cloud Status MCP - Installation Overview

Welcome! This guide helps you install the F5 XC Cloud Status MCP server on your preferred platform. The server provides real-time access to F5 Cloud service status, incident tracking, maintenance schedules, and component information.

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

## Platform Comparison

| Feature | Claude Code | OpenCode | VS Code | Claude Desktop |
|---------|-------------|----------|---------|-----------------|
| **Type** | CLI | CLI | Editor | Desktop App |
| **Installation Difficulty** | Easy | Easy | Medium | Easy |
| **Configuration Method** | `.mcp.json` | `opencode.json` | CLI command | `claude_desktop_config.json` |
| **Restart Required** | No | No | No | Yes |
| **Best For** | Developers | Terminal users | IDE integration | General users |
| **All 6 Tools Available** | ✅ | ✅ | ✅ | ✅ |
| **Windows Support** | ✅ | ✅ | ✅ | ✅ |
| **macOS Support** | ✅ | ✅ | ✅ | ✅ |
| **Linux Support** | ✅ | ✅ | ✅ | ❌ (Desktop only) |

## Choosing Your Platform

### Use Claude Code if:
- You're already using Claude Code for development
- You want minimal setup
- You prefer command-line tools
- You need the fastest configuration

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

## NPM Package Information

The MCP server is published as a public npm package:

```
Package: @robinmordasiewicz/f5xc-cloudstatus-mcp
Version: 1.3.0+
Registry: npmjs.org
Access: Public
```

## Installation Methods

Choose your platform below for detailed installation steps:

- **[Claude Code](claude-code.md)** - CLI-based installation
- **[OpenCode](opencode.md)** - Terminal editor installation
- **[VS Code](vscode.md)** - IDE installation
- **[Claude Desktop](claude-desktop.md)** - Desktop app installation

## Available Tools

Once installed, you'll have access to 6 tools for F5 Cloud status monitoring:

1. **Get Overall Status** - Current operational status of F5 Cloud
2. **Get Components** - List and filter cloud service components
3. **Get Component Details** - Detailed information about specific components
4. **Get Incidents** - Track and filter active incidents
5. **Get Maintenance** - View scheduled maintenance windows
6. **Search** - Cross-entity search across all resources

## Quick Test

After installation, verify everything works with this simple test:

**Prompt:** "What is the current status of F5 Cloud services?"

**Expected Response:** Current F5 Cloud operational status with timestamp and indicator

## Troubleshooting

If you encounter issues during installation, see the [Troubleshooting Guide](troubleshooting.md) for solutions.

## Support

For detailed platform-specific instructions, issues, or questions:
- Check the platform-specific guide for your chosen tool
- See the [Troubleshooting Guide](troubleshooting.md) for common issues
- Report issues on [GitHub](https://github.com/robinmordasiewicz/f5xc-cloudstatus-mcp)

---

**Last Updated:** January 2026
**Tested On:** macOS 14.6+ (Claude Code, OpenCode, VS Code, Claude Desktop)
