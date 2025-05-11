import { SearchManager } from '@modules/SearchManager';

describe('SearchManager', () => {
  let inputElement: HTMLInputElement;
  let noResultsElement: HTMLElement;
  let searchManager: SearchManager;

  beforeEach(() => {
    document.body.innerHTML = `
      <input type="text">
      <div class="no-results"></div>
      <table class="table">
        <tbody>
          <tr><td>Imperial Stout</td><td>Dark</td></tr>
          <tr><td>Pilsner</td><td>Light</td></tr>
          <tr><td>Baltic Porter</td><td>Dark</td></tr>
        </tbody>
      </table>
    `;

    inputElement = document.querySelector('input')!;
    noResultsElement = document.querySelector('.no-results')!;
    searchManager = new SearchManager(inputElement, noResultsElement);
  });

  it('should show matching rows', () => {
    inputElement.value = 'pilsner';
    searchManager.search(inputElement.value);
    
    const rows = document.querySelectorAll('tr');
    expect(rows[0]).toHaveStyle('display: none');
    expect(rows[1]).not.toHaveStyle('display: none');
    expect(rows[2]).toHaveStyle('display: none');
  });

  it('should show no-results when no matches', () => {
    inputElement.value = 'wine';
    searchManager.search(inputElement.value);
    expect(noResultsElement).toHaveClass('show');
  });

  it('should show all rows when empty query', () => {
    inputElement.value = '';
    searchManager.search(inputElement.value);
    
    const rows = document.querySelectorAll('tr');
    rows.forEach(row => {
      expect(row).not.toHaveStyle('display: none');
    });
  });
});