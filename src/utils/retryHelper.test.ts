import {
  retryAsync,
  retryFetch,
  retryWithTimeout,
  CircuitBreaker,
  debounceAsync,
  throttleAsync,
} from './retryHelper';

describe('retryHelper utilities', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('retryAsync', () => {
    it('succeeds on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const result = await retryAsync(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('retries on failure and eventually succeeds', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      const promise = retryAsync(operation, { maxAttempts: 3, delay: 100 });

      // Fast-forward timers to execute retries
      await jest.runAllTimersAsync();

      const result = await promise;
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('throws after max attempts', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('fail'));

      const promise = retryAsync(operation, { maxAttempts: 3, delay: 100 });

      await jest.runAllTimersAsync();

      await expect(promise).rejects.toThrow('fail');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('uses exponential backoff', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('fail'));

      const promise = retryAsync(operation, {
        maxAttempts: 3,
        delay: 100,
        exponentialBackoff: true,
      });

      // This will fail after all retries
      await jest.runAllTimersAsync();

      try {
        await promise;
      } catch {
        // Expected to fail
      }

      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('calls onRetry callback', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      const onRetry = jest.fn();

      const promise = retryAsync(operation, {
        maxAttempts: 3,
        delay: 100,
        onRetry,
      });

      await jest.runAllTimersAsync();
      await promise;

      expect(onRetry).toHaveBeenCalledWith(new Error('fail'), 1);
    });
  });

  describe('retryFetch', () => {
    it('succeeds on first fetch', async () => {
      const mockResponse = { ok: true, json: async () => ({ data: 'test' }) };
      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const result = await retryFetch('https://api.example.com/data');

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('retries on network error', async () => {
      global.fetch = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue({ ok: true, json: async () => ({ data: 'test' }) });

      const promise = retryFetch('https://api.example.com/data', {
        maxAttempts: 2,
        delay: 100,
      });

      await jest.runAllTimersAsync();
      const result = await promise;

      expect(result.ok).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('retries on 500 errors', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 500 })
        .mockResolvedValue({ ok: true, json: async () => ({ data: 'test' }) });

      const promise = retryFetch('https://api.example.com/data', {
        maxAttempts: 2,
        delay: 100,
        retryOn: [500],
      });

      await jest.runAllTimersAsync();
      const result = await promise;

      expect(result.ok).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('does not retry on 404', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 });

      const promise = retryFetch('https://api.example.com/data', {
        maxAttempts: 3,
        delay: 100,
      });

      await jest.runAllTimersAsync();
      const result = await promise;

      expect(result.status).toBe(404);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('retryWithTimeout', () => {
    it('succeeds before timeout', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await retryWithTimeout(operation, 5000);

      expect(result).toBe('success');
    });

    it('throws timeout error', async () => {
      const operation = jest.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 10000))
      );

      const promise = retryWithTimeout(operation, 1000);

      jest.advanceTimersByTime(1000);

      await expect(promise).rejects.toThrow('timeout');
    });
  });

  describe('CircuitBreaker', () => {
    it('allows requests when circuit is closed', async () => {
      const breaker = new CircuitBreaker(3, 1000);
      const operation = jest.fn().mockResolvedValue('success');

      const result = await breaker.execute(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('opens circuit after threshold failures', async () => {
      const breaker = new CircuitBreaker(2, 1000);
      const operation = jest.fn().mockRejectedValue(new Error('fail'));

      // First two failures
      await expect(breaker.execute(operation)).rejects.toThrow('fail');
      await expect(breaker.execute(operation)).rejects.toThrow('fail');

      // Circuit should be open now
      await expect(breaker.execute(operation)).rejects.toThrow(
        'Circuit breaker is open'
      );

      // Operation should not be called the third time
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('transitions to half-open after timeout', async () => {
      const breaker = new CircuitBreaker(1, 1000);
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      // Open the circuit
      await expect(breaker.execute(operation)).rejects.toThrow('fail');

      // Should reject while circuit is open
      await expect(breaker.execute(operation)).rejects.toThrow(
        'Circuit breaker is open'
      );

      // Fast-forward past timeout
      jest.advanceTimersByTime(1001);

      // Should allow one request (half-open)
      const result = await breaker.execute(operation);
      expect(result).toBe('success');
    });

    it('resets failure count on success', async () => {
      const breaker = new CircuitBreaker(3, 1000);
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      await expect(breaker.execute(operation)).rejects.toThrow('fail');
      await expect(breaker.execute(operation)).rejects.toThrow('fail');
      await breaker.execute(operation); // Success resets count

      // Two more failures should not open circuit
      await expect(breaker.execute(operation.mockRejectedValue(new Error('fail')))).rejects.toThrow(
        'fail'
      );
      await expect(breaker.execute(operation)).rejects.toThrow('fail');

      // Circuit should still be closed
      const finalOp = jest.fn().mockResolvedValue('success');
      await expect(breaker.execute(finalOp)).resolves.toBe('success');
    });
  });

  describe('debounceAsync', () => {
    it('debounces function calls', async () => {
      const fn = jest.fn().mockResolvedValue('result');
      const debounced = debounceAsync(fn, 100);

      debounced();
      debounced();
      debounced();

      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      await Promise.resolve(); // Wait for async

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('returns result from last call', async () => {
      const fn = jest.fn().mockResolvedValue('result');
      const debounced = debounceAsync(fn, 100);

      debounced('arg1');
      debounced('arg2');
      const promise3 = debounced('arg3');

      jest.advanceTimersByTime(100);
      await Promise.resolve();

      const result = await promise3;
      expect(result).toBe('result');
      expect(fn).toHaveBeenCalledWith('arg3');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttleAsync', () => {
    it('throttles function calls', async () => {
      const fn = jest.fn().mockResolvedValue('result');
      const throttled = throttleAsync(fn, 100);

      throttled(); // Called
      throttled(); // Ignored
      throttled(); // Ignored

      expect(fn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);

      throttled(); // Called after cooldown

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('allows one call per interval', async () => {
      const fn = jest.fn().mockResolvedValue('result');
      const throttled = throttleAsync(fn, 100);

      throttled();
      expect(fn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(50);
      throttled();
      expect(fn).toHaveBeenCalledTimes(1); // Still throttled

      jest.advanceTimersByTime(50);
      throttled();
      expect(fn).toHaveBeenCalledTimes(2); // Cooldown complete
    });
  });
});
