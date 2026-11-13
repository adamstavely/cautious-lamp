import { BadRequestException, ConflictException, Inject, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AuthPrincipal } from '../auth/principal';
import { DocumentStore, DuplicateDocumentError, VersionConflictError } from '../reviews/document-store';
import { BUILTIN_RULES } from './builtin-rules';
import { META_STORE, MetaDoc, RULE_STORE } from './governance-stores';
import { GovernanceRule, RuleCategory, RuleDefinition, RuleSeverity } from './governance.types';
import { normalizeRuleDefinition } from './rule-validation';

const SEED_MARKER = 'builtin-rules-seeded-v1';

export const RULES_EXPORT_FORMAT = 'cautious-lamp-governance-rules';

const actorName = (principal: AuthPrincipal) => (principal.type === 'user' ? principal.email : `service:${principal.id}`);

/** Persisted compliance rules: CRUD, import/export and the one-time built-in seed */
@Injectable()
export class RulesService implements OnModuleInit {
  private readonly logger = new Logger(RulesService.name);
  private seeded: Promise<void> | null = null;

  constructor(
    @Inject(RULE_STORE) private readonly store: DocumentStore<GovernanceRule>,
    @Inject(META_STORE) private readonly meta: DocumentStore<MetaDoc>,
  ) {}

  onModuleInit(): void {
    // Not awaited: the app starts without Elasticsearch; seeding retries on first use
    this.ensureSeeded().catch((error) => this.logger.warn(`Built-in rules not seeded yet: ${error.message}`));
  }

  /**
   * Seeds the built-in rules once per cluster. The marker is created first
   * with op_type=create, so only one instance seeds, and rules an admin later
   * deletes stay deleted.
   */
  ensureSeeded(): Promise<void> {
    if (!this.seeded) {
      this.seeded = this.seed().catch((error) => {
        this.seeded = null;
        throw error;
      });
    }
    return this.seeded;
  }

  private async seed(): Promise<void> {
    const now = new Date().toISOString();
    try {
      await this.meta.create({ id: SEED_MARKER, createdAt: now });
    } catch (error) {
      if (error instanceof DuplicateDocumentError) return;
      throw error;
    }
    for (const { id, ...definition } of BUILTIN_RULES) {
      const rule: GovernanceRule = {
        ...normalizeRuleDefinition(definition),
        id,
        builtIn: true,
        version: 1,
        createdAt: now,
        updatedAt: now,
        createdBy: 'system',
        updatedBy: 'system',
      };
      try {
        await this.store.create(rule);
      } catch (error) {
        if (!(error instanceof DuplicateDocumentError)) throw error;
      }
    }
    this.logger.log(`Seeded ${BUILTIN_RULES.length} built-in governance rules`);
  }

  async list(filter: { category?: RuleCategory; enabledOnly?: boolean } = {}): Promise<GovernanceRule[]> {
    await this.ensureSeeded();
    let rules = await this.store.list();
    if (filter.category) rules = rules.filter((rule) => rule.category === filter.category);
    if (filter.enabledOnly) rules = rules.filter((rule) => rule.enabled);
    return rules.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  }

  async get(id: string): Promise<GovernanceRule> {
    const found = await this.store.get(id);
    if (!found) throw new NotFoundException(`Rule ${id} not found`);
    return found.doc;
  }

  async create(definition: RuleDefinition, principal: AuthPrincipal, id = `rule-${randomUUID()}`): Promise<GovernanceRule> {
    await this.ensureSeeded();
    const now = new Date().toISOString();
    const rule: GovernanceRule = {
      ...normalizeRuleDefinition(definition),
      id,
      builtIn: false,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: actorName(principal),
      updatedBy: actorName(principal),
    };
    try {
      await this.store.create(rule);
    } catch (error) {
      if (error instanceof DuplicateDocumentError) throw new ConflictException(`Rule ${id} already exists`);
      throw error;
    }
    return rule;
  }

