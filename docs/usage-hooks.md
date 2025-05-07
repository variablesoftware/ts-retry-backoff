# `withRetry` Usage Examples: With & Without Hooks 🔄

Below are multiple scenarios showing how to call `withRetry` both simply and with rich hooks—plus why you’d enable those hooks.

---

## 1. Simple KV Read (No Hooks)

You only care about retrying transient rate‑limit errors; you don’t need logging or metrics here.

```ts
import { withRetry } from '@variablesoftware/retry';

async function getTenantRecord(kv: KVNamespace, tenantId: string) {
  return withRetry(
    () => kv.get<TenantFull>(`tenant:${tenantId}`),
    {
      retryOn: err =>
        err?.name === 'RateLimitExceededError' || err?.status === 429,
      maxRetries: 3,
      baseDelayMs: 50
    }
  );
}
```

**Why no hooks?**  
- Tenant reads happen on every request; adding logs or metrics on each retry would flood your logging system.  
- You trust rate‑limit backoff alone to smooth transient spikes.

---

## 2. KV Write with a Retry Hook

When updating a record—especially on tenant registration—you want visibility if the operation retries.

```ts
import { withRetry } from '@variablesoftware/retry';
import logger from './logger';

async function saveTenantRecord(kv: KVNamespace, tenantId: string, rec: TenantRecord) {
  return withRetry(
    () => kv.put(`tenant:${tenantId}`, JSON.stringify(rec)),
    {
      retryOn: err => err?.name === 'RateLimitExceededError',
      maxRetries: 5,
      baseDelayMs: 100,
      onRetry: (err, attempt, delayMs) => {
        logger.warn('KV.put retried', {
          key: tenantId,
          attempt,
          delayMs: Math.round(delayMs),
          error: err.message
        });
      }
    }
  );
}
```

**Why use `onRetry`?**  
- You need an audit trail if tenant writes are delayed by throttling.  
- Helps correlate user‑facing latency spikes with backend retries.

---

## 3. HTTP Fetch with Full Hook Suite

When fetching from a third‑party API, you want end‑to‑end observability:

```ts
import { withRetry } from '@variablesoftware/retry';
import { Counter, Histogram } from 'prom-client';
import logger from './logger';

const fetchRetryCount = new Counter({ name: 'fetch_retry_total', help: '' });
const fetchLatency = new Histogram({ name: 'fetch_retry_delay_seconds', help: '' });

async function fetchConfig(url: string) {
  return withRetry(
    () => fetch(url).then(res => {
      if (!res.ok) throw Object.assign(new Error(res.statusText), { status: res.status });
      return res.json();
    }),
    {
      retryOn: err => err instanceof TypeError || err?.status >= 500,
      maxRetries: 4,
      baseDelayMs: 200,
      onRetry: (err, attempt, delayMs) => {
        fetchRetryCount.inc();
        fetchLatency.observe(delayMs / 1000);
        logger.warn(`Fetch retry #${attempt}`, { url, delayMs, error: err.message });
      },
      onSuccess: (_result, attempts) => {
        if (attempts > 0) {
          logger.info(`Fetch succeeded after ${attempts} retries`, { url, attempts });
        }
      },
      onGiveUp: err => {
        logger.error('Fetch failed after retries', { url, error: err.message });
        // e.g. send a page‑alert, or increment a failure metric
      }
    }
  );
}
```

**Why all three hooks?**  
- **`onRetry`**: instrument retry rates & delays for dashboards.  
- **`onSuccess`**: log or report when error‑recovery succeeded.  
- **`onGiveUp`**: alert on fatal failures for urgent investigation.

---

## 4. Sync Function Wrapped as Async (Promise Hook)

Even synchronous operations can be retried by wrapping them in a Promise. Here we retry a JSON parse failure:

```ts
import { withRetry } from '@variablesoftware/retry';

function parseSettingsSync(text: string) {
  const cfg = JSON.parse(text);
  if (!cfg.version) throw new Error('Missing version');
  return cfg;
}

async function parseSettings(text: string) {
  return withRetry(
    () => Promise.resolve().then(() => parseSettingsSync(text)),
    {
      retryOn: err => err.message.includes('Missing version'),
      maxRetries: 2,
      baseDelayMs: 10,
      onRetry: (err, attempt) => {
        console.warn(`Parse retry #${attempt}: ${err.message}`);
      }
    }
  );
}
```

**Why wrap sync + use `onRetry`?**  
- If your input source is flaky (e.g. eventual consistency), you can retry parsing after a short wait.  
- **`onRetry`** logs each parse attempt for debugging malformed payloads.

---

### Promise Hook Consideration

Some libraries expose an **`onFailedAttempt`** or **`onRetry`** hook that receives the thrown error plus context. In our `withRetry`, we pass:

- **`err`**: the failure cause  
- **`attempt`**: which retry number (1 ... max)  
- **`delayMs`**: how long we’ll wait before re‑invoking

This allows you to:

1. **Record metrics** (counters/histograms) per error type or operation.  
2. **Log structured events** to link retries with specific user requests or transaction IDs.  
3. **Conditionally bail** or escalate on certain error patterns inside a hook (though the primary bail logic remains in `retryOn`).

By selectively enabling hooks where you need visibility, you keep noise down while capturing detailed insights into your retry behavior.  