---
name: web-seo-performance-a11y
description: >-
  Expert guide for Core Web Vitals optimization (LCP, INP, CLS), CI performance budgets, Lighthouse 100 audits,
  ARIA semantics, WCAG 2.2 AA/AAA compliance (@axe-core/playwright, target size 24x24), keyboard navigation focus rings,
  OpenGraph metadata, JSON-LD structured data, and AI Overviews readiness. Use whenever optimizing website performance
  or INP, enforcing CI performance/accessibility budgets, auditing WCAG 2.2 accessibility, or structuring pages for search and AI Overviews.
---

# Web SEO, Performance & Accessibility (A11y) Skill

This skill provides a 2026 engineering blueprint for passing Core Web Vitals (`LCP <= 2.5s`, `INP < 200ms`, `CLS < 0.1`), enforcing WCAG 2.2 AA/AAA accessibility gates in CI, and structuring pages for search engines and AI Overviews.

---

## 1. Core Web Vitals & CI Budgets (2026 web.dev Standard)

> **FID Retired (March 2024):** First Input Delay is deprecated. **Interaction to Next Paint (INP)** is the responsiveness metric, measuring latency across *all* user interactions in a session at p75.

### Official Thresholds & CI Budget Matrix

| Metric | Good (CI Budget) | Needs Improvement | Poor | Stretch Target | Root Causes & Primary Fixes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **LCP** (Largest Contentful Paint) | `<= 2.5s` | `2.5s – 4.0s` | `> 4.0s` | `< 1.2s` (hero) | Render-blocking CSS/JS, un-prioritized hero image, uncompressed fonts -> `fetchpriority="high"`, inline critical CSS, WOFF2 + metric-matched fallback |
| **INP** (Interaction to Next Paint) | `< 200ms` | `200ms – 500ms` | `> 500ms` | `< 50ms` JS task ceiling | Main-thread long tasks (`> 50ms`), heavy client hydration, un-throttled listeners -> `scheduler.yield()`, RSC/`useDeferredValue`, debounced handlers |
| **CLS** (Cumulative Layout Shift) | `< 0.1` | `0.1 – 0.25` | `> 0.25` | `0.00` | Unsized media, late-injected banners, FOUT/FOIT shifts -> explicit `width`/`height` or `aspect-ratio`, reserved slots, `size-adjust` font fallback |

### INP Top 3 Culprits & Fix Priority
1. **Long tasks `> 50ms`**: Break synchronous work into sub-frame slices with `scheduler.yield()` or elapsed-time chunking so the browser can service input between frames.
2. **Excess client hydration**: Shift non-interactive trees to **React Server Components (RSC)** and streaming SSR, and defer heavy interactive updates with `useDeferredValue`.
3. **Heavy event handlers**: Debounce/throttle search-as-you-type, drag, and scroll listeners; **profile in Chrome DevTools' Interactions panel before optimizing blindly** to pinpoint whether latency sits in input delay, processing duration, or presentation delay.

### CI Budgets & Post-Launch RUM
- **Pre-merge CI gate**: Fail PRs that breach combined LCP/TBT/CLS budgets on a **representative mid-tier device profile** (throttled CPU/network, never an unthrottled developer laptop).
- **Post-launch RUM & error budgets**: Collect field p75 telemetry via Real User Monitoring (**Sentry** or **Datadog**) and tie regressions to SRE error budgets.

---

## 2. Complete Head Template: SEO, OpenGraph & Asset Preloading

