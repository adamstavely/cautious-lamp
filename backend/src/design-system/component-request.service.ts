import { Injectable, Inject, forwardRef } from '@nestjs/common';

export interface ComponentRequest {
  id: string;
  title: string;
  description: string;
  useCase?: string;
  requestedBy: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'submitted' | 'under-review' | 'approved' | 'rejected' | 'needs-more-info' | 'in-progress' | 'completed' | 'released';
  votes: number;
  voters: string[]; // User IDs who voted
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  componentId?: string; // Link to created component
  comments: RequestComment[];
  attachments?: string[];
  metadata?: {
    estimatedEffort?: number;
    designReview?: boolean;
    technicalReview?: boolean;
    designApproved?: boolean;
    technicalApproved?: boolean;
    targetRelease?: string;
    roadmapItemId?: string;
    roadmapItemCreatedAt?: string;
  };
}

export interface RequestComment {
  id: string;
  requestId: string;
  author: string;
  content: string;
  createdAt: Date;
  mentions?: string[]; // User IDs mentioned
  attachments?: string[];
}

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
export class ComponentRequestService {
  private requests = new Map<string, ComponentRequest>();
  private issues = new Map<string, ComponentIssue>();
  private comments = new Map<string, RequestComment>();
  private notificationService?: any; // Will be injected if available

  constructor() {
    // Initialize with some example data
    this.initializeExampleData();
  }

  setNotificationService(service: any) {
    this.notificationService = service;
  }

