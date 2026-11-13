/**
 * Sign-in session (docs/AUTH.md).
 *
 * People sign in with email and password and get a bearer token, kept in
 * sessionStorage (so it ends with the tab). The signed-in user and their RBAC
 * permissions come from GET /api/v1/auth/me. Permissions only decide what the
 * UI shows; the server enforces them.
 *
 * With VITE_USE_MOCKS=true there is no backend: a local demo user with every
 * permission is signed in.
 *
 * This module deliberately uses plain axios (not apiClient) so the apiClient
 * interceptors can depend on it without a cycle.
 */

import axios from 'axios';
import { reactive } from 'vue';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const AUTH_PATH = `${API_BASE_URL}/api/v1/auth`;
const TOKEN_KEY = 'authToken';
const EXPIRES_KEY = 'authTokenExpiresAt';
const MOCK_SIGNED_OUT_KEY = 'mockSignedOut';

/** Mirrors mockData.isMockMode() (not imported, to keep this module free of cycles). */
export const isMockAuth = () => import.meta.env.VITE_USE_MOCKS === 'true';

/** The demo user for VITE_USE_MOCKS. Matches the demo review data (mockData.js). */
const DEMO_USER = Object.freeze({
  id: 'usr_demo',
  type: 'user',
  email: 'sarah@example.com',
  name: 'Sarah Johnson',
  roles: ['designer'],
  permissions: ['*'],
  mustChangePassword: false,
});

const storage = {
  get(key) {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      if (value === null || value === undefined) sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, value);
    } catch {
      // sessionStorage unavailable (private mode): the session lasts until reload
    }
  },
};

const readStoredToken = () => {
  const token = storage.get(TOKEN_KEY);
  const expiresAt = storage.get(EXPIRES_KEY);
  if (!token) return { token: null, expiresAt: null };
  if (expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
    storage.set(TOKEN_KEY, null);
    storage.set(EXPIRES_KEY, null);
    return { token: null, expiresAt: null };
  }
  return { token, expiresAt };
};

const initialMockUser = () => (isMockAuth() && storage.get(MOCK_SIGNED_OUT_KEY) !== 'true' ? { ...DEMO_USER } : null);

/** Shared reactive auth state. Read it through useAuth(). */
export const authState = reactive({
  ...readStoredToken(),
  /** The `Me` object from /auth/me, or null when signed out / not loaded yet */
  user: initialMockUser(),
});

let mePromise = null;
let router = null;

/** main.js registers the router so a 401 anywhere can send the user to /login. */
export const setAuthRouter = (instance) => {
  router = instance;
};

const tokenExpired = () => !!authState.expiresAt && new Date(authState.expiresAt).getTime() <= Date.now();

/** The current access token, or null. */
export const getToken = () => {
  if (isMockAuth()) return null;
  if (authState.token && tokenExpired()) clearSession();
  return authState.token;
};

/** `{ Authorization: 'Bearer …' }` for the signed-in user, or `{}` when signed out. */
export const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/** True when someone is signed in (and /auth/me has loaded). */
export const isSignedIn = () => !!authState.user;

/** Whether the signed-in user has an RBAC permission. False when signed out. */
export const hasPermission = (permission) => {
  const permissions = authState.user?.permissions;
  if (!Array.isArray(permissions)) return false;
  return permissions.includes('*') || permissions.includes(permission);
};

/** Forget the token and user (no server call). */
export function clearSession() {
  authState.token = null;
  authState.expiresAt = null;
  authState.user = null;
  mePromise = null;
  storage.set(TOKEN_KEY, null);
  storage.set(EXPIRES_KEY, null);
}

const storeSession = ({ accessToken, expiresAt, user }) => {
  authState.token = accessToken;
  authState.expiresAt = expiresAt || null;
  authState.user = user || null;
  storage.set(TOKEN_KEY, accessToken);
  storage.set(EXPIRES_KEY, expiresAt || null);
};

/**
 * Sign in. Resolves to the user (`Me`). Rejects with the axios error:
 * `401` bad email or password, `423` locked.
 */
export async function login(email, password) {
  if (isMockAuth()) {
    storage.set(MOCK_SIGNED_OUT_KEY, null);
    authState.user = { ...DEMO_USER };
    return authState.user;
  }
  const response = await axios.post(`${AUTH_PATH}/login`, { email, password });
  storeSession(response.data);
  if (!authState.user) await refreshMe();
  return authState.user;
}

/**
 * Load the signed-in user from /auth/me. Resolves to the user, or null when
 * there is no token or the server rejects it (401). Other failures (network,
 * 5xx) reject, so callers can fail closed.
 */
export async function refreshMe() {
  if (isMockAuth()) return authState.user;
  const token = getToken();
  if (!token) {
    authState.user = null;
    return null;
  }
  try {
    const response = await axios.get(`${AUTH_PATH}/me`, { headers: { Authorization: `Bearer ${token}` } });
    // A sign-out or another sign-in while this was in flight wins.
    if (authState.token !== token) return authState.user;
    authState.user = response.data;
    return authState.user;
  } catch (error) {
    if (error?.response?.status === 401 && authState.token === token) {
      clearSession();
      return null;
    }
    throw error;
  }
}

/** The signed-in user, loading /auth/me once if needed. Used by the router guard. */
export function ensureSession() {
  if (authState.user) return Promise.resolve(authState.user);
  if (isMockAuth() || !getToken()) return Promise.resolve(null);
  if (!mePromise) {
    mePromise = refreshMe().finally(() => {
      mePromise = null;
    });
  }
  return mePromise;
}

/**
 * Sign out. The server bumps the user's token version, which ends every
 * session they have. The local session is cleared even if the call fails.
 */
export async function logout() {
  if (isMockAuth()) {
    storage.set(MOCK_SIGNED_OUT_KEY, 'true');
    clearSession();
    return;
  }
  const token = getToken();
  clearSession();
  if (!token) return;
  try {
    await axios.post(`${AUTH_PATH}/logout`, null, { headers: { Authorization: `Bearer ${token}` } });
  } catch {
    // Already signed out locally; an expired or revoked token is fine
  }
}

/**
 * Change the signed-in user's password. The server revokes every token on
 * success, so the local session is cleared and the user must sign in again.
 * Rejects with the axios error (e.g. 400/401 for a wrong current password).
 */
export async function changePassword(currentPassword, newPassword) {
  if (isMockAuth()) return;
  const token = getToken();
  await axios.post(
    `${AUTH_PATH}/change-password`,
    { currentPassword, newPassword },
    { headers: token ? { Authorization: `Bearer ${token}` } : {} },
  );
  clearSession();
}

/**
 * Only same-app relative paths are allowed as a post-sign-in redirect:
 * a single leading "/", no "//" or "/\" (protocol-relative), no scheme.
 */
export const safeRedirect = (raw) => {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== 'string' || !value.startsWith('/')) return '/';
  if (value.startsWith('//') || value.startsWith('/\\')) return '/';
  if (/[\u0000-\u001f]/.test(value)) return '/';
  const path = value.split(/[?#]/)[0];
  if (path === '/login' || path === '/change-password') return '/';
  return value;
};

/**
 * Called when the API answers 401 for a signed-in request: the token is no
 * longer valid, so sign out and go to /login, coming back here afterwards.
 */
export function handleUnauthorized() {
  const hadSession = !!authState.token || !!authState.user;
  clearSession();
  if (!router || !hadSession) return;
  const current = router.currentRoute.value;
  if (current?.meta?.public) return;
  router.replace({ path: '/login', query: { redirect: safeRedirect(current?.fullPath), expired: '1' } });
}
