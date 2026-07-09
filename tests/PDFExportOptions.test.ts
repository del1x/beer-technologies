import {
  DOCUMENT_SECTION_IDS,
  LEGACY_PDF_EXPORT_OPTIONS,
  createPDFPageLayout
} from '@modules/PDF/PDFExportOptions';

describe('PDFExportOptions', () => {
  it('preserves the current export as legacy defaults', () => {
    expect(LEGACY_PDF_EXPORT_OPTIONS).toEqual({
      mode: 'all',
      selectedSectionIds: [...DOCUMENT_SECTION_IDS],
      format: 'a4',
      orientation: 'portrait',
      marginMm: 15
    });
  });

  it('creates the current A4 portrait layout when options are omitted', () => {
    expect(createPDFPageLayout()).toEqual({
      pageWidthMm: 210,
      pageHeightMm: 297,
      marginMm: 15,
      contentWidthMm: 180,
      usableHeightMm: 267
    });
  });

  it('supports Letter landscape with a selected margin preset', () => {
    expect(createPDFPageLayout({
      ...LEGACY_PDF_EXPORT_OPTIONS,
      format: 'letter',
      orientation: 'landscape',
      marginMm: 20
    })).toEqual({
      pageWidthMm: 279.4,
      pageHeightMm: 215.9,
      marginMm: 20,
      contentWidthMm: 239.4,
      usableHeightMm: 175.9
    });
  });
});
