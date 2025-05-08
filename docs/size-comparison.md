# Retry Helper Size Comparison 📐

When bundling into a Cloudflare Worker, the **minified** size (not gzip) impacts your deployed script size.

| Implementation                           | Raw Source (bytes) | Minified (bytes) |
|------------------------------------------|-------------------:|-----------------:|
| **Custom `retryBackoff` (with `onRetry`)**  |               ~1960 |             ~862 |
| **async-retry**                          |             ~5 100 |           ~3 600 |
| **p-retry**                              |             ~8 200 |           ~5 800 |
| **promise-retry**                        |             ~6 400 |           ~4 500 |

- **Raw Source**: size of the `.js` file before minification.  
- **Minified**: after running through Terser (no gzip).

Our custom loop implementation is under **1000 bytes minified** (even with an optional `onRetry` hook), keeping your Worker bundle exceptionally lean compared to larger, feature‑rich retry libraries.  