# CI/CD Pipeline Guide

## Automated Publishing Workflow

This repository has a fully automated CI/CD pipeline that publishes packages on every push to `main`.

### How It Works

1. **Make your code changes** in any source file
2. **Manually bump the version** in both `package.json` and `manifest.json`
3. **Commit and push** to main
4. **Automation handles the rest**:
   - Builds the TypeScript code
   - Creates MCPB package
   - Creates GitHub Release
   - Publishes to GitHub Packages (npm registry)
   - Uploads artifacts

### Version Bumping

Before pushing your changes, update the version in **both files**:

**package.json:**
```json
{
  "version": "1.0.9"
}
```

**manifest.json:**
```json
{
  "version": "1.0.9"
}
```

### Workflow Triggers

The auto-publish workflow triggers on push to `main` for:
- Source code changes (`src/**`)
- Configuration changes
- Dependency updates
- Any file **except** `.github/**`, `README.md`, `LICENSE`, `docs/**`

### What Gets Published

Each successful run publishes:

1. **MCPB Package**: `f5cloudstatus-mcp-{version}.mcpb`
   - Attached to GitHub Release
   - Available for one-click installation in Claude Desktop

2. **GitHub Release**: `v{version}`
   - Includes MCPB file as asset
   - Auto-generated release notes
   - Installation instructions

3. **GitHub Package**: `@robinmordasiewicz/f5cloudstatus-mcp@{version}`
   - Published to GitHub npm registry
   - Installable via npm

### Installation Methods

**From GitHub Release (MCPB):**
1. Go to Releases
2. Download the `.mcpb` file
3. Double-click to install in Claude Desktop

**From GitHub Packages (npm):**
```bash
npm install @robinmordasiewicz/f5cloudstatus-mcp@1.0.9 --registry=https://npm.pkg.github.com
```

**From npm registry:**
```bash
npx -y f5cloudstatus-mcp@1.0.9
```

### Example Workflow

```bash
# 1. Make your changes
vim src/index.ts

# 2. Update versions (both files)
# package.json: "version": "1.0.10"
# manifest.json: "version": "1.0.10"

# 3. Commit and push
git add .
git commit -m "Add new feature"
git push origin main

# 4. CI/CD automatically:
#    - Checks version not already published
#    - Builds everything
#    - Creates tag v1.0.10
#    - Publishes all packages
```

### Monitoring Builds

Check workflow status:
```bash
gh run list --workflow=auto-publish.yml
gh run watch <run-id>
```

View releases:
```bash
gh release list
```

### Troubleshooting

**Error: "Current version is already published"**
- Solution: Bump version in both `package.json` and `manifest.json`

**Build fails on dependencies**
- Solution: Run `npm ci` locally to verify dependencies install correctly

**MCPB validation fails**
- Solution: Check `manifest.json` follows MCPB schema (see [MANIFEST.md](https://github.com/anthropics/mcpb/blob/main/MANIFEST.md))

### Disabling Auto-Publish

To disable automatic publishing, rename the workflow:
```bash
mv .github/workflows/auto-publish.yml .github/workflows/auto-publish.yml.disabled
```
