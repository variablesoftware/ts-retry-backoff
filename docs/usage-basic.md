```ts
await withRetry(fetchOp, {
  maxRetries: 4,
  baseDelayMs: 100,
  jitter: 0.2,
  maxDelayMs: 1000,      // never wait more than 1 s
  signal: controller.signal
})
```