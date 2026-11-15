// Framework-free pieces of the Loupe Tool, kept here so they can be tested
// without a browser or Vue.

/** Path of the backend's component metadata route, under the API base URL */
export const COMPONENT_METADATA_PATH = '/component-metadata';

/**
 * Loads `{ [componentId]: metadata }` from `GET {apiUrl}/component-metadata`.
 *
 * Resolves to one of:
 * - `{ status: 'missing-key', metadata: {} }` when there is no API key (nothing is requested)
 * - `{ status: 'ready', metadata }` when the API answered with a metadata object
 * - `{ status: 'error', metadata: {}, error }` for a network error, a non-2xx status or a body that
 *   isn't a JSON object
 *
 * There is no built-in metadata: without an answer from the API, components are shown by the name
 * in their `data-ds-component` attribute and nothing else.
 */
export async function fetchComponentMetadata(apiUrl, apiKey, fetchImpl = globalThis.fetch) {
  if (!apiKey) return { status: 'missing-key', metadata: {} };
  const url = `${String(apiUrl).replace(/\/+$/, '')}${COMPONENT_METADATA_PATH}`;
  try {
    const response = await fetchImpl(url, { headers: { Authorization: `Bearer ${apiKey}` } });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ''}`);
    }
    const data = await response.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('response is not a metadata object');
    }
    return { status: 'ready', metadata: data };
  } catch (error) {
    console.warn(`Failed to load component metadata from ${url}:`, error);
    return { status: 'error', metadata: {}, error: error instanceof Error ? error.message : String(error) };
  }
}

const LINK_KINDS = ['docs', 'github', 'figma'];

/**
 * The links worth showing: absolute http(s) URLs only. The API leaves out links that aren't
 * configured, and sends a docs path without APP_PUBLIC_URL, which would resolve against the host
 * app and 404 there.
 */
export function usableLinks(links) {
  const usable = {};
  for (const kind of LINK_KINDS) {
    const value = links?.[kind];
    if (typeof value === 'string' && /^https?:\/\//i.test(value.trim())) usable[kind] = value.trim();
  }
  return usable;
}

/** A detected component: its metadata when the API has it, else just the name from the page */
export function describeComponent(name, pagePath, metadata) {
  const entry = metadata?.[String(name ?? '').toLowerCase()];
  return {
    name: entry?.name || name,
    path: pagePath || entry?.path || '',
    icon: entry?.icon || 'blocks',
    links: usableLinks(entry?.links),
  };
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
