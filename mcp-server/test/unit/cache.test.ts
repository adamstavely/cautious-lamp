jest.mock('../../src/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Cache', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();
  });

  function loadCache(env: Record<string, string>) {
    Object.assign(process.env, env);
    let mod: typeof import('../../src/cache');
    jest.isolateModules(() => {
      mod = require('../../src/cache');
    });
    return mod!.cache;
  }

  it('should skip caching instead of throwing when full', () => {
    const cache = loadCache({ CACHE_ENABLED: 'true', CACHE_MAX_KEYS: '2' });

    expect(cache.set('tokens', 1, { a: 1 })).toBe(true);
    expect(cache.set('tokens', 2, { a: 2 })).toBe(true);
    expect(() => cache.set('tokens', 3, { a: 3 })).not.toThrow();
    expect(cache.set('tokens', 4, { a: 4 })).toBe(false);

    expect(cache.get('tokens', { a: 1 })).toBe(1);
    expect(cache.get('tokens', { a: 3 })).toBeUndefined();
    cache.clear();
  });

  it('should default to a bounded cache of 1000 keys', () => {
    const cache = loadCache({ CACHE_ENABLED: 'true' });

    for (let i = 0; i < 1000; i++) {
      expect(cache.set('tokens', i, { i })).toBe(true);
    }
    expect(cache.set('tokens', 1000, { i: 1000 })).toBe(false);
    cache.clear();
  });
});
