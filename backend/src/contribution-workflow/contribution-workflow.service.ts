import { BadRequestException, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DefaultsSeeder, SeedMarker } from '../common/elasticsearch/seed-defaults';
import { DesignSystemService } from '../design-system/design-system.service';
import { ScansService } from '../governance/scans.service';
import { DocumentStore } from '../reviews/document-store';
import { isSafeId } from '../workspaces/workspace-access.service';
import { DEFAULT_CHECKS, DEFAULT_GUIDELINES, DEFAULT_TEMPLATES } from './contribution-defaults';
import {
  CheckFinding,
  CheckOutcome,
  CheckRunner,
  CheckStatus,
  ContributionSubmission,
  documentationOutcome,
  governanceOutcome,
  manualOutcome,
  structureOutcome,
  submissionToInput,
  testsOutcome,
} from './contribution-checks';

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
  createdAt: string;
  updatedAt: string;
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
  category: 'linting' | 'formatting' | 'testing' | 'documentation' | 'accessibility' | 'performance' | 'design-system' | 'structure';
  enabled: boolean;
  /** How the check runs on a submission (contribution-checks.ts); set from the category and command */
  runner: CheckRunner;
  command?: string;
  config?: Record<string, any>;
}

export interface ContributionCheckResult {
  check: ContributionCheck;
  status: CheckStatus;
  /** true or false for a pass or a fail; null when a person has to decide */
  passed: boolean | null;
  summary: string;
  findings: CheckFinding[];
}

export type GuidelineInput = Omit<ContributionGuideline, 'id' | 'createdAt' | 'updatedAt'>;
export type TemplateInput = Omit<ContributionTemplate, 'id'>;
export type CheckInput = Omit<ContributionCheck, 'id' | 'runner'>;

export const GUIDELINES_INDEX = 'design-system-contribution-guidelines';
export const TEMPLATES_INDEX = 'design-system-contribution-templates';
export const CHECKS_INDEX = 'design-system-contribution-checks';
export const CONTRIBUTION_META_INDEX = 'design-system-contribution-meta';

/** Injection tokens for the contribution-process stores */
export const GUIDELINE_STORE = Symbol('CONTRIBUTION_GUIDELINE_STORE');
export const TEMPLATE_STORE = Symbol('CONTRIBUTION_TEMPLATE_STORE');
export const CHECK_STORE = Symbol('CONTRIBUTION_CHECK_STORE');
export const CONTRIBUTION_META_STORE = Symbol('CONTRIBUTION_META_STORE');

const keyword = { type: 'keyword' };

export const GUIDELINE_PROPERTIES = {
  id: keyword,
  title: keyword,
  category: keyword,
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' },
};

export const TEMPLATE_PROPERTIES = {
  id: keyword,
  name: keyword,
  category: keyword,
};

export const CHECK_PROPERTIES = {
  id: keyword,
  name: keyword,
  category: keyword,
  runner: keyword,
  enabled: { type: 'boolean' },
};

/** What `generate-pr` returns: the text for a pull request, which the contributor opens themselves */
export interface GeneratedPullRequestText {
  /** Markdown for the pull request description */
  prTemplate: string;
  /** Always false: nothing is opened on a code host */
  pullRequestOpened: false;
  message: string;
}

export const PR_TEXT_ONLY =
  'This is the text for your pull request. No pull request was opened: paste it into a new pull request in your repository.';

/** Governance rule categories each governance-run check category uses */
const GOVERNANCE_CATEGORIES: Partial<Record<ContributionCheck['category'], string[]>> = {
  accessibility: ['accessibility'],
  'design-system': ['design-system', 'ux-hcd'],
};

/**
 * Rules for applications, not for the design system's own components: an
 * application should import the design system, a contribution is part of it.
 */
const NOT_FOR_CONTRIBUTIONS = ['ds-component-import'];

/** A check with a command runs in the contributor's repository, so a person confirms it; the rest run here */
export function runnerFor(category: ContributionCheck['category'], command?: string): CheckRunner {
  if (command?.trim()) return 'manual';
  if (GOVERNANCE_CATEGORIES[category]) return 'governance';
  if (category === 'structure' || category === 'documentation') return category;
  if (category === 'testing') return 'tests';
  return 'manual';
}

