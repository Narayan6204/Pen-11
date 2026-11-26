(function () {
  try {
    var savedMode = localStorage.getItem('pen11_theme_mode') || 'light';
    var prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = savedMode === 'dark' || (savedMode === 'system' && prefersDark);
    var root = document.documentElement;

    if (savedMode === 'system') {
      root.removeAttribute('data-theme');
    } else if (savedMode === 'light' || savedMode === 'dark') {
      root.setAttribute('data-theme', savedMode);
    }

    root.setAttribute('data-theme-resolved', isDark ? 'dark' : 'light');
  } catch (err) {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.setAttribute('data-theme-resolved', 'light');
  }
})();
