# GitHub Actions Automated Deployment Reference

Production GitHub Actions pipelines using Node 22 LTS, gated on lint, typecheck, Vitest, and Docker-parity Playwright checks before publishing.

---

## 1. Gated Build, Test & GitHub Pages Deploy Workflow

Save as `.github/workflows/deploy.yml`. This runs static/unit gates and Docker-parity E2E tests before building and deploying `./dist` (never deploy `.`):

```yaml
name: Quality Gates, Build & Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages-${{ github.ref }}
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
      - run: npx prettier --check .
      - run: npx tsc --noEmit
      - run: npx vitest run --coverage

      - uses: docker/setup-buildx-action@v3

      - name: Build production image once for test parity
        uses: docker/build-push-action@v6
        with:
          context: .
          load: true
          tags: web:ci-${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Run Playwright E2E + axe gates against container
        run: |
          docker run -d --name web-ci -p 3000:3000 web:ci-${{ github.sha }}
          timeout 30 bash -c 'until curl -fsS http://127.0.0.1:3000/ >/dev/null; do sleep 1; done'
          npx playwright install --with-deps chromium
          BASE_URL=http://127.0.0.1:3000 npx playwright test
        continue-on-error: false

      - name: Upload Playwright trace on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-traces
          path: test-results/
          retention-days: 7

      - name: Stop parity container
        if: always()
        run: docker rm -f web-ci || true

  build:
    needs: quality-gates
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - uses: actions/configure-pages@v5

      - name: Upload Pages artifact (explicit build directory only)
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

For full PR threat modeling, `gitleaks`, and Lighthouse CI budgets, see [`ci-testing-docker-gates.md`](../../web-engineering-standards/references/ci-testing-docker-gates.md).

---

## 2. Secret Masking, OIDC & Environment Protection

- **Prefer OIDC over Static Keys**: Use `permissions: id-token: write` (supported by GitHub Pages, AWS, GCP/Firebase Workload Identity Federation, Azure) instead of long-lived static credentials.
- **Dynamic Secret Masking**: If a script fetches or derives a runtime token, mask it immediately before any command prints stdout:
  ```bash
  TOKEN="$(fetch_ephemeral_token)"
  echo "::add-mask::$TOKEN"
  ```
- **Environment Approvals**: Scope production deploy keys to a protected GitHub `environment: production` requiring human reviewer approval and restricting deployment branches to `main`.
- **Never Dump `env` or Print Secrets**: Avoid `printenv` / `set -x` in CI steps and enforce `gitleaks` scanning on every commit.
