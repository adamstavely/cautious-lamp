import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { apiClient } from '../api-client';

/*
 * Design reviews, per docs/REVIEW_API.md. The routes live under `/api/v1`
 * (the API client's base URL): `/reviews`, `/review/...`. Review passwords go
 * in the `x-review-password` header, never in the URL.
 */

export const WORKFLOW_STATES = [
  'draft',
  'client_review',
  'client_approved',
  'art_director_review',
  'art_director_approved',
  'creative_director_review',
  'approved',
] as const;

export type WorkflowState = (typeof WORKFLOW_STATES)[number];

const workflowStateSchema = z.enum(WORKFLOW_STATES);
const SHARING_MODES = ['anyone', 'approved_emails'] as const;
const sharingModeSchema = z.enum(SHARING_MODES);
type SharingMode = (typeof SHARING_MODES)[number];

export interface ReviewVersion {
  id: string;
  label?: string;
  url?: string;
  notes?: string;
  type?: string;
  filename?: string;
  contentType?: string | null;
  size?: number | null;
  uploadedAt?: string;
  uploadedBy?: string;
}

/** `{ [emoji]: [email] }` */
export type Reactions = Record<string, string[]>;

export interface ReviewReply {
  id: string;
  text: string;
  author?: string;
  authorEmail?: string | null;
  timestamp?: string;
  reactions?: Reactions;
}

export interface ReviewComment {
  id: string;
  text: string;
  author?: string;
  authorEmail?: string | null;
  version?: string | null;
  type?: string;
  resolved?: boolean;
  annotationId?: string;
  annotationData?: Record<string, unknown>;
  timestamp?: string;
  replies?: ReviewReply[];
  reactions?: Reactions;
}

export interface Review {
  id: string;
  filename?: string;
  sourceType?: 'upload' | 'url';
  url?: string;
  designer?: string;
  designerEmail?: string;
  teamId?: string | null;
  workflowState?: WorkflowState;
  workflowHistory?: Array<{
    stage: string;
    action: string;
    user?: string;
    timestamp?: string;
    reason?: string;
    versionLabel?: string;
  }>;
  bypassClientReview?: boolean;
  sharingMode?: SharingMode;
  approvedEmails?: string[];
  versions?: ReviewVersion[];
  comments?: ReviewComment[];
  completed?: boolean;
  expiresAt?: string;
  extended?: boolean;
  hasPassword?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** `GET /reviews` returns `{ reviews, total }`, review summaries without comments or history */
async function listReviews(filters: { workflowState?: WorkflowState; q?: string; showExpired?: boolean }): Promise<Review[]> {
  const params: Record<string, string> = {};
  if (filters.workflowState) params.workflowState = filters.workflowState;
  if (filters.q) params.q = filters.q;
  if (filters.showExpired) params.showExpired = 'true';
  const data = await apiClient.get<{ reviews?: Review[] }>('/reviews', params, 'reviews');
  return Array.isArray(data?.reviews) ? data.reviews : [];
}

function reviewPath(reviewId: string, suffix: string = ''): string {
  return `/review/${encodeURIComponent(reviewId)}${suffix}`;
}

/** The review password header, when there is one */
function passwordHeaders(password?: string): Record<string, string> | undefined {
  return password ? { 'x-review-password': encodeURIComponent(password) } : undefined;
}

export const getReviewsSchema = z.object({
  workflowState: workflowStateSchema.optional(),
  showExpired: z.boolean().optional(),
});

export const getReviewsTool: Tool = {
  name: 'get_reviews',
  description: 'List design reviews with an optional workflow state filter',
  inputSchema: {
    type: 'object',
    properties: {
      workflowState: {
        type: 'string',
        enum: [...WORKFLOW_STATES],
        description: 'Filter reviews by workflow state',
      },
      showExpired: {
        type: 'boolean',
        description: 'Include expired reviews',
        default: false,
      },
    },
  },
};

export async function getReviews(args: { workflowState?: WorkflowState; showExpired?: boolean }): Promise<Review[]> {
  return listReviews({ workflowState: args.workflowState, showExpired: args.showExpired });
}

export const getReviewSchema = z.object({
  reviewId: z.string().min(1),
  password: z.string().optional(),
});

export const getReviewTool: Tool = {
  name: 'get_review',
  description: 'Get a specific design review by ID, including versions, comments and workflow history',
  inputSchema: {
    type: 'object',
    properties: {
      reviewId: {
        type: 'string',
        description: 'The review ID',
      },
      password: {
        type: 'string',
        description: 'Password, if the review is password protected',
      },
    },
    required: ['reviewId'],
  },
};

export async function getReview(args: { reviewId: string; password?: string }): Promise<Review> {
  // Not cached: the response depends on the password and changes as people comment
  return await apiClient.get<Review>(reviewPath(args.reviewId), {}, undefined, passwordHeaders(args.password));
}

export const createReviewSchema = z.object({
  url: z
    .string()
    .url()
    .refine((value) => /^https?:\/\//i.test(value), { message: 'url must be http(s)' }),
  password: z.string().optional(),
  bypassClientReview: z.boolean().optional(),
  sharingMode: sharingModeSchema.optional(),
  approvedEmails: z.array(z.string()).optional(),
});

export const createReviewTool: Tool = {
  name: 'create_review',
  description: 'Create a new design review from a URL to the design being reviewed',
  inputSchema: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'URL to the design or resource being reviewed',
      },
      password: {
        type: 'string',
        description: 'Optional password to protect the review',
      },
      bypassClientReview: {
        type: 'boolean',
        description: 'Skip client review and go straight to art director review',
        default: false,
      },
      sharingMode: {
        type: 'string',
        enum: [...SHARING_MODES],
        description: 'Who can open the review link',
        default: 'anyone',
      },
      approvedEmails: {
        type: 'array',
        items: { type: 'string' },
        description: 'Emails allowed to open the review when sharingMode is approved_emails',
      },
    },
    required: ['url'],
  },
};

