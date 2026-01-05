import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadPersistedColor, persistColor, getCurrentColor } from './colorPersistence';

describe('colorPersistence', () => {
  beforeEach(() => {
    // Clear localStorage mock
    vi.mocked(localStorage.getItem).mockClear();
    vi.mocked(localStorage.setItem).mockClear();
    localStorage.clear();
  });

  describe('loadPersistedColor', () => {
    it('returns false when no color is saved', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      expect(loadPersistedColor()).toBe(false);
    });

    it('returns true and applies color when valid hex is saved', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('#ff0000');
      const setPropertySpy = vi.spyOn(document.documentElement.style, 'setProperty');

      expect(loadPersistedColor()).toBe(true);
      expect(setPropertySpy).toHaveBeenCalledWith('--terminal', '#ff0000');
    });

    it('returns false for invalid hex colors', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('not-a-color');
      expect(loadPersistedColor()).toBe(false);
    });

    it('handles storage errors gracefully', () => {
      vi.mocked(localStorage.getItem).mockImplementation(() => {
        throw new Error('Storage error');
      });
      expect(loadPersistedColor()).toBe(false);
    });
  });

  describe('persistColor', () => {
    it('saves valid 6-character hex color', () => {
      const setPropertySpy = vi.spyOn(document.documentElement.style, 'setProperty');

      expect(persistColor('#ff0000')).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('terminal-color', '#ff0000');
      expect(setPropertySpy).toHaveBeenCalledWith('--terminal', '#ff0000');
    });

    it('saves valid 3-character hex color', () => {
      expect(persistColor('#f00')).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('terminal-color', '#f00');
    });

    it('returns false for invalid colors', () => {
      expect(persistColor('red')).toBe(false);
      expect(persistColor('#gg0000')).toBe(false);
      expect(persistColor('')).toBe(false);
    });

    it('handles storage errors gracefully', () => {
      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw new Error('Storage error');
      });
      expect(persistColor('#ff0000')).toBe(false);
    });
  });

  describe('getCurrentColor', () => {
    it('returns the CSS variable value', () => {
      const result = getCurrentColor();
      expect(typeof result).toBe('string');
    });

    it('returns default color if variable is empty', () => {
      // The mock in setup.ts returns '#22c55e' for --terminal
      const result = getCurrentColor();
      expect(result).toBe('#22c55e');
    });
  });
});
