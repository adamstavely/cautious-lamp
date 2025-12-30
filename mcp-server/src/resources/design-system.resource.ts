import { Resource } from '@modelcontextprotocol/sdk/types.js';
import { apiClient } from '../api-client';
import { logger } from '../logger.js';
import { Token } from '../tools/tokens.tool';
import { Component } from '../tools/components.tool';
import { ComponentPattern } from '../tools/patterns.tool';

export interface DesignSystemResource extends Resource {
  uri: string;
  name: string;
  description: string;
  mimeType: 'application/json';
}

export function listDesignSystemResources(): DesignSystemResource[] {
  return [
    {
      uri: 'design-system://tokens',
      name: 'Design Tokens',
      description: 'All design tokens (colors, spacing, typography, etc.)',
      mimeType: 'application/json',
    },
    {
      uri: 'design-system://components',
      name: 'Components',
      description: 'All design system components',
      mimeType: 'application/json',
    },
    {
      uri: 'design-system://patterns',
      name: 'Patterns',
      description: 'All design patterns',
      mimeType: 'application/json',
    },
    {
      uri: 'design-system://tokens/categories',
      name: 'Token Categories',
      description: 'List of all token categories',
      mimeType: 'application/json',
    },
    {
      uri: 'design-system://components/status',
      name: 'Component Status Summary',
      description: 'Summary of components by status',
      mimeType: 'application/json',
    },
  ];
}

export async function readDesignSystemResource(uri: string): Promise<string> {
  logger.debug('Reading design system resource', { uri });
  
  if (uri === 'design-system://tokens') {
    const response = await apiClient.get<{ tokens: Token[] }>('/tokens', undefined, 'tokens');
    logger.debug('Design system resource read', { uri, count: response.tokens.length });
    return JSON.stringify(response.tokens, null, 2);
  }
  
  if (uri === 'design-system://components') {
    const response = await apiClient.get<{ components: Component[] }>('/components', undefined, 'components');
    logger.debug('Design system resource read', { uri, count: response.components.length });
    return JSON.stringify(response.components, null, 2);
  }
  
  if (uri === 'design-system://patterns') {
    const response = await apiClient.get<{ patterns: ComponentPattern[] }>('/patterns-library/patterns', undefined, 'patterns');
    logger.debug('Design system resource read', { uri, count: response.patterns.length });
    return JSON.stringify(response.patterns, null, 2);
  }
  
  if (uri === 'design-system://tokens/categories') {
    const response = await apiClient.get<{ tokens: Token[] }>('/tokens', undefined, 'tokens');
    const categories = new Set(response.tokens.map((t) => t.category));
    logger.debug('Design system resource read', { uri, count: categories.size });
    return JSON.stringify(Array.from(categories).sort(), null, 2);
  }
  
  if (uri === 'design-system://components/status') {
    const response = await apiClient.get<{ components: Component[] }>('/components', undefined, 'components');
    const statusCounts: Record<string, number> = {};
    response.components.forEach((c) => {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    });
    logger.debug('Design system resource read', { uri, statusCounts });
    return JSON.stringify(statusCounts, null, 2);
  }
  
  logger.error('Unknown design system resource URI', { uri });
  throw new Error(`Unknown design system resource URI: ${uri}`);
}

