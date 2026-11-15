import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { AuthPrincipal, hasPermission } from '../auth/principal';
import { EncryptionService } from '../common/security/encryption.service';
import { Permission } from '../rbac/rbac.service';
import { DocVersion, DocumentStore, VersionConflictError } from '../reviews/document-store';
import { isSafeId } from '../workspaces/workspace-access.service';

/** Who created a connection; only they (and admin:users holders) can see or change it */
export interface ConnectionOwner {
  type: 'user' | 'service';
  id: string;
  name: string;
}

/** Fields every stored connection has. `apiKey` is encrypted and never leaves the server. */
export interface StoredConnection {
  id: string;
  owner: ConnectionOwner;
  apiKey?: string;
  /** Pull the design file on a schedule and keep the diff for review; never applies anything */
  autoSync: boolean;
  /** Hours between scheduled pulls (default 24) */
  syncIntervalHours?: number;
  /** When the next scheduled pull is due; set while autoSync is on */
  nextAutoSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** A connection as returned by the API: no credential, only whether one is set */
export type PublicConnection<T extends StoredConnection> = Omit<T, 'apiKey'> & { hasApiKey: boolean };

/** Checks and normalizes one client-supplied field; throws BadRequestException */
export type FieldParser = (value: unknown) => unknown;

/** Fields the server sets; a client sending them gets a 400 instead of having them silently applied */
const SERVER_FIELDS = [
  'id',
  'owner',
  'ownerId',
  'createdAt',
  'updatedAt',
  'lastSync',
  'lastSyncVersion',
  'lastRunId',
  'syncHistory',
  'hasApiKey',
  'nextAutoSyncAt',
  'baseline',
  'designMatches',
  'componentLinks',
];

export const DEFAULT_SYNC_INTERVAL_HOURS = 24;
const HOUR_MS = 60 * 60 * 1000;
const MAX_WRITE_ATTEMPTS = 5;

const keyword = { type: 'keyword' };

/** Mapping for a connection index; everything else stays in `_source` */
export const CONNECTION_PROPERTIES = {
  id: keyword,
  name: keyword,
  tool: keyword,
  owner: { properties: { type: keyword, id: keyword } },
  createdAt: { type: 'date' },
  updatedAt: { type: 'date' },
};

/**
 * Design-tool connections (design sync and token sync) for one feature,
 * stored in Elasticsearch. Credentials are encrypted with EncryptionService
 * before they are stored, and only `hasApiKey` is returned. Each connection
 * belongs to its creator; admin:users holders see all of them.
 */
export class ConnectionRegistry<T extends StoredConnection> {
  constructor(
    private readonly store: DocumentStore<T>,
    private readonly encryption: EncryptionService,
    private readonly idPrefix: string,
    private readonly fields: Record<string, FieldParser>,
    private readonly required: string[],
    private readonly defaults: () => Partial<T>,
  ) {}

  async list(principal: AuthPrincipal): Promise<Array<PublicConnection<T>>> {
    const connections = await this.store.list();
    return connections.filter((c) => this.canSee(principal, c)).map((c) => this.toPublic(c));
  }

  async get(principal: AuthPrincipal, id: string): Promise<PublicConnection<T>> {
    return this.toPublic(await this.require(principal, id));
  }

  /** The stored connection (credential still encrypted), after the access check */
  async require(principal: AuthPrincipal, id: string): Promise<T> {
    return (await this.load(principal, id)).doc;
  }

  async create(principal: AuthPrincipal, body: unknown): Promise<PublicConnection<T>> {
    const input = this.parse(body);
    for (const field of this.required) {
      if (input[field] === undefined) throw new BadRequestException(`${field} is required`);
    }
    const now = new Date().toISOString();
    const connection = {
      ...this.defaults(),
      autoSync: false,
      ...input,
      id: `${this.idPrefix}-${randomBytes(9).toString('hex')}`,
      owner: { type: principal.type, id: principal.id, name: principal.name },
      createdAt: now,
      updatedAt: now,
    } as unknown as T;
    this.scheduleAutoSync(connection, new Date(now));
    this.setApiKey(connection, body);
    await this.store.create(connection);
    return this.toPublic(connection);
  }

