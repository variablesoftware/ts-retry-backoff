# Usage Examples

## KV with Rate‑Limit Retry

```ts
import { retryBackoff } from '@variablesoftware/ts-retry-backoff';

const isKvThrottle = (err: any) =>
  err?.name === 'RateLimitExceededError' || err?.status === 429;

async function safeGet<T>(kv: KVNamespace, key: string): Promise<T | null> {
  return retryBackoff(
    () => kv.get<T>(key),
    { retryOn: isKvThrottle }
  );
}

async function safePut(kv: KVNamespace, key: string, value: string) {
  return retryBackoff(
    () => kv.put(key, value),
    { retryOn: isKvThrottle }
  );
}
```

---

## HTTP Fetch Retry

```ts
import { retryBackoff } from '@variablesoftware/ts-retry-backoff';

const isServerError = (err: any) =>
  err instanceof TypeError || (err.status && err.status >= 500);

async function fetchWithRetry(url: string, init?: RequestInit) {
  return retryBackoff(
    () => fetch(url, init).then(res => {
      if (!res.ok) throw Object.assign(new Error(res.statusText), { status: res.status });
      return res;
    }),
    {
      maxRetries: 3,
      baseDelayMs: 100,
      retryOn: isServerError,
      minDelayMs: 100,
      maxDelayMs: 2000,
      jitter: 0.5,
      strategy: (attempt, base) => base * 2 ** attempt // exponential by default
    }
  );
}
```

---

## Custom Backoff Strategies

```ts
import { retryBackoff } from '@variablesoftware/ts-retry-backoff';

// Linear backoff
await retryBackoff(fn, { strategy: (n, base) => base * (n + 1) });

// Fibonacci backoff
await retryBackoff(fn, { strategy: (n, base) => {
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a * base;
}});
```

---

## AbortSignal Support

```ts
import { retryBackoff } from '@variablesoftware/ts-retry-backoff';

const controller = new AbortController();

setTimeout(() => controller.abort(), 500); // abort after 500ms

try {
  await retryBackoff(
    () => fetch('https://example.com/api'),
    { signal: controller.signal, maxRetries: 10 }
  );
} catch (err) {
  if (err.name === 'AbortError') {
    console.log('Retry aborted!');
  }
}
```