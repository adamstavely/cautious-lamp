import { createHash } from 'crypto';

export const USERS_INDEX = 'design-system-users';

/** Injection token for the users DocumentStore */
export const USER_STORE = Symbol('USER_STORE');

export type UserStatus = 'active' | 'disabled';
export const USER_STATUSES: readonly UserStatus[] = ['active', 'disabled'];

/** As stored in `design-system-users` (docs/AUTH.md) */
export interface UserDoc {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  status: UserStatus;
  mustChangePassword: boolean;
  /** Part of every token; bumping it revokes all of the user's tokens */
  tokenVersion: number;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

/** A user as the API returns it: no hash or token version, plus role ids */
export interface PublicUser {
  id: string;
  email: string;
  name: string;
  status: UserStatus;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  roles: string[];
}

export interface UserSummary {
  id: string;
  email: string;
  name: string;
}

/** GET /auth/me */
export interface Me {
  id: string;
  type: 'user' | 'service';
  email: string | null;
  name: string;
  roles: string[];
  permissions: string[];
  mustChangePassword: boolean;
}

export const MIN_PASSWORD_LENGTH = 12;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * The document id is derived from the email, so two concurrent creates with
 * the same email collide on the id and Elasticsearch's `op_type: create` lets
 * only one through. Emails can't be changed, so the id never has to move.
 */
export function userIdForEmail(email: string): string {
  return `usr_${createHash('sha256').update(normalizeEmail(email)).digest('hex').slice(0, 32)}`;
}

export function toPublicUser(user: UserDoc, roles: string[]): PublicUser {
  const { passwordHash, tokenVersion, ...rest } = user;
  return { ...rest, roles };
}

const keyword = { type: 'keyword' };
const date = { type: 'date' };

export const USER_PROPERTIES = {
  id: keyword,
  email: keyword,
  name: { type: 'keyword', fields: { text: { type: 'text' } } },
  status: keyword,
  mustChangePassword: { type: 'boolean' },
  tokenVersion: { type: 'integer' },
  createdAt: date,
  updatedAt: date,
  lastLoginAt: date,
};
