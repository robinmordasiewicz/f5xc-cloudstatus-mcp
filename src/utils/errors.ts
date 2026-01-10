// Copyright (c) 2026 Robin Mordasiewicz. MIT License.

/**
 * Custom error classes for F5 Status MCP Server
 */

/**
 * Base error class for all application errors
 */
export class F5StatusError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error when API request fails
 */
export class APIError extends F5StatusError {
  constructor(message: string, details?: unknown) {
    super(message, 'API_ERROR', 502, details);
  }
}

/**
 * Error when web scraping fails
 */
export class ScraperError extends F5StatusError {
  constructor(message: string, details?: unknown) {
    super(message, 'SCRAPER_ERROR', 502, details);
  }
}

/**
 * Error when both API and scraper fail
 */
export class DataUnavailableError extends F5StatusError {
  constructor(message: string, details?: unknown) {
    super(message, 'DATA_UNAVAILABLE', 503, details);
  }
}

/**
 * Error when configuration is invalid
 */
export class ConfigurationError extends F5StatusError {
  constructor(message: string, details?: unknown) {
    super(message, 'CONFIGURATION_ERROR', 500, details);
  }
}

/**
 * Error when validation fails
 */
export class ValidationError extends F5StatusError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

/**
 * Error when cache operation fails
 */
export class CacheError extends F5StatusError {
  constructor(message: string, details?: unknown) {
    super(message, 'CACHE_ERROR', 500, details);
  }
}

/**
 * Error when timeout occurs
 */
export class TimeoutError extends F5StatusError {
  constructor(message: string, details?: unknown) {
    super(message, 'TIMEOUT_ERROR', 504, details);
  }
}

/**
 * Error when resource is not found
 */
export class NotFoundError extends F5StatusError {
  constructor(message: string, details?: unknown) {
    super(message, 'NOT_FOUND', 404, details);
  }
}

/**
 * Type guard to check if error is an F5StatusError
 */
export function isF5StatusError(error: unknown): error is F5StatusError {
  return error instanceof F5StatusError;
}

/**
 * Format error for logging
 */
export function formatError(error: unknown): string {
  if (isF5StatusError(error)) {
    const parts = [`[${error.code}]`, error.message];
    if (error.details) {
      parts.push(`Details: ${JSON.stringify(error.details)}`);
    }
    if (error.stack) {
      parts.push(`Stack: ${error.stack}`);
    }
    return parts.join(' | ');
  }

  if (error instanceof Error) {
    return `${error.name}: ${error.message}${error.stack ? ` | Stack: ${error.stack}` : ''}`;
  }

  return `Unknown error: ${String(error)}`;
}

/**
 * Extract error message safely
 */
export function getErrorMessage(error: unknown): string {
  if (isF5StatusError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

/**
 * Extract error code safely
 */
export function getErrorCode(error: unknown): string {
  if (isF5StatusError(error)) {
    return error.code;
  }

  if (error instanceof Error) {
    return error.name;
  }

  return 'UNKNOWN_ERROR';
}
