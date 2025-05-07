# Under the Hood

This section describes the core implementation of `retryBackoff`.

```ts
export async function retryBackoff<T>(
  fn: () => Promise<T>,
  {
    maxRetries = 5,
    baseDelayMs = 50,
    minDelayMs,
    maxDelayMs,
    strategy = (n, base) => base * 2 ** n,
    jitter = 0,
    retryOn = () => true,
    onRetry = () => {},
    onSuccess = () => {},
    onGiveUp = () => {},
    signal
  }: any = {}
): Promise<T> {
  let attempt = 0;
  while (true) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    try {
      const result = await fn();
      onSuccess(result, attempt);
      return result;
    } catch (err) {
      if (attempt >= maxRetries || !retryOn(err)) {
        onGiveUp(err, attempt);
        throw err;
      }
      let rawDelay = strategy(attempt, baseDelayMs);
      if (typeof minDelayMs === 'number') rawDelay = Math.max(rawDelay, minDelayMs);
      if (typeof maxDelayMs === 'number') rawDelay = Math.min(rawDelay, maxDelayMs);
      const delayWithJitter =
        rawDelay + (jitter > 0 ? Math.random() * rawDelay * jitter : 0);
      onRetry(err, attempt, delayWithJitter);
      await new Promise((r, rej) => {
        const t = setTimeout(r, delayWithJitter);
        if (signal) signal.addEventListener('abort', () => {
          clearTimeout(t);
          rej(new DOMException('Aborted', 'AbortError'));
        }, { once: true });
      });
      attempt++;
    }
  }
}
```