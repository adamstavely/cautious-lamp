import { assertPublicHttpUrl, isBlockedAddress } from './url-safety';

jest.mock('dns/promises', () => ({
  lookup: jest.fn(async (hostname: string) => {
    const table: Record<string, string[]> = {
      'example.com': ['93.184.215.14'],
      'internal.example': ['10.1.2.3'],
      'mixed.example': ['93.184.215.14', '127.0.0.1'],
    };
    if (!table[hostname]) throw new Error('ENOTFOUND');
    return table[hostname].map((address) => ({ address, family: address.includes(':') ? 6 : 4 }));
  }),
}));

describe('url safety', () => {
  it.each([
    '127.0.0.1',
    '10.0.0.5',
    '172.20.1.1',
    '192.168.1.1',
    '169.254.169.254',
    '100.64.0.1',
    '0.0.0.0',
    '::1',
    'fd00::1',
    'fe80::1',
    '::ffff:127.0.0.1',
  ])('blocks %s', (address) => {
    expect(isBlockedAddress(address)).toBe(true);
  });

  it.each(['93.184.215.14', '2606:4700::6810:84e5'])('allows %s', (address) => {
    expect(isBlockedAddress(address)).toBe(false);
  });

  it('accepts a public URL', async () => {
    await expect(assertPublicHttpUrl('https://example.com/page')).resolves.toBeInstanceOf(URL);
  });

  it.each([
    'http://169.254.169.254/latest/meta-data/',
    'http://127.0.0.1:9200/_cat/indices',
    'http://[::1]/',
    'http://internal.example/',
    'http://mixed.example/',
    'file:///etc/passwd',
    'http://user:pass@example.com/',
    'http://no-such-host.example/',
  ])('rejects %s', async (url) => {
    await expect(assertPublicHttpUrl(url)).rejects.toThrow();
  });
});
