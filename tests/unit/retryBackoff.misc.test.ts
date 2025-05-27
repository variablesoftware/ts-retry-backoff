import { describe, it, expect, vi } from 'vitest';
import { retryBackoff, type RetryBackoffOptions } from '../../src/index';

describe('retryBackoff - miscellaneous', () => {
  it('handles promise rejection with non-Error values', async () => {
    const fn = vi.fn().mockRejectedValue('fail string');
    await expect(retryBackoff(fn, { maxRetries: 1 })).rejects.toBe('fail string');
  });

  it('aborts retries if AbortSignal is triggered', async () => {
    vi.useFakeTimers();
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    const controller = new AbortController();
    const options: RetryBackoffOptions = {
      maxRetries: 5,
      signal: controller.signal,
      minDelayMs: 10,
      maxDelayMs: 10,
    };

    const promise = retryBackoff(fn, options);

    // Advance timers to the point where the retry is scheduled and executed
    await vi.advanceTimersByTimeAsync(10); // first delay

    // Abort after the second call is scheduled
    controller.abort();

    // Let the abort propagate
    await expect(promise).rejects.toThrow(/aborted|Abort/);
    expect(fn).toHaveBeenCalledTimes(2); // <-- expect 2 calls

    vi.useRealTimers();
  });
});