export async function createReview(args: {
  url: string;
  password?: string;
  bypassClientReview?: boolean;
  sharingMode?: SharingMode;
  approvedEmails?: string[];
}): Promise<{ reviewId: string; review?: Review }> {
  return await apiClient.post<{ reviewId: string; review?: Review }>('/review/create-from-url', {
    url: args.url,
    password: args.password,
    bypassClientReview: args.bypassClientReview ?? false,
    sharingMode: args.sharingMode ?? 'anyone',
    approvedEmails: args.approvedEmails ?? [],
  }, 'reviews');
}

export const REVIEW_ACTIONS = [
  'approve',
  'reject',
  'move_to_client_review',
  'move_to_art_director_review',
  'resubmit',
  'complete',
  'update_sharing',
] as const;

export type ReviewAction = (typeof REVIEW_ACTIONS)[number];

export const updateReviewSchema = z
  .object({
    reviewId: z.string().min(1),
    action: z.enum(REVIEW_ACTIONS),
    stage: workflowStateSchema.optional(),
    reason: z.string().optional(),
    targetStage: workflowStateSchema.optional(),
    sharingMode: sharingModeSchema.optional(),
    approvedEmails: z.array(z.string()).optional(),
  })
  .superRefine((args, ctx) => {
    if ((args.action === 'approve' || args.action === 'reject') && !args.stage) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['stage'], message: `stage is required for ${args.action}` });
    }
    if (args.action === 'resubmit' && !args.targetStage) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['targetStage'], message: 'targetStage is required for resubmit' });
    }
    if (args.action === 'update_sharing' && !args.sharingMode) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['sharingMode'], message: 'sharingMode is required for update_sharing' });
    }
  });

export const updateReviewTool: Tool = {
  name: 'update_review',
  description:
    'Advance or change a design review: approve/reject a workflow stage, move it to client or art director review, resubmit, mark complete, or update sharing',
  inputSchema: {
    type: 'object',
    properties: {
      reviewId: {
        type: 'string',
        description: 'The review ID',
      },
      action: {
        type: 'string',
        enum: [...REVIEW_ACTIONS],
        description: 'What to do to the review',
      },
      stage: {
        type: 'string',
        enum: [...WORKFLOW_STATES],
        description: 'Workflow stage being approved or rejected (required for approve and reject)',
      },
      reason: {
        type: 'string',
        description: 'Reason for rejecting (reject only)',
      },
      targetStage: {
        type: 'string',
        enum: [...WORKFLOW_STATES],
        description: 'Stage to resubmit to (required for resubmit)',
      },
      sharingMode: {
        type: 'string',
        enum: [...SHARING_MODES],
        description: 'New sharing mode (required for update_sharing)',
      },
      approvedEmails: {
        type: 'array',
        items: { type: 'string' },
        description: 'Emails allowed when sharingMode is approved_emails (update_sharing only)',
      },
    },
    required: ['reviewId', 'action'],
  },
};

