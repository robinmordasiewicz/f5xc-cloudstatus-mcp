# Quick Setup Guide for MCPB GitHub Actions

## 📦 What You Get

This setup provides automated MCPB package building and publishing without committing large files to your repository:

1. **Automatic builds** on every push to validate package creation
2. **Automatic publishing** to GitHub Releases when you tag a version
3. **Local testing script** to validate before pushing
4. **Comprehensive documentation**

## 🚀 Installation Steps

### Step 1: Add Workflow Files

Copy the workflow files to your repository:

```bash
# Create workflows directory if it doesn't exist
mkdir -p .github/workflows

# Add the build workflow (runs on every push)
cp build-mcpb.yml .github/workflows/

# Add the publish workflow (runs on version tags)
cp publish-mcpb.yml .github/workflows/
```

### Step 2: Make Test Script Executable

```bash
# Copy the test script to your repository root
cp test-build.sh ./

# Make it executable
chmod +x test-build.sh
```

### Step 3: Add Documentation

```bash
# Copy the documentation
cp MCPB_PUBLISHING.md ./docs/
# or place it in your repository root
```

### Step 4: Commit and Push

```bash
git add .github/workflows/build-mcpb.yml
git add .github/workflows/publish-mcpb.yml
git add test-build.sh
git add docs/MCPB_PUBLISHING.md
git commit -m "Add MCPB build and publish workflows"
git push origin main
```

## ✅ Verify Setup

1. **Check Actions Tab**: Go to your repository's Actions tab
2. **Verify Workflows**: You should see two workflows listed:
   - "Build MCPB Package"
   - "Build and Publish MCPB Package"
3. **First Build**: The build workflow should run automatically on your push

## 🎯 First Release

To publish your first release:

```bash
# 1. Test locally first
./test-build.sh

# 2. Update version in package.json (if needed)
npm version 1.0.0

# 3. Create and push the tag
git tag v1.0.0
git push origin v1.0.0

# 4. Watch the Actions tab for the publish workflow
# 5. Check Releases tab for your published package
```

## 🔍 What Each Workflow Does

### Build Workflow (`build-mcpb.yml`)

**Runs on**: Every push to `main` or `develop`, all PRs

**Does**:
- ✅ Validates `manifest.json`
- 🔨 Builds MCPB package  
- ✔️ Verifies package integrity
- 📦 Saves artifact (7 days)
- 📊 Creates build summary

**Purpose**: Continuous validation - catches issues early

### Publish Workflow (`publish-mcpb.yml`)

**Runs on**: Version tags (v1.0.0, v2.1.3, etc.)

**Does**:
- 🔨 Builds MCPB package
- 🏷️ Extracts version from tag
- 📝 Generates release notes
- 🚀 Creates GitHub Release
- 📎 Attaches `.mcpb` file
- 💾 Archives artifact (30 days)

**Purpose**: Automated releases - no manual uploads needed

## 🛠️ Customization Options

### Change Trigger Branches

Edit `build-mcpb.yml`:

```yaml
on:
  push:
    branches:
      - main
      - develop
      - feature/*  # Add more branches
```

### Customize Release Notes

Edit the "Generate release notes" step in `publish-mcpb.yml` to match your needs.

### Adjust Artifact Retention

Change retention days in either workflow:

```yaml
retention-days: 7  # or any number you prefer
```

### Add Additional Build Steps

Add steps before or after the build in either workflow:

```yaml
- name: Run tests
  run: npm test

- name: Lint code
  run: npm run lint
```

## 🔧 Troubleshooting

### Workflow doesn't appear in Actions tab

- Ensure files are in `.github/workflows/` directory
- Check file extension is `.yml` not `.yaml`
- Verify file syntax with a YAML validator

### Build fails on first run

Common causes:
- Missing `manifest.json` in repository root
- Invalid `manifest.json` JSON syntax
- Missing `package.json` or incorrect format
- Dependencies not properly specified

Run `./test-build.sh` locally to diagnose issues.

### Tag push doesn't trigger publish

- Verify tag format: must be `v*.*.*` (e.g., `v1.0.0`)
- Ensure tag was pushed: `git push origin --tags`
- Check Actions tab for error logs

### "No .mcpb file found" error

- Verify `mcpb pack` works locally: `npm install -g @anthropic-ai/mcpb && mcpb pack`
- Check `manifest.json` is valid
- Review workflow logs for mcpb CLI errors

## 📊 Monitoring

### View Workflow Status

```bash
# Using GitHub CLI
gh run list

# View specific run
gh run view [RUN_ID]

# View logs
gh run view [RUN_ID] --log
```

### Check Artifact Storage

- Go to repository Settings → Actions → Artifacts
- Monitor storage usage (artifacts auto-expire)

## 🎓 Best Practices

1. **Test locally first**: Always run `./test-build.sh` before pushing
2. **Semantic versioning**: Use proper version numbers (v1.0.0, not v1)
3. **Clean commits**: Don't commit `.mcpb` files to repository
4. **Review logs**: Check Actions tab after each push
5. **Update docs**: Keep CHANGELOG.md or release notes current

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [MCPB Specification](https://github.com/anthropics/mcpb)
- [Semantic Versioning](https://semver.org/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

## 🤝 Need Help?

- Check workflow logs in Actions tab
- Review `MCPB_PUBLISHING.md` for detailed information
- Run `./test-build.sh` to validate locally
- Open an issue on GitHub

## ✨ Success Indicators

You'll know everything is working when:

1. ✅ Build workflow completes successfully on push
2. ✅ Artifacts appear in Actions → workflow run
3. ✅ Version tag creates a new Release
4. ✅ `.mcpb` file is attached to Release
5. ✅ Users can download and install your package

---

**🎉 That's it! Your MCPB package is now automatically built and published via GitHub Actions.**
