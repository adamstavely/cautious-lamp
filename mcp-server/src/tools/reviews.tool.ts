import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { apiClient } from '../api-client';
import { rootPath } from '../api-root';

/*
 * Design reviews use the same endpoints as the frontend client
 * (`frontend/src/services/api.js`: reviewAPI, workflowAPI, uploadAPI,
 * commentAPI, adminAPI). Those routes are mounted at the server root
 * (`/review/...`, `/admin/reviews`), not under the `/api/v1` prefix.
 */

export const WORKFLOW_STATES = [
  'draft',
  'client_review',
  'client_approved',
  'art_director_review',
  'art_director_approved',
  'ad_changes_requested',
  'creative_director_review',
  'cd_changes_requested',
  'approved',
  'rejected',
] as const;

export type WorkflowState = (typeof WORKFLOW_STATES)[number];

const workflowStateSchema = z.enum(WORKFLOW_STATES);
const sharingModeSchema = z.enum(['anyone', 'restricted']);

export interface ReviewVersion {
  id: string;
  label?: string;
  url?: string;
  notes?: string;
  type?: string;
}

export interface ReviewComment {
  id: string;
  text: string;
  version?: string;
  type?: string;
  resolved?: boolean;
  timestamp?: string;
  replies?: any[];
  reactions?: any[];
}

export interface Review {
  id: string;
  filename?: string;
  title?: string;
  description?: string;
  designer?: string;
  designerEmail?: string;
  teamId?: string | null;
  workflowState?: WorkflowState;
  workflowHistory?: Array<{ stage: string; action: string; user?: string; timestamp?: string; reason?: string }>;
  sharingMode?: 'anyone' | 'restricted';
  approvedEmails?: string[];
  versions?: ReviewVersion[];
  comments?: ReviewComment[];
  completed?: boolean;
  expiresAt?: string;
  extended?: boolean;
  hasPassword?: boolean;
  createdAt?: string;
}

/**
 * `GET /admin/reviews` returns a list of review summaries. Accept either a bare
 * array or a `{ reviews: [...] }` envelope.
 */
function toReviewList(data: Review[] | { reviews?: Review[] }): Review[] {
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.reviews) ? data.reviews : [];
}

async function listReviews(showExpired?: boolean): Promise<Review[]> {
  const params = showExpired ? { showExpired: 'true' } : {};
  const data = await apiClient.get<Review[] | { reviews?: Review[] }>(rootPath('/admin/reviews'), params, 'reviews');
  return toReviewList(data);
}

function reviewPath(reviewId: string, suffix: string = ''): string {
  return rootPath(`/review/${encodeURIComponent(reviewId)}${suffix}`);
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
  const reviews = await listReviews(args.showExpired);
  if (!args.workflowState) return reviews;
  return reviews.filter((review) => (review.workflowState || 'draft') === args.workflowState);
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
  const params = args.password ? { password: args.password } : {};
  // Not cached: the response depends on the password and changes as people comment
  return await apiClient.get<Review>(reviewPath(args.reviewId), params);
}

export const createReviewSchema = z.object({
  url: z.string().url(),
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
        enum: ['anyone', 'restricted'],
        description: 'Who can open the review link',
        default: 'anyone',
      },
      approvedEmails: {
        type: 'array',
        items: { type: 'string' },
        description: 'Emails allowed to open the review when sharingMode is restricted',
      },
    },
    required: ['url'],
  },
};

export async function createReview(args: {
  url: string;
  password?: string;
  bypassClientReview?: boolean;
  sharingMode?: 'anyone' | 'restricted';
  approvedEmails?: string[];
}): Promise<{ reviewId: string }> {
  return await apiClient.post<{ reviewId: string }>(rootPath('/review/create-from-url'), {
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
        enum: ['anyone', 'restricted'],
        description: 'New sharing mode (required for update_sharing)',
      },
      approvedEmails: {
        type: 'array',
        items: { type: 'string' },
        description: 'Emails allowed when sharingMode is restricted (update_sharing only)',
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
  sharingMode?: 'anyone' | 'restricted';
  approvedEmails?: string[];
}): Promise<Review> {
  switch (args.action) {
    case 'approve':
      return await apiClient.post<Review>(reviewPath(args.reviewId, '/workflow/approve'), { stage: args.stage }, 'reviews');
    case 'reject':
      return await apiClient.post<Review>(
        reviewPath(args.reviewId, '/workflow/reject'),
        { stage: args.stage, reason: args.reason ?? null },
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
  description: 'Search design reviews by filename, title, description, or designer',
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
  const reviews = await getReviews({ workflowState: args.workflowState, showExpired: args.showExpired });

  const queryLower = args.query.toLowerCase();
  return reviews.filter(
    (review) =>
      review.filename?.toLowerCase().includes(queryLower) ||
      review.title?.toLowerCase().includes(queryLower) ||
      review.description?.toLowerCase().includes(queryLower) ||
      review.designer?.toLowerCase().includes(queryLower)
  );
}

export const getReviewCommentsSchema = z.object({
  reviewId: z.string().min(1),
  versionId: z.string().optional(),
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
    },
    required: ['reviewId'],
  },
};

export async function getReviewComments(args: { reviewId: string; versionId?: string }): Promise<ReviewComment[]> {
  const params = args.versionId ? { versionId: args.versionId } : {};
  return await apiClient.get<ReviewComment[]>(reviewPath(args.reviewId, '/comments'), params);
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
        description: 'Version ID the comment applies to',
      },
      type: {
        type: 'string',
        description: 'Comment type',
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
  return await apiClient.post<ReviewComment>(reviewPath(args.reviewId, '/comments'), {
    text: args.text,
    version: args.version,
    type: args.type,
    resolved: args.resolved ?? false,
  });
}