  async update(principal: AuthPrincipal, id: string, body: unknown): Promise<PublicConnection<T>> {
    const { doc: connection, version } = await this.load(principal, id);
    const input = this.parse(body);
    const now = new Date();
    Object.assign(connection, input, { updatedAt: now.toISOString() });
    this.scheduleAutoSync(connection, now);
    this.setApiKey(connection, body);
    await this.save(connection, version);
    return this.toPublic(connection);
  }

  async delete(principal: AuthPrincipal, id: string): Promise<void> {
    await this.require(principal, id);
    await this.store.delete(id);
  }

  /** Turns scheduled pulls on (every `intervalHours`, default 24); the first is due straight away */
  async enableAutoSync(principal: AuthPrincipal, id: string, intervalHours?: unknown): Promise<PublicConnection<T>> {
    const { doc: connection, version } = await this.load(principal, id);
    if (intervalHours !== undefined) connection.syncIntervalHours = hours(intervalHours) as number;
    connection.autoSync = true;
    connection.updatedAt = new Date().toISOString();
    this.scheduleAutoSync(connection, new Date());
    await this.save(connection, version);
    return this.toPublic(connection);
  }

  async disableAutoSync(principal: AuthPrincipal, id: string): Promise<PublicConnection<T>> {
    const { doc: connection, version } = await this.load(principal, id);
    connection.autoSync = false;
    delete (connection as { syncInterval?: number }).syncInterval;
    connection.updatedAt = new Date().toISOString();
    this.scheduleAutoSync(connection, new Date());
    await this.save(connection, version);
    return this.toPublic(connection);
  }

  /** Connections whose scheduled pull is due, across every owner (for the scheduler) */
  async dueForAutoSync(now: Date): Promise<T[]> {
    // Filtered here: indices created before autoSync was mapped can't be queried on it
    const connections = await this.store.list();
    return connections.filter((c) => c.autoSync && (c as { enabled?: boolean }).enabled !== false && !!c.nextAutoSyncAt && new Date(c.nextAutoSyncAt) <= now);
  }

  /**
   * Claims a due scheduled pull by moving its next due time on with a
   * compare-and-swap write, so only one instance runs it. Null when it
   * isn't due any more or another instance claimed it first.
   */
  async claimAutoSync(id: string, now: Date): Promise<T | null> {
    const stored = await this.store.get(id);
    if (!stored) return null;
    const connection = stored.doc;
    if (!connection.autoSync || !connection.nextAutoSyncAt || new Date(connection.nextAutoSyncAt) > now) return null;
    connection.nextAutoSyncAt = new Date(now.getTime() + (connection.syncIntervalHours ?? DEFAULT_SYNC_INTERVAL_HOURS) * HOUR_MS).toISOString();
    try {
      await this.store.replace(connection, stored.version);
      return connection;
    } catch (error) {
      if (error instanceof VersionConflictError) return null;
      throw error;
    }
  }

  /**
   * Changes server-set fields (sync results, baselines, links) on a stored
   * connection, compare-and-swap, retried on a concurrent write. No access
   * check: callers have already loaded the connection for the principal.
   */
  async patch(id: string, change: (connection: T) => void): Promise<T> {
    for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
      const stored = await this.store.get(id);
      if (!stored) throw new NotFoundException('Connection not found');
      change(stored.doc);
      try {
        await this.store.replace(stored.doc, stored.version);
        return stored.doc;
      } catch (error) {
        if (error instanceof VersionConflictError) continue;
        throw error;
      }
    }
    throw new ConflictException('The connection was changed by someone else at the same time, please try again');
  }

  /** The decrypted credential, for a provider integration */
  credential(connection: T): string | undefined {
    return connection.apiKey ? this.encryption.decrypt(connection.apiKey) : undefined;
  }

