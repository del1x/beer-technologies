export class ThemeManager {
  private toggleElement: HTMLElement | null;

  constructor(toggleElement: HTMLElement | null) {
      this.toggleElement = toggleElement;
  }

  init(): void {
      if (!this.toggleElement) return;
      
      this.toggleElement.addEventListener('click', () => this.toggleTheme());
      this.restoreTheme();
  }

  toggleTheme(): void {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      this.setTheme(newTheme);
  }

  public setTheme(theme: string): void {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      this.updateUI(theme);
  }

  public updateUI(theme: string): void {
      const themeText = this.toggleElement?.querySelector<HTMLElement>('.theme-text');
      const themeIcon = this.toggleElement?.querySelector<HTMLElement>('.theme-icon');
      
      if (themeText) themeText.textContent = `${theme === 'dark' ? 'Тёмная' : 'Светлая'} тема`;
      if (themeIcon) themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  public restoreTheme(): void {
      this.setTheme(localStorage.getItem('theme') || 'light');
  }
}