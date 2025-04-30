export interface CreateURLDTO {
  originalUrl: string;
}

export interface URLStatistics {
  originalUrl: string;
  shortPath: string;
  shortUrl: string;
  createdAt: Date;
  visitCount: number;
}
