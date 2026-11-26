# Web Server Caching, HTTP Security Headers & Service Worker Reference

Configure strict cache lifetimes, zero-`'unsafe-inline'` Content Security Policies, and resilient Service Worker caching.

---

## 1. Optimal `Cache-Control` Architecture

1. **HTML documents (`index.html`, SSR non-personalized pages)**:
   `Cache-Control: public, max-age=0, must-revalidate`
   *Ensures browsers revalidate immediately so users always pick up the newest asset manifest.*
2. **Content-Hashed Immutable Assets (`assets/app.[hash].js`, `style.[hash].css`, hashed fonts/images)**:
   `Cache-Control: public, max-age=31536000, immutable`
   *Only apply `immutable` when filenames contain a build content hash; unhashed filenames must not use `immutable`.*
3. **Unhashed Static Files (`favicon.ico`, `robots.txt`, `manifest.webmanifest`)**:
   `Cache-Control: public, max-age=3600, must-revalidate`
4. **API & Personalized Responses**:
   `Cache-Control: no-store, no-cache, must-revalidate`

---

## 2. Hardened HTTP Security Headers & CSP (Zero `'unsafe-inline'` Scripts)

Apply these baseline transport and isolation headers across your CDN or app server:

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cross-Origin-Opener-Policy: same-origin
```

Pick the **CSP strategy** that matches your route rendering mode (see [`security-owasp-checklist.md`](../../web-engineering-standards/references/security-owasp-checklist.md)):

### Pattern A: SSR / Dynamic HTML CSP (Per-Request Nonce)

Generate a cryptographically random base64 nonce (`crypto.randomBytes(16).toString('base64')`) per HTTP response and attach it to `<script nonce="...">`. **Note**: Dynamic nonces prevent static CDN HTML caching.

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-${NONCE}' 'strict-dynamic'; style-src 'self' 'nonce-${NONCE}' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; upgrade-insecure-requests;
```

### Pattern B: Static Export / CDN / ISR CSP (Build-Generated SHA-256 Hashes)

Preserves full edge CDN caching by digesting inline bootstrap scripts during the build (`'sha256-...'`)—**never** fall back to `'unsafe-inline'` in `script-src`:

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'sha256-<BUILD_SCRIPT_HASH_1>' 'sha256-<BUILD_SCRIPT_HASH_2>'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; upgrade-insecure-requests;
```

> [!IMPORTANT]
> **Never leave `Content-Security-Policy-Report-Only` un-graduated.** Collect telemetry briefly during rollout, resolve legitimate violations, and promote the policy to enforcing `Content-Security-Policy`.

---

## 3. Service Worker Caching Strategy (`public/sw.js`)

Pair network-first HTML navigation with cache-first immutable `/assets/*`, keeping `/api/*` network-only:

```js
const CACHE_NAME = 'app-shell-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Never cache API responses
  if (url.pathname.startsWith('/api/')) return;

  // Navigation: Network-first with cached shell fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Immutable content-hashed assets: Cache-first
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put(request, copy));
            }
            return res;
          })
      )
    );
  }
});
```
