# MCPB Package Publishing with GitHub Actions

This repository uses GitHub Actions to automatically build and publish MCPB (MCP Bundle) packages without committing the large (~35MB) package file to the repository.

## 📋 Overview

Two workflows handle the MCPB package lifecycle:

1. **Build MCPB Package** (`build-mcpb.yml`) - Builds and validates on every push
2. **Build and Publish MCPB Package** (`publish-mcpb.yml`) - Publishes to GitHub Releases on version tags

## 🚀 Quick Start

### Prerequisites

1. Ensure your repository has a valid `manifest.json` in the root
2. Ensure `package.json` is properly configured
3. All dependencies listed in `package.json`

### Publishing a New Release

#### Method 1: Automatic (Recommended)

1. **Update version in `package.json`**:
   ```bash
   npm version patch  # or minor, major
   ```

2. **Push the version tag**:
   ```bash
   git push origin v1.0.0
   ```

3. **GitHub Actions automatically**:
   - Builds the MCPB package
   - Creates a GitHub Release
   - Attaches the `.mcpb` file
   - Generates release notes

#### Method 2: Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select **Build and Publish MCPB Package**
3. Click **Run workflow**
4. Enter the version number (e.g., `1.0.0`)
5. Click **Run workflow**

## 📁 Workflow Files

### `.github/workflows/build-mcpb.yml`

**Triggers**: Push to `main` or `develop`, Pull Requests

**Purpose**: Continuous validation

**Actions**:
- ✅ Validates `manifest.json` syntax
- 🔨 Builds MCPB package
- ✔️ Verifies package integrity
- 📦 Uploads build artifact (7-day retention)
- 📊 Generates build summary

### `.github/workflows/publish-mcpb.yml`

**Triggers**: 
- Push of version tags (e.g., `v1.0.0`)
- Manual workflow dispatch

**Purpose**: Release publication

**Actions**:
- 🔨 Builds MCPB package
- 🏷️ Extracts version info
- 📝 Generates release notes
- 🚀 Creates GitHub Release
- 📦 Attaches `.mcpb` file
- 💾 Archives artifact (30-day retention)

## 🛠️ Local Testing

Test the build locally before pushing:

```bash
# Install MCPB CLI
npm install -g @anthropic-ai/mcpb

# Install dependencies
npm ci

# Build the package
mcpb pack

# Verify the output
ls -lh *.mcpb
```

## 📝 Release Notes

Release notes are automatically generated with:
- Installation instructions
- Feature highlights
- Links to documentation
- NPM package reference

## 🔒 Security

The workflows use:
- `permissions: contents: write` (minimal required)
- `GITHUB_TOKEN` (automatic, no secrets needed)
- Artifact retention limits
- Secure checkout actions

## 📦 GitHub Releases

After publishing, users can:

1. **One-click installation**: Download `.mcpb` and double-click
2. **Direct download**: Get specific versions from Releases
3. **NPX installation**: Use `npx f5cloudstatus-mcp@latest`

## 🐛 Troubleshooting

### Build fails with "No .mcpb file found"

- Verify `manifest.json` exists and is valid
- Check `mcpb pack` runs locally without errors
- Review the build logs in GitHub Actions

### Version tag doesn't trigger publish

- Ensure tag format is `v*.*.*` (e.g., `v1.0.0`)
- Check if tag was pushed: `git push origin --tags`
- Verify workflow file is in `.github/workflows/`

### Package size too large

- Review `node_modules` - use `--production` flag
- Check for unnecessary files in the bundle
- Consider `.mcpbignore` file (similar to `.npmignore`)

## 📖 Additional Resources

- [MCPB Specification](https://github.com/anthropics/mcpb/blob/main/README.md)
- [Manifest Documentation](https://github.com/anthropics/mcpb/blob/main/MANIFEST.md)
- [MCPB Examples](https://github.com/anthropics/mcpb/tree/main/examples)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 🤝 Contributing

When contributing:

1. Changes trigger automatic builds
2. PR builds validate package creation
3. Merge to `main` creates development build
4. Version tags create public releases

## 📋 Workflow Status

Check the status of workflows:

```bash
# View recent workflow runs
gh run list

# View specific workflow
gh run view [RUN_ID]
```

## 🎯 Best Practices

1. **Version tags**: Always use semantic versioning (v1.0.0, v1.2.3)
2. **Test locally**: Run `mcpb pack` before pushing
3. **Update changelog**: Document changes before releases
4. **Validate manifest**: Ensure JSON is valid before committing
5. **Review artifacts**: Check build artifacts in Actions tab

## 🔄 Versioning Strategy

```bash
# Patch release (bug fixes): 1.0.0 → 1.0.1
npm version patch

# Minor release (new features): 1.0.1 → 1.1.0  
npm version minor

# Major release (breaking changes): 1.1.0 → 2.0.0
npm version major

# Push the created tag
git push origin [TAG_NAME]
```

## 📞 Support

For issues:
- GitHub Issues: [Repository Issues](https://github.com/robinmordasiewicz/f5cloudstatus-mcp/issues)
- Workflow problems: Check Actions tab logs
- MCPB format: See [anthropics/mcpb](https://github.com/anthropics/mcpb)
