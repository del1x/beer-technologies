export const DOCUMENT_SECTION_IDS = [
    'intro',
    'dark-stance',
    'light-stance',
    'energy-system'
] as const;

export type DocumentSectionId = typeof DOCUMENT_SECTION_IDS[number];
export type PDFExportMode = 'all' | 'selected';
export type PDFPageFormat = 'a4' | 'letter';
export type PDFOrientation = 'portrait' | 'landscape';
export type PDFMarginPreset = 10 | 15 | 20;

export interface PDFExportOptions {
    mode: PDFExportMode;
    selectedSectionIds: readonly DocumentSectionId[];
    format: PDFPageFormat;
    orientation: PDFOrientation;
    marginMm: PDFMarginPreset;
}

export interface PDFPageLayout {
    pageWidthMm: number;
    pageHeightMm: number;
    marginMm: number;
    contentWidthMm: number;
    usableHeightMm: number;
}

export const LEGACY_PDF_EXPORT_OPTIONS: Readonly<PDFExportOptions> = Object.freeze({
    mode: 'all',
    selectedSectionIds: Object.freeze([...DOCUMENT_SECTION_IDS]),
    format: 'a4',
    orientation: 'portrait',
    marginMm: 15
});

const PAGE_SIZES: Record<PDFPageFormat, readonly [number, number]> = {
    a4: [210, 297],
    letter: [215.9, 279.4]
};

function roundMillimeters(value: number): number {
    return Math.round(value * 10) / 10;
}

export function createPDFPageLayout(
    options: Readonly<PDFExportOptions> = LEGACY_PDF_EXPORT_OPTIONS
): PDFPageLayout {
    const [portraitWidth, portraitHeight] = PAGE_SIZES[options.format];
    const isLandscape = options.orientation === 'landscape';
    const pageWidthMm = isLandscape ? portraitHeight : portraitWidth;
    const pageHeightMm = isLandscape ? portraitWidth : portraitHeight;

    return {
        pageWidthMm,
        pageHeightMm,
        marginMm: options.marginMm,
        contentWidthMm: roundMillimeters(pageWidthMm - options.marginMm * 2),
        usableHeightMm: roundMillimeters(pageHeightMm - options.marginMm * 2)
    };
}
