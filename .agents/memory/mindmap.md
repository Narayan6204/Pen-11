# Pen 11 — Project Mind Map
> Last Updated: 2026-08-28

---

## Architecture Overview

Pen 11 is a **Windows-only transparent fullscreen overlay drawing application** built in Python/PyQt6.
It lets users draw, annotate, and select vector objects directly on top of any running application.
A companion Material Design 3 web landing page (hosted via Firebase) mirrors the core canvas features.

---

## File Structure

```
Pen 11/
+-- main.py              Core app: overlay window, toolbar, drawing engine (~106 KB, ~2308 lines)
+-- storage.py           Settings persistence -> %APPDATA%/Pen11/settings.json (2.6 KB)
+-- process_manager.py   Single-instance IPC guard via QLocalServer (2.3 KB)
+-- serve.js             Zero-dep Node.js local dev server for web/ preview (1.5 KB)
+-- test_crash.py        Headless unit test for vector selection & rotation (2 KB)
+-- web/
|   +-- index.html       M3 landing page + live HTML5 canvas demo
|   +-- css/
|   |   +-- index.css          CSS barrel aggregator
|   |   +-- 00-tokens.css      M3 design tokens (HCT palettes, type scale, elevation)
|   |   +-- 01-layout.css      Responsive layouts & container queries
|   |   +-- 02-components.css  M3 UI components (buttons, cards, chips)
|   |   +-- 03-motion.css      Keyframe animations & micro-interactions
|   |   +-- 04-canvas.css      Web canvas overlay styling
|   |   +-- 05-warm-theme.css  Warm cream/amber theme override
|   +-- js/
|       +-- app.js             Web app bootstrapper & orchestrator
|       +-- theme.js           HCT/RGB/HSL color math + dynamic tonal palettes
|       +-- ripple.js          M3 radial ink ripple engine
|       +-- shortcuts.js       Keyboard shortcut manager
|       +-- github-release.js  GitHub Releases API + download telemetry
|       +-- canvas/
|           +-- index.js           Canvas module barrel export
|           +-- CanvasEngine.js    60fps HTML5 vector canvas engine
|           +-- ToolManager.js     VectorStroke, VectorShape, tool mode coordination
|           +-- LassoSelector.js   Lasso selection + OBB transform handles
|           +-- HistoryManager.js  Command-pattern Undo/Redo engine
+-- .agents/
|   +-- skills/          Custom AI skill library
|   |   +-- ai-mind-map-memory/SKILL.md  ← THIS skill (MANDATORY at session start)
|   |   +-- pyqt-animation-skill/SKILL.md
|   |   +-- material-you-web/SKILL.md
|   |   +-- (others)
|   +-- memory/          AI persistent memory (this directory)
+-- GEMINI.md            Workspace rules for AI agent
+-- Pen 11.spec          PyInstaller build spec
```

---

## Key Dependency Graph

```
main.py
  +-- storage.py           (SettingsManager)
  +-- process_manager.py   (SingleInstanceGuard)
  +-- ctypes               (Windows APIs: user32, kernel32, shcore, winmm)
  +-- keyboard             (Global hotkey hooks — requires OS privileges)
  +-- PyQt6                (QtWidgets, QtCore, QtGui, QtNetwork)

process_manager.py
  +-- PyQt6                (QLocalServer, QLocalSocket)

storage.py
  +-- json, os             (stdlib only — zero dependencies)

web/js/app.js
  +-- theme.js, ripple.js, shortcuts.js, github-release.js, canvas/index.js
```

---

## Core Components Map (CURRENT — as of 2026-08-28)

### Desktop App (Python / PyQt6)

| Component | File | Approx Line | Role |
|-----------|------|-------------|------|
| `ToolMode` | main.py | L49 | Enum: PEN, HIGHLIGHTER, ERASER, CURSOR, SHAPE, SELECT |
| `ShapeType` | main.py | L57 | Enum: LINE, ARROW, RECTANGLE, ROUNDED_RECT, TRIANGLE, CIRCLE |
| `BackgroundMode` | main.py | L65 | Enum: TRANSPARENT, WHITEBOARD, BLACKBOARD |
| `ShortcutSignals` | main.py | L84 | Central QObject signal bus for all UI events |
| `FadeTooltip` | main.py | L111 | Singleton fade tooltip (QGraphicsOpacityEffect, 500ms delay, 150ms fade-in, 100ms fade-out) |
| `_install_fade_tooltip` | main.py | L210 | Helper: installs FadeTooltip on any widget, race-condition-safe |
| `HoldButton` | main.py | L240 | QPushButton with 400ms long-press → size menu |
| `ClickMenuButton` | main.py | L280 | Toggle button + anchor popup menu |
| `FloatingPanel` | main.py | L300 | Frameless translucent base widget with drag + fade + `_smart_position` static helper |
| `CustomHoverMenu` | main.py | L391 | Grid action popup, uses `_smart_position` for screen-safe placement |
| `FloatingShapeToolbox` | main.py | L440 | Shape selector floating palette |
| `DragHandle` | main.py | L530 | Drag widget, emits position deltas |
| `OverlayWindow` | main.py | L575 | **CORE**: fullscreen transparent QMainWindow — vector render, mouse events, tablet events, lasso, transform |
| `FloatingColorPalette` | main.py | L1553 | 12-swatch color picker, active glow |
| `ToolbarWindow` | main.py | L1635 | **CORE**: floating toolbar, collapsible pill animation |
| `AppSystemTray` | main.py | L2038 | System tray icon + context menu |
| `MainAppCoordinator` | main.py | L2070 | **CORE**: master coordinator, settings restore, hotkeys, `_clamp_to_screen` |
| `SettingsManager` | storage.py | L22 | JSON persistence in %APPDATA%/Pen11/settings.json (atomic write via .tmp) |
| `SingleInstanceGuard` | process_manager.py | L14 | IPC pipe to prevent duplicate instances |

