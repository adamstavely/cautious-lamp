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
  onComponentCreated(componentId: string, componentName: string, linkedRequestId?: string): void {
    // If a specific request ID is provided, link directly
    if (linkedRequestId) {
      const request = this.requests.get(linkedRequestId);
      if (request) {
        this.linkToComponent(linkedRequestId, componentId);
        // Auto-transition to in-progress if approved
        if (request.status === 'approved') {
          this.transitionStatus(linkedRequestId, 'in-progress', 'system');
        }
        return;
      }
    }

    // Otherwise, try to find matching request by name
    // Improved matching: check title, description, and category keywords
    const componentNameLower = componentName.toLowerCase();
    const componentKeywords = componentNameLower
      .split(/[\s-]+/)
      .filter(word => word.length > 2); // Filter out short words

    const matchingRequests = Array.from(this.requests.values())
      .filter(req => {
        // Skip if already linked
        if (req.componentId) return false;
        
        // Must be approved or in-progress
        if (!['approved', 'in-progress'].includes(req.status)) return false;

        const titleLower = req.title.toLowerCase();
        const descLower = req.description.toLowerCase();

        // Exact match or contains match
        if (titleLower === componentNameLower || 
            componentNameLower === titleLower ||
            titleLower.includes(componentNameLower) ||
            componentNameLower.includes(titleLower)) {
          return true;
        }

        // Keyword matching
        const titleKeywords = titleLower.split(/[\s-]+/).filter(w => w.length > 2);
        const matchingKeywords = componentKeywords.filter(kw => 
          titleKeywords.some(tk => tk.includes(kw) || kw.includes(tk))
        );
        
        // If at least 2 keywords match, consider it a match
        if (matchingKeywords.length >= 2) {
          return true;
        }

        // Check description for component name
        if (descLower.includes(componentNameLower) || componentNameLower.includes(descLower.split(' ')[0])) {
          return true;
        }

        return false;
      })
      .sort((a, b) => {
        // Sort by priority and recency
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        if (priorityDiff !== 0) return priorityDiff;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

    // Link to the best matching request
    if (matchingRequests.length > 0) {
      const bestMatch = matchingRequests[0];
      this.linkToComponent(bestMatch.id, componentId);
      // Auto-transition to in-progress if approved
      if (bestMatch.status === 'approved') {
        this.transitionStatus(bestMatch.id, 'in-progress', 'system');
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

  // Request Templates
  getRequestTemplates(): Array<{
    id: string;
    name: string;
    description: string;
    template: Partial<ComponentRequest>;
  }> {
    return [
      {
        id: 'component-request',
        name: 'Component Request',
        description: 'Template for requesting a new component',
        template: {
          title: '',
          description: 'Describe the component you need...',
          useCase: 'Explain the use case and where this component will be used...',
          category: 'forms',
          priority: 'medium',
        },
      },
      {
        id: 'bug-report',
        name: 'Bug Report',
        description: 'Template for reporting a bug in an existing component',
        template: {
          title: 'Bug: [Component Name] - [Brief Description]',
          description: '**Steps to Reproduce:**\n1. \n2. \n3. \n\n**Expected Behavior:**\n\n**Actual Behavior:**\n\n**Environment:**\n- Browser: \n- Version: ',
          category: 'bug',
          priority: 'medium',
        },
      },
      {
        id: 'enhancement-request',
        name: 'Enhancement Request',
        description: 'Template for requesting enhancements to existing components',
        template: {
          title: 'Enhancement: [Component Name] - [Brief Description]',
          description: '**Current Behavior:**\n\n**Proposed Enhancement:**\n\n**Use Case:**\n\n**Benefits:**',
          category: 'enhancement',
          priority: 'low',
        },
      },
    ];
  }

  getRequestTemplate(templateId: string): Partial<ComponentRequest> | null {
    const templates = this.getRequestTemplates();
    const template = templates.find(t => t.id === templateId);
    return template ? template.template : null;
  }

  // Duplicate Detection and Merge
  findDuplicateRequests(requestId: string, threshold: number = 0.7): Array<{
    request: ComponentRequest;
    similarity: number;
    reasons: string[];
  }> {
    const request = this.requests.get(requestId);
    if (!request) {
      return [];
    }

    const duplicates: Array<{
      request: ComponentRequest;
      similarity: number;
      reasons: string[];
    }> = [];

    const requestTitleLower = request.title.toLowerCase();
    const requestDescLower = request.description.toLowerCase();
    const requestKeywords = this.extractKeywords(request.title + ' ' + request.description);

    Array.from(this.requests.values()).forEach(otherRequest => {
      if (otherRequest.id === requestId) return; // Skip self
      if (otherRequest.status === 'rejected' || otherRequest.status === 'released') return; // Skip closed requests

      const otherTitleLower = otherRequest.title.toLowerCase();
      const otherDescLower = otherRequest.description.toLowerCase();
      const otherKeywords = this.extractKeywords(otherRequest.title + ' ' + otherRequest.description);

      let similarity = 0;
      const reasons: string[] = [];

      // Title similarity
      if (requestTitleLower === otherTitleLower) {
        similarity += 0.5;
        reasons.push('Exact title match');
      } else {
        const titleSimilarity = this.calculateStringSimilarity(requestTitleLower, otherTitleLower);
        if (titleSimilarity > 0.8) {
          similarity += titleSimilarity * 0.4;
          reasons.push(`Similar title (${Math.round(titleSimilarity * 100)}% match)`);
        }
      }

      // Description similarity
      const descSimilarity = this.calculateStringSimilarity(requestDescLower, otherDescLower);
      if (descSimilarity > 0.6) {
        similarity += descSimilarity * 0.3;
        reasons.push(`Similar description (${Math.round(descSimilarity * 100)}% match)`);
      }

      // Keyword overlap
      const keywordOverlap = this.calculateKeywordOverlap(requestKeywords, otherKeywords);
      if (keywordOverlap > 0.5) {
        similarity += keywordOverlap * 0.2;
        reasons.push(`Shared keywords (${Math.round(keywordOverlap * 100)}% overlap)`);
      }

      // Category match
      if (request.category === otherRequest.category) {
        similarity += 0.1;
        reasons.push('Same category');
      }

      if (similarity >= threshold) {
        duplicates.push({
          request: otherRequest,
          similarity,
          reasons,
        });
      }
    });

    return duplicates.sort((a, b) => b.similarity - a.similarity);
  }

  mergeRequests(sourceRequestId: string, targetRequestId: string, mergeOptions?: {
    keepTitle?: 'source' | 'target';
    keepDescription?: 'source' | 'target' | 'merge';
    keepVotes?: 'source' | 'target' | 'combine';
    keepComments?: 'source' | 'target' | 'combine';
    keepStatus?: 'source' | 'target' | 'highest';
  }): ComponentRequest | null {
    const sourceRequest = this.requests.get(sourceRequestId);
    const targetRequest = this.requests.get(targetRequestId);

    if (!sourceRequest || !targetRequest) {
      return null;
    }

    const options = {
      keepTitle: mergeOptions?.keepTitle || 'target',
      keepDescription: mergeOptions?.keepDescription || 'merge',
      keepVotes: mergeOptions?.keepVotes || 'combine',
      keepComments: mergeOptions?.keepComments || 'combine',
      keepStatus: mergeOptions?.keepStatus || 'highest',
    };

    // Merge title
    const mergedTitle = options.keepTitle === 'source' ? sourceRequest.title : targetRequest.title;

    // Merge description
    let mergedDescription = '';
    if (options.keepDescription === 'merge') {
      mergedDescription = `${targetRequest.description}\n\n--- Merged from request ${sourceRequestId} ---\n\n${sourceRequest.description}`;
    } else {
      mergedDescription = options.keepDescription === 'source' ? sourceRequest.description : targetRequest.description;
    }

    // Merge votes
    let mergedVotes = targetRequest.votes;
    const mergedVoters = [...targetRequest.voters];
    if (options.keepVotes === 'combine') {
      sourceRequest.voters.forEach(voterId => {
        if (!mergedVoters.includes(voterId)) {
          mergedVoters.push(voterId);
          mergedVotes++;
        }
      });
    } else if (options.keepVotes === 'source') {
      mergedVotes = sourceRequest.votes;
      mergedVoters.splice(0, mergedVoters.length, ...sourceRequest.voters);
    }

    // Merge comments
    const mergedComments = [...targetRequest.comments];
    if (options.keepComments === 'combine') {
      sourceRequest.comments.forEach(comment => {
        // Add merge note to comments
        const mergedComment = {
          ...comment,
          content: `[Merged from request ${sourceRequestId}]\n${comment.content}`,
        };
        mergedComments.push(mergedComment);
      });
    } else if (options.keepComments === 'source') {
      mergedComments.splice(0, mergedComments.length, ...sourceRequest.comments);
    }

    // Merge status (keep highest priority status)
    let mergedStatus = targetRequest.status;
    if (options.keepStatus === 'highest') {
      const statusPriority: Record<string, number> = {
        'released': 7,
        'completed': 6,
        'in-progress': 5,
        'approved': 4,
        'under-review': 3,
        'submitted': 2,
        'needs-more-info': 1,
        'rejected': 0,
      };
      if (statusPriority[sourceRequest.status] > statusPriority[targetRequest.status]) {
        mergedStatus = sourceRequest.status;
      }
    } else {
      mergedStatus = options.keepStatus === 'source' ? sourceRequest.status : targetRequest.status;
    }

    // Merge metadata
    const mergedMetadata = {
      ...targetRequest.metadata,
      ...sourceRequest.metadata,
      mergedFrom: sourceRequestId,
      mergedAt: new Date().toISOString(),
    };

    // Update target request with merged data
    const mergedRequest: ComponentRequest = {
      ...targetRequest,
      title: mergedTitle,
      description: mergedDescription,
      votes: mergedVotes,
      voters: mergedVoters,
      comments: mergedComments,
      status: mergedStatus,
      metadata: mergedMetadata,
      updatedAt: new Date(),
    };

    this.requests.set(targetRequestId, mergedRequest);

    // Add a comment to the source request indicating it was merged
    this.addComment(sourceRequestId, {
      author: 'system',
      content: `This request has been merged into request ${targetRequestId}: "${targetRequest.title}"`,
    });

    // Update source request status to rejected (merged)
    sourceRequest.status = 'rejected';
    sourceRequest.metadata = {
      ...sourceRequest.metadata,
      mergedInto: targetRequestId,
      mergedAt: new Date().toISOString(),
    };
    this.requests.set(sourceRequestId, sourceRequest);

    // Send notifications
    if (this.notificationService) {
      this.notificationService.createNotification({
        userId: sourceRequest.requestedBy,
        type: 'request-merged',
        title: 'Request Merged',
        message: `Your request "${sourceRequest.title}" has been merged into "${targetRequest.title}"`,
        link: `/feedback?request=${targetRequestId}`,
      });
    }

    return mergedRequest;
  }

  // Helper methods for duplicate detection
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3); // Filter out short words
    
    // Remove common stop words
    const stopWords = new Set(['the', 'this', 'that', 'with', 'from', 'into', 'have', 'been', 'will', 'would', 'should', 'could', 'may', 'might']);
    return words.filter(word => !stopWords.has(word));
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    // Simple Levenshtein-based similarity
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private calculateKeywordOverlap(keywords1: string[], keywords2: string[]): number {
    if (keywords1.length === 0 || keywords2.length === 0) return 0;
    
    const set1 = new Set(keywords1);
    const set2 = new Set(keywords2);
    
    let matches = 0;
    set1.forEach(keyword => {
      if (set2.has(keyword)) {
        matches++;
      }
    });
    
    return matches / Math.max(keywords1.length, keywords2.length);
  }
}

