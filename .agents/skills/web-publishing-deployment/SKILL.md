---
name: web-publishing-deployment
description: >-
  Expert guide for automated web deployment pipelines, GitHub Actions workflows, GitHub Pages, Firebase Hosting,
  Vercel/Cloudflare Pages, custom domain DNS configuration (CNAME/A/AAAA), cache-control headers, SSL/TLS, and PWA manifests.
  Use whenever setting up CI/CD deployment, deploying static sites or web apps, configuring domains, or tuning web server caching.
---

# Web Publishing & Deployment Skill

Turnkey CI/CD workflows, CDN configs, DNS blueprints, caching policies, and PWA manifests for publishing web apps gated by automated quality checks.

---

## 1. Multi-Platform Deployment Matrix

| Platform | Best For | SSL/TLS | Custom Domain | Preview Channels | Config File |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GitHub Pages** | Docs, static exports, client SPAs | Automated (Let's Encrypt) | Supported (`CNAME` + DNS) | Environment-based | `.github/workflows/deploy.yml` |
| **Firebase Hosting** | Static/SPA + Firebase Auth/Firestore | Automated (Google CA) | Supported (`TXT` + `A`) | `firebase hosting:channel:deploy` | `firebase.json` |
| **Cloudflare Pages** | High-traffic static sites, edge functions | Automated (Universal SSL) | Supported (DNS proxy) | Branch & PR previews | `_headers`, `_routes.json` |
| **Vercel / Netlify** | Next.js RSC/SSR, Vite, serverless | Automated | Supported | Automated PR previews | `vercel.json` / `netlify.toml` |

---

## 2. GitHub Pages Deployment via GitHub Actions

Always gate deployment behind CI quality checks (`needs: [quality-gates]`) and upload **only** your explicit build output (`./dist`, `./out`, or `./web`).

> [!CAUTION]
> **NEVER deploy repository root (`path: '.'`).** Deploying `.` exposes `.git/`, `.env*`, `.agents/`, source code, and workflow files on the public internet.

```yaml
# .github/workflows/deploy.yml
name: Deploy Web Application to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  quality-gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npx vitest run --coverage
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist-bundle
          path: ./dist
          retention-days: 1

  deploy:
    needs: [quality-gates]
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist-bundle
          path: ./dist

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload Pages artifact (explicit build output only)
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

For full Docker-parity Playwright & Lighthouse CI gates, see [`ci-testing-docker-gates.md`](../web-engineering-standards/references/ci-testing-docker-gates.md).

---

## 3. Firebase Hosting Configuration (`firebase.json`)

Apply `immutable` caching **only** to fingerprinted/hashed assets—never to unhashed JS/CSS files:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/assets/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.[0-9a-f]*.@(js|css|woff2|webp|png|svg)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=0, must-revalidate"
          }
        ]
      }
    ]
  }
}
```

> [!WARNING]
> **SPA Rewrite Caveat**: Firebase checks real files before applying `rewrites`, so missing or stale hashed chunks from an earlier deploy fall through `"source": "**"` and return `/index.html` (`200 OK`, `text/html`), triggering strict MIME-type errors in browsers. Handle `vite:preloadError` / chunk load errors with a reload prompt or retain prior hashed bundles briefly across rolling deploys.

---

## 4. Cloudflare Pages Blueprint (`wrangler` + `_headers`)

Deploy an explicit build directory via pinned CLI (`wrangler`):

```bash
npx wrangler pages deploy ./dist --project-name=my-web-app
```

Place `_headers` inside your build output (`public/_headers` copied to `./dist/_headers`):

```text
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: public, max-age=0, must-revalidate

/*
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 5. PWA Manifest (`public/manifest.webmanifest`)

Reference from HTML `<head>` via `<link rel="manifest" href="/manifest.webmanifest">`:

```json
{
  "name": "Web App Studio",
  "short_name": "Studio",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0061a4",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

---

## 6. Custom Domain & DNS Configuration

| Record Type | Host / Name | Target / Value | TTL |
| :--- | :--- | :--- | :--- |
| **CNAME** | `www` or subdomain (`app`) | `<username>.github.io` or `<project>.pages.dev` | `300` / Auto |
| **A** | `@` (Root Apex Domain) | GitHub Pages: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` | `300` |
| **TXT** | `_github-pages-challenge-<user>` or `@` | Provider domain verification token | `300` |

For Firebase Hosting's site-specific `A`/`TXT` DNS workflow and SSL provisioning, see `./references/firebase-hosting-custom-domain.md`.

---

## 7. Cross-References & Detailed Modules

- [`github-actions-deploy.md`](./references/github-actions-deploy.md) — Node 22 CI/CD pipelines, Docker parity gates, concurrency, and secret masking.
- [`firebase-hosting-custom-domain.md`](./references/firebase-hosting-custom-domain.md) — Pinned CLI deploys, gated preview/live channels, and custom domain DNS + SSL provisioning.
- [`caching-cdn-headers.md`](./references/caching-cdn-headers.md) — `Cache-Control` policies, nonce/SHA-256 CSP headers (zero `'unsafe-inline'`), and Service Worker caching.
- [`web-engineering-standards`](../web-engineering-standards/SKILL.md) — Core 2026 engineering standards, TypeScript strictness, OWASP, and quality gates.
