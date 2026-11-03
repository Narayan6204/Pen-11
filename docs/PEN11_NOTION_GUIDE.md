# Pen 11 — Product, Architecture & Extension Guide

> **Purpose:** A Notion-ready reference for remembering what Pen 11 does, how the
> pieces work together, and where to make changes when adding a feature.
>
> **Last verified:** 2026-11-03  
> **Primary runtime:** Windows 10/11, Python 3.10+, PyQt6  
> **Repository:** `Narayan6204/Pen-11`

---

## 1. What Pen 11 is

Pen 11 is a Windows screen-annotation application. It creates a transparent,
full-screen PyQt6 overlay above other applications so the user can draw, highlight,
erase, select, and transform vector ink without changing the active application.

The project has two related products:

1. **Desktop app** — the production annotation tool in `main.py`.
2. **Web companion** — a Material Design 3 landing page and browser canvas demo in
   `web/`. It shares the drawing concepts but is a separate JavaScript implementation.

The desktop app is intentionally Windows-specific. It uses Win32 APIs for global
hotkeys, click-through behavior, DPI awareness, tablet behavior, process settings,
wheel forwarding, capture exclusion, and the system tray.

### Mental model

```text
User input
  -> Win32 hotkey filter / Qt mouse / Qt tablet events
  -> ShortcutSignals or OverlayWindow state
  -> vector paths + undo history
  -> backing cache + live selection layer
  -> transparent overlay and floating tool windows
```

The most important rule for future work is:

> **`OverlayWindow` owns drawing state and input. `MainAppCoordinator` owns
> composition and cross-component wiring. `ToolbarWindow` and floating panels
> should communicate through signals rather than directly mutating canvas state.**

---

## 2. Feature inventory

### Drawing and annotation

- **Pen** — freehand vector strokes, with pressure-sensitive width when a tablet
  supplies pressure data.
- **Highlighter** — translucent inking intended for emphasis.
- **Eraser** — sweep eraser that removes intersected strokes.
- **Cursor / Select** — click-select, lasso-select, drag, rotate, resize, recolor,
  and delete vector objects.
- **Smart shape detection** — rough strokes can be converted into clean shapes when
  the gesture is released.
- **Dedicated shape toolbox** — line, arrow, rectangle, rounded rectangle, triangle,
  and circle.
- **Shift constraints** — 45-degree line snapping and uniform/aspect-ratio
  constraints where supported.
- **Background modes** — transparent overlay, whiteboard, and blackboard.
- **Undo/redo** — regular strokes, eraser gestures, clear operations, and selection
  transformations are recorded as user actions. Selection transforms are committed
  as one undo action per gesture.
- **Wheel forwarding** — `Ctrl`/`Alt` + wheel can scroll the application underneath
  the overlay; active drawing takes priority.

### Floating user interface

- Draggable primary toolbar.
- Collapsible toolbar/pill mode for presentations and screen sharing.
- Floating color palette with 12 built-in swatches.
- Floating shape toolbox.
- Cursor/select controls.
- Fade-in/fade-out panels with reversible animations.
- Smart popup placement that flips and clamps against monitor edges and the taskbar.
- Tooltips that fade without stealing focus.
- Temporary size feedback badge showing the active tool and pixel size after
  keyboard or quick-menu size changes.
- The toolbar position persists. Shapes toolbox and color palette positions are
  session-only; closing/reopening the color palette docks it beside the toolbar.

### Windows integration and performance

- Native `RegisterHotKey` / `WM_HOTKEY` handling rather than a low-level keyboard
  hook.
- Scoped shortcuts are released when ink is hidden or Cursor mode is active, so
  shortcuts in VS Code, browsers, and presentation software continue to work.
- Native Windows Ink (`QT_WINTAB=0`) and tablet eraser-end detection.
- Per-monitor V2 DPI awareness.
- Qt's native Windows graphics integration with a cached backing layer.
- Above-normal process priority and EcoQoS throttling disabled during the process.
- Cached rendering for completed strokes plus a live layer for in-progress or
  selected objects.
- Minimal dirty-region updates during selection gestures.
- Screen-capture exclusion for floating controls where supported.
- Single-instance protection through `QLocalServer` / `QLocalSocket`.
- System tray menu for visibility, clearing, About, and exit.

### Persistence and distribution

- User settings are stored at `%APPDATA%\Pen11\settings.json`.
- Settings are validated and written through a temporary file followed by an atomic
  replace.
- The app is packaged as a portable PyInstaller executable.
- `Pen 11.spec` defines the executable build.

---

## 3. User workflow reference

### Quick start

