import { CustomAttemptsService, testService, UrlService } from "./utils";

describe("RetryOnCollision Decorator", () => {
  beforeEach(() => {
    testService.reset();
  });

  it("should throw an error when max attempts are reached", async () => {
    await expect(testService.alwaysCollides()).rejects.toThrow("Failed to generate unique short URL after 3 attempts");

    expect(testService.attemptsMade).toBe(3);
  });

  it("should retry until success", async () => {
    const result = await testService.succeedsAfterAttempts(3);

    expect(result).toBe("success");

    expect(testService.attemptsMade).toBe(3);

    expect(testService.onRetryCallCount).toBe(2);
  });

  it("should call onRetry with the correct attempt numbers", async () => {
    await testService.succeedsAfterAttempts(4);

    expect(testService.retryAttempts).toEqual([1, 2, 3]);
  });

  it("should not retry if first attempt succeeds", async () => {
    const result = await testService.succeedsAfterAttempts(1);

    expect(result).toBe("success");

    expect(testService.attemptsMade).toBe(1);

    expect(testService.onRetryCallCount).toBe(0);
  });

  it("should respect the maxAttempts parameter", async () => {
    const customService = new CustomAttemptsService();

    await expect(customService.customMaxAttempts()).rejects.toThrow(
      "Failed to generate unique short URL after 2 attempts"
    );

    expect(customService.attemptsMade).toBe(2);
  });

  describe("Real-world scenario", () => {
    it("should handle collisions in URL shortening", async () => {
      const urlService = new UrlService(["aaa", "bbb"]);

      const result = await urlService.createShortUrl("https://example.com");

      expect(result.shortPath).toBe("ccc");
      expect(urlService.collisionCount).toBe(2);
    });

    it("should fail if all generated paths collide", async () => {
      const urlService = new UrlService(["aaa", "bbb", "ccc"]);

      await expect(urlService.createShortUrl("https://example.com")).rejects.toThrow(
        "Failed to generate unique short URL after 3 attempts"
      );

      expect(urlService.collisionCount).toBe(3);
    });
  });
});
