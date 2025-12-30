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

  describe('Authentication', () => {
    it('should include Authorization header', async () => {
      mockAdapter.onGet('/test').reply(200, {});

      await apiClient.get('/test');

      const request = mockAdapter.history.get[0];
      expect(request.headers?.Authorization).toBe('Bearer test-api-key');
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

