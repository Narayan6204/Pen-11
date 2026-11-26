# Architecture Decisions — Pen 11
> Add new entries at the TOP. Newest first.

## Decision — 2026-11-26: Enforce Zero-`'unsafe-inline'` CSP via Declarative CSS Tokens & Native Web APIs

**Context**: The companion website relied on an inline `<head>` theme script, 237 inline `style="..."` attributes across `web/index.html` and JS templates, a runtime `<style>` injector in unused `ripple.js`, dynamic `document.documentElement.style.setProperty` overrides in `theme.js`, a `502.9 KB` JPEG background with CSS `filter: invert()` on dark mode, and custom `<div>` modal overlays without native top-layer focus trapping.

**Choice**: Move light Warm Parchment and dark Warm Walnut tokens declaratively into `web/css/00-tokens.css` (removing 120+ JS runtime palette mutations and 215 `!important` overrides in `05-warm-theme.css`), extract pre-paint theme init to `web/js/theme-init.js`, convert `#download-preference-modal` to native `<dialog>`, bake a native `bg_warm_waves_dark.webp` (`28.1 KB`) alongside `bg_warm_waves.webp` (`34.2 KB`), subset Material Symbols Rounded to the exact 38 used glyphs (`36 KB`), and ship strict zero-`'unsafe-inline'` headers across `web/_headers`, `firebase.json`, and `serve.js`.

**Alternatives Considered**:
- Allowing `'unsafe-inline'` or per-commit SHA-256 CSP hashes on inline `<script>` / `style=` blocks
- Keeping CSS `filter: invert()` on dark mode waves and stacked full-section `backdrop-filter: blur()` layers

**Rationale**: External synchronous `theme-init.js` + CSS-only semantic utilities achieve `script-src 'self'` and `style-src 'self' https://fonts.googleapis.com` cleanly on static hosts (Cloudflare Pages, GitHub Pages, Firebase) without brittle hashes or server middleware, while dramatically cutting payload weight and GPU compositing cost.

## Decision — 2026-11-26: Isolate 2026 Web Engineering Standards Into Its Own Skill

**Context**: Integrating Netguru's 2026 Web Development Best Practices introduced stack governance (TypeScript `strict: true`, Next.js SSG/RSC boundaries), code quality (ESLint/Prettier, pragmatic DRY, 80% diff coverage), trunk-based Git, AI coding review guardrails, OWASP Top 10, and Vitest/Playwright/Docker CI parity alongside performance, accessibility, SEO, and deployment updates.

**Choice**: Keep design, motion, SEO/CWV/WCAG 2.2, and hosting/CSP headers inside the existing web skills while adding one focused sibling skill (`.agents/skills/web-engineering-standards/`) registered in `GEMINI.md` Section 3, scoped strictly to workspace `.agents/skills/`.

**Alternatives Considered**:
- Cramming Git workflow, Playwright/Vitest, OWASP, and Copilot PR review rules into `web-publishing-deployment` (hurts progressive disclosure discovery and blurs responsibilities)
- Also modifying global plugins in `~/.gemini/config/plugins/` without explicit instruction (blocked by workspace-only write rules)

**Rationale**: Progressive disclosure injects only skill `name` and `description` at startup. Giving software-engineering gates a dedicated skill prevents trigger misses and token bloat while leaving every topic with a single canonical owner and updating workspace skills that already take #1 priority over global duplicates.

## Decision — 2026-11-03: Use Ctrl+Alt+S for Selection Mode

**Context**: Selection Mode had no keyboard shortcut after removing the obsolete
`Ctrl+4` Cursor shortcut.

**Choice**: Register `Ctrl+Alt+S` globally for the existing Selection Mode signal.

**Rationale**: The mnemonic `S` makes the action discoverable while the modifier
combination avoids changing the established numbered drawing-tool shortcuts.

## Decision — 2026-11-03: Separate Cursor Toggle from Canvas Visibility

**Context**: The old `Ctrl+5` visibility shortcut was being repurposed, while
Cursor mode needed a reversible workflow that did not hide existing annotations.

