# Security, OWASP Top 10 & CSP Architecture Checklist

Security controls belong inside pull request reviews and blocking CI gates—not in a pre-launch audit doc nobody reads.

---

## 1. OWASP Top 10 PR Threat-Modeling Checklist

Map every pull request against the highest-risk OWASP categories:

| OWASP Category | Risk Signal | Mandatory PR Verification |
| :--- | :--- | :--- |
| **A01: Broken Access Control** | Found in **94%** of tested apps (OWASP Top 10) | Enforce server-side authorization & resource ownership checks on every API route, Server Action, and query; deny by default; never trust client-supplied `role` or `userId`. |
| **A03: Injection (XSS / SQLi)** | Unsanitized input reaching DOM, SQL, or shell | Parameterized ORM/SQL queries only; validate external input with Zod; ban raw HTML injection (`dangerouslySetInnerHTML`, `innerHTML`) without strict sanitization. |
| **A05: Security Misconfiguration** | Missing headers, verbose errors, open CORS | Enforce HSTS, `nosniff`, `frame-ancestors`, and strict CSP; disable stack traces/debug routes in production; lock CORS to explicit origins. |
| **A06: Vulnerable & Outdated Components** | Transitive CVEs & unpinned builds | Pinned lockfiles (`npm ci` / `--frozen-lockfile`) + blocking Dependabot / Snyk alerts on high/critical CVEs. |
| **A02 / A07 / A10** | Exposed keys, weak cookies, SSRF | Set `HttpOnly; Secure; SameSite=Lax` on session cookies; allowlist outbound fetch targets; zero secrets in source or logs. |

---

## 2. SAST, DAST, SCA & Supply-Chain Hygiene

Combine static, dynamic, and dependency controls across the pipeline:

1. **SAST (Static Application Security Testing)**: Run **Semgrep** or **GitHub CodeQL** on every PR to catch injection sinks, broken auth checks, and unsafe crypto in source AST.
2. **SCA (Software Composition Analysis)**: Enable **Dependabot** or **Snyk** security checks as **blocking merge gates** (not advisory warnings). Enforce `npm ci` / `pnpm install --frozen-lockfile` so CI installs exact lockfile hashes.
3. **DAST (Dynamic Application Security Testing)**: Run an automated **OWASP ZAP** baseline or **Nuclei** scan against the running Docker container in CI/staging before production promotion (see [`ci-testing-docker-gates.md`](./ci-testing-docker-gates.md)).
4. **Secrets Scanning (`gitleaks`)**: Run `gitleaks` in **both** `.pre-commit-config.yaml` and CI alongside GitHub native secret scanning to catch hardcoded credentials and hallucinated AI assistant API keys before they enter shared history.

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.21.2
    hooks:
      - id: gitleaks
```

---

## 3. Content Security Policy (CSP) Architectural Strategy

Choosing between **nonces** and **SHA-256 hashes** is an architectural rendering decision—never paper over it with `'unsafe-inline'`.

| Rendering Mode | CSP Strategy | Why & Trade-Off |
| :--- | :--- | :--- |
| **Dynamic SSR / Streaming SSR** | **Per-request cryptographic nonce** (`'nonce-${NONCE}' 'strict-dynamic'`) | Server middleware injects a fresh random token per HTML response. **Breaks static CDN HTML caching** because cached HTML cannot rotate nonces per user. |
| **Static Export / SSG / ISR / CDN** | **Build-time SHA-256 hashes** (`'sha256-...'`) | Build step automatically digests every inline bootstrap script into the CSP header/meta. Preserves edge CDN caching; requires rebuild when scripts change. |

### Hard CSP Rules

- **Strict Ban on `'unsafe-inline'` Scripts**: Never include `'unsafe-inline'` in `script-src` (or `default-src` fallback)—it neutralizes XSS protection.
- **No Permanent Report-Only Policies**: Never leave `Content-Security-Policy-Report-Only` un-graduated in production. Run report-only briefly during rollout to fix legitimate telemetry noise, then switch to enforcing `Content-Security-Policy`.
- **Mandatory Lockdowns**: Always include `object-src 'none'; base-uri 'self'; frame-ancestors 'self';` (or `'none'` if framing is disallowed).

For copy-ready HTTP header templates (nonce SSR, SHA-256 static, HSTS, `Permissions-Policy`) and CDN configs, see [`caching-cdn-headers.md`](../../web-publishing-deployment/references/caching-cdn-headers.md).
