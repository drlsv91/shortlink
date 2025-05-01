import { URL } from "../src/types/url";

// Mock data for tests
export const mockUrls: URL[] = [
  {
    id: "1",
    originalUrl: "https://example.com/very/long/url/path/to/some/page",
    shortPath: "abc123",
    shortUrl: "http://short.est/abc123",
    createdAt: new Date("2023-05-01T12:00:00Z"),
    visitCount: 42,
  },
  {
    id: "2",
    originalUrl: "https://another-example.org/with/different/path",
    shortPath: "def456",
    shortUrl: "http://short.est/def456",
    createdAt: new Date("2023-05-02T14:30:00Z"),
    visitCount: 27,
  },
  {
    id: "3",
    originalUrl: "https://third-example.net/some/resource",
    shortPath: "ghi789",
    shortUrl: "http://short.est/ghi789",
    createdAt: new Date("2023-05-03T09:15:00Z"),
    visitCount: 13,
  },
];

// Mock pagination data
export const mockPagination = {
  total: 25,
  page: 1,
  limit: 10,
  totalPages: 3,
  hasNextPage: true,
  hasPrevPage: false,
};

// Mock API implementation
export const api = {
  shortenUrl: jest.fn().mockImplementation(() => {
    return Promise.resolve({ shortUrl: `http://short.est/${Math.random().toString(36).substring(2, 8)}` });
  }),

  getOriginalUrl: jest.fn().mockImplementation((urlPath: string) => {
    const url = mockUrls.find((url) => url.shortPath === urlPath);
    if (url) {
      return Promise.resolve({ originalUrl: url.originalUrl });
    }
    return Promise.reject(new Error("URL not found"));
  }),

  getUrlStatistics: jest.fn().mockImplementation((urlPath: string) => {
    const url = mockUrls.find((url) => url.shortPath === urlPath);
    if (url) {
      return Promise.resolve({
        ...url,
        visitsByDay: [{ date: "2023-05-01", count: url.visitCount }],
        visitsByCountry: [
          { country: "US", count: Math.floor(url.visitCount * 0.7) },
          { country: "Other", count: Math.floor(url.visitCount * 0.3) },
        ],
      });
    }
    return Promise.reject(new Error("URL not found"));
  }),

  listUrls: jest.fn().mockImplementation((search?: string, page: number = 1, limit: number = 10) => {
    let filteredUrls = [...mockUrls];

    // Apply search filter if provided
    if (search && search.length >= 3) {
      filteredUrls = filteredUrls.filter((url) => url.originalUrl.toLowerCase().includes(search.toLowerCase()));
    }

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUrls = filteredUrls.slice(startIndex, endIndex);

    const response = {
      data: paginatedUrls,
      pagination: {
        total: filteredUrls.length,
        page,
        limit,
        totalPages: Math.ceil(filteredUrls.length / limit),
        hasNextPage: endIndex < filteredUrls.length,
        hasPrevPage: page > 1,
      },
    };

    return Promise.resolve(response);
  }),
};

export default api;
