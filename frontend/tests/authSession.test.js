// R34: an expired session must end. The router guard used to get the cached
// user back from ensureSession() after the token expired, and an idle page
// never noticed; both now sign out and go to /login?redirect=…&expired=1.
import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const CURRENT_PATH = '/admin/workspaces/abc?tab=members';
const EXPIRED_REDIRECT = { path: '/login', query: { redirect: CURRENT_PATH, expired: '1' } };

let auth;
let calls;
let replaced;
let sessionMs;
const originalAdapter = axios.defaults.adapter;

const fakeRouter = (meta = {}) => ({
  currentRoute: { value: { fullPath: CURRENT_PATH, meta } },
  replace: (to) => replaced.push(to),
});

beforeEach(async () => {
  vi.useFakeTimers();
  sessionStorage.clear();
  calls = [];
  replaced = [];
  sessionMs = 60_000;
  axios.defaults.adapter = async (config) => {
    calls.push(config.url);
    const reply = (data) => ({ status: 200, statusText: 'OK', data, headers: {}, config });
    if (config.url.endsWith('/auth/login')) {
      return reply({
        accessToken: 'token-1',
        expiresAt: new Date(Date.now() + sessionMs).toISOString(),
        user: { id: 'u1', permissions: [] },
      });
    }
    if (config.url.endsWith('/auth/me')) return reply({ id: 'u1', permissions: [] });
    if (config.url.endsWith('/auth/logout')) return reply(null);
    throw new Error(`unexpected request ${config.url}`);
  };
  // Fresh module state (session, timers, expired flag) for every test.
  vi.resetModules();
  auth = await import('../src/services/auth.js');
  auth.setAuthRouter(fakeRouter());
});

afterEach(() => {
  auth.clearSession();
  axios.defaults.adapter = originalAdapter;
  vi.useRealTimers();
});

const expireNow = () => {
  auth.authState.expiresAt = new Date(Date.now() - 1000).toISOString();
};
const meCalls = () => calls.filter((url) => url.endsWith('/auth/me')).length;

describe('auth session expiry', () => {
  it('ensureSession returns null for an expired cached session, without calling /me', async () => {
    await auth.login('a@b.c', 'pw');
    expect(auth.authState.user).not.toBeNull();
    expireNow();

    await expect(auth.ensureSession()).resolves.toBeNull();
    expect(auth.authState.user).toBeNull();
    expect(auth.authState.token).toBeNull();
    expect(sessionStorage.getItem('authToken')).toBeNull();
    expect(meCalls()).toBe(0);
    // The guard learns it expired (once), to send expired=1 to /login.
    expect(auth.consumeSessionExpired()).toBe(true);
    expect(auth.consumeSessionExpired()).toBe(false);
  });

  it('ensureSession still returns a live cached session without calling /me', async () => {
    await auth.login('a@b.c', 'pw');
    await expect(auth.ensureSession()).resolves.toMatchObject({ id: 'u1' });
    expect(meCalls()).toBe(0);
    expect(auth.consumeSessionExpired()).toBe(false);
  });

  it('an idle page signs out and redirects to /login with redirect and expired=1 when the token expires', async () => {
    sessionMs = 150;
    await auth.login('a@b.c', 'pw');
    await vi.advanceTimersByTimeAsync(100);
    expect(auth.authState.user).not.toBeNull();
    expect(replaced).toEqual([]);

    await vi.advanceTimersByTimeAsync(100);
    expect(auth.authState.user).toBeNull();
    expect(replaced).toEqual([EXPIRED_REDIRECT]);
    expect(auth.consumeSessionExpired()).toBe(true);
  });

  it('a request with an expired token sends no Authorization header and redirects', async () => {
    await auth.login('a@b.c', 'pw');
    expect(auth.authHeaders()).toEqual({ Authorization: 'Bearer token-1' });
    expireNow();

    expect(auth.authHeaders()).toEqual({});
    expect(replaced).toEqual([EXPIRED_REDIRECT]);
  });

  it('does not redirect away from a public page', async () => {
    auth.setAuthRouter(fakeRouter({ public: true }));
    await auth.login('a@b.c', 'pw');
    expireNow();
    expect(auth.authHeaders()).toEqual({});
    expect(replaced).toEqual([]);
  });

  it('an expired token in sessionStorage is dropped on load', async () => {
    sessionStorage.setItem('authToken', 'stale');
    sessionStorage.setItem('authTokenExpiresAt', new Date(Date.now() - 1000).toISOString());
    vi.resetModules();
    const fresh = await import('../src/services/auth.js');
    expect(fresh.authState.token).toBeNull();
    expect(sessionStorage.getItem('authToken')).toBeNull();
    await expect(fresh.ensureSession()).resolves.toBeNull();
    expect(meCalls()).toBe(0);
  });

  it('logout clears the expired flag, and a later 401 without a session does not redirect', async () => {
    await auth.login('a@b.c', 'pw');
    await auth.logout();
    expect(auth.consumeSessionExpired()).toBe(false);
    auth.handleUnauthorized();
    expect(replaced).toEqual([]);
  });
});

describe('password change required', () => {
  it('sends a temporary-password session to /change-password', async () => {
    await auth.login('a@b.c', 'pw');
    auth.handlePasswordChangeRequired();
    expect(auth.authState.user.mustChangePassword).toBe(true);
    expect(replaced).toContainEqual({ path: '/change-password' });
  });
});

describe('automatic development sign-in', () => {
  const loginCalls = () => calls.filter((url) => url.endsWith('/auth/login')).length;

  beforeEach(async () => {
    vi.stubEnv('VITE_DEV_SIGN_IN_EMAIL', 'dev@localhost.test');
    vi.stubEnv('VITE_DEV_SIGN_IN_PASSWORD', 'dev-password');
    vi.resetModules();
    auth = await import('../src/services/auth.js');
    auth.setAuthRouter(fakeRouter());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('signs the development user in when there is no session', async () => {
    await expect(auth.ensureSession()).resolves.toMatchObject({ id: 'u1' });
    expect(auth.authState.token).toBe('token-1');
    expect(loginCalls()).toBe(1);
  });

  it('signs in once for concurrent callers', async () => {
    await Promise.all([auth.ensureSession(), auth.ensureSession()]);
    expect(loginCalls()).toBe(1);
  });

  it('stays signed out after an explicit sign-out, until the next sign-in', async () => {
    await auth.ensureSession();
    await auth.logout();
    await expect(auth.ensureSession()).resolves.toBeNull();
    expect(loginCalls()).toBe(1);

    await auth.login('dev@localhost.test', 'dev-password');
    await auth.logout();
    sessionStorage.removeItem('devSignedOut');
    await expect(auth.ensureSession()).resolves.toMatchObject({ id: 'u1' });
  });

  it('falls back to the sign-in page when it fails, without retrying', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    axios.defaults.adapter = async (config) => {
      calls.push(config.url);
      const error = new Error('Unauthorized');
      error.response = { status: 401 };
      throw error;
    };
    await expect(auth.ensureSession()).resolves.toBeNull();
    await expect(auth.ensureSession()).resolves.toBeNull();
    expect(loginCalls()).toBe(1);
    expect(warn).toHaveBeenCalledOnce();
  });

  it('is off when the credentials are not set', async () => {
    vi.unstubAllEnvs();
    vi.resetModules();
    auth = await import('../src/services/auth.js');
    await expect(auth.ensureSession()).resolves.toBeNull();
    expect(loginCalls()).toBe(0);
  });
});
