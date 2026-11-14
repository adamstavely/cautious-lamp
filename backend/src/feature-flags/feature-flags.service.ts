import { BadRequestException, ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { DocumentStore, DuplicateDocumentError, VersionConflictError } from '../reviews/document-store';

/** The index the flags have always been stored in */
export const FEATURE_FLAGS_INDEX = 'design-system-feature-flags-flags';
/** Injection token for the flag store */
export const FEATURE_FLAG_STORE = Symbol('FEATURE_FLAG_STORE');

export const FEATURE_FLAG_PROPERTIES = {
  id: { type: 'keyword' },
  key: { type: 'keyword' },
  enabled: { type: 'boolean' },
};

export interface FeatureFlag {
  /** Always equal to `key` */
  id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  defaultValue?: boolean;
  targeting?: {
    users?: string[];
    groups?: string[];
    percentage?: number; // 0-100
  };
  metadata?: {
    category?: string;
    tags?: string[];
    createdBy?: string;
    createdAt?: string;
    updatedBy?: string;
    updatedAt?: string;
  };
}

/** What a caller may set on a flag */
export interface FeatureFlagInput {
  key: string;
  name: string;
  description?: string;
  enabled?: boolean;
  defaultValue?: boolean;
  targeting?: FeatureFlag['targeting'];
  metadata?: { category?: string; tags?: string[] };
}

type DefaultFlag = FeatureFlag;

const KEY_PATTERN = /^[a-z0-9][a-z0-9-]{0,99}$/;

/**
 * Built-in flags. They are defaults only: a flag that has been stored (toggled,
 * edited) keeps its stored value, and these fill in flags that were never stored.
 */
const DEFAULT_FLAGS: DefaultFlag[] = [
  // Components
  {
    id: 'component-playground',
    key: 'component-playground',
    name: 'Component Playground',
    description: 'Enable the live component playground with code editor',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Components',
      tags: ['components', 'developer-tools'],
    },
  },
  {
    id: 'component-versioning',
    key: 'component-versioning',
    name: 'Component Versioning',
    description: 'Enable component version tracking and changelog',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Components',
      tags: ['components', 'versioning'],
    },
  },
  {
    id: 'component-testing',
    key: 'component-testing',
    name: 'Component Testing',
    description: 'Enable component testing framework and test generators',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Components',
      tags: ['components', 'testing'],
    },
  },
  {
    id: 'component-documentation',
    key: 'component-documentation',
    name: 'Component Documentation Generator',
    description: 'Enable auto-generation of component documentation from code comments',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Components',
      tags: ['components', 'documentation'],
    },
  },
  {
    id: 'component-handoff',
    key: 'component-handoff',
    name: 'Design-Dev Handoff Tools',
    description: 'Enable spec generation, asset export, and measurement tools',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Components',
      tags: ['components', 'handoff'],
    },
  },
  {
    id: 'component-composition',
    key: 'component-composition',
    name: 'Component Composition Tool',
    description: 'Enable building complex components from primitives',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Components',
      tags: ['components', 'composition'],
    },
  },
  {
    id: 'component-dependencies',
    key: 'component-dependencies',
    name: 'Component Dependency Graph',
    description: 'Enable visual map of component relationships',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Components',
      tags: ['components', 'dependencies'],
    },
  },
  {
    id: 'component-snippets',
    key: 'component-snippets',
    name: 'Component Code Snippets',
    description: 'Enable pre-built code snippets library for common use cases',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Components',
      tags: ['components', 'snippets'],
    },
  },
  {
    id: 'component-loupe',
    key: 'component-loupe',
    name: 'Loupe Tool',
    description: 'Enable component inspector tool for design system components',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Components',
      tags: ['components', 'loupe', 'inspector'],
    },
  },
  {
    id: 'component-status',
    key: 'component-status',
    name: 'Component Status Tracking',
    description: 'Enable component status tracking and management',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Components',
      tags: ['components', 'status'],
    },
  },
  // Tokens
  {
    id: 'token-studio',
    key: 'token-studio',
    name: 'Token Studio',
    description: 'Enable Style Dictionary-based token studio for creating DTCG-compliant tokens',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Tokens',
      tags: ['tokens', 'studio', 'style-dictionary'],
    },
  },
  {
    id: 'token-playground',
    key: 'token-playground',
    name: 'Design Tokens Playground',
    description: 'Enable the visual design tokens playground',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Tokens',
      tags: ['tokens', 'playground', 'developer-tools'],
    },
  },
  {
    id: 'token-library',
    key: 'token-library',
    name: 'Style Library',
    description: 'Enable style dictionary library for viewing, editing, downloading, and retiring',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Tokens',
      tags: ['tokens', 'library'],
    },
  },
  // Review
  {
    id: 'review-system',
    key: 'review-system',
    name: 'Review System',
    description: 'Enable the design review and approval system',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Review',
      tags: ['review', 'approval'],
    },
  },
  {
    id: 'review-kanban',
    key: 'review-kanban',
    name: 'Review Kanban Board',
    description: 'Enable Kanban board view for managing review requests',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Review',
      tags: ['review', 'kanban'],
    },
  },
  {
    id: 'review-admin',
    key: 'review-admin',
    name: 'Review Admin Dashboard',
    description: 'Enable admin dashboard for review management',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Review',
      tags: ['review', 'admin'],
    },
  },
  // Admin
  {
    id: 'admin-system-health',
    key: 'admin-system-health',
    name: 'System Health Dashboard',
    description: 'Enable system health monitoring and metrics dashboard',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Admin',
      tags: ['admin', 'health', 'metrics'],
    },
  },
  {
    id: 'admin-governance',
    key: 'admin-governance',
    name: 'Design System Governance',
    description: 'Enable rules engine, compliance checking, and policy enforcement',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Admin',
      tags: ['admin', 'governance', 'compliance'],
    },
  },
  {
    id: 'admin-audit',
    key: 'admin-audit',
    name: 'Audit Logs',
    description: 'Enable user action auditing and exportable audit trails',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Admin',
      tags: ['admin', 'audit', 'logging'],
    },
  },
  {
    id: 'admin-rbac',
    key: 'admin-rbac',
    name: 'Role-Based Access Control',
    description: 'Enable role and permission management system',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Admin',
      tags: ['admin', 'rbac', 'roles', 'permissions'],
    },
  },
  {
    id: 'admin-feature-flags',
    key: 'admin-feature-flags',
    name: 'Feature Flags Management',
    description: 'Enable feature flag management interface',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Admin',
      tags: ['admin', 'feature-flags'],
    },
  },
  {
    id: 'admin-banners',
    key: 'admin-banners',
    name: 'Site Banners',
    description: 'Enable site-wide info banner management',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Admin',
      tags: ['admin', 'banners', 'notifications'],
    },
  },
  // Tools
  {
    id: 'gradient-generator',
    key: 'gradient-generator',
    name: 'Gradient Generator',
    description: 'Enable gradient generator tool',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Tools',
      tags: ['tools', 'gradient', 'color'],
    },
  },
  {
    id: 'lorem-ipsum',
    key: 'lorem-ipsum',
    name: 'Lorem Ipsum Generator',
    description: 'Enable Lorem Ipsum text generator with HTML formatting options',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Tools',
      tags: ['tools', 'text', 'placeholder'],
    },
  },
  {
    id: 'seo-tagging',
    key: 'seo-tagging',
    name: 'SEO Tagging Generator',
    description: 'Enable SEO meta tags generator',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Tools',
      tags: ['tools', 'seo', 'meta'],
    },
  },
  {
    id: 'color-scale',
    key: 'color-scale',
    name: 'Color Scale Generator',
    description: 'Enable color scale generator with accessibility checks',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Tools',
      tags: ['tools', 'color', 'accessibility'],
    },
  },
  {
    id: 'color-converter',
    key: 'color-converter',
    name: 'Color Converter',
    description: 'Enable color format conversion tool',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Tools',
      tags: ['tools', 'color', 'converter'],
    },
  },
  {
    id: 'color-contrast',
    key: 'color-contrast',
    name: 'Color Contrast Checker',
    description: 'Enable WCAG color contrast checking tool',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Tools',
      tags: ['tools', 'color', 'accessibility', 'wcag'],
    },
  },
  {
    id: 'nasa-tlx',
    key: 'nasa-tlx',
    name: 'NASA-TLX',
    description: 'Enable NASA Task Load Index assessment tool',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Tools',
      tags: ['tools', 'ux', 'assessment'],
    },
  },
  {
    id: 'sus',
    key: 'sus',
    name: 'System Usability Scale (SUS)',
    description: 'Enable System Usability Scale questionnaire',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Tools',
      tags: ['tools', 'ux', 'usability'],
    },
  },
  {
    id: 'png-to-ico',
    key: 'png-to-ico',
    name: 'PNG to ICO Converter',
    description: 'Enable PNG to ICO image format converter',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Tools',
      tags: ['tools', 'image', 'converter'],
    },
  },
  {
    id: 'heuristic-evaluation',
    key: 'heuristic-evaluation',
    name: 'Heuristic Evaluation Checklist',
    description: 'Enable heuristic evaluation checklist tool',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Tools',
      tags: ['tools', 'ux', 'evaluation'],
    },
  },
  {
    id: 'visual-regression',
    key: 'visual-regression',
    name: 'Visual Regression',
    description: 'Enable visual regression testing projects and runs',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Tools',
      tags: ['tools', 'testing', 'visual-regression'],
    },
  },
  {
    id: 'session-replay',
    key: 'session-replay',
    name: 'Session Replay',
    description: 'Enable session replay projects',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Research',
      tags: ['research', 'session-replay'],
    },
  },
  {
    id: 'palette-builder',
    key: 'palette-builder',
    name: 'Palette Builder',
    description: 'Enable color palette builder tool',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Tools',
      tags: ['tools', 'color', 'palette'],
    },
  },
  {
    id: 'theme-builder',
    key: 'theme-builder',
    name: 'Theme Builder',
    description: 'Enable visual theme customization tool',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Tools',
      tags: ['tools', 'theme', 'customization'],
    },
  },
  {
    id: 'migration-assistant',
    key: 'migration-assistant',
    name: 'Deprecation & Migration Assistant',
    description: 'Enable component and token migration tools',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Tools',
      tags: ['tools', 'migration', 'deprecation'],
    },
  },
  // Fonts
  {
    id: 'font-library',
    key: 'font-library',
    name: 'Font Library',
    description: 'Enable font library and management',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Fonts',
      tags: ['fonts', 'typography'],
    },
  },
  {
    id: 'font-scale',
    key: 'font-scale',
    name: 'Font Scale',
    description: 'Enable font scale management',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Fonts',
      tags: ['fonts', 'typography', 'scale'],
    },
  },
  {
    id: 'font-stack',
    key: 'font-stack',
    name: 'Font Stack',
    description: 'Enable font stack management',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Fonts',
      tags: ['fonts', 'typography', 'stack'],
    },
  },
  {
    id: 'font-subsetting',
    key: 'font-subsetting',
    name: 'Font Subsetting',
    description: 'Enable font subsetting tools',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Fonts',
      tags: ['fonts', 'typography', 'subsetting'],
    },
  },
  // Patterns
  {
    id: 'patterns-system',
    key: 'patterns-system',
    name: 'Patterns System',
    description: 'Enable design patterns library and documentation',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Patterns',
      tags: ['patterns', 'design'],
    },
  },
  // Design Assets
  {
    id: 'icon-library',
    key: 'icon-library',
    name: 'Icon Library',
    description: 'Enable icon library with Material, Lucide, and custom icons',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Design Assets',
      tags: ['assets', 'icons'],
    },
  },
  // Getting Started
  {
    id: 'getting-started-section',
    key: 'getting-started-section',
    name: 'Getting Started Section',
    description: 'Enable getting started documentation and guides',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Documentation',
      tags: ['documentation', 'getting-started'],
    },
  },
  // Research
  {
    id: 'research-repo',
    key: 'research-repo',
    name: 'Research Repository',
    description: 'Enable research repository for journey maps, personas, and HCD reports',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Research',
      tags: ['research', 'hcd'],
    },
  },
  {
    id: 'user-persona-generator',
    key: 'user-persona-generator',
    name: 'User Persona Generator',
    description: 'Enable user persona generation tool',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Research',
      tags: ['research', 'personas'],
    },
  },
  // Guidelines
  {
    id: 'guidelines-vitepress',
    key: 'guidelines-vitepress',
    name: 'Guidelines Documentation',
    description: 'Enable VitePress-based guidelines documentation',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Documentation',
      tags: ['documentation', 'guidelines'],
    },
  },
  // AI
  {
    id: 'ai-assistant',
    key: 'ai-assistant',
    name: 'AI Assistant (Eero)',
    description: 'Enable the AI-powered design system assistant',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'AI',
      tags: ['ai', 'assistant'],
    },
  },
  {
    id: 'ai-suggestions',
    key: 'ai-suggestions',
    name: 'AI-Powered Suggestions',
    description: 'Enable AI-powered component recommendations and accessibility fixes',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'AI',
      tags: ['ai', 'suggestions'],
    },
  },
  // API
  {
    id: 'design-system-api',
    key: 'design-system-api',
    name: 'Design System API',
    description: 'Enable REST/GraphQL API for tokens and components with SDK and CLI',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'API',
      tags: ['api', 'sdk', 'cli'],
    },
  },
  // Feedback
  {
    id: 'feedback-roadmap',
    key: 'feedback-roadmap',
    name: 'Feedback & Roadmap',
    description: 'Enable component feedback system and public roadmap',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Feedback',
      tags: ['feedback', 'roadmap'],
    },
  },
  // Notifications
  {
    id: 'change-notifications',
    key: 'change-notifications',
    name: 'Change Notifications',
    description: 'Enable alerts for component and token changes',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Notifications',
      tags: ['notifications', 'alerts'],
    },
  },
  // Multi-brand
  {
    id: 'multi-brand-support',
    key: 'multi-brand-support',
    name: 'Multi-Brand Support',
    description: 'Enable managing multiple brands and white-label systems',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Branding',
      tags: ['brands', 'white-label'],
    },
  },
  // Compliance
  {
    id: 'compliance-scanning',
    key: 'compliance-scanning',
    name: 'Compliance Scanning',
    description: 'Enable application compliance scanning',
    enabled: true,
    defaultValue: true,
    metadata: {
      category: 'Governance',
      tags: ['compliance', 'governance'],
    },
  },
];
const DEFAULTS_BY_ID = new Map(DEFAULT_FLAGS.map((flag) => [flag.id, flag]));

