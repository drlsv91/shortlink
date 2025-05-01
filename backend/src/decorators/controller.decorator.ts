import { Request, Response } from "express";
import { logger } from "../utils/logger";

/**
 * Types of HTTP responses
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Type for a controller method
 */
type ControllerMethod = (req: Request, res: Response) => Promise<any>;

/**
 * Interface for HTTP response
 */
interface HttpResponse<T> {
  status: HttpStatus;
  metadata?: T;
  message?: string;
  error?: string;
}

/**
 * Decorator to handle async controller methods and standardize responses
 * @param target The class prototype
 * @param propertyKey The method name
 * @param descriptor The method descriptor
 */
export function Controller(status: HttpStatus = HttpStatus.OK) {
  return function (_target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value as ControllerMethod;

    descriptor.value = async function (req: Request, res: Response) {
      const startTime = performance.now();
      const requestId =
        req.headers["x-request-id"] || `req-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

      // Add request ID to request object for tracking
      (req as any).requestId = requestId;

      // Log the request start
      logger.info(`[${requestId}] Request started: ${req.method} ${req.path}`);

      try {
        // Call the original controller method
        const result = await originalMethod.call(this, req, res);

        // Calculate execution time
        const endTime = performance.now();
        const executionTime = endTime - startTime;

        // If the result is undefined or the response is already sent, return
        if (result === undefined || res.headersSent) {
          logger.info(`[${requestId}] Response already sent. Execution time: ${executionTime.toFixed(2)}ms`);
          return;
        }

        // Create a standardized response
        const response: HttpResponse<typeof result> = {
          status,
          metadata: result,
        };

        // Send the response
        res.status(status).json(response);

        // Log the successful response with timing
        logger.info(
          `[${requestId}] Request completed successfully. Status: ${status}. Execution time: ${executionTime.toFixed(
            2
          )}ms`
        );
      } catch (error: any) {
        // Calculate execution time on error
        const endTime = performance.now();
        const executionTime = endTime - startTime;

        // Handle specific error types
        if (error.message === "URL not found") {
          res.status(HttpStatus.NOT_FOUND).json({
            status: HttpStatus.NOT_FOUND,
            error: error.message,
          });

          logger.warn(`[${requestId}] URL not found. Execution time: ${executionTime.toFixed(2)}ms`);
          return;
        }

        // Handle other errors
        logger.error(
          `[${requestId}] Error in ${propertyKey}: ${error.message}. Execution time: ${executionTime.toFixed(2)}ms`,
          error
        );
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message ?? "An unexpected error occurred",
        });
      }
    };

    return descriptor;
  };
}

/**
 * Decorator for created responses (201)
 */
export function Created() {
  return Controller(HttpStatus.CREATED);
}

/**
 * Decorator to handle redirect responses
 */
export function Redirect() {
  return function (_target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value as ControllerMethod;

    descriptor.value = async function (req: Request, res: Response) {
      const startTime = performance.now();
      const requestId =
        req.headers["x-request-id"] || `req-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

      // Add request ID to request object for tracking
      (req as any).requestId = requestId;

      // Log the request start
      logger.info(`[${requestId}] Redirect request started: ${req.method} ${req.path}`);

      try {
        // Call the original controller method
        const redirectUrl = await originalMethod.call(this, req, res);

        // Calculate execution time
        const endTime = performance.now();
        const executionTime = endTime - startTime;

        // If the response is already sent, return
        if (res.headersSent) {
          logger.info(`[${requestId}] Response already sent. Execution time: ${executionTime.toFixed(2)}ms`);
          return;
        }

        // Redirect to the URL
        res.redirect(redirectUrl);

        // Log the successful redirect with timing
        logger.info(
          `[${requestId}] Redirect completed successfully to: ${redirectUrl}. Execution time: ${executionTime.toFixed(
            2
          )}ms`
        );
      } catch (error: any) {
        // Calculate execution time on error
        const endTime = performance.now();
        const executionTime = endTime - startTime;

        // Handle URL not found errors
        if (error.message === "URL not found") {
          res.status(HttpStatus.NOT_FOUND).send("URL not found");
          logger.warn(`[${requestId}] URL not found for redirect. Execution time: ${executionTime.toFixed(2)}ms`);
          return;
        }

        // Handle other errors
        logger.error(
          `[${requestId}] Error in ${propertyKey}: ${error.message}. Execution time: ${executionTime.toFixed(2)}ms`,
          error
        );
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send("An unexpected error occurred");
      }
    };

    return descriptor;
  };
}
