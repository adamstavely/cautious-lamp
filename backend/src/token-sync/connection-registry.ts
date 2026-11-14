import { BadRequestException, NotFoundException, NotImplementedException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { AuthPrincipal, hasPermission } from '../auth/principal';
import { EncryptionService } from '../common/security/encryption.service';
import { Permission } from '../rbac/rbac.service';

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

/**
 * Design-tool connections (design sync and token sync) for one feature.
 * Kept in memory. Credentials are encrypted with EncryptionService and only
 * `hasApiKey` is returned. Each connection belongs to its creator; admin:users
 * holders see all of them.
 */
export class ConnectionRegistry<T extends StoredConnection> {
  private readonly connections = new Map<string, T>();

  constructor(
    private readonly encryption: EncryptionService,
    private readonly idPrefix: string,
    private readonly fields: Record<string, FieldParser>,
    private readonly required: string[],
    private readonly defaults: () => Partial<T>,
  ) {}

  list(principal: AuthPrincipal): Array<PublicConnection<T>> {
    return [...this.connections.values()].filter((c) => this.canSee(principal, c)).map((c) => this.toPublic(c));
  }

  get(principal: AuthPrincipal, id: string): PublicConnection<T> {
    return this.toPublic(this.require(principal, id));
  }

  /** The stored connection (credential still encrypted), after the access check */
  require(principal: AuthPrincipal, id: string): T {
    const connection = typeof id === 'string' ? this.connections.get(id) : undefined;
    if (!connection || !this.canSee(principal, connection)) throw new NotFoundException('Connection not found');
    return connection;
  }

  create(principal: AuthPrincipal, body: unknown): PublicConnection<T> {
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
    this.connections.set(connection.id, connection);
    return this.toPublic(connection);
  }

  update(principal: AuthPrincipal, id: string, body: unknown): PublicConnection<T> {
    const connection = this.require(principal, id);
    const input = this.parse(body);
    Object.assign(connection, input, { updatedAt: new Date().toISOString() });
    this.setApiKey(connection, body);
    return this.toPublic(connection);
  }

  delete(principal: AuthPrincipal, id: string): void {
    this.require(principal, id);
    this.connections.delete(id);
  }

  /** Turns automatic sync off (it can't be turned on; see AUTO_SYNC_UNSUPPORTED) */
  disableAutoSync(principal: AuthPrincipal, id: string): PublicConnection<T> {
    const connection = this.require(principal, id);
    connection.autoSync = false;
    delete (connection as { syncInterval?: number }).syncInterval;
    connection.updatedAt = new Date().toISOString();
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
