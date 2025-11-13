import { Injectable, Optional, Inject } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

export interface FeatureFlag {
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
    createdAt?: Date;
    updatedBy?: string;
    updatedAt?: Date;
  };
}

@Injectable()
export class FeatureFlagsService {
  private readonly indexPrefix = 'design-system-feature-flags';
  private inMemoryFlags = new Map<string, FeatureFlag>();

  constructor(
    @Optional() @Inject(ElasticsearchService) private readonly elasticsearchService?: ElasticsearchService,
  ) {
    // Initialize with some default feature flags
    this.initializeDefaultFlags().then(() => {
      // Ensure all features are enabled after initialization
      this.ensureAllFeaturesEnabled().catch(err => {
        console.error('Failed to ensure all features are enabled:', err);
      });
    });
  }

  private async initializeDefaultFlags() {
    const defaultFlags: FeatureFlag[] = [
      // Components
      {
        id: 'component-playground',
        key: 'component-playground',
        name: 'Component Playground',
        description: 'Enable the live component playground with code editor',
        enabled: true, // Force enabled
        defaultValue: true,
        metadata: {
          category: 'Components',
          tags: ['components', 'developer-tools'],
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
        },
      },
      {
        id: 'code-quality',
        key: 'code-quality',
        name: 'Code Quality Checks',
        description: 'Enable linting, formatting, and best practices enforcement',
        enabled: true,
        defaultValue: true,
        metadata: {
          category: 'Tools',
          tags: ['tools', 'code', 'quality'],
          createdAt: new Date(),
        },
      },
      {
        id: 'vulnerability-scanner',
        key: 'vulnerability-scanner',
        name: 'Vulnerability Scanner',
        description: 'Enable dependency security vulnerability scanning',
        enabled: true,
        defaultValue: true,
        metadata: {
          category: 'Tools',
          tags: ['tools', 'security', 'vulnerabilities'],
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
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
          createdAt: new Date(),
        },
      },
    ];

    for (const flag of defaultFlags) {
      // Force enabled to true
      const flagToStore = { ...flag, enabled: true };
      this.inMemoryFlags.set(flag.id, flagToStore);
      if (this.elasticsearchService) {
        try {
          await this.elasticsearchService.index({
            index: `${this.indexPrefix}-flags`,
            id: flag.id,
            document: {
              ...flagToStore,
              enabled: true, // Force enabled in Elasticsearch too
              metadata: {
                ...flagToStore.metadata,
                createdAt: flagToStore.metadata?.createdAt?.toISOString(),
                updatedAt: flagToStore.metadata?.updatedAt?.toISOString(),
              },
            },
          });
        } catch (error) {
          console.warn('Failed to index default feature flag to Elasticsearch:', error);
        }
      }
    }
  }

  async getAllFlags(): Promise<FeatureFlag[]> {
    if (this.elasticsearchService) {
      try {
        const response = await this.elasticsearchService.search({
          index: `${this.indexPrefix}-flags`,
          body: {
            query: { match_all: {} },
            size: 1000,
          },
        });

        const flags = response.hits.hits.map((hit: any) => ({
          ...hit._source,
          metadata: {
            ...hit._source.metadata,
            createdAt: hit._source.metadata?.createdAt ? new Date(hit._source.metadata.createdAt) : undefined,
            updatedAt: hit._source.metadata?.updatedAt ? new Date(hit._source.metadata.updatedAt) : undefined,
          },
        }));

        // Update in-memory cache
        flags.forEach((flag: FeatureFlag) => {
          this.inMemoryFlags.set(flag.id, flag);
        });

        // Ensure all flags are enabled
        const flagsToEnable = flags.filter(flag => !flag.enabled);
        if (flagsToEnable.length > 0) {
          // Enable all disabled flags in background (don't await to avoid blocking)
          // Pass skipAutoCheck=true to avoid recursion
          this.ensureAllFeaturesEnabled(true).catch(err => {
            console.warn('Failed to auto-enable flags:', err);
          });
        }

        return flags;
      } catch (error) {
        console.warn('Failed to fetch feature flags from Elasticsearch, using in-memory:', error);
      }
    }

    const inMemoryFlags = Array.from(this.inMemoryFlags.values());
    
    // Ensure all in-memory flags are enabled
    const flagsToEnable = inMemoryFlags.filter(flag => !flag.enabled);
    if (flagsToEnable.length > 0) {
      flagsToEnable.forEach(flag => {
        flag.enabled = true;
        this.inMemoryFlags.set(flag.id, flag);
      });
    }

    return inMemoryFlags;
  }

  async getFlag(id: string): Promise<FeatureFlag | null> {
    if (this.elasticsearchService) {
      try {
        const response = await this.elasticsearchService.get({
          index: `${this.indexPrefix}-flags`,
          id,
        });

        const source = response._source as any;
        const flag = {
          ...source,
          enabled: true, // Force enabled
          metadata: {
            ...source.metadata,
            createdAt: source.metadata?.createdAt ? new Date(source.metadata.createdAt) : undefined,
            updatedAt: source.metadata?.updatedAt ? new Date(source.metadata.updatedAt) : undefined,
          },
        };
        
        // Update in-memory cache with enabled flag
        this.inMemoryFlags.set(id, flag);
        
        // If it was disabled, update it in Elasticsearch too
        if (!source.enabled) {
          this.updateFlag(id, { enabled: true }).catch(err => {
            console.warn(`Failed to update flag ${id} to enabled:`, err);
          });
        }
        
        return flag;
      } catch (error) {
        // Not found in Elasticsearch, check in-memory
      }
    }

    const inMemoryFlag = this.inMemoryFlags.get(id);
    if (inMemoryFlag && !inMemoryFlag.enabled) {
      // Force enable in-memory flag
      inMemoryFlag.enabled = true;
      this.inMemoryFlags.set(id, inMemoryFlag);
    }
    
    return inMemoryFlag || null;
  }

