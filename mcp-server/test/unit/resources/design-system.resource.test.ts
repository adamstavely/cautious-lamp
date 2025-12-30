import { listDesignSystemResources, readDesignSystemResource } from '../../../src/resources/design-system.resource';
import { apiClient } from '../../../src/api-client';

jest.mock('../../../src/api-client');
jest.mock('../../../src/cache', () => ({
  cache: {
    get: jest.fn(() => undefined),
    set: jest.fn(),
    isEnabled: jest.fn(() => false),
  },
}));
jest.mock('../../../src/logger', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Design System Resource', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listDesignSystemResources', () => {
    it('should list all design system resources', () => {
      const resources = listDesignSystemResources();

      expect(resources.length).toBeGreaterThan(0);
      expect(resources.some((r) => r.uri === 'design-system://tokens')).toBe(true);
      expect(resources.some((r) => r.uri === 'design-system://components')).toBe(true);
    });
  });

  describe('readDesignSystemResource', () => {
    it('should read tokens resource', async () => {
      const mockTokens = [{ name: 'color.primary', value: '#0066CC', type: 'color', category: 'color' }];
      mockApiClient.get.mockResolvedValue({ tokens: mockTokens });

      const result = await readDesignSystemResource('design-system://tokens');

      expect(JSON.parse(result)).toEqual(mockTokens);
    });

    it('should read components resource', async () => {
      const mockComponents = [
        { id: 'button', name: 'Button', description: 'A button', status: 'production' as const, props: [], code: { vue: '', react: '' } },
      ];
      mockApiClient.get.mockResolvedValue({ components: mockComponents });

      const result = await readDesignSystemResource('design-system://components');

      expect(JSON.parse(result)).toEqual(mockComponents);
    });

    it('should throw error for unknown URI', async () => {
      await expect(readDesignSystemResource('design-system://unknown')).rejects.toThrow('Unknown design system resource URI');
    });
  });
});


