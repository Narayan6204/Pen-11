# CI Quality Gates, Testing & Docker Parity Reference

Enforce unit tests, cross-browser E2E, accessibility, and performance budgets against a **single containerized build** before merging to `main`.

---

## 1. 2026 Testing Stack: Vitest & Playwright

- **Vitest (Unit & Integration Default)**: Replaces Jest across TypeScript, Vite, and React/Next.js codebases by sharing Vite's transform pipeline for near-instant startup. Enforce a **`>= 80%` coverage floor on changed lines / business logic**.
- **Playwright (Cross-Browser E2E Default)**: Preferred over Cypress for parallel Chromium/Firefox/WebKit runs and **Trace Viewer** (`trace: 'retain-on-failure'`), which records full DOM snapshots, console output, and network logs for zero-repro CI debugging.

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: process.env.BASE_URL ?? 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

---

## 2. Accessibility & Core Web Vitals CI Gates

### 2.1 `@axe-core/playwright` (WCAG 2.2 Blocking Gate)

Automated checks catch ~30–40% of issues; failing on `critical` and `serious` violations stops regressions from ever shipping. Pair with semi-annual + major-release manual keyboard, screen-reader (VoiceOver/NVDA), and WCAG 2.2 SC 2.5.8 (`24x24` CSS px minimum target size) audits.

```ts
// tests/e2e/a11y.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home has no critical or serious WCAG 2.2 violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();

  const blocking = results.violations.filter((v) =>
    ['critical', 'serious'].includes(v.impact ?? '')
  );
  expect(blocking).toEqual([]);
});
```

### 2.2 Core Web Vitals Budgets (CI + Field RUM)

| Metric | CI / Field "Good" Gate | Poor Threshold | Enforcement Mechanism |
| :--- | :--- | :--- | :--- |
| **LCP** | `<= 2500ms` | `> 4000ms` | Lighthouse CI (`largest-contentful-paint`) + RUM |
| **INP** | `< 200ms` | `> 500ms` | Lighthouse lab proxy `TBT < 200ms` + Playwright flow checks + Field RUM |
| **CLS** | `< 0.1` | `> 0.25` | Lighthouse CI (`cumulative-layout-shift`) + RUM |

For deep CWV tuning (`scheduler.yield()`, font subsetting, critical CSS) and WCAG 2.2 remediation details, see [`web-seo-performance-a11y`](../../web-seo-performance-a11y/SKILL.md).

---

## 3. Docker Build-Once Test Parity

**Never test a different artifact than you deploy.** Build the production Docker image **once** with cached BuildKit layers, boot that container in CI, and execute Playwright, `@axe-core/playwright`, and Lighthouse CI against it so dev, staging, and production never drift.

```dockerfile
# Dockerfile (multi-stage build-once parity)
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

---

## 4. Complete GitHub Actions CI Quality Gate Workflow

Save as `.github/workflows/ci-quality-gates.yml` (deploy workflows in [`web-publishing-deployment`](../../web-publishing-deployment/SKILL.md) should gate on these checks):

```yaml
name: CI Quality Gates

on:
  pull_request:
  push:
    branches: [ main ]

permissions:
  contents: read

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  static-and-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Secrets scan (gitleaks)
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npx prettier --check .
      - run: npx tsc --noEmit
      - name: Unit & integration tests (80% coverage floor)
        run: npx vitest run --coverage

  docker-e2e-and-budgets:
    needs: static-and-unit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - name: Build production image once (cached layers)
        uses: docker/build-push-action@v6
        with:
          context: .
          load: true
          tags: app:ci-${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Boot container & wait for healthcheck
        run: |
          docker run -d --name app-ci -p 3000:3000 app:ci-${{ github.sha }}
          timeout 30 bash -c 'until curl -fsS http://127.0.0.1:3000/health >/dev/null; do sleep 1; done'

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - run: npm ci
      - run: npx playwright install --with-deps chromium webkit

      - name: Run Playwright E2E + axe WCAG 2.2 gates against container
        env:
          BASE_URL: http://127.0.0.1:3000
        run: npx playwright test

      - name: Enforce Lighthouse CI CWV budgets
        run: npx @lhci/cli@0.14.x autorun --collect.url=http://127.0.0.1:3000

      - name: Upload Playwright traces on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-traces
          path: test-results/
          retention-days: 7

      - name: Stop container
        if: always()
        run: docker rm -f app-ci || true
```

- **Related Security Gates**: Pair this pipeline with SAST, SCA (`Dependabot`/`Snyk`), and DAST in [`security-owasp-checklist.md`](./security-owasp-checklist.md).
- **Production Deployment**: Gate CD deploy jobs on `needs: [quality-gates]` per [`web-publishing-deployment`](../../web-publishing-deployment/SKILL.md).
