import { describe, it, expect, vi } from 'vitest';
import { retryBackoff } from '../../src/index';

describe('retryBackoff - option boundaries and validation', () => {
  it('throws if min > max', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    await expect(retryBackoff(fn, { minDelayMs: 100, maxDelayMs: 10 })).rejects.toThrow();
  });

  it('works if min === max', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');
    const result = await retryBackoff(fn, { maxRetries: 1, minDelayMs: 50, maxDelayMs: 50 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('treats negative maxRetries as zero', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    await expect(retryBackoff(fn, { maxRetries: -1 })).rejects.toThrow('fail');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});