/**
 * The contribution process: guidelines, PR templates and automated check
 * definitions, stored in Elasticsearch. The defaults (contribution-defaults.ts)
 * are seeded once; a deleted default stays deleted.
 */
@Injectable()
export class ContributionWorkflowService implements OnModuleInit {
  private readonly seeders: Array<DefaultsSeeder<{ id: string }>>;

  constructor(
    private readonly designSystemService: DesignSystemService,
    private readonly scans: ScansService,
    @Inject(GUIDELINE_STORE) private readonly guidelines: DocumentStore<ContributionGuideline>,
    @Inject(TEMPLATE_STORE) private readonly templates: DocumentStore<ContributionTemplate>,
    @Inject(CHECK_STORE) private readonly checks: DocumentStore<ContributionCheck>,
    @Inject(CONTRIBUTION_META_STORE) meta: DocumentStore<SeedMarker>,
  ) {
    const now = () => new Date().toISOString();
    this.seeders = [
      new DefaultsSeeder(guidelines, meta, 'default-guidelines-seeded-v1', () => DEFAULT_GUIDELINES.map(({ id, ...data }) => this.buildGuideline(data, id, now()))),
      new DefaultsSeeder(templates, meta, 'default-templates-seeded-v1', () => DEFAULT_TEMPLATES.map(({ id, ...data }) => ({ ...data, id }))),
      new DefaultsSeeder(checks, meta, 'default-checks-seeded-v1', () => DEFAULT_CHECKS.map(({ id, ...data }) => this.buildCheck(data, id))),
    ] as Array<DefaultsSeeder<{ id: string }>>;
  }

  onModuleInit(): void {
    for (const seeder of this.seeders) seeder.seedInBackground();
  }

  private async ensureSeeded(): Promise<void> {
    await Promise.all(this.seeders.map((seeder) => seeder.ensureSeeded()));
  }

  /**
   * Create a contribution guideline
   */
  async createGuideline(data: GuidelineInput): Promise<ContributionGuideline> {
    await this.ensureSeeded();
    const guideline = this.buildGuideline(data, `guideline-${randomUUID()}`, new Date().toISOString());
    await this.guidelines.create(guideline);
    return guideline;
  }

  /**
   * Get all guidelines
   */
  async getAllGuidelines(category?: ContributionGuideline['category']): Promise<ContributionGuideline[]> {
    await this.ensureSeeded();
    let guidelines = await this.guidelines.list();
    if (category) {
      guidelines = guidelines.filter(g => g.category === category);
    }
    return guidelines.sort((a, b) => a.title.localeCompare(b.title));
  }

  /**
   * Get guideline by ID
   */
  async getGuideline(id: string): Promise<ContributionGuideline | null> {
    if (!isSafeId(id)) return null;
    await this.ensureSeeded();
    return (await this.guidelines.get(id))?.doc ?? null;
  }

  /**
   * Create a contribution template
   */
  async createTemplate(data: TemplateInput): Promise<ContributionTemplate> {
    await this.ensureSeeded();
    const contributionTemplate: ContributionTemplate = { ...data, id: `template-${randomUUID()}` };
    await this.templates.create(contributionTemplate);
    return contributionTemplate;
  }

