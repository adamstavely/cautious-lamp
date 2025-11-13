import { HttpStatus } from '@nestjs/common';
import { ErrorHandler } from './error-handler';

describe('ErrorHandler', () => {
  describe('handleError', () => {
    it('should handle connection errors', () => {
      const error = { code: 'ECONNREFUSED', message: 'Connection refused' };
      const result = ErrorHandler.handleError(error);

      expect(result.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      const response = result.getResponse() as { recovery?: string[] };
      expect(response.recovery).toBeDefined();
      expect(Array.isArray(response.recovery)).toBe(true);
    });

    it('should handle validation errors', () => {
      const error = { name: 'ValidationError', message: 'Invalid input' };
      const result = ErrorHandler.handleError(error);

      expect(result.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      const response = result.getResponse() as { recovery?: string[] };
      expect(response.recovery).toBeDefined();
    });

    it('should handle timeout errors', () => {
      const error = { code: 'ETIMEDOUT', message: 'Request timeout' };
      const result = ErrorHandler.handleError(error);

      expect(result.getStatus()).toBe(HttpStatus.REQUEST_TIMEOUT);
      const response = result.getResponse() as { recovery?: string[] };
      expect(response.recovery).toBeDefined();
    });

    it('should preserve existing HttpException', () => {
      const originalError = new Error('Test error');
      const httpException = ErrorHandler.handleError(originalError);

      expect(httpException).toBeInstanceOf(Error);
      expect(httpException.getStatus()).toBeDefined();
    });

    it('should include context in error handling', () => {
      const error = new Error('Test error');
      const result = ErrorHandler.handleError(error, 'TestContext');

      expect(result).toBeDefined();
      expect(result.getStatus()).toBeDefined();
    });
  });

  describe('createApiError', () => {
    it('should create standardized error response', () => {
      const error = ErrorHandler.createApiError(
        HttpStatus.BAD_REQUEST,
        'Invalid input',
        'ValidationError',
        { field: 'email' },
        ['Check email format'],
      );

      expect(error.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(error.message).toBe('Invalid input');
      expect(error.error).toBe('ValidationError');
      expect(error.details).toEqual({ field: 'email' });
      expect(error.recovery).toEqual(['Check email format']);
    });

    it('should provide default recovery suggestions', () => {
      const error = ErrorHandler.createApiError(
        HttpStatus.NOT_FOUND,
        'Resource not found',
      );

      expect(error.recovery).toBeDefined();
      expect(Array.isArray(error.recovery)).toBe(true);
      expect(error.recovery!.length).toBeGreaterThan(0);
    });
  });
});

