import {
  F5StatusError,
  APIError,
  ScraperError,
  DataUnavailableError,
  ConfigurationError,
  ValidationError,
  CacheError,
  TimeoutError,
  NotFoundError,
  isF5StatusError,
  formatError,
  getErrorMessage,
  getErrorCode
} from '../../../src/utils/errors.js';

describe('Error Classes', () => {
  describe('F5StatusError', () => {
    it('should create error with all properties', () => {
      const error = new F5StatusError('Test error', 'TEST_CODE', 500, { foo: 'bar' });

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.statusCode).toBe(500);
      expect(error.details).toEqual({ foo: 'bar' });
      expect(error.name).toBe('F5StatusError');
    });

    it('should use default status code 500', () => {
      const error = new F5StatusError('Test error', 'TEST_CODE');

      expect(error.statusCode).toBe(500);
    });

    it('should have proper stack trace', () => {
      const error = new F5StatusError('Test error', 'TEST_CODE');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('F5StatusError');
    });
  });

  describe('APIError', () => {
    it('should create API error with correct defaults', () => {
      const error = new APIError('API request failed');

      expect(error.message).toBe('API request failed');
      expect(error.code).toBe('API_ERROR');
      expect(error.statusCode).toBe(502);
      expect(error.name).toBe('APIError');
    });

    it('should include details when provided', () => {
      const details = { url: 'https://api.example.com', status: 500 };
      const error = new APIError('API request failed', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('ScraperError', () => {
    it('should create scraper error with correct defaults', () => {
      const error = new ScraperError('Scraping failed');

      expect(error.message).toBe('Scraping failed');
      expect(error.code).toBe('SCRAPER_ERROR');
      expect(error.statusCode).toBe(502);
      expect(error.name).toBe('ScraperError');
    });

    it('should include details when provided', () => {
      const details = { selector: '.status', reason: 'not found' };
      const error = new ScraperError('Scraping failed', details);

      expect(error.details).toEqual(details);
    });
  });

  describe('DataUnavailableError', () => {
    it('should create data unavailable error', () => {
      const error = new DataUnavailableError('All data sources failed');

      expect(error.message).toBe('All data sources failed');
      expect(error.code).toBe('DATA_UNAVAILABLE');
      expect(error.statusCode).toBe(503);
      expect(error.name).toBe('DataUnavailableError');
    });
  });

  describe('ConfigurationError', () => {
    it('should create configuration error', () => {
      const error = new ConfigurationError('Invalid config');

      expect(error.message).toBe('Invalid config');
      expect(error.code).toBe('CONFIGURATION_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('ConfigurationError');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid input');

      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('CacheError', () => {
    it('should create cache error', () => {
      const error = new CacheError('Cache operation failed');

      expect(error.message).toBe('Cache operation failed');
      expect(error.code).toBe('CACHE_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('CacheError');
    });
  });

  describe('TimeoutError', () => {
    it('should create timeout error', () => {
      const error = new TimeoutError('Request timed out');

      expect(error.message).toBe('Request timed out');
      expect(error.code).toBe('TIMEOUT_ERROR');
      expect(error.statusCode).toBe(504);
      expect(error.name).toBe('TimeoutError');
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error', () => {
      const error = new NotFoundError('Resource not found');

      expect(error.message).toBe('Resource not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('isF5StatusError', () => {
    it('should return true for F5StatusError', () => {
      const error = new F5StatusError('Test', 'TEST', 500);

      expect(isF5StatusError(error)).toBe(true);
    });

    it('should return true for APIError', () => {
      const error = new APIError('API failed');

      expect(isF5StatusError(error)).toBe(true);
    });

    it('should return true for all custom error types', () => {
      const errors = [
        new ScraperError('test'),
        new DataUnavailableError('test'),
        new ConfigurationError('test'),
        new ValidationError('test'),
        new CacheError('test'),
        new TimeoutError('test'),
        new NotFoundError('test')
      ];

      errors.forEach(error => {
        expect(isF5StatusError(error)).toBe(true);
      });
    });

    it('should return false for standard Error', () => {
      const error = new Error('Standard error');

      expect(isF5StatusError(error)).toBe(false);
    });

    it('should return false for non-error values', () => {
      expect(isF5StatusError('string')).toBe(false);
      expect(isF5StatusError(123)).toBe(false);
      expect(isF5StatusError(null)).toBe(false);
      expect(isF5StatusError(undefined)).toBe(false);
      expect(isF5StatusError({})).toBe(false);
    });
  });

  describe('formatError', () => {
    it('should format F5StatusError with all fields', () => {
      const error = new F5StatusError('Test error', 'TEST_CODE', 500, { foo: 'bar' });
      const formatted = formatError(error);

      expect(formatted).toContain('[TEST_CODE]');
      expect(formatted).toContain('Test error');
      expect(formatted).toContain('Details:');
      expect(formatted).toContain('Stack:');
    });

    it('should format F5StatusError without details', () => {
      const error = new F5StatusError('Test error', 'TEST_CODE', 500);
      const formatted = formatError(error);

      expect(formatted).toContain('[TEST_CODE]');
      expect(formatted).toContain('Test error');
      expect(formatted).not.toContain('Details:');
    });

    it('should format standard Error', () => {
      const error = new Error('Standard error');
      const formatted = formatError(error);

      expect(formatted).toContain('Error:');
      expect(formatted).toContain('Standard error');
      expect(formatted).toContain('Stack:');
    });

    it('should format unknown error types', () => {
      const formatted = formatError('string error');

      expect(formatted).toBe('Unknown error: string error');
    });

    it('should format null', () => {
      const formatted = formatError(null);

      expect(formatted).toBe('Unknown error: null');
    });

    it('should format objects', () => {
      const formatted = formatError({ message: 'test' });

      expect(formatted).toContain('Unknown error:');
    });
  });

  describe('getErrorMessage', () => {
    it('should extract message from F5StatusError', () => {
      const error = new F5StatusError('Test error', 'TEST_CODE');
      const message = getErrorMessage(error);

      expect(message).toBe('Test error');
    });

    it('should extract message from standard Error', () => {
      const error = new Error('Standard error');
      const message = getErrorMessage(error);

      expect(message).toBe('Standard error');
    });

    it('should convert string to message', () => {
      const message = getErrorMessage('string error');

      expect(message).toBe('string error');
    });

    it('should convert number to message', () => {
      const message = getErrorMessage(123);

      expect(message).toBe('123');
    });

    it('should convert null to message', () => {
      const message = getErrorMessage(null);

      expect(message).toBe('null');
    });

    it('should convert object to message', () => {
      const message = getErrorMessage({ foo: 'bar' });

      expect(message).toBe('[object Object]');
    });
  });

  describe('getErrorCode', () => {
    it('should extract code from F5StatusError', () => {
      const error = new F5StatusError('Test error', 'TEST_CODE');
      const code = getErrorCode(error);

      expect(code).toBe('TEST_CODE');
    });

    it('should extract code from APIError', () => {
      const error = new APIError('API failed');
      const code = getErrorCode(error);

      expect(code).toBe('API_ERROR');
    });

    it('should extract name from standard Error', () => {
      const error = new Error('Standard error');
      const code = getErrorCode(error);

      expect(code).toBe('Error');
    });

    it('should return UNKNOWN_ERROR for non-errors', () => {
      expect(getErrorCode('string')).toBe('UNKNOWN_ERROR');
      expect(getErrorCode(123)).toBe('UNKNOWN_ERROR');
      expect(getErrorCode(null)).toBe('UNKNOWN_ERROR');
      expect(getErrorCode(undefined)).toBe('UNKNOWN_ERROR');
      expect(getErrorCode({})).toBe('UNKNOWN_ERROR');
    });
  });
});
