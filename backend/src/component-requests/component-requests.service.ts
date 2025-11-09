import { Injectable, Optional, Inject, forwardRef } from '@nestjs/common';
import { ComponentRequest, RequestComment } from '../design-system/component-request.service';
import { DesignSystemService } from '../design-system/design-system.service';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  similar: Array<{
    id: string;
    title: string;
    similarity: number;
    status: string;
  }>;
}

export interface RequestAnalytics {
  totalRequests: number;
  requestsByStatus: Record<string, number>;
  requestsByPriority: Record<string, number>;
  averageTimeToCompletion: number;
  averageTimeToApproval: number;
  fulfillmentRate: number;
  requestsByCategory: Record<string, number>;
  topRequesters: Array<{ userId: string; count: number }>;
  requestsOverTime: Array<{ date: string; count: number }>;
}

@Injectable()
export class ComponentRequestsService {
  private requests = new Map<string, ComponentRequest>();
  private comments = new Map<string, RequestComment>();
  private statusHistory = new Map<string, Array<{ status: string; timestamp: Date; userId: string; comment?: string }>>();

  constructor(
    @Inject(forwardRef(() => DesignSystemService))
    private readonly designSystemService: DesignSystemService,
  ) {
    this.initializeExampleData();
    // Set up callback for component creation
    this.designSystemService.setComponentCreatedCallback(
      (componentId: string, componentName: string, linkedRequestId?: string) => {
        this.onComponentCreated(componentId, componentName, linkedRequestId);
      }
    );
  }

