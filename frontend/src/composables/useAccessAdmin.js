/**
 * API calls and helpers for the user and role admin pages (docs/AUTH.md).
 * Ids always go into paths through encodeURIComponent.
 */
import apiClient, { apiErrorMessage, errorStatus } from '../services/api.js';

const enc = encodeURIComponent;
const data = (response) => response.data;

/** Minimum password length; the server also caps passwords at 72 bytes (bcrypt). */
export const MIN_PASSWORD_LENGTH = 12;
export const MAX_PASSWORD_BYTES = 72;

export const usersApi = {
  /** { users, total }; q matches email or name, status is 'active' | 'disabled' */
  list: ({ q, status } = {}, config = {}) =>
    apiClient
      .get('/api/v1/users', { ...config, params: { ...(q ? { q } : {}), ...(status ? { status } : {}) } })
      .then(data),
  get: (id) => apiClient.get(`/api/v1/users/${enc(id)}`).then(data),
  create: (body) => apiClient.post('/api/v1/users', body).then(data),
  update: (id, patch) => apiClient.patch(`/api/v1/users/${enc(id)}`, patch).then(data),
  resetPassword: (id, password) => apiClient.post(`/api/v1/users/${enc(id)}/reset-password`, { password }),
  /** [{ workspaceId, name, slug, role }] (workspaces module) */
  workspaces: (id) => apiClient.get(`/api/v1/users/${enc(id)}/workspaces`).then(data),
};

export const rbacApi = {
  roles: () => apiClient.get('/api/v1/rbac/roles').then(data),
  /** [{ value, label, category }] */
  permissions: () => apiClient.get('/api/v1/rbac/permissions').then(data),
  updateRole: (roleId, permissions) => apiClient.put(`/api/v1/rbac/roles/${enc(roleId)}`, { permissions }).then(data),
  /** [{ id, email, name }] */
  members: (roleId) => apiClient.get(`/api/v1/rbac/roles/${enc(roleId)}/users`).then(data),
  userRoles: (userId) => apiClient.get(`/api/v1/rbac/users/${enc(userId)}/roles`).then(data),
  assign: (userId, roleId) => apiClient.post(`/api/v1/rbac/users/${enc(userId)}/roles`, { roleId }).then(data),
  remove: (userId, roleId) => apiClient.delete(`/api/v1/rbac/users/${enc(userId)}/roles/${enc(roleId)}`).then(data),
};

/** A message for a failed admin call. */
export const adminErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error?.response) return `${fallback} The server could not be reached.`;
  if (errorStatus(error) === 503) return 'User and role data is temporarily unavailable. Please try again shortly.';
  return apiErrorMessage(error, fallback);
};

/**
 * Splits a 400's validation messages into per-field errors. Nest messages start
 * with the property name ("email must be an email"); service messages are
 * matched loosely ("Passwords must be…", "Unknown roles: …").
 * Returns { fields: { [field]: message }, general: string | null }.
 */
export const validationErrors = (error, fields) => {
  const result = { fields: {}, general: null };
  if (errorStatus(error) !== 400) return result;
  const raw = error?.response?.data?.message;
  const messages = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const other = [];
  for (const message of messages) {
    const lower = String(message).toLowerCase();
    const field = fields.find((name) => lower.startsWith(name.toLowerCase()) || lower.startsWith(`unknown ${name.toLowerCase()}`));
    if (field && !result.fields[field]) result.fields[field] = message;
    else other.push(message);
  }
  result.general = other.length ? other.join('. ') : null;
  return result;
};

/** Client-side password check matching the server's policy; null when fine. */
export const passwordProblem = (password) => {
  if (!password || password.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) return `Use at most ${MAX_PASSWORD_BYTES} bytes.`;
  return null;
};

// No look-alikes (0/O, 1/l/I) so a password read aloud or retyped survives.
const PASSWORD_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789-_!@#%';

/** A random temporary password from the browser's CSPRNG, without modulo bias. */
export const generatePassword = (length = 20) => {
  const out = [];
  const limit = 256 - (256 % PASSWORD_ALPHABET.length);
  const bytes = new Uint8Array(length * 2);
  while (out.length < length) {
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte < limit) out.push(PASSWORD_ALPHABET[byte % PASSWORD_ALPHABET.length]);
      if (out.length === length) break;
    }
  }
  return out.join('');
};

/** Copies text; resolves true on success. */
export const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/** "13 Nov 2026, 09:14", or the fallback for a missing date. */
export const formatDateTime = (value, fallback = 'Never') => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

/** Groups permission values by category using the /rbac/permissions catalogue, in catalogue order. */
export const groupPermissions = (values, catalogue) => {
  const wanted = new Set(values);
  const groups = new Map();
  for (const permission of catalogue) {
    if (!wanted.has(permission.value)) continue;
    if (!groups.has(permission.category)) groups.set(permission.category, []);
    groups.get(permission.category).push(permission);
  }
  // Permissions the catalogue doesn't know (shouldn't happen) go last, by value
  const known = new Set(catalogue.map((p) => p.value));
  const unknown = values.filter((value) => !known.has(value));
  if (unknown.length) groups.set('Other', unknown.map((value) => ({ value, label: value, category: 'Other' })));
  return [...groups].map(([name, permissions]) => ({ name, permissions }));
};
