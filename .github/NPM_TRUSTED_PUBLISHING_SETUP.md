# NPM Trusted Publishing Setup Guide

This guide explains how to set up npm Trusted Publishing with OpenID Connect (OIDC) for automated, secure package publishing from GitHub Actions.

## What is Trusted Publishing?

**npm Trusted Publishing** (Generally Available since July 2025) allows you to publish packages from GitHub Actions without storing npm tokens. Instead, it uses OpenID Connect (OIDC) for authentication, providing:

✅ **No token management** - No need to store, rotate, or expose npm tokens
✅ **Automatic provenance** - Cryptographic proof of source and build environment
✅ **Enhanced security** - Short-lived, workflow-specific credentials
✅ **Supply chain integrity** - Verifiable build attestations via Sigstore

## Prerequisites

- npm CLI v11.5.1 or later (used in GitHub Actions)
- Your package must be built on GitHub-hosted runners (not self-hosted)
- Repository must be public (provenance not available for private repos)

## Setup Steps

### Step 1: Configure npm Trusted Publisher

1. **Go to your package settings on npm:**
   - Visit: https://www.npmjs.com/package/f5cloudstatus-mcp-server/access
   - Or navigate to: Package → Settings → Publishing Access

2. **Add a Trusted Publisher:**
   - Click "Add Trusted Publisher"
   - Select "GitHub Actions"
   - Fill in the details:

   ```
   Organization/User: robinmordasiewicz
   Repository: f5cloudstatus-mcp-server
   Workflow filename: publish.yml
   Environment name: npm-production (optional but recommended)
   ```

3. **Save the configuration**

### Step 2: Create GitHub Environment (Recommended)

Using a GitHub environment adds an extra security layer and matches the npm configuration.

1. **Go to your GitHub repository:**
   - Navigate to: Settings → Environments
   - Click "New environment"

2. **Create environment:**
   - Name: `npm-production`
   - (Optional) Add protection rules:
     - Required reviewers
     - Wait timer
     - Deployment branches (e.g., only `main`)

3. **Save the environment**

### Step 3: GitHub Actions Workflow

The workflow is already configured in `.github/workflows/publish.yml`

Key requirements:
```yaml
permissions:
  id-token: write  # Required for OIDC
  attestations: write  # Required for provenance

environment: npm-production  # Must match npm configuration
```

### Step 4: Test the Workflow

1. **Create a new release:**
   ```bash
   # Update version
   npm version patch  # or minor, or major

   # Push changes and tags
   git push && git push --tags

   # Create GitHub release
   gh release create v1.0.2 --generate-notes
   ```

2. **Monitor the workflow:**
   - Go to Actions tab in GitHub
   - Watch the "Publish to npm with Trusted Publishing" workflow
   - Verify successful completion

3. **Verify provenance:**
   ```bash
   npm audit signatures --package-lock-only f5cloudstatus-mcp-server
   ```

## Workflow Configuration

### Trusted Publishing with OIDC (publish.yml)

No tokens required! Authentication via OIDC with automatic provenance attestations.

**Setup required:**
- Configure Trusted Publisher on npm (see Step 1)
- (Optional) Create GitHub environment (see Step 2)

## Workflow Triggers

The workflow triggers on:
```yaml
on:
  release:
    types: [created]
```

To publish:
```bash
# 1. Update version
npm version patch

# 2. Push changes
git push && git push --tags

# 3. Create GitHub release
gh release create v1.0.2 --generate-notes
```

## Environment Configuration

### Why use a GitHub Environment?

1. **Additional security controls:**
   - Require manual approval before publishing
   - Restrict which branches can publish
   - Add deployment protection rules

2. **Matches npm trusted publisher configuration:**
   - Environment name must match exactly
   - Provides audit trail
   - Clear separation of deployment contexts

### Environment Name

The environment name `npm-production` is:
- ✅ **Optional** for basic trusted publishing
- ✅ **Recommended** for production packages
- ⚠️ **Must match** if you specify it in npm trusted publisher config

If you don't want to use environments:
1. Remove `environment: npm-production` from the workflow
2. Don't specify environment name in npm trusted publisher setup

## Troubleshooting

### Workflow fails with "Unable to authenticate"

**Solution:**
- Verify trusted publisher is configured on npm
- Check that organization/repository/workflow filename match exactly
- Ensure `id-token: write` permission is set

### Provenance not appearing

**Solution:**
- Use GitHub-hosted runners (not self-hosted)
- Ensure repository is public
- Verify npm CLI version >= 11.5.1

### Environment not found

**Solution:**
- Create environment in GitHub Settings → Environments
- Ensure name matches exactly: `npm-production`
- Or remove `environment:` from workflow if not using

## Security Best Practices

1. ✅ **Use Trusted Publishing** (OIDC) instead of tokens
2. ✅ **Enable GitHub environment protection** for production
3. ✅ **Require code review** before releases
4. ✅ **Use branch protection** on main/master
5. ✅ **Monitor npm audit signatures** for package verification

## Migration from Token-based Publishing

If you're currently using npm tokens:

1. **Add Trusted Publisher** on npm (don't remove token yet)
2. **Test the OIDC workflow** with a new release
3. **Verify provenance** is working correctly
4. **Remove npm token** from GitHub Secrets
5. **Delete old token-based workflow** if you have one

## Verifying Published Packages

Users can verify your package provenance:

```bash
# Install and verify
npm install f5cloudstatus-mcp-server
npm audit signatures

# Or verify specific version
npm audit signatures f5cloudstatus-mcp-server@1.0.1
```

This shows:
- ✅ Package signature verification
- ✅ Build provenance attestation
- ✅ Sigstore transparency log entry

## Resources

- [npm Trusted Publishing Docs](https://docs.npmjs.com/trusted-publishers/)
- [npm Provenance Documentation](https://docs.npmjs.com/generating-provenance-statements/)
- [GitHub OIDC Documentation](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [GitHub Environments](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/managing-environments-for-deployment)

## Quick Reference

```bash
# Update version and publish
npm version patch
git push && git push --tags
gh release create v1.0.x --generate-notes

# Verify published package
npm audit signatures f5cloudstatus-mcp-server
```

---

**Last Updated:** October 2025
**npm Trusted Publishing:** Generally Available (July 2025)
**Minimum npm CLI:** v11.5.1
