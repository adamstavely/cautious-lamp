import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { AuthPrincipal, hasPermission } from '../auth/principal';
import { UsersService } from '../auth/users.service';
import { ComponentAccessService } from '../design-system/component-access.service';
import { DesignSystemService } from '../design-system/design-system.service';
import { NotificationService } from '../notifications/notification.service';
import { Permission } from '../rbac/rbac.service';
import { DocumentStore, VersionConflictError } from '../reviews/document-store';
import { QueryableStore } from '../workspaces/queryable-store';
import { CreateRequestDto, UpdateRequestDto } from './component-request.dto';
import {
  ApprovalStage,
  COMPONENT_REQUEST_COMMENT_STORE,
  COMPONENT_REQUEST_STORE,
  ComponentRequest,
  OPEN_REQUEST_STATUSES,
  RequestActor,
  RequestComment,
  RequestPriority,
  RequestStatus,
} from './component-request.types';

const MAX_WRITE_ATTEMPTS = 5;

/** Which statuses each status may move to */
const TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  submitted: ['under-review', 'rejected'],
  'under-review': ['approved', 'rejected', 'needs-more-info'],
  'needs-more-info': ['under-review', 'rejected'],
  approved: ['in-progress', 'rejected'],
  'in-progress': ['completed', 'rejected'],
  completed: ['released'],
  released: [],
  rejected: [],
};


export interface RequestFilters {
  status?: string;
  category?: string;
  priority?: string;
  assignedTo?: string;
  requestedBy?: string;
  componentId?: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  similar: Array<{ id: string; title: string; similarity: number; status: string }>;
}

export interface RequestAnalytics {
  totalRequests: number;
  requestsByStatus: Record<string, number>;
  requestsByPriority: Record<string, number>;
  averageTimeToCompletion: number;
  averageTimeToApproval: number;
  fulfillmentRate: number;
  requestsByCategory: Record<string, number>;
  topRequesters: Array<{ userId: string; name: string; count: number }>;
  requestsOverTime: Array<{ date: string; count: number }>;
}

/** The person behind a principal, for ownership and display */
export function actorOf(principal: AuthPrincipal): RequestActor {
  return { id: principal.id, name: principal.name || principal.email || principal.id };
}

/**
 * Component requests, their votes and comments, stored in Elasticsearch.
 * Authors come from the signed-in principal; the author may edit or withdraw
 * their own open request, and everything else (status, approvals, priority,
 * assignment, the linked component) changes only through the triage methods,
 * which the controller restricts to `roadmap:edit`.
 */
@Injectable()
export class ComponentRequestsService implements OnModuleInit {
  private readonly logger = new Logger(ComponentRequestsService.name);

  constructor(
    @Inject(COMPONENT_REQUEST_STORE) private readonly store: QueryableStore<ComponentRequest>,
    @Inject(COMPONENT_REQUEST_COMMENT_STORE) private readonly comments: DocumentStore<RequestComment>,
    private readonly designSystem: DesignSystemService,
    private readonly componentAccess: ComponentAccessService,
    private readonly notifications: NotificationService,
    private readonly users: UsersService,
  ) {}

  /** Links new components to the requests they fulfil. The only place the linker is registered. */
  onModuleInit(): void {
    this.designSystem.setComponentRequestLinker({
      authorize: (principal, requestId) => this.authorizeFulfilment(principal, requestId),
      componentCreated: (principal, componentId, componentName, linkedRequestId) => {
        this.onComponentCreated(principal, componentId, componentName, linkedRequestId).catch((error) => {
          this.logger.warn(`Linking component ${componentId} to a request failed: ${(error as Error)?.message}`);
        });
      },
    });
  }

  // ---------- Reads ----------

  /** Requests matching every filter, newest first */
  async list(filters: RequestFilters = {}): Promise<ComponentRequest[]> {
    const where = Object.fromEntries(Object.entries(filters).filter(([, value]) => typeof value === 'string' && value !== ''));
    return this.store.list({ where } as { where: Record<string, string> });
  }

  async get(id: string): Promise<ComponentRequest> {
    const stored = await this.store.get(id);
    if (!stored) throw new NotFoundException(`Request '${id}' not found`);
    return stored.doc;
  }

  /** The request with its comments, oldest comment first */
  async getWithComments(id: string): Promise<ComponentRequest & { comments: RequestComment[] }> {
    const request = await this.get(id);
    return { ...request, comments: await this.listComments(id) };
  }

