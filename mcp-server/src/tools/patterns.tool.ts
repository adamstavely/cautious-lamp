import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { apiClient } from '../api-client';

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

  return await apiClient.get<PatternsResponse>('/patterns-library/patterns', params, 'patterns');
}

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
  return await apiClient.get<ComponentPattern>(`/patterns-library/patterns/${encodeURIComponent(args.id)}`, { id: args.id }, 'patterns');
}

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
  return await apiClient.get<PatternsResponse>(`/patterns-library/patterns/component/${encodeURIComponent(args.componentId)}`, { componentId: args.componentId }, 'patterns');
}

