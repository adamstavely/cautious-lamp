import { Injectable } from '@nestjs/common';
import { DesignSystemService } from '../design-system/design-system.service';

export interface ContributionGuideline {
  id: string;
  title: string;
  description: string;
  category: 'component' | 'token' | 'pattern' | 'documentation' | 'bug-fix' | 'enhancement';
  content: string;
  checklist: string[];
  codeExamples?: {
    good?: string;
    bad?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ContributionTemplate {
  id: string;
  name: string;
  description: string;
  category: ContributionGuideline['category'];
  template: {
    title: string;
    description: string;
    checklist: string[];
    codeExample?: string;
  };
}

export interface ContributionCheck {
  id: string;
  name: string;
  description: string;
  category: 'linting' | 'formatting' | 'testing' | 'documentation' | 'accessibility' | 'performance';
  enabled: boolean;
  command?: string;
  config?: Record<string, any>;
}

@Injectable()
export class ContributionWorkflowService {
  private guidelines: Map<string, ContributionGuideline> = new Map();
  private templates: Map<string, ContributionTemplate> = new Map();
  private checks: Map<string, ContributionCheck> = new Map();

  constructor(
    private readonly designSystemService: DesignSystemService,
  ) {
    this.initializeDefaultGuidelines();
    this.initializeDefaultTemplates();
    this.initializeDefaultChecks();
  }

  /**
   * Initialize default contribution guidelines
   */
  private initializeDefaultGuidelines(): void {
    this.createGuideline({
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
    });

    this.createGuideline({
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
    });
  }

  /**
   * Initialize default contribution templates
   */
  private initializeDefaultTemplates(): void {
    this.createTemplate({
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
    });

    this.createTemplate({
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
    });

    this.createTemplate({
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
    });
  }

  /**
   * Initialize default automated checks
   */
  private initializeDefaultChecks(): void {
    this.createCheck({
      name: 'ESLint',
      description: 'Run ESLint to check code quality',
      category: 'linting',
      enabled: true,
      command: 'npm run lint',
      config: {
        extends: ['@design-system/eslint-config'],
      },
    });

    this.createCheck({
      name: 'Prettier',
      description: 'Format code with Prettier',
      category: 'formatting',
      enabled: true,
      command: 'npm run format:check',
    });

    this.createCheck({
      name: 'TypeScript',
      description: 'Type check with TypeScript',
      category: 'linting',
      enabled: true,
      command: 'npm run type-check',
    });

    this.createCheck({
      name: 'Unit Tests',
      description: 'Run unit tests',
      category: 'testing',
      enabled: true,
      command: 'npm run test',
    });

    this.createCheck({
      name: 'Accessibility Audit',
      description: 'Run accessibility checks',
      category: 'accessibility',
      enabled: true,
      command: 'npm run a11y:check',
    });

    this.createCheck({
      name: 'Documentation Check',
      description: 'Verify documentation is complete',
      category: 'documentation',
      enabled: true,
    });
  }

  /**
   * Create a contribution guideline
   */
  createGuideline(data: {
    title: string;
    description: string;
    category: ContributionGuideline['category'];
    content: string;
    checklist: string[];
    codeExamples?: ContributionGuideline['codeExamples'];
  }): ContributionGuideline {
    const id = `guideline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const guideline: ContributionGuideline = {
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.guidelines.set(id, guideline);
    return guideline;
  }

  /**
   * Get all guidelines
   */
  getAllGuidelines(category?: ContributionGuideline['category']): ContributionGuideline[] {
    let guidelines = Array.from(this.guidelines.values());
    if (category) {
      guidelines = guidelines.filter(g => g.category === category);
    }
    return guidelines.sort((a, b) => a.title.localeCompare(b.title));
  }

  /**
   * Get guideline by ID
   */
  getGuideline(id: string): ContributionGuideline | null {
    return this.guidelines.get(id) || null;
  }

  /**
   * Create a contribution template
   */
  createTemplate(data: {
    name: string;
    description: string;
    category: ContributionTemplate['category'];
    template: ContributionTemplate['template'];
  }): ContributionTemplate {
    const id = `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const contributionTemplate: ContributionTemplate = {
      id,
      ...data,
    };
    this.templates.set(id, contributionTemplate);
    return contributionTemplate;
  }

  /**
   * Get all templates
   */
  getAllTemplates(category?: ContributionTemplate['category']): ContributionTemplate[] {
    let templates = Array.from(this.templates.values());
    if (category) {
      templates = templates.filter(t => t.category === category);
    }
    return templates.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): ContributionTemplate | null {
    return this.templates.get(id) || null;
  }

  /**
   * Create an automated check
   */
  createCheck(data: {
    name: string;
    description: string;
    category: ContributionCheck['category'];
    enabled: boolean;
    command?: string;
    config?: Record<string, any>;
  }): ContributionCheck {
    const id = `check-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const check: ContributionCheck = {
      id,
      ...data,
    };
    this.checks.set(id, check);
    return check;
  }

  /**
   * Get all checks
   */
  getAllChecks(category?: ContributionCheck['category'], enabledOnly?: boolean): ContributionCheck[] {
    let checks = Array.from(this.checks.values());
    if (category) {
      checks = checks.filter(c => c.category === category);
    }
    if (enabledOnly) {
      checks = checks.filter(c => c.enabled);
    }
    return checks.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get check by ID
   */
  getCheck(id: string): ContributionCheck | null {
    return this.checks.get(id) || null;
  }

  /**
   * Generate PR template from contribution template
   */
  generatePRTemplate(templateId: string, data: {
    title?: string;
    description?: string;
    checklistItems?: string[];
  }): string {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const title = data.title || template.template.title;
    const description = data.description || template.template.description;
    const checklist = data.checklistItems || template.template.checklist;

    return `## ${title}

### Description
${description}

### Checklist
${checklist.map(item => `- [ ] ${item}`).join('\n')}

${template.template.codeExample ? `### Code Example
\`\`\`
${template.template.codeExample}
\`\`\`
` : ''}

### Automated Checks
The following checks will run automatically:
${this.getAllChecks(undefined, true).map(check => `- [ ] ${check.name}: ${check.description}`).join('\n')}
`;
  }

  /**
   * Run automated checks (simulated - would actually run commands)
   */
  async runAutomatedChecks(): Promise<Array<{
    check: ContributionCheck;
    passed: boolean;
    output?: string;
    error?: string;
  }>> {
    const enabledChecks = this.getAllChecks(undefined, true);
    const results = [];

    for (const check of enabledChecks) {
      // In a real implementation, this would actually run the commands
      // For now, we'll simulate the results
      const passed = Math.random() > 0.2; // 80% pass rate simulation
      results.push({
        check,
        passed,
        output: passed ? 'Check passed successfully' : 'Check failed',
        error: passed ? undefined : 'Some issues found',
      });
    }

    return results;
  }
}




