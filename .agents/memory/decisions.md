# Architecture Decisions — Pen 11
> Add new entries at the TOP. Newest first.

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
