const mockConfig = { apiBaseUrl: 'http://localhost:3000/api/v1', apiKey: 'k' };
jest.mock('../../src/config', () => ({ config: mockConfig }));

import { apiRootUrl, rootPath } from '../../src/api-root';

describe('apiRootUrl', () => {
  it.each([
    ['http://localhost:3000/api/v1', 'http://localhost:3000'],
    ['http://localhost:3000/api/v1/', 'http://localhost:3000'],
    ['https://ds.example.com/backend/api/v2', 'https://ds.example.com/backend'],
    ['http://localhost:3000', 'http://localhost:3000'],
  ])('maps %s to %s', (base, root) => {
    mockConfig.apiBaseUrl = base;
    expect(apiRootUrl()).toBe(root);
  });

  it('builds root-mounted paths', () => {
    mockConfig.apiBaseUrl = 'http://localhost:3000/api/v1';
    expect(rootPath('/review/1')).toBe('http://localhost:3000/review/1');
    expect(rootPath('admin/reviews')).toBe('http://localhost:3000/admin/reviews');
  });
});