1. Launch `Pen 11.exe` or run `main.py`.
2. Use `Ctrl+1` for Pen, `Ctrl+2` for Highlighter, or `Ctrl+3` for Eraser.
3. Draw over the active application.
4. Use `Ctrl+Shift+1` to toggle passive Cursor mode while keeping existing drawings
   visible. Press it again to restore the previous drawing tool.
5. Use `Ctrl+Shift+2` to hide ink and collapse the toolbar.
6. Use `Ctrl+Shift+C` to clear the canvas.

### Shortcut map

| Shortcut | Behavior | Scope |
|---|---|---|
| `Ctrl+1` | Pen | Always global |
| `Ctrl+2` | Highlighter | Always global |
| `Ctrl+3` | Eraser | Always global |
| `Ctrl+Alt+S` | Selection Mode | Always global |
| `Ctrl+Shift+1` | Toggle Cursor mode and restore the previous drawing tool | Always global |
| `Ctrl+Shift+2` | Toggle ink visibility and toolbar state | Always global |
| `Ctrl+Q` | Exit | Always global |
| `Ctrl+Z` | Undo | Scoped: ink visible and not Cursor mode |
| `Ctrl+Y` | Redo | Scoped |
| `Ctrl+Shift+Z` | Redo | Scoped |
| `Ctrl+Shift+C` | Clear screen | Scoped |
| `Ctrl+]` | Increase active tool size | Scoped |
| `Ctrl+[` | Decrease active tool size | Scoped |
| `Ctrl+P` | Toggle color palette | Scoped |
| `Ctrl+B` | Cycle background mode | Scoped |
| `Delete` / `Backspace` | Delete selected objects | Selection mode |
| `Shift` while drawing | Constrain geometry | Drawing/shape gesture |
| `Ctrl` or `Alt` + wheel | Scroll underlying app | Drawing mode, unless left button is held |

### Selection behavior

`Ctrl+Shift+1` toggles the passive Cursor mode without clearing or hiding existing
drawings. The toolbar's separate Select control
activates `ToolMode.SELECT`, which enables click selection, lassoing, and transforms.
Do not treat Cursor and Select as interchangeable when adding shortcuts or changing
click-through behavior.

1. Enter Cursor mode with `Ctrl+Shift+1`.
2. Click a stroke to select it.
3. Hold `Shift` to add objects to the current selection.
4. Drag inside the oriented bounding box to move.
5. Drag a corner or side handle to scale.
6. Drag the rotation handle to rotate.
7. Hold `Shift` while scaling for uniform scaling or while rotating for 15-degree
   snapping.
8. Use the delete handle, `Delete`, or `Backspace` to remove selected objects.
9. Select a color to recolor the selected objects.
10. Use Undo once to reverse the completed gesture, recolor, or deletion.

Selection is based on visible stroked geometry, not only a loose bounding box. This
means a lasso must contain the actual ink of an object before it is selected.

---

## 4. Desktop architecture

### File map

| File | Responsibility |
|---|---|
| `main.py` | Desktop entry point, Win32 setup, Qt widgets, canvas, drawing engine, hotkeys, tray, coordinator |
| `storage.py` | Validated JSON settings persistence |
| `process_manager.py` | Single-instance IPC guard |
| `Pen 11.spec` | PyInstaller packaging configuration |
| `requirements.txt` | Runtime/build dependencies |
| `test_selection.py` | Selection, transform, undo, and wheel regression tests |
| `test_crash.py` | Headless Qt smoke test for selection, handles, and paint lifecycle |
| `serve.js` | Zero-dependency local server for the web companion |
| `web/` | Independent landing page and browser canvas demo |

### Core classes in `main.py`

#### `ToolMode`

```text
PEN = 0
HIGHLIGHTER = 1
ERASER = 2
CURSOR = 3
SHAPE = 4
SELECT = 5
```

`CURSOR` is the user-facing selection mode; `SELECT` is also used internally for
selection behavior. Check existing mode transitions before adding a new mode.

#### `ShapeType`

```text
Line
Arrow
Rectangle
Rounded Rectangle
Triangle
Circle
```

#### `BackgroundMode`

```text
TRANSPARENT = 0
WHITEBOARD = 1
BLACKBOARD = 2
```

#### `ShortcutSignals`

The signal bus is the safe boundary between hotkeys, toolbar controls, tray actions,
and the coordinator. Add a signal here when a new UI action needs to reach another
component. Avoid making a toolbar call a canvas method directly unless the existing
pattern already requires it.

#### `OverlayWindow`

The main full-screen overlay. It owns:

