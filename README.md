# Pen 11

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%2011%20%7C%2010-lightgrey.svg)
![Python](https://img.shields.io/badge/python-3.10+-yellow.svg)
![PyQt6](https://img.shields.io/badge/GUI-PyQt6%20Direct3D11-green.svg)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-pen--11.pages.dev-orange?style=flat&logo=cloudflarepages)](https://pen-11.pages.dev/)

A lightweight, free screen annotation tool for Windows 10 and 11. Annotate, sketch, and highlight over applications, presentations, IDEs, and video calls without taking focus away from the underlying window.

🌐 **Try it in your browser:** Test the vector drawing engine without downloading anything on our [Live Web Demo](https://pen-11.pages.dev/).

🧭 **Developer reference:** See the [Pen 11 Product, Architecture & Extension Guide](docs/PEN11_NOTION_GUIDE.md) for a Notion-ready explanation of features, runtime flow, customization points, persistence, testing, and feature-development checklists.

<p align="center">
  <img src="assets/screenshot_palette.png" alt="Pen 11 Toolbar & Color Palette" height="400" style="margin: 0 28px;">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="assets/screenshot_shapes.png" alt="Pen 11 Shapes Menu" height="400" style="margin: 0 28px;">
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img src="assets/screenshot_cursor.png" alt="Pen 11 Cursor Flyout" height="400" style="margin: 0 28px;">
</p>

---

## 📖 Story & Motivation

> *"While taking my NIELIT 'O Level' course, I found myself in need of a good screen annotation tool. However, I quickly realized that most existing options were either locked behind paywalls, bloated with unnecessary features, or suffered from laggy, outdated user interfaces.*
> 
> *Frustrated by these limitations, I decided to build my own solution using AI. The result is **Pen 11**—a blazing-fast, highly responsive, and meticulously optimized screen marker that respects your system's resources. It is entirely free and open-source, allowing anyone in the community to use it, learn from it, or modify it to suit their own needs."*

---

## 🥊 Pen 11 vs. Epic Pen vs. gInk

How does Pen 11 compare against traditional desktop screen markers?

| Feature | 🖊️ **Pen 11** | ✏️ **Epic Pen** | 🖋️ **gInk** |
| :--- | :--- | :--- | :--- |
| **Price & License** | **100% Free & Open Source (MIT)** | Free (Crippled) / **$25+ Pro Paywall** | Free & Open Source (GPL) |
| **UI & Design System** | **Modern Windows 11 Fluent / M3 Pill UI** with animated toolbar transitions | Outdated legacy Win32 UI, rigid window frame | Barebones WinForms / GDI+ UI |
| **Pen Tablet & Stylus** | **Native pressure sensitivity & auto stylus eraser flip** (`tabletEvent()`) | Stylus pressure & advanced features locked behind Pro | Basic Wintab/stylus support, no automatic eraser flip |
| **Rendering Engine** | **Two-Layer Backing Cache** with incremental stroke baking and vector transforms | $O(N)$ redraw loop; stutters under heavy drawing | GDI+ CPU redraw loop; noticeable lag on complex canvases |
| **Vector Selection & Lasso**| **Oriented Bounding Box (OBB)**: drag, rotate, scale, and delete strokes | None in Free version; limited basic moves in Pro | None (bitmap-style clear/undo only) |
| **Geometric Shapes** | **Dedicated Shapes Toolbox** (Line, Arrow, Rectangle, Rounded Rect, Circle, Triangle) with Shift-constrain | Manual shapes locked behind paid Pro version | Rudimentary shapes, no gesture detection |
| **Edge & Taskbar Safety** | **Smart screen-edge detection (`_smart_position()`)** with auto-flip & multi-monitor support | Basic dock snapping; frequently occluded by taskbar | Fixed positioning; can overflow display edges |
| **Memory & Resource Use**| Native PyQt6 overlay with cached rendering and normal event-driven idle behavior | 80–150 MB RAM, background helper services | ~40–60 MB RAM, software rasterized |
| **Installation** | **100% Portable single `.exe`** (Zero registry clutter) | Windows installer (`.msi`/`.exe`) required | Portable zip |
| **Web Companion** | **[Interactive Web Demo](https://pen-11.pages.dev/)** available anywhere | None | None |

---

## ✨ Features & Engineering Highlights

### 🖊️ Pen Tablet & Stylus Support
* **Pressure-Sensitive Variable-Width Strokes:** Integrated native `tabletEvent()` processing reads continuous hardware pressure values (`event.pressure()`). Enjoy natural, expressive calligraphic lines that dynamically taper with your hand pressure.
* **Automatic Stylus Eraser-End Flipping:** Automatically detects when you flip your stylus over (`PointerType.Eraser`). Flip to erase, and flip right back to immediately resume drawing with your previous tool without ever clicking the toolbar.
* **Duplicate Event Rejection:** Explicitly consumes and isolates `QTabletEvent` inputs to prevent Qt from generating synthetic duplicate mouse events, ensuring stutter-free inking.

### 🧭 Smart Screen-Edge Aware Popups (`_smart_position()`)
* **Multi-Monitor Boundary Detection:** Automatically determines the target monitor using `QApplication.screenAt()` based on your active cursor or button position.
* **Intelligent Auto-Flip:** Sub-menus and color palettes compute available display geometry (`availableGeometry()`). If a flyout approaches the left/right screen edge or taskbar, it automatically flips orientation horizontally and vertically with safety margins.
* **Taskbar & Dock Protection:** Never lose menus behind the Windows Taskbar or secondary monitor boundaries.

### ⚡ Two-Layer Accelerated Backing Cache Engine
* **Incremental Backing Cache:** Completed strokes are baked into an off-screen high-DPI raster cache (`QPixmap` backing store), while selected objects remain available for live vector transforms.
* **Incremental Vector Baking:** Completed drawing strokes are incrementally baked into the cache upon release (`_bake_stroke_to_cache()`), consuming virtually zero CPU cycles during continuous inking.
* **Ghost-Free Vector Transforms:** Selected objects are temporarily isolated from the static cache during drag, rotate, or scale operations, allowing live vector manipulation before rebaking.
* **DPI-Aware Backing Store:** Automatically regenerates backing buffers on monitor DPI changes (`DevicePixelRatioChange`) to ensure pin-sharp lines on 4K/retina displays.

### 💬 FadeTooltip Singleton (Flicker-Free Tooltips)
* **Smooth Fading Micro-Interactions:** Custom singleton tooltip manager with smooth alpha fade-in/fade-out transitions and zero border flicker.
* **Zero Window Focus Stealing:** Engineered with `Qt.WindowDoesNotAcceptFocus` and Windows `WS_EX_NOACTIVATE` flags—hovering over toolbar buttons never steals window focus from typing, slide presentations, or coding IDEs.

### 🎬 Animated Toolbar Interactions
* **Smooth Toolbar Collapse / Expand:** Toggle ink visibility (`Ctrl+Shift+2`) and the toolbar transitions into a compact floating pill handle using Qt property animations.
* **Non-Blocking Opacity Fades:** Floating sub-panels (Palette, Shapes, Cursors) fade in and out (`InOutSine`). Rapid clicks dynamically reverse animation from current opacity, avoiding visual snapping.

### 🪟 Independent Floating Sub-Toolbars
* **Modular Floating Panels:** Palette, Shapes Menu, and Cursor Toolbars can be independently dragged and placed anywhere across your desktop.
* **Smart Drag Synchronization:** Dragging the main toolbar naturally pulls attached flyouts along. The toolbar position persists; Shapes and Color Palette positions are session-only, and the Color Palette docks beside the toolbar on each reopen.
* **Auto-Dismiss on Tool Switch:** Selecting a drawing tool cleanly dismisses transient menus while keeping your favorite color palette open.

### 📐 Smart Objects & Pure Vector Selection
* **Oriented Bounding Box (OBB) Engine:** Group, rotate, drag, and scale multiple strokes simultaneously with oriented bounding box physics.
* **Dedicated Precision Shapes Suite:** Draw mathematically perfect Lines, Arrows, Rectangles, Rounded Rectangles, Circles, and Triangles via the dedicated floating shape toolbox with Shift-constrained aspect ratios.

### ⌨️ Native Win32 Hotkeys & Windows 11 Shell Integration
* **Zero Hooking Lag:** Uses native Win32 `RegisterHotKey` instead of low-level keyboard hooks (`WH_KEYBOARD_LL`). Zero CPU usage, no antivirus false-positives, and no timeout drops under heavy CPU load.
* **Persistent System Tray Presence:** Explicit `AppUserModelID` registration and multi-resolution tray icons keep Pen 11 accessible in the Windows 11 notification area even when running in the background.

### 💾 Persistent State & Single-Instance Safety
* **Zero-Loss Storage Manager:** Automatically saves your favorite pen widths, colors, shape selections, and toolbar coordinates to `%APPDATA%/Pen11/settings.json`.
* **Single-Instance IPC Guard:** Inter-process communication via `QLocalServer`/`QLocalSocket` guarantees only one instance runs at a time, preventing duplicate background processes and hotkey collisions.

---

## 🎯 Target Use Cases

* **🎓 Educators & Teachers:**
  Annotate PowerPoint slides, digital textbooks, PDFs, and recorded lectures in real-time. Use the **Whiteboard/Blackboard mode** (`Ctrl+B`) for math formulas, code explanations, and cursive handwriting with full stylus pressure sensitivity.
* **💻 Developers & Designers:**
  Highlight lines of code during pull request reviews, sketch architecture and data-flow diagrams during live pair programming, and circle bugs directly over running applications without stealing window focus. Group, rotate, and scale strokes with pure vector Oriented Bounding Box (OBB) selection.
* **🎤 Business Presenters & Streamers:**
  Guide audience focus during webinars and software demos using highlighters, precision arrows, and callouts. Collapse the toolbar to an unobtrusive pill (`Ctrl+Shift+2`) when recording clean screencasts or sharing screens on Zoom, Teams, and OBS.

---

## ⚡ 3-Step Quick Start Guide

Get up and running in under 30 seconds:

1. **Download & Launch:** Grab the standalone `Pen 11.exe` from the [Releases](https://github.com/Narayan6204/Pen-11/releases/latest) page. Double-click to launch immediately—no installation wizard, administrator rights, or background services required.
2. **Start Drawing (`Ctrl+1`):** Use your mouse or graphics tablet to annotate anywhere. Press `Ctrl+1` for Pen, `Ctrl+2` for Highlighter, or `Ctrl+3` for Eraser.
3. **Toggle & Present (`Ctrl+Shift+2`):** Press `Ctrl+Shift+2` to toggle ink visibility and collapse the toolbar into an unobtrusive floating pill handle for clean presentations. Press `Ctrl+Shift+C` whenever you want to wipe the canvas clean.

Tool sizes are bounded for predictable rendering: Pen **1–30 px**, Highlighter
**5–80 px**, and Eraser **10–100 px**.

---

## ⌨️ Complete Shortcut Guide

| Shortcut | Action |
| :--- | :--- |
| `Ctrl` + `1` | Select **Pen Tool** (100% pure freehand vector inking) |
| `Ctrl` + `2` | Select **Highlighter Tool** |
| `Ctrl` + `3` | Select **Eraser Tool** |
| `Ctrl` + `Alt` + `S` | Select **Selection Mode** (select and transform annotations) |
| `Ctrl` + `Shift` + `1` | Toggle **Cursor mode** while preserving visible drawings |
| `Ctrl` + `Shift` + `2` | Toggle **Ink Visibility** (Collapses / Expands Toolbar) |
| `Ctrl` + `Z` | **Undo** the latest action (up to 5,000 history entries) |
| `Ctrl` + `Shift` + `C` | **Clear Screen** (Wipes all annotations) |
| `Ctrl` + `]` | **Increase** Active Tool Size |
| `Ctrl` + `[` | **Decrease** Active Tool Size |
| `Ctrl` + `P` | Toggle **Color Palette** |
| `Ctrl` + `B` | Cycle **Whiteboard / Blackboard / Transparent Mode** |
| `Ctrl` + `Q` | **Exit Application** |
| `Ctrl` or `Alt` + mouse wheel | Scroll the underlying app while a drawing tool is active; drawing takes priority while the left button is held |
| `Delete` / `Backspace` | Delete selected shape or stroke (in Selection Mode) |
| `Shift` + `Draw` | Constrain to 1:1 aspect ratio (Square/Circle) or 45° line angle |
| **Long-Press Tool** | Opens instant quick-size radial selector |
| **Shapes Toolbox** | Draw Line, Arrow, Rectangle, Rounded Rect, Circle, Triangle |

> 💡 **Intelligent Hotkey Scoping:** Inking shortcuts (`Ctrl+Z`, `Ctrl+P`, `Ctrl+B`, `Ctrl+]`, `Ctrl+[`) are automatically unhooked when the canvas is hidden (`Ctrl+Shift+2`) or when in Cursor Mode (`Ctrl+Shift+1`), so all your favorite shortcuts in VS Code, Word, Chrome, and Photoshop continue working seamlessly without conflict.

---

## ❓ Frequently Asked Questions (FAQ)

### 1. Which graphics tablets and styluses are supported?
Pen 11 supports any tablet or stylus compatible with the Windows Ink / Wintab platform, including **Wacom** (Intuos, One, Cintiq), **Huion**, **XP-Pen**, **Gaomon**, and **Microsoft Surface Pen**. Pressure-sensitive stroke tapering and automatic eraser-end stylus flipping work out of the box with zero configuration.

### 2. How does multi-monitor support work?
Pen 11 is multi-monitor native. The drawing canvas spans your virtual desktop across all connected monitors, and the smart positioning engine (`_smart_position()`) continuously monitors display boundaries. Flyout menus dynamically detect which display they reside on and automatically flip orientation so they never clip across screen borders or slip under the Windows Taskbar.

### 3. How do I completely uninstall Pen 11?
Pen 11 is 100% portable:
* It does **not** write to the Windows Registry.
* It does **not** install hidden background services.
* **To uninstall:** Simply delete `Pen 11.exe`.
* If you also want to remove your saved tool sizes and palette preferences, delete the configuration folder at:
  ```text
  %APPDATA%\Pen11\
  ```

### 4. Can I draw over fullscreen applications, games, and presentation slideshows?
Yes. Pen 11 creates a transparent, click-through capable Windows desktop overlay with non-activating window flags (`Qt.WindowDoesNotAcceptFocus` / `WS_EX_NOACTIVATE`). It can draw over PowerPoint slideshows, PDF readers, browser tabs, and other Windows desktop applications. For video games, run the game in **Borderless Windowed** mode to allow Windows desktop overlays to render on top.

### 5. How does Pen 11 manage drawing and undo history?
Completed strokes are incrementally baked into a high-DPI backing cache, while selected objects remain vector data during transforms. The desktop app limits undo history to 5,000 entries and drawing paths to 50,000 paths to keep resource use bounded. Actual performance depends on display size, hardware, and the complexity of the drawing.

### 6. Does Pen 11 steal window focus from my active applications?
No. Both the full-screen overlay canvas and floating toolbars strictly use non-activating window flags. You can sketch over PowerPoint presentations, Word documents, browser tabs, or code editors without clicking out of your active workspace.

---

## 💻 System Requirements

Pen 11 is a native PyQt6 desktop application with an event-driven idle loop. Actual memory and CPU use vary with display configuration, drawing complexity, and Windows graphics drivers.

* **OS:** Windows 10 or Windows 11 (64-bit recommended)
* **RAM:** Depends on display configuration, drawing complexity, and Windows
* **Graphics:** A Windows-compatible graphics stack supported by Qt
* **Storage:** Approximately 25 MB for the current Windows executable; the release ZIP is larger
* **Display:** Supports all resolutions (720p, 1080p, 2K, 4K, Ultrawide) and high refresh rates (60Hz, 120Hz, 144Hz+)

---

## 🛠️ Developer & Build Guide

### Running from Source
```bash
# 1. Clone the repository
git clone https://github.com/Narayan6204/Pen-11.git
cd "Pen-11"

# 2. Create the virtual environment
py -3 -m venv venv

# 3. Install dependencies
venv\Scripts\python.exe -m pip install -r requirements.txt

# 4. Run the app
venv\Scripts\python.exe main.py
```

### Compiling Standalone Executable
```bash
venv\Scripts\python.exe -m PyInstaller "Pen 11.spec" --noconfirm
```
*The compiled binary will be placed directly in the `dist/` directory as `Pen 11.exe`.*

---

## 🤝 Feedback, Bug Reports & Feature Requests

Found a bug, have a suggestion, or want to request a new feature? We'd love to hear from you!

* 🐛 **Found a bug?** Submit a [Bug Report](https://github.com/Narayan6204/Pen-11/issues/new?template=bug_report.md)
* 💡 **Have an idea?** Submit a [Feature Request](https://github.com/Narayan6204/Pen-11/issues/new?template=feature_request.md)
* 💬 **Browse discussions & open issues:** Visit [GitHub Issues](https://github.com/Narayan6204/Pen-11/issues)

---

## 💖 Support & Donate

If you find Pen 11 helpful for your studies, teaching, or daily workflow and want to support its continued development, you can buy me a coffee by scanning the UPI QR code below!

**UPI ID:** `narayanadev@ptyes`

<p align="center">
  <img src="assets/donate_qr.jpg" alt="UPI QR Code - narayanadev@ptyes" width="280">
</p>

---

## 📄 License & Credits

Released under the **MIT License**.

Developed with ♥ by **Narayan Dev**.
