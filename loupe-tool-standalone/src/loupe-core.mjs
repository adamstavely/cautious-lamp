// Framework-free pieces of the Loupe Tool, kept here so they can be tested
// without a browser or Vue.

/** Path of the backend's component metadata route, under the API base URL */
export const COMPONENT_METADATA_PATH = '/component-metadata';

/** Metadata used when the API can't be reached or answers with an error */
export function getDefaultMetadata() {
  return {
    'button': { name: 'Button', path: '@design-system/components/button', icon: 'smart_button', links: { docs: '/components/buttons', github: '', figma: '' } },
    'card': { name: 'Card', path: '@design-system/components/card', icon: 'view_module', links: { docs: '/components/cards', github: '', figma: '' } },
    'input': { name: 'Input', path: '@design-system/components/input', icon: 'input', links: { docs: '/components/forms', github: '', figma: '' } },
    'dropdown': { name: 'Dropdown', path: '@design-system/components/dropdown', icon: 'arrow_drop_down', links: { docs: '/components/forms', github: '', figma: '' } },
    'sidebar': { name: 'Sidebar', path: '@design-system/components/sidebar', icon: 'menu', links: { docs: '/components/navigation', github: '', figma: '' } },
    'topnav': { name: 'Top Navigation', path: '@design-system/components/topnav', icon: 'menu', links: { docs: '/components/navigation', github: '', figma: '' } },
    'breadcrumbs': { name: 'Breadcrumbs', path: '@design-system/components/breadcrumbs', icon: 'navigate_next', links: { docs: '/components/navigation', github: '', figma: '' } },
  };
}

/**
 * Loads `{ [componentId]: metadata }` from `GET {apiUrl}/component-metadata`.
 * Any failure (network error, non-2xx status such as 401/404, a body that
 * isn't a JSON object) falls back to the built-in metadata, with a warning.
 */
export async function fetchComponentMetadata(apiUrl, apiKey, fetchImpl = globalThis.fetch) {
  const url = `${String(apiUrl).replace(/\/+$/, '')}${COMPONENT_METADATA_PATH}`;
  try {
    const response = await fetchImpl(url, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ''}`);
    }
    const data = await response.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('response is not a metadata object');
    }
    return data;
  } catch (error) {
    console.warn(`Failed to load component metadata from ${url}; using built-in metadata:`, error);
    return getDefaultMetadata();
  }
}

/**
 * Style for a `position: fixed` highlight over an element. Fixed elements are
 * placed in viewport coordinates, which is what getBoundingClientRect returns,
 * so no scroll offset is added.
 */
export function highlightStyle(rect) {
  return {
    position: 'fixed',
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    zIndex: 9998,
  };
}