  // ---------- The author's own request ----------

  async create(principal: AuthPrincipal, dto: CreateRequestDto): Promise<ComponentRequest> {
    const actor = actorOf(principal);
    const now = new Date().toISOString();
    const request: ComponentRequest = {
      id: `req_${randomBytes(12).toString('hex')}`,
      title: dto.title,
      description: dto.description,
      ...(dto.useCase ? { useCase: dto.useCase } : {}),
      category: dto.category,
      priority: dto.priority ?? 'medium',
      status: 'submitted',
      requestedBy: actor.id,
      requestedByName: actor.name,
      voters: [],
      votes: 0,
      commentCount: 0,
      metadata: { designReview: false, technicalReview: false, designApproved: false, technicalApproved: false },
      statusHistory: [{ status: 'submitted', timestamp: now, userId: actor.id }],
      createdAt: now,
      updatedAt: now,
    };
    await this.store.create(request);
    return request;
  }

  /** The author edits the title, description or use case while the request is open */
  async update(principal: AuthPrincipal, id: string, dto: UpdateRequestDto): Promise<ComponentRequest> {
    return this.mutate(id, (request) => {
      if (request.requestedBy !== principal.id) throw new ForbiddenException('Only the author can edit this request');
      if (!OPEN_REQUEST_STATUSES.includes(request.status)) {
        throw new ForbiddenException(`A ${request.status} request can no longer be edited`);
      }
      if (dto.title !== undefined) request.title = dto.title;
      if (dto.description !== undefined) request.description = dto.description;
      if (dto.useCase !== undefined) {
        if (dto.useCase) request.useCase = dto.useCase;
        else delete request.useCase;
      }
    });
  }

  /** The author while the request is open, or a roadmap editor at any time. Its comments go too. */
  async delete(principal: AuthPrincipal, id: string): Promise<void> {
    const request = await this.get(id);
    const isAuthor = request.requestedBy === principal.id && OPEN_REQUEST_STATUSES.includes(request.status);
    if (!isAuthor && !hasPermission(principal, Permission.ROADMAP_EDIT)) {
      throw new ForbiddenException('Only the author (while the request is open) or a roadmap editor can delete this request');
    }
    await this.store.delete(id);
    const comments = await this.comments.list({ where: { requestId: id } });
    await Promise.all(comments.map((comment) => this.comments.delete(comment.id)));
  }

  /** Adds the caller's vote, or takes it back if they already voted */
  async vote(principal: AuthPrincipal, id: string): Promise<ComponentRequest> {
    return this.mutate(id, (request) => {
      request.voters = request.voters.includes(principal.id)
        ? request.voters.filter((voter) => voter !== principal.id)
        : [...request.voters, principal.id];
      request.votes = request.voters.length;
    }, { touch: false });
  }

  // ---------- Comments ----------

  async addComment(principal: AuthPrincipal, requestId: string, content: string): Promise<RequestComment> {
    await this.get(requestId);
    const actor = actorOf(principal);
    const comment: RequestComment = {
      id: `cmt_${randomBytes(12).toString('hex')}`,
      requestId,
      author: actor.id,
      authorName: actor.name,
      content,
      createdAt: new Date().toISOString(),
    };
    await this.comments.create(comment);
    const request = await this.mutate(requestId, (doc) => {
      doc.commentCount = (doc.commentCount ?? 0) + 1;
    });
    this.notifications.notifyCommentAdded(request, actor);
    return comment;
  }

  async listComments(requestId: string): Promise<RequestComment[]> {
    return (await this.comments.list({ where: { requestId } })).reverse();
  }

  // ---------- Triage (roadmap:edit) ----------

  async transitionStatus(principal: AuthPrincipal, id: string, status: RequestStatus, comment?: string): Promise<ComponentRequest> {
    return this.changeStatus(id, actorOf(principal), (request) => this.applyTransition(request, status, principal.id, comment));
  }

