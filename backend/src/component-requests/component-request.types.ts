/** Elasticsearch indices, injection tokens and documents for component requests */

export const COMPONENT_REQUESTS_INDEX = 'design-system-component-requests';
export const COMPONENT_REQUEST_COMMENTS_INDEX = 'design-system-component-request-comments';

export const COMPONENT_REQUEST_STORE = Symbol('COMPONENT_REQUEST_STORE');
export const COMPONENT_REQUEST_COMMENT_STORE = Symbol('COMPONENT_REQUEST_COMMENT_STORE');

export const REQUEST_STATUSES = [
  'submitted',
  'under-review',
  'approved',
  'rejected',
  'needs-more-info',
  'in-progress',
  'completed',
  'released',
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

/** Statuses in which the author may still edit or withdraw their request */
export const OPEN_REQUEST_STATUSES: readonly RequestStatus[] = ['submitted', 'under-review', 'needs-more-info'];

export const REQUEST_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
export type RequestPriority = (typeof REQUEST_PRIORITIES)[number];

export const APPROVAL_STAGES = ['design', 'technical', 'final'] as const;
export type ApprovalStage = (typeof APPROVAL_STAGES)[number];

/** Who did something: ids for ownership and notifications, the name for display */
export interface RequestActor {
  id: string;
  name: string;
}

export interface StatusChange {
  status: RequestStatus;
  timestamp: string;
  /** The person who made the change, or `system` for automatic transitions */
  userId: string;
  comment?: string;
}

/** A component request as stored in `design-system-component-requests` */
export interface ComponentRequest {
  id: string;
  title: string;
  description: string;
  useCase?: string;
  category: string;
  priority: RequestPriority;
  status: RequestStatus;
  /** The signed-in person who submitted it; never taken from a request body */
  requestedBy: string;
  requestedByName: string;
  /** One entry per person; voting again takes the vote back */
  voters: string[];
  votes: number;
  assignedTo?: string;
  assignedToName?: string;
  /** The component that fulfils the request */
  componentId?: string;
  commentCount: number;
  metadata: {
    designReview: boolean;
    technicalReview: boolean;
    designApproved: boolean;
    technicalApproved: boolean;
    roadmapItemId?: string;
    roadmapItemCreatedAt?: string;
    rejectionReason?: string;
  };
  statusHistory: StatusChange[];
  createdAt: string;
  updatedAt: string;
}

/** A comment as stored in `design-system-component-request-comments` */
export interface RequestComment {
  id: string;
  requestId: string;
  /** The signed-in person who wrote it; never taken from a request body */
  author: string;
  authorName: string;
  content: string;
  createdAt: string;
}

const keyword = { type: 'keyword' };
const date = { type: 'date' };

export const COMPONENT_REQUEST_PROPERTIES = {
  id: keyword,
  title: { type: 'keyword', fields: { text: { type: 'text' } } },
  category: keyword,
  priority: keyword,
  status: keyword,
  requestedBy: keyword,
  voters: keyword,
  assignedTo: keyword,
  componentId: keyword,
  createdAt: date,
  updatedAt: date,
};

export const REQUEST_COMMENT_PROPERTIES = {
  id: keyword,
  requestId: keyword,
  author: keyword,
  createdAt: date,
};
