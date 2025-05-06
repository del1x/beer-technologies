import { ThemeManager } from '@modules/ThemeManager';
import { SearchManager } from '@modules/SearchManager';
import { PDFManager } from '@modules/PDFManager';
import { FilterManager } from '@modules/FilterManager';
import { HoverManager } from '@modules/HoverManager';

type AppModules = {
  theme: ThemeManager;
  search: SearchManager;
  pdf: PDFManager;
  filter: FilterManager;
  hover: HoverManager;
};

export class BeerTechniques {
  private modules: AppModules;

  constructor() {
    this.modules = {
      theme: new ThemeManager(
        document.getElementById('themeToggle')!
      ),
      search: new SearchManager(
        document.querySelector('.search-input')!,
        document.querySelector('.no-results')
      ),
      pdf: new PDFManager(
        document.querySelector('.btn-pdf')!
      ),
      filter: new FilterManager(
        document.querySelectorAll('.btn-filter'),
        document.querySelectorAll('.stance-section')
      ),
      hover: new HoverManager(
        document.querySelectorAll('tbody tr')
      )
    };
  }

  /**
   * Инициализирует все модули приложения
   */
  public init(): void {
    try {
      Object.values(this.modules).forEach(module => {
        module.init?.();
      });
      console.log('App initialized successfully');
    } catch (error) {
      console.error('Initialization error:', error);
    }
  }

  /**
   * Получает модуль по ключу
   * @template T - Тип модуля
   * @param key - Ключ модуля
   * @returns Экземпляр модуля или null
   */
  public getModule<T extends keyof AppModules>(key: T): AppModules[T] | null {
    return this.modules[key] ?? null;
  }
}