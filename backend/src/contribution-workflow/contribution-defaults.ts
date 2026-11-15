import type { CheckInput, GuidelineInput, TemplateInput } from './contribution-workflow.service';

/*
 * The contribution process the system starts with: guidelines, PR templates
 * and automated checks, seeded into Elasticsearch once (DefaultsSeeder). Ids
 * are stable, so a deleted default stays deleted.
 */

export const DEFAULT_GUIDELINES: Array<GuidelineInput & { id: string }> = [
  {
    id: 'guideline-component',
    title: 'Component Contribution Guidelines',
    description: 'Guidelines for contributing new components to the design system',
    category: 'component',
    content: `
# Component Contribution Guidelines

## Before You Start
- Check if a similar component already exists
- Review existing component patterns
- Discuss your component idea with the design system team

## Requirements
- Follow the component naming convention
- Include all required props with proper types
- Provide accessibility attributes (ARIA labels, keyboard navigation)
- Include unit tests with >80% coverage
- Document all props and usage examples
- Follow the design token system (no hardcoded values)

## Code Quality
- Use TypeScript for type safety
- Follow ESLint rules
- Format code with Prettier
- Keep components focused and composable
      `.trim(),
    checklist: [
      'Component follows naming convention',
      'All props are typed correctly',
      'Accessibility attributes included',
      'Unit tests written (>80% coverage)',
      'Documentation complete',
      'Uses design tokens (no hardcoded values)',
      'ESLint passes',
      'Code formatted with Prettier',
    ],
  },
  {
    id: 'guideline-token',
    title: 'Token Contribution Guidelines',
    description: 'Guidelines for contributing design tokens',
    category: 'token',
    content: `
# Token Contribution Guidelines

## Token Structure
- Use semantic naming (e.g., color.primary, spacing.md)
- Follow the token hierarchy
- Include descriptions for all tokens
- Use appropriate value types

## Validation
- Tokens must be valid CSS values
- Color tokens must pass WCAG contrast requirements
- Spacing tokens should follow the scale
- Typography tokens must include all required properties
      `.trim(),
    checklist: [
      'Token follows naming convention',
      'Semantic naming used',
      'Valid CSS value',
      'WCAG contrast requirements met (for colors)',
      'Follows design scale',
      'Description included',
    ],
  },
];

export const DEFAULT_TEMPLATES: Array<TemplateInput & { id: string }> = [
  {
    id: 'template-new-component',
    name: 'New Component',
    description: 'Template for contributing a new component',
    category: 'component',
    template: {
      title: '[Component Name] - New Component',
      description: 'Brief description of the component and its purpose',
      checklist: [
        'Component follows design system patterns',
        'All props documented',
        'Accessibility requirements met',
        'Tests written',
        'Examples provided',
      ],
      codeExample: `// Component structure example
export interface ComponentProps {
  // Define props here
}

export const Component: React.FC<ComponentProps> = (props) => {
  // Component implementation
};`,
    },
  },
  {
    id: 'template-component-enhancement',
    name: 'Component Enhancement',
    description: 'Template for enhancing an existing component',
    category: 'enhancement',
    template: {
      title: '[Component Name] - Enhancement',
      description: 'Description of the enhancement and why it\'s needed',
      checklist: [
        'Backward compatibility maintained',
        'New props are optional',
        'Existing tests still pass',
        'New functionality tested',
        'Documentation updated',
      ],
    },
  },
  {
    id: 'template-bug-fix',
    name: 'Bug Fix',
    description: 'Template for fixing a bug',
    category: 'bug-fix',
    template: {
      title: '[Component/Feature] - Bug Fix',
      description: 'Description of the bug and how it was fixed',
      checklist: [
        'Root cause identified',
        'Fix implemented',
        'Tests added to prevent regression',
        'Documentation updated if needed',
      ],
    },
  },
];

export const DEFAULT_CHECKS: Array<CheckInput & { id: string }> = [
  {
    id: 'check-component-structure',
    name: 'Component structure',
    description: 'The component has the parts its kind needs and a PascalCase name',
    category: 'structure',
    enabled: true,
  },
  {
    id: 'check-accessibility-audit',
    name: 'Accessibility audit',
    description: 'axe and the accessibility governance rules, run on the submitted markup',
    category: 'accessibility',
    enabled: true,
  },
  {
    id: 'check-design-system-rules',
    name: 'Design system rules',
    description: 'Design-system and UX governance rules: tokens instead of hard-coded values, naming, no inline styles',
    category: 'design-system',
    enabled: true,
  },
  {
    id: 'check-documentation',
    name: 'Documentation check',
    description: 'A description, usage docs with an example, and every prop documented',
    category: 'documentation',
    enabled: true,
  },
  {
    id: 'check-unit-tests',
    name: 'Unit tests',
    description: 'A test file with test cases and assertions; a reviewer confirms it passes in CI',
    category: 'testing',
    enabled: true,
  },
  {
    id: 'check-eslint',
    name: 'ESLint',
    description: 'Run ESLint to check code quality',
    category: 'linting',
    enabled: true,
    command: 'npm run lint',
    config: {
      extends: ['@design-system/eslint-config'],
    },
  },
  {
    id: 'check-prettier',
    name: 'Prettier',
    description: 'Format code with Prettier',
    category: 'formatting',
    enabled: true,
    command: 'npm run format:check',
  },
  {
    id: 'check-typescript',
    name: 'TypeScript',
    description: 'Type check with TypeScript',
    category: 'linting',
    enabled: true,
    command: 'npm run type-check',
  },
];
