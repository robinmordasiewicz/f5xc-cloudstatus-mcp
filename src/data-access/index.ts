/**
 * Data access module index
 * Re-exports all data access components
 */

export { APIClient, createAPIClient } from './api-client.js';
export { WebScraper, createWebScraper } from './web-scraper.js';
export type { ScrapedData } from './web-scraper.js';
export { DataAccessLayer, createDataAccessLayer } from './data-access-layer.js';
