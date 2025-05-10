import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class PDFTableHandler {
    private readonly PAGE_MARGIN = 15; // mm

    public async handleTable(
        pdf: jsPDF,
        tableWrapper: HTMLElement,
        currentY: number,
        pageHeight: number
    ): Promise<number> {
        const table = tableWrapper.querySelector('table');
        if (!table) return currentY;

        const tempContainer = this.createTempContainer();
        const rows = Array.from(table.rows) as HTMLTableRowElement[];
        let remainingRows = rows.slice(1);

        while (remainingRows.length > 0) {
            const { pageTable, rowsAdded } = this.createPageTable(table, remainingRows, pageHeight - currentY - 10);
            tempContainer.innerHTML = '';
            tempContainer.appendChild(pageTable);

            const canvas = await html2canvas(tempContainer as HTMLElement, <any> { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 180;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            if (currentY + imgHeight > pageHeight) {
                pdf.addPage();
                currentY = this.PAGE_MARGIN;
            }

            pdf.addImage(
                imgData,
                'PNG',
                (pdf.internal.pageSize.getWidth() - imgWidth) / 2,
                currentY,
                imgWidth,
                imgHeight
            );

            remainingRows = remainingRows.slice(rowsAdded);
            currentY += imgHeight + 10;

            if (remainingRows.length > 0) {
                pdf.addPage();
                currentY = this.PAGE_MARGIN;
            }
        }

        document.body.removeChild(tempContainer);
        return currentY;
    }

    private createTempContainer(): HTMLElement {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.width = '180mm';
        document.body.appendChild(container);
        return container;
    }

    private createPageTable(
        originalTable: HTMLTableElement,
        rows: HTMLTableRowElement[],
        maxHeight: number
    ): { pageTable: HTMLTableElement; rowsAdded: number } {
        const pageTable = document.createElement('table');
        pageTable.className = originalTable.className;
        pageTable.appendChild(originalTable.rows[0].cloneNode(true));

        let currentHeight = originalTable.rows[0].offsetHeight;
        let rowsAdded = 0;

        for (const row of rows) {
            const rowHeight = row.offsetHeight;
            if (currentHeight + rowHeight > maxHeight) break;

            pageTable.appendChild(row.cloneNode(true));
            currentHeight += rowHeight;
            rowsAdded++;
        }

        return { pageTable, rowsAdded };
    }
}