import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AuthPrincipal, hasPermission } from '../auth/principal';
import { EncryptionService } from '../common/security/encryption.service';
import { DesignSystemService, TokenChangedError } from '../design-system/design-system.service';
import { startAutoSyncTimer } from '../design-tools/auto-sync-timer';
import { DESIGN_TOOL_READER, DesignToolReader } from '../design-tools/design-tool-reader';
import { DesignToolError } from '../design-tools/design-tool-http';
import { SUPPORTED_DESIGN_TOOLS } from '../design-tools/design-tool.types';
import {
  ApplyClaim,
  ItemOutcome,
  ItemResult,
  SYNC_RUN_STORE,
  SyncActor,
  SyncRun,
  SyncRunLog,
  SyncRunSummary,
  isNewerRun,
  newRunId,
  summarize,
} from '../design-tools/sync-runs';
import { BaselineEntry, SYNC_CHOICES, SyncChoice, TokenDiffItem, allowedChoices, diffTokens } from '../design-tools/token-diff';
import { DocumentStore } from '../reviews/document-store';
import { Permission } from '../rbac/rbac.service';
import { ConnectionRegistry, PublicConnection, StoredConnection, bool, httpUrl, oneOf, text } from './connection-registry';

export interface TokenMapping {
  designToolTokenId: string;
  designSystemTokenName: string;
  autoMap?: boolean;
}

/** Tools a connection can be saved for. Adobe XD connections saved earlier still load, and say why they can't sync. */
export const TOKEN_SYNC_TOOLS = SUPPORTED_DESIGN_TOOLS;

export const TOKEN_SYNC_CONNECTIONS_INDEX = 'design-system-token-sync-connections';
/** Injection token for the connection store */
export const TOKEN_SYNC_CONNECTION_STORE = Symbol('TOKEN_SYNC_CONNECTION_STORE');

/** As stored in Elasticsearch; `apiKey` is encrypted */
export interface TokenSyncConnection extends StoredConnection {
  name: string;
  tool: (typeof TOKEN_SYNC_TOOLS)[number] | 'adobe-xd';
  fileId?: string;
  fileUrl?: string;
  enabled: boolean;
  lastSync?: string;
  lastSyncVersion?: string;
  /** The latest pull (isNewerRun), and when it started; an older pull finishing later never replaces it */
  lastRunId?: string;
  lastRunStartedAt?: string;
  /** Explicit names for design tokens whose mapped name isn't the one wanted, by design token id */
  mappings: TokenMapping[];
  /** Each synced token's design and code values when both sides last agreed, for the three-way diff */
  baseline?: Record<string, BaselineEntry>;
}

/** As returned by the API: never the credential or the baseline */
export type TokenSyncConnectionView = Omit<PublicConnection<TokenSyncConnection>, 'baseline'>;

function parseMappings(value: unknown): TokenMapping[] {
  if (!Array.isArray(value) || value.length > 1000) {
    throw new BadRequestException('mappings must be an array of at most 1000 mappings');
  }
  return value.map((m) => {
    const { designToolTokenId, designSystemTokenName, autoMap } = (m ?? {}) as Record<string, unknown>;
    if (typeof designToolTokenId !== 'string' || typeof designSystemTokenName !== 'string' || !designToolTokenId || !designSystemTokenName) {
      throw new BadRequestException('Each mapping needs designToolTokenId and designSystemTokenName');
    }
    return { designToolTokenId, designSystemTokenName, ...(typeof autoMap === 'boolean' ? { autoMap } : {}) };
  });
}

/**
 * How long an apply's claim on a run lasts without progress. Each written item
 * renews it; once it lapses (the server stopped mid-apply), anyone allowed to
 * apply the run can finish it.
 */
export const APPLY_LEASE_MS = 2 * 60_000;

const DRIFTED = 'Changed in code since this diff was made; pull again';

/** Recorded as the starter of scheduled pulls */
const SCHEDULER: SyncActor = { type: 'service', id: 'token-sync-scheduler', name: 'Scheduled token sync' };

const actorOf = (principal: AuthPrincipal): SyncActor => ({ type: principal.type, id: principal.id, name: principal.name });

