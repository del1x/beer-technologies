export class SearchManager {
  private inputElement: HTMLInputElement | null;
  private noResultsElement: HTMLElement | null;
  private cache: Map<string, { rows: HTMLElement[]; hasResults: boolean }> = new Map();

  constructor(inputElement: HTMLInputElement | null, noResultsElement: HTMLElement | null) {
    this.inputElement = inputElement;
    this.noResultsElement = noResultsElement;
  }

  init(): void {
    if (!this.inputElement) return;
    this.inputElement.addEventListener('input', (e: Event) => 
      this.search((e.target as HTMLInputElement).value.trim().toLowerCase())
    );
  }

  search(query: string): void {
    // Проверяем кэш
    if (this.cache.has(query)) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Search query from cache:', query); // Лог для кэшированного запроса
      }
      const { rows, hasResults } = this.cache.get(query)!;
      this.applyCachedResults(rows, hasResults);
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('Search query (not cached):', query); // Лог для некэшированного запроса
    }

    const rows = document.querySelectorAll<HTMLElement>('.table tbody tr');
    let hasResults = false;
    const visibleRows: HTMLElement[] = [];

    rows.forEach((row: HTMLElement) => {
      const rowText = Array.from(row.querySelectorAll<HTMLElement>('td'))
        .map(td => td.textContent?.toLowerCase() || '')
        .join(' ');

      const isVisible = !query || rowText.includes(query);
      row.style.display = isVisible ? '' : 'none';

      if (process.env.NODE_ENV !== 'production') {
        console.log(`Row text: "${rowText}", isVisible: ${isVisible}`);
      }

      if (isVisible) {
        hasResults = true;
        visibleRows.push(row);
      }
    });

    // Сохраняем в кэш
    this.cache.set(query, { rows: visibleRows, hasResults });
    if (process.env.NODE_ENV !== 'production') {
      console.log('Cache updated for query:', query, 'size:', this.cache.size); // Лог для проверки кэша
    }

    if (this.noResultsElement) {
      const shouldShowNoResults = Boolean(query && !hasResults);
      this.noResultsElement.classList.toggle('show', shouldShowNoResults);

      if (process.env.NODE_ENV !== 'production') {
        console.log('No results element visibility:', shouldShowNoResults);
        console.log('Has results:', hasResults);
      }
    }
  }

  private applyCachedResults(visibleRows: HTMLElement[], hasResults: boolean): void {
    const rows = document.querySelectorAll<HTMLElement>('.table tbody tr');
    rows.forEach((row: HTMLElement) => {
      row.style.display = visibleRows.includes(row) ? '' : 'none';
    });

    if (this.noResultsElement) {
      this.noResultsElement.classList.toggle('show', Boolean(!hasResults));
    }
  }
}