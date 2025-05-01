export interface URL {
  id: string;
  originalUrl: string;
  shortUrl: string;
  shortPath: string;
  createdAt: Date;
  visitCount: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
