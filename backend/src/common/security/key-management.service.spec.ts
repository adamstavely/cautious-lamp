import { UnauthorizedException } from '@nestjs/common';
import { EncryptionService } from './encryption.service';
import { KeyManagementService } from './key-management.service';

describe('KeyManagementService', () => {
  const originalEnv = { ...process.env };

  const create = (env: Record<string, string | undefined>) => {
    process.env = { ...originalEnv, ...env };
    return new KeyManagementService(new EncryptionService());
  };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('accepts keys from API_KEYS and rejects others', () => {
    const service = create({ API_KEYS: 'alpha, beta' });
    expect(service.isValidApiKey('alpha')).toBe(true);
    expect(service.isValidApiKey('beta')).toBe(true);
    expect(service.isValidApiKey('gamma')).toBe(false);
    expect(service.isValidApiKey(undefined)).toBe(false);
  });

  it('no longer accepts the old hardcoded keys', () => {
    const service = create({ API_KEYS: '' });
    expect(service.isValidApiKey('test-api-key-123')).toBe(false);
    expect(service.isValidApiKey('dev-key')).toBe(false);
  });

  it('accepts keys created at runtime until they are revoked', () => {
    const service = create({ API_KEYS: '' });
    const { key, metadata } = service.createKey('ci');
    expect(service.isValidApiKey(key)).toBe(true);
    service.revokeKey(metadata.id);
    expect(service.isValidApiKey(key)).toBe(false);
  });

  it('reads the key from a Bearer header', () => {
    const service = create({ API_KEYS: 'alpha' });
    expect(() => service.assertValidApiKey('Bearer alpha')).not.toThrow();
    expect(() => service.assertValidApiKey('Bearer nope')).toThrow(UnauthorizedException);
    expect(() => service.assertValidApiKey(undefined)).toThrow(UnauthorizedException);
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
