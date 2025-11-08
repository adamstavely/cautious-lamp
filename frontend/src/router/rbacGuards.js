import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// Map routes to required permissions
// Note: Routes without permissions here are viewable by all users
const routeToPermissionMap = {
  '/admin/code-quality': 'admin:code_quality',
  '/admin/security': 'admin:vulnerability_scanner',
  '/admin/health': 'admin:system_health',
  '/admin/governance': 'admin:governance',
  '/admin/audit': 'admin:audit',
  '/admin/banners': 'admin:banners',
  '/admin/roles': 'admin:rbac',
  '/admin/feature-flags': 'admin:rbac', // Feature flags also require admin access
  '/admin/performance': 'admin:performance_analysis',
  // Roadmap & Feedback is viewable by all (no permission check needed)
  // But editing requires 'roadmap:edit' permission (checked in component)
};

// Router guard to check RBAC permissions
export async function checkRbacGuard(to) {
  const requiredPermission = routeToPermissionMap[to.path];
  
  if (!requiredPermission) {
    // No permission required for this route
    return true;
  }
  
  // Check if user has design_system_admin role in localStorage (bypasses API check)
  const userRole = localStorage.getItem('userRole');
  if (userRole === 'design_system_admin') {
    // Design system admin has all permissions
    return true;
  }
  
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      // No user ID, redirect to home
      return { path: '/', query: { unauthorized: 'true' } };
    }
    
    // Check if user has the required permission
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/rbac/users/${userId}/permissions/${requiredPermission}`
    );
    
    if (response.data.hasPermission) {
      return true;
    } else {
      // User doesn't have permission, redirect to home with error message
      return { path: '/', query: { unauthorized: requiredPermission } };
    }
  } catch (error) {
    console.error(`Error checking RBAC permission ${requiredPermission}:`, error);
    // On error, allow access (fail open) - in production you might want to fail closed
    return true;
  }
}

