# Retry Recommendations Across Hybrid‑Store I/O 🌐🔄

Beyond KV, HTTP fetch, and D1, here are all the surfaces in Hybrid‑Store that can benefit from a generic retry handler:

1. **R2 (Object Storage) Reads/Writes**  
   ```ts
   import { withRetry } from '@variablesoftware/retry';

   async function r2Upload(bucket: R2Bucket, key: string, body: BodyInit) {
     return withRetry(
       () => bucket.put(key, body),
       { retryOn: err => err?.status >= 500 }
     );
   }

   async function r2Download(bucket: R2Bucket, key: string) {
     return withRetry(
       () => bucket.get(key),
       { retryOn: err => err?.status === 429 || err?.status >= 500 }
     );
   }
   ```

2. **Durable Object Interactions**  
   ```ts
   async function doFetchWithRetry(stub: DurableObjectStub, req: Request) {
     return withRetry(
       () => stub.fetch(req),
       { retryOn: err => err instanceof TypeError || err?.status === 503 }
     );
   }
   ```

3. **D1 Writes & Migrations**  
   ```ts
   async function d1InsertWithRetry(db: D1Database, sql: string, params: any[]) {
     return withRetry(
       () => db.prepare(sql).bind(...params).run(),
       { retryOn: err => err.message.includes('too many requests') }
     );
   }
   ```

4. **Third‑Party API Calls**  
   ```ts
   // Example: Stripe key creation
   import Stripe from 'stripe';
   async function createStripeKey(stripe: Stripe) {
     return withRetry(
       () => stripe.ephemeralKeys.create({ customer: 'x' }),
       { retryOn: err => err.type === 'StripeRateLimitError' }
     );
   }
   ```

5. **AI‑Driven Prefetch Hints**  
   ```ts
   async function aiDecisionWithRetry(input: any) {
     return withRetry(
       () => aiRouteDecision(input),
       { retryOn: err => err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' }
     );
   }
   ```

6. **KMS Operations (SOPS Decrypt/Encrypt)**  
   ```ts
   import { decrypt } from 'sops';
   async function sopsDecryptWithRetry(file: string) {
     return withRetry(
       () => decrypt(file),
       { retryOn: err => err.message.includes('ThrottlingException') }
     );
   }
   ```

7. **Logging & Metrics Pushes**  
   ```ts
   async function pushMetrics(lines: string[]) {
     return withRetry(
       () => fetch('https://pushgateway/...', { method: 'POST', body: lines.join('\n') }),
       { retryOn: err => err.status === 429 || err.status >= 500 }
     );
   }
   ```

8. **GraphQL/REST Backend Proxies**  
   ```ts
   async function apiProxyWithRetry(url: string, init?: RequestInit) {
     return withRetry(
       () => fetch(url, init).then(res => {
         if (!res.ok) throw Object.assign(new Error(res.statusText), { status: res.status });
         return res.json();
       }),
       { retryOn: err => err.status >= 500 || err instanceof TypeError }
     );
   }
   ```