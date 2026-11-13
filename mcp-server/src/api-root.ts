import { config } from './config';

/**
 * Some backend controllers (e.g. the patterns library and the review app) are
 * mounted at the server root rather than under the versioned API prefix that
 * `config.apiBaseUrl` points at (default `http://localhost:3000/api/v1`).
 * This returns the server root (e.g. `http://localhost:3000`) so those routes
 * can be addressed with an absolute URL, which axios uses as-is instead of
 * joining it to `baseURL`.
 */
export function apiRootUrl(): string {
  const url = new URL(config.apiBaseUrl);
  const rootPathname = url.pathname.replace(/\/api\/v\d+\/?$/, '').replace(/\/+$/, '');
  return `${url.origin}${rootPathname}`;
}

/**
 * Build an absolute URL for a route mounted at the server root.
 */
export function rootPath(path: string): string {
  return `${apiRootUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}
