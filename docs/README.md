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

await retryBackoff(() => fetch('https://example.com'));
```

---

For full API, usage, and advanced examples, see:

- [API Reference](./api.md)
- [Usage Examples](./examples.md)
- [Implementation Details](./under-the-hood.md)
- [Size Comparison](./size-comparison.md)