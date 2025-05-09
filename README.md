# @variablesoftware/ts-retry-backoff 🎛️🔁🚀

[![Test Suite](https://img.shields.io/badge/tests-passing-brightgreen)](https://github.com/variablesoftware/ts-retry-backoff/actions)
[![NPM version](https://img.shields.io/npm/v/@variablesoftware/ts-retry-backoff?style=flat-square)](https://www.npmjs.com/package/@variablesoftware/ts-retry-backoff)
[![License](https://img.shields.io/github/license/variablesoftware/ts-retry-backoff?style=flat-square)](https://github.com/variablesoftware/ts-retry-backoff/blob/main/LICENSE.txt)

> 🎛️🔁🚀 A tiny, zero‑dependencies retry helper with exponential backoff, jitter, min/max delay, and multiple strategies—usable for KV, HTTP, Durable Objects, or any async function.

---

**Keep your calls resilient with a single import—no more duplicated retry logic across your codebase! ♻️**

---

## Documentation

See [docs/README.md](docs/README.md) for full API, usage, and examples.

See [Size Comparison](docs/size-comparison.md) for bundle size and alternatives.

---

## Installation

```bash
yarn add @variablesoftware/ts-retry-backoff
# or
npm install @variablesoftware/ts-retry-backoff
```

---

## Options (Summary)

- `maxRetries?: number`
- `baseDelayMs?: number`
- `minDelayMs?: number`
- `maxDelayMs?: number`
- `strategy?: (attempt: number, baseMs: number) => number`
- `jitter?: number`
- `retryOn?: (err: unknown) => boolean`
- `onRetry?: (err: unknown, attempt: number, delay: number) => void`
- `onSuccess?: (result: unknown, attempt: number) => void`
- `onGiveUp?: (err: unknown, attempt: number) => void`
- `signal?: AbortSignal`

---

## 📄 License

MIT © Rob Friedman / Variable Software

---

> Built with ❤️ by [@variablesoftware](https://github.com/variablesoftware)  
> Thank you for downloading and using this project. Pull requests are warmly welcomed!

---

## 🌐 Inclusive & Accessible Design

- Naming, logging, error messages, and tests avoid cultural or ableist bias
- Avoids assumptions about input/output formats or encodings
- Faithfully reflects user data — no coercion or silent transformations
- Designed for clarity, predictability, and parity with underlying platforms (e.g., Cloudflare APIs)
- Works well in diverse, multilingual, and inclusive developer environments

---

**Keep your calls resilient with a single import—no more duplicated retry logic across your codebase! ♻️**