Configure HTML `<head>` consistently (never mix external Google Fonts CDN preconnects with self-hosted WOFF2 preloads—pick one strategy):

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>Example Studio — Fast Screen Annotation for Web</title>
  <meta name="description" content="Annotate, sketch, and collaborate directly in your browser with GPU-accelerated canvas rendering and Material Design 3.">
  <meta name="theme-color" content="#0061a4">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://example.com/">

  <!-- OpenGraph / Facebook / LinkedIn -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://example.com/">
  <meta property="og:title" content="Example Studio — Fast Screen Annotation for Web">
  <meta property="og:description" content="Annotate, sketch, and collaborate directly in your browser.">
  <meta property="og:image" content="https://example.com/assets/og-preview.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@examplestudio">
  <meta name="twitter:title" content="Example Studio — Fast Screen Annotation for Web">
  <meta name="twitter:description" content="Annotate, sketch, and collaborate directly in your browser.">
  <meta name="twitter:image" content="https://example.com/assets/og-preview.png">

  <!-- Structured Data JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Example Studio",
    "url": "https://example.com/",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  }
  </script>

  <!-- Font Strategy A (Recommended): Self-hosted WOFF2 with font-display: swap + size-adjust fallback (or optional) -->
  <link rel="preload" href="/fonts/plus-jakarta-sans-latin.woff2" as="font" type="font/woff2" crossorigin>

  <!-- Font Strategy B (Alternative): If loading Google Fonts CSS instead of self-hosted WOFF2, remove the preload above and preconnect:
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  -->
</head>
```

---

## 3. WCAG 2.2 Accessibility Baseline (2026 Standard)

### 3.1 Focus Indicators, GPU Skip Link & WCAG 2.2 Criteria
Never strip focus outlines without a high-contrast replacement, and verify web-font loading (FOUT) never shifts or obscures focus rings:

```css
/* High-contrast accessible focus ring (SC 2.4.13 aligned) */
:focus-visible {
  outline: 3px solid var(--md-sys-color-primary, #0061a4);
  outline-offset: 2px;
  border-radius: 4px;
}

/* Prevent sticky headers from obscuring focused targets (SC 2.4.11) */
html {
  scroll-padding-top: 5rem;
}

/* GPU-composited skip link (no layout top-property transitions) */
.skip-to-content {
  position: fixed;
  top: 0.75rem;
  left: 1rem;
  transform: translateY(-120%);
  background: var(--md-sys-color-primary, #0061a4);
  color: var(--md-sys-color-on-primary, #ffffff);
  padding: 0.75rem 1.25rem;
  min-width: 24px;
  min-height: 24px;
  z-index: 9999;
  border-radius: 8px;
  transition: transform 200ms cubic-bezier(0.2, 0, 0, 1);
}

.skip-to-content:focus {
  transform: translateY(0);
}
```

Mandatory WCAG 2.2 baseline rules:
- **Target Size Minimum (`SC 2.5.8`)**: Interactive targets (icon buttons, close buttons, toolbar controls) must be **`>= 24x24 CSS px`** (or meet spacing exceptions).
- **Dragging Movements (`SC 2.5.7`)**: Provide single-pointer alternatives (e.g., stepper buttons, up/down reorder controls, click-to-place) for every drag interaction.
- **Focus Not Obscured (`SC 2.4.11`)**: Sticky bars, drawers, and cookie banners must not cover the focused element.
- **Focus Appearance (`SC 2.4.13`)**: Ensure focus indicators meet `>= 2px` perimeter thickness and `>= 3:1` contrast against adjacent colors.

### 3.2 Semantic HTML & ARIA Attributes
- Icon-only buttons **MUST** include `aria-label` or visually hidden text.
- Form controls require explicit `<label for="...">` bindings.
- Modals must use native `<dialog>` (or `role="dialog" aria-modal="true" aria-labelledby="dialog-title"`).
- Live status updates and snackbars must use `role="status" aria-live="polite"`.

### 3.3 CI Enforcement & Audit Cadence
- **Automated PR gate**: Automated checkers (`@axe-core/playwright`, Lighthouse CI) catch only **30–40%** of real barriers, so configure CI to **fail the build on `critical` and `serious` violations** (never warning-only).
- **Manual verification & cadence**: Run keyboard-only navigation and **VoiceOver / NVDA** checks on every major release, plus a **full WCAG 2.2 audit at least twice a year**.
- **Criterion mapping**: Map every discovered defect to its exact **WCAG 2.2 Success Criterion ID** (e.g., `SC 2.5.8`, `SC 2.4.11`) before starting remediation so compliance tracking stays auditable.

---

## 4. SEO & AI-Search / AI Overviews Readiness

With **~60% of Google searches ending without a click**, AI Overviews and People-Also-Ask panels extract standalone, machine-readable passages rather than ranking keywords alone:
- **Extractable `< 30`-word section openers**: Start every major section and H2/H3 answer block with a direct, self-contained summary under 30 words.
- **Schema.org JSON-LD coverage**: Annotate pages with `WebApplication` / `SoftwareApplication`, `HowTo`, `Article`, `BreadcrumbList`, and `FAQPage` (used for People-Also-Ask and AI Overviews passage extraction).
- **Pre-deploy validation & Lighthouse SEO gate**: Validate JSON-LD with **Google's Rich Results Test before every deploy**, and enforce Lighthouse SEO checks for `alt` text, canonical/meta tags, valid `robots.txt` directives, and fast crawlable responses.

---

## 5. Cross-References & Detailed Audits

- [`core-web-vitals-tuning.md`](./references/core-web-vitals-tuning.md) — Elapsed-frame `scheduler.yield()` chunking, DevTools Interactions profiling, `useDeferredValue`/RSC hydration offloading, metric-matched font fallbacks, and throttled `lighthouserc.json`.
- [`wcag-a11y-standards.md`](./references/wcag-a11y-standards.md) — WCAG 2.2 criteria matrix, hardened `AccessibleModal`, `@axe-core/playwright` CI test, and semi-annual manual remediation workflow.
- [`seo-structured-data.md`](./references/seo-structured-data.md) — AI Overviews formatting guide and `WebApplication`, `FAQPage`, `HowTo`, `Article`, and `BreadcrumbList` JSON-LD templates.
