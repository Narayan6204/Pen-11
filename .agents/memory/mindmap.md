# Pen 11 — Project Mind Map
> Last Updated: 2026-09-21

---

## Architecture Overview

Pen 11 is a **Windows-only transparent fullscreen overlay drawing application** built in Python/PyQt6.
It lets users draw, annotate, and select vector objects directly on top of any running application.
A companion Material Design 3 web landing page & interactive canvas demo (hosted via Cloudflare Pages at https://pen-11.pages.dev/) mirrors the core canvas features.

---

## File Structure

```
Pen 11/
+-- main.py              Core app: overlay window, toolbar, drawing engine (~133 KB, 2952 lines)
+-- storage.py           Validated settings persistence -> %APPDATA%/Pen11/settings.json (100 lines)
+-- process_manager.py   Single-instance IPC guard via QLocalServer (2.3 KB)
+-- requirements.txt     Runtime/build dependencies for PyQt6, keyboard, and PyInstaller
+-- run.bat               Windows launcher pinned to venv\Scripts\python.exe
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
| `OverlayWindow` | main.py | L764 | **CORE**: fullscreen transparent QMainWindow — vector render, mouse events, tablet events, lasso, transform |
| `FloatingColorPalette` | main.py | L2093 | 12-swatch color picker, active glow |
| `ToolbarWindow` | main.py | L2172 | **CORE**: floating toolbar, collapsible pill animation |
| `AppSystemTray` | main.py | L2626 | System tray icon + context menu |
| `MainAppCoordinator` | main.py | L2680 | **CORE**: master coordinator, settings restore, hotkeys, `_clamp_to_screen` |
| `SettingsManager` | storage.py | L22 | JSON persistence with per-field validation and atomic `.tmp` replacement |
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
10. **Persistence**: JSON settings in %APPDATA%/Pen11/, per-field validation, debounced writes, toolbar/floating-panel positions, single-instance IPC, atomic write (crash-safe)
11. **Web Companion**: M3 landing page + live HTML5 canvas demo + GitHub release telemetry
12. **Fade Tooltips**: All buttons use FadeTooltip singleton (no blinking, smooth fade in/out, race-condition safe)
13. **PEN-ONLY Cursor Hide**: Cursor hidden ONLY during active Pen drawing — NOT Highlighter/Eraser
14. **Pen Tablet Support**: `tabletEvent()` on OverlayWindow — pressure-sensitive variable-width strokes per segment, eraser-end auto-switch, mouse fallback at pressure=1.0
15. **Windows 11 Optimizations**: SetProcessDpiAwareness, D3D11 backend, HIGH_PRIORITY_CLASS, winmm 1ms timer
16. **Action-Based Undo**: Normal strokes, indexed selection deletion, grouped eraser gestures, clear operations, and selection move/rotate/scale/recolor restore exact state.
17. **Xournal++-Inspired Selection**: Visible-ink lasso containment, Shift-additive selection, 15-degree rotation snapping, Shift-uniform scaling, corner/side resize handles, fixed-width stroke scaling, and one undo action per completed gesture. Rotation/delete are the only external handles.
18. **Selection Regression Tests**: `test_selection.py` covers containment, recolor undo, transform undo, and resize-handle anchoring in offscreen Qt.
19. **Deterministic Launch**: `run.bat` changes to the project root and invokes the project virtual environment explicitly; README build/run commands use the same interpreter.
20. **Stable Stroke Widths**: Each stroke snapshots its `QPen` at press time, so active strokes are unaffected by later size changes; cancellation paths reset the snapshot and tablet pressure.
21. **Input and Test Hardening**: Tablet eraser detection uses the PyQt enum name with compatibility fallback; standalone stability regressions cover settings, widths, and undo.
22. **Cursor Rendering Cache**: Cursor pixmaps are cached by tool, size, and color to avoid rebuilding identical cursors during repeated UI updates.
23. **Cursor Mode Visual State**: Main toolbar buttons and cursor submenu buttons dim to 68% opacity while cursor mode is active; palette swatches use a muted blended color that preserves their selection glow. All controls restore on tool change.
24. **Visibility Fade Reset**: Cursor-mode dimming requires visible ink and is cleared immediately when the canvas is hidden.

---

## Known Issues / Fragile Areas

| Area | Risk | Location |
|------|------|----------|
| Global `keyboard` hooks | Keys stay suppressed if exception before `unhook_all()` | main.py `setup_global_shortcuts()` ~L2160 |
| Tablet pointer type int check | `event.pointerType() == 3` — integer comparison, not enum; may break in future PyQt6 | main.py `tabletEvent()` ~L987 |
| Pressure variable-width rendering | Per-segment draw is O(N) — very long pressure-varied strokes may slow paintEvent | main.py `_draw_stroke()` ~L888 |
| Web validation tooling | Web JavaScript syntax checks require Node.js, which is not part of the current environment | `web/js/` |
| Dependency isolation | Current machine uses a local `.pth` bridge to global PyQt6; fresh environments should install `requirements.txt` directly | `venv/Lib/site-packages/pen11_global_site.pth` |

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
- Confirmed and fixed: destructive desktop edits now use exact action-based undo.
- Confirmed and fixed: persisted settings are sanitized per field, including invalid encoding handling.
- Added `requirements.txt` for the documented source/build workflow.
- Hardened `run.bat` and the README to use the project virtual environment explicitly.
- Hardened resource lookup by making `run.bat` set the project root as its working directory.
- Fixed size-switch rendering: active strokes retain their starting width, while subsequent strokes use the newly selected size.
- Added persistence for detached palette and shape-toolbox positions, debounced settings writes, tablet enum compatibility, and a Windows font fallback.
- Fixed repeated cursor-mode crash caused by reusing deleted palette opacity effects; palette muting now uses color blending instead of competing graphics effects.
- Added `scratch/test_stability.py` covering settings fallback, stroke-width snapshots, and indexed-delete undo.
- Optimized repeated cursor updates and changed `test_crash.py` to exercise Qt's real paint lifecycle without inactive-painter warnings.
- Sanitized all floating-panel coordinates, clamped restored panels to usable screen bounds, and reset interrupted tablet state on focus/window loss.
- Added reversible cursor-mode dimming for the main toolbar and cursor submenu, with regression coverage.
- Repaired the NUL byte in `scratch/scaffold_ad_skill.py`; the application Python compile sweep passes.
- Existing PyQt selection smoke test and focused history scenarios pass in offscreen mode.
- **Next session MUST read this file first before any code work**