**Choice**: Use `Ctrl+Shift+1` to enter click-through Cursor mode and restore the
previous drawing tool on the next press. Use `Ctrl+Shift+2` solely to toggle ink
visibility and toolbar collapse/expand. Do not register a separate `Ctrl+4`
shortcut.

**Rationale**: Users can pass input to the underlying application without losing
their annotations, and can independently hide/show the canvas when presenting.

## Decision — 2026-11-03: Use a Temporary Non-Interactive Size Badge

**Context**: One-pixel keyboard size changes are precise but otherwise invisible,
so users cannot tell which size is active.

**Choice**: Show a short-lived `Tool: N px` badge beside the active toolbar button
after keyboard and quick-menu size changes. Keep it non-interactive and clamp its
position to the active monitor.

**Alternatives Considered**:
- Change the button tooltip permanently
- Show a centered notification over the drawing canvas
- Animate a child widget inside the toolbar

**Rationale**: A local badge provides immediate context without covering the canvas
or stealing input. A plain top-level label avoids the known QGraphics opacity and
layout geometry animation crash paths.

## Decision — 2026-11-03: Optimize Pen Presets for Handwriting

**Context**: Most handwriting uses small Pen sizes, while users still need access
to intermediate sizes and the `1 px` minimum.

**Choice**: Use Pen quick-size presets `2, 4, 8, 12, 20, 30 px`; retain keyboard
increment/decrement across the full `1..30 px` range.

**Alternatives Considered**:
- Keep evenly spaced presets
- Add every integer to the menu
- Raise the minimum and remove one-pixel keyboard access

**Rationale**: The six presets prioritize common handwriting sizes without making
the menu noisy. Keyboard stepping preserves precise control when a preset is not
enough.

## Decision — 2026-11-03: Bound Drawing Tool Sizes

**Context**: Large eraser sizes caused visual disturbance, and keyboard increments
could exceed the quick-size menu's largest option.

**Choice**: Enforce Pen `1..30 px`, Highlighter `5..80 px`, and Eraser `10..100 px`
across settings validation, keyboard size changes, and quick-size menus.

**Alternatives Considered**:
- Keep the existing maximums (`50`, `100`, and `200`)
- Limit only the eraser
- Use different limits for saved settings and interactive controls

**Rationale**: One consistent policy prevents invalid saved values and avoids
confusing differences between the toolbar and keyboard controls. A `1 px` pen
supports fine annotation while the reduced maxima protect visual stability.

## Decision — 2026-11-03: Keep Color Palette Position Session-Only

**Context**: Persisting the color palette's detached coordinates made it reopen at
an old location instead of near the main toolbar.

**Choice**: Do not read or write palette coordinates. Allow dragging while open,
but reset the palette to the toolbar-adjacent dock position whenever it is opened
again or restored after canvas visibility changes.

**Alternatives Considered**:
- Continue persisting the last dragged coordinates
- Keep the last position in memory for the process lifetime
- Remove dragging from the palette

**Rationale**: The requested interaction keeps temporary freedom to drag without
creating a sticky layout state. Existing toolbar and shape-toolbox persistence is
unaffected.

## Decision — 2026-11-03: Maintain a Single Notion-Ready Extension Guide

**Context**: Feature behavior and customization knowledge was spread across the
README, implementation files, tests, and the web companion.

**Choice**: Keep a dedicated `docs/PEN11_NOTION_GUIDE.md` that explains the product,
runtime lifecycle, architecture boundaries, persistence, shortcuts, extension
recipes, testing, and fragile areas. Link to it from the README.

**Alternatives Considered**:
- Put all maintainer guidance in `README.md`
- Create separate feature, architecture, and customization documents
- Use an external Notion page as the only source of truth

**Rationale**: A single Markdown source is easy to version with code, can be pasted
or imported into Notion, avoids README overload, and keeps future feature work
grounded in the actual repository.

## Decision — 2026-10-18: Preserve Stroke Width During Selection Resize

**Context**: Repeatedly shrinking and enlarging a selected stroke caused its pen width to change and produce visually bold results.

**Choice**: Selection resize transforms the stroke path and pressure points but leaves the stored pen width unchanged.

