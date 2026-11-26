---
name: web-design-planning
description: >-
  Expert guide for web design planning, wireframing, layout architecture, per-route rendering strategy (SSG/RSC/SSR),
  Material 3 typography hierarchy, performance budgets, user journey mapping, and component breakdown. Use whenever
  planning, architecting, or structuring modern web applications, landing pages, dashboards, or interactive portals before or during implementation.
---

# Web Design & Architecture Planning Skill

This skill provides an end-to-end framework for conceptualizing, wireframing, architecting, and component-mapping web applications and websites. It aligns information architecture, per-route rendering boundaries, Material Design 3 typography tokens, and representative-device Core Web Vitals budgets before writing code.

---

## 1. The 5-Phase Web Planning Lifecycle

```
[Phase 1: Intent, Runtime & IA] ➔ [Phase 2: Rendering & Layout Grid] ➔ [Phase 3: M3 Typography & Tokens] ➔ [Phase 4: Component & Boundary Inventory] ➔ [Phase 5: Breakpoints & CWV Budgets]
```

### Phase 1: User Intent, Runtime Constraints & Information Architecture (IA)
- **Runtime Fit First**: Match stack complexity to actual runtime constraints—avoid framework bloat on simple static sites and never adopt a meta-framework solely because a competitor uses it.
- **Primary Utility**: Define the core job-to-be-done in one sentence.
- **User Personas & Motivations**: Identify the user's primary goal upon landing (e.g., scan info, execute a task, configure settings, checkout).
- **Core User Journey**: Map the shortest frictionless path from entry to primary call-to-action (CTA):
  1. Entry & Anchor Context (Hero / Value Proposition)
  2. Evidence & Feature Proof (Interactive preview / Metrics / Testimonials)
  3. Action Engagement (Input / Selection / Interactive sandbox)
  4. Final Commitment & Conversion (Submission / Next steps)

### Phase 2: Per-Route Rendering & Layout Architecture
- **Per-Route Rendering Mode**: Choose the rendering strategy route by route rather than globally:
  - **SSG (Static Site Generation)** for marketing, landing, and docs pages to maximize **LCP** (`<= 2.5s`) and edge caching.
  - **React Server Components (RSC) + Streaming SSR** for data-heavy dashboards and interactive views to minimize client hydration and protect **INP** (`< 200ms`).
- **Explicit Client vs. Server Boundaries**: Document which components stay server-only vs. `'use client'` leaf islands so teams do not accidentally pull heavy dependencies into client bundles.
- **Z-Pattern vs. F-Pattern**:
  - *Z-Pattern*: Landing pages, marketing sites, onboarding screens with clear visual storytelling.
  - *F-Pattern*: Content-heavy documentation, dashboards, data tables, search result feeds.
- **Layout Shell Archetypes**:
  1. **Marketing / Landing**: Sticky adaptive header -> Full-width Hero -> Alternating Feature Sections -> Social Proof / Bento Grid -> CTA Banner -> Multi-column Footer.
  2. **Application / Dashboard**: App Bar (Top) -> Adaptive Nav (Sidebar Drawer / Rail / Bottom Nav) -> Main Canvas with Sub-header -> Card/Grid Workspace -> Drawer / Action Panel.
  3. **Content / Docs**: Header -> Sticky Left TOC / Hierarchy Tree -> Center Content (max-w 72ch) -> Right-hand "On this page" anchor scroll spy.

### Phase 3: Official 15-Tier M3 Typography & Token Hierarchy
Synchronized verbatim with [`../material-you-web/SKILL.md`](../material-you-web/SKILL.md) (all 15 Material Design 3 type roles):

