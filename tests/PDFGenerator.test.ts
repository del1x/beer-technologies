jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn()
}));

import jsPDF from 'jspdf';
import { PDFGenerator } from '@modules/PDF/PDFGenerator';
import { LEGACY_PDF_EXPORT_OPTIONS } from '@modules/PDF/PDFExportOptions';

describe('PDFGenerator page options', () => {
  const jsPDFConstructor = jsPDF as unknown as jest.Mock;

  beforeEach(() => {
    jsPDFConstructor.mockImplementation(() => ({
      output: jest.fn().mockReturnValue(new Blob(['pdf'], { type: 'application/pdf' })),
      save: jest.fn(),
      setFillColor: jest.fn(),
      internal: { getNumberOfPages: jest.fn().mockReturnValue(1) }
    }));
  });

  it('uses the legacy A4 portrait constructor when options are omitted', async () => {
    const generator = new PDFGenerator();
    const content = document.createElement('main');

    await generator.generatePDF(content, 'file.pdf', true, true);

    expect(jsPDFConstructor).toHaveBeenCalledWith('p', 'mm', 'a4');
  });

  it('passes Letter landscape options to jsPDF', async () => {
    const generator = new PDFGenerator();
    const content = document.createElement('main');

    await generator.generatePDF(content, 'file.pdf', true, true, {
      ...LEGACY_PDF_EXPORT_OPTIONS,
      format: 'letter',
      orientation: 'landscape',
      marginMm: 20
    });

    expect(jsPDFConstructor).toHaveBeenCalledWith('l', 'mm', 'letter');
  });
});
