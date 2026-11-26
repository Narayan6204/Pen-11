# Material Design 3 (Material You) Components Guide

Standards-compliant HTML and CSS implementation blueprints for Material 3 components—aligned with **WCAG 2.2 AA** (`>= 24x24px` minimum / `48x48dp` touch target), keyboard focus visibility, and GPU-compositor animations (`transform`/`opacity` only).

---

## 1. Buttons (`>= 48dp` Touch Target Safe, Accessible Icons)

```html
<!-- Filled Button -->
<button type="button" class="m3-btn m3-btn-filled m3-interactive">
  <span class="material-symbols-rounded icon" aria-hidden="true">add</span>
  <span>Filled Button</span>
</button>

<!-- Elevated Button -->
<button type="button" class="m3-btn m3-btn-elevated m3-interactive">
  <span>Elevated Button</span>
</button>

<!-- Filled Tonal Button -->
<button type="button" class="m3-btn m3-btn-tonal m3-interactive">
  <span>Tonal Button</span>
</button>

<!-- Outlined Button -->
<button type="button" class="m3-btn m3-btn-outlined m3-interactive">
  <span>Outlined Button</span>
</button>

<!-- Text Button -->
<button type="button" class="m3-btn m3-btn-text m3-interactive">
  <span>Text Button</span>
</button>

<!-- Floating Action Button (FAB) -->
<button type="button" class="m3-fab m3-interactive" aria-label="Edit document">
  <span class="material-symbols-rounded" aria-hidden="true">edit</span>
</button>

<!-- Extended FAB -->
<button type="button" class="m3-fab-extended m3-interactive">
  <span class="material-symbols-rounded" aria-hidden="true">edit</span>
  <span>Compose</span>
</button>
```

```css
.m3-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px; /* Exceeds WCAG 2.2 SC 2.5.8 24px min; add >= 4px vertical gap or 48px touch wrapper on mobile */
  padding: 0 24px;
  border-radius: var(--md-sys-shape-corner-full);
  border: none;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.1px;
  text-decoration: none;
  box-sizing: border-box;
}

.m3-btn .icon {
  font-size: 18px;
  margin-left: -4px;
}

/* Filled */
.m3-btn-filled {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

/* Elevated */
.m3-btn-elevated {
  background-color: var(--md-sys-color-surface-container-low);
  color: var(--md-sys-color-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15);
}

/* Tonal */
.m3-btn-tonal {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

/* Outlined */
.m3-btn-outlined {
  background-color: transparent;
  color: var(--md-sys-color-primary);
  border: 1px solid var(--md-sys-color-outline);
}

/* Text */
.m3-btn-text {
  background-color: transparent;
  color: var(--md-sys-color-primary);
  padding: 0 12px;
}

/* FAB */
.m3-fab,
.m3-fab-extended {
  height: 56px;
  border-radius: var(--md-sys-shape-corner-large);
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px 3px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.3);
}

.m3-fab {
  width: 56px;
}

.m3-fab-extended {
  padding: 0 20px;
  gap: 12px;
  font-weight: 500;
}
```

---

## 2. Cards (Elevated, Filled, Outlined)

Use `<article>` with semantic headings and explicit `<img>` media (explicit `width`/`height` prevents CLS and avoids inline `style="..."` CSP hazards). Never make a non-semantic `<div>` clickable around nested buttons:

```html
<!-- Elevated Card -->
<article class="m3-card m3-card-elevated">
  <img class="m3-card-media" src="/images/card-preview.webp" width="400" height="225" alt="Card preview" loading="lazy" />
  <div class="m3-card-content">
    <h3 class="m3-card-title">Elevated Card</h3>
    <p class="m3-card-subhead">Secondary supporting text</p>
    <p class="m3-card-body">Cards contain content and actions about a single subject.</p>
  </div>
</article>

<!-- Filled Card -->
<article class="m3-card m3-card-filled">
  <div class="m3-card-content">
    <h3 class="m3-card-title">Filled Card</h3>
    <p class="m3-card-body">A card with a filled container color.</p>
  </div>
</article>

<!-- Outlined Card -->
<article class="m3-card m3-card-outlined">
  <div class="m3-card-content">
    <h3 class="m3-card-title">Outlined Card</h3>
    <p class="m3-card-body">A card with clean outline strokes.</p>
  </div>
</article>
```

```css
.m3-card {
  border-radius: var(--md-sys-shape-corner-medium);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.m3-card-media {
  width: 100%;
  height: auto;
  object-fit: cover;
  display: block;
}

.m3-card-content {
  padding: 16px;
}

.m3-card-title {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 500;
  color: var(--md-sys-color-on-surface);
}

.m3-card-subhead {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--md-sys-color-on-surface-variant);
}

.m3-card-body {
  margin: 0;
  font-size: 14px;
  color: var(--md-sys-color-on-surface-variant);
  line-height: 20px;
}

.m3-card-elevated {
  background-color: var(--md-sys-color-surface-container-low);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15);
}

.m3-card-filled {
  background-color: var(--md-sys-color-surface-container-highest);
}

.m3-card-outlined {
  background-color: var(--md-sys-color-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
}
```

