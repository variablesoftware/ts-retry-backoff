// src/index.ts (or wherever your entrypoint is)

type BackoffFn = (_attempt: number, _baseMs: number) => number

const strategies: Record<string, BackoffFn> = {
  exponential: (n, base)     => base * 2 ** n,
  linear:      (n, base)     => base * (n + 1),
  fibonacci:   (n, base) => {
    let a = 0, b = 1
    for (let i = 0; i < n; i++) [a, b] = [b, a + b]
    return a * base
  }
}

export interface RetryBackoffOptions {
  maxRetries?:    number
  baseDelayMs?:   number
  minDelayMs?:    number
  maxDelayMs?:    number
  strategy?:      BackoffFn
  jitter?:        number
  retryOn?:       (_err: unknown) => boolean // default: always retry
  onRetry?:       (_err: unknown, _attempt: number, _delay: number) => void
  onSuccess?:     (_result: unknown, _attempt: number) => void
  onGiveUp?:      (_err: unknown, _attempt: number) => void
  signal?:        AbortSignal
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) {
    // DOMException so it matches fetch/stream aborts
    throw new DOMException('Aborted', 'AbortError')
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)

    const onAbort = () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }

    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

export async function retryBackoff<T>(
  fn: () => Promise<T>,
  opts: RetryBackoffOptions = {}
): Promise<T> {
  const {
    maxRetries    = 5,
    baseDelayMs   = 50,
    minDelayMs,
    maxDelayMs,
    strategy      = strategies.exponential,
    jitter        = 0,
    retryOn       = () => true,
    onRetry       = () => {},
    onSuccess     = () => {},
    onGiveUp      = () => {},
    signal
  } = opts

  let attempt = 0

  while (true) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    try {
      const result = await fn()
      onSuccess(result, attempt)
      return result
    } catch (err) {
      if (attempt >= maxRetries || !retryOn(err)) {
        onGiveUp(err, attempt)
        throw err
      }

      let rawDelay = strategy(attempt, baseDelayMs)
      if (typeof minDelayMs === 'number') rawDelay = Math.max(rawDelay, minDelayMs)
      if (typeof maxDelayMs === 'number') rawDelay = Math.min(rawDelay, maxDelayMs)
      const delayWithJitter =
        rawDelay + (jitter > 0 ? Math.random() * rawDelay * jitter : 0)

      onRetry(err, attempt, delayWithJitter)
      await delay(delayWithJitter, signal)
      attempt++
    }
  }
}