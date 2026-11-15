import { ConflictException, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DefaultsSeeder, SeedMarker } from '../common/elasticsearch/seed-defaults';
import { DocumentStore, VersionConflictError } from '../reviews/document-store';
import { isSafeId } from '../workspaces/workspace-access.service';
import { DEFAULT_PATTERNS } from './default-patterns';

/** A pattern's lifecycle stage; the same stages as components */
export const PATTERN_STATUSES = ['production', 'in-progress', 'planned', 'deprecated'] as const;
export type PatternStatus = (typeof PATTERN_STATUSES)[number];

export const PATTERNS_INDEX = 'design-system-patterns';
export const PATTERNS_META_INDEX = 'design-system-patterns-meta';
/** Injection tokens for the pattern store and its seed markers */
export const PATTERN_STORE = Symbol('PATTERN_STORE');
export const PATTERN_META_STORE = Symbol('PATTERN_META_STORE');

/** Written once every default pattern has been seeded */
const SEED_MARKER = 'default-patterns-seeded-v1';

const keyword = { type: 'keyword' };
const date = { type: 'date' };

export const PATTERN_PROPERTIES = {
  id: keyword,
  name: { type: 'keyword', fields: { text: { type: 'text' } } },
  category: keyword,
  status: keyword,
  componentIds: keyword,
  tags: keyword,
  createdAt: date,
  updatedAt: date,
};

export interface ComponentPattern {
  id: string;
  name: string;
  description: string;
  category: 'common' | 'anti-pattern' | 'best-practice' | 'accessibility' | 'performance' | 'composition';
  status: PatternStatus;
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
  createdAt: string;
  updatedAt: string;
}

/** What a caller supplies for a new pattern */
export interface PatternInput {
  name: string;
  description: string;
  category: ComponentPattern['category'];
  status?: PatternStatus;
  componentIds?: string[];
  codeExample?: ComponentPattern['codeExample'];
  useCases?: string[];
  whenToUse?: string;
  whenNotToUse?: string;
  relatedPatterns?: string[];
  tags?: string[];
}

/** A built-in pattern (default-patterns.ts), with the stable id it is seeded under */
export type DefaultPattern = PatternInput & { id: string };

/** Fields the server owns; an update never changes them */
const SERVER_FIELDS = ['id', 'createdAt', 'updatedAt'] as const;

/**
 * The patterns library, stored in Elasticsearch. The default patterns are
 * seeded once; a deleted default stays deleted.
 */
@Injectable()
export class PatternsLibraryService implements OnModuleInit {
  private readonly seeder: DefaultsSeeder<ComponentPattern>;

  constructor(
    @Inject(PATTERN_STORE) private readonly store: DocumentStore<ComponentPattern>,
    @Inject(PATTERN_META_STORE) meta: DocumentStore<SeedMarker>,
  ) {
    this.seeder = new DefaultsSeeder(store, meta, SEED_MARKER, () => {
      const now = new Date().toISOString();
      return DEFAULT_PATTERNS.map((pattern) => this.build(pattern, pattern.id, now));
    });
  }

  onModuleInit(): void {
    this.seeder.seedInBackground();
  }

  /**
   * Create a new pattern
   */
  async createPattern(data: PatternInput): Promise<ComponentPattern> {
    await this.seeder.ensureSeeded();
    const pattern = this.build(data, `pattern-${randomUUID()}`, new Date().toISOString());
    await this.store.create(pattern);
    return pattern;
  }

  /**
   * Get all patterns
   */
  async getAllPatterns(filters?: {
    category?: ComponentPattern['category'];
    tags?: string[];
    search?: string;
  }): Promise<ComponentPattern[]> {
    let patterns = await this.list();

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
  async getPattern(patternId: string): Promise<ComponentPattern | null> {
    if (!isSafeId(patternId)) return null;
    await this.seeder.ensureSeeded();
    return (await this.store.get(patternId))?.doc ?? null;
  }

  /**
   * Get patterns by component ID
   */
  async getPatternsByComponent(componentId: string): Promise<ComponentPattern[]> {
    return (await this.list()).filter(p =>
      p.componentIds && p.componentIds.includes(componentId)
    );
  }

  /**
   * Update pattern. Returns null when there is no such pattern; throws
   * ConflictException when someone else changed it at the same time.
   */
  async updatePattern(patternId: string, updates: Partial<Omit<ComponentPattern, 'id' | 'createdAt'>>): Promise<ComponentPattern | null> {
    if (!isSafeId(patternId)) return null;
    await this.seeder.ensureSeeded();
    const stored = await this.store.get(patternId);
    if (!stored) return null;
    const changes: Record<string, unknown> = { ...updates };
    for (const field of SERVER_FIELDS) delete changes[field];
    const pattern: ComponentPattern = { ...stored.doc, ...changes, updatedAt: new Date().toISOString() };
    try {
      await this.store.replace(pattern, stored.version);
    } catch (error) {
      if (error instanceof VersionConflictError) throw new ConflictException('The pattern was changed by someone else, please reload and try again');
      throw error;
    }
    return pattern;
  }

  /**
   * Delete pattern
   */
  async deletePattern(patternId: string): Promise<boolean> {
    if (!isSafeId(patternId)) return false;
    await this.seeder.ensureSeeded();
    return this.store.delete(patternId);
  }

  /**
   * Get related patterns
   */
  async getRelatedPatterns(patternId: string): Promise<ComponentPattern[]> {
    const pattern = await this.getPattern(patternId);
    if (!pattern || !pattern.relatedPatterns) return [];

    const related = await Promise.all(pattern.relatedPatterns.map((id) => this.getPattern(id)));
    return related.filter((p): p is ComponentPattern => p !== null);
  }

  private async list(): Promise<ComponentPattern[]> {
    await this.seeder.ensureSeeded();
    return this.store.list();
  }

  private build(data: PatternInput, id: string, now: string): ComponentPattern {
    return {
      ...data,
      id,
      // The built-in patterns are published; new ones say where they are
      status: data.status ?? 'production',
      tags: data.tags || [],
      createdAt: now,
      updatedAt: now,
    };
  }
}
