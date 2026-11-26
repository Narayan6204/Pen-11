# WCAG 2.2 AA/AAA Accessibility Guidelines Reference

This reference provides WCAG 2.2 success criteria, contrast ratios, hardened focus-trapped modal patterns, `@axe-core/playwright` CI gates, and manual audit remediation templates.

---

## 1. Contrast Ratios & Color Accessibility

- **Normal Text (`< 18pt` / `< 24px`)**: Minimum `4.5:1` contrast ratio (AA), `7:1` (AAA).
- **Large Text (`>= 18pt` or `>= 14pt` bold)**: Minimum `3:1` contrast ratio (AA), `4.5:1` (AAA).
- **UI Components & Graphical Objects**: Minimum `3:1` contrast against adjacent background colors.
- **Never rely on color alone**: Pair color states with icons, text labels, or patterns.

---

## 2. WCAG 2.2 New Criteria Matrix

WCAG 2.2 adds nine success criteria on top of 2.1 (`SC 2.4.12` and `SC 3.3.9` extend `2.4.11` and `3.3.8` to AAA). Enforce these seven core criteria on every web app:

| Success Criterion | Level | Requirement | Implementation Check |
| :--- | :--- | :--- | :--- |
| **SC 2.5.8 Target Size (Minimum)** | AA | Pointer targets `>= 24x24 CSS px` (or 24px spacing offset) | `min-width: 24px; min-height: 24px` on icon/close/pagination buttons |
| **SC 2.5.7 Dragging Movements** | AA | Any drag action has a single-pointer (click/tap) alternative | Add up/down reorder buttons, steppers, or click-to-place controls |
| **SC 2.4.11 Focus Not Obscured (Min)** | AA | Focused element is not completely hidden by sticky UI/overlays | Set `scroll-padding-top` / `scroll-padding-bottom` matching sticky bars |
| **SC 2.4.13 Focus Appearance** | AAA | Focus indicator `>= 2px` perimeter and `>= 3:1` contrast change | `outline: 3px solid ...; outline-offset: 2px;` surviving font-load/FOUT |
| **SC 3.2.6 Consistent Help** | A | Help links/chat/contact appear in the same relative order across pages | Keep help trigger in a consistent header/footer slot |
| **SC 3.3.7 Redundant Entry** | A | Auto-populate or let users reuse info already entered in a flow | Persist multi-step checkout/wizard state across steps |
| **SC 3.3.8 Accessible Auth (Min)** | AA | No cognitive puzzle (memorized password/CAPTCHA) without alternatives | Support password managers (`autocomplete`), paste, passkeys/WebAuthn, or magic links |

---

## 3. Hardened Accessible Modal Dialog (`<dialog>`)

Filters disabled/hidden elements, handles empty-focusable dialogs safely via `tabindex="-1"`, and binds native `<dialog>` `close` events so Escape and backdrop-triggered closes clean up listeners and restore focus:

```javascript
class AccessibleModal {
  constructor(dialogElement) {
    this.dialog = dialogElement;
    this.previouslyFocusedElement = null;
    this.focusableSelector = [
      'a[href]',
      'button',
      'input:not([type="hidden"])',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])',
    ]
      .map((s) => `${s}:not([disabled]):not([hidden]):not([aria-hidden="true"])`)
      .join(', ');
  }

  getFocusableElements() {
    return Array.from(this.dialog.querySelectorAll(this.focusableSelector)).filter(
      (el) => !el.closest('[hidden], [aria-hidden="true"], [inert]')
    );
  }

  open() {
    if (this.dialog.open) return;

    this.previouslyFocusedElement = document.activeElement;
    this.dialog.showModal();

    const focusables = this.getFocusableElements();
    if (focusables.length > 0) {
      focusables[0].focus();
    } else {
      if (!this.dialog.hasAttribute('tabindex')) {
        this.dialog.setAttribute('tabindex', '-1');
      }
      this.dialog.focus();
    }

    this.dialog.addEventListener('keydown', this.handleKeyDown);
    this.dialog.addEventListener('close', this.handleClose, { once: true });
  }

  close() {
    if (this.dialog.open) {
      this.dialog.close(); // Fires native 'close' event -> handleClose()
    }
  }

  handleClose = () => {
    this.dialog.removeEventListener('keydown', this.handleKeyDown);
    if (this.previouslyFocusedElement && typeof this.previouslyFocusedElement.focus === 'function') {
      this.previouslyFocusedElement.focus();
    }
    this.previouslyFocusedElement = null;
  };

  handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      const focusables = this.getFocusableElements();
      if (focusables.length === 0) {
        e.preventDefault();
        this.dialog.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && (document.activeElement === first || document.activeElement === this.dialog)) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  };
}
```

---

## 4. Automated CI Gate (`@axe-core/playwright`)

Automated tools catch ~30–40% of issues, so enforce them as **merge blockers** on `critical` and `serious` violations:

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('page passes WCAG 2.2 AA CI gate with zero critical/serious violations', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  const blocking = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious'
  );

  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
});
```

---

## 5. Semi-Annual Manual Audit & Criterion-Mapping Template

Run a full manual **keyboard-only + screen-reader (VoiceOver on macOS/iOS, NVDA on Windows)** audit **at least twice a year** and after every major release. Map every defect to a specific WCAG 2.2 criterion ID before remediation:

| ID | Route / Component | Detection Method | WCAG 2.2 SC | Severity | Remediation Plan & Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| A11Y-01 | Toolbar icon buttons | Manual inspect / DevTools | `SC 2.5.8` (Target Size Min) | Serious | Expand clickable hit box to `>= 24x24px` (`min-width`/`min-height`) |
| A11Y-02 | Canvas layer reorder | Keyboard-only pass | `SC 2.5.7` (Dragging Movements) | Serious | Add Move Up / Move Down buttons to layer context menu |
| A11Y-03 | Sticky header vs CTA | Keyboard Tab traversal | `SC 2.4.11` (Focus Not Obscured) | Critical | Add `scroll-padding-top: 72px` on `html` |
| A11Y-04 | Toast status updates | VoiceOver / NVDA | `SC 4.1.3` (Status Messages) | Moderate | Add `role="status" aria-live="polite"` container |
