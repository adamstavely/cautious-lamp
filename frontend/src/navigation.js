/** The app's main sections, shown in the side nav and in the phone menu */
export const MAIN_NAV = [
  { path: '/getting-started', label: 'Getting Started', icon: 'rocket' },
  { path: '/guidelines', label: 'Guidelines', icon: 'book-open' },
  { path: '/research', label: 'HCD', icon: 'notebook-tabs' },
  { path: '/components', label: 'Components', icon: 'blocks' },
  { path: '/tokens', label: 'Tokens', icon: 'swatch-book' },
  { path: '/patterns', label: 'Patterns', icon: 'layout-template' },
  { path: '/design-assets', label: 'Design Assets', icon: 'images' },
  { path: '/review', label: 'Review', icon: 'message-square-text' },
  { path: '/data-viz', label: 'Data Viz', icon: 'chart-column' },
  { path: '/tools', label: 'Tools', icon: 'wrench' },
];

export const ADMIN_NAV = { path: '/admin', label: 'Admin', icon: 'shield-user' };

/** Sections whose items come before a divider in the nav */
export const NAV_DIVIDERS_AFTER = ['/research', '/design-assets'];

/** Whether the section at `path` contains the page at `routePath` */
export function isSectionActive(path, routePath) {
  if (path === '/tokens') return routePath === '/tokens' || routePath.startsWith('/palette-builder');
  if (path === '/research') return routePath === '/research' || routePath.startsWith('/research/') || routePath.startsWith('/hcd/');
  return routePath === path || routePath.startsWith(`${path}/`);
}

/** Below Tailwind's `sm` breakpoint (640px): the side nav becomes a menu and the docs drawer a sheet */
export const PHONE_QUERY = '(max-width: 639.98px)';
