# Core Web Vitals Tuning & Performance Architecture Reference

This reference details production INP, LCP, and CLS optimizations, DevTools profiling, representative-device CI budgets (`lighthouserc.json`), and Real User Monitoring (RUM).

---

## 1. Interaction to Next Paint (INP) Optimization

> **FID retired in March 2024.** INP measures session-wide interaction responsiveness at p75 (`< 200ms` Good, `200–500ms` Needs Improvement, `> 500ms` Poor). Keep main-thread tasks `< 50ms`.

### 1.1 Profile First with Chrome DevTools Interactions Panel
Never optimize blindly. Record an interaction in **Chrome DevTools -> Performance -> Interactions** track and split INP latency into its three sub-phases:
1. **Input delay**: Main thread was busy (e.g., hydration or a `> 50ms` task) before the event handler started.
2. **Processing duration**: Event callbacks themselves took too long.
3. **Presentation delay**: Expensive style recalculation, layout thrashing, or paint after the handler returned.

### 1.2 Yield Long Tasks by Real Elapsed Frame Budget
Avoid fixed-iteration modulo checks like `i % 20 === 0` (which yield on index `0` and ignore real work duration). Yield based on elapsed milliseconds:

```javascript
async function yieldToMain() {
  if ('scheduler' in window && 'yield' in window.scheduler) {
    return window.scheduler.yield();
  }
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// Yield when a slice hits the 16ms frame budget (well under the 50ms long-task limit)
async function processLargeStrokeBatch(strokes, frameBudgetMs = 16) {
  let sliceStart = performance.now();

  for (const stroke of strokes) {
    renderStroke(stroke);

    if (performance.now() - sliceStart >= frameBudgetMs) {
      await yieldToMain();
      sliceStart = performance.now();
    }
  }
}
```

### 1.3 Offload Hydration (RSC / `useDeferredValue`) & Debounce Heavy Handlers
- **Server-first rendering**: Keep static content, layouts, and data tables in **React Server Components (RSC)** or streaming SSR so client hydration stays minimal.
- **Defer non-urgent re-renders**: Wrap expensive filtered lists or charts in `useDeferredValue` so typing stays responsive.
- **Throttle/debounce noisy events**: Debounce search inputs and `requestAnimationFrame`-throttle drag/scroll listeners (`{ passive: true }`).

```tsx
import { useDeferredValue, useEffect, useState } from 'react';

function SearchableResults({ items }: { items: Item[] }) {
  const [rawQuery, setRawQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const deferredQuery = useDeferredValue(debouncedQuery);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(rawQuery), 150);
    return () => clearTimeout(timer);
  }, [rawQuery]);

  // Expensive filtering runs off urgent keystroke frame
  const filtered = filterItems(items, deferredQuery);
  return (
    <>
      <input value={rawQuery} onChange={(e) => setRawQuery(e.target.value)} aria-label="Filter items" />
      <ResultList items={filtered} />
    </>
  );
}

// Passive, frame-throttled scroll/drag listener
let rafPending = false;
window.addEventListener('scroll', () => {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    updateStickyToolbar();
    rafPending = false;
  });
}, { passive: true });
```

---

## 2. Largest Contentful Paint (LCP) & CLS-Free Fonts

1. **Inline Critical CSS**: Embed minimal above-the-fold styles in `<style>` inside `<head>` and defer non-critical CSS.
2. **Hero Image Priority**: Always declare dimensions, `fetchpriority="high"`, and modern formats (AVIF/WebP).

```html
<img
  src="/images/hero-preview-800w.webp"
  srcset="/images/hero-preview-400w.webp 400w, /images/hero-preview-800w.webp 800w, /images/hero-preview-1200w.webp 1200w"
  sizes="(max-width: 600px) 100vw, 800px"
  alt="Application workspace preview"
  width="800"
  height="450"
  fetchpriority="high"
  decoding="async"
/>
```

3. **WOFF2 Compression + Metric-Matched Font Fallback (Zero `font-display: swap` CLS)**:
   - Ship **subsetted WOFF2** fonts only (never uncompressed TTF/OTF).
   - Pair `font-display: swap` with metric-override descriptors (`size-adjust`, `ascent-override`, `descent-override`) on the fallback face so swapping never shifts layout:

```css
@font-face {
  font-family: 'Plus Jakarta Sans';
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url('/fonts/plus-jakarta-sans-latin.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F;
}

@font-face {
  font-family: 'Plus Jakarta Sans Fallback';
  src: local('Arial'), local('Helvetica Neue'), local('Roboto');
  size-adjust: 102%;
  ascent-override: 98%;
  descent-override: 24%;
  line-gap-override: 0%;
}

body {
  font-family: 'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', system-ui, sans-serif;
}
```

4. **Bundle Minification & Compression**: Enable JS/CSS minification (`build.minify: 'esbuild'`, `cssMinify: true` in Vite) and serve Brotli (`br`) / Gzip assets from your CDN.

---

## 3. Representative Throttled Lighthouse CI Config (`lighthouserc.json`)

Enforce budgets on a **throttled mid-tier mobile profile** in CI (never unthrottled local hardware). Note: Standard Lighthouse load runs gate **TBT** (`<= 200ms`) as the lab proxy for **INP**, while user-flow `timespan` runs and field RUM measure true INP (`< 200ms`).

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:4173/"],
      "numberOfRuns": 3,
      "settings": {
        "preset": "perf",
        "throttlingMethod": "simulate",
        "formFactor": "mobile",
        "screenEmulation": {
          "mobile": true,
          "width": 412,
          "height": 823,
          "deviceScaleFactor": 2,
          "disabled": false
        },
        "throttling": {
          "rttMs": 150,
          "throughputKbps": 1638.4,
          "cpuSlowdownMultiplier": 4
        }
      }
    },
    "assert": {
      "assertions": {
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "total-blocking-time": ["error", { "maxNumericValue": 200 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }]
      }
    }
  }
}
```

---

## 4. Post-Launch RUM & Error Budgets

Lab CI catches regressions before merge; **Real User Monitoring (RUM)** verifies p75 experience across real networks and devices:
- Report `onLCP`, `onINP`, and `onCLS` from the `web-vitals` package into **Sentry** (`@sentry/browser`) or **Datadog** (`@datadog/browser-rum`).
- Tag events with route and build SHA, and establish **CWV error budgets** that halt feature launches when field p75 breaches `LCP > 2.5s`, `INP >= 200ms`, or `CLS >= 0.1`.
