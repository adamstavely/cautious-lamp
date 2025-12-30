import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { apiClient } from '../../src/api-client';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Mock all dependencies
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

// Mock the actual server implementation
jest.mock('../../src/index', () => {
  // Return a mock server that we can test
  return {};
});

describe('MCP Server E2E', () => {
  let mockAdapter: MockAdapter;

  beforeEach(() => {
    const axiosInstance = (apiClient as any).client;
    mockAdapter = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAdapter.restore();
  });

  describe('Tool Execution Flow', () => {
    it('should execute get_tokens tool end-to-end', async () => {
      const mockResponse = {
        tokens: [
          { name: 'color.primary', value: '#0066CC', type: 'color', category: 'color' },
        ],
        count: 1,
      };

      mockAdapter.onGet('/tokens').reply(200, mockResponse);

      // Import and test the actual function
      const { getTokens } = await import('../../src/tools/tokens.tool');
      const result = await getTokens({});

      expect(result).toEqual(mockResponse);
    });

    it('should execute get_components tool end-to-end', async () => {
      const mockResponse = {
        components: [
          {
            id: 'button',
            name: 'Button',
            description: 'A button',
            status: 'production',
            props: [],
            code: { vue: '', react: '' },
          },
        ],
        count: 1,
      };

      mockAdapter.onGet('/components').reply(200, mockResponse);

      const { getComponents } = await import('../../src/tools/components.tool');
      const result = await getComponents({});

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle API errors gracefully', async () => {
      mockAdapter.onGet('/tokens').reply(500, { error: 'Internal server error' });

      const { getTokens } = await import('../../src/tools/tokens.tool');

      await expect(getTokens({})).rejects.toThrow();
    });
  });
});


