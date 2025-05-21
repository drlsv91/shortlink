import { Request, Response } from "express";
import { HttpStatus } from "../../src/decorators/controller.decorator";
import { logger } from "../../src/utils/logger";
import { PerformanceTestController, TestController, TestRedirectController } from "./utils";

describe("Controller Decorators", () => {
  let mockReq: Partial<Request> = { headers: {} };
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;
  let redirectMock: jest.Mock;
  let headersSentMock: jest.Func;

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock response methods
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    sendMock = jest.fn();
    redirectMock = jest.fn();
    headersSentMock = jest.fn(() => false);

    // Create mock request
    mockReq = {
      method: "GET",
      path: "/test",
      headers: {},
    };

    // Create mock response
    mockRes = {
      status: statusMock,
      json: jsonMock,
      send: sendMock,
      redirect: redirectMock,
      get headersSent() {
        return headersSentMock();
      },
    };

    performance.now = jest.fn().mockReturnValueOnce(1000).mockReturnValueOnce(1050);
  });

  describe("@Controller decorator", () => {
    const controller = new TestController();

    it("should return successful response with status 200", async () => {
      await controller.getResource(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
      expect(jsonMock).toHaveBeenCalledWith({
        status: HttpStatus.OK,
        metadata: { data: "test data" },
      });

      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("Request completed successfully"));
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("Execution time: 50.00ms"));
    });

    it("should handle empty responses", async () => {
      await controller.emptyResponse(mockReq as Request, mockRes as Response);

      expect(statusMock).not.toHaveBeenCalled();
      expect(jsonMock).not.toHaveBeenCalled();

      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("Response already sent"));
    });

    it("should not interfere with direct responses", async () => {
      headersSentMock = jest.fn(() => true);

      await controller.respondDirectly(mockReq as Request, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("Response already sent"));
    });

    it('should handle "URL not found" errors', async () => {
      await controller.throwNotFound(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(jsonMock).toHaveBeenCalledWith({
        status: HttpStatus.NOT_FOUND,
        error: "URL not found",
      });

      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("URL not found"));
    });

    it("should handle generic errors", async () => {
      await controller.throwGenericError(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(jsonMock).toHaveBeenCalledWith({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: "Something went wrong",
      });

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error in throwGenericError"),
        expect.any(Error)
      );
    });

    it("should use Created decorator for 201 responses", async () => {
      await controller.createResource(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(jsonMock).toHaveBeenCalledWith({
        status: HttpStatus.CREATED,
        metadata: { id: 123, name: "New Resource" },
      });
    });

    it("should add request ID for tracking", async () => {
      mockReq.headers!["x-request-id"] = "test-id-123";

      await controller.getResource(mockReq as Request, mockRes as Response);

      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("[test-id-123]"));

      expect((mockReq as any).requestId).toBe("test-id-123");
    });

    it("should generate request ID if not provided", async () => {
      mockReq.headers = {};

      await controller.getResource(mockReq as Request, mockRes as Response);

      expect(logger.info).toHaveBeenCalledWith(expect.stringMatching(/\[req-\d+-[a-z0-9]+\]/));

      expect((mockReq as any).requestId).toMatch(/req-\d+-[a-z0-9]+/);
    });
  });

  describe("@Redirect decorator", () => {
    const controller = new TestRedirectController();

    it("should redirect to returned URL", async () => {
      await controller.redirectToUrl(mockReq as Request, mockRes as Response);

      expect(redirectMock).toHaveBeenCalledWith(301, "https://example.com");

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining("Redirect completed successfully to: https://example.com")
      );
    });

    it("should not interfere with direct redirects", async () => {
      headersSentMock = jest.fn(() => true);

      await controller.respondDirectly(mockReq as Request, mockRes as Response);

      expect(redirectMock).toHaveBeenCalledTimes(1);
      expect(redirectMock).toHaveBeenCalledWith("https://direct-example.com");
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("Response already sent"));
    });

    it('should handle "URL not found" errors', async () => {
      await controller.throwNotFound(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(sendMock).toHaveBeenCalledWith("URL not found");

      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("URL not found for redirect"));
    });

    it("should handle generic errors", async () => {
      await controller.throwGenericError(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(sendMock).toHaveBeenCalledWith("An unexpected error occurred");

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error in throwGenericError"),
        expect.any(Error)
      );
    });

    it("should add request ID for tracking", async () => {
      mockReq.headers!["x-request-id"] = "redirect-id-123";

      await controller.redirectToUrl(mockReq as Request, mockRes as Response);

      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("[redirect-id-123]"));

      expect((mockReq as any).requestId).toBe("redirect-id-123");
    });
  });

  describe("Performance timing", () => {
    it("should measure actual execution time", async () => {
      const realPerformanceNow = performance.now;

      performance.now = realPerformanceNow;

      const controller = new PerformanceTestController();
      await controller.slowOperation(mockReq as Request, mockRes as Response);

      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("Execution time:"));

      const logCalls = (logger.info as jest.Mock).mock.calls;
      const timingLog = logCalls.find((call) => call[0].includes("Execution time:"))[0];

      const timeMatch = timingLog.match(/Execution time: ([\d.]+)ms/);
      const executionTime = parseFloat(timeMatch[1]);

      expect(executionTime).toBeGreaterThan(1);
    });
  });
});