- `paths`: the vector drawing objects.
- Current tool mode, active pen, colors, sizes, and background mode.
- Mouse and tablet event handling.
- Shape construction and shape auto-detection.
- Selection indices and oriented bounding box state.
- Erasing and hit testing.
- Undo/redo history.
- Backing-cache invalidation and painting.
- Click-through and wheel forwarding.

Important behavior is concentrated around:

- `mousePressEvent`, `mouseMoveEvent`, `mouseReleaseEvent`
- `tabletEvent`
- `_draw_stroke`
- `_build_shape_path`
- `_erase_between`
- `_detect_shape`
- `_path_fully_contained`
- `_recalculate_master_obb`
- `_capture_selection_states`
- `_record_selection_transform`
- `_begin_selection_scale`
- `set_click_through`

#### `FloatingPanel`, `CustomHoverMenu`, `FloatingColorPalette`,
`FloatingShapeToolbox`

These are reusable floating widgets. They share fade animation, dragging,
taskbar-safe placement, and focus/capture behavior. Use `_smart_position()` rather
than inventing per-panel screen-boundary logic.

#### `ToolbarWindow`

Owns the primary toolbar controls, collapse/expand animation, size menus, tool
selection, palette/shape flyout triggers, and toolbar movement signals.

#### `AppSystemTray`

Owns the tray icon and context menu. Add global application actions here only when
they should also be available without interacting with the toolbar.

#### `MainAppCoordinator`

The composition root. It creates the settings manager, tray, overlay, toolbar,
floating panels, hotkey manager, and signal connections. It also restores settings,
coordinates toolbar/flyout positions, scopes hotkeys, and performs shutdown cleanup.

When adding a feature that crosses two or more widgets, start here and wire it
through `ShortcutSignals`.

---

## 5. Runtime lifecycle

### Startup

1. `main.py` rejects non-Windows platforms.
2. Windows rendering, DPI, process, tablet, and AppUserModelID setup runs before
   the Qt application is created.
3. `QApplication` starts.
4. `SingleInstanceGuard.try_acquire()` prevents a duplicate process. A duplicate
   sends `WAKEUP` to the existing process and exits.
5. `MainAppCoordinator` creates the settings manager and UI components.
6. Saved settings are applied.
7. Native global hotkeys are registered through `Win32HotKeyManager`.
8. The overlay, toolbar, tray icon, and floating panels become available.

### Drawing

1. A mouse or tablet press enters the active tool path.
2. Garbage collection is throttled during active drawing to reduce frame jitter.
3. Points and pressure values are collected.
4. Movement updates only the necessary visual region.
5. Release finalizes the stroke, shape, or eraser gesture.
6. The completed object is added to `paths`, cached/baked where appropriate, and
   an undo action is recorded.

### Selection

1. Existing cached ink is temporarily excluded for live manipulation.
2. Selected objects are transformed in vector form.
3. The selection overlay is redrawn during the gesture.
4. On release, one transform transaction is recorded and the cache is rebuilt.

### Shutdown

The coordinator unregisters hotkeys, saves pending settings, closes panels, and
releases the Qt application. If a new resource or timer is introduced, add its
cleanup to the same lifecycle rather than relying on process termination.

---

## 6. Persistence reference

`SettingsManager` stores these keys:

| Key | Default | Valid range / values |
|---|---:|---|
| `pen_size` | `5` | Integer `1..30` |
| `highlighter_size` | `25` | Integer `5..80` |
| `eraser_size` | `40` | Integer `10..100` |
| `pen_color` | `#000000` | Six-digit hex color |
| `highlighter_color` | `#FFCC00` | Six-digit hex color |
| `current_shape` | `Line` | `Line`, `Arrow`, `Rectangle`, `Rounded Rectangle`, `Triangle`, `Circle` |
| `toolbar_x`, `toolbar_y` | `null` | Integer screen coordinate or `null` |
| `shape_toolbox_x`, `shape_toolbox_y` | `null` | Integer screen coordinate or `null` |

Tool-size limits are enforced consistently by saved-settings validation, keyboard
size changes, quick-size menus, and the runtime setters:

- Pen: `1..30 px`
- Highlighter: `5..80 px`
- Eraser: `10..100 px`

The Pen menu presets are `2, 4, 8, 12, 20, 30 px`, while the Highlighter and
Eraser menus expose their own presets including their maximum values. Keyboard
increments can select intermediate integer values and can reach the Pen minimum
of `1 px`.

To add a persisted preference:

1. Add a validated default to `storage.py:DEFAULTS`.
2. Extend `_sanitize()` with a strict type/range/value check.
3. Read it in `MainAppCoordinator._apply_saved_settings()`.
4. Write it from the relevant change handler, preferably with `set_many()` when
   several values change together.
