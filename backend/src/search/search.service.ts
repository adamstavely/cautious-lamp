import { Injectable } from '@nestjs/common';
import { DesignSystemService } from '../design-system/design-system.service';

export interface SearchResult {
  id: string;
  type: 'component' | 'token' | 'pattern' | 'guideline' | 'workspace' | 'application';
  title: string;
  description: string;
  path: string;
  category?: string;
  tags?: string[];
  props?: Array<{ name: string; type: string; description?: string }>;
  useCase?: string;
  score: number; // Relevance score
}

export interface SearchFilters {
  type?: SearchResult['type'][];
  category?: string[];
  hasProps?: string[]; // Component must have these props
  useCase?: string;
  tags?: string[];
}

@Injectable()
export class SearchService {
  constructor(
    private readonly designSystemService: DesignSystemService,
  ) {}

  /**
   * Perform advanced search with filters
   */
  search(
    query: string,
    filters?: SearchFilters,
  ): SearchResult[] {
    const results: SearchResult[] = [];

    // Search components
    if (!filters?.type || filters.type.includes('component')) {
      const components = this.designSystemService.getAllComponents();
      components.forEach(component => {
        const score = this.calculateRelevanceScore(query, {
          title: component.name,
          description: component.description,
          tags: [],
          props: component.props?.map(p => ({ name: p.name, type: p.type, description: p.description })),
        });

        if (score > 0) {
          // Apply filters
          if (filters?.category && !filters.category.some(cat => 
            component.description?.toLowerCase().includes(cat.toLowerCase())
          )) {
            return;
          }

          if (filters?.hasProps && component.props) {
            const hasAllProps = filters.hasProps.every(propName =>
              component.props!.some(p => p.name.toLowerCase() === propName.toLowerCase())
            );
            if (!hasAllProps) return;
          }

          if (filters?.useCase && !component.description?.toLowerCase().includes(filters.useCase.toLowerCase())) {
            return;
          }

          results.push({
            id: component.id,
            type: 'component',
            title: component.name,
            description: component.description,
            path: `/components/${component.id}`,
            category: component.status,
            props: component.props?.map(p => ({ name: p.name, type: p.type, description: p.description })),
            score,
          });
        }
      });
    }

    // Search tokens
    if (!filters?.type || filters.type.includes('token')) {
      const tokens = this.designSystemService.getAllTokens();
      tokens.forEach(token => {
        const score = this.calculateRelevanceScore(query, {
          title: token.name,
          description: token.description || '',
          tags: token.tags || [],
        });

        if (score > 0) {
          if (filters?.category && token.category !== filters.category[0]) {
            return;
          }

          results.push({
            id: token.name,
            type: 'token',
            title: token.name,
            description: token.description || `${token.type} token`,
            path: `/tokens/${token.name}`,
            category: token.category,
            tags: token.tags,
            score,
          });
        }
      });
    }

    // Search workspaces
    if (!filters?.type || filters.type.includes('workspace')) {
      const workspaces = this.designSystemService.getAllWorkspaces();
      workspaces.forEach(workspace => {
        const score = this.calculateRelevanceScore(query, {
          title: workspace.name,
          description: workspace.description || '',
          tags: [],
        });

        if (score > 0) {
          results.push({
            id: workspace.id,
            type: 'workspace',
            title: workspace.name,
            description: workspace.description || '',
            path: `/admin/workspaces/${workspace.id}`,
            score,
          });
        }
      });
    }

    // Sort by relevance score
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate relevance score for search query
   */
  private calculateRelevanceScore(
    query: string,
    item: {
      title: string;
      description: string;
      tags: string[];
      props?: Array<{ name: string; type: string; description?: string }>;
    },
  ): number {
    const queryLower = query.toLowerCase();
    let score = 0;

    // Exact title match (highest score)
    if (item.title.toLowerCase() === queryLower) {
      score += 100;
    } else if (item.title.toLowerCase().startsWith(queryLower)) {
      score += 50;
    } else if (item.title.toLowerCase().includes(queryLower)) {
      score += 30;
    }

    // Description match
    if (item.description.toLowerCase().includes(queryLower)) {
      score += 20;
    }

    // Tag match
    item.tags.forEach(tag => {
      if (tag.toLowerCase().includes(queryLower)) {
        score += 15;
      }
    });

    // Props match (for components)
    if (item.props) {
      item.props.forEach(prop => {
        if (prop.name.toLowerCase().includes(queryLower)) {
          score += 10;
        }
        if (prop.description?.toLowerCase().includes(queryLower)) {
          score += 5;
        }
      });
    }

    return score;
  }

  /**
   * Get search suggestions based on query
   */
  getSuggestions(query: string, limit: number = 5): string[] {
    const suggestions: Set<string> = new Set();
    const queryLower = query.toLowerCase();

    // Get component names
    const components = this.designSystemService.getAllComponents();
    components.forEach(comp => {
      if (comp.name.toLowerCase().includes(queryLower)) {
        suggestions.add(comp.name);
      }
    });

    // Get token names
    const tokens = this.designSystemService.getAllTokens();
    tokens.forEach(token => {
      if (token.name.toLowerCase().includes(queryLower)) {
        suggestions.add(token.name);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Get available search filters
   */
  getAvailableFilters(): {
    types: Array<{ value: string; label: string; count: number }>;
    categories: Array<{ value: string; label: string; count: number }>;
    commonProps: Array<{ value: string; label: string; count: number }>;
  } {
    const components = this.designSystemService.getAllComponents();
    const tokens = this.designSystemService.getAllTokens();

    // Count by type
    const typeCounts = {
      component: components.length,
      token: tokens.length,
      pattern: 0, // Would come from patterns library
      guideline: 0,
      workspace: this.designSystemService.getAllWorkspaces().length,
    };

    // Count by category
    const categoryCounts = new Map<string, number>();
    components.forEach(comp => {
      const cat = comp.status || 'other';
      categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
    });
    tokens.forEach(token => {
      const cat = token.category || 'other';
      categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1);
    });

    // Get common props
    const propCounts = new Map<string, number>();
    components.forEach(comp => {
      comp.props?.forEach(prop => {
        propCounts.set(prop.name, (propCounts.get(prop.name) || 0) + 1);
      });
    });

    return {
      types: Object.entries(typeCounts).map(([value, count]) => ({
        value,
        label: value.charAt(0).toUpperCase() + value.slice(1),
        count,
      })),
      categories: Array.from(categoryCounts.entries())
        .map(([value, count]) => ({
          value,
          label: value.charAt(0).toUpperCase() + value.slice(1),
          count,
        }))
        .sort((a, b) => b.count - a.count),
      commonProps: Array.from(propCounts.entries())
        .filter(([_, count]) => count >= 2) // Props used in at least 2 components
        .map(([value, count]) => ({
          value,
          label: value,
          count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10), // Top 10 most common props
    };
  }
}

