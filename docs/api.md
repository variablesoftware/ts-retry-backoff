# API Reference

## retryBackoff

```ts
import { retryBackoff } from '@variablesoftware/ts-retry-backoff';

/**
 * retryBackoff(fn, options)
 *
 * @param fn        Function returning a Promise<T> to retry
 * @param options   Optional settings:
 *   - maxRetries?: number
 *   - baseDelayMs?: number
 *   - minDelayMs?: number
 *   - maxDelayMs?: number
 *   - strategy?: (attempt: number, baseMs: number) => number
 *   - jitter?: number
 *   - retryOn?: (err: unknown) => boolean
 *   - onRetry?: (err: unknown, attempt: number, delay: number) => void
 *   - onSuccess?: (result: unknown, attempt: number) => void
 *   - onGiveUp?: (err: unknown, attempt: number) => void
 *   - signal?: AbortSignal
 *
 * @returns         Promise<T> resolving to fn()’s value or rejecting after retries
 */
```