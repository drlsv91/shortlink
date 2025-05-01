import request from "supertest";
import app from "../src/app";
import { prismaMock } from "./helpers/prisma-mock";
import { UrlEncoder } from "../src/utils/urlEncoder";
describe("URL Controller", () => {
  const mockDate = new Date("2023-10-25T12:00:00Z");
  const mockUrl = {
    id: "123",
    originalUrl: "https://example.com",
    shortPath: "AbCdEf",
    createdAt: mockDate,
    visitCount: 0,
  };

  const mockUrlWithVisit = {
    ...mockUrl,
    visitCount: 1,
  };

  afterAll(() => {
    jest.clearAllMocks();
  });
  describe("POST /api/encode", () => {
    test("should encode a URL", async () => {
      prismaMock.url.findFirst.mockResolvedValueOnce(null);
      prismaMock.url.findUnique.mockResolvedValueOnce(null);
      prismaMock.url.create.mockResolvedValueOnce(mockUrl);

      const response = await request(app).post("/api/encode").send({ originalUrl: mockUrl.originalUrl }).expect(201);

      expect(response.body).toHaveProperty("metadata");
      expect(response.body.metadata).toHaveProperty("originalUrl", mockUrl.originalUrl);
      expect(response.body.metadata).toHaveProperty("shortUrl");

      expect(prismaMock.url.findFirst).toHaveBeenCalledWith({
        where: { originalUrl: mockUrl.originalUrl },
      });

      expect(prismaMock.url.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          originalUrl: mockUrl.originalUrl,
          shortPath: expect.any(String),
          visitCount: 0,
        }),
      });
    });

    it("should return existing URL when same URL is shortened again", async () => {
      prismaMock.url.findFirst.mockResolvedValueOnce(mockUrl);

      const response = await request(app).post("/api/encode").send({ originalUrl: "https://example.com" }).expect(201);

      expect(response.body).toHaveProperty("status", 201);
      expect(response.body).toHaveProperty("metadata");
      expect(response.body.metadata).toHaveProperty("originalUrl", "https://example.com");

      expect(prismaMock.url.findFirst).toHaveBeenCalledWith({
        where: { originalUrl: "https://example.com" },
      });

      expect(prismaMock.url.create).not.toHaveBeenCalled();
    });

    it("should validate input URL format", async () => {
      const response = await request(app).post("/api/encode").send({ originalUrl: "not-a-valid-url" }).expect(400);

      expect(response.body).toHaveProperty("errors");
      expect(response.body.errors.length).toBe(1);
      expect(response.body.errors[0].msg).toBe("Invalid URL format");

      expect(prismaMock.url.findFirst).not.toHaveBeenCalled();
    });

    it("should handle collisions and retry", async () => {
      const originalEncode = UrlEncoder.encode;
      UrlEncoder.encode = jest.fn().mockReturnValueOnce("AbCdEf").mockReturnValueOnce("XyZ123");

      prismaMock.url.findFirst.mockResolvedValueOnce(null);
      prismaMock.url.findUnique.mockResolvedValueOnce(mockUrl).mockResolvedValueOnce(null);
      prismaMock.url.create.mockResolvedValueOnce({
        ...mockUrl,
        shortPath: "XyZ123",
      });

      await request(app).post("/api/encode").send({ originalUrl: "https://example.com" }).expect(500);

      expect(prismaMock.url.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaMock.url.findUnique).toHaveBeenCalledTimes(1);

      UrlEncoder.encode = originalEncode;
    });
  });

  describe("POST /api/decode", () => {
    it("should decode a shortened URL", async () => {
      prismaMock.url.findUnique.mockResolvedValueOnce(mockUrl);
      prismaMock.url.update.mockResolvedValueOnce({
        ...mockUrl,
        visitCount: 1,
      });

      const response = await request(app).post("/api/decode").send({ shortUrl: "http://short.est/AbCdEf" }).expect(200);

      expect(response.body).toHaveProperty("status", 200);
      expect(response.body).toHaveProperty("metadata");
      expect(response.body.metadata).toHaveProperty("originalUrl", "https://example.com");
      expect(response.body.metadata).toHaveProperty("shortUrl", "http://short.est/AbCdEf");

      // Verify database was called correctly
      expect(prismaMock.url.findUnique).toHaveBeenCalledWith({
        where: { shortPath: "AbCdEf" },
      });
      expect(prismaMock.url.update).toHaveBeenCalledWith({
        where: { id: "123" },
        data: { visitCount: { increment: 1 } },
      });
    });

    it("should return 404 for non-existent URL", async () => {
      prismaMock.url.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .post("/api/decode")
        .send({ shortUrl: "http://short.est/NotFound" })
        .expect(404);

      expect(response.body).toHaveProperty("status", 404);
      expect(response.body).toHaveProperty("error", "URL not found");

      // Verify database was called correctly
      expect(prismaMock.url.findUnique).toHaveBeenCalledWith({
        where: { shortPath: "NotFound" },
      });
    });
  });

  describe("GET /api/statistic/:url_path", () => {
    it("should get statistics for a URL", async () => {
      // Mock finding the URL
      prismaMock.url.findUnique.mockResolvedValueOnce({
        ...mockUrl,
        visitCount: 5,
      });

      const response = await request(app).get("/api/statistic/AbCdEf").expect(200);

      expect(response.body).toHaveProperty("status", 200);
      expect(response.body).toHaveProperty("metadata");
      expect(response.body.metadata).toHaveProperty("originalUrl", "https://example.com");
      expect(response.body.metadata).toHaveProperty("shortPath", "AbCdEf");
      expect(response.body.metadata).toHaveProperty("visitCount", 5);

      // Verify database was called correctly
      expect(prismaMock.url.findUnique).toHaveBeenCalledWith({
        where: { shortPath: "AbCdEf" },
      });
    });

    it("should return 404 for non-existent URL", async () => {
      // Mock URL not found
      prismaMock.url.findUnique.mockResolvedValueOnce(null);

      const response = await request(app).get("/api/statistic/NonExistentPath").expect(404);

      expect(response.body).toHaveProperty("status", 404);
      expect(response.body).toHaveProperty("error", "URL not found");

      expect(prismaMock.url.findUnique).toHaveBeenCalledWith({
        where: { shortPath: "NonExistentPath" },
      });
    });
  });

  describe("GET /api/list", () => {
    it("should list all URLs", async () => {
      // Mock finding all URLs
      prismaMock.url.findMany.mockResolvedValueOnce([
        mockUrl,
        { ...mockUrl, id: "456", shortPath: "Xyz123", originalUrl: "https://another-example.com" },
      ]);

      const response = await request(app).get("/api/list").expect(200);

      expect(response.body).toHaveProperty("status", 200);
      expect(response.body).toHaveProperty("metadata");
      expect(response.body.metadata).toHaveProperty("data");
      const data = response.body.metadata.data;
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(2);

      // Verify database was called correctly
      expect(prismaMock.url.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 20,
      });
    });

    it("should filter URLs by search term", async () => {
      prismaMock.url.findMany.mockResolvedValueOnce([mockUrl]);

      const response = await request(app).get("/api/list?search=example").expect(200);

      expect(response.body).toHaveProperty("status", 200);
      expect(response.body).toHaveProperty("metadata");
      expect(response.body.metadata).toHaveProperty("data");
      const data = response.body.metadata.data;
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(1);

      // Verify database was called correctly with search parameter
      expect(prismaMock.url.findMany).toHaveBeenCalledWith({
        where: { originalUrl: { contains: "example", mode: "insensitive" } },
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 20,
      });
    });
    it("should filter URLs by pagination", async () => {
      prismaMock.url.findMany.mockResolvedValueOnce([mockUrl]);

      await request(app).get("/api/list?page=2&limit=22").expect(200);

      // Verify database was called correctly with search parameter
      expect(prismaMock.url.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: "desc" },
        skip: 22,
        take: 22,
      });
    });

    it("should return 400 for search term less than 3 characters", async () => {
      const response = await request(app).get("/api/list?search=ex").expect(400);

      expect(response.body).toHaveProperty("status", 400);
      expect(response.body).toHaveProperty("errors");

      expect(prismaMock.url.findMany).not.toHaveBeenCalled();
    });
    it("should return 400 for invalid pagination data", async () => {
      await request(app).get("/api/list?page=1e").expect(400);
      await request(app).get("/api/list?page=1001").expect(400);
      await request(app).get("/api/list?limit=1001").expect(400);
      await request(app).get("/api/list?limit=1x").expect(400);

      expect(prismaMock.url.findMany).not.toHaveBeenCalled();
    });
  });

  describe("GET /:url_path (redirect)", () => {
    it("should redirect to the original URL", async () => {
      // Setup mocks
      prismaMock.url.findUnique.mockResolvedValueOnce(mockUrl);
      prismaMock.url.update.mockResolvedValueOnce(mockUrlWithVisit);

      const response = await request(app).get("/AbCdEf").expect(302); // 302 is the redirect status code

      expect(response.header.location).toBe("https://example.com");

      expect(prismaMock.url.findUnique).toHaveBeenCalledWith({
        where: { shortPath: "AbCdEf" },
      });
      expect(prismaMock.url.update).toHaveBeenCalledWith({
        where: { id: "123" },
        data: { visitCount: { increment: 1 } },
      });
    });

    it("should return 404 for non-existent URL", async () => {
      prismaMock.url.findUnique.mockResolvedValueOnce(null);

      const response = await request(app).get("/NonExistentPath").expect(404);

      expect(response.text).toBe("URL not found");

      // Verify database was called correctly
      expect(prismaMock.url.findUnique).toHaveBeenCalledWith({
        where: { shortPath: "NonExistentPath" },
      });
    });
  });

  describe("End-to-end URL shortening workflow", () => {
    it("should create, redirect, and show updated statistics", async () => {
      prismaMock.url.findFirst.mockResolvedValueOnce(null);
      prismaMock.url.findUnique.mockResolvedValueOnce(null);
      prismaMock.url.create.mockResolvedValueOnce(mockUrl);

      await request(app).post("/api/encode").send({ originalUrl: "https://example.com" }).expect(201);

      prismaMock.url.findUnique.mockResolvedValueOnce(mockUrl);
      prismaMock.url.update.mockResolvedValueOnce(mockUrlWithVisit);

      await request(app).get("/AbCdEf").expect(302).expect("Location", "https://example.com");

      prismaMock.url.findUnique.mockResolvedValueOnce(mockUrlWithVisit);

      const statsResponse = await request(app).get("/api/statistic/AbCdEf").expect(200);

      expect(statsResponse.body.metadata.visitCount).toBe(1);

      expect(prismaMock.url.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.url.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.url.findUnique).toHaveBeenCalledTimes(3);
    });
  });
});
