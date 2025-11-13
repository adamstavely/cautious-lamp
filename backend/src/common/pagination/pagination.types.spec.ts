import { parsePaginationParams, createPaginatedResponse } from './pagination.types';

describe('Pagination Utilities', () => {
  describe('parsePaginationParams', () => {
    it('should parse default pagination', () => {
      const params = parsePaginationParams({});

      expect(params.page).toBe(1);
      expect(params.limit).toBe(20);
      expect(params.offset).toBe(0);
    });

    it('should parse page and limit', () => {
      const params = parsePaginationParams({
        page: '2',
        limit: '10',
      });

      expect(params.page).toBe(2);
      expect(params.limit).toBe(10);
      expect(params.offset).toBe(10);
    });

    it('should use offset if provided', () => {
      const params = parsePaginationParams({
        offset: '25',
      });

      expect(params.offset).toBe(25);
    });

    it('should enforce minimum values', () => {
      const params = parsePaginationParams({
        page: '0',
        limit: '-5',
      });

      expect(params.page).toBe(1);
      expect(params.limit).toBe(1);
    });

    it('should enforce maximum limit', () => {
      const params = parsePaginationParams({
        limit: '200',
      });

      expect(params.limit).toBe(100);
    });
  });

  describe('createPaginatedResponse', () => {
    it('should create paginated response', () => {
      const data = [1, 2, 3, 4, 5];
      const params = { page: 1, limit: 2, offset: 0 };
      const response = createPaginatedResponse(data, 10, params);

      expect(response.data).toEqual(data);
      expect(response.pagination.total).toBe(10);
      expect(response.pagination.page).toBe(1);
      expect(response.pagination.limit).toBe(2);
      expect(response.pagination.totalPages).toBe(5);
      expect(response.pagination.hasNext).toBe(true);
      expect(response.pagination.hasPrevious).toBe(false);
    });

    it('should calculate hasNext and hasPrevious correctly', () => {
      const data = [1, 2];
      const params = { page: 2, limit: 2, offset: 2 };
      const response = createPaginatedResponse(data, 5, params);

      expect(response.pagination.hasNext).toBe(true);
      expect(response.pagination.hasPrevious).toBe(true);
    });

    it('should handle last page', () => {
      const data = [1];
      const params = { page: 3, limit: 2, offset: 4 };
      const response = createPaginatedResponse(data, 5, params);

      expect(response.pagination.hasNext).toBe(false);
      expect(response.pagination.hasPrevious).toBe(true);
    });
  });
});

