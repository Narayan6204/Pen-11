---
name: web-animation-mastery
description: >-
  Expert guide for web animations, GPU-accelerated micro-interactions, HTML5/WebGL Canvas drawing engines,
  Material Design 3 cubic-bezier motion curves, container morphs, FLIP transitions, and CSS scroll-driven animations.
  Use whenever crafting fluid animations, interactive canvas tools, buttery-smooth state transitions, or high-performance UI motion.
---

# Web Animation & Motion Mastery Skill

This skill provides production-grade motion patterns, GPU acceleration strategies, mathematical bezier easings, View Transitions API techniques, and high-performance Canvas/WebGL rendering pipelines.

---

## 1. Core Principles of High-Performance Web Motion

### 1.1 The GPU Compositor Rule (Zero Main-Thread Jank)
To maintain locked 60fps / 120fps motion:
- **Animate ONLY Compositor Properties**: `transform` and `opacity`.
- **NEVER Animate Layout / Reflow Properties**: `width`, `height`, `top`, `left`, `margin`, `padding`.
- **NEVER Animate Paint-Heavy Properties Directly**: `box-shadow`, `filter` (blur), `border-width`. Instead, cross-fade a pre-rendered pseudo-element (`::after`) with the target shadow/filter using `opacity`.
- **Force GPU Layer Promotion**: Use `will-change: transform, opacity;` sparingly during active animations, removing it when idle to prevent memory bloat.

### 1.2 Material Design 3 Cubic-Bezier Motion Curves

Always use the standardized M3 motion tokens:

```css
:root {
  /* M3 Motion Curves */
  --md-sys-motion-easing-emphasized: cubic-bezier(0.2, 0.0, 0.0, 1.0);
  --md-sys-motion-easing-emphasized-accelerate: cubic-bezier(0.3, 0.0, 0.8, 0.15);
  --md-sys-motion-easing-emphasized-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1.0);
  --md-sys-motion-easing-standard: cubic-bezier(0.2, 0.0, 0.0, 1.0);
  --md-sys-motion-easing-standard-accelerate: cubic-bezier(0.3, 0.0, 1.0, 1.0);
  --md-sys-motion-easing-standard-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1.0);

  /* M3 Duration Tokens */
  --md-sys-motion-duration-short1: 50ms;
  --md-sys-motion-duration-short2: 100ms;
  --md-sys-motion-duration-short3: 150ms;
  --md-sys-motion-duration-short4: 200ms;
  --md-sys-motion-duration-medium1: 250ms;
  --md-sys-motion-duration-medium2: 300ms;
  --md-sys-motion-duration-medium3: 350ms;
  --md-sys-motion-duration-medium4: 400ms;
  --md-sys-motion-duration-long1: 450ms;
  --md-sys-motion-duration-long2: 500ms;
  --md-sys-motion-duration-long3: 550ms;
  --md-sys-motion-duration-long4: 600ms;
}
```

---

## 2. Interactive Micro-Interactions Blueprint

### 2.1 Dynamic Origin Ink Ripple (Reduced-Motion Safe & Leak-Free)
```javascript
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function attachRippleEffect(element) {
  element.addEventListener('pointerdown', (e) => {
    if (prefersReducedMotion()) return;

    const rect = element.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'm3-ripple-ink';

    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    element.appendChild(ripple);

    const cleanup = () => {
      ripple.classList.add('fade-out');
      setTimeout(() => ripple.remove(), 350);
      window.removeEventListener('pointerup', cleanup);
      window.removeEventListener('pointercancel', cleanup);
    };

    window.addEventListener('pointerup', cleanup, { once: true });
    window.addEventListener('pointercancel', cleanup, { once: true });
  });
}
```

```css
.m3-interactive-target {
  position: relative;
  overflow: hidden;
  user-select: none;
}

/* External focus ring so overflow: hidden never clips keyboard focus (WCAG 2.2 SC 2.4.11/2.4.13) */
.m3-interactive-target:focus-visible {
  outline: 3px solid var(--md-sys-color-primary, #0061a4);
  outline-offset: 2px;
}

.m3-ripple-ink {
  position: absolute;
  border-radius: 50%;
  background-color: currentColor; /* Matches foreground token on filled, tonal, and surface buttons */
  opacity: 0.12;
  transform: scale(0);
  pointer-events: none;
  animation: ripple-expand 350ms var(--md-sys-motion-easing-emphasized-decelerate) forwards;
}

.m3-ripple-ink.fade-out {
  opacity: 0;
  transition: opacity 250ms ease-out;
}

@keyframes ripple-expand {
  to {
    transform: scale(1);
  }
}
```

