import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AuthPrincipal } from '../auth/principal';
import { EncryptionService } from '../common/security/encryption.service';
import { DesignSystemService } from '../design-system/design-system.service';
import { startAutoSyncTimer } from '../design-tools/auto-sync-timer';
import { PreviousMatch, compareComponents } from '../design-tools/component-diff';
import { DESIGN_TOOL_READER, DesignToolReader } from '../design-tools/design-tool-reader';
import { DesignToolError } from '../design-tools/design-tool-http';
import { DesignFileSnapshot, DesignToolComponent, SUPPORTED_DESIGN_TOOLS } from '../design-tools/design-tool.types';
import { SYNC_RUN_STORE, SyncActor, SyncRun, SyncRunLog, SyncRunSummary, newRunId, summarize } from '../design-tools/sync-runs';
import { DocumentStore } from '../reviews/document-store';
import { ConnectionRegistry, PublicConnection, StoredConnection, bool, httpUrl, oneOf, text } from '../token-sync/connection-registry';

export const DESIGN_SYNC_TOOLS = SUPPORTED_DESIGN_TOOLS;
/** Design sync only reads design files; older connections may still say bidirectional, which is read the same way */
export const SYNC_DIRECTIONS = ['design-to-code'] as const;

export const DESIGN_SYNC_CONNECTIONS_INDEX = 'design-system-design-sync-connections';
/** Injection token for the connection store */
export const DESIGN_SYNC_CONNECTION_STORE = Symbol('DESIGN_SYNC_CONNECTION_STORE');

/** As stored in Elasticsearch; `apiKey` is encrypted */
export interface DesignSyncConnection extends StoredConnection {
  name: string;
  tool: (typeof DESIGN_SYNC_TOOLS)[number];
  fileId: string;
  fileUrl?: string;
  enabled: boolean;
  syncDirection: string;
  lastSync?: string;
  lastSyncVersion?: string;
  lastRunId?: string;
  /** Code component id → design node id, set by people */
  componentLinks?: Record<string, string>;
  /** Design node id → the code component it matched last time, to spot renames */
  designMatches?: Record<string, PreviousMatch>;
}

/** As returned by the API: never the credential */
export type DesignSyncConnectionView = PublicConnection<DesignSyncConnection>;

/** What GET /connections/:id/file returns: the file's components and how many tokens it has */
export interface DesignFileView {
  tool: string;
  fileId: string;
  name: string;
  version: string;
  lastModified?: string;
  components: DesignToolComponent[];
  tokenCount: number;
  warnings: string[];
  variables: DesignFileSnapshot['variables'];
}

const SCHEDULER: SyncActor = { type: 'service', id: 'design-sync-scheduler', name: 'Scheduled design sync' };
const actorOf = (principal: AuthPrincipal): SyncActor => ({ type: principal.type, id: principal.id, name: principal.name });

/**
 * Design sync: reads the components and component sets (with their
 * variants) from a Figma or Penpot file and compares them with the
 * library's code components: matched, renamed, missing in code, missing in
 * design. People can link a code component to its design node, which the
 * compare then trusts over names. It only reads: nothing is written to the
 * design file and no code is generated. Each compare is recorded as a run.
 */