  /**
   * Records one approval stage. Design and technical approvals start the
   * review of a submitted request; the final approval needs both and approves it.
   */
  async approve(principal: AuthPrincipal, id: string, requested?: ApprovalStage): Promise<ComponentRequest> {
    return this.changeStatus(id, actorOf(principal), (request) => {
      if (!OPEN_REQUEST_STATUSES.includes(request.status)) {
        throw new BadRequestException(`A ${request.status} request can't be approved`);
      }
      const meta = request.metadata;
      const stage = requested ?? (!meta.designApproved ? 'design' : !meta.technicalApproved ? 'technical' : 'final');
      if (stage === 'design') {
        meta.designApproved = true;
        meta.designReview = true;
      } else if (stage === 'technical') {
        meta.technicalApproved = true;
        meta.technicalReview = true;
      } else {
        if (!meta.designApproved || !meta.technicalApproved) {
          throw new BadRequestException('Final approval needs the design and technical approvals first');
        }
        if (request.status !== 'under-review') {
          throw new BadRequestException('Final approval needs the request to be under review');
        }
        this.applyTransition(request, 'approved', principal.id, 'All approval stages completed');
        return;
      }
      if (request.status === 'submitted') {
        this.applyTransition(request, 'under-review', principal.id, `${stage} review started`);
      }
    });
  }

  async reject(principal: AuthPrincipal, id: string, reason: string): Promise<ComponentRequest> {
    return this.changeStatus(id, actorOf(principal), (request) => {
      this.applyTransition(request, 'rejected', principal.id, reason);
      request.metadata.designApproved = false;
      request.metadata.technicalApproved = false;
      request.metadata.rejectionReason = reason;
    });
  }

  async setPriority(id: string, priority: RequestPriority): Promise<ComponentRequest> {
    return this.mutate(id, (request) => {
      request.priority = priority;
    });
  }

  /** Assigns the request to an existing user, who is told about it */
  async assign(principal: AuthPrincipal, id: string, userId: string): Promise<ComponentRequest> {
    const [assignee] = await this.users.summaries([userId]);
    if (!assignee) throw new BadRequestException(`User '${userId}' not found`);
    const request = await this.mutate(id, (doc) => {
      doc.assignedTo = assignee.id;
      doc.assignedToName = assignee.name || assignee.email;
    });
    if (assignee.id !== principal.id) this.notifications.notifyRequestAssigned(request, assignee.id);
    return request;
  }

  async unassign(id: string): Promise<ComponentRequest> {
    return this.mutate(id, (request) => {
      delete request.assignedTo;
      delete request.assignedToName;
    });
  }

  /** Links an approved or in-progress request to the component built for it and starts the work */
  async promote(principal: AuthPrincipal, id: string, componentId: string): Promise<ComponentRequest> {
    await this.componentAccess.get(principal, componentId);
    return this.changeStatus(id, actorOf(principal), (request) => {
      if (request.status !== 'approved' && request.status !== 'in-progress') {
        throw new BadRequestException(`A ${request.status} request can't be promoted; approve it first`);
      }
      request.componentId = componentId;
      if (request.status === 'approved') {
        this.applyTransition(request, 'in-progress', principal.id, `Component created: ${componentId}`);
      }
    });
  }

  /** Links the request to a component; an in-progress request is then complete */
  async link(principal: AuthPrincipal, id: string, componentId: string): Promise<ComponentRequest> {
    await this.componentAccess.get(principal, componentId);
    return this.changeStatus(id, actorOf(principal), (request) => {
      request.componentId = componentId;
      if (request.status === 'in-progress') this.applyTransition(request, 'completed', principal.id, `Linked to ${componentId}`);
    });
  }

  async unlink(id: string): Promise<ComponentRequest> {
    return this.mutate(id, (request) => {
      delete request.componentId;
    });
  }

  // ---------- Automatic linking ----------

  /**
   * Whether creating a component may fulfil this request on the principal's
   * behalf: triagers (`roadmap:edit`) may fulfil any approved or in-progress
   * request, anyone else only one assigned to them.
   */
  private mayFulfil(principal: AuthPrincipal, request: ComponentRequest): boolean {
    if (request.status !== 'approved' && request.status !== 'in-progress') return false;
    return hasPermission(principal, Permission.ROADMAP_EDIT) || request.assignedTo === principal.id;
  }

  /** Throws unless the principal may fulfil the request by creating a component for it */
  async authorizeFulfilment(principal: AuthPrincipal, requestId: string): Promise<void> {
    const request = (await this.store.get(requestId))?.doc;
    if (!request) throw new NotFoundException(`Component request ${requestId} not found`);
    if (request.status !== 'approved' && request.status !== 'in-progress') {
      throw new BadRequestException(`A ${request.status} request can't be fulfilled; approve it first`);
    }
    if (!this.mayFulfil(principal, request)) {
      throw new ForbiddenException('Only a triager or the assignee can fulfil this request');
    }
  }

