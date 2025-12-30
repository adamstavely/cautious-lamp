import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { apiClient } from '../api-client';

export interface WorkspaceReview {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-review' | 'approved' | 'rejected';
  url?: string;
  tags?: string[];
  workspaceId: string;
  sharedWith?: string[];
  isGlobal?: boolean;
  createdAt: string;
  createdBy: string;
}

export const getReviewsTool: Tool = {
  name: 'get_reviews',
  description: 'Retrieve all reviews for a workspace with optional status filter',
  inputSchema: {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'string',
        description: 'The workspace ID',
      },
      status: {
        type: 'string',
        enum: ['pending', 'in-review', 'approved', 'rejected'],
        description: 'Filter reviews by status',
      },
      userId: {
        type: 'string',
        description: 'Optional user ID for filtering',
      },
    },
    required: ['workspaceId'],
  },
};

export async function getReviews(args: { workspaceId: string; status?: string; userId?: string }): Promise<WorkspaceReview[]> {
  const params: Record<string, string> = { workspaceId: args.workspaceId };
  if (args.status) params.status = args.status;
  if (args.userId) params.userId = args.userId;

  return await apiClient.get<WorkspaceReview[]>(`/workspaces/${encodeURIComponent(args.workspaceId)}/reviews`, params, 'reviews');
}

export const getReviewTool: Tool = {
  name: 'get_review',
  description: 'Get a specific review by ID',
  inputSchema: {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'string',
        description: 'The workspace ID',
      },
      reviewId: {
        type: 'string',
        description: 'The review ID',
      },
    },
    required: ['workspaceId', 'reviewId'],
  },
};

export async function getReview(args: { workspaceId: string; reviewId: string }): Promise<WorkspaceReview> {
  // First get all reviews, then find the one we need
  const reviews = await getReviews({ workspaceId: args.workspaceId });
  const review = reviews.find((r) => r.id === args.reviewId);
  
  if (!review) {
    throw new Error(`Review with ID ${args.reviewId} not found in workspace ${args.workspaceId}`);
  }
  
  return review;
}

export const createReviewTool: Tool = {
  name: 'create_review',
  description: 'Create a new design review',
  inputSchema: {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'string',
        description: 'The workspace ID',
      },
      title: {
        type: 'string',
        description: 'Review title',
      },
      description: {
        type: 'string',
        description: 'Review description',
      },
      status: {
        type: 'string',
        enum: ['pending', 'in-review', 'approved', 'rejected'],
        description: 'Initial status',
        default: 'pending',
      },
      url: {
        type: 'string',
        description: 'URL to the design or resource being reviewed',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Tags for the review',
      },
      createdBy: {
        type: 'string',
        description: 'User ID of the creator',
      },
      sharedWith: {
        type: 'array',
        items: { type: 'string' },
        description: 'Workspace IDs to share with',
      },
      isGlobal: {
        type: 'boolean',
        description: 'Whether the review is global',
        default: false,
      },
    },
    required: ['workspaceId', 'title', 'createdBy'],
  },
};

export async function createReview(args: {
  workspaceId: string;
  title: string;
  description?: string;
  status?: 'pending' | 'in-review' | 'approved' | 'rejected';
  url?: string;
  tags?: string[];
  createdBy: string;
  sharedWith?: string[];
  isGlobal?: boolean;
}): Promise<WorkspaceReview> {
  return await apiClient.post<WorkspaceReview>(`/workspaces/${encodeURIComponent(args.workspaceId)}/reviews`, {
    title: args.title,
    description: args.description,
    status: args.status || 'pending',
    url: args.url,
    tags: args.tags,
    createdBy: args.createdBy,
    sharedWith: args.sharedWith,
    isGlobal: args.isGlobal,
  }, 'reviews');
}

export const updateReviewTool: Tool = {
  name: 'update_review',
  description: 'Update an existing review (status, description, tags, etc.)',
  inputSchema: {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'string',
        description: 'The workspace ID',
      },
      reviewId: {
        type: 'string',
        description: 'The review ID',
      },
      title: {
        type: 'string',
        description: 'Updated title',
      },
      description: {
        type: 'string',
        description: 'Updated description',
      },
      status: {
        type: 'string',
        enum: ['pending', 'in-review', 'approved', 'rejected'],
        description: 'Updated status',
      },
      url: {
        type: 'string',
        description: 'Updated URL',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Updated tags',
      },
    },
    required: ['workspaceId', 'reviewId'],
  },
};

export async function updateReview(args: {
  workspaceId: string;
  reviewId: string;
  title?: string;
  description?: string;
  status?: 'pending' | 'in-review' | 'approved' | 'rejected';
  url?: string;
  tags?: string[];
}): Promise<WorkspaceReview> {
  const updates: Record<string, any> = {};
  if (args.title !== undefined) updates.title = args.title;
  if (args.description !== undefined) updates.description = args.description;
  if (args.status !== undefined) updates.status = args.status;
  if (args.url !== undefined) updates.url = args.url;
  if (args.tags !== undefined) updates.tags = args.tags;

  return await apiClient.put<WorkspaceReview>(
    `/workspaces/${encodeURIComponent(args.workspaceId)}/reviews/${encodeURIComponent(args.reviewId)}`,
    updates,
    'reviews'
  );
}

export const searchReviewsTool: Tool = {
  name: 'search_reviews',
  description: 'Search reviews by title, description, or tags',
  inputSchema: {
    type: 'object',
    properties: {
      workspaceId: {
        type: 'string',
        description: 'The workspace ID',
      },
      query: {
        type: 'string',
        description: 'Search query',
      },
      status: {
        type: 'string',
        enum: ['pending', 'in-review', 'approved', 'rejected'],
        description: 'Optional status filter',
      },
    },
    required: ['workspaceId', 'query'],
  },
};

export async function searchReviews(args: { workspaceId: string; query: string; status?: string }): Promise<WorkspaceReview[]> {
  const reviews = await getReviews({ workspaceId: args.workspaceId, status: args.status });
  
  const queryLower = args.query.toLowerCase();
  return reviews.filter(
    (review) =>
      review.title.toLowerCase().includes(queryLower) ||
      review.description?.toLowerCase().includes(queryLower) ||
      review.tags?.some((tag) => tag.toLowerCase().includes(queryLower))
  );
}

