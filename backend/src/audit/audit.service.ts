import { Injectable, Inject, Optional } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

export interface AuditLog {
  id?: string;
  timestamp: Date;
  userId: string;
  userName?: string;
  userEmail?: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  method?: string;
  endpoint?: string;
  ipAddress?: string;
  userAgent?: string;
  requestBody?: any;
  responseStatus?: number;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: Record<string, any>;
  success: boolean;
  errorMessage?: string;
}

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  COMMENT = 'COMMENT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  VOTE = 'VOTE',
  ASSIGN = 'ASSIGN',
  STATUS_CHANGE = 'STATUS_CHANGE',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  API_CALL = 'API_CALL',
  DOWNLOAD = 'DOWNLOAD',
  UPLOAD = 'UPLOAD',
  PUBLISH = 'PUBLISH',
  UNPUBLISH = 'UNPUBLISH',
  ARCHIVE = 'ARCHIVE',
  RESTORE = 'RESTORE',
}

@Injectable()
export class AuditService {
  private readonly indexPrefix = 'design-system-audit';

  constructor(
    @Optional() @Inject(ElasticsearchService) private readonly elasticsearchService?: ElasticsearchService,
  ) {}

  /**
   * Log an audit event
   */
  async log(auditLog: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const log: AuditLog = {
      ...auditLog,
      timestamp: new Date(),
    };

    // If Elasticsearch is not available, log to console
    if (!this.elasticsearchService) {
      console.log('[AUDIT]', JSON.stringify(log, null, 2));
      return;
    }

    try {
      const index = this.getIndexName();
      await this.elasticsearchService.index({
        index,
        document: {
          '@timestamp': log.timestamp.toISOString(),
          userId: log.userId,
          userName: log.userName,
          userEmail: log.userEmail,
          action: log.action,
          resourceType: log.resourceType,
          resourceId: log.resourceId,
          resourceName: log.resourceName,
          method: log.method,
          endpoint: log.endpoint,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          requestBody: log.requestBody,
          responseStatus: log.responseStatus,
          changes: log.changes,
          metadata: log.metadata,
          success: log.success,
          errorMessage: log.errorMessage,
        },
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw - audit logging should not break the application
    }
  }

  /**
   * Query audit logs
   */
  async query(filters: {
    userId?: string;
    action?: AuditAction;
    resourceType?: string;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    if (!this.elasticsearchService) {
      return { logs: [], total: 0 };
    }

    try {
      const must: any[] = [];

      if (filters.userId) {
        must.push({ term: { userId: filters.userId } });
      }

      if (filters.action) {
        must.push({ term: { action: filters.action } });
      }

      if (filters.resourceType) {
        must.push({ term: { resourceType: filters.resourceType } });
      }

      if (filters.resourceId) {
        must.push({ term: { resourceId: filters.resourceId } });
      }

      if (filters.startDate || filters.endDate) {
        const range: any = {};
        if (filters.startDate) {
          range.gte = filters.startDate.toISOString();
        }
        if (filters.endDate) {
          range.lte = filters.endDate.toISOString();
        }
        must.push({ range: { '@timestamp': range } });
      }

      const query: any = {
        index: `${this.indexPrefix}-*`,
        body: {
          query: {
            bool: {
              must: must.length > 0 ? must : [{ match_all: {} }],
            },
          },
          sort: [{ '@timestamp': { order: 'desc' } }],
          size: filters.limit || 100,
          from: filters.offset || 0,
        },
      };

      const result = await this.elasticsearchService.search(query);

      const logs: AuditLog[] = (result.hits.hits as any[]).map((hit) => ({
        id: hit._id,
        timestamp: new Date(hit._source['@timestamp']),
        userId: hit._source.userId,
        userName: hit._source.userName,
        userEmail: hit._source.userEmail,
        action: hit._source.action,
        resourceType: hit._source.resourceType,
        resourceId: hit._source.resourceId,
        resourceName: hit._source.resourceName,
        method: hit._source.method,
        endpoint: hit._source.endpoint,
        ipAddress: hit._source.ipAddress,
        userAgent: hit._source.userAgent,
        requestBody: hit._source.requestBody,
        responseStatus: hit._source.responseStatus,
        changes: hit._source.changes,
        metadata: hit._source.metadata,
        success: hit._source.success,
        errorMessage: hit._source.errorMessage,
      }));

      return {
        logs,
        total: (result.hits.total as any)?.value || result.hits.total || 0,
      };
    } catch (error) {
      console.error('Failed to query audit logs:', error);
      return { logs: [], total: 0 };
    }
  }

  /**
   * Export audit logs
   */
  async export(filters: {
    userId?: string;
    action?: AuditAction;
    resourceType?: string;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
  }, format: 'json' | 'csv'): Promise<string> {
    const { logs } = await this.query({ ...filters, limit: 10000 });

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }

    // CSV format
    const headers = [
      'Timestamp',
      'User ID',
      'User Name',
      'User Email',
      'Action',
      'Resource Type',
      'Resource ID',
      'Resource Name',
      'Method',
      'Endpoint',
      'IP Address',
      'Status',
      'Success',
      'Error Message',
    ];

    const rows = logs.map((log) => [
      log.timestamp.toISOString(),
      log.userId || '',
      log.userName || '',
      log.userEmail || '',
      log.action,
      log.resourceType,
      log.resourceId || '',
      log.resourceName || '',
      log.method || '',
      log.endpoint || '',
      log.ipAddress || '',
      log.responseStatus?.toString() || '',
      log.success.toString(),
      log.errorMessage || '',
    ]);

    return [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  }

  private getIndexName(): string {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '.');
    return `${this.indexPrefix}-${date}`;
  }
}

