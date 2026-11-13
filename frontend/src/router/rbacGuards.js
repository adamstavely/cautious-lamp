import { ensureSession, hasPermission } from '../services/auth.js';

/**
 * Admin routes are guarded by prefix (docs/AUTH.md). The first matching
 * prefix wins; anything else under /admin needs admin:users. The check uses
 * the permissions from /auth/me and fails closed: if they can't be loaded,
 * access is denied. The server enforces the same permissions on its routes.
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

const matchesPrefix = (path, prefix) => path === prefix || path.startsWith(`${prefix}/`);

/** The permission a path needs, or null when it needs none beyond signing in. */
export function requiredPermissionFor(path) {
  if (!matchesPrefix(path, '/admin')) return null;
  const match = ADMIN_PREFIXES.find(([prefix]) => matchesPrefix(path, prefix));
  // A matched null permission means signing in is enough
  return match ? match[1] : ADMIN_DEFAULT_PERMISSION;
}

/** Whether the signed-in user may open a path (for hiding nav links). */
export const canAccessPath = (path) => {
  const permission = requiredPermissionFor(path);
  return !permission || hasPermission(permission);
};

// Router guard to check RBAC permissions
export async function checkRbacGuard(to) {
  const requiredPermission = requiredPermissionFor(to.path);
  if (!requiredPermission) return true;

  try {
    const user = await ensureSession();
    if (user && hasPermission(requiredPermission)) return true;
  } catch (error) {
    console.error(`Could not load permissions to check ${requiredPermission}:`, error);
  }
  return { path: '/', query: { unauthorized: requiredPermission } };
}