  private initializeExampleData() {
    const request1: ComponentRequest = {
      id: 'req-1',
      title: 'Data Table Component',
      description: 'A comprehensive data table component with sorting, filtering, and pagination capabilities.',
      useCase: 'We need a reusable data table for displaying large datasets across multiple applications.',
      requestedBy: 'user-1',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      status: 'approved',
      votes: 24,
      voters: ['user-2', 'user-3', 'user-4'],
      category: 'data-display',
      priority: 'high',
      assignedTo: 'user-5',
      comments: [],
      metadata: {
        estimatedEffort: 40,
        designReview: true,
        technicalReview: true,
        designApproved: true,
        technicalApproved: true
      }
    };

    const request2: ComponentRequest = {
      id: 'req-2',
      title: 'Date Picker Component',
      description: 'A date picker component with range selection and calendar view.',
      useCase: 'Multiple forms require date selection with range support.',
      requestedBy: 'user-2',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-12'),
      status: 'in-progress',
      votes: 18,
      voters: ['user-1', 'user-3'],
      category: 'form-controls',
      priority: 'medium',
      assignedTo: 'user-6',
      componentId: 'date-picker',
      comments: [],
      metadata: {
        estimatedEffort: 30,
        designReview: true,
        technicalReview: true,
        designApproved: true,
        technicalApproved: true
      }
    };

    const request3: ComponentRequest = {
      id: 'req-3',
      title: 'Toast Notification Component',
      description: 'A toast notification system for displaying temporary messages.',
      useCase: 'Need consistent notification system across all applications.',
      requestedBy: 'user-3',
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-08'),
      status: 'submitted',
      votes: 31,
      voters: ['user-1', 'user-2', 'user-4', 'user-5'],
      category: 'feedback',
      priority: 'high',
      comments: [],
      metadata: {
        estimatedEffort: 20
      }
    };

    this.requests.set(request1.id, request1);
    this.requests.set(request2.id, request2);
    this.requests.set(request3.id, request3);

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

  // Request CRUD operations
  createRequest(data: {
    title: string;
    description: string;
    useCase?: string;
    requestedBy: string;
    category: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  }): ComponentRequest {
    const id = `req-${Date.now()}`;
    const request: ComponentRequest = {
      id,
      title: data.title,
      description: data.description,
      useCase: data.useCase,
      requestedBy: data.requestedBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'submitted',
      votes: 0,
      voters: [],
      category: data.category,
      priority: data.priority || 'medium',
      comments: [],
      metadata: {}
    };

    this.requests.set(id, request);
    return request;
  }

  getRequest(id: string): ComponentRequest | null {
    return this.requests.get(id) || null;
  }

  getAllRequests(filters?: {
    status?: string;
    category?: string;
    assignedTo?: string;
    priority?: string;
  }): ComponentRequest[] {
    let requests = Array.from(this.requests.values());

    if (filters) {
      if (filters.status) {
        requests = requests.filter(r => r.status === filters.status);
      }
      if (filters.category) {
        requests = requests.filter(r => r.category === filters.category);
      }
      if (filters.assignedTo) {
        requests = requests.filter(r => r.assignedTo === filters.assignedTo);
      }
      if (filters.priority) {
        requests = requests.filter(r => r.priority === filters.priority);
      }
    }

    return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  updateRequest(id: string, updates: Partial<ComponentRequest>): ComponentRequest | null {
    const request = this.requests.get(id);
    if (!request) return null;

    const updated = {
      ...request,
      ...updates,
      updatedAt: new Date()
    };

    this.requests.set(id, updated);
    return updated;
  }

  deleteRequest(id: string): boolean {
    return this.requests.delete(id);
  }

  // Voting
  voteRequest(requestId: string, userId: string): ComponentRequest | null {
    const request = this.requests.get(requestId);
    if (!request) return null;

    const hasVoted = request.voters.includes(userId);
    if (hasVoted) {
      request.votes--;
      request.voters = request.voters.filter(id => id !== userId);
    } else {
      request.votes++;
      request.voters.push(userId);
    }

    request.updatedAt = new Date();
    this.requests.set(requestId, request);
    return request;
  }

  // Status transitions
  transitionStatus(requestId: string, newStatus: ComponentRequest['status'], userId: string): ComponentRequest | null {
    const request = this.requests.get(requestId);
    if (!request) return null;

    // Validate transition
    const validTransitions: Record<string, string[]> = {
      'submitted': ['under-review', 'rejected'],
      'under-review': ['approved', 'rejected', 'needs-more-info'],
      'needs-more-info': ['under-review', 'rejected'],
      'approved': ['in-progress', 'rejected'],
      'in-progress': ['completed', 'rejected'],
      'completed': ['released'],
      'rejected': [],
      'released': []
    };

    const allowedStatuses = validTransitions[request.status] || [];
    if (!allowedStatuses.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${request.status} to ${newStatus}`);
    }

    const oldStatus = request.status;
    request.status = newStatus;
    request.updatedAt = new Date();

    // Auto-assign on approval if not assigned
    if (newStatus === 'approved' && !request.assignedTo) {
      // Could implement auto-assignment logic here
    }

    // Send notifications
    if (this.notificationService) {
      this.notificationService.notifyRequestStatusChange(request, newStatus);
      if (oldStatus !== newStatus) {
        this.notificationService.notifyRequestUpdated(request, userId);
      }
    }

    this.requests.set(requestId, request);
    return request;
  }

  // Assignment
  assignRequest(requestId: string, userId: string): ComponentRequest | null {
    const request = this.updateRequest(requestId, { assignedTo: userId });
    
    // Send notification
    if (request && this.notificationService) {
      this.notificationService.notifyRequestAssigned(request, userId);
    }
    
    return request;
  }

  // Comments
  addComment(requestId: string, data: {
    author: string;
    content: string;
    mentions?: string[];
    attachments?: string[];
  }): RequestComment {
    const comment: RequestComment = {
      id: `comment-${Date.now()}`,
      requestId,
      author: data.author,
      content: data.content,
      createdAt: new Date(),
      mentions: data.mentions || [],
      attachments: data.attachments || []
    };

    this.comments.set(comment.id, comment);

    const request = this.requests.get(requestId);
    if (request) {
      request.comments.push(comment);
      request.updatedAt = new Date();
      this.requests.set(requestId, request);

      // Send notifications
      if (this.notificationService) {
        this.notificationService.notifyCommentAdded(request, data.author);
        
        // Notify mentioned users
        if (data.mentions && data.mentions.length > 0) {
          data.mentions.forEach(mentionedId => {
            this.notificationService.createNotification({
              userId: mentionedId,
              type: 'request-commented',
              title: `You were mentioned in "${request.title}"`,
              message: `${data.author} mentioned you in a comment`,
              link: `/feedback?request=${requestId}`
            });
          });
        }
      }
    }

    return comment;
  }

  getComments(requestId: string): RequestComment[] {
    return Array.from(this.comments.values())
      .filter(c => c.requestId === requestId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // Link to component
  linkToComponent(requestId: string, componentId: string): ComponentRequest | null {
    const request = this.updateRequest(requestId, { componentId });
    if (request) {
      // Auto-transition to completed when component is created
      if (request.status === 'in-progress') {
        return this.transitionStatus(requestId, 'completed', 'system');
      }
    }
    return request;
  }

  // Auto-link when component is created (called from DesignSystemService)
  onComponentCreated(componentId: string, componentName: string): void {
    // Try to find matching request by name
    const matchingRequest = Array.from(this.requests.values()).find(
      req => req.title.toLowerCase().includes(componentName.toLowerCase()) ||
             componentName.toLowerCase().includes(req.title.toLowerCase())
    );

    if (matchingRequest && matchingRequest.status === 'approved') {
      this.linkToComponent(matchingRequest.id, componentId);
      // Auto-transition to in-progress if approved
      if (matchingRequest.status === 'approved') {
        this.transitionStatus(matchingRequest.id, 'in-progress', 'system');
      }
    }
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

  // Analytics
  getRequestAnalytics() {
    const requests = Array.from(this.requests.values());
    const issues = Array.from(this.issues.values());

    return {
      totalRequests: requests.length,
      requestsByStatus: {
        submitted: requests.filter(r => r.status === 'submitted').length,
        'under-review': requests.filter(r => r.status === 'under-review').length,
        approved: requests.filter(r => r.status === 'approved').length,
        'in-progress': requests.filter(r => r.status === 'in-progress').length,
        completed: requests.filter(r => r.status === 'completed').length,
        released: requests.filter(r => r.status === 'released').length,
        rejected: requests.filter(r => r.status === 'rejected').length
      },
      requestsByPriority: {
        low: requests.filter(r => r.priority === 'low').length,
        medium: requests.filter(r => r.priority === 'medium').length,
        high: requests.filter(r => r.priority === 'high').length,
        critical: requests.filter(r => r.priority === 'critical').length
      },
      totalIssues: issues.length,
      issuesByStatus: {
        open: issues.filter(i => i.status === 'open').length,
        investigating: issues.filter(i => i.status === 'investigating').length,
        'in-progress': issues.filter(i => i.status === 'in-progress').length,
        resolved: issues.filter(i => i.status === 'resolved').length,
        closed: issues.filter(i => i.status === 'closed').length
      },
      averageVotes: requests.length > 0
        ? requests.reduce((sum, r) => sum + r.votes, 0) / requests.length
        : 0,
      mostRequestedCategory: this.getMostRequestedCategory(requests)
    };
  }

  private getMostRequestedCategory(requests: ComponentRequest[]): string | null {
    const categoryCounts = new Map<string, number>();
    requests.forEach(r => {
      categoryCounts.set(r.category, (categoryCounts.get(r.category) || 0) + 1);
    });

    let maxCount = 0;
    let maxCategory: string | null = null;
    categoryCounts.forEach((count, category) => {
      if (count > maxCount) {
        maxCount = count;
        maxCategory = category;
      }
    });

    return maxCategory;
  }
}

