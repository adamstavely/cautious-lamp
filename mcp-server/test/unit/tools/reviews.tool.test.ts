import {
  getReviews,
  getReview,
  createReview,
  updateReview,
  updateReviewSchema,
  createReviewSchema,
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

// Review routes live under /api/v1, the API client's base URL (docs/REVIEW_API.md)

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
    it('should list reviews from GET /reviews, not the admin route', async () => {
      mockApiClient.get.mockResolvedValue({ reviews: summaries, total: 3 });

      const result = await getReviews({});

      expect(result).toEqual(summaries);
      expect(mockApiClient.get).toHaveBeenCalledWith('/reviews', {}, 'reviews');
    });

    it('should pass showExpired and the workflow state filter to the server', async () => {
      mockApiClient.get.mockResolvedValue({ reviews: [summaries[2]], total: 1 });

      const result = await getReviews({ showExpired: true, workflowState: 'draft' });

      expect(result.map((r) => r.id)).toEqual(['review-3']);
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/reviews',
        { showExpired: 'true', workflowState: 'draft' },
        'reviews'
      );
    });

    it('should return an empty list for an unexpected body', async () => {
      mockApiClient.get.mockResolvedValue({});
      await expect(getReviews({})).resolves.toEqual([]);
    });
  });

  describe('getReview', () => {
    it('should send the password in the x-review-password header, never the query', async () => {
      mockApiClient.get.mockResolvedValue(summaries[0]);

      const result = await getReview({ reviewId: 'review-1', password: 'pw' });

      expect(result).toEqual(summaries[0]);
      expect(mockApiClient.get).toHaveBeenCalledWith('/review/review-1', {}, undefined, { 'x-review-password': 'pw' });
      expect(JSON.stringify(mockApiClient.get.mock.calls[0][1])).not.toContain('pw');
    });

    it('should send no password header without a password, and encode the id', async () => {
      mockApiClient.get.mockResolvedValue(summaries[0]);

      await getReview({ reviewId: 'a/b' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/review/a%2Fb', {}, undefined, undefined);
    });
  });

  describe('createReview', () => {
    it('should create a review from a URL', async () => {
      mockApiClient.post.mockResolvedValue({ reviewId: 'review-9' });

      const result = await createReview({ url: 'https://example.com/design.pdf' });

      expect(result).toEqual({ reviewId: 'review-9' });
      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/review/create-from-url',
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

    it('should only accept http(s) URLs', () => {
      expect(createReviewSchema.safeParse({ url: 'javascript:alert(1)' }).success).toBe(false);
      expect(createReviewSchema.safeParse({ url: 'ftp://example.com/a' }).success).toBe(false);
      expect(createReviewSchema.safeParse({ url: 'https://example.com/a' }).success).toBe(true);
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
      [{ action: 'reject', stage: 'client_review' }, '/workflow/reject', { stage: 'client_review' }],
      [{ action: 'update_sharing', sharingMode: 'approved_emails', approvedEmails: ['a@x.com'] }, '/sharing', { sharingMode: 'approved_emails', approvedEmails: ['a@x.com'] }],
    ])('should map %o to POST %s', async (extra, suffix, body) => {
      mockApiClient.post.mockResolvedValue({ id: 'review-1' });

      await updateReview({ reviewId: 'review-1', ...(extra as any) });

      expect(mockApiClient.post).toHaveBeenCalledWith(`/review/review-1${suffix}`, body, 'reviews');
    });

    it('should require a stage for approve', () => {
      const result = updateReviewSchema.safeParse({ reviewId: 'review-1', action: 'approve' });
      expect(result.success).toBe(false);
    });

    it('should only accept the contract workflow states and sharing modes', () => {
      for (const stage of ['ad_changes_requested', 'rejected']) {
        expect(updateReviewSchema.safeParse({ reviewId: 'r', action: 'approve', stage }).success).toBe(false);
      }
      expect(
        updateReviewSchema.safeParse({ reviewId: 'r', action: 'update_sharing', sharingMode: 'restricted' }).success
      ).toBe(false);
    });
  });

  describe('searchReviews', () => {
    it('should search server-side with q', async () => {
      mockApiClient.get.mockResolvedValue({ reviews: [summaries[0], summaries[2]], total: 2 });

      const result = await searchReviews({ query: 'alice', workflowState: 'client_review' });

      expect(result.map((r) => r.id)).toEqual(['review-1', 'review-3']);
      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/reviews',
        { q: 'alice', workflowState: 'client_review' },
        'reviews'
      );
    });
  });

  describe('comments', () => {
    it('should get comments for a version', async () => {
      mockApiClient.get.mockResolvedValue([]);

      await getReviewComments({ reviewId: 'review-1', versionId: 'v2' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/review/review-1/comments', { versionId: 'v2' }, undefined, undefined);
    });

    it('should send the password header for comments on a protected review', async () => {
      mockApiClient.get.mockResolvedValue([]);

      await getReviewComments({ reviewId: 'review-1', password: 'pw' });

      expect(mockApiClient.get).toHaveBeenCalledWith('/review/review-1/comments', {}, undefined, {
        'x-review-password': 'pw',
      });
    });

    it('should add a comment', async () => {
      mockApiClient.post.mockResolvedValue({ id: 'c1', text: 'Nice' });

      await addReviewComment({ reviewId: 'review-1', text: 'Nice', version: 'v1' });

      expect(mockApiClient.post).toHaveBeenCalledWith('/review/review-1/comments', {
        text: 'Nice',
        version: 'v1',
        resolved: false,
      });
    });
  });
});
