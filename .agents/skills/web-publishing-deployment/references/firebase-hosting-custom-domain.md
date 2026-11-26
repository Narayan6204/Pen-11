# Firebase Hosting & Custom Domain Deployment Reference

Gated Firebase Hosting deployments using pinned CLI versions, PR preview channels, and custom domain DNS/SSL provisioning.

---

## 1. Pinned Firebase CLI Commands

Install `firebase-tools` as a pinned project `devDependency` (`npm i -D firebase-tools@^13`) instead of executing floating `@latest` tags:

```bash
# 1. Initialize Firebase Hosting non-interactively
npx firebase-tools@13 init hosting

# 2. Deploy to live production channel (after local build)
npm run build && npx firebase deploy --only hosting

# 3. Deploy to ephemeral PR/staging preview channel (expires in 7 days)
npm run build && npx firebase hosting:channel:deploy pr-preview --expires 7d
```

---

## 2. Gated GitHub Actions Firebase Preview & Live Deploy

Save as `.github/workflows/firebase-deploy.yml`. Every deploy runs lint, typecheck, Vitest, and `npm run build` **before** `FirebaseExtended/action-hosting-deploy@v0`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [ main ]
  pull_request:
    types: [ opened, synchronize, reopened ]

permissions:
  contents: read
  checks: write
  pull-requests: write

concurrency:
  group: firebase-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality-and-build:
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
          name: firebase-dist
          path: ./dist
          retention-days: 1

  deploy-preview:
    if: github.event_name == 'pull_request'
    needs: quality-and-build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: firebase-dist
          path: ./dist
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: ${{ vars.FIREBASE_PROJECT_ID }}

  deploy-live:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: quality-and-build
    environment: production
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: firebase-dist
          path: ./dist
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: ${{ vars.FIREBASE_PROJECT_ID }}
          channelId: live
```

- Store non-secret `projectId` in repository `vars.FIREBASE_PROJECT_ID` (or literal ID) and scope `FIREBASE_SERVICE_ACCOUNT` (or Workload Identity Federation credentials) to the protected `production` environment.

---

## 3. Custom Domain DNS & SSL/TLS Provisioning

1. **Register Domain in Firebase**: Open **Firebase Console -> Hosting -> Add custom domain**, enter `example.com` (and optionally configure `www.example.com` to 301-redirect to apex).
2. **Verify Ownership (`TXT` Record)**: Add the `TXT` record provided by Firebase (`hosting-site=<project-id>` or verification challenge token) on `@` at your DNS provider. Verify propagation with `dig TXT example.com +short`.
3. **Configure Routing (`A` / `CNAME` Records)**:
   - **Root Apex (`@`)**: Add the exact site-specific `A` (and `AAAA` if listed) records displayed in the Firebase Console—do not guess legacy IPs, as Firebase assigns per-site anycast edge IPs.
   - **Subdomain (`app` / `www`)**: Add the `A` or `CNAME` (`<project-id>.web.app`) record specified by the Firebase Console wizard.
4. **Automatic SSL/TLS Minting**: Once DNS propagates, Firebase automatically provisions and renews a Google-managed SSL certificate (typically 15 minutes to 24 hours).
5. **CDN Proxy Caveat (Cloudflare DNS)**: Keep records set to **DNS-only (grey cloud)** during verification and SSL issuance so proxy interception does not block ACME validation. If re-enabling proxy afterwards, use **Full (Strict)** SSL mode—never Flexible.
