import { getPatterns, getPattern, getPatternsByComponent } from '../../../src/tools/patterns.tool';
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

describe('Patterns Tool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPatterns', () => {
    it('should retrieve all patterns', async () => {
      const mockResponse = {
        patterns: [
          { id: 'pattern1', name: 'Pattern 1', description: 'Test pattern', category: 'layout' as const, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        ],
        count: 1,
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await getPatterns({});

      expect(result).toEqual(mockResponse);
      expect(mockApiClient.get).toHaveBeenCalledWith('/patterns-library/patterns', {}, 'patterns');
    });
  });

  describe('getPattern', () => {
    it('should retrieve a specific pattern', async () => {
      const mockPattern = {
        id: 'pattern1',
        name: 'Pattern 1',
        description: 'Test pattern',
        category: 'layout' as const,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      mockApiClient.get.mockResolvedValue(mockPattern);

      const result = await getPattern({ id: 'pattern1' });

      expect(result).toEqual(mockPattern);
    });
  });

  describe('getPatternsByComponent', () => {
    it('should retrieve patterns for a component', async () => {
      const mockResponse = {
        patterns: [
          { id: 'pattern1', name: 'Pattern 1', description: 'Test', category: 'layout' as const, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        ],
        count: 1,
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await getPatternsByComponent({ componentId: 'button' });

      expect(result).toEqual(mockResponse);
    });
  });
});


