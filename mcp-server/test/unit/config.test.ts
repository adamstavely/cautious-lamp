import { loadConfig, Config } from '../../src/config';

describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should load default configuration', () => {
    delete process.env.MCP_API_BASE_URL;
    delete process.env.MCP_API_KEY;

    expect(() => loadConfig()).toThrow('API key is required');
  });

  it('should load configuration from environment variables', () => {
    process.env.MCP_API_BASE_URL = 'http://test:3000/api/v1';
    process.env.MCP_API_KEY = 'test-key';

    const config = loadConfig();

    expect(config.apiBaseUrl).toBe('http://test:3000/api/v1');
    expect(config.apiKey).toBe('test-key');
  });

  it('should use default API base URL if not provided', () => {
    process.env.MCP_API_KEY = 'test-key';
    delete process.env.MCP_API_BASE_URL;

    const config = loadConfig();

    expect(config.apiBaseUrl).toBe('http://localhost:3000/api/v1');
    expect(config.apiKey).toBe('test-key');
  });

  it('should validate API base URL format', () => {
    process.env.MCP_API_BASE_URL = 'invalid-url';
    process.env.MCP_API_KEY = 'test-key';

    expect(() => loadConfig()).toThrow('Configuration error');
  });

  it('should require API key', () => {
    process.env.MCP_API_BASE_URL = 'http://localhost:3000/api/v1';
    delete process.env.MCP_API_KEY;

    expect(() => loadConfig()).toThrow('API key is required');
  });

  it('should reject empty API key', () => {
    process.env.MCP_API_BASE_URL = 'http://localhost:3000/api/v1';
    process.env.MCP_API_KEY = '';

    expect(() => loadConfig()).toThrow('API key is required');
  });
});