**Alternatives Considered**:
- Scale pen width with the average geometric scale
- Recompute width from the current transformed bounding box

**Rationale**: Pen width is an intentional drawing property, not selection UI state. Keeping it stable prevents cumulative visual thickening and makes repeated resize operations predictable.

## Decision — 2026-10-18: Geometry-Based Selection Transactions

**Context**: Xournal++ selection behavior exposed gaps in Pen 11's lasso semantics, modifier behavior, resize handles, and undo history.

**Choice**: Select strokes based on sampled visible stroked geometry, capture identity-based pre-gesture snapshots, and commit one undo action when a move, rotation, scale, or recolor gesture completes. Add Shift modifiers for additive selection, rotation snapping, and uniform scaling.

**Alternatives Considered**:
- Continue using bounding-box coverage for lasso selection
- Record every pointer-move mutation as a separate undo entry
- Add translation grid snapping without an existing Pen 11 grid model

**Rationale**: Visible-ink containment matches the intended complete-element selection semantics, identity snapshots survive index shifts, gesture-level undo preserves a usable history, and unsupported grid behavior was intentionally not invented.

---

## Decision — 2026-08-21: Persistent Memory via Markdown Files

**Context**: AI agent was re-scanning the full codebase (93KB main.py) on every session, wasting time and context budget.

**Choice**: Use 4 markdown files in `.agents/memory/` as a persistent mind map.

**Alternatives Considered**:
- SQLite DB: Overkill, hard to read/edit manually
- Single large memory file: Gets unwieldy, harder to update incrementally
- JSON format: Less readable for the AI to parse quickly

**Rationale**: Markdown is human-readable, AI-readable, git-friendly, and editable.
4 focused files (mindmap, index, sessions, decisions) each serve a distinct purpose and stay lean.

---

## Decision — 2026-08-21: Windows-Only ctypes for Click-Through

**Context**: Need to make the overlay window transparent to mouse events so user can interact with apps beneath it.

**Choice**: `ctypes.windll.user32.SetWindowLongW` with `WS_EX_TRANSPARENT` flag.

**Alternatives Considered**:
- PyQt6 setAttribute(Qt.WA_TransparentForMouseEvents): Does not work reliably for fullscreen overlays on Windows
- Third-party win32 library: Adds dependency; ctypes is stdlib

**Rationale**: Direct Win32 API via ctypes is the most reliable approach for transparent overlays on Windows. App is Windows-only by design.

---

## Decision — 2026-08-21: QLocalServer for Single Instance Guard

**Context**: Must prevent multiple instances of the overlay from running simultaneously.

**Choice**: `QLocalServer` / `QLocalSocket` IPC pipe named `Pen11_SingleInstance_v1`.

**Alternatives Considered**:
- OS mutex via ctypes: Works but no communication back to existing instance
- File lock: Unreliable on Windows if process crashes without cleanup

**Rationale**: QLocalServer allows both preventing duplicates AND sending a wake-up signal to bring the existing instance to foreground.

---

## Decision — 2026-08-21: GC Throttling During Stroke Drawing

**Context**: GC pauses during active mouse strokes cause visible jank in freehand drawing.

**Choice**: `gc.disable()` in `mousePressEvent`, `gc.enable()` + `gc.collect(0)` in `mouseReleaseEvent`.

**Alternatives Considered**:
- gc.set_threshold() tuning: Still allows pauses mid-stroke
- Rust/C extension for drawing hot path: Way too complex

**Rationale**: Minimal intervention with maximum effect. Known fragile area — mouseRelease must always fire.

---

## Decision — 2026-08-21: D3D11 Backend for PyQt6 Rendering

**Context**: Default OpenGL backend on Windows has compatibility issues with transparent overlay windows and DPI scaling.

**Choice**: `QSG_RHI_BACKEND=d3d11` environment variable before app init.

**Alternatives Considered**:
- OpenGL: Tearing artifacts on some GPU drivers with translucent windows
- Software renderer: Too slow for 60fps stroke rendering

**Rationale**: D3D11 is the native Windows graphics API, gives best compatibility with Per-Monitor V2 DPI and translucent compositing.
