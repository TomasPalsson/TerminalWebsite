const STORAGE_KEY = 'terminal-color';
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;

/**
 * Loads the saved terminal color from localStorage and applies it to the CSS variable.
 * Returns true if a color was loaded and applied.
 */
export function loadPersistedColor(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && HEX_COLOR_REGEX.test(saved)) {
      document.documentElement.style.setProperty('--terminal', saved);
      return true;
    }
  } catch {
    // Ignore storage read errors (e.g., private browsing)
  }
  return false;
}

/**
 * Saves a terminal color to localStorage.
 * Returns true if the color was saved successfully.
 */
export function persistColor(color: string): boolean {
  if (!HEX_COLOR_REGEX.test(color)) {
    return false;
  }
  try {
    localStorage.setItem(STORAGE_KEY, color);
    document.documentElement.style.setProperty('--terminal', color);
    return true;
  } catch {
    // Ignore storage write errors
  }
  return false;
}

/**
 * Gets the current terminal color from the CSS variable.
 */
export function getCurrentColor(): string {
  return getComputedStyle(document.documentElement).getPropertyValue('--terminal').trim() || '#0f0';
}