  /**
   * Get all templates
   */
  async getAllTemplates(category?: ContributionTemplate['category']): Promise<ContributionTemplate[]> {
    await this.ensureSeeded();
    let templates = await this.templates.list();
    if (category) {
      templates = templates.filter(t => t.category === category);
    }
    return templates.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get template by ID
   */
  async getTemplate(id: string): Promise<ContributionTemplate | null> {
    if (!isSafeId(id)) return null;
    await this.ensureSeeded();
    return (await this.templates.get(id))?.doc ?? null;
  }

  /**
   * Create an automated check
   */
  async createCheck(data: CheckInput): Promise<ContributionCheck> {
    await this.ensureSeeded();
    const check = this.buildCheck(data, `check-${randomUUID()}`);
    await this.checks.create(check);
    return check;
  }

  /**
   * Get all checks
   */
  async getAllChecks(category?: ContributionCheck['category'], enabledOnly?: boolean): Promise<ContributionCheck[]> {
    await this.ensureSeeded();
    let checks = await this.checks.list();
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
  async getCheck(id: string): Promise<ContributionCheck | null> {
    if (!isSafeId(id)) return null;
    await this.ensureSeeded();
    return (await this.checks.get(id))?.doc ?? null;
  }

  /**
   * The markdown for a pull request, from a contribution template. Only the
   * text: it opens no pull request anywhere.
   */
  async generatePRTemplate(templateId: string, data: {
    title?: string;
    description?: string;
    checklistItems?: string[];
  }): Promise<GeneratedPullRequestText> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const title = data.title || template.template.title;
    const description = data.description || template.template.description;
    const checklist = data.checklistItems || template.template.checklist;
    const enabledChecks = await this.getAllChecks(undefined, true);

    const prTemplate = `## ${title}

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
Run these checks on the contribution before review:
${enabledChecks.map(check => `- [ ] ${check.name}: ${check.description}`).join('\n')}
`;
    return { prTemplate, pullRequestOpened: false, message: PR_TEXT_ONLY };
  }

  private buildGuideline(data: GuidelineInput, id: string, now: string): ContributionGuideline {
    return { ...data, id, createdAt: now, updatedAt: now };
  }

  private buildCheck(data: CheckInput, id: string): ContributionCheck {
    return { ...data, id, runner: runnerFor(data.category, data.command) };
  }

  /**
   * Runs the enabled checks (or the ones in `checkIds`) on a submitted
   * contribution. Governance checks run the governance rules engine on the
   * code; structure, documentation and test checks inspect what was
   * submitted; checks with a command, and anything only a person can judge,
   * come back as `needs-review`. The same submission always gets the same results.
   */
  async runAutomatedChecks(submission: ContributionSubmission, checkIds?: string[]): Promise<{
    results: ContributionCheckResult[];
    summary: { passed: number; failed: number; needsReview: number; total: number };
  }> {
    let checks = await this.getAllChecks(undefined, true);
    if (checkIds?.length) {
      const found = await Promise.all(checkIds.map((id) => this.getCheck(id)));
      const unknown = checkIds.filter((_, i) => !found[i]);
      if (unknown.length) throw new BadRequestException(`Unknown check ids: ${unknown.join(', ')}`);
      checks = found as ContributionCheck[];
    }

    const input = submissionToInput(submission);
    // One governance run per set of rule categories, shared by checks that use the same set
    const runs = new Map<string, Promise<CheckOutcome>>();
    const governance = (check: ContributionCheck): Promise<CheckOutcome> => {
      const categories = GOVERNANCE_CATEGORIES[check.category] ?? [];
      const key = categories.join(',');
      if (!runs.has(key)) {
        const what = check.category === 'accessibility' ? 'accessibility' : 'design-system';
        runs.set(key, this.scans.evaluate(input, categories, NOT_FOR_CONTRIBUTIONS).then(({ rules, run }) => governanceOutcome(rules, run, what)));
      }
      return runs.get(key)!;
    };

    const results: ContributionCheckResult[] = [];
    for (const check of checks) {
      let outcome: CheckOutcome;
      switch (check.runner) {
        case 'governance':
          outcome = await governance(check);
          break;
        case 'structure':
          outcome = structureOutcome(submission);
          break;
        case 'documentation':
          outcome = documentationOutcome(submission);
          break;
        case 'tests':
          outcome = testsOutcome(submission);
          break;
        default:
          outcome = manualOutcome(check.command);
      }
      results.push({ check, ...outcome, passed: outcome.status === 'needs-review' ? null : outcome.status === 'pass' });
    }

    const count = (status: CheckStatus) => results.filter((r) => r.status === status).length;
    return { results, summary: { passed: count('pass'), failed: count('fail'), needsReview: count('needs-review'), total: results.length } };
  }
}
