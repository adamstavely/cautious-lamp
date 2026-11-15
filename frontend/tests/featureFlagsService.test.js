// Feature flags: one list request shared by every caller, kept for a short TTL
// (also across reloads, through sessionStorage), concurrent callers wait for the
// same request, missing keys cost nothing, and a flag change forces a reload.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/services/auth.js', async (importOriginal) => ({
  ...(await importOriginal()),
  getToken: () => 'test-token',
  isMockAuth: () => false,
}));

const FLAGS = [
  { key: 'component-loupe', enabled: true },
  { key: 'ai-assistant', enabled: false },
];

let requests;
let api;
let service;

const load = async () => {
  vi.resetModules();
  api = (await import('../src/services/api.js')).default;
  api.defaults.adapter = async (config) => {
    requests.push(config.url);
    await new Promise((resolve) => setTimeout(resolve, 0));
    return { status: 200, statusText: 'OK', headers: {}, config, data: FLAGS };
  };
  service = await import('../src/services/featureFlagsService.js');
};

beforeEach(async () => {
  requests = [];
  sessionStorage.clear();
  await load();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('feature flag provider', () => {
  it('answers many concurrent callers with one request', async () => {
    const keys = ['component-loupe', 'ai-assistant', 'not-a-flag', 'component-loupe', 'guidelines-vitepress'];
    const values = await Promise.all(keys.map((key) => service.OpenFeature.getBooleanValue(key, true)));
    expect(values).toEqual([true, false, true, true, true]);
    expect(requests).toEqual(['/api/v1/feature-flags']);
  });

  it('reuses the list while it is fresh and fetches again after the TTL', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    await service.OpenFeature.getBooleanValue('component-loupe');
    await service.OpenFeature.getBooleanValue('ai-assistant');
    await service.OpenFeature.refreshCache();
    expect(requests).toHaveLength(1);

    vi.setSystemTime(Date.now() + service.FLAG_TTL_MS + 1);
    await service.OpenFeature.getBooleanValue('component-loupe');
    expect(requests).toHaveLength(2);
  });

  it('keeps the list across a reload within the TTL', async () => {
    await service.OpenFeature.getBooleanValue('component-loupe');
    expect(requests).toHaveLength(1);
    await load(); // a fresh page: new module instances, same session
    expect(await service.OpenFeature.getBooleanValue('component-loupe')).toBe(true);
    expect(requests).toHaveLength(1);
  });

  it('reloads at once when a flag changed', async () => {
    await service.OpenFeature.getBooleanValue('component-loupe');
    await service.OpenFeature.refreshCache({ force: true });
    expect(requests).toHaveLength(2);
  });
});