  /**
   * Called when a component is created: links it to the request it names, or
   * else to the best-matching unlinked request the creator may fulfil. An
   * approved request moves to in-progress, an in-progress one to completed.
   * The creator is recorded as the actor, and authority is checked again
   * against the stored request.
   */
  async onComponentCreated(principal: AuthPrincipal, componentId: string, componentName: string, linkedRequestId?: string): Promise<void> {
    let target: ComponentRequest | undefined;
    if (linkedRequestId) {
      target = (await this.store.get(linkedRequestId))?.doc;
    } else {
      const open = await this.store.findAny([{ status: 'approved' }, { status: 'in-progress' }]);
      target = this.bestMatch(componentName, open.filter((request) => this.mayFulfil(principal, request)));
    }
    if (!target) return;

    const actor = actorOf(principal);
    await this.changeStatus(target.id, actor, (request) => {
      if (!this.mayFulfil(principal, request)) {
        throw new ForbiddenException(`${actor.name} can no longer fulfil request ${request.id}`);
      }
      request.componentId = componentId;
      if (request.status === 'approved') {
        this.applyTransition(request, 'in-progress', principal.id, `Component created: ${componentId}`);
      } else {
        this.applyTransition(request, 'completed', principal.id, `Component created: ${componentId}`);
      }
    });
  }

  private bestMatch(componentName: string, candidates: ComponentRequest[]): ComponentRequest | undefined {
    const name = componentName.toLowerCase();
    const words = (text: string) => text.split(/[\s-]+/).filter((word) => word.length > 2);
    const nameWords = words(name);
    const priorityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    return candidates
      .filter((request) => !request.componentId)
      .filter((request) => {
        const title = request.title.toLowerCase();
        if (title.includes(name) || name.includes(title)) return true;
        const titleWords = words(title);
        const shared = nameWords.filter((word) => titleWords.some((other) => other.includes(word) || word.includes(other)));
        return shared.length >= 2 || request.description.toLowerCase().includes(name);
      })
      .sort((a, b) => (priorityOrder[b.priority] ?? 0) - (priorityOrder[a.priority] ?? 0) || b.createdAt.localeCompare(a.createdAt))[0];
  }

  // ---------- Duplicates and analytics ----------

  async checkForDuplicates(title: string, description?: string): Promise<DuplicateCheckResult> {
    const titleLower = title.toLowerCase();
    const descriptionLower = description?.toLowerCase() ?? '';
    const similar = (await this.store.list())
      .map((request) => {
        const titleScore = similarity(titleLower, request.title.toLowerCase());
        const descriptionScore = description ? similarity(descriptionLower, request.description.toLowerCase()) : 0;
        // Title counts more than description
        const overall = titleScore * 0.7 + descriptionScore * 0.3;
        return { id: request.id, title: request.title, similarity: Math.round(overall * 100), status: request.status };
      })
      .filter((match) => match.similarity >= 70)
      .sort((a, b) => b.similarity - a.similarity);
    return { isDuplicate: similar.length > 0 && similar[0].similarity >= 90, similar };
  }

  async getAnalytics(now = new Date()): Promise<RequestAnalytics> {
    const requests = await this.store.list();
    const count = (pick: (request: ComponentRequest) => boolean) => requests.filter(pick).length;
    const timeTo = (statuses: RequestStatus[]) =>
      requests
        .map((request) => {
          const reached = request.statusHistory.find((change) => statuses.includes(change.status));
          return reached ? Date.parse(reached.timestamp) - Date.parse(request.createdAt) : 0;
        })
        .filter((ms) => ms > 0);
    const average = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);
    const fulfilled: RequestStatus[] = ['approved', 'in-progress', 'completed', 'released'];

    const requestsByCategory: Record<string, number> = {};
    const requesters = new Map<string, { name: string; count: number }>();
    for (const request of requests) {
      requestsByCategory[request.category] = (requestsByCategory[request.category] ?? 0) + 1;
      const entry = requesters.get(request.requestedBy) ?? { name: request.requestedByName, count: 0 };
      entry.count++;
      requesters.set(request.requestedBy, entry);
    }

