import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuditService, AuditAction } from './audit.service';
import { Request } from 'express';
import type { AuthedRequest } from '../auth/principal';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, ip, headers } = request;
    
    // Set by the global AuthGuard; absent on public routes
    const principal = (request as AuthedRequest).principal;
    const userId = principal?.id || 'anonymous';
    const userName = principal?.name || 'Unknown';
    const userEmail = principal?.email || undefined;

    // Determine action based on HTTP method
    let action: AuditAction = AuditAction.API_CALL;
    if (method === 'POST') {
      action = AuditAction.CREATE;
    } else if (method === 'GET') {
      action = AuditAction.READ;
    } else if (method === 'PUT' || method === 'PATCH') {
      action = AuditAction.UPDATE;
    } else if (method === 'DELETE') {
      action = AuditAction.DELETE;
    }

    // Determine resource type from URL
    const resourceType = this.extractResourceType(url);

    const startTime = Date.now();

    return next.handle().pipe(
      tap((response) => {
        // Log successful request
        this.auditService.log({
          userId,
          userName,
          userEmail,
          action,
          resourceType,
          resourceId: this.extractResourceId(request, url, body, response),
          resourceName: this.extractResourceName(url, body, response),
          method,
          endpoint: url,
          ipAddress: ip,
          userAgent: headers['user-agent'],
          requestBody: this.sanitizeRequestBody(body),
          responseStatus: 200,
          success: true,
        });
      }),
      catchError((error) => {
        // Log failed request
        this.auditService.log({
          userId,
          userName,
          userEmail,
          action,
          resourceType,
          resourceId: this.extractResourceId(request, url, body),
          method,
          endpoint: url,
          ipAddress: ip,
          userAgent: headers['user-agent'],
          requestBody: this.sanitizeRequestBody(body),
          responseStatus: error.status || 500,
          success: false,
          errorMessage: error.message,
        });

        // Log security events for specific error types
        if (error.status === 401 || error.status === 403) {
          // This will be handled by SecurityAuditService if injected
        }

        throw error;
      }),
    );
  }

  private extractResourceType(url: string): string {
    const parts = url.split('/').filter(Boolean);
    if (parts.length >= 2 && parts[0] === 'api' && parts[1] === 'v1') {
      return parts[2] || 'unknown';
    }
    return 'unknown';
  }

  /**
   * The record the request acted on: the route's :id parameter, else the path
   * segment after the resource type (/api/v1/applications/<id>/workspace is
   * that application, not "workspace"), else the id in the body or, for a
   * create, the response.
   */
  private extractResourceId(request: Request, url: string, body: any, response?: any): string | undefined {
    const params = (request.params ?? {}) as Record<string, string>;
    if (params.id) return params.id;
    const parts = url.split('?')[0].split('/').filter(Boolean);
    if (parts[0] === 'api' && parts[1] === 'v1' && parts.length >= 4) return decodeURIComponent(parts[3]);
    return body?.id ?? response?.id ?? undefined;
  }

  private extractResourceName(url: string, body: any, response: any): string | undefined {
    if (body?.name) {
      return body.name;
    }
    if (response?.name) {
      return response.name;
    }
    if (response?.title) {
      return response.title;
    }
    return undefined;
  }

  private sanitizeRequestBody(body: any): any {
    if (!body) {
      return undefined;
    }
    return redactSecrets(body);
  }

}

/**
 * Field names whose values are credentials: passwords, tokens, API keys,
 * secrets, authorization headers, and names built from them such as
 * argosToken or openreplayApiKey. Matched anywhere in the body, at any depth.
 */
const SECRET_FIELD = /pass(word|phrase)?|token|api[-_]?key|secret|authorization|credential|private[-_]?key/i;
const MAX_DEPTH = 8;

/** A copy of the body with every secret-looking field's value replaced, so the audit log never stores one */
export function redactSecrets(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return '[TRUNCATED]';
  if (Array.isArray(value)) return value.map((item) => redactSecrets(item, depth + 1));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, field]) => [
        key,
        SECRET_FIELD.test(key) && field !== undefined && field !== null && field !== '' ? '[REDACTED]' : redactSecrets(field, depth + 1),
      ]),
    );
  }
  return value;
}