export async function updateReview(args: {
  reviewId: string;
  action: ReviewAction;
  stage?: WorkflowState;
  reason?: string;
  targetStage?: WorkflowState;
  sharingMode?: SharingMode;
  approvedEmails?: string[];
}): Promise<Review> {
  switch (args.action) {
    case 'approve':
      return await apiClient.post<Review>(reviewPath(args.reviewId, '/workflow/approve'), { stage: args.stage }, 'reviews');
    case 'reject':
      return await apiClient.post<Review>(
        reviewPath(args.reviewId, '/workflow/reject'),
        args.reason !== undefined ? { stage: args.stage, reason: args.reason } : { stage: args.stage },
        'reviews'
      );
    case 'move_to_client_review':
      return await apiClient.post<Review>(reviewPath(args.reviewId, '/workflow/move-to-client-review'), undefined, 'reviews');
    case 'move_to_art_director_review':
      return await apiClient.post<Review>(reviewPath(args.reviewId, '/workflow/move-to-art-director-review'), undefined, 'reviews');
    case 'resubmit':
      return await apiClient.post<Review>(
        reviewPath(args.reviewId, '/workflow/resubmit'),
        { targetStage: args.targetStage },
        'reviews'
      );
    case 'complete':
      return await apiClient.post<Review>(reviewPath(args.reviewId, '/complete'), undefined, 'reviews');
    case 'update_sharing':
      return await apiClient.post<Review>(
        reviewPath(args.reviewId, '/sharing'),
        { sharingMode: args.sharingMode, approvedEmails: args.approvedEmails ?? [] },
        'reviews'
      );
    default:
      throw new Error(`Unsupported review action: ${String(args.action)}`);
  }
}

export const searchReviewsSchema = z.object({
  query: z.string(),
  workflowState: workflowStateSchema.optional(),
  showExpired: z.boolean().optional(),
});

export const searchReviewsTool: Tool = {
  name: 'search_reviews',
  description: 'Search design reviews by filename, designer or designer email',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query',
      },
      workflowState: {
        type: 'string',
        enum: [...WORKFLOW_STATES],
        description: 'Optional workflow state filter',
      },
      showExpired: {
        type: 'boolean',
        description: 'Include expired reviews',
        default: false,
      },
    },
    required: ['query'],
  },
};

export async function searchReviews(args: {
  query: string;
  workflowState?: WorkflowState;
  showExpired?: boolean;
}): Promise<Review[]> {
  // The server matches `q` against filename, designer and designer email
  return listReviews({ q: args.query, workflowState: args.workflowState, showExpired: args.showExpired });
}

export const getReviewCommentsSchema = z.object({
  reviewId: z.string().min(1),
  versionId: z.string().optional(),
  password: z.string().optional(),
});

export const getReviewCommentsTool: Tool = {
  name: 'get_review_comments',
  description: 'Get the comments on a design review, optionally for one version',
  inputSchema: {
    type: 'object',
    properties: {
      reviewId: {
        type: 'string',
        description: 'The review ID',
      },
      versionId: {
        type: 'string',
        description: 'Only return comments on this version',
      },
      password: {
        type: 'string',
        description: 'Password, if the review is password protected',
      },
    },
    required: ['reviewId'],
  },
};

export async function getReviewComments(args: {
  reviewId: string;
  versionId?: string;
  password?: string;
}): Promise<ReviewComment[]> {
  const params = args.versionId ? { versionId: args.versionId } : {};
  return await apiClient.get<ReviewComment[]>(
    reviewPath(args.reviewId, '/comments'),
    params,
    undefined,
    passwordHeaders(args.password)
  );
}

export const addReviewCommentSchema = z.object({
  reviewId: z.string().min(1),
  text: z.string().min(1),
  version: z.string().optional(),
  type: z.string().optional(),
  resolved: z.boolean().optional(),
});

export const addReviewCommentTool: Tool = {
  name: 'add_review_comment',
  description: 'Add a comment to a design review',
  inputSchema: {
    type: 'object',
    properties: {
      reviewId: {
        type: 'string',
        description: 'The review ID',
      },
      text: {
        type: 'string',
        description: 'Comment text',
      },
      version: {
        type: 'string',
        description: 'Version ID the comment applies to (defaults to the latest version)',
      },
      type: {
        type: 'string',
        description: 'Comment type (defaults to general)',
      },
      resolved: {
        type: 'boolean',
        description: 'Whether the comment starts resolved',
        default: false,
      },
    },
    required: ['reviewId', 'text'],
  },
};

export async function addReviewComment(args: {
  reviewId: string;
  text: string;
  version?: string;
  type?: string;
  resolved?: boolean;
}): Promise<ReviewComment> {
  const body: Record<string, unknown> = { text: args.text, resolved: args.resolved ?? false };
  if (args.version !== undefined) body.version = args.version;
  if (args.type !== undefined) body.type = args.type;
  return await apiClient.post<ReviewComment>(reviewPath(args.reviewId, '/comments'), body);
}
