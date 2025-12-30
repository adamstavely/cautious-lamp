// Jest setup file
// This file runs before each test file

// Suppress console output during tests unless DEBUG is set
if (!process.env.DEBUG) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

// Set default environment variables for tests
process.env.MCP_API_BASE_URL = process.env.MCP_API_BASE_URL || 'http://localhost:3000/api/v1';
process.env.MCP_API_KEY = process.env.MCP_API_KEY || 'test-api-key';
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'error'; // Suppress logs during tests
process.env.CACHE_ENABLED = process.env.CACHE_ENABLED !== undefined ? process.env.CACHE_ENABLED : 'false'; // Disable cache by default in tests


