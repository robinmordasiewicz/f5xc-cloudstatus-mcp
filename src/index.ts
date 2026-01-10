// Copyright (c) 2026 Robin Mordasiewicz. MIT License.

#!/usr/bin/env node

/**
 * F5 Cloud Status MCP Server
 * Entry point for the MCP server
 */

import { startServer } from './server/index.js';
import { logger } from './utils/logger.js';
import { validateConfig } from './utils/config.js';

/**
 * Main function
 */
async function main() {
  try {
    // Validate configuration
    validateConfig();
    logger.info('Configuration validated successfully');

    // Start server
    await startServer();
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Run main function
main();
