# VS Code - Installation Guide

VS Code has native MCP support built-in. Installing the F5 XC Cloud Status MCP server requires just one command.

## Prerequisites

Before starting, ensure you have:
- **VS Code** installed with version 1.96.0+ (`code --version`)
- **Node.js** 18.0.0 or higher (`node --version`)
- **npm** installed (comes with Node.js)

Check your VS Code version:
```bash
code --version  # Should show version 1.96.0 or higher
```

## Installation

### Method 1: CLI Command (Recommended)

The easiest way is to use the `--add-mcp` flag:

```bash
code --add-mcp '{"name":"f5xc-cloudstatus","command":"npx","args":["-y","@robinmordasiewicz/f5xc-cloudstatus-mcp@latest"]}'
```

You should see confirmation:
```
Added MCP servers: f5xc-cloudstatus
```

### Method 2: Manual Configuration

If you prefer manual configuration, edit VS Code settings:

1. **Open VS Code settings**:
   ```bash
   code ~/.config/Code/User/settings.json
   ```

2. **Add the MCP server configuration**:
   ```json
   {
     "mcp.servers": {
       "f5xc-cloudstatus": {
         "command": "npx",
         "args": ["-y", "@robinmordasiewicz/f5xc-cloudstatus-mcp@latest"]
       }
     }
   }
   ```

3. **Reload VS Code** (Ctrl+Shift+P → "Developer: Reload Window")

### Method 3: Workspace Settings (Optional)

For project-specific installation, create `.vscode/settings.json` in your project:

```json
{
  "mcp.servers": {
    "f5xc-cloudstatus": {
      "command": "npx",
      "args": ["-y", "@robinmordasiewicz/f5xc-cloudstatus-mcp@latest"]
    }
  }
}
```

## Verification

### Method 1: VS Code Chat

1. Open VS Code chat (Cmd+L on macOS, Ctrl+L on Windows/Linux)
2. Try this prompt:
   ```
   "What is the current status of F5 Cloud services?"
   ```
3. You should see F5 Cloud status in the response

### Method 2: Command Line Verification

```bash
# Test the package directly
npx @robinmordasiewicz/f5xc-cloudstatus-mcp@latest --version

# You should see version information if successful
```

### Method 3: Check MCP Server Status

In VS Code:
1. Open Developer Tools (Help → Toggle Developer Tools)
2. Look for MCP server connection logs
3. Should show "f5xc-cloudstatus connected"

## Quick Test Prompts

After installation, try these prompts in VS Code chat to verify all tools work:

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

## Multiple MCP Servers

You can configure multiple MCP servers:

```json
{
  "mcp.servers": {
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

## Using Local Development Build

If you're developing the MCP server locally:

```json
{
  "mcp.servers": {
    "f5xc-cloudstatus": {
      "command": "node",
      "args": ["/path/to/f5xc-cloudstatus-mcp/dist/index.js"]
    }
  }
}
```

Replace `/path/to/f5xc-cloudstatus-mcp` with your actual project path.

## Troubleshooting

### "VS Code version too old"
- **Cause**: VS Code version < 1.96.0 (MCP support requires newer version)
- **Solution**: Update VS Code to the latest version
- **Verify**: Run `code --version` (should be 1.96.0+)

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

### Server not showing in VS Code chat
- **Cause**: Configuration file location, format, or VS Code not reloaded
- **Solution**:
  1. Check file syntax: `python -m json.tool ~/.config/Code/User/settings.json`
  2. Reload VS Code: Cmd+Shift+P → "Developer: Reload Window"
  3. Check configuration location is correct
  4. Try using `--add-mcp` command instead
- **Verify**: Run `code --add-mcp` command and check for confirmation

### "Invalid JSON syntax"
- **Cause**: Missing commas, quotes, or brackets in settings file
- **Solution**: Validate JSON: `python -m json.tool ~/.config/Code/User/settings.json`
- **Fix**: Edit file and correct syntax errors

## Platform-Specific Paths

### macOS
```
User settings: ~/.config/Code/User/settings.json
Workspace settings: .vscode/settings.json (in project root)
```

### Windows
```
User settings: %APPDATA%\Code\User\settings.json
Workspace settings: .vscode\settings.json (in project root)
```

### Linux
```
User settings: ~/.config/Code/User/settings.json
Workspace settings: .vscode/settings.json (in project root)
```

## Uninstallation

To remove the F5 XC Cloud Status MCP server:

### If using --add-mcp:
VS Code stores the configuration internally. To remove:
1. Open VS Code
2. There's no direct removal command; manually edit settings.json (see Method 2)
3. Remove the `f5xc-cloudstatus` block from the `mcp.servers` object

### If using manual configuration:
1. Edit `~/.config/Code/User/settings.json` (or workspace settings)
2. Remove the `f5xc-cloudstatus` block
3. Reload VS Code

```json
{
  "mcp.servers": {
    // f5xc-cloudstatus block removed
  }
}
```

## Comparison with Other Platforms

| Feature | VS Code | Claude Code | OpenCode |
|---------|---------|-------------|----------|
| **Installation Method** | CLI or settings.json | `.mcp.json` | `opencode.json` |
| **Configuration Location** | `~/.config/Code/User/` or workspace | Project root | `~/.config/opencode/` |
| **Restart Required** | Reload VS Code | No | No |
| **IDE Integration** | Native IDE features | CLI | Terminal UI |
| **Setup Time** | 1-2 minutes | 2 minutes | 2-3 minutes |

## Keyboard Shortcuts

Once installed, use these VS Code shortcuts with MCP:

- **Open Chat**: Cmd+L (macOS) / Ctrl+L (Windows/Linux)
- **Quick Chat**: Cmd+K (macOS) / Ctrl+K (Windows/Linux)
- **Reload Window**: Cmd+Shift+P → "Developer: Reload Window"
- **Open Settings**: Cmd+, (macOS) / Ctrl+, (Windows/Linux)

## Next Steps

- Review [Troubleshooting Guide](troubleshooting.md) if issues arise
- Check [Home](../index.md) for tool descriptions and verification queries

---

**Installation Time:** ~1-2 minutes
**Difficulty Level:** Medium
**Restart Required:** Yes (reload VS Code window)
**Last Updated:** January 2026
