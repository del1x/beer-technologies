import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { createPDFPageLayout, PDFPageLayout } from './PDFExportOptions';

export class PDFTableHandler {
    constructor(private readonly layout: PDFPageLayout = createPDFPageLayout()) {}

    public async handleTable(
        pdf: jsPDF,
        tableWrapper: HTMLElement,
        startY: number = this.layout.marginMm
    ): Promise<void> {
        const table = tableWrapper.querySelector('table') as HTMLTableElement;
        if (!table) {
            console.error('No table found in tableWrapper');
            return;
        }

        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const backgroundColorHex = currentTheme === 'dark' ? '#18110a' : '#f9f5ed';
        const rgb = this.hexToRgb(backgroundColorHex);

        const rows = Array.from(table.rows);
        let currentY = startY;
        let currentPageRows: HTMLTableRowElement[] = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowClone = row.cloneNode(true) as HTMLTableRowElement;
            const tempTable = document.createElement('table');
            tempTable.style.width = `${this.layout.pageWidthMm}mm`;
            tempTable.appendChild(rowClone);
            tableWrapper.appendChild(tempTable);

            const canvas = await html2canvas(tempTable, <any> {
                scale: 2,
                backgroundColor: backgroundColorHex,
                useCORS: true
            });

            const imgWidth = this.layout.contentWidthMm;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Проверяем, помещается ли строка на текущей странице
            if (currentY + imgHeight > this.layout.usableHeightMm && currentPageRows.length > 0) {
                // Рендерим накопленные строки на текущей странице
                await this.renderRows(pdf, currentPageRows, tableWrapper, startY, backgroundColorHex);
                // Переходим на новую страницу
                pdf.addPage();
                pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
                (pdf as any).rect(0, 0, this.layout.pageWidthMm, this.layout.pageHeightMm, 'F');
                currentY = this.layout.marginMm;
                currentPageRows = [];
            }

            currentPageRows.push(rowClone);
            currentY += imgHeight;

            tableWrapper.removeChild(tempTable);
        }

        // Рендерим оставшиеся строки
        if (currentPageRows.length > 0) {
            await this.renderRows(pdf, currentPageRows, tableWrapper, startY, backgroundColorHex);
        }
    }

    private async renderRows(
        pdf: jsPDF,
        rows: HTMLTableRowElement[],
        tableWrapper: HTMLElement,
        startY: number,
        backgroundColor: string
    ): Promise<void> {
        const tempTable = document.createElement('table');
        tempTable.style.width = `${this.layout.pageWidthMm}mm`;
        rows.forEach(row => tempTable.appendChild(row));
        tableWrapper.appendChild(tempTable);

        const canvas = await html2canvas(tempTable, <any> {
            scale: 2,
            backgroundColor: backgroundColor,
            useCORS: true
        });

        const imgWidth = this.layout.contentWidthMm;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(
            canvas.toDataURL('image/jpeg', 0.9),
            'JPEG',
            this.layout.marginMm,
            startY,
            imgWidth,
            imgHeight
        );

        tableWrapper.removeChild(tempTable);
    }

    private hexToRgb(hexColor: string): number[] {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : [0, 0, 0];
    }
}
