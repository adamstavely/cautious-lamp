/**
 * Pagination types and utilities
 */

export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

/**
 * Parse pagination parameters from query
 */
export function parsePaginationParams(query: {
  page?: string | number;
  limit?: string | number;
  offset?: string | number;
}): PaginationParams {
  const page = query.page ? Math.max(1, Number(query.page)) : 1;
  const limit = query.limit ? Math.max(1, Math.min(100, Number(query.limit))) : 20;
  const offset = query.offset ? Math.max(0, Number(query.offset)) : (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / params.limit);

  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrevious: params.page > 1,
    },
  };
}

