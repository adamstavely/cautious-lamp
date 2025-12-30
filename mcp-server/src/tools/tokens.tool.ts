import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { apiClient } from '../api-client';

export interface Token {
  name: string;
  value: string;
  type: string;
  category: string;
  description?: string;
  tags?: string[];
}

export interface TokensResponse {
  tokens: Token[];
  count: number;
  filters?: {
    category?: string;
    type?: string;
    tag?: string;
  };
}

export const getTokensTool: Tool = {
  name: 'get_tokens',
  description: 'Retrieve all design tokens with optional filters (category, type, tag)',
  inputSchema: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        description: 'Filter tokens by category (e.g., "color", "spacing", "typography")',
      },
      type: {
        type: 'string',
        description: 'Filter tokens by type',
      },
      tag: {
        type: 'string',
        description: 'Filter tokens by tag',
      },
    },
  },
};

export async function getTokens(args: { category?: string; type?: string; tag?: string }): Promise<TokensResponse> {
  const params: Record<string, string> = {};
  if (args.category) params.category = args.category;
  if (args.type) params.type = args.type;
  if (args.tag) params.tag = args.tag;

  return await apiClient.get<TokensResponse>('/tokens', params, 'tokens');
}

export const getTokenTool: Tool = {
  name: 'get_token',
  description: 'Get a specific design token by name',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The name of the token to retrieve',
      },
    },
    required: ['name'],
  },
};

export async function getToken(args: { name: string }): Promise<Token> {
  return await apiClient.get<Token>(`/tokens/${encodeURIComponent(args.name)}`, { name: args.name }, 'tokens');
}

export const searchTokensTool: Tool = {
  name: 'search_tokens',
  description: 'Search tokens by name or description',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query to match against token names or descriptions',
      },
      category: {
        type: 'string',
        description: 'Optional category filter',
      },
    },
    required: ['query'],
  },
};

export async function searchTokens(args: { query: string; category?: string }): Promise<TokensResponse> {
  const allTokens = await getTokens({ category: args.category });
  
  const queryLower = args.query.toLowerCase();
  const filtered = allTokens.tokens.filter(
    (token) =>
      token.name.toLowerCase().includes(queryLower) ||
      token.description?.toLowerCase().includes(queryLower) ||
      token.tags?.some((tag) => tag.toLowerCase().includes(queryLower))
  );

  return {
    tokens: filtered,
    count: filtered.length,
    filters: { category: args.category },
  };
}

