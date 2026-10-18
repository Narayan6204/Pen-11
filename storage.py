"""
Pen 11 — Settings Manager
Handles persistent storage of user preferences using a JSON file in %APPDATA%/Pen11/.
Settings are saved instantly on every change to protect against crashes.
"""
import json
import os
import re

# Default settings — used when no settings file exists yet
DEFAULTS = {
    'pen_size': 5,
    'highlighter_size': 25,
    'eraser_size': 40,
    'pen_color': '#000000',
    'highlighter_color': '#FFCC00',
    'current_shape': 'Line',
    'toolbar_x': None,  # None means "use default position"
    'toolbar_y': None,
    'palette_x': None,
    'palette_y': None,
    'shape_toolbox_x': None,
    'shape_toolbox_y': None,
}


class SettingsManager:
    def __init__(self):
        self._dir = os.path.join(os.environ.get('APPDATA', '.'), 'Pen11')
        self._path = os.path.join(self._dir, 'settings.json')
        self._data = dict(DEFAULTS)
        self._load()

    def _load(self):
        """Load settings from disk, falling back to defaults for missing keys."""
        try:
            if os.path.exists(self._path):
                with open(self._path, 'r', encoding='utf-8') as f:
                    saved = json.load(f)
                # Merge: use saved values but fill in any missing keys with defaults
                # Guard against corrupted files that have a non-dict JSON root
                if not isinstance(saved, dict):
                    raise ValueError("Settings file root is not a dict")
                for key, default_val in DEFAULTS.items():
                    self._data[key] = self._sanitize(key, saved.get(key, default_val))
        except (json.JSONDecodeError, UnicodeDecodeError, OSError, PermissionError, ValueError):
            # Corrupted or unreadable file — start fresh with defaults
            self._data = dict(DEFAULTS)

    @staticmethod
    def _sanitize(key, value):
        """Return a valid value for a known setting, or its default."""
        default = DEFAULTS.get(key)
        if key in ('pen_size', 'highlighter_size', 'eraser_size'):
            limits = {
                'pen_size': (2, 50),
                'highlighter_size': (5, 100),
                'eraser_size': (10, 200),
            }
            if isinstance(value, bool) or not isinstance(value, int):
                return default
            low, high = limits[key]
            return value if low <= value <= high else default
        if key in ('pen_color', 'highlighter_color'):
            return value.upper() if isinstance(value, str) and re.fullmatch(r'#[0-9A-Fa-f]{6}', value) else default
        if key == 'current_shape':
            valid_shapes = {'Line', 'Arrow', 'Rectangle', 'Rounded Rectangle', 'Triangle', 'Circle'}
            return value if value in valid_shapes else default
        if key in ('toolbar_x', 'toolbar_y', 'palette_x', 'palette_y', 'shape_toolbox_x', 'shape_toolbox_y'):
            return value if value is None or (isinstance(value, int) and not isinstance(value, bool)) else default
        return value

    def _flush(self):
        """Write current settings to disk atomically (temp file + rename).
        This prevents corruption if the app crashes mid-write."""
        try:
            os.makedirs(self._dir, exist_ok=True)
            tmp_path = self._path + '.tmp'
            with open(tmp_path, 'w', encoding='utf-8') as f:
                json.dump(self._data, f, indent=2)
                f.flush()
                os.fsync(f.fileno())  # ensure data hits disk before rename
            os.replace(tmp_path, self._path)  # atomic on Windows (POSIX-like)
        except (OSError, PermissionError):
            pass  # Silently fail — don't crash the app over a settings write

    def get(self, key):
        """Get a setting value, returning the default if the key is unknown."""
        return self._data.get(key, DEFAULTS.get(key))

    def set(self, key, value):
        """Set a single setting and immediately flush to disk."""
        self._data[key] = self._sanitize(key, value)
        self._flush()

    def set_many(self, updates: dict):
        """Set multiple settings at once, flushing only once at the end."""
        for key, value in updates.items():
            self._data[key] = self._sanitize(key, value)
        self._flush()

    def all(self) -> dict:
        """Return a copy of all current settings."""
        return dict(self._data)
