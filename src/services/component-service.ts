// Copyright (c) 2026 Robin Mordasiewicz. MIT License.

/**
 * Component Service
 * Business logic for F5 Cloud components
 */

import { DataAccessLayer } from '../data-access/index.js';
import { CacheService } from '../cache/index.js';
import { config } from '../utils/config.js';
import { logger } from '../utils/logger.js';
import { NotFoundError } from '../utils/errors.js';
import type { Component, ComponentGroup, IndicatorLevel } from '../types/domain.js';
import type { RawComponentsResponse, RawComponent } from '../types/api.js';

/**
 * Component Service class
 */
export class ComponentService {
  private dataAccess: DataAccessLayer;
  private cache: CacheService;

  constructor(dataAccess: DataAccessLayer, cache: CacheService) {
    this.dataAccess = dataAccess;
    this.cache = cache;
  }

  /**
   * Get all components
   */
  async getAllComponents(): Promise<Component[]> {
    logger.debug('Getting all components');

    return this.cache.get('all-components', config.cache.ttlComponents, async () => {
      const rawComponents = await this.dataAccess.getComponents();
      return this.transformComponents(rawComponents);
    });
  }

  /**
   * Get component by ID
   */
  async getComponentById(id: string): Promise<Component> {
    const components = await this.getAllComponents();
    const component = components.find((c) => c.id === id);

    if (!component) {
      throw new NotFoundError(`Component not found: ${id}`);
    }

    return component;
  }

  /**
   * Get component by name
   */
  async getComponentByName(name: string): Promise<Component> {
    const components = await this.getAllComponents();
    const component = components.find((c) => c.name.toLowerCase() === name.toLowerCase());

    if (!component) {
      throw new NotFoundError(`Component not found: ${name}`);
    }

    return component;
  }

  /**
   * Get components by status
   */
  async getComponentsByStatus(status: IndicatorLevel): Promise<Component[]> {
    const components = await this.getAllComponents();
    return components.filter((c) => c.status === status);
  }

  /**
   * Get components by group
   */
  async getComponentsByGroup(group: string): Promise<Component[]> {
    const components = await this.getAllComponents();
    return components.filter((c) => c.group === group);
  }

  /**
   * Get degraded components
   */
  async getDegradedComponents(): Promise<Component[]> {
    const components = await this.getAllComponents();
    return components.filter((c) => c.status !== 'none');
  }

  /**
   * Get operational components
   */
  async getOperationalComponents(): Promise<Component[]> {
    const components = await this.getAllComponents();
    return components.filter((c) => c.status === 'none');
  }

  /**
   * Get component groups
   */
  async getComponentGroups(): Promise<ComponentGroup[]> {
    const components = await this.getAllComponents();
    const groupMap = new Map<string, Component[]>();

    // Group components
    components.forEach((component) => {
      const groupName = component.group || 'Ungrouped';
      if (!groupMap.has(groupName)) {
        groupMap.set(groupName, []);
      }
      groupMap.get(groupName)!.push(component);
    });

    // Transform to ComponentGroup array
    return Array.from(groupMap.entries()).map(([name, components], index) => ({
      id: `group-${index}`,
      name,
      position: index,
      components,
    }));
  }

  /**
   * Search components by name pattern
   */
  async searchComponents(pattern: string): Promise<Component[]> {
    const components = await this.getAllComponents();
    const regex = new RegExp(pattern, 'i');
    return components.filter((c) => regex.test(c.name));
  }

  /**
   * Get component count by status
   */
  async getComponentCountByStatus(): Promise<Record<IndicatorLevel, number>> {
    const components = await this.getAllComponents();
    const counts: Record<IndicatorLevel, number> = {
      none: 0,
      minor: 0,
      major: 0,
      critical: 0,
    };

    components.forEach((component) => {
      counts[component.status]++;
    });

    return counts;
  }

  /**
   * Check if component is operational
   */
  async isComponentOperational(id: string): Promise<boolean> {
    const component = await this.getComponentById(id);
    return component.status === 'none';
  }

  /**
   * Transform raw components to domain model
   */
  private transformComponents(rawComponents: RawComponentsResponse | Component[]): Component[] {
    // If already transformed (from scraper), return as-is
    if (Array.isArray(rawComponents)) {
      return rawComponents;
    }

    // Transform API response
    return rawComponents.components
      .filter((raw) => !raw.group) // Filter out groups
      .map((raw) => this.transformComponent(raw));
  }

  /**
   * Transform single raw component
   */
  private transformComponent(raw: RawComponent): Component {
    return {
      id: raw.id,
      name: raw.name,
      status: this.mapStatusToIndicator(raw.status),
      description: raw.description || undefined,
      group: raw.group_id || undefined,
      position: raw.position,
      onlyShowIfDegraded: raw.only_show_if_degraded,
    };
  }

  /**
   * Map component status to indicator level
   */
  private mapStatusToIndicator(status: string): IndicatorLevel {
    switch (status) {
      case 'operational':
        return 'none';
      case 'degraded_performance':
        return 'minor';
      case 'partial_outage':
        return 'major';
      case 'major_outage':
        return 'critical';
      default:
        return 'none';
    }
  }

  /**
   * Invalidate components cache
   */
  invalidateCache(): void {
    this.cache.delete('all-components');
    logger.info('Components cache invalidated');
  }
}

/**
 * Create component service instance
 */
export function createComponentService(
  dataAccess: DataAccessLayer,
  cache: CacheService
): ComponentService {
  return new ComponentService(dataAccess, cache);
}
