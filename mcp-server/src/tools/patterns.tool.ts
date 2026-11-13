import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { apiClient } from '../api-client';
import { rootPath } from '../api-root';

// The patterns library controller is mounted at `/patterns-library` on the
// server root, not under the `/api/v1` prefix the API base URL points at.
const PATTERNS_PATH = '/patterns-library/patterns';

const patternCategorySchema = z.enum(['layout', 'navigation', 'forms', 'data-display', 'feedback', 'overlays', 'other']);

export interface ComponentPattern {
  id: string;
  name: string;
  description: string;
  category: 'layout' | 'navigation' | 'forms' | 'data-display' | 'feedback' | 'overlays' | 'other';
  componentIds?: string[];
  codeExample?: {
    vue?: string;
    react?: string;
    html?: string;
  };
  useCases?: string[];
  whenToUse?: string;
  whenNotToUse?: string;
  relatedPatterns?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PatternsResponse {
  patterns: ComponentPattern[];
  count: number;
}

/**
 * The backend returns a bare array of patterns; wrap it so callers get a
 * consistent `{ patterns, count }` shape (an already-wrapped response passes through).
 */
export function toPatternsResponse(data: ComponentPattern[] | PatternsResponse): PatternsResponse {
  if (Array.isArray(data)) {
    return { patterns: data, count: data.length };
  }
  const patterns = Array.isArray(data?.patterns) ? data.patterns : [];
  return { patterns, count: patterns.length };
}

export const getPatternsSchema = z.object({
  category: patternCategorySchema.optional(),
  tags: z.string().optional(),
  search: z.string().optional(),
});

export const getPatternsTool: Tool = {
  name: 'get_patterns',
  description: 'Retrieve all patterns with optional filters (category, tags, search)',
  inputSchema: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        enum: ['layout', 'navigation', 'forms', 'data-display', 'feedback', 'overlays', 'other'],
        description: 'Filter patterns by category',
      },
      tags: {
        type: 'string',
        description: 'Comma-separated list of tags to filter by',
      },
      search: {
        type: 'string',
        description: 'Search query to match against pattern names or descriptions',
      },
    },
  },
};

export async function getPatterns(args: { category?: string; tags?: string; search?: string }): Promise<PatternsResponse> {
  const params: Record<string, string> = {};
  if (args.category) params.category = args.category;
  if (args.tags) params.tags = args.tags;
  if (args.search) params.search = args.search;

  const data = await apiClient.get<ComponentPattern[] | PatternsResponse>(rootPath(PATTERNS_PATH), params, 'patterns');
  return toPatternsResponse(data);
}

export const getPatternSchema = z.object({
  id: z.string().min(1),
});

export const getPatternTool: Tool = {
  name: 'get_pattern',
  description: 'Get a specific pattern by ID',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The ID of the pattern to retrieve',
      },
    },
    required: ['id'],
  },
};

export async function getPattern(args: { id: string }): Promise<ComponentPattern> {
  return await apiClient.get<ComponentPattern>(rootPath(`${PATTERNS_PATH}/${encodeURIComponent(args.id)}`), undefined, 'patterns');
}

export const getPatternsByComponentSchema = z.object({
  componentId: z.string().min(1),
});

export const getPatternsByComponentTool: Tool = {
  name: 'get_patterns_by_component',
  description: 'Get patterns that use a specific component',
  inputSchema: {
    type: 'object',
    properties: {
      componentId: {
        type: 'string',
        description: 'The ID of the component',
      },
    },
    required: ['componentId'],
  },
};

export async function getPatternsByComponent(args: { componentId: string }): Promise<PatternsResponse> {
  const data = await apiClient.get<ComponentPattern[] | PatternsResponse>(
    rootPath(`${PATTERNS_PATH}/component/${encodeURIComponent(args.componentId)}`),
    undefined,
    'patterns'
  );
  return toPatternsResponse(data);
}

