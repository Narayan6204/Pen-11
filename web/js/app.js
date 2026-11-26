/**
 * app.js
 * Main Application Orchestrator for the Pen 11 Web Application.
 * Connects ThemeEngine, ShortcutsManager, GitHubReleaseManager, Dialog & Toast HUD.
 */

import { themeEngine } from './theme.js';
import { shortcutsManager } from './shortcuts.js';
import { gitHubReleaseManager } from './github-release.js';

class App {
  constructor() {
    this.toastTimer = null;
  }

  async init() {
    this._initThemeControls();
    this._initNavigation();
    this._initShortcuts();
    this._initGitHubReleases();
    this._initDownloadModal();
  }

  // ==========================================
  // 1. Theme Controls
  // ==========================================
  _initThemeControls() {
    document.querySelectorAll('[data-theme-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.themeMode;
        if (!mode) return;
        themeEngine.setMode(mode);
        this._updateThemeModeUI(mode);
        this.showToast(`Theme: ${mode.toUpperCase()}`, 'palette');
      });
    });

    this._updateThemeModeUI(themeEngine.currentMode);
    themeEngine.onModeChange((mode) => this._updateThemeModeUI(mode));
  }

  _updateThemeModeUI(mode) {
    document.querySelectorAll('[data-theme-mode]').forEach((btn) => {
      const isActive = btn.dataset.themeMode === mode;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  // ==========================================
  // 2. Navigation, App Bar Elevation & Scroll Spy
  // ==========================================
  _initNavigation() {
    const topAppBar = document.querySelector('.m3-top-app-bar');
    if (topAppBar) {
      let ticking = false;
      const syncScrollState = () => {
        topAppBar.classList.toggle('scrolled', window.scrollY > 20);
        ticking = false;
      };
      window.addEventListener(
        'scroll',
        () => {
          if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(syncScrollState);
          }
        },
        { passive: true }
      );
      syncScrollState();
    }

    const navItems = document.querySelectorAll('.m3-nav-bar .m3-nav-item, .m3-top-app-bar-nav a');
    const sections = document.querySelectorAll('section[id]');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const setActiveNav = (sectionId) => {
      if (!sectionId) return;
      navItems.forEach((item) => {
        const href = item.getAttribute('href');
        if (href === `#${sectionId}`) {
          item.classList.add('active');
          if (item.classList.contains('m3-nav-item')) {
            item.setAttribute('aria-current', 'page');
          }
        } else if (href && href.startsWith('#') && !item.classList.contains('btn-download-popup-trigger')) {
          item.classList.remove('active');
          item.removeAttribute('aria-current');
        }
      });
    };

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;

        if (anchor.classList.contains('btn-download-popup-trigger') || href === '#download-preference-modal') {
          return;
        }

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        const targetSection = target.closest('section');
        const targetId = target.id || (targetSection ? targetSection.id : '');
        if (targetId && targetId !== 'main-content') {
          setActiveNav(targetId);
        }

        const headerOffset = window.innerWidth <= 600 ? 56 : 68;
        const offsetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });

        if (target.id === 'main-content') {
          target.focus({ preventScroll: true });
        }

        if (history.pushState) {
          history.pushState(null, '', href);
        }
      });
    });

    if ('IntersectionObserver' in window && sections.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          const visibleEntries = entries.filter((entry) => entry.isIntersecting);
          if (visibleEntries.length > 0) {
            visibleEntries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
            setActiveNav(visibleEntries[0].target.id);
          } else if (window.scrollY < 80) {
            setActiveNav('hero');
          }
        },
        {
          rootMargin: '-15% 0px -55% 0px',
          threshold: [0, 0.25, 0.5, 0.75, 1.0]
        }
      );

      sections.forEach((sec) => observer.observe(sec));
    }
  }

  // ==========================================
  // 3. Shortcuts Reference
  // ==========================================
  _initShortcuts() {
    const tableBody = document.getElementById('hotkey-table-body');
    const searchInput = document.getElementById('hotkey-search-input');
    const chipContainer = document.getElementById('hotkey-category-chips');

    if (tableBody) {
      shortcutsManager.initTable({ tableBody, searchInput, chipContainer });
    }
  }

  // ==========================================
  // 4. GitHub Release Manager
  // ==========================================
  async _initGitHubReleases() {
    try {
      await gitHubReleaseManager.updateDOM();
    } catch (err) {
      console.warn('[App] GitHub release update DOM failed:', err);
    }
  }

  // ==========================================
  // 5. Accessible Native Download Dialog
  // ==========================================
  _initDownloadModal() {
    const modal = document.getElementById('download-preference-modal');
    const closeBtn = document.getElementById('close-download-modal');
    if (!modal) return;

    const triggers = document.querySelectorAll('.btn-download-popup-trigger');
    let lastTrigger = null;
    let isDialogOpen = false;

    const syncClosedState = () => {
      if (!isDialogOpen) return;
      isDialogOpen = false;
      modal.classList.remove('active');
      document.body.classList.remove('modal-open');
      triggers.forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
      if (lastTrigger && typeof lastTrigger.focus === 'function') {
        lastTrigger.focus({ preventScroll: true });
        lastTrigger = null;
      }
    };

    const openModal = (e) => {
      if (e) e.preventDefault();
      lastTrigger = e?.currentTarget || document.activeElement;
      isDialogOpen = true;
      triggers.forEach((btn) => btn.setAttribute('aria-expanded', 'true'));
      modal.classList.add('active');
      document.body.classList.add('modal-open');

      if (typeof modal.showModal === 'function' && !modal.open) {
        modal.showModal();
      } else {
        modal.setAttribute('open', '');
      }
      if (closeBtn) closeBtn.focus({ preventScroll: true });
    };

    const closeModal = () => {
      if (typeof modal.close === 'function' && modal.open) {
        modal.close();
      } else {
        modal.removeAttribute('open');
      }
      syncClosedState();
    };

    triggers.forEach((btn) => {
      btn.addEventListener('click', openModal);
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('close', syncClosedState);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    modal.querySelectorAll('.download-option-card').forEach((card) => {
      card.addEventListener('click', () => {
        setTimeout(closeModal, 600);
      });
    });
  }

  // ==========================================
  // 6. Toast Notification System (Safe DOM, CSP-Clean)
  // ==========================================
  showToast(message, icon = 'info', durationMs = 2000) {
    let snackbar = document.getElementById('m3-global-snackbar');
    if (!snackbar) {
      snackbar = document.createElement('aside');
      snackbar.id = 'm3-global-snackbar';
      snackbar.className = 'm3-snackbar';
      snackbar.setAttribute('role', 'status');
      snackbar.setAttribute('aria-live', 'polite');

      const content = document.createElement('div');
      content.className = 'm3-snackbar-content';

      const iconEl = document.createElement('span');
      iconEl.id = 'm3-snackbar-icon';
      iconEl.className = 'material-symbols-rounded m3-snackbar-icon';
      iconEl.setAttribute('aria-hidden', 'true');
      iconEl.textContent = 'info';

      const textEl = document.createElement('span');
      textEl.id = 'm3-snackbar-text';
      textEl.className = 'm3-snackbar-text';
      textEl.textContent = 'Notification';

      content.append(iconEl, textEl);

      const actions = document.createElement('div');
      actions.className = 'm3-snackbar-actions';

      const dismissBtn = document.createElement('button');
      dismissBtn.type = 'button';
      dismissBtn.id = 'm3-snackbar-dismiss';
      dismissBtn.className = 'm3-btn m3-btn-text m3-snackbar-dismiss';
      dismissBtn.textContent = 'DISMISS';
      dismissBtn.addEventListener('click', () => {
        snackbar.classList.remove('active');
      });

      actions.appendChild(dismissBtn);
      snackbar.append(content, actions);
      document.body.appendChild(snackbar);
    }

    const textEl = snackbar.querySelector('#m3-snackbar-text');
    const iconEl = snackbar.querySelector('#m3-snackbar-icon');
    if (textEl) textEl.textContent = message;
    if (iconEl) iconEl.textContent = icon;

    snackbar.classList.add('active');

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      snackbar.classList.remove('active');
    }, durationMs);
  }
}

const bootApp = async () => {
  try {
    const app = new App();
    await app.init();
    window.pen11App = app;
    window.__PEN11_APP_LOADED__ = true;
  } catch (err) {
    console.error('[Pen 11] App initialization error:', err);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}
