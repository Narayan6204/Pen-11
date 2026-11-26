---
name: web-engineering-standards
description: >-
  2026 production web engineering standards covering TypeScript strictness, React and Next.js SSG/RSC/SSR
  per-route rendering, pragmatic DRY, ESLint/Prettier, trunk-based Git, Conventional Commits, Vitest,
  Playwright Trace Viewer, Docker CI parity, OWASP Top 10, Dependabot/Snyk, gitleaks secrets scanning,
  nonce vs SHA-256 CSP strategy, and AI coding assistant review gates. Use whenever designing web
  architecture, configuring TypeScript or CI/CD quality gates, reviewing AI-generated PRs, or hardening web security.
---

# Web Engineering Standards (2026)

Production web engineering relies on **enforceable CI/CD merge gates and post-launch observability**, not static checklists that rot after sprint one.

---

## 1. Stage-by-Stage Gates, Observability & Stack Fit

- **Enforce, Don't Suggest**: Shift Core Web Vitals, WCAG 2.2, security, and test coverage into **blocking PR checks** before code reaches `main`.
- **Post-Launch Telemetry**: Pair CI gates with **Real User Monitoring (RUM)** via Sentry or Datadog tracking field **LCP** (`<= 2.5s`), **INP** (`< 200ms` — replaced deprecated FID in March 2024), and **CLS** (`< 0.1`), governed by **SRE error budgets** and blameless incident reviews.
- **Match Runtime Constraints, Not Hype**: Choose tools for workload constraints rather than GitHub trending. Use lean static HTML/CSS + Vite for content sites or focused tools; adopt meta-frameworks (Next.js) only when hybrid SSG/RSC/SSR routing earns the complexity.

---

## 2. 2026 Stack & Per-Route Rendering Architecture

### 2.1 Non-Negotiable TypeScript Strictness

Enable `strict: true` across every package via a shared root `tsconfig.json`—never per-file opt-in. Pair compile-time checks with runtime schema validation (e.g., **Zod**) at API, form, and environment boundaries because TypeScript types vanish at runtime.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "isolatedModules": true,
    "skipLibCheck": true
  }
}
```

### 2.2 Per-Route Rendering Strategy (Next.js / React)

Pick the rendering mode **per route** rather than defaulting the whole app to client-side rendering:

| Route Type | Rendering Mode | Primary Win | Hydration / Main-Thread Rule |
| :--- | :--- | :--- | :--- |
| Marketing, docs, landing | **Static Generation (SSG)** | Sub-2.5s **LCP** + CDN edge caching | Zero or minimal JS islands; build-time SHA-256 CSP |
| Data-heavy dashboards | **React Server Components (RSC) + Streaming SSR** | Protects **INP** (`< 200ms`) | Keep data fetching/formatting on server; minimize client bundle |
| Rich interactive widgets | **Client Component (`'use client'`)** | Responsive UI feedback | Chunk tasks `> 50ms` via `scheduler.yield()`, `useDeferredValue`, debounce inputs |

- **Explicit Boundary Convention**: Document `'use client'` vs Server Component ownership rules before scaling teams so client state never leaks up the tree and balloons hydration cost.
- **API Separation**: Treat splitting rendering from a dedicated API layer (e.g., Express / FastAPI) as a separate architectural decision from per-route rendering modes.
- **Bundle & Font Hygiene**: Serve compressed `WOFF2` fonts, minify JS/CSS with modern bundlers (Vite / Turbopack), and reserve explicit media dimensions to keep `CLS < 0.1`.

---

## 3. Code Quality, Pragmatic DRY & Mechanical Merge Gates

- **Shared Formatting & Linting**: Enforce a single ESLint flat config (`eslint.config.mjs`) and Prettier formatting as blocking CI steps.
- **Pragmatic DRY (Rule of Three)**: Prefer **three clean duplicated call sites** over one premature abstraction that tightly couples unrelated features. Extract shared utilities only when domain behavior genuinely converges.
- **Mechanical PR Blockers** (configure in branch protection + CI):
  1. **`>= 80%` test coverage floor on changed lines / business logic** (never diluted repo-wide averages).
  2. **Secrets scanning** (`gitleaks` pre-commit + CI and GitHub Secret Scanning) on every push.
  3. **Mandatory second human reviewer** via `CODEOWNERS` on `auth/**`, `payments/**`, and `.github/workflows/**`.

---

## 4. Trunk-Based Git & Conventional Commits

- **Short-Lived Feature Branches**: Merge feature branches within **hours or days**, using **feature flags** for incomplete work instead of long-lived GitFlow release branches (merge conflicts scale with branch age).
- **Conventional Commits**: Enforce `feat:`, `fix:`, `chore:`, and `BREAKING CHANGE:` prefixes (via `commitlint`) to drive automated SemVer releases and changelogs.
- **Mandatory Review on All Merges**: Zero exceptions for "small" edits—every PR requires peer review verifying tests, edge cases, and code provenance.

---

## 5. AI Coding Assistant Guardrails (Copilot / Cursor / Agents)

Treat AI-generated code identically to a **junior engineer's first draft**:

- Run through the **exact same PR checklist**, strict TypeScript (`strict: true`), ESLint flat config, and `>= 80%` changed-line coverage floor.
- **Human Verification**: Manually audit auth checks, edge cases, async error paths, and over-engineered abstractions—never waive review for velocity.
- **Hallucinated Secret Defense**: AI autocomplete frequently generates realistic-looking API keys or hardcoded defaults; enforce **pre-commit + CI `gitleaks` scanning** on every commit.

---

## 6. Cross-References

- [`ci-testing-docker-gates.md`](./references/ci-testing-docker-gates.md) — Vitest, Playwright Trace Viewer, Docker build-once test parity, `@axe-core/playwright`, Lighthouse CI budgets, and GitHub Actions workflow.
- [`security-owasp-checklist.md`](./references/security-owasp-checklist.md) — OWASP Top 10 threat-modeling checklist, SAST/DAST/SCA, Dependabot/Snyk, `gitleaks`, and nonce vs SHA-256 CSP architecture.
- [`web-seo-performance-a11y`](../web-seo-performance-a11y/SKILL.md) — Core Web Vitals optimization, WCAG 2.2 AA/AAA remediation, and JSON-LD structured data.
- [`web-publishing-deployment`](../web-publishing-deployment/SKILL.md) — Production CDN caching, HTTP security headers, and deployment pipelines.
