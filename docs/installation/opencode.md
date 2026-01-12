# OpenCode - Installation Guide

OpenCode is an open-source terminal editor with built-in MCP support. Installing the F5 XC Cloud Status MCP server is done through a single configuration edit.

## Prerequisites

Before starting, ensure you have:
- **OpenCode** installed (`which opencode` should return a path)
- **Node.js** 18.0.0 or higher (`node --version`)
- **npm** installed (comes with Node.js)

## Installation

### Step 1: Locate OpenCode Configuration

OpenCode stores MCP server configuration in `~/.config/opencode/opencode.json`:

```bash
# View your OpenCode configuration
cat ~/.config/opencode/opencode.json
```

If the file doesn't exist, OpenCode will create it on first launch.

### Step 2: Add the F5 XC Cloud Status MCP Server

Edit the `opencode.json` file and add the server to the `mcp` section:

```bash
# Open the file in your editor
vim ~/.config/opencode/opencode.json
```

Add this configuration to the `mcp` object:

```json
{
  "mcp": {
    "f5xc-cloudstatus": {
      "type": "local",
      "command": ["npx", "-y", "@robinmordasiewicz/f5xc-cloudstatus-mcp@latest"],
      "environment": {}
    }
  }
}
```

### Step 3: Complete Example

Here's what the complete file might look like:

```json
{
  "model": "opencode/minimax-m2.1-free",
  "plugin": ["oh-my-opencode"],
  "mcp": {
    "f5xc-cloudstatus": {
      "type": "local",
      "command": ["npx", "-y", "@robinmordasiewicz/f5xc-cloudstatus-mcp@latest"],
      "environment": {}
    }
  }
}
```

## Verification

### Method 1: Start OpenCode

```bash
# Start OpenCode terminal UI
opencode

# The MCP server will be available immediately
# Try typing a prompt like:
# "What is the current status of F5 Cloud services?"
```

### Method 2: Command Line Verification

```bash
# Verify the package can be accessed
npx @robinmordasiewicz/f5xc-cloudstatus-mcp@latest --version

# You should see version information if successful
```

## Quick Test Prompts

After installation, try these prompts to verify the server works:

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
| `type` | `local` | Server runs locally on your machine |
| `command` | `["npx", "-y", "..."]` | Command to execute the server |
| `environment` | `{}` | Environment variables (none needed) |

## Multiple MCP Servers

You can add multiple MCP servers in the same configuration:

```json
{
  "mcp": {
    "f5xc-cloudstatus": {
      "type": "local",
      "command": ["npx", "-y", "@robinmordasiewicz/f5xc-cloudstatus-mcp@latest"],
      "environment": {}
    },
    "other-server": {
      "type": "local",
      "command": ["npx", "-y", "other-mcp-package"],
      "environment": {}
    }
  }
}
```

## Using Local Development Build

If you're developing the MCP server locally:

```json
{
  "mcp": {
    "f5xc-cloudstatus": {
      "type": "local",
      "command": ["node", "/path/to/f5xc-cloudstatus-mcp/dist/index.js"],
      "environment": {}
    }
  }
}
```

Replace `/path/to/f5xc-cloudstatus-mcp` with your actual project path.

## Troubleshooting

### "npx: command not found"
- **Cause**: Node.js or npm not properly installed
- **Solution**: Install Node.js from https://nodejs.org (v18.0.0+)
- **Verify**: Run `npm --version`

### "Cannot find module '@robinmordasiewicz/f5xc-cloudstatus-mcp'"
- **Cause**: Package not on npm registry or network issue
- **Solution**: Check internet connection, run `npm cache clean --force`, then retry
- **Verify**: Run `npm search @robinmordasiewicz/f5xc-cloudstatus-mcp`

### "Invalid JSON in opencode.json"
- **Cause**: Syntax error in configuration file
- **Solution**: Validate JSON: `python -m json.tool ~/.config/opencode/opencode.json`
- **Fix**: Check for missing commas, quotes, or brackets

### Server not appearing in OpenCode
- **Cause**: Configuration not loaded or syntax error
- **Solution**:
  1. Verify JSON is valid: `python -m json.tool ~/.config/opencode/opencode.json`
  2. Check file location: `ls -la ~/.config/opencode/opencode.json`
  3. Restart OpenCode: `opencode`
- **Verify**: Run `cat ~/.config/opencode/opencode.json | grep f5xc-cloudstatus`

## Uninstallation

To remove the F5 XC Cloud Status MCP server:

1. Edit `~/.config/opencode/opencode.json`
2. Remove the `f5xc-cloudstatus` block from the `mcp` section
3. Restart OpenCode

```json
{
  "mcp": {
    // f5xc-cloudstatus block removed
  }
}
```

## Comparison with Claude Code

| Feature | OpenCode | Claude Code |
|---------|----------|------------|
| **Config Location** | `~/.config/opencode/opencode.json` | `.mcp.json` in project |
| **Config Structure** | Per-user global | Per-project |
| **Terminal UI** | Full editor | Simple CLI |
| **Installation Difficulty** | Easy | Easy |
| **Setup Time** | 2-3 minutes | 2 minutes |

## Next Steps

- Review [Troubleshooting Guide](troubleshooting.md) if issues arise
- Check [Overview](overview.md) for tool descriptions
- See [UAT Test Prompts](../testing/uat-prompts.md) for comprehensive testing

---

**Installation Time:** ~2-3 minutes
**Difficulty Level:** Easy
**Restart Required:** No (just restart OpenCode)
**Last Updated:** January 2026
