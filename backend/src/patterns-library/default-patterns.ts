import type { DefaultPattern } from './patterns-library.service';

/**
 * The patterns the library starts with, seeded into Elasticsearch once
 * (DefaultsSeeder). Ids are stable, so a deleted default stays deleted.
 */
export const DEFAULT_PATTERNS: DefaultPattern[] = [
  {
    id: 'pattern-button-with-icon',
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
  },
  {
    id: 'pattern-form-validation',
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
  },
  {
    id: 'pattern-inline-styles',
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
  },
  {
    id: 'pattern-missing-loading-states',
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
  },
  {
    id: 'pattern-accessible-modal',
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
  },
  {
    id: 'pattern-component-composition',
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
  },
  {
    id: 'pattern-lazy-loading-images',
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
  },
];
