# API Reference

## retryBackoff

```ts
import { retryBackoff } from '@variablesoftware/ts-retry-backoff';

/**
 * retryBackoff(fn, options)
 *
 * @param fn        Function returning a Promise<T> to retry
 * @param options   Optional settings:
 *   - maxRetries (default 5): number of retry attempts
 *   - baseDelayMs (default 50): initial backoff in milliseconds
 *   - minDelayMs: minimum delay between retries (ms)
 *   - maxDelayMs: maximum delay between retries (ms)
 *   - strategy: backoff function (exponential, linear, fibonacci, or custom)
 *   - jitter: [0…1] fraction of delay to randomize (default 0)
 *   - retryOn    (err) => boolean: predicate to decide if an error should be retried
 *   - onRetry    (err, attempt, delay): callback on each retry
 *   - onSuccess  (result, attempt): callback on success
 *   - onGiveUp   (err, attempt): callback when giving up
 *   - signal: AbortSignal to cancel retries
 *
 * @returns         Promise<T> resolving to fn()’s value or rejecting after retries
 */
```