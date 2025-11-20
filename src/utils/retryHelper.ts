/**
 * Retry utilities for HTTP requests and async operations
 */

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
  shouldRetry?: (error: Error) => boolean;
}

const defaultOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  delay: 1000,
  backoff: true,
  onRetry: () => {},
  shouldRetry: () => true,
};

/**
 * Retry an async operation with exponential backoff
 */
export async function retryAsync<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry if shouldRetry returns false
      if (!opts.shouldRetry(lastError)) {
        throw lastError;
      }

      // Don't retry on last attempt
      if (attempt === opts.maxAttempts) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = opts.backoff
        ? opts.delay * Math.pow(2, attempt - 1)
        : opts.delay;

      opts.onRetry(attempt, lastError);

      await sleep(delay);
    }
  }

  throw lastError!;
}

/**
 * Retry a fetch request
 */
export async function retryFetch(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const shouldRetryDefault = (error: Error) => {
    // Retry on network errors
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return true;
    }

    // Don't retry on 4xx errors (client errors)
    if (error.message.includes("4")) {
      return false;
    }

    return true;
  };

  return retryAsync(
    async () => {
      const response = await fetch(url, options);

      // Throw on HTTP errors to trigger retry
      if (!response.ok && response.status >= 500) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    },
    {
      shouldRetry: shouldRetryDefault,
      ...retryOptions,
    }
  );
}

/**
 * Retry with timeout
 */
export async function retryWithTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  retryOptions: RetryOptions = {}
): Promise<T> {
  return retryAsync(() => withTimeout(operation(), timeoutMs), retryOptions);
}

/**
 * Execute operation with timeout
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Batch retry - retry multiple operations with shared retry logic
 */
export async function retryBatch<T>(
  operations: (() => Promise<T>)[],
  options: RetryOptions = {}
): Promise<T[]> {
  return Promise.all(operations.map((op) => retryAsync(op, options)));
}

/**
 * Circuit breaker pattern for retries
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";

  constructor(
    private readonly threshold: number = 5,
    private readonly timeout: number = 60000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await operation();

      if (this.state === "HALF_OPEN") {
        this.state = "CLOSED";
        this.failures = 0;
      }

      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      if (this.failures >= this.threshold) {
        this.state = "OPEN";
      }

      throw error;
    }
  }

  reset(): void {
    this.failures = 0;
    this.state = "CLOSED";
    this.lastFailureTime = 0;
  }

  getState(): "CLOSED" | "OPEN" | "HALF_OPEN" {
    return this.state;
  }
}

/**
 * Debounce async function
 */
export function debounceAsync<
  T extends (...args: unknown[]) => Promise<unknown>,
>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  let timeout: NodeJS.Timeout | null = null;
  let pendingPromise: Promise<Awaited<ReturnType<T>>> | null = null;

  return (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    if (timeout) {
      clearTimeout(timeout);
    }

    if (!pendingPromise) {
      pendingPromise = new Promise((resolve, reject) => {
        timeout = setTimeout(async () => {
          try {
            const result = await func(...args);
            resolve(result as Awaited<ReturnType<T>>);
          } catch (error) {
            reject(error);
          } finally {
            pendingPromise = null;
            timeout = null;
          }
        }, wait);
      });
    }

    return pendingPromise;
  };
}

/**
 * Throttle async function
 */
export function throttleAsync<
  T extends (...args: unknown[]) => Promise<unknown>,
>(
  func: T,
  limit: number
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> | null {
  let inThrottle = false;

  return (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> | null => {
    if (!inThrottle) {
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);

      return func(...args) as Promise<Awaited<ReturnType<T>>>;
    }

    return null;
  };
}
