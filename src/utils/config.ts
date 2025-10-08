/**
 * Configuration management for F5 Status MCP Server
 * Loads and validates environment variables
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Configuration interface
 */
export interface Config {
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  scraper: {
    baseUrl: string;
    timeout: number;
    headless: boolean;
  };
  cache: {
    ttlStatus: number;
    ttlComponents: number;
    ttlIncidents: number;
    ttlMaintenance: number;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
  };
}

/**
 * Get environment variable with fallback
 */
function getEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Get numeric environment variable with fallback
 */
function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get boolean environment variable with fallback
 */
function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Application configuration
 */
export const config: Config = {
  api: {
    baseUrl: getEnv('API_BASE_URL', 'https://www.f5cloudstatus.com/api/v2'),
    timeout: getEnvNumber('API_TIMEOUT', 10000),
    retryAttempts: getEnvNumber('API_RETRY_ATTEMPTS', 3),
    retryDelay: getEnvNumber('API_RETRY_DELAY', 1000),
  },
  scraper: {
    baseUrl: getEnv('SCRAPER_BASE_URL', 'https://www.f5cloudstatus.com'),
    timeout: getEnvNumber('SCRAPER_TIMEOUT', 30000),
    headless: getEnvBoolean('SCRAPER_HEADLESS', true),
  },
  cache: {
    ttlStatus: getEnvNumber('CACHE_TTL_STATUS', 30000),
    ttlComponents: getEnvNumber('CACHE_TTL_COMPONENTS', 60000),
    ttlIncidents: getEnvNumber('CACHE_TTL_INCIDENTS', 120000),
    ttlMaintenance: getEnvNumber('CACHE_TTL_MAINTENANCE', 300000),
  },
  logging: {
    level: (getEnv('LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error'),
  },
};

/**
 * Validate configuration
 */
export function validateConfig(): void {
  const errors: string[] = [];

  // Validate URLs
  try {
    new URL(config.api.baseUrl);
  } catch {
    errors.push(`Invalid API_BASE_URL: ${config.api.baseUrl}`);
  }

  try {
    new URL(config.scraper.baseUrl);
  } catch {
    errors.push(`Invalid SCRAPER_BASE_URL: ${config.scraper.baseUrl}`);
  }

  // Validate positive numbers
  if (config.api.timeout <= 0) {
    errors.push('API_TIMEOUT must be positive');
  }
  if (config.api.retryAttempts < 0) {
    errors.push('API_RETRY_ATTEMPTS must be non-negative');
  }
  if (config.api.retryDelay < 0) {
    errors.push('API_RETRY_DELAY must be non-negative');
  }
  if (config.scraper.timeout <= 0) {
    errors.push('SCRAPER_TIMEOUT must be positive');
  }

  // Validate cache TTLs
  if (config.cache.ttlStatus <= 0) {
    errors.push('CACHE_TTL_STATUS must be positive');
  }
  if (config.cache.ttlComponents <= 0) {
    errors.push('CACHE_TTL_COMPONENTS must be positive');
  }
  if (config.cache.ttlIncidents <= 0) {
    errors.push('CACHE_TTL_INCIDENTS must be positive');
  }
  if (config.cache.ttlMaintenance <= 0) {
    errors.push('CACHE_TTL_MAINTENANCE must be positive');
  }

  // Validate log level
  const validLogLevels = ['debug', 'info', 'warn', 'error'];
  if (!validLogLevels.includes(config.logging.level)) {
    errors.push(`Invalid LOG_LEVEL: ${config.logging.level}. Must be one of: ${validLogLevels.join(', ')}`);
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

// Validate configuration on load
validateConfig();
