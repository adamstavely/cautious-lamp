import { atLeast } from '../components/workspaces/ui.js';
import apiClient from '../services/api.js';
import { authState, ensureSession, hasPermission } from '../services/auth.js';

/**
 * Admin routes are guarded by prefix (docs/AUTH.md). The first matching
 * prefix wins; anything else under /admin needs admin:users. The check uses
 * the permissions from /auth/me and fails closed: if they can't be loaded,
 * access is denied. The server enforces the same permissions on its routes.
 *
 * A prefix in WORKSPACE_ADMIN_PREFIXES also lets in anyone who is admin (or
 * owner) of at least one workspace, matching the server, which lets workspace
 * admins manage their own workspaces' applications.
 */
const ADMIN_PREFIXES = [
  ['/admin/users', 'admin:users'],
  ['/admin/roles', 'admin:rbac'],
  ['/admin/audit', 'admin:audit'],
  ['/admin/governance', 'admin:governance'],
  ['/admin/health', 'admin:system_health'],
  ['/admin/performance', 'admin:performance_analysis'],
  ['/admin/banners', 'admin:banners'],
  ['/admin/content', 'admin:banners'],
  ['/admin/feature-flags', 'admin:system_health'],
  ['/admin/applications', 'admin:governance'],
  ['/admin/accessibility-reports', 'admin:governance'],
  // Linked from the Components area, so ordinary viewers need it
  ['/admin/dependencies', 'component:view'],
  // Workspaces enforce per-workspace roles on the server; members of a
  // workspace need these pages without any admin permission
  ['/admin/workspaces', null],
];
const ADMIN_DEFAULT_PERMISSION = 'admin:users';
const WORKSPACE_ADMIN_PREFIXES = ['/admin/applications'];

// Whether the signed-in user administers a workspace, per user id. Filled by
// the guard (async) so canAccessPath (sync) can show the link afterwards.
let workspaceAdminCache = { userId: null, value: false };

const matchesPrefix = (path, prefix) => path === prefix || path.startsWith(`${prefix}/`);

/** The permission a path needs, or null when it needs none beyond signing in. */
export function requiredPermissionFor(path) {
  if (!matchesPrefix(path, '/admin')) return null;
  const match = ADMIN_PREFIXES.find(([prefix]) => matchesPrefix(path, prefix));
  // A matched null permission means signing in is enough
  return match ? match[1] : ADMIN_DEFAULT_PERMISSION;
}

/** Whether workspace admins may open a path without its permission. */
export const allowsWorkspaceAdmins = (path) => WORKSPACE_ADMIN_PREFIXES.some((prefix) => matchesPrefix(path, prefix));

const cachedWorkspaceAdmin = () => !!authState.user && workspaceAdminCache.userId === authState.user.id && workspaceAdminCache.value;

/** Whether the signed-in user is admin or owner of any workspace (GET /workspaces). */
async function administersAWorkspace(user) {
  const response = await apiClient.get('/api/v1/workspaces');
  const value = (response.data ?? []).some((ws) => atLeast(ws.effectiveRole, 'admin'));
  workspaceAdminCache = { userId: user.id, value };
  return value;
}

/** Whether the signed-in user may open a path (for hiding nav links). */
export const canAccessPath = (path) => {
  const permission = requiredPermissionFor(path);
  if (!permission || hasPermission(permission)) return true;
  return allowsWorkspaceAdmins(path) && cachedWorkspaceAdmin();
};

// Router guard to check RBAC permissions
export async function checkRbacGuard(to) {
  const requiredPermission = requiredPermissionFor(to.path);
  if (!requiredPermission) return true;

  try {
    const user = await ensureSession();
    if (user && hasPermission(requiredPermission)) return true;
    if (user && allowsWorkspaceAdmins(to.path) && (await administersAWorkspace(user))) return true;
  } catch (error) {
    console.error(`Could not load permissions to check ${requiredPermission}:`, error);
  }
  return { path: '/', query: { unauthorized: requiredPermission } };
}
