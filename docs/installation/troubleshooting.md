# Troubleshooting Guide

This guide helps you resolve common issues when installing or using the F5 XC Cloud Status MCP server.

## Common Issues Across All Platforms

### Issue 1: "npx: command not found"

**Symptoms:**
```
command not found: npx
npm: command not found
```

**Root Cause:** Node.js or npm is not properly installed or not in your PATH

**Solutions:**
1. **Install Node.js:**
   ```bash
   # Check if Node.js is installed
   node --version
   npm --version

   # If not installed, download from https://nodejs.org
   # Install version 18.0.0 or higher
   ```

2. **Update PATH (if Node.js is installed but not in PATH):**
   ```bash
   # Find Node.js installation
   which node
   which npm

   # Add to PATH in ~/.bash_profile or ~/.zshrc
   export PATH="/usr/local/bin:$PATH"
   ```

3. **Reinstall Node.js:**
   ```bash
   # Using Homebrew (macOS/Linux)
   brew install node@18

   # Or download from https://nodejs.org
   ```

**Verification:**
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 8.0.0 or higher
npx --version   # Should work without error
```

---

### Issue 2: "Cannot find module '@robinmordasiewicz/f5xc-cloudstatus-mcp'"

**Symptoms:**
```
npm ERR! 404 Not Found
error when installing package
Module not found
```

**Root Cause:**
- Package not found on npm registry
- Network connectivity issue
- npm cache corrupted

**Solutions:**

1. **Check npm registry:**
   ```bash
   # Search for the package
   npm search @robinmordasiewicz/f5xc-cloudstatus-mcp

   # Or visit: https://www.npmjs.com/package/@robinmordasiewicz/f5xc-cloudstatus-mcp
   ```

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   npm install -g npm@latest  # Update npm
   ```

3. **Check internet connection:**
   ```bash
   # Try downloading a different package
   npx -y create-react-app --version

   # Or ping npm registry
   curl -I https://registry.npmjs.org/
   ```

4. **Try alternative package source:**
   ```bash
   # Use GitHub directly (for development versions)
   npm install github:robinmordasiewicz/f5xc-cloudstatus-mcp
   ```

**Verification:**
```bash
npm view @robinmordasiewicz/f5xc-cloudstatus-mcp version
```

---

### Issue 3: "EACCES: permission denied"

**Symptoms:**
```
EACCES: permission denied
Error: ENOENT: no such file or directory
```

**Root Cause:** npm modules directory doesn't have write permissions

**Solutions:**

1. **Fix npm permissions (recommended):**
   ```bash
   # Create a directory for global packages
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'

   # Add to PATH in ~/.bash_profile or ~/.zshrc
   export PATH=~/.npm-global/bin:$PATH

   # Reload shell
   source ~/.bash_profile  # or ~/.zshrc
   ```

2. **Alternative: Change npm default directory:**
   ```bash
   npm config set prefix /usr/local
   ```

3. **Never use sudo with npm:**
   ```bash
   # WRONG - never do this
   sudo npm install -g package

   # RIGHT - fix permissions instead
   npm install -g package
   ```

**Verification:**
```bash
npm list -g  # Should work without permission errors
```

---

### Issue 4: "Invalid JSON syntax"

**Symptoms:**
```
SyntaxError: Unexpected token } in JSON
Invalid JSON configuration
```

**Root Cause:** Missing commas, quotes, or brackets in configuration file

**Solutions:**

1. **Validate JSON syntax:**
   ```bash
   # For Claude Code
   python -m json.tool .mcp.json

   # For OpenCode
   python -m json.tool ~/.config/opencode/opencode.json

   # For Claude Desktop
   python -m json.tool ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. **Common JSON errors:**
   ```json
   // WRONG - missing comma
   {
     "server": "f5xc",
     "enabled": true     // <- missing comma here
     "debug": false
   }

   // RIGHT
   {
     "server": "f5xc",
     "enabled": true,
     "debug": false
   }
   ```

3. **Use an editor with JSON validation:**
   ```bash
   # VS Code automatically validates JSON
   code ~/.config/opencode/opencode.json

   # Or use vim with syntax checking
   vim ~/.config/opencode/opencode.json
   ```

**Verification:**
```bash
# After fixing JSON, validate again
python -m json.tool <config-file>
# Should show formatted JSON without errors
```

---

## Platform-Specific Issues

### Claude Code Issues

**Issue: Server not showing up**

**Solutions:**
1. **Verify `.mcp.json` exists:**
   ```bash
   cat .mcp.json | grep f5xc-cloudstatus
   ```

2. **Check JSON syntax:**
   ```bash
   python -m json.tool .mcp.json
   ```

3. **Verify package can be accessed:**
   ```bash
   npx -y @robinmordasiewicz/f5xc-cloudstatus-mcp@latest --version
   ```

4. **Try using local build:**
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

---

### OpenCode Issues

**Issue: Server not appearing after configuration**

**Solutions:**
1. **Verify configuration location:**
   ```bash
   ls -la ~/.config/opencode/opencode.json
   cat ~/.config/opencode/opencode.json | grep f5xc-cloudstatus
   ```

2. **Check JSON syntax:**
   ```bash
   python -m json.tool ~/.config/opencode/opencode.json
   ```

3. **Restart OpenCode:**
   ```bash
   # Kill and restart OpenCode
   pkill opencode
   opencode
   ```

4. **Check MCP configuration structure:**
   ```bash
   # Should have "mcp" object with server configuration
   cat ~/.config/opencode/opencode.json | grep -A 5 '"mcp"'
   ```

---

### VS Code Issues

**Issue: "VS Code version too old"**

**Solutions:**
1. **Check VS Code version:**
   ```bash
   code --version
   # Should be 1.96.0 or higher
   ```

2. **Update VS Code:**
   ```bash
   # Using Homebrew (macOS)
   brew upgrade visual-studio-code

   # Or download latest from https://code.visualstudio.com
   ```

**Issue: Server not showing in chat**

**Solutions:**
1. **Verify configuration was created:**
   ```bash
   cat ~/.config/Code/User/settings.json | grep f5xc-cloudstatus
   ```

2. **Reload VS Code:**
   - Press Cmd+Shift+P (macOS) or Ctrl+Shift+P (Windows/Linux)
   - Type "Developer: Reload Window"
   - Press Enter

3. **Use `--add-mcp` command instead:**
   ```bash
   code --add-mcp '{"name":"f5xc-cloudstatus","command":"npx","args":["-y","@robinmordasiewicz/f5xc-cloudstatus-mcp@latest"]}'
   ```

4. **Check JSON syntax:**
   ```bash
   python -m json.tool ~/.config/Code/User/settings.json
   ```

---

### Claude Desktop Issues

**Issue: Server not appearing after restart**

**Solutions:**
1. **Verify configuration was saved:**
   ```bash
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | grep f5xc-cloudstatus
   ```

2. **Check JSON syntax:**
   ```bash
   python -m json.tool ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