  private initializeExampleData() {
    // Initialize with example data from existing service
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
        technicalApproved: true,
      },
    };

    this.requests.set(request1.id, request1);
    this.statusHistory.set(request1.id, [
      { status: 'submitted', timestamp: new Date('2024-01-15'), userId: 'user-1' },
      { status: 'under-review', timestamp: new Date('2024-01-16'), userId: 'admin' },
      { status: 'approved', timestamp: new Date('2024-01-20'), userId: 'admin' },
    ]);
  }

  // Workflow State Machine
  private readonly workflowStates: Record<string, {
    allowedTransitions: string[];
    requiresApproval: boolean;
    autoPromote?: boolean;
  }> = {
    submitted: {
      allowedTransitions: ['under-review', 'rejected'],
      requiresApproval: false,
    },
    'under-review': {
      allowedTransitions: ['approved', 'rejected', 'needs-more-info'],
      requiresApproval: true,
    },
    'needs-more-info': {
      allowedTransitions: ['under-review', 'rejected'],
      requiresApproval: false,
    },
    approved: {
      allowedTransitions: ['in-progress', 'rejected'],
      requiresApproval: true,
      autoPromote: true, // Auto-promote when approved
    },
    'in-progress': {
      allowedTransitions: ['completed', 'rejected'],
      requiresApproval: false,
    },
    completed: {
      allowedTransitions: ['released'],
      requiresApproval: false,
    },
    released: {
      allowedTransitions: [],
      requiresApproval: false,
    },
    rejected: {
      allowedTransitions: [],
      requiresApproval: false,
    },
  };

  // Multi-stage approval workflow
  private readonly approvalStages = {
    design: {
      required: true,
      approverRole: 'designer',
      nextStage: 'technical',
    },
    technical: {
      required: true,
      approverRole: 'developer',
      nextStage: 'final',
    },
    final: {
      required: true,
      approverRole: 'design_system_manager',
      nextStage: null, // Final approval
    },
  };

  createRequest(data: {
    title: string;
    description: string;
    useCase?: string;
    requestedBy: string;
    category: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    attachments?: string[];
    estimatedEffort?: number;
    targetRelease?: string;
    relatedComponents?: string[];
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
      metadata: {
        estimatedEffort: data.estimatedEffort,
        designReview: false,
        technicalReview: false,
        designApproved: false,
        technicalApproved: false,
      },
    };

    if (data.attachments) {
      request.attachments = data.attachments;
    }

    this.requests.set(id, request);
    this.statusHistory.set(id, [
      { status: 'submitted', timestamp: new Date(), userId: data.requestedBy },
    ]);

    return request;
  }

  getRequest(id: string): ComponentRequest | null {
    return this.requests.get(id) || null;
  }

  getAllRequests(filters?: {
    status?: string;
    category?: string;
    priority?: string;
    assignedTo?: string;
    requestedBy?: string;
  }): ComponentRequest[] {
    let requests = Array.from(this.requests.values());

    if (filters) {
      if (filters.status) {
        requests = requests.filter(r => r.status === filters.status);
      }
      if (filters.category) {
        requests = requests.filter(r => r.category === filters.category);
      }
      if (filters.priority) {
        requests = requests.filter(r => r.priority === filters.priority);
      }
      if (filters.assignedTo) {
        requests = requests.filter(r => r.assignedTo === filters.assignedTo);
      }
      if (filters.requestedBy) {
        requests = requests.filter(r => r.requestedBy === filters.requestedBy);
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
      updatedAt: new Date(),
    };

    this.requests.set(id, updated);
    return updated;
  }

  deleteRequest(id: string): boolean {
    const deleted = this.requests.delete(id);
    if (deleted) {
      this.statusHistory.delete(id);
    }
    return deleted;
  }

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

  // Enhanced workflow automation with state machine
  transitionStatus(
    requestId: string,
    newStatus: ComponentRequest['status'],
    userId: string,
    comment?: string,
  ): ComponentRequest | null {
    const request = this.requests.get(requestId);
    if (!request) return null;

    const currentState = this.workflowStates[request.status];
    if (!currentState) {
      throw new Error(`Invalid current status: ${request.status}`);
    }

    // Validate transition
    if (!currentState.allowedTransitions.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${request.status} to ${newStatus}. ` +
        `Allowed transitions: ${currentState.allowedTransitions.join(', ')}`
      );
    }

    const oldStatus = request.status;
    request.status = newStatus;
    request.updatedAt = new Date();

    // Record status history
    const history = this.statusHistory.get(requestId) || [];
    history.push({
      status: newStatus,
      timestamp: new Date(),
      userId,
      comment,
    });
    this.statusHistory.set(requestId, history);

    // Auto-assign on approval if not assigned
    if (newStatus === 'approved' && !request.assignedTo) {
      // Could implement auto-assignment logic here
    }

    // Auto-promote when approved
    if (newStatus === 'approved' && currentState.autoPromote) {
      // This will be handled by the approveRequest method
      // The auto-promotion logic is in the approveRequest method
    }

    // Create roadmap item when status transitions to approved
    if (newStatus === 'approved' && oldStatus !== 'approved') {
      // Only create if not already created (check metadata)
      if (!request.metadata?.roadmapItemId) {
        this.createRoadmapItemFromRequest(request);
      }
    }

    this.requests.set(requestId, request);
    return request;
  }

  // Multi-stage approval process
  approveRequest(
    requestId: string,
    userId: string,
    stage?: 'design' | 'technical' | 'final',
  ): ComponentRequest | null {
    const request = this.requests.get(requestId);
    if (!request) return null;

    if (!request.metadata) {
      request.metadata = {};
    }

    // Determine which stage to approve
    if (!stage) {
      // Auto-determine stage based on current approvals
      if (!request.metadata.designApproved) {
        stage = 'design';
      } else if (!request.metadata.technicalApproved) {
        stage = 'technical';
      } else {
        stage = 'final';
      }
    }

    // Mark stage as approved
    if (stage === 'design') {
      request.metadata.designApproved = true;
      request.metadata.designReview = true;
    } else if (stage === 'technical') {
      request.metadata.technicalApproved = true;
      request.metadata.technicalReview = true;
    }

    // Check if all stages are approved
    const allStagesApproved =
      request.metadata.designApproved &&
      request.metadata.technicalApproved &&
      stage === 'final';

    if (allStagesApproved) {
      // Final approval - transition to approved status
      if (request.status === 'under-review') {
        this.transitionStatus(requestId, 'approved', userId, 'All approval stages completed');
        // Roadmap item creation is handled in transitionStatus method
      }
    } else if (request.status === 'submitted') {
      // First approval - move to under-review
      this.transitionStatus(requestId, 'under-review', userId, `${stage} review started`);
    }

    request.updatedAt = new Date();
    this.requests.set(requestId, request);
    return request;
  }

  rejectRequest(requestId: string, userId: string, reason: string): ComponentRequest | null {
    const request = this.transitionStatus(requestId, 'rejected', userId, reason);
    if (request) {
      // Reset approval flags
      if (request.metadata) {
        request.metadata.designApproved = false;
        request.metadata.technicalApproved = false;
      }
    }
    return request;
  }

  assignRequest(requestId: string, userId: string): ComponentRequest | null {
    return this.updateRequest(requestId, { assignedTo: userId });
  }

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
      attachments: data.attachments || [],
    };

    this.comments.set(comment.id, comment);

    const request = this.requests.get(requestId);
    if (request) {
      request.comments.push(comment);
      request.updatedAt = new Date();
      this.requests.set(requestId, request);
    }

    return comment;
  }

  getComments(requestId: string): RequestComment[] {
    return Array.from(this.comments.values())
      .filter(c => c.requestId === requestId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // Link request to component
  linkToComponent(requestId: string, componentId: string): ComponentRequest | null {
    const request = this.requests.get(requestId);
    if (!request) return null;

    request.componentId = componentId;
    request.updatedAt = new Date();
    this.requests.set(requestId, request);

    // Auto-transition to completed if in-progress
    if (request.status === 'in-progress') {
      this.transitionStatus(requestId, 'completed', 'system');
    }

    return request;
  }

  // Unlink request from component
  unlinkFromComponent(requestId: string): ComponentRequest | null {
    const request = this.requests.get(requestId);
    if (!request) return null;

    request.componentId = undefined;
    request.updatedAt = new Date();
    this.requests.set(requestId, request);

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

  // Duplicate detection using similarity algorithm
  checkForDuplicates(title: string, description?: string): DuplicateCheckResult {
    const allRequests = Array.from(this.requests.values());
    const similar: Array<{ id: string; title: string; similarity: number; status: string }> = [];

    const titleLower = title.toLowerCase();
    const descriptionLower = description?.toLowerCase() || '';

    allRequests.forEach(request => {
      const requestTitleLower = request.title.toLowerCase();
      const requestDescriptionLower = request.description?.toLowerCase() || '';

      // Calculate similarity scores
      const titleSimilarity = this.calculateSimilarity(titleLower, requestTitleLower);
      const descriptionSimilarity = description
        ? this.calculateSimilarity(descriptionLower, requestDescriptionLower)
        : 0;

      // Weighted similarity (title is more important)
      const overallSimilarity = (titleSimilarity * 0.7) + (descriptionSimilarity * 0.3);

      // Threshold for considering it similar (70% similarity)
      if (overallSimilarity >= 0.7) {
        similar.push({
          id: request.id,
          title: request.title,
          similarity: Math.round(overallSimilarity * 100),
          status: request.status,
        });
      }
    });

    // Sort by similarity (highest first)
    similar.sort((a, b) => b.similarity - a.similarity);

    return {
      isDuplicate: similar.length > 0 && similar[0].similarity >= 0.9,
      similar,
    };
  }

  // Simple string similarity using Levenshtein distance
  private calculateSimilarity(str1: string, str2: string): number {
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

  // Automated promotion to main system
  promoteToSystem(requestId: string, componentId: string): ComponentRequest | null {
    const request = this.requests.get(requestId);
    if (!request) return null;

    if (request.status !== 'approved' && request.status !== 'in-progress') {
      throw new Error(`Cannot promote request with status: ${request.status}. Must be 'approved' or 'in-progress'.`);
    }

    // Link to component
    request.componentId = componentId;
    request.updatedAt = new Date();

    // Auto-transition to in-progress if approved
    if (request.status === 'approved') {
      this.transitionStatus(requestId, 'in-progress', 'system', `Component created: ${componentId}`);
    }

    this.requests.set(requestId, request);
    return request;
  }

  // Enhanced analytics
  getRequestAnalytics(): RequestAnalytics {
    const requests = Array.from(this.requests.values());
    const now = new Date();

    // Calculate time metrics
    const completedRequests = requests.filter(r => r.status === 'completed' || r.status === 'released');
    const approvedRequests = requests.filter(r => r.status === 'approved' || r.status === 'in-progress' || r.status === 'completed' || r.status === 'released');

    const timeToCompletion = completedRequests.map(r => {
      const history = this.statusHistory.get(r.id) || [];
      const completedEntry = history.find(h => h.status === 'completed' || h.status === 'released');
      if (completedEntry) {
        return completedEntry.timestamp.getTime() - r.createdAt.getTime();
      }
      return 0;
    }).filter(t => t > 0);

    const timeToApproval = approvedRequests.map(r => {
      const history = this.statusHistory.get(r.id) || [];
      const approvedEntry = history.find(h => h.status === 'approved');
      if (approvedEntry) {
        return approvedEntry.timestamp.getTime() - r.createdAt.getTime();
      }
      return 0;
    }).filter(t => t > 0);

    // Calculate fulfillment rate (approved + completed + released / total)
    const fulfilled = requests.filter(r =>
      r.status === 'approved' || r.status === 'in-progress' || r.status === 'completed' || r.status === 'released'
    ).length;

    // Group by category
    const requestsByCategory: Record<string, number> = {};
    requests.forEach(r => {
      requestsByCategory[r.category] = (requestsByCategory[r.category] || 0) + 1;
    });

    // Top requesters
    const requesterCounts = new Map<string, number>();
    requests.forEach(r => {
      requesterCounts.set(r.requestedBy, (requesterCounts.get(r.requestedBy) || 0) + 1);
    });
    const topRequesters = Array.from(requesterCounts.entries())
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Requests over time (last 30 days)
    const requestsOverTime: Array<{ date: string; count: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = requests.filter(r => {
        const reqDate = r.createdAt.toISOString().split('T')[0];
        return reqDate === dateStr;
      }).length;
      requestsOverTime.push({ date: dateStr, count });
    }

    return {
      totalRequests: requests.length,
      requestsByStatus: {
        submitted: requests.filter(r => r.status === 'submitted').length,
        'under-review': requests.filter(r => r.status === 'under-review').length,
        approved: requests.filter(r => r.status === 'approved').length,
        'in-progress': requests.filter(r => r.status === 'in-progress').length,
        completed: requests.filter(r => r.status === 'completed').length,
        released: requests.filter(r => r.status === 'released').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
        'needs-more-info': requests.filter(r => r.status === 'needs-more-info').length,
      },
      requestsByPriority: {
        low: requests.filter(r => r.priority === 'low').length,
        medium: requests.filter(r => r.priority === 'medium').length,
        high: requests.filter(r => r.priority === 'high').length,
        critical: requests.filter(r => r.priority === 'critical').length,
      },
      averageTimeToCompletion: timeToCompletion.length > 0
        ? timeToCompletion.reduce((sum, t) => sum + t, 0) / timeToCompletion.length
        : 0,
      averageTimeToApproval: timeToApproval.length > 0
        ? timeToApproval.reduce((sum, t) => sum + t, 0) / timeToApproval.length
        : 0,
      fulfillmentRate: requests.length > 0 ? (fulfilled / requests.length) * 100 : 0,
      requestsByCategory,
      topRequesters,
      requestsOverTime,
    };
  }

  getStatusHistory(requestId: string): Array<{ status: string; timestamp: Date; userId: string; comment?: string }> {
    return this.statusHistory.get(requestId) || [];
  }

  /**
   * Create a roadmap item from an approved component request
   * Maps request category to roadmap category and priority
   */
  private createRoadmapItemFromRequest(request: ComponentRequest): void {
    try {
      // Check if roadmap item already exists for this request
      if (request.metadata?.roadmapItemId) {
        return; // Already created
      }

      // Map request category to roadmap category
      const categoryMap: Record<string, string> = {
        'form-controls': 'feature',
        'data-display': 'feature',
        'navigation': 'feature',
        'feedback': 'feature',
        'layout': 'feature',
        'utilities': 'feature',
      };

      const roadmapCategory = categoryMap[request.category] || 'feature';

      // Map request priority to roadmap priority
      const priorityMap: Record<string, string> = {
        'low': 'low',
        'medium': 'medium',
        'high': 'high',
        'critical': 'high', // Critical requests map to high priority in roadmap
      };

      const roadmapPriority = priorityMap[request.priority] || 'medium';

      // Create roadmap item
      const roadmapItem = this.designSystemService.createRoadmapItem({
        title: request.title,
        description: request.description || (request.useCase || ''),
        category: roadmapCategory,
        priority: roadmapPriority,
        status: 'planned', // Always start as planned when approved
        targetDate: request.metadata?.targetRelease,
      });

      // Store roadmap item ID in request metadata to track the relationship
      if (!request.metadata) {
        request.metadata = {};
      }
      request.metadata.roadmapItemId = roadmapItem.id;
      request.metadata.roadmapItemCreatedAt = new Date().toISOString();

      // Update the request in the map
      this.requests.set(request.id, request);
    } catch (error) {
      // Log error but don't fail the approval process
      console.error('Failed to create roadmap item from request:', error);
    }
  }
}

