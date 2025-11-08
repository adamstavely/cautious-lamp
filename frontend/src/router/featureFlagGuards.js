import OpenFeature from '../services/featureFlagsService';

// Map routes to feature flag keys
const routeToFlagMap = {
  '/components': 'component-status',
  '/components/loupe': 'component-loupe',
  '/components/status': 'component-status',
  '/components/testing': 'component-testing',
  '/components/documentation': 'component-documentation',
  '/review/handoff': 'component-handoff',
  '/components/composition': 'component-composition',
  '/components/dependencies': 'component-dependencies',
  '/tokens': 'token-studio',
  '/tokens/studio': 'token-studio',
  '/tokens/playground': 'token-playground',
  '/tokens/library': 'token-library',
  '/review': 'review-system',
  '/review/my-requests': 'review-kanban',
  '/review/management': 'review-admin',
  '/admin/health': 'admin-system-health',
  '/admin/governance': 'admin-governance',
  '/admin/audit': 'admin-audit',
  '/admin/roles': 'admin-rbac',
  '/admin/feature-flags': 'admin-feature-flags',
  '/tools/gradient-generator': 'gradient-generator',
  '/tools/lorem-ipsum': 'lorem-ipsum',
  '/tools/seo-tagging': 'seo-tagging',
  '/tools/color-scale': 'color-scale',
  '/tools/color-converter': 'color-converter',
  '/tools/color-contrast': 'color-contrast',
  '/tools/nasa-tlx': 'nasa-tlx',
  '/tools/sus': 'sus',
  '/tools/png-to-ico': 'png-to-ico',
  '/tools/heuristic-evaluation': 'heuristic-evaluation',
  '/palette-builder': 'palette-builder',
  '/theme-builder': 'theme-builder',
  '/admin/code-quality': 'code-quality',
  '/admin/security': 'vulnerability-scanner',
  '/fonts': 'font-library',
  '/design-assets/font-library': 'font-library',
  '/tools/font-scale': 'font-scale',
  '/tools/font-stack': 'font-stack',
  '/tools/font-subsetting': 'font-subsetting',
  '/patterns': 'patterns-system',
  '/design-assets/icons': 'icon-library',
  '/getting-started': 'getting-started-section',
  '/research': 'research-repo',
  '/research/user-personas': 'user-persona-generator',
  '/guidelines': 'guidelines-vitepress',
  '/ai-suggestions': 'ai-suggestions',
  '/api': 'design-system-api',
  '/feedback': 'feedback-roadmap',
  '/notifications': 'change-notifications',
  '/brands': 'multi-brand-support',
};

// Get feature flag for a route
export function getFeatureFlagForRoute(path) {
  // Check exact match first
  if (routeToFlagMap[path]) {
    return routeToFlagMap[path];
  }
  
  // Check for path prefixes (e.g., /components/buttons should check /components)
  const pathParts = path.split('/').filter(Boolean);
  for (let i = pathParts.length; i > 0; i--) {
    const testPath = '/' + pathParts.slice(0, i).join('/');
    if (routeToFlagMap[testPath]) {
      return routeToFlagMap[testPath];
    }
  }
  
  return null;
}

// Router guard to check feature flags
export async function checkFeatureFlagGuard(to) {
  const flagKey = getFeatureFlagForRoute(to.path);
  
  if (!flagKey) {
    // No feature flag for this route, allow access
    return true;
  }
  
  try {
    const userId = localStorage.getItem('userId') || undefined;
    const userGroups = localStorage.getItem('userGroups') 
      ? JSON.parse(localStorage.getItem('userGroups'))
      : undefined;
    
    const enabled = await OpenFeature.getBooleanValue(flagKey, false, { userId, userGroups });
    
    if (!enabled) {
      // Feature is disabled, redirect to home
      return { path: '/', query: { featureDisabled: flagKey } };
    }
    
    return true;
  } catch (error) {
    console.error(`Error checking feature flag ${flagKey}:`, error);
    // On error, allow access (fail open)
    return true;
  }
}

