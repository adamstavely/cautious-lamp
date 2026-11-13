import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  updateReviewSchema,
  searchReviews,
  getReviewComments,
  addReviewComment,
} from '../../../src/tools/reviews.tool';
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

// Review routes match frontend/src/services/api.js and live at the server root, not /api/v1
const ROOT = 'http://localhost:3000';

describe('Reviews Tool', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const summaries = [
    { id: 'review-1', filename: 'homepage.pdf', designer: 'Alice', workflowState: 'client_review' as const },
    { id: 'review-2', filename: 'checkout.fig', designer: 'Bob', workflowState: 'approved' as const },
    { id: 'review-3', filename: 'draft.png', designer: 'Alice' },
  ];

  describe('getReviews', () => {
    it('should list reviews from the admin endpoint', async () => {
      mockApiClient.get.mockResolvedValue(summaries);

      const result = await getReviews({});

      expect(result).toEqual(summaries);
      expect(mockApiClient.get).toHaveBeenCalledWith(`${ROOT}/admin/reviews`, {}, 'reviews');
    });

    it('should pass showExpired and filter by workflow state (missing state = draft)', async () => {
      mockApiClient.get.mockResolvedValue({ reviews: summaries });

      const result = await getReviews({ showExpired: true, workflowState: 'draft' });

      expect(result.map((r) => r.id)).toEqual(['review-3']);
      expect(mockApiClient.get).toHaveBeenCalledWith(`${ROOT}/admin/reviews`, { showExpired: 'true' }, 'reviews');
    });
  });

  describe('getReview', () => {
    it('should get a review by id, with password when given', async () => {
      mockApiClient.get.mockResolvedValue(summaries[0]);

      const result = await getReview({ reviewId: 'review-1', password: 'pw' });

      expect(result).toEqual(summaries[0]);
      expect(mockApiClient.get).toHaveBeenCalledWith(`${ROOT}/review/review-1`, { password: 'pw' });
    });
  });

  describe('createReview', () => {
    it('should create a review from a URL', async () => {
      mockApiClient.post.mockResolvedValue({ reviewId: 'review-9' });

      const result = await createReview({ url: 'https://example.com/design.pdf' });

      expect(result).toEqual({ reviewId: 'review-9' });
      expect(mockApiClient.post).toHaveBeenCalledWith(
        `${ROOT}/review/create-from-url`,
        {
          url: 'https://example.com/design.pdf',
          password: undefined,
          bypassClientReview: false,
          sharingMode: 'anyone',
          approvedEmails: [],
        },
        'reviews'
      );
    });
  });

  describe('updateReview', () => {
    it.each([
      [{ action: 'approve', stage: 'client_review' }, '/workflow/approve', { stage: 'client_review' }],
      [{ action: 'reject', stage: 'art_director_review', reason: 'Off brand' }, '/workflow/reject', { stage: 'art_director_review', reason: 'Off brand' }],
      [{ action: 'move_to_client_review' }, '/workflow/move-to-client-review', undefined],
      [{ action: 'move_to_art_director_review' }, '/workflow/move-to-art-director-review', undefined],
      [{ action: 'resubmit', targetStage: 'client_review' }, '/workflow/resubmit', { targetStage: 'client_review' }],
      [{ action: 'complete' }, '/complete', undefined],
      [{ action: 'update_sharing', sharingMode: 'restricted', approvedEmails: ['a@x.com'] }, '/sharing', { sharingMode: 'restricted', approvedEmails: ['a@x.com'] }],
    ])('should map %o to POST %s', async (extra, suffix, body) => {
      mockApiClient.post.mockResolvedValue({ id: 'review-1' });

      await updateReview({ reviewId: 'review-1', ...(extra as any) });

      expect(mockApiClient.post).toHaveBeenCalledWith(`${ROOT}/review/review-1${suffix}`, body, 'reviews');
    });

    it('should require a stage for approve', () => {
      const result = updateReviewSchema.safeParse({ reviewId: 'review-1', action: 'approve' });
      expect(result.success).toBe(false);
    });
  });

  describe('searchReviews', () => {
    it('should match filename or designer', async () => {
      mockApiClient.get.mockResolvedValue(summaries);

      const result = await searchReviews({ query: 'alice' });

      expect(result.map((r) => r.id)).toEqual(['review-1', 'review-3']);
    });
  });

  describe('comments', () => {
    it('should get comments for a version', async () => {
      mockApiClient.get.mockResolvedValue([]);

      await getReviewComments({ reviewId: 'review-1', versionId: 'v2' });

      expect(mockApiClient.get).toHaveBeenCalledWith(`${ROOT}/review/review-1/comments`, { versionId: 'v2' });
    });

    it('should add a comment', async () => {
      mockApiClient.post.mockResolvedValue({ id: 'c1', text: 'Nice' });

      await addReviewComment({ reviewId: 'review-1', text: 'Nice', version: 'v1' });

      expect(mockApiClient.post).toHaveBeenCalledWith(`${ROOT}/review/review-1/comments`, {
        text: 'Nice',
        version: 'v1',
        type: undefined,
        resolved: false,
      });
    });
  });
});
