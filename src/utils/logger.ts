/**
 * Logging utility for F5 Status MCP Server
 */

import { config } from './config.js';
import { formatError } from './errors.js';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Log level mapping
 */
const LOG_LEVEL_MAP: Record<string, LogLevel> = {
  debug: LogLevel.DEBUG,
  info: LogLevel.INFO,
  warn: LogLevel.WARN,
  error: LogLevel.ERROR,
};

/**
 * Logger class
 */
export class Logger {
  private level: LogLevel;

  constructor(level: string = config.logging.level) {
    this.level = LOG_LEVEL_MAP[level] || LogLevel.INFO;
  }

  /**
   * Log debug message
   */
  debug(message: string, meta?: unknown): void {
    if (this.level <= LogLevel.DEBUG) {
      this.log('DEBUG', message, meta);
    }
  }

  /**
   * Log info message
   */
  info(message: string, meta?: unknown): void {
    if (this.level <= LogLevel.INFO) {
      this.log('INFO', message, meta);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, meta?: unknown): void {
    if (this.level <= LogLevel.WARN) {
      this.log('WARN', message, meta);
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: unknown): void {
    if (this.level <= LogLevel.ERROR) {
      const errorMessage = error ? formatError(error) : undefined;
      this.log('ERROR', message, errorMessage);
    }
  }

  /**
   * Internal logging method
   */
  private log(level: string, message: string, meta?: unknown): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    if (meta !== undefined) {
      const metaString = typeof meta === 'string' ? meta : JSON.stringify(meta, null, 2);
      console.error(`${logMessage}\n${metaString}`);
    } else {
      console.error(logMessage);
    }
  }

  /**
   * Set log level
   */
  setLevel(level: string): void {
    this.level = LOG_LEVEL_MAP[level] || LogLevel.INFO;
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger();