  /** Replaces a rule's definition. `expectedVersion`, when given, must match the stored version. */
  async update(id: string, definition: RuleDefinition, principal: AuthPrincipal, expectedVersion?: number): Promise<GovernanceRule> {
    const normalized = normalizeRuleDefinition(definition);
    return this.mutate(id, expectedVersion, (current) => ({ ...this.keepMeta(current), ...normalized }), principal);
  }

  /** Toggles enabled or changes severity without resending the whole rule */
  async patch(id: string, changes: { enabled?: boolean; severity?: RuleSeverity }, principal: AuthPrincipal, expectedVersion?: number): Promise<GovernanceRule> {
    return this.mutate(id, expectedVersion, (current) => ({
      ...current,
      ...(changes.enabled !== undefined ? { enabled: changes.enabled } : {}),
      ...(changes.severity !== undefined ? { severity: changes.severity } : {}),
    }), principal);
  }

  async delete(id: string): Promise<void> {
    if (!(await this.store.delete(id))) throw new NotFoundException(`Rule ${id} not found`);
  }

  async export(): Promise<{ format: string; formatVersion: number; exportedAt: string; rules: GovernanceRule[] }> {
    return { format: RULES_EXPORT_FORMAT, formatVersion: 1, exportedAt: new Date().toISOString(), rules: await this.list() };
  }

  /**
   * Imports rules: each one is validated first (nothing is written if any is
   * invalid), then created or updated by id. `replace` also deletes rules that
   * aren't in the import.
   */
  async import(
    rules: Array<RuleDefinition & { id?: string }>,
    mode: 'merge' | 'replace',
    principal: AuthPrincipal,
  ): Promise<{ created: number; updated: number; deleted: number }> {
    await this.ensureSeeded();
    const normalized = rules.map((rule, index) => {
      try {
        return { id: rule.id, definition: normalizeRuleDefinition(rule) };
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw new BadRequestException(`Rule ${index + 1} (${rule.name ?? 'unnamed'}): ${error.message}`);
        }
        throw error;
      }
    });
    const ids = normalized.map((r) => r.id).filter(Boolean);
    if (new Set(ids).size !== ids.length) throw new ConflictException('The import contains the same rule id twice');

    let created = 0;
    let updated = 0;
    const keep = new Set<string>();
    for (const { id, definition } of normalized) {
      if (id && (await this.store.get(id))) {
        await this.update(id, definition, principal);
        updated++;
        keep.add(id);
      } else {
        const rule = await this.create(definition, principal, id ?? undefined);
        created++;
        keep.add(rule.id);
      }
    }
    let deleted = 0;
    if (mode === 'replace') {
      for (const rule of await this.store.list()) {
        if (!keep.has(rule.id) && (await this.store.delete(rule.id))) deleted++;
      }
    }
    return { created, updated, deleted };
  }

  private keepMeta(current: GovernanceRule) {
    const { id, builtIn, version, createdAt, updatedAt, createdBy, updatedBy } = current;
    return { id, builtIn, version, createdAt, updatedAt, createdBy, updatedBy };
  }

  private async mutate(
    id: string,
    expectedVersion: number | undefined,
    change: (current: GovernanceRule) => GovernanceRule,
    principal: AuthPrincipal,
  ): Promise<GovernanceRule> {
    for (let attempt = 0; attempt < 3; attempt++) {
      const found = await this.store.get(id);
      if (!found) throw new NotFoundException(`Rule ${id} not found`);
      if (expectedVersion !== undefined && found.doc.version !== expectedVersion) {
        throw new ConflictException(`Rule ${id} was changed by someone else (now version ${found.doc.version}); reload and try again`);
      }
      const next: GovernanceRule = {
        ...change(found.doc),
        id,
        version: found.doc.version + 1,
        updatedAt: new Date().toISOString(),
        updatedBy: actorName(principal),
      };
      try {
        await this.store.replace(next, found.version);
        return next;
      } catch (error) {
        if (error instanceof VersionConflictError && expectedVersion === undefined) continue;
        if (error instanceof VersionConflictError) throw new ConflictException(`Rule ${id} was changed by someone else; reload and try again`);
        throw error;
      }
    }
    throw new ConflictException(`Rule ${id} is being changed concurrently; try again`);
  }
}