/** Only the known targeting and metadata fields, so stored flags stay well-formed */
function cleanTargeting(targeting: FeatureFlagInput['targeting']): FeatureFlag['targeting'] | undefined {
  if (!targeting) return undefined;
  const strings = (value: unknown) => (Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : undefined);
  const percentage = typeof targeting.percentage === 'number' ? Math.min(100, Math.max(0, targeting.percentage)) : undefined;
  return { users: strings(targeting.users), groups: strings(targeting.groups), percentage };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Whether a flag is on for a user: off when the flag is off. With targeting
 * rules, on only for listed users, members of listed groups, or users inside
 * the percentage rollout (frontend/src/services/featureFlagsService.js matches this).
 */
export function evaluateFlag(flag: FeatureFlag, userId?: string, userGroups?: string[]): boolean {
  if (!flag.enabled) return false;
  const { users, groups, percentage } = flag.targeting ?? {};
  if (!users?.length && !groups?.length && percentage === undefined) return true;
  if (userId && users?.includes(userId)) return true;
  if (userGroups?.some((group) => groups?.includes(group))) return true;
  // Stable per user; without a user, only a full rollout counts
  if (percentage !== undefined) return userId ? (hashString(userId) % 100) + 1 <= percentage : percentage >= 100;
  return false;
}

/**
 * Feature flags (docs/AUTH.md for who may change them). Stored flags are the
 * source of truth; built-in defaults only stand in for flags never stored.
 * Reads fall back to the last values read (or the defaults) when storage is
 * down; writes fail with 503.
 */
@Injectable()
export class FeatureFlagsService {
  private readonly logger = new Logger(FeatureFlagsService.name);
  /** Last stored flags read, by id, for when storage is unavailable */
  private lastKnown = new Map<string, FeatureFlag>();

  constructor(@Inject(FEATURE_FLAG_STORE) private readonly store: DocumentStore<FeatureFlag>) {}

  /** Stored flags, plus defaults for built-in flags that were never stored */
  async getAllFlags(): Promise<FeatureFlag[]> {
    let stored: FeatureFlag[];
    try {
      stored = await this.store.list();
      this.lastKnown = new Map(stored.map((flag) => [flag.id, flag]));
    } catch (error) {
      this.logger.warn(`Feature flags unavailable, using the last values read: ${(error as Error).message}`);
      stored = [...this.lastKnown.values()];
    }
    const ids = new Set(stored.map((flag) => flag.id));
    return [...stored, ...DEFAULT_FLAGS.filter((flag) => !ids.has(flag.id)).map((flag) => structuredClone(flag))];
  }

  async getFlag(id: string): Promise<FeatureFlag | null> {
    if (!KEY_PATTERN.test(id)) return null;
    try {
      const stored = (await this.store.get(id))?.doc ?? null;
      if (stored) this.lastKnown.set(id, stored);
      else this.lastKnown.delete(id);
      if (stored) return stored;
    } catch (error) {
      this.logger.warn(`Feature flag ${id} unavailable, using the last value read: ${(error as Error).message}`);
      const known = this.lastKnown.get(id);
      if (known) return known;
    }
    const fallback = DEFAULTS_BY_ID.get(id);
    return fallback ? structuredClone(fallback) : null;
  }

  /** Flags are stored under their key */
  getFlagByKey(key: string): Promise<FeatureFlag | null> {
    return this.getFlag(key);
  }

  async createFlag(input: FeatureFlagInput, actorId: string): Promise<FeatureFlag> {
    if (!KEY_PATTERN.test(input.key ?? '')) {
      throw new BadRequestException('key must be lowercase letters, digits and dashes');
    }
    if (DEFAULTS_BY_ID.has(input.key)) {
      throw new ConflictException(`Feature flag ${input.key} already exists`);
    }
    const now = new Date().toISOString();
    const flag: FeatureFlag = {
      id: input.key,
      key: input.key,
      name: input.name,
      description: input.description,
      enabled: input.enabled === true,
      defaultValue: input.defaultValue,
      targeting: cleanTargeting(input.targeting),
      metadata: { category: input.metadata?.category, tags: input.metadata?.tags, createdBy: actorId, createdAt: now, updatedBy: actorId, updatedAt: now },
    };
    try {
      await this.store.create(flag);
    } catch (error) {
      if (error instanceof DuplicateDocumentError) throw new ConflictException(`Feature flag ${input.key} already exists`);
      throw error;
    }
    this.lastKnown.set(flag.id, flag);
    return flag;
  }

  /** Null when there is no such flag */
  async updateFlag(id: string, updates: Partial<FeatureFlagInput>, actorId: string): Promise<FeatureFlag | null> {
    if (updates.key !== undefined && updates.key !== id) {
      throw new BadRequestException("A flag's key can't be changed");
    }
    return this.mutate(id, actorId, (flag) => {
      if (updates.name !== undefined) flag.name = updates.name;
      if (updates.description !== undefined) flag.description = updates.description;
      if (updates.enabled !== undefined) flag.enabled = updates.enabled;
      if (updates.defaultValue !== undefined) flag.defaultValue = updates.defaultValue;
      if (updates.targeting !== undefined) flag.targeting = cleanTargeting(updates.targeting);
      if (updates.metadata !== undefined) {
        flag.metadata = { ...flag.metadata, category: updates.metadata.category, tags: updates.metadata.tags };
      }
    });
  }

  async toggleFlag(id: string, actorId: string): Promise<FeatureFlag | null> {
    return this.mutate(id, actorId, (flag) => {
      flag.enabled = !flag.enabled;
    });
  }

  /** Deleting a built-in flag resets it to its default. False when nothing was stored. */
  async deleteFlag(id: string): Promise<boolean> {
    if (!KEY_PATTERN.test(id)) return false;
    const deleted = await this.store.delete(id);
    this.lastKnown.delete(id);
    return deleted;
  }

  async isEnabled(key: string, userId?: string, userGroups?: string[]): Promise<boolean> {
    const flag = await this.getFlagByKey(key);
    // Unknown flags don't gate anything
    if (!flag) return true;
    return evaluateFlag(flag, userId, userGroups);
  }

  /** Turns every flag on (an administrator's reset) */
  async enableAll(actorId: string): Promise<number> {
    let enabled = 0;
    for (const flag of await this.getAllFlags()) {
      if (flag.enabled) continue;
      await this.mutate(flag.id, actorId, (current) => {
        current.enabled = true;
      });
      enabled++;
    }
    return enabled;
  }

  /**
   * Read-modify-write with optimistic concurrency. A built-in flag that was
   * never stored is stored on its first change.
   */
  private async mutate(id: string, actorId: string, change: (flag: FeatureFlag) => void): Promise<FeatureFlag | null> {
    if (!KEY_PATTERN.test(id)) return null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const stored = await this.store.get(id);
      const base = stored?.doc ?? (DEFAULTS_BY_ID.has(id) ? structuredClone(DEFAULTS_BY_ID.get(id)!) : null);
      if (!base) return null;
      change(base);
      const now = new Date().toISOString();
      base.metadata = { ...base.metadata, createdAt: base.metadata?.createdAt ?? now, updatedBy: actorId, updatedAt: now };
      try {
        if (stored) await this.store.replace(base, stored.version);
        else await this.store.create(base);
        this.lastKnown.set(id, base);
        return base;
      } catch (error) {
        if (!(error instanceof VersionConflictError) && !(error instanceof DuplicateDocumentError)) throw error;
      }
    }
    throw new ConflictException('The flag was changed by someone else, please try again');
  }
}
