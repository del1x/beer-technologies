export class SearchManager {
  private inputElement: HTMLInputElement | null;
  private noResultsElement: HTMLElement | null;

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
    const rows = document.querySelectorAll<HTMLElement>('.table tbody tr');
    let hasResults = false;

    console.log('Search query:', query); // Логируем запрос

    rows.forEach((row: HTMLElement) => {
        const rowText = Array.from(row.querySelectorAll<HTMLElement>('td'))
            .map(td => td.textContent?.toLowerCase() || '')
            .join(' ');

        const isVisible = !query || rowText.includes(query);
        row.style.display = isVisible ? '' : 'none';

        console.log(`Row text: "${rowText}", isVisible: ${isVisible}`); // Логируем текст строки и её видимость

        if (isVisible) hasResults = true;
    });

    if (this.noResultsElement) {
        const shouldShowNoResults = Boolean(query && !hasResults);
        this.noResultsElement.classList.toggle('show', shouldShowNoResults);

        console.log('No results element visibility:', shouldShowNoResults); // Логируем состояние noResultsElement
    }

    console.log('Has results:', hasResults); // Логируем, есть ли совпадения
}
  
}