3. **Fully restart Claude Desktop:**
   ```bash
   # Close completely
   pkill -f "Claude" || killall Claude

   # Wait 2 seconds
   sleep 2

   # Relaunch
   open -a Claude
   ```

4. **Restore from backup if corrupted:**
   ```bash
   cp ~/Library/Application\ Support/Claude/claude_desktop_config.json.backup ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

**Issue: "It just keeps asking for Node to be installed"**

**Solutions:**
1. **Verify Node.js PATH:**
   ```bash
   which node
   which npm
   ```

2. **Check Node.js installation:**
   ```bash
   node --version  # Should be v18.0.0+
   npm --version
   ```

3. **Update PATH for Claude Desktop:**
   Claude Desktop may need to read your shell profile. Add Node.js to your PATH:
   ```bash
   # In ~/.zshrc or ~/.bash_profile
   export PATH="/usr/local/bin:$PATH"
   ```

---

## API Connectivity Issues

**Issue: "F5 Cloud API not responding"**

**Symptoms:**
```
No response from API
Timeout errors
Empty results
```

**Root Cause:**
- F5 Cloud API is temporarily unavailable
- Network connectivity issue
- Incorrect API URL

**Solutions:**

1. **Check F5 Cloud Status:**
   ```bash
   # Visit the status page
   open https://www.f5cloudstatus.com
   ```

2. **Verify network connectivity:**
   ```bash
   # Test connection to F5 API
   curl -I https://www.f5cloudstatus.com/api/v2/overall

   # Should return HTTP 200
   ```

3. **Check firewall/proxy settings:**
   - Ensure firewall allows outbound HTTPS connections
   - Check if proxy is interfering with API calls

4. **Wait and retry:**
   - If F5 Cloud is experiencing issues, wait and try again

---

## Performance Issues

**Issue: Slow response times**

**Symptoms:**
```
Responses taking > 10 seconds
Timeout errors
```

**Root Cause:**
- Network latency
- F5 Cloud API slow
- System resources constrained

**Solutions:**

1. **Check network speed:**
   ```bash
   # Test connection
   curl -w "@curl-format.txt" -o /dev/null -s https://www.f5cloudstatus.com/api/v2/overall
   ```

2. **Check system resources:**
   ```bash
   # View CPU and memory usage
   top -l 1 | head -20
   ```

3. **Retry with patience:**
   - F5 Cloud API may have temporary delays
   - Expected response time is typically < 5 seconds

---

## Getting Help

If you can't resolve your issue:

1. **Check Documentation:**
   - Review the platform-specific guide you're using
   - Check [Home](../index.md) for general information

2. **Verify Prerequisites:**
   - Node.js 18.0.0+ installed
   - npm available
   - Internet connection working
   - F5 Cloud API accessible

3. **Gather Diagnostic Information:**
   ```bash
   # System information
   node --version
   npm --version
   code --version  # (if using VS Code)

   # Configuration (sanitized)
   cat .mcp.json | head -20  # (if using Claude Code)

   # Network test
   curl -I https://www.f5cloudstatus.com/api/v2/overall
   ```

4. **Report Issues:**
   - GitHub Issues: https://github.com/robinmordasiewicz/f5xc-cloudstatus-mcp/issues
   - Include diagnostic information from above
   - Include the exact error message and steps to reproduce

---

**Last Updated:** January 2026
**Version:** 1.3.0+
**Status Page:** https://www.f5cloudstatus.com