---

## 3. High-Performance Canvas 2D Drawing Engine

Resets DPR transforms cleanly (`setTransform`) on resize and flushes final short strokes safely without dropping taps:

```javascript
class CanvasDrawingEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx =
      canvas.getContext('2d', { alpha: true, desynchronized: true }) ||
      canvas.getContext('2d');
    this.isDrawing = false;
    this.points = [];
    this.color = '#0061A4';
    this.lineWidth = 4;
    this.initDPI();
  }

  initDPI() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  start(x, y) {
    this.isDrawing = true;
    this.points = [{ x, y }];
  }

  draw(x, y) {
    if (!this.isDrawing) return;
    this.points.push({ x, y });

    if (this.points.length > 2) {
      const p1 = this.points[this.points.length - 3];
      const p2 = this.points[this.points.length - 2];
      const p3 = this.points[this.points.length - 1];

      const mid1 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      const mid2 = { x: (p2.x + p3.x) / 2, y: (p2.y + p3.y) / 2 };

      this.ctx.beginPath();
      this.ctx.strokeStyle = this.color;
      this.ctx.lineWidth = this.lineWidth;
      this.ctx.moveTo(mid1.x, mid1.y);
      this.ctx.quadraticCurveTo(p2.x, p2.y, mid2.x, mid2.y);
      this.ctx.stroke();
    }
  }

  stop() {
    if (this.isDrawing && this.points.length >= 1) {
      const last = this.points[this.points.length - 1];
      this.ctx.beginPath();
      this.ctx.strokeStyle = this.color;
      this.ctx.lineWidth = this.lineWidth;
      if (this.points.length === 1) {
        this.ctx.moveTo(last.x, last.y);
        this.ctx.lineTo(last.x + 0.01, last.y);
      } else {
        const prev = this.points[this.points.length - 2];
        this.ctx.moveTo(prev.x, prev.y);
        this.ctx.lineTo(last.x, last.y);
      }
      this.ctx.stroke();
    }
    this.isDrawing = false;
    this.points = [];
  }
}
```

---

## 4. INP-Safe Motion, WCAG 2.2 Rules & CSS Scroll-Driven Animations

- **Protect INP (`< 200ms`, `< 50ms` Long-Task Limit)**: Throttle high-frequency `pointermove`, drag, and `scroll` callbacks with `requestAnimationFrame` (`{ passive: true }` on scroll/wheel/touch listeners). See [`../web-seo-performance-a11y/SKILL.md`](../web-seo-performance-a11y/SKILL.md).
- **WCAG 2.2 Interaction Rules**:
  - Provide **single-pointer click/tap or keyboard alternatives** for any drag-based slider, reorder list, or canvas handle (**SC 2.5.7 Dragging Movements**).
  - Size animated interactive targets to **`>= 24x24 CSS px`** (`48x48px` touch target recommended — **SC 2.5.8**).

### CSS Scroll-Driven Animations (Zero JS Main-Thread Overhead)
```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .scroll-reveal-card {
      animation: card-enter linear both;
      animation-timeline: view();
      animation-range: entry 10% cover 30%;
    }

    @keyframes card-enter {
      from {
        opacity: 0;
        transform: translateY(24px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
}
```

---

## 5. Cross-References & Advanced Guides

- [`m3-easing-curves.md`](./references/m3-easing-curves.md) — Curve matrix, CSS `linear()` spring physics, and `prefers-reduced-motion` fallbacks.
- [`view-transitions-morphing.md`](./references/view-transitions-morphing.md) — View Transitions API (`startViewTransition`, MPA `@view-transition`), FLIP morphing, and duplicate-name guards.
- [`canvas-gpu-particles.md`](./references/canvas-gpu-particles.md) — DPR-safe particles, `prefers-reduced-motion`/offscreen pause, highlighter multiply blending, and eraser modes.
- [`../material-you-web/SKILL.md`](../material-you-web/SKILL.md) — M3 system tokens, surface containers, and accessible component specifications.
