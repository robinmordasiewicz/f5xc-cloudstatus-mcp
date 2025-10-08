/**
 * MCP Tool Handler
 * Processes tool requests and coordinates with services
 */

import { StatusService } from '../services/status-service.js';
import { ComponentService } from '../services/component-service.js';
import { IncidentService } from '../services/incident-service.js';
import { ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { toolSchemas } from './tool-definitions.js';

/**
 * Tool Handler class
 */
export class ToolHandler {
  constructor(
    private statusService: StatusService,
    private componentService: ComponentService,
    private incidentService: IncidentService
  ) {}

  /**
   * Handle tool request
   */
  async handleTool(name: string, args: unknown): Promise<unknown> {
    logger.info(`Handling tool request: ${name}`, { args });

    try {
      switch (name) {
        case 'f5-status-get-overall':
          return this.handleGetOverallStatus(args);

        case 'f5-status-get-components':
          return this.handleGetComponents(args);

        case 'f5-status-get-component':
          return this.handleGetComponent(args);

        case 'f5-status-get-incidents':
          return this.handleGetIncidents(args);

        case 'f5-status-get-maintenance':
          return this.handleGetMaintenance(args);

        case 'f5-status-search':
          return this.handleSearch(args);

        default:
          throw new ValidationError(`Unknown tool: ${name}`);
      }
    } catch (error) {
      logger.error(`Tool handler error for ${name}`, error);
      throw error;
    }
  }

  /**
   * Handle get overall status tool
   */
  private async handleGetOverallStatus(args: unknown) {
    toolSchemas['f5-status-get-overall'].parse(args);
    const status = await this.statusService.getOverallStatus();

    return {
      status: status.status,
      indicator: status.indicator,
      description: status.description,
      lastUpdated: status.lastUpdated.toISOString(),
      isOperational: status.status === 'operational',
    };
  }

  /**
   * Handle get components tool
   */
  private async handleGetComponents(args: unknown) {
    const validatedArgs = toolSchemas['f5-status-get-components'].parse(args);

    let components;
    if (validatedArgs.status) {
      components = await this.componentService.getComponentsByStatus(validatedArgs.status);
    } else if (validatedArgs.group) {
      components = await this.componentService.getComponentsByGroup(validatedArgs.group);
    } else {
      components = await this.componentService.getAllComponents();
    }

    const groups = await this.componentService.getComponentGroups();

    return {
      components: components.map((c) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        group: c.group,
        description: c.description,
      })),
      groups: groups.map((g) => ({
        name: g.name,
        componentCount: g.components.length,
      })),
      summary: {
        total: components.length,
        operational: components.filter((c) => c.status === 'none').length,
        degraded: components.filter((c) => c.status !== 'none').length,
      },
    };
  }

  /**
   * Handle get component tool
   */
  private async handleGetComponent(args: unknown) {
    const validatedArgs = toolSchemas['f5-status-get-component'].parse(args);

    const component = validatedArgs.id
      ? await this.componentService.getComponentById(validatedArgs.id)
      : await this.componentService.getComponentByName(validatedArgs.name!);

    return {
      id: component.id,
      name: component.name,
      status: component.status,
      group: component.group,
      description: component.description,
      position: component.position,
      isOperational: component.status === 'none',
      uptime: component.uptime,
    };
  }

  /**
   * Handle get incidents tool
   */
  private async handleGetIncidents(args: unknown) {
    const validatedArgs = toolSchemas['f5-status-get-incidents'].parse(args);

    let incidents;
    if (validatedArgs.unresolved_only) {
      incidents = await this.incidentService.getUnresolvedIncidents();
    } else if (validatedArgs.status) {
      incidents = await this.incidentService.getIncidentsByStatus(validatedArgs.status);
    } else if (validatedArgs.impact) {
      incidents = await this.incidentService.getIncidentsByImpact(validatedArgs.impact);
    } else if (validatedArgs.days) {
      incidents = await this.incidentService.getRecentIncidents(validatedArgs.days);
    } else {
      incidents = await this.incidentService.getAllIncidents();
    }

    return {
      incidents: incidents.map((i) => ({
        id: i.id,
        name: i.name,
        status: i.status,
        impact: i.impact,
        createdAt: i.createdAt.toISOString(),
        updatedAt: i.updatedAt.toISOString(),
        resolvedAt: i.resolvedAt?.toISOString(),
        shortlink: i.shortlink,
        affectedComponents: i.affectedComponents,
        latestUpdate: i.updates[0]
          ? {
              status: i.updates[0].status,
              body: i.updates[0].body,
              timestamp: i.updates[0].createdAt.toISOString(),
            }
          : null,
      })),
      summary: {
        total: incidents.length,
        unresolved: incidents.filter((i) => i.status !== 'resolved').length,
        critical: incidents.filter((i) => i.impact === 'critical').length,
        major: incidents.filter((i) => i.impact === 'major').length,
      },
    };
  }

  /**
   * Handle get maintenance tool
   */
  private async handleGetMaintenance(args: unknown) {
    const validatedArgs = toolSchemas['f5-status-get-maintenance'].parse(args);

    let maintenances;
    if (validatedArgs.active_only) {
      maintenances = await this.incidentService.getActiveMaintenances();
    } else if (validatedArgs.upcoming_only) {
      maintenances = await this.incidentService.getUpcomingMaintenances();
    } else {
      maintenances = await this.incidentService.getAllMaintenances();
    }

    if (validatedArgs.status) {
      maintenances = maintenances.filter((m) => m.status === validatedArgs.status);
    }

    return {
      maintenances: maintenances.map((m) => ({
        id: m.id,
        name: m.name,
        status: m.status,
        impact: m.impact,
        scheduledFor: m.scheduledFor.toISOString(),
        scheduledUntil: m.scheduledUntil.toISOString(),
        shortlink: m.shortlink,
        affectedComponents: m.affectedComponents,
        latestUpdate: m.updates[0]
          ? {
              status: m.updates[0].status,
              body: m.updates[0].body,
              timestamp: m.updates[0].createdAt.toISOString(),
            }
          : null,
      })),
      summary: {
        total: maintenances.length,
        active: maintenances.filter((m) => m.status === 'in_progress').length,
        upcoming: maintenances.filter((m) => m.status === 'scheduled').length,
      },
    };
  }

  /**
   * Handle search tool
   */
  private async handleSearch(args: unknown) {
    const validatedArgs = toolSchemas['f5-status-search'].parse(args);
    const query = validatedArgs.query;
    const type = validatedArgs.type || 'all';

    const results: {
      components?: unknown[];
      incidents?: unknown[];
      maintenances?: unknown[];
    } = {};

    if (type === 'components' || type === 'all') {
      const components = await this.componentService.searchComponents(query);
      results.components = components.map((c) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        group: c.group,
      }));
    }

    if (type === 'incidents' || type === 'all') {
      const incidents = await this.incidentService.getAllIncidents();
      const matchedIncidents = incidents.filter(
        (i) =>
          i.name.toLowerCase().includes(query.toLowerCase()) ||
          i.updates.some((u) => u.body.toLowerCase().includes(query.toLowerCase()))
      );
      results.incidents = matchedIncidents.map((i) => ({
        id: i.id,
        name: i.name,
        status: i.status,
        impact: i.impact,
      }));
    }

    if (type === 'maintenance' || type === 'all') {
      const maintenances = await this.incidentService.getAllMaintenances();
      const matchedMaintenances = maintenances.filter(
        (m) =>
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.updates.some((u) => u.body.toLowerCase().includes(query.toLowerCase()))
      );
      results.maintenances = matchedMaintenances.map((m) => ({
        id: m.id,
        name: m.name,
        status: m.status,
        scheduledFor: m.scheduledFor.toISOString(),
      }));
    }

    return {
      query,
      type,
      results,
      summary: {
        components: results.components?.length || 0,
        incidents: results.incidents?.length || 0,
        maintenances: results.maintenances?.length || 0,
        total:
          (results.components?.length || 0) +
          (results.incidents?.length || 0) +
          (results.maintenances?.length || 0),
      },
    };
  }
}

/**
 * Create tool handler instance
 */
export function createToolHandler(
  statusService: StatusService,
  componentService: ComponentService,
  incidentService: IncidentService
): ToolHandler {
  return new ToolHandler(statusService, componentService, incidentService);
}
