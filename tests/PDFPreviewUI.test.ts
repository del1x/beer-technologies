import { PDFGenerator } from '@modules/PDF/PDFGenerator';
import { PDFPreviewUI } from '@modules/PDF/PDFPreviewUI';
import { LEGACY_PDF_EXPORT_OPTIONS } from '@modules/PDF/PDFExportOptions';

function createContent(): HTMLElement {
  const content = document.createElement('main');
  content.innerHTML = `
    <section class="intro-section" data-section-id="intro">Intro</section>
    <section class="stance-section" data-section-id="dark-stance">Dark</section>
    <section class="stance-section" data-section-id="light-stance">Light</section>
    <section class="energy-system-section" data-section-id="energy-system">Energy</section>
  `;
  return content;
}

describe('PDFPreviewUI export controls', () => {
  let generatePDF: jest.Mock;
  let createObjectURL: jest.Mock;

  beforeEach(() => {
    generatePDF = jest.fn().mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }));
    createObjectURL = jest.fn().mockReturnValue('blob:preview');
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectURL
    });
  });

  afterAll(() => {
    Reflect.deleteProperty(URL, 'createObjectURL');
  });

  it('generates the initial preview with legacy defaults', async () => {
    const content = createContent();
    const ui = new PDFPreviewUI({ generatePDF } as unknown as PDFGenerator, content, 'file.pdf');

    await ui.show();

    expect(generatePDF).toHaveBeenCalledTimes(1);
    expect(generatePDF).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      'file.pdf',
      true,
      true,
      LEGACY_PDF_EXPORT_OPTIONS
    );
    expect(content.querySelectorAll('[data-section-id]')).toHaveLength(4);
    expect(createObjectURL).toHaveBeenCalledTimes(1);
  });

  it('updates preview only after the update button is pressed', async () => {
    const ui = new PDFPreviewUI(
      { generatePDF } as unknown as PDFGenerator,
      createContent(),
      'file.pdf'
    );
    await ui.show();

    const modal = document.querySelector('.pdf-preview-modal-container') as HTMLElement;
    (modal.querySelector('[name="pdf-export-mode"][value="selected"]') as HTMLInputElement).click();
    (modal.querySelector('[data-section-option="intro"]') as HTMLInputElement).checked = false;
    (modal.querySelector('[data-section-option="light-stance"]') as HTMLInputElement).checked = false;
    (modal.querySelector('[data-section-option="energy-system"]') as HTMLInputElement).checked = false;
    (modal.querySelector('#pdf-format') as HTMLSelectElement).value = 'letter';
    (modal.querySelector('#pdf-orientation') as HTMLSelectElement).value = 'landscape';
    (modal.querySelector('#pdf-margin') as HTMLSelectElement).value = '20';

    expect(generatePDF).toHaveBeenCalledTimes(1);

    (modal.querySelector('.btn-update-preview') as HTMLButtonElement).click();
    await Promise.resolve();
    await Promise.resolve();

    expect(generatePDF).toHaveBeenCalledTimes(2);
    const [exportContent, , , forPreview, options] = generatePDF.mock.calls[1];
    expect(forPreview).toBe(true);
    expect(options).toEqual({
      mode: 'selected',
      selectedSectionIds: ['dark-stance'],
      format: 'letter',
      orientation: 'landscape',
      marginMm: 20
    });
    expect(Array.from(
      (exportContent as HTMLElement).querySelectorAll<HTMLElement>('[data-section-id]')
    ).map(section =>
      section.getAttribute('data-section-id')
    )).toEqual(['dark-stance']);
  });
});
