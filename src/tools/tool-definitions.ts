/**
 * MCP Tool Definitions
 * Defines all available MCP tools for F5 Status monitoring
 */

import { z } from 'zod';

/**
 * Tool: Get Overall Status
 * Returns the current overall status of F5 Cloud services
 */
export const getOverallStatusTool = {
  name: 'f5-status-get-overall',
  description:
    'Get the current overall status of F5 Cloud services including operational state and service health indicator',
  inputSchema: {
    type: 'object' as const,
    properties: {},
    required: [],
  },
};

/**
 * Tool: Get Components
 * Returns all F5 Cloud service components with their current status
 */
export const getComponentsTool = {
  name: 'f5-status-get-components',
  description:
    'Get all F5 Cloud service components with their current operational status, organized by category (Distributed Cloud Services, XC App Stack, etc.)',
  inputSchema: {
    type: 'object' as const,
    properties: {
      status: {
        type: 'string',
        description: 'Filter components by status',
        enum: ['none', 'minor', 'major', 'critical'],
      },
      group: {
        type: 'string',
        description: 'Filter components by group name',
      },
    },
    required: [],
  },
};

/**
 * Tool: Get Component
 * Returns details about a specific component by ID or name
 */
export const getComponentTool = {
  name: 'f5-status-get-component',
  description: 'Get detailed information about a specific F5 Cloud service component by ID or name',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: {
        type: 'string',
        description: 'Component ID',
      },
      name: {
        type: 'string',
        description: 'Component name',
      },
    },
    required: [],
  },
};

/**
 * Tool: Get Incidents
 * Returns active and recent incidents affecting F5 Cloud services
 */
export const getIncidentsTool = {
  name: 'f5-status-get-incidents',
  description:
    'Get current and recent incidents affecting F5 Cloud services, including status updates and affected components',
  inputSchema: {
    type: 'object' as const,
    properties: {
      status: {
        type: 'string',
        description: 'Filter incidents by status',
        enum: ['investigating', 'identified', 'monitoring', 'resolved', 'postmortem'],
      },
      impact: {
        type: 'string',
        description: 'Filter incidents by impact level',
        enum: ['none', 'minor', 'major', 'critical'],
      },
      days: {
        type: 'number',
        description: 'Get incidents from the last N days (default: 7)',
        minimum: 1,
        maximum: 90,
      },
      unresolved_only: {
        type: 'boolean',
        description: 'Only return unresolved incidents (default: false)',
      },
    },
    required: [],
  },
};

/**
 * Tool: Get Maintenance
 * Returns scheduled maintenance windows for F5 Cloud services
 */
export const getMaintenanceTool = {
  name: 'f5-status-get-maintenance',
  description: 'Get scheduled, active, and upcoming maintenance windows for F5 Cloud services',
  inputSchema: {
    type: 'object' as const,
    properties: {
      status: {
        type: 'string',
        description: 'Filter maintenance by status',
        enum: ['scheduled', 'in_progress', 'verifying', 'completed'],
      },
      active_only: {
        type: 'boolean',
        description: 'Only return active maintenance windows (default: false)',
      },
      upcoming_only: {
        type: 'boolean',
        description: 'Only return upcoming maintenance windows (default: false)',
      },
    },
    required: [],
  },
};

/**
 * Tool: Search
 * Search for components, incidents, or information by keyword
 */
export const searchTool = {
  name: 'f5-status-search',
  description:
    'Search F5 Cloud status information by keyword or pattern, including components, incidents, and maintenance',
  inputSchema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string',
        description: 'Search query or pattern',
      },
      type: {
        type: 'string',
        description: 'Type of entity to search',
        enum: ['components', 'incidents', 'maintenance', 'all'],
      },
    },
    required: ['query'],
  },
};

/**
 * All tool definitions
 */
export const allTools = [
  getOverallStatusTool,
  getComponentsTool,
  getComponentTool,
  getIncidentsTool,
  getMaintenanceTool,
  searchTool,
];

/**
 * Tool input schemas with Zod validation
 */
export const toolSchemas = {
  'f5-status-get-overall': z.object({}),

  'f5-status-get-components': z.object({
    status: z.enum(['none', 'minor', 'major', 'critical']).optional(),
    group: z.string().optional(),
  }),

  'f5-status-get-component': z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
    })
    .refine((data) => data.id || data.name, { message: 'Either id or name must be provided' }),

  'f5-status-get-incidents': z.object({
    status: z
      .enum(['investigating', 'identified', 'monitoring', 'resolved', 'postmortem'])
      .optional(),
    impact: z.enum(['none', 'minor', 'major', 'critical']).optional(),
    days: z.number().min(1).max(90).optional(),
    unresolved_only: z.boolean().optional(),
  }),

  'f5-status-get-maintenance': z.object({
    status: z.enum(['scheduled', 'in_progress', 'verifying', 'completed']).optional(),
    active_only: z.boolean().optional(),
    upcoming_only: z.boolean().optional(),
  }),

  'f5-status-search': z.object({
    query: z.string(),
    type: z.enum(['components', 'incidents', 'maintenance', 'all']).optional(),
  }),
};

export type ToolInputs = {
  'f5-status-get-overall': z.infer<(typeof toolSchemas)['f5-status-get-overall']>;
  'f5-status-get-components': z.infer<(typeof toolSchemas)['f5-status-get-components']>;
  'f5-status-get-component': z.infer<(typeof toolSchemas)['f5-status-get-component']>;
  'f5-status-get-incidents': z.infer<(typeof toolSchemas)['f5-status-get-incidents']>;
  'f5-status-get-maintenance': z.infer<(typeof toolSchemas)['f5-status-get-maintenance']>;
  'f5-status-search': z.infer<(typeof toolSchemas)['f5-status-search']>;
};