5. Add a fallback for old settings files that do not contain the new key.
6. Document it in this table.

Do not store transient drawing paths in this settings file unless a deliberate
save/load document feature is being designed. Settings persistence and document
serialization are different concerns.

---

## 7. Customization cookbook

### Add a new color

1. Add the hex value to `COLORS` in `main.py`.
2. Add its readable name to `COLOR_NAMES`.
3. Confirm the palette layout still fits its panel.
4. Decide whether it should become a persisted default or remain a session-only
   swatch.
5. Update the feature documentation and any palette tests.

### Add a new shape

1. Add a `ShapeType` constant.
2. Add its button/icon to `FloatingShapeToolbox`.
3. Extend `_build_shape_path()` with the geometry.
4. Add Shift-constrained behavior if the shape has an aspect-ratio invariant.
5. Extend `_detect_shape()` only if rough strokes should auto-convert to it.
6. Update selection hit testing, bounds, and deletion behavior.
7. Add the shape to settings validation if it can be the selected default.
8. Add a regression test for normal and degenerate dimensions.

### Add a new shortcut

1. Add a `ShortcutSignals` signal if the action is cross-component.
2. Add a Win32 virtual-key constant if needed.
3. Register it in `setup_global_shortcuts()`.
4. Choose global vs scoped registration intentionally.
5. Connect it in `MainAppCoordinator`.
6. Ensure it is unregistered in shutdown.
7. Document it in the shortcut table and README.

Avoid adding shortcuts as always-global by default. Scoped registration exists to
prevent Pen 11 from hijacking the user's shortcuts in other applications.

### Add a toolbar or flyout control

1. Prefer an existing `HoldButton`, `ClickMenuButton`, or `FloatingPanel`.
2. Add the UI control in `ToolbarWindow` or the appropriate floating panel.
3. Emit a signal instead of reaching into `OverlayWindow` directly.
4. Connect the signal in `MainAppCoordinator`.
5. Add a tooltip using the existing fade-tooltip helper.
6. Check keyboard focus, screen-edge placement, screen capture, and high-DPI
   behavior.

### Add a new selection transformation

1. Define the gesture's start state and its invariant.
2. Capture identity-based selection snapshots before mutation.
3. Temporarily exclude selected objects from the static cache.
4. Transform vector geometry during pointer movement.
5. Preserve independent visual properties such as pen width unless the feature
   explicitly changes them.
6. Record one undo transaction on gesture completion.
7. Rebuild the cache and handle interruption paths such as focus loss or hiding.

### Customize the web companion

The web app is not a thin view of the PyQt6 app. Its main extension points are:

| File | Use |
|---|---|
| `web/js/app.js` | Browser app bootstrap and orchestration |
| `web/js/theme.js` | Dynamic theme and tonal color generation |
| `web/js/ripple.js` | Material-style interaction ripples |
| `web/js/shortcuts.js` | Browser canvas shortcuts |
| `web/js/canvas/CanvasEngine.js` | Render loop and DPI scaling |
| `web/js/canvas/ToolManager.js` | Vector strokes, shapes, modes, hit testing |
| `web/js/canvas/LassoSelector.js` | Lasso and oriented transforms |
| `web/js/canvas/HistoryManager.js` | Command-pattern undo/redo |

Implement a web-only feature in `web/` first. Do not assume a JavaScript change
automatically changes the desktop app.

---

## 8. Testing and verification

### Focused tests

Run from the project virtual environment:

```powershell
venv\Scripts\python.exe -m unittest test_selection.py
venv\Scripts\python.exe test_crash.py
```

`test_selection.py` covers visible-ink lasso containment, additive/transform
selection behavior, recolor undo, transform undo, resize anchoring, drawing
lifecycle, and modifier-wheel forwarding.

`test_crash.py` exercises real Qt paint processing plus rotate/delete handle paths.
It should exit with a non-zero status if a smoke-test step fails. Unlike
`test_selection.py`, it does not set `QT_QPA_PLATFORM=offscreen`; use a Windows
desktop session or set an appropriate Qt platform before running it headlessly.

### Before submitting a desktop change

- Run the focused tests that cover the changed behavior.
- Run `python -m py_compile main.py storage.py process_manager.py`.
- Run `git diff --check`.
- Manually verify on Windows when the change involves Win32 APIs, a real tablet,
  multiple monitors, taskbar boundaries, screen capture, or DPI scaling.
- Treat performance numbers in the README as product targets/claims, not as
  automatically verified benchmarks; benchmark cache rebuilds and long strokes
  before changing rendering internals.
