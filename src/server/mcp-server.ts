// Copyright (c) 2026 Robin Mordasiewicz. MIT License.

/**
 * MCP Server for F5 Cloud Status
 * Main server implementation using MCP SDK
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

import { createDataAccessLayer } from '../data-access/index.js';
import { createCacheService } from '../cache/index.js';
import {
  createStatusService,
  createComponentService,
  createIncidentService,
} from '../services/index.js';
import { createToolHandler } from '../tools/index.js';
import { allTools } from '../tools/tool-definitions.js';
import { logger } from '../utils/logger.js';
import { isF5StatusError, getErrorMessage } from '../utils/errors.js';

/**
 * MCP Server class
 */
export class MCPServer {
  private server: Server;
  private dataAccess: ReturnType<typeof createDataAccessLayer>;
  private cache: ReturnType<typeof createCacheService>;
  private toolHandler: ReturnType<typeof createToolHandler>;

  constructor() {
    // Initialize server
    this.server = new Server(
      {
        name: 'f5xc-cloudstatus-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize dependencies
    this.dataAccess = createDataAccessLayer();
    this.cache = createCacheService('f5-status');

    // Initialize services
    const statusService = createStatusService(this.dataAccess, this.cache);
    const componentService = createComponentService(this.dataAccess, this.cache);
    const incidentService = createIncidentService(this.dataAccess, this.cache);

    // Initialize tool handler
    this.toolHandler = createToolHandler(statusService, componentService, incidentService);

    // Setup handlers
    this.setupHandlers();

    // Setup error handling
    this.setupErrorHandling();

    logger.info('MCP Server initialized');
  }

  /**
   * Setup MCP protocol handlers
   */
  private setupHandlers(): void {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.debug('Handling ListTools request');
      return {
        tools: allTools,
      };
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      logger.info(`Handling CallTool request: ${name}`);

      try {
        const result = await this.toolHandler.handleTool(name, args || {});

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        logger.error(`Tool execution error: ${name}`, error);

        const errorMessage = getErrorMessage(error);
        const errorDetails = isF5StatusError(error)
          ? { code: error.code, details: error.details }
          : {};

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                {
                  error: errorMessage,
                  ...errorDetails,
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      logger.error('MCP Server error', error);
    };

    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully');
      await this.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully');
      await this.close();
      process.exit(0);
    });
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    logger.info('Starting MCP Server');

    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    logger.info('MCP Server started and listening on stdio');
  }

  /**
   * Close server and cleanup resources
   */
  async close(): Promise<void> {
    logger.info('Closing MCP Server');

    try {
      await this.dataAccess.close();
      this.cache.clear();
      await this.server.close();
      logger.info('MCP Server closed successfully');
    } catch (error) {
      logger.error('Error closing MCP Server', error);
      throw error;
    }
  }
}

/**
 * Create and start MCP server
 */
export async function startServer(): Promise<MCPServer> {
  const server = new MCPServer();
  await server.start();
  return server;
}
