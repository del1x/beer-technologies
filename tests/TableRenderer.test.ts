import fs from 'fs';
import path from 'path';
import { TableRenderer } from '@core/TableRenderer';
import { validateBeerTypesData, validateTechniquesData } from '@core/DataValidation';

function readJson(relativePath: string): unknown {
  return JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '..', relativePath), 'utf8')
  );
}

describe('TableRenderer with current data', () => {
  it('renders every technique table successfully', () => {
    const techniques = readJson('public/api/techniques.json');
    validateTechniquesData(techniques);

    Object.entries(techniques).forEach(([style, items]) => {
      const container = document.createElement('div');
      TableRenderer.renderTechniquesTable(container, style, techniques);

      expect(container.querySelector('table.techniques-table')).not.toBeNull();
      expect(container.querySelectorAll('tbody tr')).toHaveLength(items.length);
      expect(container.querySelector('tbody tr td:nth-child(2)')?.textContent).toBe(items[0].name);
    });
  });

  it('renders the complete beer table successfully', () => {
    const beerTypes = readJson('public/api/beer-types.json');
    validateBeerTypesData(beerTypes);
    const container = document.createElement('div');

    TableRenderer.renderBeerTable(container, beerTypes);

    expect(container.querySelector('table.beer-table')).not.toBeNull();
    expect(container.querySelectorAll('tbody tr')).toHaveLength(21);
    expect(container.querySelector('tbody tr td')?.textContent).toBe('Imperial Stout');
  });
});
