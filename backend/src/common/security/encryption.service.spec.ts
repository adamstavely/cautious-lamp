import { randomBytes } from 'crypto';
import { EncryptionService, deriveEncryptionKey } from './encryption.service';

describe('EncryptionService', () => {
  const originalEnv = { ...process.env };

  const create = (env: Record<string, string | undefined>) => {
    process.env = { ...originalEnv, ...env };
    return new EncryptionService();
  };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it.each([
    ['hex', randomBytes(32).toString('hex')],
    ['base64', randomBytes(32).toString('base64')],
    ['passphrase', 'correct horse battery staple'],
  ])('derives the same key from a %s ENCRYPTION_KEY every time', (format, value) => {
    expect(deriveEncryptionKey(value).format).toBe(format);
    expect(deriveEncryptionKey(value).key.length).toBe(32);
    // A new instance stands in for a restart or another replica
    const encrypted = create({ ENCRYPTION_KEY: value }).encrypt('secret token');
    expect(create({ ENCRYPTION_KEY: value }).decrypt(encrypted)).toBe('secret token');
  });

  it('cannot decrypt with a different key', () => {
    const encrypted = create({ ENCRYPTION_KEY: 'one passphrase' }).encrypt('secret token');
    expect(() => create({ ENCRYPTION_KEY: 'another passphrase' }).decrypt(encrypted)).toThrow();
  });

  it('refuses to encrypt outside development without ENCRYPTION_KEY', () => {
    const service = create({ ENCRYPTION_KEY: undefined, NODE_ENV: 'production' });
    expect(() => service.encrypt('secret')).toThrow(/ENCRYPTION_KEY/);
    expect(() => service.decrypt('a:b:c')).toThrow(/ENCRYPTION_KEY/);
  });

  it('uses a random key in development without ENCRYPTION_KEY', () => {
    const service = create({ ENCRYPTION_KEY: undefined, NODE_ENV: 'test' });
    expect(service.decrypt(service.encrypt('secret'))).toBe('secret');
  });
});
