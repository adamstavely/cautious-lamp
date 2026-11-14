import { getAssets, getIcons, getAssetById, searchAssets, getAssetTypes } from '../../../src/tools/assets.tool';
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

describe('Assets Tool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAssets', () => {
    it('should retrieve assets for a workspace', async () => {
      const mockAssets = [
        { id: 'asset1', name: 'Asset 1', type: 'image' as const, url: 'http://example.com/asset1.jpg', workspaceId: 'ws1', createdAt: '2024-01-01', createdBy: 'user1' },
      ];

      mockApiClient.get.mockResolvedValue(mockAssets);

      const result = await getAssets({ workspaceId: 'ws1' });

      expect(result).toEqual(mockAssets);
      expect(mockApiClient.get).toHaveBeenCalledWith('/workspaces/ws1/resources/assets', undefined, 'assets');
    });

    it('sends the type as the resource API `filter`', async () => {
      mockApiClient.get.mockResolvedValue([]);

      await getAssets({ workspaceId: 'ws 1', type: 'logo' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/workspaces/ws%201/resources/assets', { filter: 'logo' }, 'assets');
    });
  });

  describe('getIcons', () => {
    it('should retrieve icons for a workspace', async () => {
      const mockIcons = [
        { id: 'icon1', name: 'Icon 1', workspaceId: 'ws1', createdAt: '2024-01-01', createdBy: 'user1' },
      ];

      mockApiClient.get.mockResolvedValue(mockIcons);

      const result = await getIcons({ workspaceId: 'ws1' });

      expect(result).toEqual(mockIcons);
      expect(mockApiClient.get).toHaveBeenCalledWith('/workspaces/ws1/resources/icons', undefined, 'assets');
    });

    it('sends the iconSet as the resource API `filter`', async () => {
      mockApiClient.get.mockResolvedValue([]);

      await getIcons({ workspaceId: 'ws1', iconSet: 'material' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/workspaces/ws1/resources/icons', { filter: 'material' }, 'assets');
    });
  });

  describe('getAssetById', () => {
    it('fetches the asset by id from the resource API', async () => {
      const mockAsset = { id: 'asset1', name: 'Asset 1', type: 'image' as const, url: 'http://example.com/asset1.jpg', workspaceId: 'ws1', createdAt: '2024-01-01', createdBy: 'user1' };

      mockApiClient.get.mockResolvedValue(mockAsset);

      const result = await getAssetById({ workspaceId: 'ws1', assetId: 'asset1' });

      expect(result).toEqual(mockAsset);
      expect(mockApiClient.get).toHaveBeenCalledWith('/workspaces/ws1/resources/assets/asset1', undefined, 'assets');
    });

    it('should throw error if asset not found', async () => {
      mockApiClient.get.mockRejectedValue(new Error('API Error 404: Not Found'));

      await expect(getAssetById({ workspaceId: 'ws1', assetId: 'nonexistent' })).rejects.toThrow();
    });
  });

  describe('getAssetTypes', () => {
    it('should return asset types', async () => {
      const result = await getAssetTypes();

      expect(result).toEqual(['image', 'icon', 'illustration', 'logo', 'other']);
    });
  });
});


