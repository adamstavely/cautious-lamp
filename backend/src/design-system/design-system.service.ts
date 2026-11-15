import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  ServiceUnavailableException,
  Optional,
  Inject,
} from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { randomUUID } from 'crypto';
import { AnalyticsService } from '../analytics/analytics.service';
import { EncryptionService } from '../common/security/encryption.service';
import { NotFoundException as BundleComponentNotFound } from '@nestjs/common';
import { DocumentStore, DuplicateDocumentError, VersionConflictError } from '../reviews/document-store';
import { analyzeAllBundles, analyzeComponentBundle } from './bundle-analysis.service';
import { SEED_COMPONENTS, SEED_TOKENS } from './design-system-seed';
import {
  BANNER_STORE,
  BUDGET_STORE,
  BannerType,
  COMPONENT_STORE,
  DESIGN_SYSTEM_META_STORE,
  DesignSystemMetaDoc,
  InfoBanner,
  PerformanceBudget,
  ROADMAP_STORE,
  RoadmapCategory,
  RoadmapItem,
  RoadmapPriority,
  RoadmapStatus,
  StoredComponent,
  StoredToken,
  TOKEN_STORE,
} from './design-system-stores';

export interface Token {
  name: string;
  value: string;
  type: string;
  category: string;
  description?: string;
  tags?: string[];
}

export interface ComponentVariant {
  name: string;
  description?: string;
  properties: {
    backgroundColor?: string; // Token reference or color value
    textColor?: string;
    borderColor?: string;
    borderWidth?: string;
    borderRadius?: string;
    padding?: string;
    fontSize?: string;
    fontWeight?: string;
    hover?: {
      backgroundColor?: string;
      textColor?: string;
      borderColor?: string;
    };
    active?: {
      backgroundColor?: string;
      textColor?: string;
      borderColor?: string;
    };
    disabled?: {
      backgroundColor?: string;
      textColor?: string;
      opacity?: string;
    };
  };
  generatedCode?: {
    vue?: string;
    react?: string;
    html?: string;
  };
}

/** A component's lifecycle stage, from planned to deprecated */
export const COMPONENT_STATUSES = ['production', 'in-progress', 'planned', 'deprecated'] as const;
export type ComponentStatus = (typeof COMPONENT_STATUSES)[number];

/** Why and how a deprecated component goes away; kept on the component while its status is 'deprecated' */
export interface ComponentDeprecation {
  /** Id of the component to use instead */
  replacement?: string;
  /** Day the component stops being supported (YYYY-MM-DD) */
  sunsetDate?: string;
  reason?: string;
  migrationGuide?: string;
  /** When the component was first marked deprecated, and by whom */
  deprecatedAt: string;
  deprecatedBy?: string;
}

export interface Component {
  id: string;
  name: string;
  description: string;
  status: ComponentStatus;
  props: ComponentProp[];
  code: {
    vue: string;
    react: string;
    html?: string;
  };
  /** Ids of the components this one is built from (PUT /components/:id/dependencies) */
  dependencies?: string[];
  examples?: string[];
  accessibility?: {
    wcag: string;
    notes?: string;
  };
  /** Present while status is 'deprecated' */
  deprecation?: ComponentDeprecation;
  /** Last lifecycle change (status, deprecation or dependencies) through the API; absent if never changed */
  updatedAt?: string;
  updatedBy?: string;
  variants?: ComponentVariant[]; // Custom variants created via builder
  workspaceId?: string; // Workspace/team this component belongs to
  sharedWith?: string[]; // Workspace IDs this component is shared with
  isGlobal?: boolean; // If true, available to all workspaces
}

export interface ComponentProp {
  name: string;
  type: string;
  default?: any;
  required?: boolean;
  options?: string[];
  description?: string;
}

/** Written before the starting components and tokens are seeded, so a seed cut short resumes */
const SEED_STARTED = 'starting-content-seed-started-v1';
/** Written once they are all stored; from then on the stored documents are the whole design system */
const SEED_DONE = 'starting-content-seeded-v1';

const MAX_WRITE_ATTEMPTS = 5;

/**
 * Meta document whose stamp changes on every component write, so another
 * server sharing the indices notices and reloads its copy
 */
export const CONTENT_VERSION = 'content-version';
/** How long a loaded copy is trusted before the content version is checked again */
export const CONTENT_CHECK_INTERVAL_MS = 3000;

/** The stored document without its storage fields */
function toComponent(doc: StoredComponent): Component {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { position, createdAt, ...component } = doc;
  return component;
}

function toToken(doc: StoredToken): Token {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, position, createdAt, ...token } = doc;
  return token;
}

const byPosition = (a: { position: number }, b: { position: number }) => a.position - b.position;
const byCreatedAt = (a: { createdAt: string }, b: { createdAt: string }) => a.createdAt.localeCompare(b.createdAt);

/** Copies the listed fields that `updates` sets; anything else in a request body is ignored */
function assignDefined<T extends object>(target: T, updates: Partial<T>, fields: Array<keyof T>): void {
  for (const field of fields) {
    if (updates[field] !== undefined) target[field] = updates[field] as T[keyof T];
  }
}

/** A date from a request as an ISO timestamp; undefined when empty, a 400 when it isn't a date */
function toIsoDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) throw new BadRequestException(`'${value}' is not a date`);
  return new Date(time).toISOString();
}

/**
 * Components and tokens live in Elasticsearch (design-system-components and
 * design-system-tokens). Reads are synchronous and served from an in-process
 * copy that is loaded on startup and updated after every write this service
 * makes; until it has loaded (Elasticsearch down at startup), reads fail with
 * a 503 and the next one retries the load. Every write also changes the
 * content-version stamp; a copy older than CONTENT_CHECK_INTERVAL_MS checks
 * the stamp and reloads when another server has written since. Roadmap items, banners and
 * performance budgets are read from their indices on every request.
 */
@Injectable()
export class DesignSystemService implements OnModuleInit {
  private readonly logger = new Logger(DesignSystemService.name);

  private analyticsService?: AnalyticsService;

  /** Loaded components and tokens in list order, or null until the first load succeeds */
  private cache: { components: StoredComponent[]; tokens: StoredToken[] } | null = null;
  private loading: Promise<void> | null = null;
  /** The content-version stamp the copy was loaded at, and when it was last compared */
  private loadedStamp: string | undefined;
  private checkedAt = 0;
  private checking: Promise<void> | null = null;

