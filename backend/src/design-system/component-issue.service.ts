import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DocumentStore, VersionConflictError } from '../reviews/document-store';
import { ComponentIssue, ISSUE_STORE, IssueSeverity } from './design-system-stores';

export type { ComponentIssue };

const MAX_WRITE_ATTEMPTS = 5;

export interface IssueFilters {
  status?: string;
  severity?: string;
  componentId?: string;
}

export interface CreateIssueInput {
  title: string;
  description: string;
  category: string;
  severity: IssueSeverity;
  reportedBy: string;
  componentId?: string;
}

export type IssueUpdate = Partial<Pick<ComponentIssue, 'title' | 'description' | 'status' | 'severity' | 'assignedTo'>>;

/** The fields an update may change; anything else in the body is ignored */
const UPDATABLE: ReadonlyArray<keyof IssueUpdate> = ['title', 'description', 'status', 'severity', 'assignedTo'];

/** Issues reported against design-system components, stored in Elasticsearch (design-system-issues) */
@Injectable()
export class ComponentIssueService {
  constructor(@Inject(ISSUE_STORE) private readonly store: DocumentStore<ComponentIssue>) {}

  async create(data: CreateIssueInput): Promise<ComponentIssue> {
    const now = new Date().toISOString();
    const issue: ComponentIssue = {
      id: `issue-${randomUUID()}`,
      title: data.title,
      description: data.description,
      category: data.category,
      severity: data.severity,
      reportedBy: data.reportedBy,
      createdAt: now,
      updatedAt: now,
      status: 'open',
      componentId: data.componentId,
      comments: [],
    };
    await this.store.create(issue);
    return issue;
  }

  async get(id: string): Promise<ComponentIssue | null> {
    return (await this.store.get(id))?.doc ?? null;
  }

  /** Newest first */
  async list(filters: IssueFilters = {}): Promise<ComponentIssue[]> {
    const where: Record<string, string> = {};
    if (filters.status) where.status = filters.status;
    if (filters.severity) where.severity = filters.severity;
    if (filters.componentId) where.componentId = filters.componentId;
    return this.store.list({ where });
  }

  /** The updated issue, or null when there is no such issue */
  async update(id: string, updates: IssueUpdate): Promise<ComponentIssue | null> {
    for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
      const stored = await this.store.get(id);
      if (!stored) return null;
      const issue = stored.doc;
      for (const field of UPDATABLE) {
        if (updates[field] !== undefined) (issue as unknown as Record<string, unknown>)[field] = updates[field];
      }
      issue.updatedAt = new Date().toISOString();
      try {
        await this.store.replace(issue, stored.version);
        return issue;
      } catch (error) {
        if (!(error instanceof VersionConflictError)) throw error;
      }
    }
    throw new ConflictException('The issue was changed by someone else at the same time, please try again');
  }
}