- Rebuild the executable for packaging changes.

### Build

```powershell
venv\Scripts\python.exe -m pip install -r requirements.txt
venv\Scripts\python.exe -m PyInstaller "Pen 11.spec" --noconfirm
```

The generated executable is placed under `dist\`. Build outputs are generated
artifacts and should not be treated as source documentation.

### Local web preview

```powershell
node serve.js
```

The server is only for local preview; deployment configuration is separate from
the desktop executable.

---

## 9. Fragile areas and rules of thumb

- **Windows-only APIs:** keep platform guards around `ctypes.windll` calls.
- **Qt initialization order:** rendering environment variables must be set before
  the Qt application is initialized.
- **Overlay input:** click-through, active drawing, tablet events, and wheel
  forwarding interact. Test them together after changing event handling.
- **Garbage collection throttling:** every path that begins drawing must eventually
  re-enable GC, including early releases and focus/visibility interruptions.
- **Animations:** stop/reverse existing animations rather than creating competing
  timers or animations. Preserve the current opacity/position when reversing.
- **Selection cache:** selected objects must be excluded from the baked layer while
  they are being transformed, then rebaked after the gesture.
- **Undo semantics:** prefer one user action per completed gesture, not one action
  per mouse-move event.
- **Pen width:** selection resizing changes geometry but intentionally does not scale
  stored pen width.
- **Hotkey conflicts:** a new global shortcut can break the application underneath.
  Prefer scoped registration unless the action must always be available.
- **Persistence safety:** sanitize user-controlled settings and keep atomic writes.
- **Multi-monitor coordinates:** always clamp floating windows to
  `availableGeometry()`, not the full screen geometry.
- **Documentation accuracy:** verify claims such as performance, RAM, supported
  hardware, and deployment URLs against a current build before repeating them.

---

## 10. Suggested feature-development checklist

### Before coding

- [ ] Decide whether this is desktop-only, web-only, or both.
- [ ] Locate the owning component and existing helper/pattern.
- [ ] Define the user-visible behavior and keyboard/focus implications.
- [ ] Define undo, persistence, and cleanup requirements.
- [ ] Identify Windows-only behavior and manual verification needs.

### While coding

- [ ] Route cross-component actions through `ShortcutSignals`.
- [ ] Preserve vector state and cache invariants.
- [ ] Handle first run, missing settings, focus loss, hiding, and interruption.
- [ ] Keep changes small and avoid introducing a second implementation of an
      existing helper.

### Before merging

- [ ] Add or update focused tests.
- [ ] Update `README.md` if the user-facing behavior changed.
- [ ] Update this guide if architecture, shortcuts, settings, or extension points
      changed.
- [ ] Run the focused test suite, compilation, and whitespace checks.
- [ ] Perform Windows manual checks for native APIs and visual behavior.

---

## 11. Where to look first

| Question | Start here |
|---|---|
| “How does a stroke get created?” | `OverlayWindow.mousePressEvent`, `mouseMoveEvent`, `mouseReleaseEvent` |
| “How are shapes built?” | `OverlayWindow._build_shape_path` and `ShapeType` |
| “How does selection work?” | `OverlayWindow` selection methods and `test_selection.py` |
| “Why did a shortcut stop working in VS Code?” | `Win32HotKeyManager` and scoped-hotkey state |
| “Where are preferences stored?” | `storage.py` and `MainAppCoordinator._apply_saved_settings` |
| “Why is a popup off-screen?” | `FloatingPanel._smart_position` and `_clamp_to_screen` |
| “Why is rendering slow after a canvas change?” | cache baking/invalidation and dirty-region updates in `OverlayWindow` |
| “How do I package a release?” | `Pen 11.spec`, `requirements.txt`, and the build commands |
| “Is this feature also in the browser demo?” | `web/js/canvas/` and `web/js/app.js` |

---

## 12. Future ideas that fit the current architecture

These ideas are intentionally not implemented here, but the current structure has
clear extension points for them:

- Save/load named annotation documents instead of only saving preferences.
- Export the canvas to PNG/SVG/PDF.
- Add a configurable color palette and custom swatches.
- Add configurable shortcut bindings with conflict detection.
- Add a presentation timer or annotation session reset.
- Add shape fill/stroke configuration.
- Add a plugin-like command registry around `ShortcutSignals`.
- Add parity tests between the desktop and web vector models.
- Add a Windows integration test matrix for DPI, tablet, multi-monitor, and
  screen-capture behavior.

When implementing one of these, update the architecture, persistence, testing, and
user workflow sections together; a feature is not complete if only the toolbar
button exists.
