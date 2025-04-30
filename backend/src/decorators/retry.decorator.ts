export interface RetryOptions {
  maxAttempts: number;
  delay: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

// A decorator specific for collision retries
export function RetryOnCollision(maxAttempts: number = 5, onRetry?: (attempt: number) => void) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let attempt = 0;

      while (attempt < maxAttempts) {
        const result = await originalMethod.apply(this, args);

        if (result) {
          return result;
        }

        attempt++;

        if (attempt >= maxAttempts) {
          throw new Error(`Failed to generate unique short URL after ${maxAttempts} attempts`);
        }

        // Notify about retry if callback provided
        if (onRetry) {
          onRetry(attempt);
        }
      }

      throw new Error(`Unexpected error in retry loop`);
    };

    return descriptor;
  };
}