### Web App (JavaScript ES6)

| Component | File | Role |
|-----------|------|------|
| `App` | web/js/app.js:L15 | Orchestrator: theme, canvas, shortcuts, releases |
| `ThemeEngine` | web/js/theme.js:L170 | CSS variable switching + HCT tonal generation |
| `RippleEngine` | web/js/ripple.js:L8 | M3 radial ripple animations |
| `ShortcutsManager` | web/js/shortcuts.js:L110 | Keyboard shortcuts on web canvas |
| `GitHubReleaseManager` | web/js/github-release.js:L47 | GitHub API + download metrics |
| `CanvasEngine` | web/js/canvas/CanvasEngine.js:L7 | 60fps HTML5 vector canvas render loop |
| `ToolManager` | web/js/canvas/ToolManager.js:L355 | Tool modes, stroke/shape creation, hit testing |
| `LassoSelector` | web/js/canvas/LassoSelector.js:L8 | Lasso selection + multi-object OBB transforms |
| `HistoryManager` | web/js/canvas/HistoryManager.js:L174 | Command-pattern Undo/Redo stack |

---

## Current Features

1. **Drawing Tools**: Freehand Pen, Translucent Highlighter, Smart Vector Eraser
2. **Geometric Shapes**: Line, Arrow, Rectangle, Rounded Rect, Circle, Triangle (Shift = snap)
3. **Smart Shape Auto-Detection**: Auto-converts rough strokes → clean circles/lines
4. **Vector Select & Transform**: Lasso + click select, OBB resize, rotation handle, delete handle, recolor
5. **Floating UI**: Draggable toolbar, collapsible pill mode, color palette, shape toolbox
6. **Smart Popup Positioning**: ALL popups auto-flip left/right, vertical clamp, multi-monitor + taskbar safe
7. **Canvas Modes**: Transparent overlay, Whiteboard, Blackboard
8. **Ink Toggle & Click-Through**: Ctrl+5, Win32 WS_EX_TRANSPARENT
9. **Performance**: D3D11 backend, Per-Monitor DPI, HIGH_PRIORITY_CLASS, GC throttling, 1ms timer (winmm)
10. **Persistence**: JSON settings in %APPDATA%/Pen11/, single-instance IPC, atomic write (crash-safe)
11. **Web Companion**: M3 landing page + live HTML5 canvas demo + GitHub release telemetry
12. **Fade Tooltips**: All buttons use FadeTooltip singleton (no blinking, smooth fade in/out, race-condition safe)
13. **PEN-ONLY Cursor Hide**: Cursor hidden ONLY during active Pen drawing — NOT Highlighter/Eraser
14. **Pen Tablet Support**: `tabletEvent()` on OverlayWindow — pressure-sensitive variable-width strokes per segment, eraser-end auto-switch, mouse fallback at pressure=1.0
15. **Windows 11 Optimizations**: SetProcessDpiAwareness, D3D11 backend, HIGH_PRIORITY_CLASS, winmm 1ms timer

---

## Known Issues / Fragile Areas

| Area | Risk | Location |
|------|------|----------|
| Windows-only ctypes calls | App crashes on non-Windows without guards | main.py `set_click_through()` ~L655 |
| Global `keyboard` hooks | Keys stay suppressed if exception before `unhook_all()` | main.py `setup_global_shortcuts()` ~L2160 |
| GC manually disabled during drawing | If mouseRelease dropped (e.g. Alt+Tab), GC stays off forever | main.py `mousePressEvent`/`mouseReleaseEvent` |
| Tablet pointer type int check | `event.pointerType() == 3` — integer comparison, not enum; may break in future PyQt6 | main.py `tabletEvent()` ~L987 |
| Pressure variable-width rendering | Per-segment draw is O(N) — very long pressure-varied strokes may slow paintEvent | main.py `_draw_stroke()` ~L888 |
| has_been_dragged flag never saved | User-dragged panel positions reset on every app restart | FloatingPanel, MainAppCoordinator |
| Selection index invalidation | Async stroke change during multi-delete → OOB index | main.py `_recalculate_master_obb()` ~L930 |

---

## Critical Rules (NEVER VIOLATE)

- **NEVER** use `widget.setCursor(BlankCursor)` directly — causes permanent invisible cursor. ALWAYS use `QApplication.setOverrideCursor()` stack
- **NEVER** animate widget geometry — causes QPainter + QVBoxLayout crashes. ONLY animate `windowOpacity`
- **NEVER** name the exe `Pen.11.exe` (dot) — correct name is `Pen 11.exe` (space)
- **ONLY** hide cursor when mode == ToolMode.PEN (not Highlighter, not Eraser)
- **ALWAYS** call `event.accept()` in `tabletEvent()` to prevent synthetic mouse event duplication

---

## Current Focus
> Updated: 2026-08-28

- All popups now use `FloatingPanel._smart_position()` — screen-edge aware, multi-monitor safe (commit `1e39d44`)
- Pen tablet support added: pressure-sensitive strokes, eraser-end flip, mouse fallback (commit `21f20b3`)
- v2.0.0 audit: 9 bugs fixed (commit `6da76bf`)
- App is stable and fully working
- Memory files were stashed in git — RECOVERED and updated now
- **Next session MUST read this file first before any code work**
