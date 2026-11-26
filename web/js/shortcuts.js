/**
 * shortcuts.js
 * Pen 11 Keyboard Shortcuts Data & Interactive Search / Category Filter Matrix.
 */

export const SHORTCUTS_DATA = [
  {
    category: 'Drawing Tools',
    action: 'Select Pen Tool',
    keys: ['Ctrl', '1'],
    description: 'Activates smooth, pressure-sensitive vector pen nib for writing and sketching.'
  },
  {
    category: 'Drawing Tools',
    action: 'Select Highlighter Tool',
    keys: ['Ctrl', '2'],
    description: 'Switches to semi-transparent chisel marker with multiply blend mode.'
  },
  {
    category: 'Drawing Tools',
    action: 'Select Eraser Tool',
    keys: ['Ctrl', '3'],
    description: 'Erases strokes point-by-point or smart objects by proximity.'
  },
  {
    category: 'Selection & Smart Objects',
    action: 'Selection Mode',
    keys: ['Ctrl', 'Alt', 'S'],
    description: 'Activates lasso selection and OBB move, rotate, scale, recolor, and delete controls.'
  },
  {
    category: 'Canvas Controls',
    action: 'Toggle Cursor Mode',
    keys: ['Ctrl', 'Shift', '1'],
    description: 'Toggles click-through Cursor mode while preserving existing drawings.'
  },
  {
    category: 'Canvas Controls',
    action: 'Toggle Canvas Visibility',
    keys: ['Ctrl', 'Shift', '2'],
    description: 'Collapses the toolbar and hides or shows ink without clearing it.'
  },
  {
    category: 'Canvas Controls',
    action: 'Undo Last Action',
    keys: ['Ctrl', 'Z'],
    description: 'Steps backward in the 5,000-step memory-safe undo stack.'
  },
  {
    category: 'Canvas Controls',
    action: 'Clear Screen',
    keys: ['Ctrl', 'Shift', 'C'],
    description: 'Instantly wipes all drawings and strokes from the screen.'
  },
  {
    category: 'Styling & Sizing',
    action: 'Toggle Color Palette',
    keys: ['Ctrl', 'P'],
    description: 'Opens or closes the floating 12-color curated swatch toolbox.'
  },
  {
    category: 'Canvas Controls',
    action: 'Toggle Background Mode',
    keys: ['Ctrl', 'B'],
    description: 'Cycles between Transparent Desktop, Whiteboard, and Blackboard.'
  },
  {
    category: 'Styling & Sizing',
    action: 'Increase Nib Size',
    keys: ['Ctrl', ']'],
    description: 'Increments active stroke nib thickness by +2px.'
  },
  {
    category: 'Styling & Sizing',
    action: 'Decrease Nib Size',
    keys: ['Ctrl', '['],
    description: 'Decrements active stroke nib thickness by -2px.'
  },
  {
    category: 'Canvas Controls',
    action: 'Exit Pen 11',
    keys: ['Ctrl', 'Q'],
    description: 'Instantly closes and exits the Pen 11 application.'
  },
  {
    category: 'Selection & Smart Objects',
    action: 'Delete Selected Objects',
    keys: ['Delete', 'Backspace'],
    separator: ' / ',
    description: 'Removes all currently highlighted lasso selections from the screen.'
  },
  {
    category: 'Drawing Tools',
    action: 'Constrain Shapes & Angles',
    keys: ['Shift', 'Drag'],
    description: 'Snaps line/arrow angles to 45°, rectangle/ellipse to 1:1, and triangle to 90° right angle.'
  }
];

export class ShortcutsManager {
  constructor() {
    this.tableBody = null;
    this.searchInput = null;
    this.chipContainer = null;
    this.activeCategory = 'all';
    this.searchQuery = '';
  }

  /**
   * Initializes interactive search & filter table in the DOM
   * @param {{ tableBody: HTMLElement, searchInput?: HTMLElement, chipContainer?: HTMLElement }} elements
   */
  initTable(elements) {
    this.tableBody = elements.tableBody;
    this.searchInput = elements.searchInput || null;
    this.chipContainer = elements.chipContainer || null;

    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderTable();
      });
    }

    if (this.chipContainer) {
      this.chipContainer.addEventListener('click', (e) => {
        const chip = e.target.closest('.m3-chip');
        if (!chip) return;

        this.chipContainer.querySelectorAll('.m3-chip').forEach((c) => {
          const isSelected = c === chip;
          c.classList.toggle('active', isSelected);
          c.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        });
        this.activeCategory = chip.dataset.category || 'all';
        this.renderTable();
      });
    }

    this.renderTable();
  }

  renderTable() {
    if (!this.tableBody) return;

    const filtered = SHORTCUTS_DATA.filter((item) => {
      const matchCategory = this.activeCategory === 'all' || item.category === this.activeCategory;
      const matchSearch =
        !this.searchQuery ||
        item.action.toLowerCase().includes(this.searchQuery) ||
        item.description.toLowerCase().includes(this.searchQuery) ||
        item.keys.join(' ').toLowerCase().includes(this.searchQuery);
      return matchCategory && matchSearch;
    });

    const fragment = document.createDocumentFragment();

    if (filtered.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 3;
      cell.className = 'shortcuts-empty-cell';

      const wrap = document.createElement('div');
      wrap.className = 'm3-flex-col m3-align-center m3-gap-sm';

      const icon = document.createElement('span');
      icon.className = 'material-symbols-rounded shortcuts-empty-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = 'search_off';

      const msg = document.createElement('p');
      msg.textContent = 'No matching keyboard shortcuts found';

      wrap.append(icon, msg);
      cell.appendChild(wrap);
      row.appendChild(cell);
      fragment.appendChild(row);
      this.tableBody.replaceChildren(fragment);
      return;
    }

    filtered.forEach((item) => {
      const row = document.createElement('tr');

      const actionCell = document.createElement('td');
      actionCell.className = 'shortcut-action';
      actionCell.textContent = item.action;

      const keysCell = document.createElement('td');
      keysCell.className = 'shortcut-keys';
      const kbdGroup = document.createElement('div');
      kbdGroup.className = 'm3-kbd-group';

      const joiner = item.separator || ' + ';
      item.keys.forEach((keyLabel, index) => {
        if (index > 0) {
          kbdGroup.appendChild(document.createTextNode(joiner));
        }
        const kbd = document.createElement('kbd');
        kbd.textContent = keyLabel;
        kbdGroup.appendChild(kbd);
      });
      keysCell.appendChild(kbdGroup);

      const descCell = document.createElement('td');
      descCell.className = 'shortcut-desc';
      descCell.textContent = item.description;

      row.append(actionCell, keysCell, descCell);
      fragment.appendChild(row);
    });

    this.tableBody.replaceChildren(fragment);
  }
}

export const shortcutsManager = new ShortcutsManager();
