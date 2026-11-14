// R33: /admin/applications needs admin:governance, or being admin/owner of
// at least one workspace (as on the server). Editors alone are refused, and a
// failed workspace lookup fails closed.
import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const DENY = { path: '/', query: { unauthorized: 'admin:governance' } };

let auth;
let guards;
let apiClient;
let workspaces;
let workspaceLookups;
let lookupFails;
let user;
const originalAdapter = axios.defaults.adapter;

const reply = (config, data) => ({ status: 200, statusText: 'OK', data, headers: {}, config });

beforeEach(async () => {
  sessionStorage.clear();
  workspaces = [];
  workspaceLookups = 0;
  lookupFails = false;
  user = { id: 'u1', permissions: ['component:view'] };
  axios.defaults.adapter = async (config) => {
    if (config.url.endsWith('/auth/login')) {
      return reply(config, { accessToken: 't', expiresAt: new Date(Date.now() + 1e6).toISOString(), user });
    }
    throw new Error(`unexpected request ${config.url}`);
  };

  vi.resetModules();
  auth = await import('../src/services/auth.js');
  guards = await import('../src/router/rbacGuards.js');
  apiClient = (await import('../src/services/api.js')).default;
  apiClient.defaults.adapter = async (config) => {
    if (config.url !== '/api/v1/workspaces') throw new Error(`unexpected request ${config.url}`);
    workspaceLookups += 1;
    if (lookupFails) {
      const error = new Error('boom');
      error.response = { status: 500, data: {} };
      error.config = config;
      throw error;
    }
    return reply(config, workspaces);
  };
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  auth.clearSession();
  axios.defaults.adapter = originalAdapter;
});

const signIn = async (permissions = ['component:view']) => {
  user = { id: `u-${permissions.join('-')}`, permissions };
  await auth.login('a@b.c', 'pw');
};

describe('application management access', () => {
  it.each([
    ['owner', [{ id: 'w1', effectiveRole: 'owner' }]],
    ['admin', [{ id: 'w1', effectiveRole: 'editor' }, { id: 'w2', effectiveRole: 'admin' }]],
  ])('lets in a workspace %s without admin:governance', async (_role, list) => {
    workspaces = list;
    await signIn();
    expect(guards.canAccessPath('/admin/applications')).toBe(false); // not known yet
    await expect(guards.checkRbacGuard({ path: '/admin/applications' })).resolves.toBe(true);
    await expect(guards.checkRbacGuard({ path: '/admin/applications/register' })).resolves.toBe(true);
    // The nav link shows once the guard has found out.
    expect(guards.canAccessPath('/admin/applications')).toBe(true);
  });

  it('refuses someone who is only an editor (or viewer) of workspaces', async () => {
    workspaces = [
      { id: 'w1', effectiveRole: 'editor' },
      { id: 'w2', effectiveRole: 'viewer' },
    ];
    await signIn();
    await expect(guards.checkRbacGuard({ path: '/admin/applications' })).resolves.toEqual(DENY);
    expect(guards.canAccessPath('/admin/applications')).toBe(false);
  });

  it('lets in admin:governance without looking up workspaces', async () => {
    await signIn(['admin:governance']);
    await expect(guards.checkRbacGuard({ path: '/admin/applications' })).resolves.toBe(true);
    expect(guards.canAccessPath('/admin/applications')).toBe(true);
    expect(workspaceLookups).toBe(0);
  });

  it('fails closed when the workspace lookup fails', async () => {
    lookupFails = true;
    await signIn();
    await expect(guards.checkRbacGuard({ path: '/admin/applications' })).resolves.toEqual(DENY);
    expect(workspaceLookups).toBe(1);
    expect(guards.canAccessPath('/admin/applications')).toBe(false);
  });

  it('keeps other governance pages governance-only, with no workspace lookup', async () => {
    workspaces = [{ id: 'w1', effectiveRole: 'owner' }];
    await signIn();
    await expect(guards.checkRbacGuard({ path: '/admin/accessibility-reports' })).resolves.toEqual(DENY);
    expect(guards.canAccessPath('/admin/accessibility-reports')).toBe(false);
    expect(workspaceLookups).toBe(0);
  });

  it('refuses when signed out, without a lookup', async () => {
    workspaces = [{ id: 'w1', effectiveRole: 'owner' }];
    await expect(guards.checkRbacGuard({ path: '/admin/applications' })).resolves.toEqual(DENY);
    expect(workspaceLookups).toBe(0);
  });

  it("does not carry one user's workspace-admin result over to another user", async () => {
    workspaces = [{ id: 'w1', effectiveRole: 'admin' }];
    await signIn();
    await guards.checkRbacGuard({ path: '/admin/applications' });
    expect(guards.canAccessPath('/admin/applications')).toBe(true);

    auth.authState.user = { id: 'someone-else', permissions: ['component:view'] };
    expect(guards.canAccessPath('/admin/applications')).toBe(false);
  });
});
