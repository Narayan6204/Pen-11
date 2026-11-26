# Code Index — Pen 11
> Last Updated: 2026-10-18

---

## main.py (93 KB) — Core Application

**Purpose**: PyQt6 frameless transparent overlay app — drawing engine, toolbar, color palette, system tray, global hotkeys, coordinator.

### Enums & Constants

| Symbol | Line | Purpose |
|--------|------|---------|
| `ToolMode` | L49 | Enum: PEN, HIGHLIGHTER, ERASER, CURSOR, SHAPE, SELECT |
| `ShapeType` | L57 | Enum: LINE, ARROW, RECTANGLE, ROUNDED_RECTANGLE, TRIANGLE, CIRCLE |
| `BackgroundMode` | L65 | Enum: TRANSPARENT, WHITEBOARD, BLACKBOARD |

### Classes

| Class | Line | Purpose |
|-------|------|---------|
| `ShortcutSignals` | L84 | Central QObject signal bus for all UI + hotkey events |
| `HoldButton` | L111 | QPushButton + 400ms long-press signal for size menus |
| `FloatingPanel` | L177 | Base frameless translucent window with drag handle + fade animations |
| `CustomHoverMenu` | L268 | Grid popup panel anchored to toolbar buttons |
| `FloatingShapeToolbox` | L318 | Floating shape-selector palette |
| `ClickMenuButton` | L371 | Toggle QPushButton + anchor popup menus |
| `DragHandle` | L403 | Drag widget emitting position delta signals |
| `OverlayWindow` | L445 | Main transparent fullscreen QMainWindow |
| `FloatingColorPalette` | L1321 | 12-swatch color picker with active glow |
| `SizeFeedback` | L379 | Non-interactive temporary tool-size badge |
| `ToolbarWindow` | L1402 | Primary floating toolbar with pill collapse animation |
| `AppSystemTray` | L1810 | System tray icon + context menu (Toggle, Clear, About, Exit) |
| `MainAppCoordinator` | L1864 | Master coordinator: wires all components + restores settings |

### Key Methods in OverlayWindow (L445)

| Method | Approx Line | Purpose |
|--------|-------------|---------|
| `set_click_through()` | L655 | Win32 SetWindowLongW -> WS_EX_TRANSPARENT toggle |
| `toggle_cursor_mode()` | L1246 | Reversible Cursor-mode toggle that preserves visible drawings |
| `_build_shape_path()` | L678 | Geometric paths with Shift-key snap (aspect ratio + 45deg) |
| `_draw_stroke()` | L744 | Render vector stroke with pen/highlighter settings |
| `_recalculate_master_obb()` | L757 | Oriented bounding box for selected paths |
| `_get_selection_handles()` | L776 | Rotation/delete handle positions; resizing uses OBB corners and sides |
| `_erase_between()` | L1113 | Sweep eraser, remove intersected strokes |
| `_detect_shape()` | L1155 | Auto-convert rough strokes to clean circles/lines |
| `_path_fully_contained()` | L1343 | Deterministic visible-ink containment test for lasso selection |
| `_capture_selection_states()` | L1370 | Snapshot selection geometry, points, width, and color for undo |
| `_record_selection_transform()` | L1393 | Record one completed move/rotate/scale gesture as undo |
| `_begin_selection_scale()` | L1420 | Start corner or side resize with opposite anchor |

### Key Methods in ToolbarWindow (L1402)

| Method | Approx Line | Purpose |
|--------|-------------|---------|
| `start_collapse()` | L1670 | Animate toolbar -> compact pill (cubic bezier) |
| `start_expand()` | L1702 | Animate pill -> full toolbar (cubic bezier) |

## test_selection.py — Selection Regression Tests

**Purpose**: Focused offscreen tests for visible-ink lasso containment, recolor undo, one-gesture transform undo, and resize-handle anchoring.

| Test | Purpose |
|------|---------|
| `SelectionGeometryTests` | Verifies selection geometry and resize initialization |
| `SelectionUndoTests` | Verifies recolor and transform undo restoration |

### Key Functions in MainAppCoordinator (L1864)

| Method | Approx Line | Purpose |
|--------|-------------|---------|
| `_apply_saved_settings()` | L1925 | Restore tool sizes, colors, shapes, toolbar position from storage |
| `_dock_color_palette()` | L3703 | Reset temporary palette drag state and place it beside the toolbar |
| `_show_size_feedback()` | L3104 | Show the current tool size beside its toolbar button |

### Top-Level Functions

| Function | Approx Line | Purpose |
|----------|-------------|---------|
| `create_shape_icon()` | L143 | Render antialiased shape -> QPixmap/QIcon dynamically |
| `setup_global_shortcuts()` | L1835 | Register native Win32 hotkeys, including Cursor and visibility toggles |

---

## storage.py (2 KB) — Settings Persistence

**Purpose**: JSON read/write for user preferences. Zero external dependencies (stdlib only).
**Storage path**: `%APPDATA%/Pen11/settings.json`

| Symbol | Line | Purpose |
|--------|------|---------|
| `SettingsManager` | L22 | Main settings manager class |
| `SettingsManager.get()` | L51 | Read a config key with default fallback |
| `SettingsManager.set()` | L55 | Write a single config key + flush to disk |
| `SettingsManager.set_many()` | L63 | Write multiple keys in one flush |

---

## process_manager.py (2 KB) — Single Instance Guard

**Purpose**: Prevents duplicate instances using QLocalServer/QLocalSocket IPC.
**Pipe name**: `Pen11_SingleInstance_v1`

| Symbol | Line | Purpose |
|--------|------|---------|
| `SingleInstanceGuard` | L14 | Main guard class |
| `SingleInstanceGuard.try_acquire()` | L28 | Grab pipe or signal WAKEUP to existing instance |

---

## serve.js (1.5 KB) — Local Dev Server

**Purpose**: Zero-dependency Node.js HTTP server for local `web/` preview.
No classes — single script, run with `node serve.js`.

---

## test_crash.py (2 KB) — Headless Unit Tests

**Purpose**: Reproduces and validates vector selection, handle interactions, rotation, deletion.
Run headlessly (no display required for test assertions).

---

## web/index.html — Landing Page

**Purpose**: M3 landing page and product documentation with zero inline styles/scripts, native `<dialog>`, skip link, landmark separation, Schema.org `@graph` (`WebSite`, `BreadcrumbList`, `SoftwareApplication`, `HowTo`, `FAQPage`), PWA manifest link, and subsetted Material Symbols.

---

## web/js/theme-init.js — Pre-Paint Theme Boot

**Purpose**: Synchronously resolves `pen11_theme_mode` and sets `data-theme` / `data-theme-resolved` before first paint without violating strict `script-src 'self'` CSP.

---

## web/js/app.js — Web Bootstrapper

| Symbol | Line | Purpose |
|--------|------|---------|
| `App` | L11 | Orchestrator: theme controls, rAF scroll spy, hotkey table init, release tracker, native `<dialog>` focus trap/restore, safe DOM snackbar |

---

## web/js/theme.js — Color Engine

| Symbol | Line | Purpose |
|--------|------|---------|
| `ThemeEngine` | L10 | Manages `light`/`dark`/`system` theme state, `localStorage`, OS media listener, and Warm Parchment/Walnut meta `theme-color` |

---

## web/js/shortcuts.js — Shortcut Reference Matrix

| Symbol | Line | Purpose |
|--------|------|---------|
| `SHORTCUTS_DATA` | L6 | 15 verified desktop hotkey definitions |
| `ShortcutsManager` | L97 | Safe DOM search and `aria-selected` category filter matrix |
