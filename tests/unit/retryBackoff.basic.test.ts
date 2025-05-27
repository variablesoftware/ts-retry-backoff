import { describe, it, expect, vi } from 'vitest';
import { retryBackoff } from '../../src/index';

describe('retryBackoff - basic retry logic', () => {
  it('resolves on first try if no error', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await retryBackoff(fn);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and eventually succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success');
    const result = await retryBackoff(fn, { maxRetries: 2 });
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('fails after max retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    await expect(retryBackoff(fn, { maxRetries: 2 })).rejects.toThrow('fail');
    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it('only calls once if maxRetries is 0', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    await expect(retryBackoff(fn, { maxRetries: 0 })).rejects.toThrow('fail');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('handles synchronous throw', async () => {
    const fn = vi.fn(() => { throw new Error('sync fail'); });
    await expect(retryBackoff(fn, { maxRetries: 1 })).rejects.toThrow('sync fail');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('function that always resolves never retries', async () => {
    const fn = vi.fn().mockResolvedValue('always ok');
    const result = await retryBackoff(fn, { maxRetries: 5 });
    expect(result).toBe('always ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});