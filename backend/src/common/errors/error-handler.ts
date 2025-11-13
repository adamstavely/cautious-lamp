import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ApiError } from '../types/common.types';

/**
 * Enhanced error handler with recovery suggestions and better error messages
 */
export class ErrorHandler {
  private static readonly logger = new Logger(ErrorHandler.name);

  /**
   * Create a standardized API error response
   */
  static createApiError(
    statusCode: HttpStatus,
    message: string,
    error?: string,
    details?: Record<string, unknown>,
    recovery?: string[],
  ): ApiError {
    return {
      statusCode,
      message,
      error: error || this.getDefaultErrorName(statusCode),
      details,
      recovery: recovery || this.getDefaultRecoverySuggestions(statusCode, message),
    };
  }

  /**
   * Handle and transform errors into standardized format
   */
  static handleError(error: unknown, context?: string): HttpException {
    const contextMsg = context ? `[${context}] ` : '';

    if (error instanceof HttpException) {
      const response = error.getResponse();
      const status = error.getStatus();
      
      // Enhance existing HTTP exceptions with recovery suggestions
      if (typeof response === 'object' && response !== null) {
        const enhancedResponse = {
          ...response,
          recovery: this.getDefaultRecoverySuggestions(status, error.message),
        };
        return new HttpException(enhancedResponse, status);
      }
      
      return error;
    }

    // Handle connection errors
    if (this.isConnectionError(error)) {
      const message = this.getConnectionErrorMessage(error);
      const recovery = this.getConnectionRecoverySuggestions(error);
      
      this.logger.error(`${contextMsg}Connection error: ${message}`, error);
      
      return new HttpException(
        this.createApiError(
          HttpStatus.SERVICE_UNAVAILABLE,
          message,
          'ConnectionError',
          { originalError: this.getErrorMessage(error) },
          recovery,
        ),
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    // Handle validation errors
    if (this.isValidationError(error)) {
      this.logger.warn(`${contextMsg}Validation error: ${this.getErrorMessage(error)}`, error);
      
      return new HttpException(
        this.createApiError(
          HttpStatus.BAD_REQUEST,
          'Validation failed',
          'ValidationError',
          { details: this.getErrorMessage(error) },
          ['Check the request payload format', 'Verify all required fields are provided', 'Ensure data types match expected formats'],
        ),
        HttpStatus.BAD_REQUEST,
      );
    }

    // Handle timeout errors
    if (this.isTimeoutError(error)) {
      this.logger.error(`${contextMsg}Timeout error`, error);
      
      return new HttpException(
        this.createApiError(
          HttpStatus.REQUEST_TIMEOUT,
          'Request timeout - the operation took too long',
          'TimeoutError',
          {},
          ['Retry the request', 'Check network connectivity', 'Reduce the size of the request if applicable'],
        ),
        HttpStatus.REQUEST_TIMEOUT,
      );
    }

    // Generic error handling
    const message = this.getErrorMessage(error);
    this.logger.error(`${contextMsg}Unexpected error: ${message}`, error);
    
    return new HttpException(
      this.createApiError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'An unexpected error occurred',
        'InternalServerError',
        { originalError: message },
        ['Retry the request', 'Contact support if the issue persists', 'Check system status'],
      ),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  /**
   * Get default error name for status code
   */
  private static getDefaultErrorName(statusCode: HttpStatus): string {
    const statusNames: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BadRequest',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.NOT_FOUND]: 'NotFound',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.REQUEST_TIMEOUT]: 'RequestTimeout',
      [HttpStatus.TOO_MANY_REQUESTS]: 'TooManyRequests',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'InternalServerError',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'ServiceUnavailable',
      [HttpStatus.GATEWAY_TIMEOUT]: 'GatewayTimeout',
    };
    return statusNames[statusCode] || 'Error';
  }

  /**
   * Get default recovery suggestions based on error type
   */
  private static getDefaultRecoverySuggestions(statusCode: HttpStatus, message: string): string[] {
    const suggestions: Record<number, string[]> = {
      [HttpStatus.BAD_REQUEST]: [
        'Verify the request format and required fields',
        'Check that all data types are correct',
        'Review the API documentation for the correct payload structure',
      ],
      [HttpStatus.UNAUTHORIZED]: [
        'Check your authentication credentials',
        'Verify your API token is valid and not expired',
        'Ensure you have the necessary permissions',
      ],
      [HttpStatus.FORBIDDEN]: [
        'Verify you have the required permissions',
        'Contact your administrator to request access',
        'Check your role assignments',
      ],
      [HttpStatus.NOT_FOUND]: [
        'Verify the resource ID exists',
        'Check the resource path is correct',
        'Ensure the resource has not been deleted',
      ],
      [HttpStatus.CONFLICT]: [
        'Check if a similar resource already exists',
        'Verify unique constraints are not violated',
        'Consider updating the existing resource instead',
      ],
      [HttpStatus.REQUEST_TIMEOUT]: [
        'Retry the request',
        'Check network connectivity',
        'Reduce the size of the request if applicable',
      ],
      [HttpStatus.TOO_MANY_REQUESTS]: [
        'Wait before retrying the request',
        'Reduce the frequency of requests',
        'Consider implementing request batching',
      ],
      [HttpStatus.INTERNAL_SERVER_ERROR]: [
        'Retry the request after a short delay',
        'Contact support if the issue persists',
        'Check system status page for known issues',
      ],
      [HttpStatus.SERVICE_UNAVAILABLE]: [
        'Check the service status',
        'Retry after a few moments',
        'Verify external service connections',
      ],
      [HttpStatus.GATEWAY_TIMEOUT]: [
        'Retry the request',
        'Check upstream service status',
        'Contact support if the issue persists',
      ],
    };

    return suggestions[statusCode] || ['Retry the request', 'Contact support if the issue persists'];
  }

  /**
   * Check if error is a connection error
   */
  private static isConnectionError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;
    
    const errorObj = error as Record<string, unknown>;
    const code = errorObj.code as string | undefined;
    const message = String(errorObj.message || '').toLowerCase();
    
    return (
      code === 'ECONNREFUSED' ||
      code === 'ENOTFOUND' ||
      code === 'ECONNRESET' ||
      code === 'ETIMEDOUT' ||
      message.includes('connection') ||
      message.includes('network') ||
      message.includes('unreachable')
    );
  }

  /**
   * Get connection error message
   */
  private static getConnectionErrorMessage(error: unknown): string {
    const errorObj = error as Record<string, unknown>;
    const code = errorObj.code as string | undefined;
    const message = String(errorObj.message || 'Connection failed');

    if (code === 'ECONNREFUSED') {
      return 'Connection refused - the service may be down or unreachable';
    }
    if (code === 'ENOTFOUND') {
      return 'Host not found - check the service URL';
    }
    if (code === 'ECONNRESET') {
      return 'Connection reset - the remote service closed the connection';
    }
    if (code === 'ETIMEDOUT') {
      return 'Connection timeout - the service did not respond in time';
    }

    return `Connection error: ${message}`;
  }

  /**
   * Get connection recovery suggestions
   */
  private static getConnectionRecoverySuggestions(error: unknown): string[] {
    const errorObj = error as Record<string, unknown>;
    const code = errorObj.code as string | undefined;

    if (code === 'ECONNREFUSED' || code === 'ENOTFOUND') {
      return [
        'Verify the service URL is correct',
        'Check if the service is running',
        'Verify network connectivity',
        'Check firewall and security group settings',
      ];
    }

    if (code === 'ETIMEDOUT') {
      return [
        'Check network connectivity',
        'Verify the service is responding',
        'Increase timeout settings if applicable',
        'Check for network congestion',
      ];
    }

    return [
      'Check network connectivity',
      'Verify the service is available',
      'Retry after a few moments',
      'Contact support if the issue persists',
    ];
  }

  /**
   * Check if error is a validation error
   */
  private static isValidationError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;
    
    const errorObj = error as Record<string, unknown>;
    const name = String(errorObj.name || '').toLowerCase();
    const message = String(errorObj.message || '').toLowerCase();
    
    return name.includes('validation') || message.includes('validation') || message.includes('invalid');
  }

  /**
   * Check if error is a timeout error
   */
  private static isTimeoutError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false;
    
    const errorObj = error as Record<string, unknown>;
    const code = errorObj.code as string | undefined;
    const message = String(errorObj.message || '').toLowerCase();
    
    return code === 'ETIMEDOUT' || code === 'ECONNABORTED' || message.includes('timeout');
  }

  /**
   * Extract error message from unknown error type
   */
  private static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, unknown>;
      return String(errorObj.message || errorObj.error || JSON.stringify(error));
    }
    return 'Unknown error';
  }
}

