import { UnauthorizedException } from '@nestjs/common';
import { InMemoryStore } from '../../reviews/testing/in-memory-store';
import { randomBytes } from 'crypto';
import { API_KEY_CACHE_MAX, API_KEY_CACHE_MS, ApiKeyDoc, KeyManagementService } from './key-management.service';

describe('KeyManagementService', () => {
  const originalEnv = { ...process.env };

  const create = (env: Record<string, string | undefined>, store = new InMemoryStore<ApiKeyDoc>()) => {
    process.env = { ...originalEnv, ...env };
    return new KeyManagementService(store);
  };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.useRealTimers();
  });

  it('accepts keys from API_KEYS and rejects others', async () => {
    const service = create({ API_KEYS: 'alpha, beta' });
    expect(await service.isValidApiKey('alpha')).toBe(true);
    expect(await service.isValidApiKey('beta')).toBe(true);
    expect(await service.isValidApiKey('gamma')).toBe(false);
    expect(await service.isValidApiKey(undefined)).toBe(false);
  });

  it('no longer accepts the old hardcoded keys', async () => {
    const service = create({ API_KEYS: '' });
    expect(await service.isValidApiKey('test-api-key-123')).toBe(false);
    expect(await service.isValidApiKey('dev-key')).toBe(false);
  });

  it('accepts keys created at runtime until they are revoked', async () => {
    const service = create({ API_KEYS: '' });
    const { key, metadata } = await service.createKey('ci');
    expect(key.startsWith('dsk_')).toBe(true);
    expect(await service.isValidApiKey(key)).toBe(true);
    expect(await service.revokeKey(metadata.id)).toBe(true);
    expect(await service.isValidApiKey(key)).toBe(false);
  });

  it('stores only the hash of a key', async () => {
    const store = new InMemoryStore<ApiKeyDoc>();
    const service = create({ API_KEYS: '' }, store);
    const { key } = await service.createKey('ci', { scopes: ['token:view'] });
    const stored = JSON.stringify([...store.docs.values()]);
    expect(stored).not.toContain(key);
    expect(stored).not.toContain(key.slice(4));
  });

  it('shares keys and revocations through storage: another instance or a restart sees them', async () => {
    const store = new InMemoryStore<ApiKeyDoc>();
    const first = create({ API_KEYS: '' }, store);
    const { key, metadata } = await first.createKey('ci', { scopes: ['token:view'] });

    // A second replica (or the same one after a restart) shares only the store
    const second = create({ API_KEYS: '' }, store);
    expect(await second.resolveApiKey(key)).toEqual({ id: metadata.id, name: 'ci', scopes: ['token:view'] });
    expect((await second.getAllKeys()).map((k) => k.id)).toEqual([metadata.id]);

    // Revoked on the first; the second sees it once its cached lookup expires
    jest.useFakeTimers({ now: Date.now(), doNotFake: ['nextTick', 'setImmediate'] });
    await first.revokeKey(metadata.id);
    expect(await first.isValidApiKey(key)).toBe(false);
    jest.setSystemTime(Date.now() + API_KEY_CACHE_MS + 1);
    expect(await second.isValidApiKey(key)).toBe(false);
    expect(await create({ API_KEYS: '' }, store).isValidApiKey(key)).toBe(false);
  });

  it('rejects expired keys', async () => {
    const service = create({ API_KEYS: '' });
    const { key } = await service.createKey('short', { expiresInDays: 1 });
    jest.useFakeTimers({ now: Date.now() + 2 * 24 * 60 * 60 * 1000, doNotFake: ['nextTick', 'setImmediate'] });
    expect(await service.isValidApiKey(key)).toBe(false);
  });

  it('rotates a key, keeping its scopes and recording where it came from', async () => {
    const service = create({ API_KEYS: '' });
    const { key, metadata } = await service.createKey('ci', { scopes: ['token:view'] });
    const rotated = await service.rotateKey(metadata.id, true, { by: 'usr_1', reason: 'compromised' });
    expect(rotated?.newMetadata).toMatchObject({ name: 'ci', scopes: ['token:view'], rotatedFrom: { keyId: metadata.id, by: 'usr_1', reason: 'compromised' } });
    expect(await service.isValidApiKey(key)).toBe(false);
    expect(await service.isValidApiKey(rotated!.newKey)).toBe(true);
    expect(await service.rotateKey('key_00000000000000000000000000000000')).toBeNull();
  });

  it('does not look up credentials that are not managed keys', async () => {
    const store = new InMemoryStore<ApiKeyDoc>();
    const get = jest.spyOn(store, 'get');
    const service = create({ API_KEYS: '' }, store);
    expect(await service.isValidApiKey('eyJhbGciOiJIUzI1NiJ9.e30.sig')).toBe(false);
    expect(get).not.toHaveBeenCalled();
  });

  it('keeps nothing for unknown managed keys, and at most API_KEY_CACHE_MAX known ones', async () => {
    const store = new InMemoryStore<ApiKeyDoc>();
    const service = create({ API_KEYS: '' }, store);
    const cache = (service as unknown as { cache: Map<string, unknown> }).cache;
    const randomKey = () => `dsk_${randomBytes(32).toString('base64url')}`;

    // Unique random credentials, as an unauthenticated caller could send: none are kept
    for (let i = 0; i < 100; i++) expect(await service.isValidApiKey(randomKey())).toBe(false);
    expect(cache.size).toBe(0);

    // Real keys are cached up to the limit, the least recently used dropped first
    const keys: string[] = [];
    for (let i = 0; i < API_KEY_CACHE_MAX + 5; i++) keys.push((await service.createKey(`k${i}`)).key);
    // (A key's first use records lastUsed, which drops its entry; the second use caches it)
    for (const key of keys) expect(await service.isValidApiKey(key)).toBe(true);
    await new Promise((resolve) => setImmediate(resolve));
    for (const key of keys) expect(await service.isValidApiKey(key)).toBe(true);
    expect(cache.size).toBe(API_KEY_CACHE_MAX);
    const get = jest.spyOn(store, 'get');
    expect(await service.isValidApiKey(keys[keys.length - 1])).toBe(true);
    expect(get).not.toHaveBeenCalled();
    expect(await service.isValidApiKey(keys[0])).toBe(true);
    expect(get).toHaveBeenCalledTimes(1);
    expect(cache.size).toBe(API_KEY_CACHE_MAX);

    // An expired entry is dropped when read, then read again from storage
    jest.useFakeTimers({ now: Date.now() + API_KEY_CACHE_MS + 1, doNotFake: ['nextTick', 'setImmediate'] });
    expect(await service.isValidApiKey(keys[1])).toBe(true);
    expect(get).toHaveBeenCalledTimes(2);
  });

  it('reads the key from a Bearer header', async () => {
    const service = create({ API_KEYS: 'alpha' });
    await expect(service.assertValidApiKey('Bearer alpha')).resolves.toBeUndefined();
    await expect(service.assertValidApiKey('Bearer nope')).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.assertValidApiKey(undefined)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('closes admin routes when ADMIN_API_KEY is not set', () => {
    const service = create({ API_KEYS: 'alpha', ADMIN_API_KEY: undefined });
    expect(service.isAdminKey('alpha')).toBe(false);
    expect(() => service.assertAdminKey('Bearer alpha')).toThrow(UnauthorizedException);
  });

  it('only accepts the admin key on admin routes', () => {
    const service = create({ API_KEYS: 'alpha', ADMIN_API_KEY: 'root' });
    expect(service.isAdminKey('root')).toBe(true);
    expect(service.isAdminKey('alpha')).toBe(false);
  });
});