| Token Role | Size (rem / px) | Line Height | Letter Spacing | Weight | Typical Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display-large` | 3.5625rem (57px) | 4.0rem (64px) | -0.25px | 400 | Hero splash headlines |
| `display-medium` | 2.8125rem (45px) | 3.25rem (52px) | 0px | 400 | Primary landing headlines |
| `display-small` | 2.25rem (36px) | 2.75rem (44px) | 0px | 400 | Compact hero / feature banners |
| `headline-large` | 2.0rem (32px) | 2.5rem (40px) | 0px | 400 | Major section titles |
| `headline-medium` | 1.75rem (28px) | 2.25rem (36px) | 0px | 400 | Sub-section headings |
| `headline-small` | 1.5rem (24px) | 2.0rem (32px) | 0px | 400 | Panel and drawer headers |
| `title-large` | 1.375rem (22px) | 1.75rem (28px) | 0px | 400 | Card titles, dialog headers |
| `title-medium` | 1.0rem (16px) | 1.5rem (24px) | +0.15px | 500 | Table headers, list group headers |
| `title-small` | 0.875rem (14px) | 1.25rem (20px) | +0.1px | 500 | Compact sub-headers, metadata titles |
| `body-large` | 1.0rem (16px) | 1.5rem (24px) | +0.5px | 400 | Main body reading copy |
| `body-medium` | 0.875rem (14px) | 1.25rem (20px) | +0.25px | 400 | Supporting descriptions |
| `body-small` | 0.75rem (12px) | 1.0rem (16px) | +0.4px | 400 | Captions, helper notes |
| `label-large` | 0.875rem (14px) | 1.25rem (20px) | +0.1px | 500 | Buttons, tabs, interactive chips |
| `label-medium` | 0.75rem (12px) | 1.0rem (16px) | +0.5px | 500 | Dense badges, secondary controls |
| `label-small` | 0.6875rem (11px) | 1.0rem (16px) | +0.5px | 500 | Micro-tags, timestamps, overlines |

> **Usage Note**: Default M3 weights (`400`/`500`) keep dense UI surfaces crisp; marketing hero `display-*` and `headline-*` treatments may elevate weight to `600`/`700` while keeping the exact rem/px sizes and line heights above.

### Phase 4: Component Inventory & Client/Server Mapping
Break the UI down into modular components and mark boundary ownership before coding:
1. **Primitives (Server-safe unless interactive)**: Buttons, Icons, Badges, Tooltips, Text Inputs, Selects, Checkboxes.
2. **Composite Blocks**: Search Bar with Auto-complete (Client island), Navigation Header, Hero Section (Server/SSG), Pricing Card, Metric Stat Widget.
3. **Template Shells**: Global Layout Container, Modal/Dialog Stack, Toast Notification Manager.

### Phase 5: Responsive Breakpoint Matrix & Device Budgets

| Screen Size | Breakpoint Category | Navigation Pattern | Max Container Width | Column Grid |
| :--- | :--- | :--- | :--- | :--- |
| `< 600px` | Mobile (Compact) | Bottom Navigation Bar | `100%` (16px margin) | 4-column |
| `600px - 839px` | Tablet (Medium) | Navigation Rail | `720px` (24px margin) | 8-column |
| `840px - 1199px` | Desktop (Expanded) | Modal / Mini Drawer | `1040px` (32px margin) | 12-column |
| `>= 1200px` | Ultra-wide (Large) | Persistent Standard Drawer | `1280px` / `1440px` | 12-column |

- **Engineering & CWV Baseline**: Target TypeScript `strict: true` across packages and budget every route for a **representative mid-tier device** (`LCP <= 2.5s`, `INP < 200ms`, `CLS < 0.1`)—see [`../web-engineering-standards/SKILL.md`](../web-engineering-standards/SKILL.md) and [`../web-seo-performance-a11y/SKILL.md`](../web-seo-performance-a11y/SKILL.md).

---

## 2. Practical Blueprint: Design Planning Manifest Template

When initiating a new web feature or project, formulate a concise Planning Manifest:

```markdown
# [Project / Page Name] Design Planning Manifest

## 1. Purpose, Runtime & Performance Budget
- **Core Utility**: [e.g. Real-time collaborative screen drawing & recording]
- **Target Audience**: [e.g. Presenters, educators, developers]
- **Runtime & Type Safety**: [e.g. Static HTML/Vite or Next.js with TypeScript `strict: true`]
- **Representative Device CWV Budget**: `LCP <= 2.5s` | `INP < 200ms` | `CLS < 0.1`

## 2. Per-Route Rendering & Layout Structure
- **Route Modes**: `/` -> SSG (LCP-first); `/workspace` -> RSC + Streaming SSR (INP-first)
- **Client/Server Boundaries**: Shell, nav, docs stay Server/SSG; Canvas & ToolRail are isolated Client islands
- **Shell Style**: [Top App Bar + Floating Overlay Toolbar / Persistent Sidebar Dashboard]
- **Key Sections**:
  1. Hero / Canvas Stage
  2. Control Bar (Tool selection, brush dynamics, palette)
  3. Export / Layer Management Panel

## 3. Typography & Color Tokens
- **Font Family**: Self-hosted WOFF2 `Plus Jakarta Sans` / `Inter` (with `size-adjust` fallback)
- **Type Scale**: Official 15-tier M3 scale (`display-large` 57px -> `label-small` 11px)
- **Primary Seed Color**: `#0061A4` (Dynamic M3 Tonal Palette)
- **Background Mode**: Dark / Light adaptive with surface container tiers

## 4. Component Hierarchy
- `AppShell` (Server)
  ├── `TopAppBar` (Logo, Title, ThemeToggle, ActionCTA)
  ├── `MainCanvasStage` (Client island: WebGL/Canvas2D viewport)
  ├── `FloatingToolRail` (Client island: ToolButtons >= 24x24px, SizeSlider, ColorSwatches)
  └── `StatusSnackbarHost` (Client: `role="status"` announcements)

## 5. Interaction & State Specifications
- Default State: Pencil tool active, 4px width, primary color.
- Responsive Behavior: Toolbar docks to bottom on compact (`< 600px`), floats on expanded (`>= 840px`).
```

---

## 3. Cross-References & Detailed Modules

- [`layout-architecture.md`](./references/layout-architecture.md) — Grid systems, CSS Subgrid, Container Queries, and responsive shell architectures.
- [`typography-and-tokens.md`](./references/typography-and-tokens.md) — Font pairing rules, fluid `clamp()` matching the 15-tier M3 scale, and CSS token mappings.
- [`user-journeys-wireframes.md`](./references/user-journeys-wireframes.md) — Low-fi ASCII wireframing, UX heuristics, micro-copy, and cognitive load reduction techniques.
- [`../material-you-web/SKILL.md`](../material-you-web/SKILL.md) — M3 HCT color system, state layers, ripples, elevation, and official 15-tier type roles.
- [`../web-engineering-standards/SKILL.md`](../web-engineering-standards/SKILL.md) — TypeScript `strict: true` baseline, per-route rendering architecture, security, and CI/CD quality gates.
- [`../web-seo-performance-a11y/SKILL.md`](../web-seo-performance-a11y/SKILL.md) — Representative-device CWV budgets (`LCP`, `INP`, `CLS`), WCAG 2.2 AA/AAA enforcement, and AI Overviews SEO.
