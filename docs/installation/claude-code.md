# Claude Code - Installation Guide

Claude Code is the official Claude command-line interface. Installing the F5 XC Cloud Status MCP server takes just 2 steps.

## Prerequisites

Before starting, ensure you have:
- **Claude Code** installed (`which claude-code` should return a path)
- **Node.js** 18.0.0 or higher (`node --version`)
- **npm** installed (comes with Node.js)

## Installation

### Step 1: Locate Your Claude Code Configuration

Claude Code uses a `.mcp.json` file to register MCP servers. This file is typically located in your project root:

```bash
# Navigate to your Claude Code project
cd /path/to/your/project

# Or if you want a global configuration, use:
# ~/.claude/.mcp.json
```

### Step 2: Add the F5 XC Cloud Status MCP Server

If the `.mcp.json` file doesn't exist, create it:

```bash
cat > .mcp.json << 'EOF'
{
  "mcpServers": {
    "f5xc-cloudstatus": {
      "command": "npx",
      "args": ["-y", "@robinmordasiewicz/f5xc-cloudstatus-mcp@latest"]
    }
  }
}
EOF
```

If the file already exists, edit it to add the server configuration:

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

## Verification

### Method 1: Direct Test

Try this in Claude Code immediately:

```
Prompt: "What is the current status of F5 Cloud services?"
Expected: Current F5 Cloud operational status
```

### Method 2: Command Line Verification

```bash
# Check if Claude Code can access the server
npx @robinmordasiewicz/f5xc-cloudstatus-mcp@latest --version

# You should see version information if successful
```

## Alternative Installation Methods

### Using Local Development Build

If you're developing the MCP server locally:

```json
{
  "mcpServers": {
    "f5xc-cloudstatus": {
      "command": "node",
      "args": ["/path/to/f5xc-cloudstatus-mcp/dist/index.js"]
    }
  }
}
```

Replace `/path/to/f5xc-cloudstatus-mcp` with your actual project path.

### Using Installed Global Package

```json
{
  "mcpServers": {
    "f5xc-cloudstatus": {
      "command": "npm",
      "args": ["exec", "@robinmordasiewicz/f5xc-cloudstatus-mcp@latest"]
    }
  }
}
```

## Quick Test Prompts

After installation, try these prompts to verify all tools work:

**Basic Status Check:**
```
Prompt: "What is the current status of F5 Cloud services?"
Expected: Overall status, operational indicator, timestamp
Response Time: < 5 seconds
```

**Component Listing:**
```
Prompt: "Show me all F5 Cloud service components"
Expected: 100+ components organized by category
Response Time: < 5 seconds
```

**Incident Check:**
```
Prompt: "Are there any active incidents affecting F5 Cloud?"
Expected: Active incidents or confirmation of no issues
Response Time: < 5 seconds
```

## Configuration Reference

| Setting | Value | Purpose |
|---------|-------|---------|
| `command` | `npx` | Node package executor |
| `args[0]` | `-y` | Auto-confirm package execution |
| `args[1]` | `@robinmordasiewicz/f5xc-cloudstatus-mcp@latest` | Package name and version |

## Troubleshooting

### "npx: command not found"
- **Cause**: Node.js or npm not properly installed
- **Solution**: Install Node.js from https://nodejs.org (v18.0.0+)
- **Verify**: Run `npm --version`

### "Cannot find module '@robinmordasiewicz/f5xc-cloudstatus-mcp'"
- **Cause**: Package not on npm registry or network issue
- **Solution**: Check internet connection, run `npm cache clean --force`, then retry
- **Verify**: Run `npm search @robinmordasiewicz/f5xc-cloudstatus-mcp`

### "EACCES: permission denied"
- **Cause**: Node.js modules directory permission issue
- **Solution**: Fix npm permissions: https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally
- **Verify**: Run `npm list -g` without sudo

### Server not showing up in Claude Code
- **Cause**: Configuration file location or format issue
- **Solution**:
  1. Verify `.mcp.json` is in your project root
  2. Check JSON syntax with `python -m json.tool .mcp.json`
  3. Restart Claude Code CLI tool
- **Verify**: Run `cat .mcp.json | grep f5xc-cloudstatus`

## Advanced Configuration

### Multiple MCP Servers

You can install multiple MCP servers in the same configuration:

```json
{
  "mcpServers": {
    "f5xc-cloudstatus": {
      "command": "npx",
      "args": ["-y", "@robinmordasiewicz/f5xc-cloudstatus-mcp@latest"]
    },
    "other-server": {
      "command": "npx",
      "args": ["-y", "other-mcp-package"]
    }
  }
}
```

### Environment Variables

If the MCP server needs environment variables:

```json
{
  "mcpServers": {
    "f5xc-cloudstatus": {
      "command": "npx",
      "args": ["-y", "@robinmordasiewicz/f5xc-cloudstatus-mcp@latest"],
      "env": {
        "DEBUG": "true"
      }
    }
  }
}
```

## Uninstallation

To remove the F5 XC Cloud Status MCP server:

1. Edit `.mcp.json` and remove the `f5xc-cloudstatus` block
2. Save the file
3. The server will no longer be available in Claude Code

```json
{
  "mcpServers": {
    // f5xc-cloudstatus block removed
  }
}
```

## Next Steps

- Review [Troubleshooting Guide](troubleshooting.md) if issues arise
- Check [Home](../index.md) for tool descriptions and verification queries

---

**Installation Time:** ~2 minutes
**Difficulty Level:** Easy
**Restart Required:** No
**Last Updated:** January 2026
