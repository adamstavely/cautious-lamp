import { BadRequestException, ConflictException, NotFoundException, NotImplementedException } from '@nestjs/common';
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
  autoSync: false;
  createdAt: string;
  updatedAt: string;
}

/** A connection as returned by the API: no credential, only whether one is set */
export type PublicConnection<T extends StoredConnection> = Omit<T, 'apiKey'> & { hasApiKey: boolean };

/** Checks and normalizes one client-supplied field; throws BadRequestException */
export type FieldParser = (value: unknown) => unknown;

/** Fields the server sets; a client sending them gets a 400 instead of having them silently applied */
const SERVER_FIELDS = ['id', 'owner', 'ownerId', 'createdAt', 'updatedAt', 'lastSync', 'lastSyncVersion', 'syncHistory', 'hasApiKey'];

export const AUTO_SYNC_UNSUPPORTED =
  'Automatic sync is not supported: there is no scheduler or design tool integration on this server yet.';

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
      ...input,
      id: `${this.idPrefix}-${randomBytes(9).toString('hex')}`,
      owner: { type: principal.type, id: principal.id, name: principal.name },
      autoSync: false,
      createdAt: now,
      updatedAt: now,
    } as unknown as T;
    this.setApiKey(connection, body);
    await this.store.create(connection);
    return this.toPublic(connection);
  }

  async update(principal: AuthPrincipal, id: string, body: unknown): Promise<PublicConnection<T>> {
    const { doc: connection, version } = await this.load(principal, id);
    const input = this.parse(body);
    Object.assign(connection, input, { updatedAt: new Date().toISOString() });
    this.setApiKey(connection, body);
    await this.save(connection, version);
    return this.toPublic(connection);
  }

  async delete(principal: AuthPrincipal, id: string): Promise<void> {
    await this.require(principal, id);
    await this.store.delete(id);
  }

  /** Turns automatic sync off (it can't be turned on; see AUTO_SYNC_UNSUPPORTED) */
  async disableAutoSync(principal: AuthPrincipal, id: string): Promise<PublicConnection<T>> {
    const { doc: connection, version } = await this.load(principal, id);
    connection.autoSync = false;
    delete (connection as { syncInterval?: number }).syncInterval;
    connection.updatedAt = new Date().toISOString();
    await this.save(connection, version);
    return this.toPublic(connection);
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
      if (key === 'autoSync' || key === 'syncInterval') {
        if (key === 'autoSync' && value === true) throw new NotImplementedException(AUTO_SYNC_UNSUPPORTED);
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
