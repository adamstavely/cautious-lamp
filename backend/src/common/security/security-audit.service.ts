import { Injectable, Logger } from '@nestjs/common';
import { AuditService, AuditAction } from '../../audit/audit.service';

export interface SecurityEvent {
  type: 'auth_failed' | 'auth_success' | 'token_rotation' | 'token_revocation' | 'encryption' | 'rate_limit' | 'suspicious_activity' | 'permission_denied';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Service for logging security-specific audit events
 */
@Injectable()
export class SecurityAuditService {
  private readonly logger = new Logger(SecurityAuditService.name);
  private readonly suspiciousActivityPatterns: Array<{
    pattern: RegExp;
    severity: 'medium' | 'high' | 'critical';
    description: string;
  }> = [];

  constructor(
    private readonly auditService: AuditService,
  ) {
    // Initialize suspicious activity patterns
    this.initializeSuspiciousPatterns();
  }

  /**
   * Log a security event
   */
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const auditAction = this.mapEventToAuditAction(event.type);
    
    await this.auditService.log({
      userId: event.userId || 'system',
      action: auditAction,
      resourceType: 'security',
      resourceId: event.type,
      method: 'SECURITY_EVENT',
      endpoint: `/security/events/${event.type}`,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      metadata: {
        ...event.metadata,
        severity: event.severity,
        description: event.description,
      },
      success: event.type !== 'auth_failed' && event.type !== 'permission_denied',
      errorMessage: event.type === 'auth_failed' || event.type === 'permission_denied' ? event.description : undefined,
    });

    // Log to console for critical events
    if (event.severity === 'critical') {
      this.logger.error(`[SECURITY CRITICAL] ${event.description}`, event);
    } else if (event.severity === 'high') {
      this.logger.warn(`[SECURITY HIGH] ${event.description}`, event);
    }

    // Check for suspicious activity patterns
    await this.checkSuspiciousActivity(event);
  }

  /**
   * Log authentication failure
   */
  async logAuthFailure(
    userId: string | undefined,
    reason: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.logSecurityEvent({
      type: 'auth_failed',
      severity: 'medium',
      description: `Authentication failed: ${reason}`,
      userId,
      ipAddress,
      userAgent,
      metadata: {
        ...metadata,
        reason,
      },
    });
  }

  /**
   * Log authentication success
   */
  async logAuthSuccess(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    await this.logSecurityEvent({
      type: 'auth_success',
      severity: 'low',
      description: `Authentication successful for user: ${userId}`,
      userId,
      ipAddress,
      userAgent,
      metadata,
    });
  }

  /**
   * Log token rotation
   */
  async logTokenRotation(
    userId: string,
    tokenId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logSecurityEvent({
      type: 'token_rotation',
      severity: 'medium',
      description: `Token rotated: ${tokenId}`,
      userId,
      ipAddress,
      userAgent,
      metadata: {
        tokenId,
      },
    });
  }

  /**
   * Log token revocation
   */
  async logTokenRevocation(
    userId: string,
    tokenId: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logSecurityEvent({
      type: 'token_revocation',
      severity: 'medium',
      description: `Token revoked: ${tokenId} - ${reason}`,
      userId,
      ipAddress,
      userAgent,
      metadata: {
        tokenId,
        reason,
      },
    });
  }

  /**
   * Log encryption operation
   */
  async logEncryptionOperation(
    operation: 'encrypt' | 'decrypt',
    resourceType: string,
    resourceId: string,
    userId?: string,
    success: boolean = true,
  ): Promise<void> {
    await this.logSecurityEvent({
      type: 'encryption',
      severity: 'low',
      description: `Encryption operation: ${operation} on ${resourceType}:${resourceId}`,
      userId,
      metadata: {
        operation,
        resourceType,
        resourceId,
        success,
      },
    });
  }

  /**
   * Log rate limit exceeded
   */
  async logRateLimitExceeded(
    identifier: string,
    endpoint: string,
    limit: number,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logSecurityEvent({
      type: 'rate_limit',
      severity: 'medium',
      description: `Rate limit exceeded: ${identifier} on ${endpoint} (limit: ${limit})`,
      ipAddress,
      userAgent,
      metadata: {
        identifier,
        endpoint,
        limit,
      },
    });
  }

  /**
   * Log permission denied
   */
  async logPermissionDenied(
    userId: string,
    resourceType: string,
    resourceId: string,
    action: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.logSecurityEvent({
      type: 'permission_denied',
      severity: 'high',
      description: `Permission denied: ${userId} attempted ${action} on ${resourceType}:${resourceId}`,
      userId,
      ipAddress,
      userAgent,
      metadata: {
        resourceType,
        resourceId,
        action,
      },
    });
  }

  /**
   * Check for suspicious activity patterns
   */
  private async checkSuspiciousActivity(event: SecurityEvent): Promise<void> {
    const eventString = JSON.stringify(event).toLowerCase();

    for (const pattern of this.suspiciousActivityPatterns) {
      if (pattern.pattern.test(eventString)) {
        await this.logSecurityEvent({
          type: 'suspicious_activity',
          severity: pattern.severity,
          description: `${pattern.description} - Detected in: ${event.type}`,
          userId: event.userId,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          metadata: {
            ...event.metadata,
            detectedPattern: pattern.description,
          },
        });
        break;
      }
    }
  }

  /**
   * Initialize suspicious activity detection patterns
   */
  private initializeSuspiciousPatterns(): void {
    this.suspiciousActivityPatterns.push(
      {
        pattern: /multiple.*auth.*fail/i,
        severity: 'high',
        description: 'Multiple authentication failures detected',
      },
      {
        pattern: /rapid.*token.*rotation/i,
        severity: 'medium',
        description: 'Rapid token rotation detected',
      },
      {
        pattern: /unusual.*ip.*pattern/i,
        severity: 'medium',
        description: 'Unusual IP address pattern',
      },
      {
        pattern: /privilege.*escalation/i,
        severity: 'critical',
        description: 'Potential privilege escalation attempt',
      },
    );
  }

  /**
   * Map security event type to audit action
   */
  private mapEventToAuditAction(eventType: SecurityEvent['type']): AuditAction {
    const mapping: Record<SecurityEvent['type'], AuditAction> = {
      'auth_failed': AuditAction.AUTH_FAILED,
      'auth_success': AuditAction.AUTH_SUCCESS,
      'token_rotation': AuditAction.TOKEN_ROTATED,
      'token_revocation': AuditAction.TOKEN_REVOKED,
      'encryption': AuditAction.ENCRYPTION_OPERATION,
      'rate_limit': AuditAction.RATE_LIMIT_EXCEEDED,
      'suspicious_activity': AuditAction.SUSPICIOUS_ACTIVITY,
      'permission_denied': AuditAction.PERMISSION_DENIED,
    };
    return mapping[eventType] || AuditAction.API_CALL;
  }
}

