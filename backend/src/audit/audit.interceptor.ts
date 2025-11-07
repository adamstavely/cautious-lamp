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

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, ip, headers } = request;
    
    // Extract user information from request (adjust based on your auth implementation)
    const userId = (request as any).user?.id || (request as any).user?.userId || 'anonymous';
    const userName = (request as any).user?.name || (request as any).user?.username || 'Unknown';
    const userEmail = (request as any).user?.email || undefined;

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
          resourceId: this.extractResourceId(url, body),
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
          resourceId: this.extractResourceId(url, body),
          method,
          endpoint: url,
          ipAddress: ip,
          userAgent: headers['user-agent'],
          requestBody: this.sanitizeRequestBody(body),
          responseStatus: error.status || 500,
          success: false,
          errorMessage: error.message,
        });
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

  private extractResourceId(url: string, body: any): string | undefined {
    // Try to extract ID from URL
    const urlMatch = url.match(/\/([a-f0-9-]{36}|[a-zA-Z0-9-_]+)$/);
    if (urlMatch) {
      return urlMatch[1];
    }
    // Try to extract ID from body
    if (body?.id) {
      return body.id;
    }
    return undefined;
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

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'authorization'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}