  constructor(
    @Inject(COMPONENT_STORE) private readonly componentStore: DocumentStore<StoredComponent>,
    @Inject(TOKEN_STORE) private readonly tokenStore: DocumentStore<StoredToken>,
    @Inject(DESIGN_SYSTEM_META_STORE) private readonly meta: DocumentStore<DesignSystemMetaDoc>,
    @Inject(ROADMAP_STORE) private readonly roadmapStore: DocumentStore<RoadmapItem>,
    @Inject(BANNER_STORE) private readonly bannerStore: DocumentStore<InfoBanner>,
    @Inject(BUDGET_STORE) private readonly budgetStore: DocumentStore<PerformanceBudget>,
    @Optional() @Inject(ElasticsearchService) private readonly elasticsearchService?: ElasticsearchService,
    @Optional() @Inject(EncryptionService) private readonly encryptionService?: EncryptionService,
  ) {}

  async onModuleInit(): Promise<void> {
    // The app still starts when Elasticsearch is down; reads retry the load
    await this.ready().catch((error) => this.logger.warn(`Design system not loaded yet: ${error.message}`));
  }

  // Set analytics service (called by module to avoid circular dependency)
  setAnalyticsService(analyticsService: AnalyticsService) {
    this.analyticsService = analyticsService;
  }

  /**
   * Resolves once components and tokens are loaded (seeding them on first
   * start), and once a copy that is due a check has caught up with other servers' writes
   */
  ready(): Promise<void> {
    if (this.cache) return this.isDue() ? this.checkForChanges() : Promise.resolve();
    if (!this.loading) {
      this.loading = this.load().finally(() => {
        this.loading = null;
      });
    }
    return this.loading;
  }

  private async load(): Promise<void> {
    await this.ensureSeeded();
    // Read the stamp first: a write that lands during the listing changes it again, so the next check reloads
    const stamp = await this.readStamp();
    const [components, tokens] = await Promise.all([this.componentStore.list(), this.tokenStore.list()]);
    this.cache = {
      components: components.sort((a, b) => byPosition(a, b) || byCreatedAt(a, b)),
      tokens: tokens.sort((a, b) => byPosition(a, b) || byCreatedAt(a, b)),
    };
    this.loadedStamp = stamp;
    this.checkedAt = Date.now();
  }

  private isDue(): boolean {
    return Date.now() - this.checkedAt >= CONTENT_CHECK_INTERVAL_MS;
  }

  private async readStamp(): Promise<string | undefined> {
    return (await this.meta.get(CONTENT_VERSION))?.doc.stamp;
  }

  /**
   * Reloads the copy when the content-version stamp differs from the one it
   * was loaded at. When storage can't be read, the copy is kept and checked again later.
   */
  private checkForChanges(): Promise<void> {
    if (!this.checking) {
      this.checking = (async () => {
        try {
          const stamp = await this.readStamp();
          if (stamp !== this.loadedStamp) await this.load();
          else this.checkedAt = Date.now();
        } catch (error) {
          this.checkedAt = Date.now();
          this.logger.warn(`Could not check for design system changes: ${(error as Error).message}`);
        }
      })().finally(() => {
        this.checking = null;
      });
    }
    return this.checking;
  }

  /**
   * Changes the content-version stamp after a write. When another server
   * changed it at the same time, this copy may have missed that write, so
   * the next check reloads.
   */
  private async bumpContentVersion(): Promise<void> {
    const stamp = randomUUID();
    const now = new Date().toISOString();
    try {
      const stored = await this.meta.get(CONTENT_VERSION);
      const previous = stored?.doc.stamp;
      if (stored) await this.meta.replace({ ...stored.doc, stamp }, stored.version);
      else await this.meta.create({ id: CONTENT_VERSION, createdAt: now, stamp });
      // Only skip the reload when nobody else wrote since this copy was loaded
      this.loadedStamp = previous === this.loadedStamp ? stamp : undefined;
    } catch (error) {
      if (!(error instanceof VersionConflictError) && !(error instanceof DuplicateDocumentError)) {
        this.logger.warn(`Could not record a design system change for other servers: ${(error as Error).message}`);
      }
      this.loadedStamp = undefined;
      this.checkedAt = 0;
    }
  }

  /**
   * Seeds the starting components and tokens (design-system-seed.ts) once.
   * Indexes that already hold documents but have no marker were filled some
   * other way and are left alone. A seed cut short resumes from where it
   * stopped (SEED_STARTED without SEED_DONE). Once SEED_DONE is written the
   * seed never runs again, so a component or token deleted on purpose stays deleted.
   */
  private async ensureSeeded(): Promise<void> {
    if (await this.meta.get(SEED_DONE)) return;
    const resuming = !!(await this.meta.get(SEED_STARTED));
    if (!resuming) {
      const [components, tokens] = await Promise.all([this.componentStore.list(), this.tokenStore.list()]);
      if (components.length || tokens.length) {
        await this.createMeta(SEED_DONE);
        return;
      }
      await this.createMeta(SEED_STARTED);
    }
    const now = new Date().toISOString();
    for (const [position, component] of SEED_COMPONENTS.entries()) {
      await this.createIgnoringDuplicate(this.componentStore, { ...structuredClone(component), position, createdAt: now });
    }
    for (const [position, token] of SEED_TOKENS.entries()) {
      await this.createIgnoringDuplicate(this.tokenStore, { ...structuredClone(token), id: token.name, position, createdAt: now });
    }
    await this.createMeta(SEED_DONE);
    this.logger.log(`Seeded ${SEED_COMPONENTS.length} components and ${SEED_TOKENS.length} tokens`);
  }

  private async createMeta(id: string): Promise<void> {
    await this.createIgnoringDuplicate(this.meta, { id, createdAt: new Date().toISOString() });
  }

  private async createIgnoringDuplicate<T extends { id: string }>(store: DocumentStore<T>, doc: T): Promise<void> {
    try {
      await store.create(doc);
    } catch (error) {
      if (!(error instanceof DuplicateDocumentError)) throw error;
    }
  }

