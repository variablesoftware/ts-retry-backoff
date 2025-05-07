import { describe, it, expect, vi } from 'vitest';
import { retryBackoff, type RetryBackoffOptions } from '../src/index';

describe('retryBackoff - custom retry logic', () => {
  it('propagates the last error', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'));
    await expect(retryBackoff(fn, { maxRetries: 1 })).rejects.toThrow('fail2');
  });

  it('supports custom retryOn logic', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');
    const options: RetryBackoffOptions = {
      maxRetries: 5,
      retryOn: (err) => err.message === 'fail',
    };
    const result = await retryBackoff(fn, options);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not retry if retryOn returns false', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fatal'));
    const options: RetryBackoffOptions = {
      maxRetries: 5,
      retryOn: (err) => false,
    };
    await expect(retryBackoff(fn, options)).rejects.toThrow('fatal');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('stops retrying if retryOn returns false after some retries', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('retryable'))
      .mockRejectedValueOnce(new Error('not-retryable'));
    const options: RetryBackoffOptions = {
      maxRetries: 5,
      retryOn: (err) => err.message === 'retryable',
    };
    await expect(retryBackoff(fn, options)).rejects.toThrow('not-retryable');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});