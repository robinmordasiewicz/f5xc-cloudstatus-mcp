# CI/CD Pipeline Guide

## Fully Automated Publishing Workflow

This repository has a **fully automated CI/CD pipeline** that handles version bumping and publishing on every push to `main`.

### 🚀 How It Works (Zero Manual Steps!)

1. **Make your code changes** in any source file
2. **Commit and push** to main
3. **Automation handles EVERYTHING**:
   - ✅ **Auto-detects** if version needs bumping
   - ✅ **Auto-increments** version in both `package.json` and `manifest.json`
   - ✅ **Determines bump type** from commit messages (major/minor/patch)
   - ✅ **Commits version bump** back to the repository
   - ✅ Builds the TypeScript code
   - ✅ Creates MCPB package
   - ✅ Creates GitHub Release with tag
   - ✅ Publishes to GitHub Packages (npm registry)
   - ✅ Uploads artifacts

## Version Bumping Strategy

### Conventional Commits (Automatic Detection)

The workflow automatically determines the version bump type from your commit messages:

| Commit Message Pattern | Bump Type | Example |
|------------------------|-----------|---------|
| `BREAKING CHANGE:`, `feat!:`, `fix!:` | **Major** (1.0.0 → 2.0.0) | `feat!: redesign API` |
| `feat:`, `feat(scope):` | **Minor** (1.0.0 → 1.1.0) | `feat: add new tool` |
| Everything else | **Patch** (1.0.0 → 1.0.1) | `fix: correct typo`, `docs: update README` |

### Examples

**Adding a new feature:**
```bash
git commit -m "feat: add incident filtering capability"
# Auto-bumps: 1.0.13 → 1.1.0
```

**Bug fix or small change:**
```bash
git commit -m "fix: correct status parsing"
# Auto-bumps: 1.0.13 → 1.0.14
```

**Breaking change:**
```bash
git commit -m "feat!: redesign tool parameter structure"
# Auto-bumps: 1.0.13 → 2.0.0
```

**Regular update (no conventional commit format):**
```bash
git commit -m "update manifest keywords"
# Auto-bumps: 1.0.13 → 1.0.14 (defaults to patch)
```

## Workflow Triggers

The auto-publish workflow triggers on push to `main` for:
- Source code changes (`src/**`)
- Configuration changes
- Dependency updates
- Any file **except** `.github/**`, `README.md`, `LICENSE`, `docs/**`

**Note**: The version bump commit includes `[skip ci]` to prevent infinite loops.

## What Gets Published

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

## Installation Methods

**From GitHub Release (MCPB):**
1. Go to Releases
2. Download the `.mcpb` file
3. Double-click to install in Claude Desktop

**From GitHub Packages (npm):**
```bash
npm install @robinmordasiewicz/f5cloudstatus-mcp@1.0.14 --registry=https://npm.pkg.github.com
```

**From npm registry:**
```bash
npx -y f5cloudstatus-mcp@1.0.14
```

## Example Workflow (Fully Automated)

```bash
# 1. Make your changes
vim src/index.ts

# 2. Commit with conventional commit format (optional but recommended)
git add .
git commit -m "feat: add caching to API calls"

# 3. Push to main
git push origin main

# 4. CI/CD automatically:
#    ✅ Detects v1.0.13 tag already exists
#    ✅ Analyzes commit: "feat:" → minor bump
#    ✅ Bumps version: 1.0.13 → 1.1.0
#    ✅ Updates package.json and manifest.json
#    ✅ Commits: "chore: bump version to 1.1.0 [skip ci]"
#    ✅ Pushes version bump commit
#    ✅ Builds everything
#    ✅ Creates tag v1.1.0
#    ✅ Publishes all packages
```

## Monitoring Builds

Check workflow status:
```bash
gh run list --workflow=auto-publish.yml
gh run watch <run-id>
```

View releases:
```bash
gh release list
gh release view v1.1.0
```

View version bump commits:
```bash
git log --oneline --grep="chore: bump version"
```

## Manual Version Control (Optional)

If you prefer manual control, you can still bump versions manually:

1. Update version in **both** `package.json` and `manifest.json`
2. Commit and push
3. Workflow will detect the new version and publish without auto-bumping

Example:
```bash
# Manually set version to 2.0.0
# Edit package.json: "version": "2.0.0"
# Edit manifest.json: "version": "2.0.0"

git add package.json manifest.json
git commit -m "chore: bump version to 2.0.0"
git push origin main

# Workflow publishes v2.0.0 (no auto-bump since version is new)
```

## Troubleshooting

**Workflow skipped version bump:**
- Check if version in `package.json` doesn't have an existing tag
- Verify commit doesn't contain `[skip ci]` flag

**Build fails on dependencies:**
- Solution: Run `npm ci` locally to verify dependencies install correctly

**MCPB validation fails:**
- Solution: Check `manifest.json` follows MCPB schema (see [MANIFEST.md](https://github.com/anthropics/mcpb/blob/main/MANIFEST.md))

**Wrong bump type applied:**
- Solution: Use conventional commit format in your commit messages
- Reference: [Conventional Commits](https://www.conventionalcommits.org/)

## Disabling Auto-Versioning

To disable automatic version bumping while keeping auto-publish:

Edit `.github/workflows/auto-publish.yml` and replace the "Auto-bump version if needed" step with:

```yaml
- name: Check version
  id: version_bump
  run: |
    CURRENT_VERSION=$(jq -r '.version' package.json)
    if git rev-parse "v${CURRENT_VERSION}" >/dev/null 2>&1; then
      echo "Error: Version v${CURRENT_VERSION} already published"
      echo "Please bump version manually in package.json and manifest.json"
      exit 1
    fi
    echo "version=$CURRENT_VERSION" >> $GITHUB_OUTPUT
```

## Disabling Auto-Publish Completely

To disable the entire automatic publishing workflow:

```bash
mv .github/workflows/auto-publish.yml .github/workflows/auto-publish.yml.disabled
```
