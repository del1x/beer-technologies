import { cloneContentForExport } from '@modules/PDF/PDFContentSelector';
import { LEGACY_PDF_EXPORT_OPTIONS } from '@modules/PDF/PDFExportOptions';

function createContent(): HTMLElement {
  const content = document.createElement('main');
  content.innerHTML = `
    <section data-section-id="intro">Intro</section>
    <section data-section-id="dark-stance">Dark</section>
    <section data-section-id="light-stance">Light</section>
    <section data-section-id="energy-system">Energy</section>
  `;
  return content;
}

describe('cloneContentForExport', () => {
  it('keeps all sections and their order for the legacy mode', () => {
    const source = createContent();
    const result = cloneContentForExport(source, LEGACY_PDF_EXPORT_OPTIONS);

    expect(result).not.toBe(source);
    expect(Array.from(result.querySelectorAll('[data-section-id]')).map(section =>
      section.getAttribute('data-section-id')
    )).toEqual(['intro', 'dark-stance', 'light-stance', 'energy-system']);
  });

  it('filters only the clone and preserves selected section order', () => {
    const source = createContent();
    const result = cloneContentForExport(source, {
      ...LEGACY_PDF_EXPORT_OPTIONS,
      mode: 'selected',
      selectedSectionIds: ['dark-stance', 'energy-system']
    });

    expect(Array.from(result.querySelectorAll('[data-section-id]')).map(section =>
      section.getAttribute('data-section-id')
    )).toEqual(['dark-stance', 'energy-system']);
    expect(source.querySelectorAll('[data-section-id]')).toHaveLength(4);
  });
});