  /** The loaded copy; a 503 (and another load attempt) while it isn't loaded */
  private get loaded(): { components: StoredComponent[]; tokens: StoredToken[] } {
    if (!this.cache) {
      this.ready().catch((error) => this.logger.warn(`Design system not loaded yet: ${error.message}`));
      throw new ServiceUnavailableException('The design system is not available yet, please try again shortly');
    }
    // Synchronous reads answer from the copy and check in the background; awaited ones (ready) wait for the check
    if (this.isDue()) void this.checkForChanges();
    return this.cache;
  }

  /** Copies, so callers can't change the loaded components or tokens by accident */
  private get components(): Component[] {
    return structuredClone(this.loaded.components.map(toComponent));
  }

  private get tokens(): Token[] {
    return structuredClone(this.loaded.tokens.map(toToken));
  }

  /**
   * Reads the component from storage, applies `change` and writes it back
   * (compare-and-swap, retried on a concurrent write), then updates the
   * loaded copy. `change` may throw to reject the write.
   */
  private async updateComponent(id: string, change: (component: StoredComponent) => void): Promise<Component> {
    await this.ready();
    for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
      const stored = await this.componentStore.get(id);
      if (!stored) throw new BadRequestException(`Component '${id}' not found`);
      const doc = stored.doc;
      change(doc);
      try {
        await this.componentStore.replace(doc, stored.version);
      } catch (error) {
        if (error instanceof VersionConflictError) continue;
        throw error;
      }
      this.cacheComponent(doc);
      await this.bumpContentVersion();
      return structuredClone(toComponent(doc));
    }
    throw new ConflictException('The component was changed by someone else at the same time, please try again');
  }

  private cacheComponent(doc: StoredComponent): void {
    const components = this.loaded.components;
    const index = components.findIndex((c) => c.id === doc.id);
    if (index >= 0) components[index] = structuredClone(doc);
    else components.push(structuredClone(doc));
  }

  getAllTokens(category?: string, type?: string, tag?: string): Token[] {
    let filtered = this.tokens;
    
    if (category) {
      filtered = filtered.filter(token => token.category === category);
    }
    
    if (type) {
      filtered = filtered.filter(token => token.type === type);
    }
    
    if (tag) {
      filtered = filtered.filter(token => token.tags?.includes(tag));
    }
    
    return filtered;
  }

  getTokenByName(name: string): Token | undefined {
    const token = this.loaded.tokens.find(token => token.name === name);
    return token && structuredClone(toToken(token));
  }

  getTokensByCategory(category: string): Token[] {
    return this.tokens.filter(token => token.category === category);
  }

  /**
   * Stores a new token after the existing ones; a 409 if one with that name
   * exists. Callers check token:create.
   */
  async createToken(token: Token): Promise<Token> {
    await this.ready();
    const tokens = this.loaded.tokens;
    const doc: StoredToken = {
      ...structuredClone(token),
      id: token.name,
      position: tokens.reduce((max, t) => Math.max(max, t.position), -1) + 1,
      createdAt: new Date().toISOString(),
    };
    try {
      await this.tokenStore.create(doc);
    } catch (error) {
      if (error instanceof DuplicateDocumentError) throw new ConflictException(`Token '${token.name}' already exists`);
      throw error;
    }
    this.cacheToken(doc);
    return structuredClone(toToken(doc));
  }

  /**
   * Changes a token's value (and optionally type, category or description),
   * compare-and-swap like component writes. Callers check token:edit.
   */
  async updateToken(name: string, change: Partial<Pick<Token, 'value' | 'type' | 'category' | 'description'>>): Promise<Token> {
    await this.ready();
    for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
      const stored = await this.tokenStore.get(name);
      if (!stored) throw new NotFoundException(`Token '${name}' not found`);
      const doc = stored.doc;
      assignDefined(doc, change, ['value', 'type', 'category', 'description']);
      try {
        await this.tokenStore.replace(doc, stored.version);
      } catch (error) {
        if (error instanceof VersionConflictError) continue;
        throw error;
      }
      this.cacheToken(doc);
      return structuredClone(toToken(doc));
    }
    throw new ConflictException('The token was changed by someone else at the same time, please try again');
  }

  /** Deletes a token; false when there was none. Callers check token:delete. */
  async deleteToken(name: string): Promise<boolean> {
    await this.ready();
    const deleted = await this.tokenStore.delete(name);
    const tokens = this.loaded.tokens;
    const index = tokens.findIndex((t) => t.id === name);
    if (index >= 0) tokens.splice(index, 1);
    return deleted;
  }

  private cacheToken(doc: StoredToken): void {
    const tokens = this.loaded.tokens;
    const index = tokens.findIndex((t) => t.id === doc.id);
    if (index >= 0) tokens[index] = structuredClone(doc);
    else tokens.push(structuredClone(doc));
  }

  /**
   * Get token relationships - analyzes references, aliases, semantic relationships, and dependencies
   */
  getTokenRelationships(tokenName?: string): {
    nodes: Array<{
      id: string;
      name: string;
      category: string;
      type: string;
      value: string;
      isBase: boolean;
      isAlias: boolean;
    }>;
    edges: Array<{
      from: string;
      to: string;
      type: 'reference' | 'semantic' | 'category' | 'scale';
      strength: number;
    }>;
    relationships: {
      references: Record<string, string[]>;
      referencedBy: Record<string, string[]>;
      semantic: Record<string, string[]>;
      category: Record<string, string[]>;
      scale: Record<string, string[]>;
    };
  } {
    const allTokens = this.getAllTokens();
    const nodes: Array<{
      id: string;
      name: string;
      category: string;
      type: string;
      value: string;
      isBase: boolean;
      isAlias: boolean;
    }> = [];
    const edges: Array<{
      from: string;
      to: string;
      type: 'reference' | 'semantic' | 'category' | 'scale';
      strength: number;
    }> = [];
    const references: Record<string, string[]> = {};
    const referencedBy: Record<string, string[]> = {};
    const semantic: Record<string, string[]> = {};
    const category: Record<string, string[]> = {};
    const scale: Record<string, string[]> = {};

    // Build nodes
    allTokens.forEach(token => {
      const isAlias = this.isTokenReference(token.value);
      const isBase = !isAlias;
      
      nodes.push({
        id: token.name,
        name: token.name,
        category: token.category,
        type: token.type,
        value: token.value,
        isBase,
        isAlias,
      });

      // Initialize relationship maps
      references[token.name] = [];
      referencedBy[token.name] = [];
      semantic[token.name] = [];
      category[token.name] = [];
      scale[token.name] = [];
    });

    // Analyze references/aliases
    allTokens.forEach(token => {
      const referencedTokens = this.extractTokenReferences(token.value);
      referencedTokens.forEach(refTokenName => {
        if (allTokens.find(t => t.name === refTokenName)) {
          references[token.name].push(refTokenName);
          if (!referencedBy[refTokenName]) {
            referencedBy[refTokenName] = [];
          }
          referencedBy[refTokenName].push(token.name);
          
          edges.push({
            from: token.name,
            to: refTokenName,
            type: 'reference',
            strength: 1.0,
          });
        }
      });
    });

    // Analyze semantic relationships (same semantic meaning across categories)
    const semanticGroups: Record<string, string[]> = {};
    allTokens.forEach(token => {
      const semanticKey = this.extractSemanticKey(token.name);
      if (semanticKey) {
        if (!semanticGroups[semanticKey]) {
          semanticGroups[semanticKey] = [];
        }
        semanticGroups[semanticKey].push(token.name);
      }
    });

    Object.values(semanticGroups).forEach(group => {
      if (group.length > 1) {
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            semantic[group[i]].push(group[j]);
            semantic[group[j]].push(group[i]);
            
            edges.push({
              from: group[i],
              to: group[j],
              type: 'semantic',
              strength: 0.5,
            });
          }
        }
      }
    });

    // Analyze category relationships (same category)
    const categoryGroups: Record<string, string[]> = {};
    allTokens.forEach(token => {
      if (!categoryGroups[token.category]) {
        categoryGroups[token.category] = [];
      }
      categoryGroups[token.category].push(token.name);
    });

    Object.entries(categoryGroups).forEach(([cat, tokens]) => {
      if (tokens.length > 1) {
        for (let i = 0; i < tokens.length; i++) {
          for (let j = i + 1; j < tokens.length; j++) {
            category[tokens[i]].push(tokens[j]);
            category[tokens[j]].push(tokens[i]);
            
            edges.push({
              from: tokens[i],
              to: tokens[j],
              type: 'category',
              strength: 0.3,
            });
          }
        }
      }
    });

    // Analyze scale relationships (same scale progression)
    const scaleGroups: Record<string, string[]> = {};
    allTokens.forEach(token => {
      const scaleKey = this.extractScaleKey(token.name);
      if (scaleKey) {
        if (!scaleGroups[scaleKey]) {
          scaleGroups[scaleKey] = [];
        }
        scaleGroups[scaleKey].push(token.name);
      }
    });

    Object.values(scaleGroups).forEach(group => {
      if (group.length > 1) {
        // Sort by scale value if possible
        const sorted = group.sort((a, b) => {
          const aValue = this.extractScaleValue(a);
          const bValue = this.extractScaleValue(b);
          if (aValue !== null && bValue !== null) {
            return aValue - bValue;
          }
          return a.localeCompare(b);
        });

        for (let i = 0; i < sorted.length - 1; i++) {
          scale[sorted[i]].push(sorted[i + 1]);
          scale[sorted[i + 1]].push(sorted[i]);
          
          edges.push({
            from: sorted[i],
            to: sorted[i + 1],
            type: 'scale',
            strength: 0.4,
          });
        }
      }
    });

    // Filter by tokenName if provided
    if (tokenName) {
      const relatedTokens = new Set<string>();
      relatedTokens.add(tokenName);
      
      // Add all related tokens
      [references, referencedBy, semantic, category, scale].forEach(relMap => {
        if (relMap[tokenName]) {
          relMap[tokenName].forEach(t => relatedTokens.add(t));
        }
      });

      const filteredNodes = nodes.filter(n => relatedTokens.has(n.id));
      const filteredEdges = edges.filter(e => 
        relatedTokens.has(e.from) && relatedTokens.has(e.to)
      );

      return {
        nodes: filteredNodes,
        edges: filteredEdges,
        relationships: {
          references,
          referencedBy,
          semantic,
          category,
          scale,
        },
      };
    }

    return {
      nodes,
      edges,
      relationships: {
        references,
        referencedBy,
        semantic,
        category,
        scale,
      },
    };
  }

  /**
   * Get impact analysis for a token - what tokens/components would be affected if this token changes
   */
  getTokenImpactAnalysis(tokenName: string): {
    token: Token | null;
    directlyAffected: string[];
    indirectlyAffected: string[];
    affectedComponents: string[];
    totalImpact: number;
  } {
    const token = this.tokens.find(t => t.name === tokenName);
    if (!token) {
      return {
        token: null,
        directlyAffected: [],
        indirectlyAffected: [],
        affectedComponents: [],
        totalImpact: 0,
      };
    }

    const relationships = this.getTokenRelationships();
    const directlyAffected = relationships.relationships.referencedBy[tokenName] || [];
    
    // Get indirectly affected (tokens that reference the directly affected tokens)
    const indirectlyAffected = new Set<string>();
    directlyAffected.forEach(affectedToken => {
      const subAffected = relationships.relationships.referencedBy[affectedToken] || [];
      subAffected.forEach(t => indirectlyAffected.add(t));
    });

    // Find components that use this token (simplified - in real system would scan component code)
    const affectedComponents: string[] = [];
    this.components.forEach(component => {
      const code = component.code.vue || component.code.react || '';
      if (code.includes(tokenName) || code.includes(`{${tokenName}}`)) {
        affectedComponents.push(component.name);
      }
    });

    return {
      token,
      directlyAffected,
      indirectlyAffected: Array.from(indirectlyAffected),
      affectedComponents,
      totalImpact: directlyAffected.length + indirectlyAffected.size + affectedComponents.length,
    };
  }

  /**
   * Helper: Check if a value is a token reference
   */
  private isTokenReference(value: string): boolean {
    return value.startsWith('{') && value.endsWith('}');
  }

  /**
   * Helper: Extract token references from a value
   */
  private extractTokenReferences(value: string): string[] {
    const references: string[] = [];
    const regex = /\{([^}]+)\}/g;
    let match;
    while ((match = regex.exec(value)) !== null) {
      references.push(match[1]);
    }
    return references;
  }

  /**
   * Helper: Extract semantic key from token name (e.g., "primary", "secondary")
   */
  private extractSemanticKey(tokenName: string): string | null {
    const parts = tokenName.split('.');
    const semanticKeywords = ['primary', 'secondary', 'tertiary', 'success', 'error', 'warning', 'info', 'neutral'];
    for (const part of parts) {
      if (semanticKeywords.includes(part.toLowerCase())) {
        return part.toLowerCase();
      }
    }
    return null;
  }

  /**
   * Helper: Extract scale key from token name (e.g., "color.neutral" from "color.neutral.500")
   */
  private extractScaleKey(tokenName: string): string | null {
    const parts = tokenName.split('.');
    if (parts.length >= 3) {
      // Check if last part is a scale value (number or size like xs, sm, md, lg)
      const lastPart = parts[parts.length - 1];
      const scaleValues = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
      if (scaleValues.includes(lastPart.toLowerCase()) || /^\d+$/.test(lastPart)) {
        return parts.slice(0, -1).join('.');
      }
    }
    return null;
  }

  /**
   * Helper: Extract scale value for sorting
   */
  private extractScaleValue(tokenName: string): number | null {
    const parts = tokenName.split('.');
    const lastPart = parts[parts.length - 1];
    const scaleMap: Record<string, number> = {
      'xs': 1, 'sm': 2, 'md': 3, 'lg': 4, 'xl': 5, '2xl': 6,
      '50': 50, '100': 100, '200': 200, '300': 300, '400': 400,
      '500': 500, '600': 600, '700': 700, '800': 800, '900': 900,
    };
    if (scaleMap[lastPart.toLowerCase()]) {
      return scaleMap[lastPart.toLowerCase()];
    }
    const numMatch = lastPart.match(/^\d+$/);
    if (numMatch) {
      return parseInt(numMatch[0], 10);
    }
    return null;
  }

  getAllComponents(status?: string, workspaceId?: string): Component[] {
    let filtered = this.components;

    // Filter by workspace if provided
    if (workspaceId) {
      filtered = filtered.filter(
        c => c.workspaceId === workspaceId || c.isGlobal || c.sharedWith?.includes(workspaceId),
      );
    }

    // Filter by status if provided
    if (status) {
      filtered = filtered.filter(component => component.status === status);
    }

    return filtered;
  }

  /**
   * Get component variants (both built-in and custom)
   */
  getComponentVariants(componentId: string): ComponentVariant[] {
    const component = this.getComponentById(componentId);
    if (!component) {
      return [];
    }
    
    // Extract built-in variants from props
    const variantProp = component.props.find(p => p.name === 'variant');
    const builtInVariants: ComponentVariant[] = [];
    
    if (variantProp && variantProp.options) {
      variantProp.options.forEach(option => {
        builtInVariants.push({
          name: option,
          description: `Built-in ${option} variant`,
          properties: {}, // Will be generated from code
        });
      });
    }
    
    // Merge with custom variants
    const customVariants = component.variants || [];
    
    return [...builtInVariants, ...customVariants];
  }

  /**
   * Add or update a component variant
   */
  async saveComponentVariant(componentId: string, variant: ComponentVariant): Promise<ComponentVariant> {
    let saved = variant;
    await this.updateComponent(componentId, (component) => {
      saved = { ...structuredClone(variant), generatedCode: this.generateVariantCode(component, variant) };
      component.variants ??= [];

      // Update or add variant
      const existingIndex = component.variants.findIndex(v => v.name === saved.name);
      if (existingIndex >= 0) {
        component.variants[existingIndex] = saved;
      } else {
        component.variants.push(saved);
      }

      // Update variant prop options if needed
      const variantProp = component.props.find(p => p.name === 'variant');
      if (variantProp && !variantProp.options?.includes(saved.name)) {
        variantProp.options ??= [];
        variantProp.options.push(saved.name);
      }
    });
    return saved;
  }

  /**
   * Delete a component variant; false when the component has no such variant
   */
  async deleteComponentVariant(componentId: string, variantName: string): Promise<boolean> {
    await this.ready();
    if (!this.getComponentById(componentId)?.variants?.some(v => v.name === variantName)) {
      return false;
    }
    let deleted = false;
    await this.updateComponent(componentId, (component) => {
      const before = component.variants?.length ?? 0;
      component.variants = (component.variants ?? []).filter(v => v.name !== variantName);
      deleted = component.variants.length < before;
    });
    return deleted;
  }

  /**
   * Generate code for a variant
   */
  private generateVariantCode(component: Component, variant: ComponentVariant): {
    vue?: string;
    react?: string;
    html?: string;
  } {
    const props = variant.properties;
    const classes: string[] = [];
    
    // Build Tailwind classes from properties
    if (props.backgroundColor) {
      if (props.backgroundColor.startsWith('{')) {
        // Token reference - would need to resolve
        classes.push(`bg-[var(--${props.backgroundColor.slice(1, -1).replace(/\./g, '-')})]`);
      } else {
        classes.push(`bg-${props.backgroundColor}`);
      }
    }
    
    if (props.textColor) {
      if (props.textColor.startsWith('{')) {
        classes.push(`text-[var(--${props.textColor.slice(1, -1).replace(/\./g, '-')})]`);
      } else {
        classes.push(`text-${props.textColor}`);
      }
    }
    
    if (props.borderColor) {
      classes.push(`border-${props.borderColor}`);
    }
    
    if (props.borderWidth) {
      classes.push(`border-${props.borderWidth}`);
    }
    
    if (props.borderRadius) {
      classes.push(`rounded-${props.borderRadius}`);
    }
    
    if (props.padding) {
      classes.push(`p-${props.padding}`);
    }
    
    if (props.fontSize) {
      classes.push(`text-${props.fontSize}`);
    }
    
    if (props.fontWeight) {
      classes.push(`font-${props.fontWeight}`);
    }
    
    // Hover states
    if (props.hover) {
      if (props.hover.backgroundColor) {
        classes.push(`hover:bg-${props.hover.backgroundColor}`);
      }
      if (props.hover.textColor) {
        classes.push(`hover:text-${props.hover.textColor}`);
      }
    }
    
    const classString = classes.join(' ');
    
    return {
      vue: `<button class="${classString}">${variant.name}</button>`,
      react: `<button className="${classString}">${variant.name}</button>`,
      html: `<button class="${classString}">${variant.name}</button>`,
    };
  }

  getComponentById(id: string): Component | undefined {
    const component = this.loaded.components.find(component => component.id === id);
    return component && structuredClone(toComponent(component));
  }

  getComponentsByStatus(status: string): Component[] {
    return this.components.filter(component => component.status === status);
  }

  /**
   * Lifecycle changes. Callers authorize first (ComponentAccessService.getForWrite)
   * and pass `visibleIds`, the components the caller may read, so a replacement
   * or dependency can only name a component the caller can see.
   */
  setComponentStatus(id: string, status: ComponentStatus, actorId: string): Promise<Component> {
    return this.updateComponent(id, (component) => {
      component.status = status;
      if (status === 'deprecated') {
        component.deprecation ??= { deprecatedAt: new Date().toISOString(), deprecatedBy: actorId };
      } else {
        delete component.deprecation;
      }
      this.touch(component, actorId);
    });
  }

  /** Marks the component deprecated with its replacement, sunset date, reason and migration guide */
  deprecateComponent(
    id: string,
    details: Omit<ComponentDeprecation, 'deprecatedAt' | 'deprecatedBy'>,
    visibleIds: ReadonlySet<string>,
    actorId: string,
  ): Promise<Component> {
    if (details.replacement !== undefined) {
      if (details.replacement === id) throw new BadRequestException('A component cannot replace itself');
      if (!visibleIds.has(details.replacement)) throw new BadRequestException(`Replacement component '${details.replacement}' not found`);
    }
    return this.updateComponent(id, (component) => {
      const deprecatedAt = component.deprecation?.deprecatedAt ?? new Date().toISOString();
      const deprecatedBy = component.deprecation?.deprecatedBy ?? actorId;
      component.status = 'deprecated';
      component.deprecation = {
        replacement: details.replacement,
        sunsetDate: details.sunsetDate,
        reason: details.reason,
        migrationGuide: details.migrationGuide,
        deprecatedAt,
        deprecatedBy,
      };
      this.touch(component, actorId);
    });
  }

  /**
   * Replaces the component's dependencies. Each must be another component the
   * caller can see, and the graph must stay acyclic.
   */
  setComponentDependencies(id: string, dependencies: string[], visibleIds: ReadonlySet<string>, actorId: string): Promise<Component> {
    const unique = [...new Set(dependencies)];
    return this.updateComponent(id, (component) => {
      for (const dep of unique) {
        if (dep === id) throw new BadRequestException('A component cannot depend on itself');
        if (!visibleIds.has(dep)) throw new BadRequestException(`Dependency '${dep}' not found`);
        if (this.dependsOn(dep, id)) throw new BadRequestException(`'${dep}' already depends on '${id}', so this would create a cycle`);
      }
      component.dependencies = unique;
      this.touch(component, actorId);
    });
  }

  /**
   * Replaces who a workspace component is shared with (the workspaces module
   * checks the caller may do this). Global components aren't also listed as shared.
   */
  setComponentSharing(id: string, sharing: { sharedWith: string[]; isGlobal: boolean }): Promise<Component> {
    return this.updateComponent(id, (component) => {
      component.isGlobal = sharing.isGlobal;
      if (sharing.isGlobal) delete component.sharedWith;
      else component.sharedWith = sharing.sharedWith;
    });
  }

  /** Whether `from` reaches `target` through recorded dependencies */
  private dependsOn(from: string, target: string): boolean {
    const seen = new Set<string>();
    const stack = [from];
    while (stack.length) {
      const current = stack.pop()!;
      if (current === target) return true;
      if (seen.has(current)) continue;
      seen.add(current);
      stack.push(...(this.getComponentById(current)?.dependencies ?? []));
    }
    return false;
  }

  private touch(component: Component, actorId: string): void {
    component.updatedAt = new Date().toISOString();
    component.updatedBy = actorId;
  }

  /**
   * Test coverage for a component.
   *
   * The design system stores no test runs or coverage reports for its
   * components, so there is no coverage to report: the percentages are null and
   * `available` is false. What can be stated truthfully is the component's
   * testable surface, counted from its real prop definitions.
   */
  calculateTestCoverage(componentId: string): {
    componentId: string;
    componentName: string;
    available: boolean;
    reason: string;
    statements: number | null;
    branches: number | null;
    functions: number | null;
    lines: number | null;
    surface: {
      props: number;
      requiredProps: number;
      booleanProps: number;
      enumProps: number;
      enumOptions: number;
      functionProps: number;
      /** One case per prop, plus one per extra enum option and the false state of each boolean */
      suggestedTestCases: number;
    };
  } {
    const component = this.getComponentById(componentId);
    if (!component) {
      throw new BundleComponentNotFound(`Component '${componentId}' not found`);
    }

    const props = component.props || [];
    const enumProps = props.filter(p => Array.isArray(p.options) && p.options.length > 0);
    const booleanProps = props.filter(p => p.type === 'boolean');
    const enumOptions = enumProps.reduce((sum, p) => sum + p.options!.length, 0);
    const suggestedTestCases =
      props.length +
      enumProps.reduce((sum, p) => sum + (p.options!.length - 1), 0) +
      booleanProps.length;

    return {
      componentId: component.id,
      componentName: component.name,
      available: false,
      reason: 'No test runs or coverage reports are recorded for this component, so coverage cannot be reported.',
      statements: null,
      branches: null,
      functions: null,
      lines: null,
      surface: {
        props: props.length,
        requiredProps: props.filter(p => p.required).length,
        booleanProps: booleanProps.length,
        enumProps: enumProps.length,
        enumOptions,
        functionProps: props.filter(p => p.type === 'function').length,
        suggestedTestCases,
      },
    };
  }

  /**
   * Create a new component and auto-link to matching requests. Ids are
   * global: a 409 when one is taken, even by a component the caller can't see.
   */
  async createComponent(data: {
    id: string;
    name: string;
    description: string;
    status?: ComponentStatus;
    props?: ComponentProp[];
    code?: { vue?: string; react?: string; html?: string };
    dependencies?: string[];
    examples?: string[];
    accessibility?: { wcag: string; notes?: string };
    linkedRequestId?: string; // Optional: explicitly link to a specific request
    workspaceId?: string; // Optional: workspace this component belongs to
    isGlobal?: boolean; // Optional: make component available to all workspaces
  }): Promise<Component> {
    await this.ready();
    const component: Component = {
      id: data.id,
      name: data.name,
      description: data.description,
      status: data.status || 'in-progress',
      props: data.props || [],
      code: data.code ? {
        vue: data.code.vue || '',
        react: data.code.react || '',
        html: data.code.html,
      } : { vue: '', react: '' },
      dependencies: data.dependencies || [],
      examples: data.examples || [],
      accessibility: data.accessibility,
      workspaceId: data.workspaceId,
      isGlobal: data.isGlobal || false,
    };

    const loaded = this.loaded.components;
    const doc: StoredComponent = {
      ...structuredClone(component),
      position: loaded.reduce((max, c) => Math.max(max, c.position + 1), 0),
      createdAt: new Date().toISOString(),
    };
    try {
      await this.componentStore.create(doc);
    } catch (error) {
      if (error instanceof DuplicateDocumentError) throw new ConflictException(`A component with id '${data.id}' already exists`);
      throw error;
    }
    this.cacheComponent(doc);
    await this.bumpContentVersion();

    // Auto-link to matching component requests
    // This will be called via ComponentRequestsService if available
    // We'll use a callback pattern to avoid circular dependency
    if (typeof (this as any).onComponentCreatedCallback === 'function') {
      (this as any).onComponentCreatedCallback(component.id, component.name, data.linkedRequestId);
    }

    return component;
  }

  /**
   * Set callback for component creation (called from ComponentRequestsService)
   */
  setComponentCreatedCallback(callback: (componentId: string, componentName: string, linkedRequestId?: string) => void) {
    (this as any).onComponentCreatedCallback = callback;
  }

  // Performance Budgets, oldest first
  async getPerformanceBudgets(): Promise<PerformanceBudget[]> {
    return (await this.budgetStore.list()).sort(byCreatedAt);
  }

  async createPerformanceBudget(name: string, metric: string, threshold: number, unit: string, alertThreshold?: number): Promise<PerformanceBudget> {
    const now = new Date().toISOString();
    const budget: PerformanceBudget = {
      id: `budget_${randomUUID()}`,
      name,
      metric,
      threshold,
      unit,
      alertThreshold,
      enabled: true,
      createdAt: now,
      updatedAt: now,
    };
    await this.budgetStore.create(budget);
    return budget;
  }

  updatePerformanceBudget(id: string, updates: { name?: string; threshold?: number; alertThreshold?: number; enabled?: boolean }): Promise<PerformanceBudget> {
    return this.updateDoc(this.budgetStore, id, 'Performance budget', (budget) => {
      assignDefined(budget, updates, ['name', 'threshold', 'alertThreshold', 'enabled']);
    });
  }

  deletePerformanceBudget(id: string): Promise<boolean> {
    return this.budgetStore.delete(id);
  }

  /**
   * Reads a document, applies `change` and writes it back with
   * compare-and-swap, retrying when someone else wrote it in between. Sets updatedAt.
   */
  private async updateDoc<T extends { id: string; updatedAt: string }>(
    store: DocumentStore<T>,
    id: string,
    label: string,
    change: (doc: T) => void,
  ): Promise<T> {
    for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
      const stored = await store.get(id);
      if (!stored) throw new NotFoundException(`${label} ${id} not found`);
      const doc = stored.doc;
      change(doc);
      doc.updatedAt = new Date().toISOString();
      try {
        await store.replace(doc, stored.version);
        return doc;
      } catch (error) {
        if (!(error instanceof VersionConflictError)) throw error;
      }
    }
    throw new ConflictException(`The ${label.toLowerCase()} was changed by someone else at the same time, please try again`);
  }

  // Bundle Size Analysis: raw, gzip and brotli sizes measured from the stored
  // component source with zlib (see bundle-analysis.service.ts)
  getBundleAnalysis() {
    return analyzeAllBundles(this.components);
  }

  analyzeBundle(componentId?: string, includeDependencies: boolean = true) {
    if (componentId) {
      const component = this.components.find(c => c.id === componentId);
      if (!component) {
        throw new BundleComponentNotFound(`Component '${componentId}' not found`);
      }
      return analyzeComponentBundle(component, this.components, includeDependencies !== false);
    }
    return this.getBundleAnalysis();
  }

  // Roadmap: only the items people have added, oldest first
  async getRoadmap(): Promise<RoadmapItem[]> {
    return (await this.roadmapStore.list()).sort(byCreatedAt);
  }

  async createRoadmapItem(data: { title: string; description: string; category: string; priority: string; targetDate?: string; status?: string }): Promise<RoadmapItem> {
    const now = new Date().toISOString();
    const item: RoadmapItem = {
      id: `roadmap_${randomUUID()}`,
      title: data.title,
      description: data.description,
      category: data.category as RoadmapCategory,
      priority: data.priority as RoadmapPriority,
      status: (data.status || 'planned') as RoadmapStatus,
      targetDate: data.targetDate,
      createdAt: now,
      updatedAt: now,
      votes: 0,
    };
    await this.roadmapStore.create(item);
    return item;
  }

  updateRoadmapItem(id: string, updates: { title?: string; description?: string; category?: string; priority?: string; targetDate?: string; status?: string }): Promise<RoadmapItem> {
    return this.updateDoc(this.roadmapStore, id, 'Roadmap item', (item) => {
      assignDefined(item, updates as Partial<RoadmapItem>, ['title', 'description', 'category', 'priority', 'targetDate', 'status']);
    });
  }

  deleteRoadmapItem(id: string): Promise<boolean> {
    return this.roadmapStore.delete(id);
  }

  // Info Banners, oldest first
  async getAllBanners(): Promise<InfoBanner[]> {
    return (await this.bannerStore.list()).sort(byCreatedAt);
  }

  async getActiveBanners(): Promise<InfoBanner[]> {
    const now = Date.now();
    return (await this.getAllBanners()).filter(banner => {
      if (!banner.isActive) return false;
      if (banner.expiresAt && new Date(banner.expiresAt).getTime() < now) return false;
      return true;
    });
  }

  async getBanner(id: string): Promise<InfoBanner> {
    const stored = await this.bannerStore.get(id);
    if (!stored) throw new NotFoundException(`Banner ${id} not found`);
    return stored.doc;
  }

  async createBanner(data: { title: string; message: string; type: BannerType; expiresAt?: string }): Promise<InfoBanner> {
    const now = new Date().toISOString();
    const banner: InfoBanner = {
      id: `banner-${randomUUID()}`,
      title: data.title,
      message: data.message,
      type: data.type,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      expiresAt: toIsoDate(data.expiresAt),
    };
    await this.bannerStore.create(banner);
    return banner;
  }

  updateBanner(id: string, updates: { title?: string; message?: string; type?: BannerType; isActive?: boolean; expiresAt?: string }): Promise<InfoBanner> {
    return this.updateDoc(this.bannerStore, id, 'Banner', (banner) => {
      assignDefined(banner, updates as Partial<InfoBanner>, ['title', 'message', 'type', 'isActive']);
      // An empty expiresAt clears it
      if (updates.expiresAt !== undefined) {
        const expiresAt = toIsoDate(updates.expiresAt);
        if (expiresAt) banner.expiresAt = expiresAt;
        else delete banner.expiresAt;
      }
    });
  }

  deleteBanner(id: string): Promise<boolean> {
    return this.bannerStore.delete(id);
  }

  // NASA-TLX (NASA Task Load Index)
  async submitNASATLX(data: {
    systemName: string;
    task: string;
    mentalDemand: number;
    physicalDemand: number;
    temporalDemand: number;
    performance: number;
    effort: number;
    frustration: number;
    user: string;
  }) {
    const document = {
      systemName: data.systemName,
      task: data.task,
      mentalDemand: data.mentalDemand,
      physicalDemand: data.physicalDemand,
      temporalDemand: data.temporalDemand,
      performance: data.performance,
      effort: data.effort,
      frustration: data.frustration,
      user: data.user,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    return this.storeSurveyResponse('nasa-tlx', document);
  }

  /**
   * Stores a survey response. Fails with 503 rather than reporting a save that didn't happen.
   */
  private async storeSurveyResponse<T extends object>(index: string, document: T): Promise<T & { id: string }> {
    if (!this.elasticsearchService) {
      throw new ServiceUnavailableException('Survey storage is not configured');
    }
    try {
      const result = await this.elasticsearchService.index({ index, document, refresh: 'wait_for' });
      return { id: result._id, ...document };
    } catch (error) {
      this.logger.error(`Failed to store ${index} response: ${(error as Error).message}`);
      throw new ServiceUnavailableException('Survey storage is unavailable, please try again later');
    }
  }

  // System Usability Scale (SUS)
  async submitSUS(data: {
    systemName: string;
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    q5: number;
    q6: number;
    q7: number;
    q8: number;
    q9: number;
    q10: number;
    user: string;
  }) {
    // Calculate SUS score (0-100)
    // Odd questions: score - 1
    // Even questions: 5 - score
    let score = 0;
    score += (data.q1 - 1) + (5 - data.q2) + (data.q3 - 1) + (5 - data.q4) + (data.q5 - 1);
    score += (5 - data.q6) + (data.q7 - 1) + (5 - data.q8) + (data.q9 - 1) + (5 - data.q10);
    score *= 2.5; // Convert to 0-100 scale

    const document = {
      systemName: data.systemName,
      q1: data.q1,
      q2: data.q2,
      q3: data.q3,
      q4: data.q4,
      q5: data.q5,
      q6: data.q6,
      q7: data.q7,
      q8: data.q8,
      q9: data.q9,
      q10: data.q10,
      score: Math.round(score * 10) / 10, // Round to 1 decimal
      user: data.user,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    return this.storeSurveyResponse('sus-scores', document);
  }

  // Heuristic Evaluation
  async submitHeuristicEvaluation(data: {
    systemName: string;
    evaluator: string;
    heuristics: Array<{ heuristic: string; issues: string; severity: number }>;
    overallAssessment: string;
    timestamp: string;
  }) {
    // Calculate scores
    const totalIssues = data.heuristics.filter(h => h.issues.trim().length > 0).length;
    const criticalIssues = data.heuristics.filter(h => h.severity === 4).length;
    const severities = data.heuristics.map(h => h.severity);
    const avgSeverity = severities.reduce((a, b) => a + b, 0) / severities.length;
    const overallScore = Math.max(0, Math.min(10, 10 - avgSeverity));

    const document = {
      systemName: data.systemName,
      evaluator: data.evaluator,
      heuristics: data.heuristics,
      overallAssessment: data.overallAssessment,
      totalIssues,
      criticalIssues,
      overallScore: Math.round(overallScore * 10) / 10,
      timestamp: data.timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    return this.storeSurveyResponse('heuristic-evaluations', document);
  }

  // Component metadata for Loupe Tool; `components` is what the caller may see
  getComponentMetadata(components: Component[] = this.components, env: NodeJS.ProcessEnv = process.env) {
    const metadata: Record<string, any> = {};
    
    // Lucide icon names for components
    const iconMap: Record<string, string> = {
      'button': 'rectangle-horizontal',
      'card': 'layout-grid',
      'input': 'text-cursor-input',
      'select': 'chevron-down',
      'dropdown': 'chevron-down',
      'navigation': 'navigation',
      'sidebar': 'menu',
      'topnav': 'menu',
      'breadcrumbs': 'chevron-right',
      'table': 'table-2',
      'modal': 'maximize',
      'tooltip': 'info',
      'drawer': 'panel-left-close',
    };

    // Buttons have their own page; every other component is documented in the library at /components.
    // With APP_PUBLIC_URL the link is absolute, so it also works from the standalone Loupe in another app
    const appUrl = env.APP_PUBLIC_URL?.trim().replace(/\/+$/, '');
    const docsLink = (id: string) => `${appUrl || ''}${id === 'button' ? '/components/buttons' : '/components'}`;
    // Source and Figma links only when their templates are configured: `{id}` and `{name}` are filled in
    const fromTemplate = (template: string | undefined, component: Component) =>
      template?.trim()
        ? template.trim().replace(/\{id\}/g, encodeURIComponent(component.id)).replace(/\{name\}/g, encodeURIComponent(component.name))
        : undefined;
    
    components.forEach((component) => {
      const links: Record<string, string> = { docs: docsLink(component.id) };
      const github = fromTemplate(env.COMPONENT_SOURCE_URL_TEMPLATE, component);
      const figma = fromTemplate(env.COMPONENT_FIGMA_URL_TEMPLATE, component);
      if (github) links.github = github;
      if (figma) links.figma = figma;
      metadata[component.id] = {
        name: component.name,
        path: `@design-system/components/${component.id}`,
        icon: iconMap[component.id] || 'blocks',
        links,
      };
    });
    
    return metadata;
  }
}