  toPublic(connection: T): PublicConnection<T> {
    const { apiKey, ...rest } = connection;
    return { ...rest, hasApiKey: !!apiKey } as PublicConnection<T>;
  }

  /** The stored connection and its version; someone else's is "not found" */
  private async load(principal: AuthPrincipal, id: string): Promise<{ doc: T; version: DocVersion }> {
    const stored = isSafeId(id) ? await this.store.get(id) : null;
    if (!stored || !this.canSee(principal, stored.doc)) throw new NotFoundException('Connection not found');
    return stored;
  }

  private async save(connection: T, version: DocVersion): Promise<void> {
    try {
      await this.store.replace(connection, version);
    } catch (error) {
      if (error instanceof VersionConflictError) throw new ConflictException('The connection was changed by someone else, please reload and try again');
      throw error;
    }
  }

  /** Due now when automatic sync is (still) on and nothing is scheduled; cleared when it is off */
  private scheduleAutoSync(connection: T, now: Date): void {
    if (!connection.autoSync) delete connection.nextAutoSyncAt;
    else if (!connection.nextAutoSyncAt) connection.nextAutoSyncAt = now.toISOString();
  }

  private canSee(principal: AuthPrincipal, connection: T): boolean {
    if (hasPermission(principal, Permission.ADMIN_USERS)) return true;
    return connection.owner.type === principal.type && connection.owner.id === principal.id;
  }

  /** Non-empty `apiKey` replaces the credential, `null` clears it, empty or missing keeps it */
  private setApiKey(connection: T, body: unknown): void {
    const apiKey = (body as { apiKey?: unknown }).apiKey;
    if (apiKey === null) delete connection.apiKey;
    else if (typeof apiKey === 'string' && apiKey.trim()) connection.apiKey = this.encryption.encrypt(apiKey.trim());
    else if (apiKey !== undefined && apiKey !== '') throw new BadRequestException('apiKey must be a string');
  }

  private parse(body: unknown): Record<string, unknown> {
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new BadRequestException('Expected a JSON object');
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
      if (key === 'apiKey') continue;
      // An old client's interval field; syncIntervalHours replaced it
      if (key === 'syncInterval') continue;
      if (key === 'autoSync') {
        out.autoSync = bool('autoSync')(value);
        continue;
      }
      if (key === 'syncIntervalHours') {
        out.syncIntervalHours = hours(value);
        continue;
      }
      if (SERVER_FIELDS.includes(key)) throw new BadRequestException(`${key} is set by the server`);
      const parser = this.fields[key];
      if (!parser) throw new BadRequestException(`Unknown field ${key}`);
      if (value === undefined) continue;
      out[key] = parser(value);
    }
    return out;
  }
}

// ---------- Field parsers ----------

export function text(field: string, max = 500, optional = false): FieldParser {
  return (value) => {
    if (optional && (value === null || value === '')) return undefined;
    if (typeof value !== 'string' || !value.trim() || value.length > max) {
      throw new BadRequestException(`${field} must be a non-empty string of at most ${max} characters`);
    }
    return value.trim();
  };
}

export function oneOf<V extends string>(field: string, values: readonly V[]): FieldParser {
  return (value) => {
    if (!values.includes(value as V)) throw new BadRequestException(`${field} must be one of ${values.join(', ')}`);
    return value;
  };
}

/** Hours between scheduled pulls: a whole number from 1 to 168 (a week) */
function hours(value: unknown): unknown {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 168) {
    throw new BadRequestException('syncIntervalHours must be a whole number of hours from 1 to 168');
  }
  return value;
}

export function bool(field: string): FieldParser {
  return (value) => {
    if (typeof value !== 'boolean') throw new BadRequestException(`${field} must be true or false`);
    return value;
  };
}

export function httpUrl(field: string): FieldParser {
  return (value) => {
    if (value === null || value === '') return undefined;
    let url: URL;
    try {
      url = new URL(String(value));
    } catch {
      throw new BadRequestException(`${field} must be a URL`);
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new BadRequestException(`${field} must be an http(s) URL`);
    return url.toString();
  };
}