    const requestsOverTime: Array<{ date: string; count: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      const date = day.toISOString().split('T')[0];
      requestsOverTime.push({ date, count: count((request) => request.createdAt.startsWith(date)) });
    }

    return {
      totalRequests: requests.length,
      requestsByStatus: Object.fromEntries(Object.keys(TRANSITIONS).map((status) => [status, count((r) => r.status === status)])),
      requestsByPriority: Object.fromEntries(['low', 'medium', 'high', 'critical'].map((p) => [p, count((r) => r.priority === p)])),
      averageTimeToCompletion: average(timeTo(['completed', 'released'])),
      averageTimeToApproval: average(timeTo(['approved'])),
      fulfillmentRate: requests.length ? (count((r) => fulfilled.includes(r.status)) / requests.length) * 100 : 0,
      requestsByCategory,
      topRequesters: [...requesters.entries()]
        .map(([userId, { name, count: total }]) => ({ userId, name, count: total }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      requestsOverTime,
    };
  }

  // ---------- Internals ----------

  /** Validates and records a status change on the document; the caller saves it */
  private applyTransition(request: ComponentRequest, status: RequestStatus, userId: string, comment?: string): void {
    const allowed = TRANSITIONS[request.status] ?? [];
    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Invalid status transition from ${request.status} to ${status}. Allowed transitions: ${allowed.join(', ') || 'none'}`,
      );
    }
    request.status = status;
    request.statusHistory.push({ status, timestamp: new Date().toISOString(), userId, ...(comment ? { comment } : {}) });
  }

  /**
   * Saves a change that may move the status, then tells the author and voters
   * and, on approval, puts the request on the roadmap.
   */
  private async changeStatus(id: string, actor: RequestActor, fn: (request: ComponentRequest) => void): Promise<ComponentRequest> {
    let before: RequestStatus | undefined;
    let request = await this.mutate(id, (doc) => {
      before = doc.status;
      fn(doc);
    });
    if (before !== request.status) {
      this.notifications.notifyRequestStatusChange(request, request.status);
      this.notifications.notifyRequestUpdated(request, actor);
      if (request.status === 'approved' && !request.metadata.roadmapItemId) request = await this.addToRoadmap(request);
    }
    return request;
  }

  /** Creates the roadmap item for an approved request. A failure is logged; the approval stands. */
  private async addToRoadmap(request: ComponentRequest): Promise<ComponentRequest> {
    try {
      const item = await this.designSystem.createRoadmapItem({
        title: request.title,
        description: request.description || request.useCase || '',
        category: 'feature',
        // Critical requests map to high priority on the roadmap
        priority: request.priority === 'critical' ? 'high' : request.priority,
        status: 'planned',
      });
      return await this.mutate(request.id, (doc) => {
        doc.metadata.roadmapItemId = item.id;
        doc.metadata.roadmapItemCreatedAt = new Date().toISOString();
      }, { touch: false });
    } catch (error) {
      this.logger.error(`Roadmap item for request ${request.id} not created: ${(error as Error)?.message}`);
      return request;
    }
  }

  /** Read, change and compare-and-swap write, retrying when someone else wrote in between */
  private async mutate(
    id: string,
    fn: (request: ComponentRequest) => void,
    { touch = true }: { touch?: boolean } = {},
  ): Promise<ComponentRequest> {
    for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
      const stored = await this.store.get(id);
      if (!stored) throw new NotFoundException(`Request '${id}' not found`);
      const request = stored.doc;
      fn(request);
      if (touch) request.updatedAt = new Date().toISOString();
      try {
        await this.store.replace(request, stored.version);
        return request;
      } catch (error) {
        if (!(error instanceof VersionConflictError)) throw error;
      }
    }
    throw new ConflictException('Request is being changed, please try again');
  }
}

/** Levenshtein similarity between 0 and 1 */
function similarity(a: string, b: string): number {
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1;
  let previous = Array.from({ length: shorter.length + 1 }, (_, i) => i);
  for (let i = 1; i <= longer.length; i++) {
    const current = [i];
    for (let j = 1; j <= shorter.length; j++) {
      current[j] = longer[i - 1] === shorter[j - 1] ? previous[j - 1] : Math.min(previous[j - 1], current[j - 1], previous[j]) + 1;
    }
    previous = current;
  }
  return (longer.length - previous[shorter.length]) / longer.length;
}
