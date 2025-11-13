import { Injectable } from '@nestjs/common';

export interface ComponentPattern {
  id: string;
  name: string;
  description: string;
  category: 'common' | 'anti-pattern' | 'best-practice' | 'accessibility' | 'performance' | 'composition';
  componentIds?: string[]; // Components this pattern relates to
  codeExample?: {
    good?: string;
    bad?: string;
    description?: string;
  };
  useCases?: string[];
  whenToUse?: string;
  whenNotToUse?: string;
  relatedPatterns?: string[]; // Pattern IDs
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PatternsLibraryService {
  private patterns: Map<string, ComponentPattern> = new Map();

  constructor() {
    this.initializeDefaultPatterns();
  }

  /**
   * Initialize default patterns
   */
  private initializeDefaultPatterns(): void {
    // Common Patterns
    this.createPattern({
      name: 'Button with Icon',
      description: 'Common pattern for buttons with leading or trailing icons',
      category: 'common',
      codeExample: {
        good: `<button class="flex items-center gap-2">
  <Icon name="plus" />
  Add Item
</button>`,
        bad: `<button>
  <span>+</span> Add Item
</button>`,
        description: 'Use icon components instead of text symbols for better accessibility and consistency',
      },
      useCases: ['Primary actions', 'Secondary actions', 'Icon buttons'],
      whenToUse: 'When you need a button with a visual icon indicator',
      tags: ['button', 'icon', 'ui'],
    });

    this.createPattern({
      name: 'Form Validation',
      description: 'Proper form validation pattern with error states',
      category: 'best-practice',
      codeExample: {
        good: `<div class="form-group">
  <label for="email">Email</label>
  <input id="email" type="email" aria-invalid="false" aria-describedby="email-error" />
  <span id="email-error" class="error-message" role="alert"></span>
</div>`,
        bad: `<div>
  <input type="email" />
  <span class="error"></span>
</div>`,
        description: 'Always include proper labels, ARIA attributes, and error messaging',
      },
      useCases: ['Form inputs', 'Validation', 'Error handling'],
      whenToUse: 'For all form inputs requiring validation',
      tags: ['form', 'validation', 'accessibility'],
    });

    // Anti-patterns
    this.createPattern({
      name: 'Inline Styles',
      description: 'Anti-pattern: Using inline styles instead of design tokens',
      category: 'anti-pattern',
      codeExample: {
        good: `<div class="bg-indigo-600 text-white p-4">Content</div>`,
        bad: `<div style="background-color: #4f46e5; color: white; padding: 1rem;">Content</div>`,
        description: 'Inline styles break design system consistency and make maintenance difficult',
      },
      whenNotToUse: 'Never use inline styles for design system components',
      tags: ['anti-pattern', 'styling', 'tokens'],
    });

    this.createPattern({
      name: 'Missing Loading States',
      description: 'Anti-pattern: Not providing loading feedback for async operations',
      category: 'anti-pattern',
      codeExample: {
        good: `<button :disabled="loading">
  <Spinner v-if="loading" />
  <span v-else>Submit</span>
</button>`,
        bad: `<button @click="submit">Submit</button>`,
        description: 'Always provide visual feedback during async operations',
      },
      whenNotToUse: 'Never skip loading states for user-initiated async actions',
      tags: ['anti-pattern', 'loading', 'ux'],
    });

    // Best Practices
    this.createPattern({
      name: 'Accessible Modal',
      description: 'Best practice for creating accessible modal dialogs',
      category: 'accessibility',
      codeExample: {
        good: `<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Modal Title</h2>
  <button aria-label="Close modal">×</button>
  <!-- Content -->
</div>`,
        bad: `<div class="modal">
  <h2>Modal Title</h2>
  <button>×</button>
</div>`,
        description: 'Use proper ARIA roles and labels for modal dialogs',
      },
      useCases: ['Dialogs', 'Confirmations', 'Forms'],
      whenToUse: 'For any modal or dialog component',
      tags: ['modal', 'accessibility', 'aria'],
    });

    this.createPattern({
      name: 'Component Composition',
      description: 'Best practice for composing complex components from primitives',
      category: 'composition',
      codeExample: {
        good: `<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardBody>
    <CardContent>Content</CardContent>
  </CardBody>
</Card>`,
        bad: `<div class="card">
  <div class="card-header">
    <h3>Title</h3>
  </div>
  <div class="card-body">
    <p>Content</p>
  </div>
</div>`,
        description: 'Compose complex components from smaller, reusable primitives',
      },
      useCases: ['Complex layouts', 'Reusable structures'],
      whenToUse: 'When building complex components that can be broken into parts',
      tags: ['composition', 'components', 'architecture'],
    });

    // Performance Patterns
    this.createPattern({
      name: 'Lazy Loading Images',
      description: 'Best practice for loading images efficiently',
      category: 'performance',
      codeExample: {
        good: `<img src="image.jpg" loading="lazy" alt="Description" />`,
        bad: `<img src="image.jpg" alt="Description" />`,
        description: 'Use lazy loading for images below the fold to improve initial page load',
      },
      useCases: ['Image galleries', 'Long content pages', 'Lists with images'],
      whenToUse: 'For images that are not immediately visible',
      tags: ['performance', 'images', 'optimization'],
    });
  }

  /**
   * Create a new pattern
   */
  createPattern(data: {
    name: string;
    description: string;
    category: ComponentPattern['category'];
    componentIds?: string[];
    codeExample?: ComponentPattern['codeExample'];
    useCases?: string[];
    whenToUse?: string;
    whenNotToUse?: string;
    relatedPatterns?: string[];
    tags?: string[];
  }): ComponentPattern {
    const id = `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const pattern: ComponentPattern = {
      id,
      ...data,
      tags: data.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.patterns.set(id, pattern);
    return pattern;
  }

  /**
   * Get all patterns
   */
  getAllPatterns(filters?: {
    category?: ComponentPattern['category'];
    tags?: string[];
    search?: string;
  }): ComponentPattern[] {
    let patterns = Array.from(this.patterns.values());

    if (filters) {
      if (filters.category) {
        patterns = patterns.filter(p => p.category === filters.category);
      }
      if (filters.tags && filters.tags.length > 0) {
        patterns = patterns.filter(p =>
          p.tags && filters.tags!.some(tag => p.tags!.includes(tag))
        );
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        patterns = patterns.filter(p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchLower)))
        );
      }
    }

    return patterns.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get pattern by ID
   */
  getPattern(patternId: string): ComponentPattern | null {
    return this.patterns.get(patternId) || null;
  }

  /**
   * Get patterns by component ID
   */
  getPatternsByComponent(componentId: string): ComponentPattern[] {
    return Array.from(this.patterns.values()).filter(p =>
      p.componentIds && p.componentIds.includes(componentId)
    );
  }

  /**
   * Update pattern
   */
  updatePattern(patternId: string, updates: Partial<Omit<ComponentPattern, 'id' | 'createdAt'>>): ComponentPattern | null {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return null;
    Object.assign(pattern, updates, { updatedAt: new Date() });
    this.patterns.set(patternId, pattern);
    return pattern;
  }

  /**
   * Delete pattern
   */
  deletePattern(patternId: string): boolean {
    return this.patterns.delete(patternId);
  }

  /**
   * Get related patterns
   */
  getRelatedPatterns(patternId: string): ComponentPattern[] {
    const pattern = this.patterns.get(patternId);
    if (!pattern || !pattern.relatedPatterns) return [];

    return pattern.relatedPatterns
      .map(id => this.patterns.get(id))
      .filter((p): p is ComponentPattern => p !== undefined);
  }
}




