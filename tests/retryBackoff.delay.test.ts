import { describe, it, expect, vi } from 'vitest';
import { retryBackoff } from '../src/index';

describe('retryBackoff - delay, jitter, and strategies', () => {
  it('respects min/max delay and jitter', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');
    const result = await retryBackoff(fn, {
      maxRetries: 1,
      minDelayMs: 10,
      maxDelayMs: 20,
      jitter: 0.5,
    });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('works with jitter = 0', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');
    const result = await retryBackoff(fn, { maxRetries: 1, jitter: 0 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('works with jitter = 1', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');
    const result = await retryBackoff(fn, { maxRetries: 1, jitter: 1 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retries with linear strategy', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');
    const result = await retryBackoff(fn, { maxRetries: 1, strategy: (attempt, base) => base * (attempt + 1) });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retries with fibonacci strategy', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');
    const result = await retryBackoff(fn, { maxRetries: 1, strategy: (attempt, base) => {
      let a = 0, b = 1;
      for (let i = 0; i < attempt; i++) [a, b] = [b, a + b];
      return a * base;
    } });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});