---

## 3. Adaptive Navigation System

```html
<nav class="m3-nav-bar" aria-label="Primary navigation">
  <a href="#explore" class="m3-nav-item active m3-interactive" aria-current="page">
    <div class="m3-nav-pill"><span class="material-symbols-rounded" aria-hidden="true">explore</span></div>
    <span class="m3-nav-label">Explore</span>
  </a>
  <a href="#saved" class="m3-nav-item m3-interactive">
    <div class="m3-nav-pill"><span class="material-symbols-rounded" aria-hidden="true">bookmark</span></div>
    <span class="m3-nav-label">Saved</span>
  </a>
  <a href="#settings" class="m3-nav-item m3-interactive">
    <div class="m3-nav-pill"><span class="material-symbols-rounded" aria-hidden="true">settings</span></div>
    <span class="m3-nav-label">Settings</span>
  </a>
</nav>
```

```css
.m3-nav-bar {
  display: flex;
  height: 80px;
  background-color: var(--md-sys-color-surface-container);
  border-top: 1px solid var(--md-sys-color-outline-variant);
  justify-content: space-around;
  align-items: center;
  padding: 0 12px;
}

.m3-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  color: var(--md-sys-color-on-surface-variant);
  border-radius: var(--md-sys-shape-corner-large);
  padding: 4px 12px;
  min-width: 48px;
  min-height: 48px;
}

.m3-nav-pill {
  width: 64px;
  height: 32px;
  border-radius: var(--md-sys-shape-corner-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.m3-nav-item.active .m3-nav-pill {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
}

.m3-nav-item.active .m3-nav-label {
  font-weight: 700;
  color: var(--md-sys-color-on-surface);
}

.m3-nav-label {
  font-size: 12px;
  font-weight: 500;
}
```

---

## 4. Chips & WCAG 2.2 Accessible GPU-Animated Switch

> [!IMPORTANT]
> Never use `display: none` on `<input>` inside custom switches—it destroys keyboard Tab focus and screen-reader semantics. Use a visually-hidden `.m3-sr-only` input with `role="switch"`, `:focus-visible`, and compositor `transform` transitions.

```html
<!-- Assist Chip -->
<button type="button" class="m3-chip m3-interactive">
  <span class="material-symbols-rounded icon" aria-hidden="true">event</span>
  <span>Add to Calendar</span>
</button>

<!-- Filter Chip (Selected) -->
<button type="button" class="m3-chip m3-chip-selected m3-interactive" aria-pressed="true">
  <span class="material-symbols-rounded icon" aria-hidden="true">check</span>
  <span>Favorites</span>
</button>

<!-- Accessible M3 Switch -->
<label class="m3-switch" for="sync-toggle">
  <input id="sync-toggle" class="m3-sr-only" type="checkbox" role="switch" checked />
  <span class="m3-switch-track" aria-hidden="true">
    <span class="m3-switch-thumb"></span>
  </span>
  <span class="m3-switch-label">Auto-save canvas</span>
</label>
```

```css
.m3-chip {
  min-height: 32px;
  padding: 0 16px;
  border-radius: var(--md-sys-shape-corner-small);
  border: 1px solid var(--md-sys-color-outline);
  background-color: transparent;
  color: var(--md-sys-color-on-surface);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.m3-chip-selected {
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  border-color: transparent;
}

/* Visually hidden input preserves keyboard Tab navigation & screen-reader announcements */
.m3-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

.m3-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  cursor: pointer;
}

.m3-switch-track {
  width: 52px;
  height: 32px;
  border-radius: var(--md-sys-shape-corner-full);
  background-color: var(--md-sys-color-surface-container-highest);
  border: 2px solid var(--md-sys-color-outline);
  position: relative;
  transition: background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
              border-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.m3-switch-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--md-sys-color-outline);
  position: absolute;
  top: 2px;
  left: 2px;
  /* Scale down instead of animating width/height/left so motion stays 100% GPU-composited */
  transform: translateX(0) scale(0.667);
  transition: transform var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
              background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.m3-switch input:checked + .m3-switch-track {
  background-color: var(--md-sys-color-primary);
  border-color: var(--md-sys-color-primary);
}

.m3-switch input:checked + .m3-switch-track .m3-switch-thumb {
  transform: translateX(20px) scale(1);
  background-color: var(--md-sys-color-on-primary);
}

.m3-switch input:focus-visible + .m3-switch-track {
  outline: 3px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}
```
