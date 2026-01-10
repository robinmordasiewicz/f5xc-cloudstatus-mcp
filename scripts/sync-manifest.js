#!/usr/bin/env node
// Copyright (c) 2026 Robin Mordasiewicz. MIT License.

/**
 * Sync version and metadata from package.json to manifest.json
 * Ensures consistency between npm package and MCP manifest
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const packagePath = resolve(process.cwd(), 'package.json');
const manifestPath = resolve(process.cwd(), 'manifest.json');

try {
  // Read both files
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  const manifestJson = JSON.parse(readFileSync(manifestPath, 'utf8'));

  // Extract package.json data
  const { version, name, description, author, repository, homepage, license } = packageJson;

  // Update manifest.json
  manifestJson.version = version;
  manifestJson.name = name;
  manifestJson.description = description;

  // Sync author
  if (typeof author === 'string') {
    manifestJson.author = {
      name: author,
      email: manifestJson.author?.email || '',
      url: manifestJson.author?.url || '',
    };
  } else if (author && typeof author === 'object') {
    manifestJson.author = {
      name: author.name || '',
      email: author.email || '',
      url: author.url || '',
    };
  }

  // Sync repository
  if (repository && typeof repository === 'object') {
    manifestJson.repository = repository;
  }

  // Sync homepage
  if (homepage) {
    manifestJson.homepage = homepage;
  }

  // Sync license
  if (license) {
    manifestJson.license = license;
  }

  // Write updated manifest
  writeFileSync(manifestPath, JSON.stringify(manifestJson, null, 2) + '\n');

  console.log('✅ Synced manifest.json from package.json:');
  console.log(`   - version: ${version}`);
  console.log(`   - name: ${name}`);
  console.log(`   - description: ${description}`);
  console.log(`   - license: ${license}`);
} catch (error) {
  console.error('❌ Error syncing manifest:', error.message);
  process.exit(1);
}
