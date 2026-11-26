# SEO Structured Data (JSON-LD) & AI Overviews Reference

This reference covers Answer-Engine / AI Overviews content formatting and Schema.org JSON-LD templates (`WebApplication`, `FAQPage`, `HowTo`, `Article`, and `BreadcrumbList`).

---

## 1. AI Overviews & Answer-Engine Formatting Guide

With nearly **60% of searches ending without a click**, Google's AI Overviews and People-Also-Ask panels extract verbatim passages rather than just ranking links:

1. **Keep every section opener under 30 words**: Write a direct, self-contained factual sentence immediately beneath each `<h2>`/`<h3>` so the passage stands alone when extracted.
2. **Use explicit Q&A headings**: Frame FAQ subheadings (`<h3>`) as natural user questions (`How do you fix a poor INP score?`) followed by a concise 2–3 sentence answer.
3. **Gate technical crawlability in Lighthouse SEO**: Enforce non-empty `alt` text, valid `<meta name="description">`, canonical links, crawlable `robots.txt` rules, and fast server responses.
4. **Validate before every deploy**: Run all pages through **Google's Rich Results Test** in pre-deploy QA—never wait for an organic traffic drop to detect malformed JSON-LD.

---

## 2. WebApplication Schema (SaaS / Web App)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Example Studio",
  "url": "https://example.com/",
  "description": "GPU-accelerated web annotation and collaborative whiteboard built with Material Design 3.",
  "applicationCategory": "DesignApplication",
  "browserRequirements": "Requires HTML5 Canvas and WebGL support",
  "operatingSystem": "All modern browsers",
  "screenshot": "https://example.com/assets/screenshot-main.png",
  "featureList": [
    "Real-time 60fps canvas drawing",
    "Material 3 dynamic color engine",
    "Multi-format PNG/SVG/PDF export",
    "Offline PWA capability"
  ],
  "author": {
    "@type": "Organization",
    "name": "Example Team",
    "url": "https://example.com/"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
</script>
```

---

## 3. FAQPage Schema (AI Overviews & People-Also-Ask Extraction)

> **SERP Rich-Result Note:** Google restricts collapsible `FAQPage` SERP rich snippets to authoritative government and healthcare sites, but `FAQPage` JSON-LD remains valuable across all domains for **AI Overviews passage extraction** and **People-Also-Ask** machine parsing. Ensure every Q&A pair also appears visibly on the page.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Can I use Example Studio offline?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Example Studio caches core assets with Service Workers and stores local documents in IndexedDB so you can work without internet connectivity."
      }
    },
    {
      "@type": "Question",
      "name": "Does the canvas support stylus pressure sensitivity?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. It uses the Pointer Events API to read stylus pressure, tilt, and palm rejection on supported touch and pen hardware."
      }
    }
  ]
}
</script>
```

---

## 4. HowTo Schema (Step-by-Step Guides)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Export a Vector Annotation as SVG",
  "description": "Export crisp, resolution-independent annotations from Example Studio in three steps.",
  "totalTime": "PT1M",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Open the Export Menu",
      "text": "Select Export from the top application bar or press Ctrl+Shift+E."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Choose SVG Format",
      "text": "Select SVG in the format picker to preserve vector paths and transparency."
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Download File",
      "text": "Click Download SVG to save the vector file locally."
    }
  ]
}
</script>
```

---

## 5. Article Schema (Docs, Changelogs & Engineering Guides)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Optimizing Canvas Rendering for Sub-200ms INP",
  "description": "How frame-budget yielding with scheduler.yield() keeps browser interactions responsive under heavy canvas workloads.",
  "image": "https://example.com/assets/inp-guide-cover.png",
  "datePublished": "2026-03-15T09:00:00Z",
  "dateModified": "2026-04-02T14:30:00Z",
  "author": {
    "@type": "Person",
    "name": "Alex Rivera",
    "url": "https://example.com/authors/alex-rivera"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Example Studio",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/assets/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/guides/inp-canvas-optimization"
  }
}
</script>
```

---

## 6. BreadcrumbList Schema (Site Hierarchy)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Guides",
      "item": "https://example.com/guides/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "INP Canvas Optimization",
      "item": "https://example.com/guides/inp-canvas-optimization"
    }
  ]
}
</script>
```
