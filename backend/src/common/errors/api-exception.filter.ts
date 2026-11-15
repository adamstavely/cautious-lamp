import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';

/** Codes that aren't the status's name (docs/API_ERROR_CODES.md) */
const CODE_FOR_STATUS: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'VALIDATION_ERROR',
  [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMIT_EXCEEDED',
};

/** A code set by the code that threw (PASSWORD_CHANGE_REQUIRED, IRIS_TIMEOUT, …) is kept */
const CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/;

/** The stable code for a status: VALIDATION_ERROR for 400, RATE_LIMIT_EXCEEDED for 429, else the status's name (NOT_FOUND, CONFLICT, …) */
export function codeForStatus(status: number): string {
  return CODE_FOR_STATUS[status] ?? HttpStatus[status] ?? (status >= 500 ? 'INTERNAL_SERVER_ERROR' : `HTTP_${status}`);
}

/** "Not Found" from NOT_FOUND, for bodies thrown without Nest's `error` */
function reasonPhrase(status: number): string {
  const name = HttpStatus[status];
  if (!name) return 'Error';
  return name
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Gives every HTTP error body a stable `code` (docs/API_ERROR_CODES.md) next
 * to Nest's `statusCode`, `message` and `error`, which clients already read.
 * A code the thrower set is kept; otherwise it comes from the status. Errors
 * that aren't HttpExceptions are logged and answered with a plain 500, as
 * Nest's own filter does, so internals never reach the client.
 *
 * Registered in main.ts with useGlobalFilters, which leaves WebSocket
 * gateways to their own error events.
 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionsHandler');

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, body } = this.errorFor(exception);
    // A streamed response that failed part way can only be ended
    if (response.headersSent) {
      response.end();
      return;
    }
    response.status(status).json(body);
  }

  /** The status and body for an exception: Nest's fields plus `code` */
  errorFor(exception: unknown): { status: number; body: Record<string, unknown> & { code: string } } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const thrown = exception.getResponse();
      const fields: Record<string, unknown> = typeof thrown === 'object' && thrown !== null ? { ...thrown } : { message: thrown };
      const code = typeof fields.code === 'string' && CODE_PATTERN.test(fields.code) ? fields.code : codeForStatus(status);
      return {
        status,
        body: {
          ...fields,
          statusCode: typeof fields.statusCode === 'number' ? fields.statusCode : status,
          code,
          message: fields.message ?? exception.message,
          error: fields.error ?? reasonPhrase(status),
        },
      };
    }
    // Errors from libraries that carry their own status (http-errors), as Nest's filter treats them
    if (isHttpError(exception)) {
      const status = exception.statusCode;
      return { status, body: { statusCode: status, code: codeForStatus(status), message: exception.message, error: reasonPhrase(status) } };
    }
    this.logger.error(exception instanceof Error ? exception.message : String(exception), exception instanceof Error ? exception.stack : undefined);
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    return { status, body: { statusCode: status, code: codeForStatus(status), message: 'Internal server error', error: reasonPhrase(status) } };
  }
}

function isHttpError(error: unknown): error is { statusCode: number; message: string } {
  const candidate = error as { statusCode?: unknown; message?: unknown } | null;
  return (
    typeof candidate?.statusCode === 'number' &&
    candidate.statusCode >= 400 &&
    candidate.statusCode < 600 &&
    typeof candidate.message === 'string'
  );
}
