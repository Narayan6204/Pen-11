# Typography & Design Token Architecture Reference

This reference covers mathematical fluid typography aligned with the **15-tier Material Design 3 scale**, font pairing rules, and CSS custom property token architectures.

---

## 1. Fluid Typography Scale with CSS `clamp()`

Fluid typography scales smoothly between compact mobile (`360px` / `22.5rem`) and desktop (`1280px` / `80rem`) so desktop endpoints land cleanly on the exact M3 type values in [`../SKILL.md`](../SKILL.md) and [`../../material-you-web/SKILL.md`](../../material-you-web/SKILL.md).

Formula:
$$V_f = \text{clamp}(V_{\min}, V_{\min} + (V_{\max} - V_{\min}) \cdot \frac{100\text{vw} - W_{\min}}{W_{\max} - W_{\min}}, V_{\max})$$

### Production 15-Tier M3 Fluid Typography Tokens

```css
:root {
  /* Fluid Display, Headline & Title Tiers (360px -> 1280px, exact M3 max endpoints) */
  --font-display-large: clamp(2.5rem, 2.084rem + 1.848vw, 3.5625rem);  /* 40px -> 57px */
  --font-display-medium: clamp(2.0rem, 1.682rem + 1.413vw, 2.8125rem); /* 32px -> 45px */
  --font-display-small: clamp(1.75rem, 1.554rem + 0.870vw, 2.25rem);   /* 28px -> 36px */

  --font-headline-large: clamp(1.625rem, 1.478rem + 0.652vw, 2.0rem);  /* 26px -> 32px */
  --font-headline-medium: clamp(1.375rem, 1.228rem + 0.652vw, 1.75rem);/* 22px -> 28px */
  --font-headline-small: clamp(1.25rem, 1.152rem + 0.435vw, 1.5rem);   /* 20px -> 24px */

  --font-title-large: clamp(1.125rem, 1.027rem + 0.435vw, 1.375rem);   /* 18px -> 22px */
  --font-title-medium: 1rem;     /* 16px */
  --font-title-small: 0.875rem;  /* 14px */

  /* Body & Label Tiers (constant legibility across viewports) */
  --font-body-large: 1rem;       /* 16px */
  --font-body-medium: 0.875rem;  /* 14px */
  --font-body-small: 0.75rem;    /* 12px */

  --font-label-large: 0.875rem;  /* 14px */
  --font-label-medium: 0.75rem;  /* 12px */
  --font-label-small: 0.6875rem; /* 11px */

  /* Line Heights (aligned to M3 scale ratios) */
  --leading-display: 1.12;
  --leading-headline: 1.25;
  --leading-title: 1.35;
  --leading-body: 1.5;
  --leading-label: 1.4;

  /* Letter Spacing */
  --tracking-display-large: -0.25px;
  --tracking-tight: -0.015em;
  --tracking-normal: 0em;
  --tracking-body: 0.25px;
  --tracking-label: 0.5px;

  /* Font Families */
  --font-sans: 'Plus Jakarta Sans', 'Plus Jakarta Sans Fallback', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
}
```

---

## 2. Typography Pairing & Legibility Rules

1. **Brand & High Personality**: `Plus Jakarta Sans` (Geometric, clean, modern) paired with `JetBrains Mono` for code/data.
2. **Editorial & High Legibility**: `Inter` or `Roboto Flex` for versatile high-density dashboards.
3. **Contrast & Readability Rules**:
   - Never pair two similar geometric sans-serifs.
   - Maintain a clear visual step (`>= 1.2x` where possible) between primary headline tiers.
   - Keep primary reading body copy (`body-large` / `body-medium`) at `>= 14px` (`0.875rem`) with line-height `>= 1.4`, reserving `body-small` (`12px`) strictly for captions and helper hints.