/**
 * Token sync: pulls colours, typography, spacing, sizing and radii from a
 * Figma or Penpot file, diffs them against the design system's tokens and
 * keeps the diff as a run for review. Applying writes the changes the person
 * chose (take the design value, keep code, or skip) through the design
 * system's token writes, checking token:create, token:edit and token:delete.
 * Scheduled pulls (auto-sync) only produce diffs; nothing is applied without
 * someone choosing it.
 */
@Injectable()
export class TokenSyncService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TokenSyncService.name);
  private readonly registry: ConnectionRegistry<TokenSyncConnection>;
  private stopTimer: () => void = () => undefined;

  constructor(
    private readonly designSystemService: DesignSystemService,
    encryption: EncryptionService,
    @Inject(TOKEN_SYNC_CONNECTION_STORE) store: DocumentStore<TokenSyncConnection>,
    @Inject(DESIGN_TOOL_READER) private readonly reader: DesignToolReader,
    @Inject(SYNC_RUN_STORE) private readonly runs: SyncRunLog,
  ) {
    this.registry = new ConnectionRegistry<TokenSyncConnection>(
      store,
      encryption,
      'conn',
      {
        name: text('name', 200),
        tool: oneOf('tool', TOKEN_SYNC_TOOLS),
        fileId: text('fileId', 300, true),
        fileUrl: httpUrl('fileUrl'),
        enabled: bool('enabled'),
        mappings: parseMappings,
      },
      ['name', 'tool'],
      () => ({ enabled: true, mappings: [] }),
    );
  }

  onModuleInit(): void {
    this.stopTimer = startAutoSyncTimer(this.logger, 'token sync pull(s)', (now) => this.runDueAutoSyncs(now));
  }

  onModuleDestroy(): void {
    this.stopTimer();
  }

  // Connection Management
  async getAllConnections(principal: AuthPrincipal): Promise<TokenSyncConnectionView[]> {
    return (await this.registry.list(principal)).map(view);
  }

  async getConnection(principal: AuthPrincipal, id: string): Promise<TokenSyncConnectionView> {
    return view(await this.registry.get(principal, id));
  }

  async createConnection(principal: AuthPrincipal, body: unknown): Promise<TokenSyncConnectionView> {
    return view(await this.registry.create(principal, body));
  }

  async updateConnection(principal: AuthPrincipal, id: string, body: unknown): Promise<TokenSyncConnectionView> {
    return view(await this.registry.update(principal, id, body));
  }

  async deleteConnection(principal: AuthPrincipal, id: string): Promise<void> {
    await this.registry.delete(principal, id);
    await this.runs.deleteForConnection(id);
  }

  /**
   * Pulls the design file and records the diff against the current tokens as
   * a run waiting for review. Nothing is written to the tokens. A file that
   * can't be read is recorded as a failed run and answers 422 with the reason.
   */
  async syncTokens(principal: AuthPrincipal, connectionId: string): Promise<SyncRun> {
    const connection = await this.registry.require(principal, connectionId);
    const run = await this.pull(connection, actorOf(principal), 'manual');
    if (run.status === 'failed') throw new UnprocessableEntityException(run.error);
    return run;
  }

  /** The connection's runs, newest first, without their diffs */
  async listRuns(principal: AuthPrincipal, connectionId: string): Promise<SyncRunSummary[]> {
    await this.registry.require(principal, connectionId);
    return (await this.runs.forConnection(connectionId)).filter((r) => r.kind === 'tokens').map(summarize);
  }

  async getRun(principal: AuthPrincipal, runId: string): Promise<SyncRun> {
    const run = await this.runs.get(runId);
    if (!run || run.kind !== 'tokens') throw new NotFoundException('Sync run not found');
    await this.registry.require(principal, run.connectionId).catch(() => {
      throw new NotFoundException('Sync run not found');
    });
    return run;
  }

  /**
   * Applies a run's diff with a choice per item (`choices[itemId]`; an item
   * left out gets its default, which is never destructive). Every change is
   * written only if the stored token still has the value the diff was made
   * from, so one changed since then fails instead of being overwritten.
   *
   * The caller first claims the run (compare-and-swap); only the caller whose
   * claim lands writes anything, and everyone else gets a 409. Each item's
   * outcome is recorded as it is written. An apply that stopped part-way (its
   * claim lapsed after APPLY_LEASE_MS) is finished by applying the run again,
   * with the choices it was started with: recorded items are not redone, and
   * an item already holding its design value counts as written.
   */
  async applyRun(principal: AuthPrincipal, runId: string, body: unknown): Promise<SyncRun> {
    const run = await this.getRun(principal, runId);
    const items = run.tokenItems ?? [];
    const now = Date.now();
    const resuming = run.status === 'applying';
    if (resuming && run.claim && Date.parse(run.claim.expiresAt) > now) {
      throw new ConflictException('This diff is being applied by someone else');
    }
    if (!resuming && run.status !== 'review') {
      throw new ConflictException(run.status === 'superseded' ? 'A newer pull replaced this diff; review and apply that one' : 'This diff has already been applied');
    }
    const choices = resuming ? (run.claim?.choices ?? {}) : parseChoices(body, items);
    const plan = items.map((item) => ({ item, choice: choices[item.id] ?? item.defaultChoice }));

    const needed = new Set<Permission>();
    for (const { item, choice } of plan) {
      if (choice !== 'take-design') continue;
      if (item.kind === 'removed') needed.add(Permission.TOKEN_DELETE);
      else needed.add(item.codeValue === undefined ? Permission.TOKEN_CREATE : Permission.TOKEN_EDIT);
    }
    const missing = [...needed].filter((p) => !hasPermission(principal, p));
    if (missing.length) throw new ForbiddenException(`Applying these changes requires ${missing.join(', ')}`);

    // Claim the run: only the caller whose compare-and-swap lands may write
    const claim: ApplyClaim = { token: randomUUID(), by: actorOf(principal), at: new Date(now).toISOString(), expiresAt: leaseFrom(now), choices };
    const previous = run.claim?.token;
    const claimed = await this.runs.update(run.id, (r) => {
      const claimable = resuming ? r.status === 'applying' && r.claim?.token === previous : r.status === 'review';
      if (!claimable) return false;
      r.status = 'applying';
      r.claim = claim;
      if (!resuming) r.progress = [];
    });
    if (!claimed) throw new ConflictException('This diff is being applied by someone else');

    try {
      return await this.finishApply(principal, run, plan, claim, resuming);
    } catch (error) {
      // Let the apply be finished straight away rather than after the lease
      await this.runs
        .update(run.id, (r) => {
          if (r.claim?.token !== claim.token) return false;
          r.claim.expiresAt = new Date().toISOString();
        })
        .catch(() => undefined);
      throw error;
    }
  }

  private async finishApply(
    principal: AuthPrincipal,
    run: SyncRun,
    plan: Array<{ item: TokenDiffItem; choice: SyncChoice }>,
    claim: ApplyClaim,
    resuming: boolean,
  ): Promise<SyncRun> {
    const done = new Map((resuming ? (run.progress ?? []) : []).map((result) => [result.id, result]));
    const results: ItemResult[] = [];
    for (const { item, choice } of plan) {
      const earlier = done.get(item.id);
      if (earlier) {
        results.push(earlier);
        continue;
      }
      const result: ItemResult = { id: item.id, choice, ...(await this.applyItem(item, choice, resuming)) };
      results.push(result);
      await this.holdClaim(run.id, claim, (r) => {
        r.progress = [...(r.progress ?? []).filter((p) => p.id !== result.id), result];
      });
    }

    const counts = { created: 0, updated: 0, deleted: 0, 'kept-code': 0, skipped: 0, failed: 0 } as Record<ItemOutcome, number>;
    for (const result of results) counts[result.outcome]++;
    const now = new Date().toISOString();
    const byId = new Map(plan.map(({ item }) => [item.id, item]));

    // Folding the outcomes into the baseline is idempotent, so a resumed apply can repeat it
    const connection = await this.registry.patch(run.connectionId, (c) => {
      const baseline = { ...(c.baseline ?? {}), ...(run.matched ?? {}) };
      for (const result of results) {
        const item = byId.get(result.id)!;
        if (result.outcome === 'failed' || result.outcome === 'skipped') continue;
        if (item.kind === 'removed') delete baseline[item.id];
        else if (result.outcome === 'kept-code') baseline[item.id] = { design: item.designValue!, code: item.codeValue ?? '' };
        else baseline[item.id] = { design: item.designValue!, code: item.designValue! };
      }
      c.baseline = baseline;
      c.lastSync = now;
      if (run.fileVersion) c.lastSyncVersion = run.fileVersion;
    });

    const status = counts.failed ? 'partial' : 'applied';
    const applied: SyncRun['applied'] = { by: actorOf(principal), at: now, counts, results };
    await this.holdClaim(run.id, claim, (r) => {
      r.status = status;
      r.applied = applied;
      delete r.claim;
      delete r.progress;
    });
    this.logger.log(`Token sync ${run.id} on ${connection.id} applied by ${principal.id}: ${JSON.stringify(counts)}`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { claim: _claim, progress: _progress, ...rest } = run;
    return { ...rest, status, applied };
  }

  /** Writes to the run as the holder of `claim`, renewing it; a 409 if the claim was taken over */
  private async holdClaim(runId: string, claim: ApplyClaim, change: (run: SyncRun) => void): Promise<void> {
    const held = await this.runs.update(runId, (r) => {
      if (r.status !== 'applying' || r.claim?.token !== claim.token) return false;
      change(r);
      if (r.claim) r.claim.expiresAt = leaseFrom(Date.now());
    });
    if (!held) throw new ConflictException('Another apply took over this diff');
  }

  async enableAutoSync(principal: AuthPrincipal, connectionId: string, body?: { intervalHours?: unknown }): Promise<TokenSyncConnectionView> {
    const connection = await this.registry.require(principal, connectionId);
    if (connection.tool === 'adobe-xd') throw new BadRequestException('Adobe XD connections cannot sync');
    return view(await this.registry.enableAutoSync(principal, connectionId, body?.intervalHours));
  }

  async disableAutoSync(principal: AuthPrincipal, connectionId: string): Promise<TokenSyncConnectionView> {
    return view(await this.registry.disableAutoSync(principal, connectionId));
  }

  /** Pulls every connection whose scheduled pull is due; returns how many this instance ran */
  async runDueAutoSyncs(now: Date = new Date()): Promise<number> {
    let ran = 0;
    for (const due of await this.registry.dueForAutoSync(now)) {
      const connection = await this.registry.claimAutoSync(due.id, now);
      if (!connection) continue;
      ran++;
      const run = await this.pull(connection, SCHEDULER, 'scheduled').catch((error) => {
        this.logger.warn(`Scheduled token sync of ${connection.id} failed: ${(error as Error).message}`);
        return null;
      });
      if (run?.status === 'failed') this.logger.warn(`Scheduled token sync of ${connection.id} failed: ${run.error}`);
    }
    return ran;
  }

  /** Reads the file, diffs it and records the run (a failed one when the file can't be read) */
  private async pull(connection: TokenSyncConnection, actor: SyncActor, trigger: SyncRun['trigger']): Promise<SyncRun> {
    const started = {
      id: newRunId(),
      kind: 'tokens' as const,
      connectionId: connection.id,
      tool: connection.tool,
      ...(connection.fileId ? { fileId: connection.fileId } : {}),
      trigger,
      startedBy: actor,
      startedAt: new Date().toISOString(),
    };
    let run: SyncRun;
    try {
      const snapshot = await this.reader.read(connection, this.registry.credential(connection));
      const tokens = snapshot.tokens.map((token) => {
        const mapping = connection.mappings?.find((m) => m.designToolTokenId === token.id);
        return mapping ? { ...token, name: mapping.designSystemTokenName } : token;
      });
      const diff = diffTokens(tokens, this.designSystemService.getAllTokens(), connection.baseline ?? {});
      const count = (kind: TokenDiffItem['kind']) => diff.items.filter((i) => i.kind === kind).length;
      run = {
        ...started,
        fileName: snapshot.name,
        fileVersion: snapshot.version,
        finishedAt: new Date().toISOString(),
        // Nothing to choose: the run is complete, and the agreed values become the baseline below
        status: diff.items.length ? 'review' : 'applied',
        counts: { read: tokens.length, added: count('added'), changed: count('changed'), removed: count('removed'), conflicts: count('conflict'), unchanged: diff.unchanged },
        warnings: [...snapshot.warnings, ...diff.warnings],
        variables: snapshot.variables,
        tokenItems: diff.items,
        matched: diff.matched,
      };
    } catch (error) {
      if (!(error instanceof DesignToolError)) this.logger.error(`Token sync of ${connection.id} failed`, (error as Error).stack);
      run = {
        ...started,
        finishedAt: new Date().toISOString(),
        status: 'failed',
        counts: {},
        warnings: [],
        error: error instanceof DesignToolError ? error.message : 'The design file could not be read (unexpected error; see the server log)',
      };
    }
    await this.runs.record(run);
    await this.registry.patch(connection.id, (c) => {
      if (c.lastRunId && c.lastRunStartedAt && !isNewerRun(run, { id: c.lastRunId, startedAt: c.lastRunStartedAt })) return;
      c.lastRunId = run.id;
      c.lastRunStartedAt = run.startedAt;
      if (run.status === 'applied') {
        c.baseline = { ...(c.baseline ?? {}), ...(run.matched ?? {}) };
        c.lastSync = run.finishedAt;
        if (run.fileVersion) c.lastSyncVersion = run.fileVersion;
      }
    });
    return run;
  }

  /**
   * Writes one chosen change, conditional on the stored token still holding
   * the value the diff was made from. When `resuming`, a token that already
   * holds the design value (this apply wrote it before stopping) counts as written.
   */
  private async applyItem(item: TokenDiffItem, choice: SyncChoice, resuming: boolean): Promise<{ outcome: ItemOutcome; error?: string }> {
    if (choice === 'skip') return { outcome: 'skipped' };
    if (choice === 'keep-code') return { outcome: 'kept-code' };
    const outcome: ItemOutcome = item.kind === 'removed' ? 'deleted' : item.codeValue === undefined ? 'created' : 'updated';
    try {
      if (item.kind === 'removed') {
        await this.designSystemService.deleteToken(item.id, { expectedValue: item.codeValue! });
      } else if (item.codeValue === undefined) {
        await this.designSystemService.createToken({
          name: item.id,
          value: item.designValue!,
          type: item.type,
          category: item.category,
          ...(item.description ? { description: item.description } : {}),
          tags: ['design-sync'],
        });
      } else {
        await this.designSystemService.updateToken(item.id, { value: item.designValue! }, { expectedValue: item.codeValue });
      }
      return { outcome };
    } catch (error) {
      // A create finding the token already there is the same drift as a changed value
      const drifted = error instanceof TokenChangedError || (outcome === 'created' && error instanceof ConflictException);
      if (!drifted) return { outcome: 'failed', error: (error as Error).message };
      if (resuming) {
        const stored = await this.designSystemService.readStoredToken(item.id);
        if (item.kind === 'removed' ? !stored : stored?.value === item.designValue) return { outcome };
      }
      return { outcome: 'failed', error: DRIFTED };
    }
  }
}

