import { Request, Response } from "express";
import { Controller, Created, Redirect } from "../../src/decorators/controller.decorator";
import { RetryOnCollision } from "../../src/decorators/retry.decorator";
export class TestController {
  @Controller()
  async getResource(req: Request, res: Response) {
    return { data: "test data" };
  }

  @Controller()
  async emptyResponse(req: Request, res: Response) {
    // Return undefined to simulate no response data
    return undefined;
  }

  @Controller()
  async respondDirectly(req: Request, res: Response) {
    res.status(200).json({ directResponse: true });
    // Return undefined to signal we've handled the response
    return undefined;
  }

  @Controller()
  async throwNotFound(req: Request, res: Response) {
    throw new Error("URL not found");
  }

  @Controller()
  async throwGenericError(req: Request, res: Response) {
    throw new Error("Something went wrong");
  }

  @Created()
  async createResource(req: Request, res: Response) {
    return { id: 123, name: "New Resource" };
  }
}

export class TestRedirectController {
  @Redirect()
  async redirectToUrl(req: Request, res: Response) {
    return "https://example.com";
  }

  @Redirect()
  async respondDirectly(req: Request, res: Response) {
    res.redirect("https://direct-example.com");
    // Return undefined to signal we've handled the response
    return undefined;
  }

  @Redirect()
  async throwNotFound(req: Request, res: Response) {
    throw new Error("URL not found");
  }

  @Redirect()
  async throwGenericError(req: Request, res: Response) {
    throw new Error("Something went wrong");
  }
}

export class PerformanceTestController {
  @Controller()
  async slowOperation(req: Request, res: Response) {
    // Simulate a slow operation
    await new Promise((resolve) => setTimeout(resolve, 10));
    return { success: true };
  }
}

export class UrlService {
  public collisionCount = 0;
  private shortPaths = new Set<string>();

  constructor(initialPaths: string[] = []) {
    initialPaths.forEach((path) => this.shortPaths.add(path));
  }

  @RetryOnCollision(3, (attempt) => {
    console.log(`Collision detected, retry attempt: ${attempt}`);
  })
  async createShortUrl(originalUrl: string): Promise<any> {
    let shortPath: string;

    // Deterministic path generation for testing
    // First call generates 'aaa', second 'bbb', etc.
    switch (this.collisionCount) {
      case 0:
        shortPath = "aaa";
        break;
      case 1:
        shortPath = "bbb";
        break;
      default:
        shortPath = "ccc";
        break;
    }

    // Check for collision
    if (this.shortPaths.has(shortPath)) {
      this.collisionCount++;
      return null; // Signal collision to trigger retry
    }

    // Add the new path
    this.shortPaths.add(shortPath);

    // Return the result
    return {
      originalUrl,
      shortPath,
      shortUrl: `http://example.com/${shortPath}`,
    };
  }
}

export class CustomAttemptsService {
  public attemptsMade = 0;

  @RetryOnCollision(2)
  async customMaxAttempts(): Promise<string | null> {
    this.attemptsMade++;
    return null; // Always collide
  }
}

class TestService {
  public attemptsMade = 0;
  public onRetryCallCount = 0;
  public retryAttempts: number[] = [];

  // Method that always returns null (simulating collision)
  @RetryOnCollision(3)
  async alwaysCollides(): Promise<string | null> {
    this.attemptsMade++;
    return null;
  }

  // Method that succeeds after specific number of attempts
  @RetryOnCollision(5, (attempt) => {
    testService.onRetryCallCount++;
    testService.retryAttempts.push(attempt);
  })
  async succeedsAfterAttempts(succeedOnAttempt: number): Promise<string | null> {
    this.attemptsMade++;
    if (this.attemptsMade >= succeedOnAttempt) {
      return "success";
    }
    return null;
  }

  // Reset the test state
  reset(): void {
    this.attemptsMade = 0;
    this.onRetryCallCount = 0;
    this.retryAttempts = [];
  }
}

export const testService = new TestService();
