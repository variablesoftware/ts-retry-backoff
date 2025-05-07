import { describe, it, expect, vi } from 'vitest';
import { retryBackoff, type RetryBackoffOptions } from '../src/index';

describe('retryBackoff - miscellaneous', () => {
  it('handles promise rejection with non-Error values', async () => {
    const fn = vi.fn().mockRejectedValue('fail string');
    await expect(retryBackoff(fn, { maxRetries: 1 })).rejects.toBe('fail string');
  });

  it('aborts retries if AbortSignal is triggered', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    const controller = new AbortController();
    const options: RetryBackoffOptions = {
      maxRetries: 5,
      signal: controller.signal,
      minDelayMs: 1,
      maxDelayMs: 1,
    };

    // Abort after first attempt (during delay before second call)
    setTimeout(() => controller.abort(), 2);

    await expect(retryBackoff(fn, options)).rejects.toThrow(/aborted|Abort/);
    expect(fn).toHaveBeenCalledTimes(2); // <-- expect 2 calls
  });
});