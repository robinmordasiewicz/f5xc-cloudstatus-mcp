# Claude Desktop - Installation Guide

Claude Desktop is the native macOS desktop application. Installing the F5 XC Cloud Status MCP server requires editing a configuration file and restarting the application.

## Prerequisites

Before starting, ensure you have:
- **Claude Desktop** installed (available from https://claude.ai/desktop)
- **Node.js** 18.0.0 or higher (`node --version`)
- **npm** installed (comes with Node.js)

## Installation

### Step 1: Backup Configuration

First, create a backup of your existing configuration:

```bash
cp ~/Library/Application\ Support/Claude/claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json.backup
```

### Step 2: Edit Configuration File

Open the Claude Desktop configuration file:

```bash
# macOS
vim ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Or use your preferred editor
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### Step 3: Add MCP Server Configuration

Add the F5 XC Cloud Status server to the `mcpServers` section:

```json
{
  "mcpServers": {
    "f5xc-cloudstatus": {
      "command": "npx",
      "args": ["-y", "@robinmordasiewicz/f5xc-cloudstatus-mcp@latest"]
    }
  },
  "preferences": {
    "quickEntryDictationShortcut": "capslock"
  }
}
```

### Step 4: Verify JSON Syntax

Before restarting, verify the JSON is valid:

```bash
python -m json.tool ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

You should see no errors. If there are syntax errors, fix them before proceeding.

### Step 5: Restart Claude Desktop

Completely close and restart Claude Desktop:

```bash
# Close Claude Desktop
pkill -f "Claude" || killall Claude

# Or manually: Cmd+Q or menu → Claude → Quit Claude

# Then relaunch the application
open -a Claude
```

Wait for Claude Desktop to fully start (watch for the tray icon to appear).

## Verification

### Method 1: New Conversation

1. Create a new conversation in Claude Desktop
2. Try this prompt:
   ```
   "What is the current status of F5 Cloud services?"
   ```
3. You should see F5 Cloud status in the response

### Method 2: Check Available Tools

Look at the available tools list (usually shown in the chat interface) and verify `f5xc-cloudstatus` appears.

### Step 3: Command Line Verification

```bash
# Test the package directly
npx @robinmordasiewicz/f5xc-cloudstatus-mcp@latest --version

# You should see version information if successful
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

## Complete Configuration Example

Here's what your complete configuration file should look like:

```json
{
  "mcpServers": {
    "f5xc-cloudstatus": {
      "command": "npx",
      "args": ["-y", "@robinmordasiewicz/f5xc-cloudstatus-mcp@latest"]
    }
  },
  "preferences": {
    "quickEntryDictationShortcut": "capslock"
  }
}
```

## Multiple MCP Servers

You can configure multiple MCP servers in the same file:

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
  },
  "preferences": {
    "quickEntryDictationShortcut": "capslock"
  }
}
```

## Using Local Development Build

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

### "Invalid JSON syntax"
- **Cause**: Missing commas, quotes, or brackets in config file
- **Solution**: Validate JSON:
  ```bash
  python -m json.tool ~/Library/Application\ Support/Claude/claude_desktop_config.json
  ```
- **Fix**: Edit file and correct syntax errors

### Server not appearing after restart
- **Cause**: Configuration file not properly saved or syntax error
- **Solution**:
  1. Verify JSON is valid: `python -m json.tool ~/Library/Application\ Support/Claude/claude_desktop_config.json`
  2. Check file was saved: `cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | grep f5xc-cloudstatus`
  3. Fully restart Claude Desktop (not just window)
  4. Check that Node.js can execute the package: `npx @robinmordasiewicz/f5xc-cloudstatus-mcp@latest --version`
- **Verify**: After restart, look for error messages in Claude Desktop

### "EACCES: permission denied"
- **Cause**: Node.js modules directory permission issue
- **Solution**: Fix npm permissions: https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally
- **Verify**: Run `npm list -g` without sudo

## Recovery

If something goes wrong, restore from your backup:

```bash
# Restore backup
cp ~/Library/Application\ Support/Claude/claude_desktop_config.json.backup ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Restart Claude Desktop
pkill -f "Claude" || killall Claude
open -a Claude
```

## Configuration Paths by Platform

### macOS
```
Configuration: ~/Library/Application Support/Claude/claude_desktop_config.json
Backup location: ~/Library/Application Support/Claude/claude_desktop_config.json.backup
```

### Windows
```
Configuration: %APPDATA%\Claude\claude_desktop_config.json
Backup location: %APPDATA%\Claude\claude_desktop_config.json.backup
```

### Linux
```
Note: Claude Desktop is only available for macOS and Windows
```

## Uninstallation

To remove the F5 XC Cloud Status MCP server:

1. Edit `~/Library/Application Support/Claude/claude_desktop_config.json`
2. Remove the `f5xc-cloudstatus` block from the `mcpServers` object
3. Verify JSON is valid
4. Restart Claude Desktop

```json
{
  "mcpServers": {
    // f5xc-cloudstatus block removed
  },
  "preferences": {
    "quickEntryDictationShortcut": "capslock"
  }
}
```

## Comparison with Other Platforms

| Feature | Claude Desktop | Claude Code | OpenCode | VS Code |
|---------|---|---|---|---|
| **Platform** | macOS/Windows | macOS/Windows/Linux | macOS/Windows/Linux | macOS/Windows/Linux |
| **Configuration** | JSON file | `.mcp.json` | `opencode.json` | Settings or CLI |
| **Restart Required** | Yes | No | No | Yes (reload) |
| **Setup Time** | 3-5 minutes | 2 minutes | 2-3 minutes | 1-2 minutes |
| **GUI Interface** | Native app | CLI | Terminal UI | IDE |

## Next Steps

- Review [Troubleshooting Guide](troubleshooting.md) if issues arise
- Check [Overview](overview.md) for tool descriptions
- See [UAT Test Prompts](../testing/uat-prompts.md) for comprehensive testing

---

**Installation Time:** ~3-5 minutes (includes restart)
**Difficulty Level:** Easy
**Restart Required:** Yes
**Last Updated:** January 2026
