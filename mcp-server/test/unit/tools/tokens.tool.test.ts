import { getTokens, getToken, searchTokens } from '../../../src/tools/tokens.tool';
import { apiClient } from '../../../src/api-client';

jest.mock('../../../src/api-client');
jest.mock('../../../src/cache', () => ({
  cache: {
    get: jest.fn(() => undefined),
    set: jest.fn(),
    isEnabled: jest.fn(() => false),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Tokens Tool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTokens', () => {
    it('should retrieve all tokens', async () => {
      const mockResponse = {
        tokens: [
          { name: 'color.primary', value: '#0066CC', type: 'color', category: 'color' },
          { name: 'spacing.small', value: '8px', type: 'spacing', category: 'spacing' },
        ],
        count: 2,
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await getTokens({});

      expect(result).toEqual(mockResponse);
      expect(mockApiClient.get).toHaveBeenCalledWith('/tokens', {}, 'tokens');
    });

    it('should filter tokens by category', async () => {
      const mockResponse = {
        tokens: [{ name: 'color.primary', value: '#0066CC', type: 'color', category: 'color' }],
        count: 1,
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await getTokens({ category: 'color' });

      expect(result).toEqual(mockResponse);
      expect(mockApiClient.get).toHaveBeenCalledWith('/tokens', { category: 'color' }, 'tokens');
    });
  });

  describe('getToken', () => {
    it('should retrieve a specific token', async () => {
      const mockToken = { name: 'color.primary', value: '#0066CC', type: 'color', category: 'color' };

      mockApiClient.get.mockResolvedValue(mockToken);

      const result = await getToken({ name: 'color.primary' });

      expect(result).toEqual(mockToken);
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/tokens/color.primary',
        { name: 'color.primary' },
        'tokens'
      );
    });
  });

  describe('searchTokens', () => {
    it('should search tokens by query', async () => {
      const allTokens = {
        tokens: [
          { name: 'color.primary', value: '#0066CC', type: 'color', category: 'color', description: 'Primary color' },
          { name: 'color.secondary', value: '#FF6600', type: 'color', category: 'color', description: 'Secondary color' },
          { name: 'spacing.small', value: '8px', type: 'spacing', category: 'spacing' },
        ],
        count: 3,
      };

      mockApiClient.get.mockResolvedValue(allTokens);

      const result = await searchTokens({ query: 'primary' });

      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].name).toBe('color.primary');
    });

    it('should search tokens by description', async () => {
      const allTokens = {
        tokens: [
          { name: 'color.primary', value: '#0066CC', type: 'color', category: 'color', description: 'Primary color' },
          { name: 'spacing.small', value: '8px', type: 'spacing', category: 'spacing' },
        ],
        count: 2,
      };

      mockApiClient.get.mockResolvedValue(allTokens);

      const result = await searchTokens({ query: 'Primary' });

      expect(result.tokens).toHaveLength(1);
      expect(result.tokens[0].name).toBe('color.primary');
    });
  });
});


