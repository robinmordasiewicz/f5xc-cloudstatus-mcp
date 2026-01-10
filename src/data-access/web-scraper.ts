// Copyright (c) 2026 Robin Mordasiewicz. MIT License.

/**
 * Web scraper for F5 Cloud Status
 * Fallback data source when API is unavailable
 */

import { chromium, Browser, Page } from 'playwright';
import { config } from '../utils/config.js';
import { ScraperError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import type { Component, Incident, OverallStatus } from '../types/domain.js';

/**
 * Scraped data structure
 */
export interface ScrapedData {
  status: OverallStatus;
  components: Component[];
  incidents: Incident[];
}

/**
 * Web Scraper class
 */
export class WebScraper {
  private browser: Browser | null = null;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly headless: boolean;

  constructor() {
    this.baseUrl = config.scraper.baseUrl;
    this.timeout = config.scraper.timeout;
    this.headless = config.scraper.headless;
  }

  /**
   * Initialize browser
   */
  private async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      logger.debug('Initializing Playwright browser');
      this.browser = await chromium.launch({
        headless: this.headless,
        timeout: this.timeout,
      });
    }
    return this.browser;
  }

  /**
   * Close browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      logger.debug('Closing Playwright browser');
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Scrape overall status
   */
  async scrapeStatus(): Promise<OverallStatus> {
    const page = await this.createPage();

    try {
      await page.goto(this.baseUrl, { timeout: this.timeout });
      await page.waitForSelector('.page-status', { timeout: this.timeout });

      const status = (await page.evaluate(() => {
        // @ts-ignore - DOM is available in browser context
        const statusElement = document.querySelector('.page-status');
        // @ts-ignore - DOM is available in browser context
        const indicatorElement = document.querySelector('.status');

        if (!statusElement || !indicatorElement) {
          throw new Error('Status elements not found');
        }

        const description = statusElement.textContent?.trim() || '';
        const indicatorClass = indicatorElement.className;

        let indicator: 'none' | 'minor' | 'major' | 'critical' = 'none';
        if (indicatorClass.includes('critical')) indicator = 'critical';
        else if (indicatorClass.includes('major')) indicator = 'major';
        else if (indicatorClass.includes('minor')) indicator = 'minor';

        return {
          description,
          indicator,
        };
      })) as { description: string; indicator: 'none' | 'minor' | 'major' | 'critical' };

      return {
        status: this.mapIndicatorToStatus(status.indicator),
        indicator: status.indicator,
        description: status.description,
        lastUpdated: new Date(),
      };
    } catch (error) {
      throw new ScraperError('Failed to scrape status', error);
    } finally {
      await page.close();
    }
  }

  /**
   * Scrape all components
   */
  async scrapeComponents(): Promise<Component[]> {
    const page = await this.createPage();

    try {
      await page.goto(this.baseUrl, { timeout: this.timeout });
      await page.waitForSelector('.components-section', { timeout: this.timeout });

      // Expand all component groups
      await page.evaluate(() => {
        // @ts-ignore - DOM is available in browser context
        const expandButtons = document.querySelectorAll('.component-group-expand');
        // @ts-ignore - DOM is available in browser context
        expandButtons.forEach((button) => {
          // @ts-ignore - HTMLElement is available in browser context
          if (button instanceof HTMLElement) {
            button.click();
          }
        });
      });

      // Wait for expansion to complete
      await page.waitForTimeout(1000);

      const components = (await page.evaluate(() => {
        // @ts-ignore - DOM is available in browser context
        const componentElements = document.querySelectorAll('.component-inner-container');
        const components: Array<{
          id: string;
          name: string;
          status: string;
          group?: string;
        }> = [];

        // @ts-ignore - DOM is available in browser context
        componentElements.forEach((element, index: number) => {
          const nameElement = element.querySelector('.name');
          const statusElement = element.querySelector('.component-status');
          const groupElement = element.closest('.component-group')?.querySelector('.group-name');

          if (nameElement && statusElement) {
            const name = nameElement.textContent?.trim() || '';
            const statusClass = statusElement.className;
            const group = groupElement?.textContent?.trim();

            let status = 'none';
            if (statusClass.includes('critical')) status = 'critical';
            else if (statusClass.includes('major')) status = 'major';
            else if (statusClass.includes('minor')) status = 'minor';

            components.push({
              id: `component-${index}`,
              name,
              status,
              group,
            });
          }
        });

        return components;
      })) as Array<{
        id: string;
        name: string;
        status: string;
        group?: string;
      }>;

      return components.map((comp, index) => ({
        id: comp.id,
        name: comp.name,
        status: comp.status as 'none' | 'minor' | 'major' | 'critical',
        group: comp.group,
        position: index,
        onlyShowIfDegraded: false,
      }));
    } catch (error) {
      throw new ScraperError('Failed to scrape components', error);
    } finally {
      await page.close();
    }
  }

  /**
   * Scrape incidents
   */
  async scrapeIncidents(): Promise<Incident[]> {
    const page = await this.createPage();

    try {
      await page.goto(this.baseUrl, { timeout: this.timeout });

      // Check if incidents section exists
      const hasIncidents = (await page.evaluate(() => {
        // @ts-ignore - DOM is available in browser context
        return document.querySelector('.incidents-list') !== null;
      })) as boolean;

      if (!hasIncidents) {
        return [];
      }

      const incidents = (await page.evaluate(() => {
        // @ts-ignore - DOM is available in browser context
        const incidentElements = document.querySelectorAll('.incident-container');
        const incidents: Array<{
          id: string;
          name: string;
          status: string;
          impact: string;
          updates: Array<{
            status: string;
            body: string;
            timestamp: string;
          }>;
        }> = [];

        // @ts-ignore - DOM is available in browser context
        incidentElements.forEach((element, index: number) => {
          const titleElement = element.querySelector('.incident-title');
          const statusElement = element.querySelector('.incident-status');
          const impactElement = element.querySelector('.impact-level');
          const updateElements = element.querySelectorAll('.update');

          if (titleElement && statusElement) {
            const name = titleElement.textContent?.trim() || '';
            const status = statusElement.textContent?.trim().toLowerCase() || 'investigating';
            const impact = impactElement?.textContent?.trim().toLowerCase() || 'minor';

            // @ts-ignore - DOM is available in browser context
            const updates = Array.from(updateElements).map((update) => {
              // @ts-ignore - DOM is available in browser context
              const statusEl = update.querySelector('.update-status');
              // @ts-ignore - DOM is available in browser context
              const bodyEl = update.querySelector('.update-body');
              // @ts-ignore - DOM is available in browser context
              const timestampEl = update.querySelector('.update-timestamp');

              return {
                status: statusEl?.textContent?.trim().toLowerCase() || 'investigating',
                body: bodyEl?.textContent?.trim() || '',
                timestamp: timestampEl?.textContent?.trim() || new Date().toISOString(),
              };
            });

            incidents.push({
              id: `incident-${index}`,
              name,
              status,
              impact,
              updates,
            });
          }
        });

        return incidents;
      })) as Array<{
        id: string;
        name: string;
        status: string;
        impact: string;
        updates: Array<{
          status: string;
          body: string;
          timestamp: string;
        }>;
      }>;

      return incidents.map((inc) => ({
        id: inc.id,
        name: inc.name,
        status: inc.status as
          | 'investigating'
          | 'identified'
          | 'monitoring'
          | 'resolved'
          | 'postmortem',
        impact: inc.impact as 'none' | 'minor' | 'major' | 'critical',
        createdAt: new Date(),
        updatedAt: new Date(),
        shortlink: '',
        updates: inc.updates.map((update, index) => ({
          id: `${inc.id}-update-${index}`,
          status: update.status as
            | 'investigating'
            | 'identified'
            | 'monitoring'
            | 'resolved'
            | 'postmortem',
          body: update.body,
          createdAt: new Date(update.timestamp),
          displayAt: new Date(update.timestamp),
          affectedComponents: [],
        })),
        affectedComponents: [],
      }));
    } catch (error) {
      throw new ScraperError('Failed to scrape incidents', error);
    } finally {
      await page.close();
    }
  }

  /**
   * Scrape all data
   */
  async scrapeAll(): Promise<ScrapedData> {
    try {
      const [status, components, incidents] = await Promise.all([
        this.scrapeStatus(),
        this.scrapeComponents(),
        this.scrapeIncidents(),
      ]);

      return { status, components, incidents };
    } catch (error) {
      throw new ScraperError('Failed to scrape all data', error);
    }
  }

  /**
   * Create new page
   */
  private async createPage(): Promise<Page> {
    const browser = await this.initBrowser();
    const page = await browser.newPage();
    page.setDefaultTimeout(this.timeout);
    return page;
  }

  /**
   * Map indicator to status level
   */
  private mapIndicatorToStatus(
    indicator: 'none' | 'minor' | 'major' | 'critical'
  ): 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage' {
    switch (indicator) {
      case 'none':
        return 'operational';
      case 'minor':
        return 'degraded_performance';
      case 'major':
        return 'partial_outage';
      case 'critical':
        return 'major_outage';
    }
  }
}

/**
 * Create web scraper instance
 */
export function createWebScraper(): WebScraper {
  return new WebScraper();
}
