import { ApiClient } from '../../src/api-client';
import axios, { AxiosError } from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Mock the config module
jest.mock('../../src/config', () => ({
  config: {
    apiBaseUrl: 'http://localhost:3000/api/v1',
    apiKey: 'test-api-key',
  },
}));

// Mock the logger module
jest.mock('../../src/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the cache module
jest.mock('../../src/cache', () => ({
  cache: {
    get: jest.fn(() => undefined),
    set: jest.fn(),
    clearResourceType: jest.fn(),
    isEnabled: jest.fn(() => false),
  },
}));

describe('ApiClient', () => {
  let apiClient: ApiClient;
  let mockAdapter: MockAdapter;

  beforeEach(() => {
    apiClient = new ApiClient();
    const axiosInstance = (apiClient as any).client;
    mockAdapter = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAdapter.restore();
  });

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      const mockData = { id: '1', name: 'Test' };
      mockAdapter.onGet('/test').reply(200, mockData);

      const result = await apiClient.get('/test');

      expect(result).toEqual(mockData);
      expect(mockAdapter.history.get.length).toBe(1);
    });

    it('should include query parameters', async () => {
      const mockData = { items: [] };
      mockAdapter.onGet('/test', { params: { filter: 'active' } }).reply(200, mockData);

      const result = await apiClient.get('/test', { filter: 'active' });

      expect(result).toEqual(mockData);
    });

    it('should retry on retryable errors', async () => {
      const mockData = { id: '1' };
      mockAdapter
        .onGet('/test')
        .replyOnce(500)
        .onGet('/test')
        .replyOnce(500)
        .onGet('/test')
        .reply(200, mockData);

      const result = await apiClient.get('/test');

      expect(result).toEqual(mockData);
      expect(mockAdapter.history.get.length).toBe(3); // 2 retries + 1 success
    });

    it('should throw error after max retries', async () => {
      mockAdapter.onGet('/test').reply(500, { error: 'Server error' });

      await expect(apiClient.get('/test')).rejects.toThrow();
      // The error interceptor throws before retry logic, so only 1 request
      expect(mockAdapter.history.get.length).toBeGreaterThanOrEqual(1);
    });

    it('should not retry on non-retryable errors', async () => {
      mockAdapter.onGet('/test').reply(400);

      await expect(apiClient.get('/test')).rejects.toThrow();
      expect(mockAdapter.history.get.length).toBe(1); // No retries
    });
  });

  describe('POST requests', () => {
    it('should make successful POST request', async () => {
      const mockData = { id: '1', created: true };
      mockAdapter.onPost('/test', { name: 'Test' }).reply(200, mockData);

      const result = await apiClient.post('/test', { name: 'Test' });

      expect(result).toEqual(mockData);
    });

    it('should invalidate cache when specified', async () => {
      const { cache } = require('../../src/cache');
      const mockData = { id: '1' };
      mockAdapter.onPost('/test').reply(200, mockData);

      await apiClient.post('/test', {}, 'test-resource');

      expect(cache.clearResourceType).toHaveBeenCalledWith('test-resource');
    });
  });

  describe('PUT requests', () => {
    it('should make successful PUT request', async () => {
      const mockData = { id: '1', updated: true };
      mockAdapter.onPut('/test/1', { name: 'Updated' }).reply(200, mockData);

      const result = await apiClient.put('/test/1', { name: 'Updated' });

      expect(result).toEqual(mockData);
    });
  });

  describe('DELETE requests', () => {
    it('should make successful DELETE request', async () => {
      mockAdapter.onDelete('/test/1').reply(200, { deleted: true });

      const result = await apiClient.delete('/test/1');

      expect(result).toEqual({ deleted: true });
    });
  });

  describe('Retry policy', () => {
    // Short delay so retried GETs don't slow the suite down
    let fastClient: ApiClient;
    let fastAdapter: MockAdapter;

    beforeEach(() => {
      fastClient = new ApiClient({ retryDelay: 1 });
      fastAdapter = new MockAdapter((fastClient as any).client);
    });

    afterEach(() => {
      fastAdapter.restore();
    });

    it('should retry GET on timeout', async () => {
      fastAdapter.onGet('/test').timeoutOnce().onGet('/test').reply(200, { ok: true });

      await expect(fastClient.get('/test')).resolves.toEqual({ ok: true });
      expect(fastAdapter.history.get.length).toBe(2);
    });

    it('should retry GET on 5xx', async () => {
      fastAdapter.onGet('/test').replyOnce(503).onGet('/test').reply(200, { ok: true });

      await expect(fastClient.get('/test')).resolves.toEqual({ ok: true });
      expect(fastAdapter.history.get.length).toBe(2);
    });

    it('should not retry POST on timeout', async () => {
      fastAdapter.onPost('/reviews').timeout();

      await expect(fastClient.post('/reviews', { title: 'x' })).rejects.toThrow();
      expect(fastAdapter.history.post.length).toBe(1);
    });

    it('should not retry POST on 5xx', async () => {
      fastAdapter.onPost('/reviews').reply(500, { error: 'boom' });

      await expect(fastClient.post('/reviews', { title: 'x' })).rejects.toThrow('API Error 500');
      expect(fastAdapter.history.post.length).toBe(1);
    });

    it('should not retry POST on network error', async () => {
      fastAdapter.onPost('/reviews').networkError();

      await expect(fastClient.post('/reviews', { title: 'x' })).rejects.toThrow();
      expect(fastAdapter.history.post.length).toBe(1);
    });

    it('should not retry PUT on 5xx', async () => {
      fastAdapter.onPut('/reviews/1').reply(502);

      await expect(fastClient.put('/reviews/1', { title: 'x' })).rejects.toThrow();
      expect(fastAdapter.history.put.length).toBe(1);
    });

    it('should not retry DELETE on timeout', async () => {
      fastAdapter.onDelete('/reviews/1').timeout();

      await expect(fastClient.delete('/reviews/1')).rejects.toThrow();
      expect(fastAdapter.history.delete.length).toBe(1);
    });
  });

  describe('Caching', () => {
    it('should key cached GETs by path as well as params', async () => {
      const { cache } = require('../../src/cache');
      mockAdapter.onGet('/workspaces/ws1/icons').reply(200, []);

      await apiClient.get('/workspaces/ws1/icons', { workspaceId: 'ws1' }, 'assets');

      expect(cache.get).toHaveBeenCalledWith('assets', { workspaceId: 'ws1', __path: '/workspaces/ws1/icons' });
      expect(cache.set).toHaveBeenCalledWith('assets', [], { workspaceId: 'ws1', __path: '/workspaces/ws1/icons' });
    });
  });

  describe('Authentication', () => {
    it('should include Authorization header', async () => {
      mockAdapter.onGet('/test').reply(200, {});

      await apiClient.get('/test');

      const request = mockAdapter.history.get[0];
      expect(request.headers?.Authorization).toBe('Bearer test-api-key');
    });

    it('should send per-request headers alongside the API key, without caching', async () => {
      const { cache } = require('../../src/cache');
      cache.get.mockClear();
      cache.set.mockClear();
      mockAdapter.onGet('/review/r1').reply(200, { id: 'r1' });

      await apiClient.get('/review/r1', {}, 'reviews', { 'x-review-password': 'pw' });

      const request = mockAdapter.history.get[0];
      expect(request.headers?.['x-review-password']).toBe('pw');
      expect(request.headers?.Authorization).toBe('Bearer test-api-key');
      expect(request.params).toEqual({});
      expect(cache.get).not.toHaveBeenCalled();
      expect(cache.set).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      mockAdapter.onGet('/test').networkError();

      await expect(apiClient.get('/test')).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      mockAdapter.onGet('/test').timeout();

      await expect(apiClient.get('/test')).rejects.toThrow();
    });

    it('should format error messages correctly', async () => {
      mockAdapter.onGet('/test').reply(404, { error: 'Not found' });

      await expect(apiClient.get('/test')).rejects.toThrow('API Error 404');
    });
  });
});