  async getFlagByKey(key: string): Promise<FeatureFlag | null> {
    const allFlags = await this.getAllFlags();
    const flag = allFlags.find(flag => flag.key === key);
    
    // Force enable if found
    if (flag && !flag.enabled) {
      await this.updateFlag(flag.id, { enabled: true });
      flag.enabled = true;
    }
    
    return flag || null;
  }

  async createFlag(flag: Omit<FeatureFlag, 'id'>): Promise<FeatureFlag> {
    const newFlag: FeatureFlag = {
      ...flag,
      id: flag.key,
      metadata: {
        ...flag.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    this.inMemoryFlags.set(newFlag.id, newFlag);

    if (this.elasticsearchService) {
      try {
        await this.elasticsearchService.index({
          index: `${this.indexPrefix}-flags`,
          id: newFlag.id,
          document: {
            ...newFlag,
            metadata: {
              ...newFlag.metadata,
              createdAt: newFlag.metadata?.createdAt?.toISOString(),
              updatedAt: newFlag.metadata?.updatedAt?.toISOString(),
            },
          },
        });
      } catch (error) {
        console.warn('Failed to index feature flag to Elasticsearch:', error);
      }
    }

    return newFlag;
  }

  async updateFlag(id: string, updates: Partial<FeatureFlag>): Promise<FeatureFlag | null> {
    const existingFlag = await this.getFlag(id);
    if (!existingFlag) {
      return null;
    }

    const updatedFlag: FeatureFlag = {
      ...existingFlag,
      ...updates,
      metadata: {
        ...existingFlag.metadata,
        ...updates.metadata,
        updatedAt: new Date(),
      },
    };

    this.inMemoryFlags.set(id, updatedFlag);

    if (this.elasticsearchService) {
      try {
        await this.elasticsearchService.index({
          index: `${this.indexPrefix}-flags`,
          id,
          document: {
            ...updatedFlag,
            metadata: {
              ...updatedFlag.metadata,
              createdAt: updatedFlag.metadata?.createdAt?.toISOString(),
              updatedAt: updatedFlag.metadata?.updatedAt?.toISOString(),
            },
          },
        });
      } catch (error) {
        console.warn('Failed to update feature flag in Elasticsearch:', error);
      }
    }

    return updatedFlag;
  }

  async deleteFlag(id: string): Promise<boolean> {
    const flag = await this.getFlag(id);
    if (!flag) {
      return false;
    }

    this.inMemoryFlags.delete(id);

    if (this.elasticsearchService) {
      try {
        await this.elasticsearchService.delete({
          index: `${this.indexPrefix}-flags`,
          id,
        });
      } catch (error) {
        console.warn('Failed to delete feature flag from Elasticsearch:', error);
      }
    }

    return true;
  }

  async toggleFlag(id: string): Promise<FeatureFlag | null> {
    const flag = await this.getFlag(id);
    if (!flag) {
      return null;
    }

    return this.updateFlag(id, { enabled: !flag.enabled });
  }

  async isEnabled(key: string, userId?: string, userGroups?: string[]): Promise<boolean> {
    const flag = await this.getFlagByKey(key);
    if (!flag) {
      // If flag doesn't exist, return true (fail open) to allow access
      return true;
    }

    // Force enable - always return true
    if (!flag.enabled) {
      // Enable it in background
      this.updateFlag(flag.id, { enabled: true }).catch(err => {
        console.warn(`Failed to enable flag ${key}:`, err);
      });
      return true; // Return true immediately
    }

    // Check targeting rules
    if (flag.targeting) {
      // User targeting
      if (flag.targeting.users && userId) {
        if (flag.targeting.users.includes(userId)) {
          return true;
        }
      }

      // Group targeting
      if (flag.targeting.groups && userGroups) {
        if (flag.targeting.groups.some(group => userGroups.includes(group))) {
          return true;
        }
      }

      // Percentage rollout
      if (flag.targeting.percentage !== undefined) {
        if (userId) {
          // Use userId hash for consistent percentage
          const hash = this.hashString(userId);
          const percentage = (hash % 100) + 1;
          return percentage <= flag.targeting.percentage;
        }
        // If no userId, use random
        return Math.random() * 100 <= flag.targeting.percentage;
      }
    }

    return flag.enabled;
  }

  /**
   * Ensure all features are enabled
   */
  async ensureAllFeaturesEnabled(skipAutoCheck = false): Promise<void> {
    try {
      // Get flags directly from cache to avoid recursion
      const allFlags = skipAutoCheck 
        ? Array.from(this.inMemoryFlags.values())
        : await this.getAllFlags();
      let enabledCount = 0;
      
      for (const flag of allFlags) {
        if (!flag.enabled) {
          await this.updateFlag(flag.id, { enabled: true });
          console.log(`Enabled feature flag: ${flag.key}`);
          enabledCount++;
        }
      }
      
      if (enabledCount > 0) {
        console.log(`Enabled ${enabledCount} feature flag(s)`);
      }
      console.log(`All ${allFlags.length} feature flags are enabled`);
    } catch (error) {
      console.error('Failed to ensure all features are enabled:', error);
    }
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