const leaseFrom = (ms: number) => new Date(ms + APPLY_LEASE_MS).toISOString();

/** `{ choices: { [itemId]: choice } }`, each a choice the item allows */
function parseChoices(body: unknown, items: TokenDiffItem[]): Record<string, SyncChoice> {
  const raw = (body ?? {}) as { choices?: unknown };
  if (raw.choices === undefined) return {};
  if (!raw.choices || typeof raw.choices !== 'object' || Array.isArray(raw.choices)) throw new BadRequestException('choices must be an object of item id to choice');
  const byId = new Map(items.map((item) => [item.id, item]));
  const out: Record<string, SyncChoice> = {};
  for (const [id, choice] of Object.entries(raw.choices as Record<string, unknown>)) {
    const item = byId.get(id);
    if (!item) throw new BadRequestException(`${id} is not an item in this diff`);
    if (!SYNC_CHOICES.includes(choice as SyncChoice) || !allowedChoices(item.kind).includes(choice as SyncChoice)) {
      throw new BadRequestException(`${id}: choose one of ${allowedChoices(item.kind).join(', ')}`);
    }
    out[id] = choice as SyncChoice;
  }
  return out;
}

function view(connection: PublicConnection<TokenSyncConnection>): TokenSyncConnectionView {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { baseline, ...rest } = connection;
  return rest;
}
