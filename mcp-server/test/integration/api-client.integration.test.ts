import { ApiClient } from '../../src/api-client';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Mock config and other dependencies
jest.mock('../../src/config', () => ({
  config: {
    apiBaseUrl: 'http://localhost:3000/api/v1',
    apiKey: 'test-api-key',
  },
}));

jest.mock('../../src/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../../src/cache', () => ({
  cache: {
    get: jest.fn(() => undefined),
    set: jest.fn(),
    isEnabled: jest.fn(() => false),
  },
}));

describe('API Client Integration', () => {
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

  describe('Retry Logic', () => {
    it('should retry with exponential backoff', async () => {
      const startTime = Date.now();
      const mockData = { success: true };

      mockAdapter
        .onGet('/test')
        .replyOnce(500, { error: 'Server error' })
        .onGet('/test')
        .replyOnce(500, { error: 'Server error' })
        .onGet('/test')
        .reply(200, mockData);

      const result = await apiClient.get('/test');

      expect(result).toEqual(mockData);
      expect(mockAdapter.history.get.length).toBe(3);

      // Check that delays were applied (at least 1 second total)
      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeGreaterThan(1000);
    }, 15000); // Increase timeout for this test
  });

  describe('Error Handling', () => {
    it('should handle different HTTP status codes', async () => {
      mockAdapter.onGet('/test').reply(404, { error: 'Not found' });

      await expect(apiClient.get('/test')).rejects.toThrow('API Error 404');
    });

    it('should handle network errors', async () => {
      mockAdapter.onGet('/test').networkError();

      await expect(apiClient.get('/test')).rejects.toThrow();
    });
  });

  describe('Request Flow', () => {
    it('should include proper headers', async () => {
      mockAdapter.onGet('/test').reply(200, {});

      await apiClient.get('/test');

      const request = mockAdapter.history.get[0];
      expect(request.headers?.Authorization).toBe('Bearer test-api-key');
      expect(request.headers?.['Content-Type']).toBe('application/json');
    });
  });
});

