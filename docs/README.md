# @variablesoftware/ts-retry-backoff 🎛️🔁🚀

A tiny, zero‑dependencies retry helper with exponential backoff, jitter, min/max delay, and multiple strategies—usable for KV, HTTP, Durable Objects, or any async function.

---

## Installation

```bash
yarn add @variablesoftware/ts-retry-backoff
# or
npm install @variablesoftware/ts-retry-backoff
```

---

## Quick Example

```ts
import { retryBackoff } from '@variablesoftware/ts-retry-backoff';

await retryBackoff(() => fetch('https://example.com'), {
  maxRetries: 3,
  baseDelayMs: 100,
  minDelayMs: 100,
  maxDelayMs: 2000,
  jitter: 0.5,
  strategy: (attempt, base) => base * 2 ** attempt,
  retryOn: err => err instanceof TypeError,
  onRetry: (err, attempt, delay) => console.warn(`Retry #${attempt} in ${delay}ms`),
  onSuccess: (result, attempt) => console.log(`Success after ${attempt} attempts`),
  onGiveUp: (err, attempt) => console.error(`Giving up after ${attempt} attempts`),
  signal: new AbortController().signal,
});
```

---

For full API, usage, and advanced examples, see:

- [API Reference](./api.md)
- [Usage Examples](./examples.md)
- [Implementation Details](./under-the-hood.md)
- [Size Comparison](./size-comparison.md)