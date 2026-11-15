// @vitest-environment node
// The dev proxy forwards API calls to the backend (on a configurable target,
// defaulting to the backend's own default port), and leaves the app's pages,
// such as /api, to Vite so reloading them works.
import { describe, expect, it } from 'vitest';
import { devProxy, proxyTarget } from '../vite.config.js';

const proxied = (path, env = {}) => Object.keys(devProxy(env)).some((pattern) => new RegExp(pattern).test(path));

describe('vite dev proxy', () => {
  it('targets VITE_API_PROXY_TARGET, else VITE_API_BASE_URL, else the backend default port', () => {
    expect(proxyTarget({})).toBe('http://localhost:3000');
    expect(proxyTarget({ VITE_API_BASE_URL: 'http://localhost:3456' })).toBe('http://localhost:3456');
    expect(proxyTarget({ VITE_API_BASE_URL: 'http://localhost:3456', VITE_API_PROXY_TARGET: 'http://api:4000' })).toBe('http://api:4000');
    for (const entry of Object.values(devProxy({ VITE_API_PROXY_TARGET: 'http://api:4000' }))) expect(entry.target).toBe('http://api:4000');
  });

  it('forwards API calls and the patterns library', () => {
    for (const path of ['/api/v1/issues', '/api/v1', '/api/palettes', '/api/palettes/analyze', '/api/versions/current/routes', '/patterns-library/patterns']) {
      expect(proxied(path), path).toBe(true);
    }
  });

  it('leaves the app pages to Vite', () => {
    for (const path of ['/api', '/api/', '/api/reference', '/api/v1x', '/patterns', '/patterns-library-guide']) {
      expect(proxied(path), path).toBe(false);
    }
  });
});
