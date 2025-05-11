import { ThemeManager } from '../src/js/modules/ThemeManager';

describe('ThemeManager', () => {
  let toggleElement: HTMLElement;
  let themeManager: ThemeManager;

  beforeEach(() => {
    toggleElement = document.createElement('button');
    document.documentElement.setAttribute('data-theme', 'light');
    themeManager = new ThemeManager(toggleElement);
  });

  it('should toggle theme from light to dark', () => {
    themeManager.toggleTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should toggle theme from dark to light', () => {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeManager.toggleTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should save the theme in localStorage', () => {
    themeManager.setTheme('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('should restore the theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');
    themeManager.restoreTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});