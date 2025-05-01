export interface CreateURLDTO {
  originalUrl: string;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface URLStatistics {
  id: string;
  originalUrl: string;
  shortPath: string;
  shortUrl: string;
  createdAt: Date;
  visitCount: number;
}
