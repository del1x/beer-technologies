import { PDFExportOptions } from './PDFExportOptions';

export function cloneContentForExport(
    content: HTMLElement,
    options: Readonly<PDFExportOptions>
): HTMLElement {
    const contentClone = content.cloneNode(true) as HTMLElement;

    if (options.mode === 'selected') {
        const selectedSectionIds = new Set<string>(options.selectedSectionIds);
        contentClone.querySelectorAll<HTMLElement>('[data-section-id]').forEach(section => {
            const sectionId = section.dataset.sectionId;
            if (!sectionId || !selectedSectionIds.has(sectionId)) {
                section.remove();
            }
        });
    }

    return contentClone;
}
