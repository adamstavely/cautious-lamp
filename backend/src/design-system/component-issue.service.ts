import { Injectable } from '@nestjs/common';
import type { RequestComment } from '../component-requests/component-request.types';

export interface ComponentIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedBy: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'open' | 'investigating' | 'in-progress' | 'resolved' | 'closed';
  assignedTo?: string;
  componentId?: string;
  comments: RequestComment[];
}

@Injectable()
export class ComponentIssueService {
  private issues = new Map<string, ComponentIssue>();

  constructor() {
    // Initialize with some example data
    this.initializeExampleData();
  }

  private initializeExampleData() {
    const issue1: ComponentIssue = {
      id: 'issue-1',
      title: 'Button hover state not working in dark mode',
      description: 'The button component hover state is not visible in dark mode.',
      category: 'bug',
      severity: 'medium',
      reportedBy: 'user-1',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
      status: 'open',
      componentId: 'button',
      comments: []
    };

    this.issues.set(issue1.id, issue1);
  }

  // Issue CRUD operations
  createIssue(data: {
    title: string;
    description: string;
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    reportedBy: string;
    componentId?: string;
  }): ComponentIssue {
    const id = `issue-${Date.now()}`;
    const issue: ComponentIssue = {
      id,
      title: data.title,
      description: data.description,
      category: data.category,
      severity: data.severity,
      reportedBy: data.reportedBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'open',
      componentId: data.componentId,
      comments: []
    };

    this.issues.set(id, issue);
    return issue;
  }

  getIssue(id: string): ComponentIssue | null {
    return this.issues.get(id) || null;
  }

  getAllIssues(filters?: {
    status?: string;
    severity?: string;
    componentId?: string;
  }): ComponentIssue[] {
    let issues = Array.from(this.issues.values());

    if (filters) {
      if (filters.status) {
        issues = issues.filter(i => i.status === filters.status);
      }
      if (filters.severity) {
        issues = issues.filter(i => i.severity === filters.severity);
      }
      if (filters.componentId) {
        issues = issues.filter(i => i.componentId === filters.componentId);
      }
    }

    return issues.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  updateIssue(id: string, updates: Partial<ComponentIssue>): ComponentIssue | null {
    const issue = this.issues.get(id);
    if (!issue) return null;

    const updated = {
      ...issue,
      ...updates,
      updatedAt: new Date()
    };

    this.issues.set(id, updated);
    return updated;
  }
}
