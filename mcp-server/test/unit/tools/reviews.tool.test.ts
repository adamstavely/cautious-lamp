import { getReviews, getReview, createReview, updateReview, searchReviews } from '../../../src/tools/reviews.tool';
import { apiClient } from '../../../src/api-client';

jest.mock('../../../src/api-client');
jest.mock('../../../src/cache', () => ({
  cache: {
    get: jest.fn(() => undefined),
    set: jest.fn(),
    clearResourceType: jest.fn(),
    isEnabled: jest.fn(() => false),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Reviews Tool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getReviews', () => {
    it('should retrieve reviews for a workspace', async () => {
      const mockReviews = [
        { id: 'review1', title: 'Review 1', status: 'pending' as const, workspaceId: 'ws1', createdAt: '2024-01-01', createdBy: 'user1' },
      ];

      mockApiClient.get.mockResolvedValue(mockReviews);

      const result = await getReviews({ workspaceId: 'ws1' });

      expect(result).toEqual(mockReviews);
    });
  });

  describe('createReview', () => {
    it('should create a new review', async () => {
      const mockReview = {
        id: 'review1',
        title: 'New Review',
        status: 'pending' as const,
        workspaceId: 'ws1',
        createdAt: '2024-01-01',
        createdBy: 'user1',
      };

      mockApiClient.post.mockResolvedValue(mockReview);

      const result = await createReview({
        workspaceId: 'ws1',
        title: 'New Review',
        createdBy: 'user1',
      });

      expect(result).toEqual(mockReview);
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/workspaces/ws1/reviews',
        expect.objectContaining({ title: 'New Review' }),
        'reviews'
      );
    });
  });

  describe('updateReview', () => {
    it('should update a review', async () => {
      const mockReview = {
        id: 'review1',
        title: 'Updated Review',
        status: 'approved' as const,
        workspaceId: 'ws1',
        createdAt: '2024-01-01',
        createdBy: 'user1',
      };

      mockApiClient.put.mockResolvedValue(mockReview);

      const result = await updateReview({
        workspaceId: 'ws1',
        reviewId: 'review1',
        status: 'approved',
      });

      expect(result).toEqual(mockReview);
      expect(mockApiClient.put).toHaveBeenCalledWith(
        '/workspaces/ws1/reviews/review1',
        { status: 'approved' },
        'reviews'
      );
    });
  });
});


