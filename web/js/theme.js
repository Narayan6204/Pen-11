/**
 * theme.js
 * Material Design 3 Light / Dark / System Theme Engine for Pen 11.
 * CSS design tokens live declaratively in css/00-tokens.css; this module
 * manages mode persistence, OS media-query sync, and meta theme-color updates.
 */

const VALID_MODES = new Set(['light', 'dark', 'system']);

export class ThemeEngine {
  constructor() {
    this.currentMode = 'light';
    this.modeListeners = new Set();

    this._mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this._mediaQueryListener = () => {
      if (this.currentMode === 'system') {
        this._applyTheme();
        this._notifyListeners();
      }
    };
    this._mediaQuery.addEventListener('change', this._mediaQueryListener);

    this._loadSettings();
    this._applyTheme();
    window.pen11ThemeEngine = this;
  }

  _loadSettings() {
    try {
      const savedMode = localStorage.getItem('pen11_theme_mode');
      if (savedMode && VALID_MODES.has(savedMode)) {
        this.currentMode = savedMode;
      }
    } catch {
      // Ignored when storage is restricted
    }
  }

  _saveSettings() {
    try {
      localStorage.setItem('pen11_theme_mode', this.currentMode);
    } catch {
      // Ignored when storage is restricted
    }
  }

  get isDark() {
    if (this.currentMode === 'dark') return true;
    if (this.currentMode === 'light') return false;
    return this._mediaQuery.matches;
  }

  /**
   * Sets the active theme mode ('light', 'dark', or 'system')
   * @param {'light'|'dark'|'system'} mode
   */
  setMode(mode) {
    if (!VALID_MODES.has(mode)) return;
    this.currentMode = mode;
    this._saveSettings();
    this._applyTheme();
    this._notifyListeners();
  }

  /**
   * Registers a callback triggered when the resolved theme or mode changes
   * @param {Function} callback
   */
  onModeChange(callback) {
    this.modeListeners.add(callback);
    return () => this.modeListeners.delete(callback);
  }

  _notifyListeners() {
    this.modeListeners.forEach((cb) => {
      try {
        cb(this.currentMode, this.isDark);
      } catch (err) {
        console.error('[ThemeEngine] Mode listener failed:', err);
      }
    });
  }

  _applyTheme() {
    const root = document.documentElement;
    const isDarkMode = this.isDark;

    if (this.currentMode === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', this.currentMode);
    }
    root.setAttribute('data-theme-resolved', isDarkMode ? 'dark' : 'light');

    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTheme);
    }
    metaTheme.setAttribute('content', isDarkMode ? '#1E150A' : '#7C5C35');
  }
}

export const themeEngine = new ThemeEngine();