@Injectable()
export class DesignSyncService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DesignSyncService.name);
  private readonly registry: ConnectionRegistry<DesignSyncConnection>;
  private stopTimer: () => void = () => undefined;

  constructor(
    encryption: EncryptionService,
    @Inject(DESIGN_SYNC_CONNECTION_STORE) store: DocumentStore<DesignSyncConnection>,
    private readonly designSystemService: DesignSystemService,
    @Inject(DESIGN_TOOL_READER) private readonly reader: DesignToolReader,
    @Inject(SYNC_RUN_STORE) private readonly runs: SyncRunLog,
  ) {
    this.registry = new ConnectionRegistry<DesignSyncConnection>(
      store,
      encryption,
      'sync',
      {
        name: text('name', 200),
        tool: oneOf('tool', DESIGN_SYNC_TOOLS),
        fileId: text('fileId', 300),
        fileUrl: httpUrl('fileUrl'),
        enabled: bool('enabled'),
        syncDirection: oneOf('syncDirection', SYNC_DIRECTIONS),
      },
      ['name', 'tool', 'fileId'],
      () => ({ enabled: true, syncDirection: 'design-to-code' }),
    );
  }

  onModuleInit(): void {
    this.stopTimer = startAutoSyncTimer(this.logger, 'design file compare(s)', (now) => this.runDueAutoSyncs(now));
  }

  onModuleDestroy(): void {
    this.stopTimer();
  }

  getAllConnections(principal: AuthPrincipal): Promise<DesignSyncConnectionView[]> {
    return this.registry.list(principal);
  }

  getConnection(principal: AuthPrincipal, id: string): Promise<DesignSyncConnectionView> {
    return this.registry.get(principal, id);
  }

  createConnection(principal: AuthPrincipal, body: unknown): Promise<DesignSyncConnectionView> {
    return this.registry.create(principal, body);
  }

  updateConnection(principal: AuthPrincipal, id: string, body: unknown): Promise<DesignSyncConnectionView> {
    return this.registry.update(principal, id, body);
  }

  async deleteConnection(principal: AuthPrincipal, id: string): Promise<void> {
    await this.registry.delete(principal, id);
    await this.runs.deleteForConnection(id);
  }

  /** The design file's components, read live; 422 with the reason when it can't be read */
  async fetchDesignFile(principal: AuthPrincipal, connectionId: string): Promise<DesignFileView> {
    const connection = await this.registry.require(principal, connectionId);
    let snapshot: DesignFileSnapshot;
    try {
      snapshot = await this.reader.read(connection, this.registry.credential(connection));
    } catch (error) {
      if (error instanceof DesignToolError) throw new UnprocessableEntityException(error.message);
      throw error;
    }
    const { tokens, ...rest } = snapshot;
    return { ...rest, tokenCount: tokens.length };
  }

  /** Compares the design file with the code components and records the report as a run */
  async sync(principal: AuthPrincipal, connectionId: string, direction?: string): Promise<SyncRun> {
    const connection = await this.registry.require(principal, connectionId);
    if (direction !== undefined && direction !== 'design-to-code') {
      throw new BadRequestException('Design sync only reads design files: writing components to Figma or Penpot is not supported');
    }
    const run = await this.compare(connection, actorOf(principal), 'manual');
    if (run.status === 'failed') throw new UnprocessableEntityException(run.error);
    return run;
  }

  async listRuns(principal: AuthPrincipal, connectionId: string): Promise<SyncRunSummary[]> {
    await this.registry.require(principal, connectionId);
    return (await this.runs.forConnection(connectionId)).filter((r) => r.kind === 'components').map(summarize);
  }

  async getRun(principal: AuthPrincipal, runId: string): Promise<SyncRun> {
    const run = await this.runs.get(runId);
    if (!run || run.kind !== 'components') throw new NotFoundException('Sync run not found');
    await this.registry.require(principal, run.connectionId).catch(() => {
      throw new NotFoundException('Sync run not found');
    });
    return run;
  }

  /**
   * Links a library component to a design node (or unlinks it with a null
   * `designNodeId`); later compares match them whatever their names.
   */
  async setComponentLink(principal: AuthPrincipal, connectionId: string, body: { componentId?: unknown; designNodeId?: unknown }): Promise<DesignSyncConnectionView> {
    await this.registry.require(principal, connectionId);
    const componentId = body?.componentId;
    const designNodeId = body?.designNodeId;
    if (typeof componentId !== 'string' || !this.libraryComponents().some((c) => c.id === componentId)) {
      throw new BadRequestException('componentId must be a library component');
    }
    if (designNodeId !== null && (typeof designNodeId !== 'string' || !designNodeId.trim() || designNodeId.length > 200)) {
      throw new BadRequestException('designNodeId must be a design node id, or null to unlink');
    }
    const updated = await this.registry.patch(connectionId, (c) => {
      const links = { ...(c.componentLinks ?? {}) };
      if (designNodeId === null) delete links[componentId];
      else links[componentId] = (designNodeId as string).trim();
      c.componentLinks = links;
      c.updatedAt = new Date().toISOString();
    });
    return this.registry.toPublic(updated);
  }

  /** File versions seen by this connection's compares, newest first */
  async getFileVersions(principal: AuthPrincipal, connectionId: string): Promise<string[]> {
    await this.registry.require(principal, connectionId);
    const versions = (await this.runs.forConnection(connectionId)).map((r) => r.fileVersion).filter((v): v is string => !!v);
    return [...new Set(versions)];
  }

  async enableAutoSync(principal: AuthPrincipal, connectionId: string, body?: { intervalHours?: unknown }): Promise<DesignSyncConnectionView> {
    return this.registry.enableAutoSync(principal, connectionId, body?.intervalHours);
  }

  disableAutoSync(principal: AuthPrincipal, connectionId: string): Promise<DesignSyncConnectionView> {
    return this.registry.disableAutoSync(principal, connectionId);
  }

  /** Compares every connection whose scheduled compare is due; returns how many this instance ran */
  runDueAutoSyncs(now: Date = new Date()): Promise<number> {
    return this.registry.runDueAutoSyncs(
      now,
      this.logger,
      async (connection) => {
        const run = await this.compare(connection, SCHEDULER, 'scheduled');
        return { error: run.status === 'failed' ? run.error : undefined };
      },
      async (connection, message) => {
        const failed: SyncRun = { ...this.startRun(connection, SCHEDULER, 'scheduled'), finishedAt: new Date().toISOString(), status: 'failed', counts: {}, warnings: [], error: message };
        await this.runs.record(failed);
        await this.registry.patch(connection.id, (c) => {
          c.lastRunId = failed.id;
        });
      },
    );
  }

  private startRun(connection: DesignSyncConnection, actor: SyncActor, trigger: SyncRun['trigger']) {
    // One clock reading for both, so a run's id and start time order runs the same way
    const startedMs = Date.now();
    return {
      id: newRunId(startedMs),
      kind: 'components' as const,
      connectionId: connection.id,
      tool: connection.tool,
      fileId: connection.fileId,
      trigger,
      startedBy: actor,
      startedAt: new Date(startedMs).toISOString(),
    };
  }

  /** Library components only: workspace components aren't compared against a shared design file */
  private libraryComponents(): Array<{ id: string; name: string }> {
    return this.designSystemService
      .getAllComponents()
      .filter((c) => !c.workspaceId || c.isGlobal)
      .map((c) => ({ id: c.id, name: c.name }));
  }

  private async compare(connection: DesignSyncConnection, actor: SyncActor, trigger: SyncRun['trigger']): Promise<SyncRun> {
    const started = this.startRun(connection, actor, trigger);
    let run: SyncRun;
    let matches: Record<string, PreviousMatch> | undefined;
    try {
      const snapshot = await this.reader.read(connection, this.registry.credential(connection));
      const report = compareComponents(snapshot.components, this.libraryComponents(), connection.componentLinks ?? {}, connection.designMatches ?? {});
      matches = report.matches;
      run = {
        ...started,
        fileName: snapshot.name,
        fileVersion: snapshot.version,
        finishedAt: new Date().toISOString(),
        status: 'compared',
        counts: { ...report.counts, design: snapshot.components.length },
        warnings: snapshot.warnings.filter((w) => !/variable|style|token|colour|gradient/i.test(w)),
        componentItems: report.items,
      };
    } catch (error) {
      if (!(error instanceof DesignToolError)) this.logger.error(`Design compare of ${connection.id} failed`, (error as Error).stack);
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
      c.lastRunId = run.id;
      if (run.status === 'failed') return;
      c.lastSync = run.finishedAt;
      if (run.fileVersion) c.lastSyncVersion = run.fileVersion;
      if (matches) c.designMatches = matches;
    });
    return run;
  }
}
