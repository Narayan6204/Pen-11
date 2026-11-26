# View Transitions API & FLIP Container Morphing Reference

This reference covers seamless DOM state transitions using native browser View Transitions (SPA & MPA), duplicate `view-transition-name` avoidance, reduced-motion safety, and hardened FLIP morphing.

---

## 1. Native View Transitions API

Modern browsers support `document.startViewTransition()` for single-page state changes and `@view-transition { navigation: auto; }` for same-origin multi-page navigations.

### 1.1 Progressive Enhancement + Reduced-Motion Guard

```javascript
function updateDOMWithTransition(updateCallback) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduced) {
    updateCallback();
    return;
  }

  return document.startViewTransition(() => {
    updateCallback();
  });
}

// Assign shared view-transition-name dynamically so two visible elements never share a name simultaneously
async function morphThumbnailToHero(thumbnailEl, heroEl, openHeroFn) {
  thumbnailEl.style.viewTransitionName = 'active-media-hero';

  const transition = updateDOMWithTransition(() => {
    thumbnailEl.style.viewTransitionName = '';
    openHeroFn();
    heroEl.style.viewTransitionName = 'active-media-hero';
  });

  if (transition) {
    try {
      await transition.finished;
    } finally {
      heroEl.style.viewTransitionName = '';
    }
  }
}
```

### 1.2 CSS Rules, MPA Transitions & `view-transition-class`

```css
/* Enable cross-document transitions between same-origin MPA routes */
@view-transition {
  navigation: auto;
}

/* Never apply the same view-transition-name to two rendered elements at once */
::view-transition-group(active-media-hero) {
  animation-duration: 350ms;
  animation-timing-function: cubic-bezier(0.2, 0.0, 0.0, 1.0);
}

::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 250ms;
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation-duration: 0.01ms !important;
  }
}
```

---

## 2. The FLIP Technique (Vanilla JavaScript)

Use double `requestAnimationFrame` plus a safety timeout fallback when fine-grained local element morphing is needed:

```javascript
class FlipMorpher {
  static morph(element, mutationFn, duration = 300) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      mutationFn();
      return;
    }

    // 1. FIRST
    const first = element.getBoundingClientRect();

    // 2. MUTATE
    mutationFn();

    // 3. LAST
    const last = element.getBoundingClientRect();

    // 4. INVERT
    const deltaX = first.left - last.left;
    const deltaY = first.top - last.top;
    const deltaW = first.width / (last.width || 1);
    const deltaH = first.height / (last.height || 1);

    element.style.transformOrigin = 'top left';
    element.style.transition = 'none';
    element.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`;
    void element.offsetWidth; // Force invert style flush

    const resetStyles = () => {
      element.style.transition = '';
      element.style.transformOrigin = '';
      element.style.transform = '';
    };

    // 5. PLAY (double rAF guarantees paint of inverted frame before transition)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        element.style.transition = `transform ${duration}ms cubic-bezier(0.2, 0.0, 0.0, 1.0)`;
        element.style.transform = 'none';

        const timer = setTimeout(resetStyles, duration + 50);
        element.addEventListener(
          'transitionend',
          () => {
            clearTimeout(timer);
            resetStyles();
          },
          { once: true }
        );
      });
    });
  }
}
```
