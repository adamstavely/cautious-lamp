// Where "Open Component Documentation" goes. The app has no page per component:
// a few components have their own page, and the rest are on the library page.

export const DEFAULT_DOCS_BASE_URL = 'http://localhost:5174';

/** App routes for components that have their own page, by lower-cased name without separators */
const COMPONENT_PAGES: Record<string, string> = {
  button: '/components/buttons',
  buttons: '/components/buttons',
  colorpicker: '/components/color-picker',
};

export function componentDocsUrl(baseUrl: string, componentName: string): string {
  const base = (baseUrl.trim() || DEFAULT_DOCS_BASE_URL).replace(/\/+$/, '');
  const key = componentName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${base}${COMPONENT_PAGES[key] ?? '/components'}`;
}
