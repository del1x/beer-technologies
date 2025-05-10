import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PDFTableHandler } from '@modules/PDF/PDFTableHandler';

export class PDFGenerator {
    private readonly PAGE_MARGIN = 15; // mm

    public async generatePDF(
        content: HTMLElement,
        filename: string,
        fullWidth: boolean = true,
        forPreview: boolean = false
    ): Promise<Blob> {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const printContainer = this.createPrintContainer(content, fullWidth);
        
        let currentY = 30;
        const pageHeight = pdf.internal.pageSize.getHeight() - this.PAGE_MARGIN * 2;
        const sections = Array.from(printContainer.children) as HTMLElement[];

        for (const section of sections) {
            if (section.classList.contains('table-wrapper')) {
                currentY = await this.renderTable(pdf, section as HTMLElement, currentY, pageHeight);
                continue;
            }

            currentY = await this.renderSection(pdf, section, currentY, pageHeight, fullWidth);
        }

        document.body.removeChild(printContainer);

        if (forPreview) {
            return pdf.output('blob');
        } else {
            pdf.save(filename);
            return pdf.output('blob');
        }
    }

    private createPrintContainer(content: HTMLElement, fullWidth: boolean): HTMLElement {
        const printContainer = document.createElement('div');
        printContainer.id = 'pdf-print-container';
        printContainer.style.position = 'fixed';
        printContainer.style.left = '-9999px';
        printContainer.style.width = fullWidth ? '210mm' : '180mm';
        printContainer.style.padding = '20mm';
        printContainer.style.background = getComputedStyle(document.body).backgroundColor;
        printContainer.style.color = getComputedStyle(document.body).color;

        const contentClone = content.cloneNode(true) as HTMLElement;
        contentClone.querySelectorAll('.no-print').forEach(el => el.remove());
        printContainer.appendChild(contentClone);
        document.body.appendChild(printContainer);

        return printContainer;
    }

    private async renderSection(
        pdf: jsPDF,
        section: HTMLElement,
        currentY: number,
        pageHeight: number,
        fullWidth: boolean
    ): Promise<number> {
        const canvas = await html2canvas(section, <any> {
            scale: 2,
            backgroundColor: getComputedStyle(document.body).backgroundColor,
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = fullWidth ? pdf.internal.pageSize.getWidth() - this.PAGE_MARGIN * 2 : 160;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (currentY + imgHeight > pageHeight) {
            pdf.addPage();
            currentY = this.PAGE_MARGIN;
        }

        pdf.addImage(
            imgData,
            'PNG',
            fullWidth ? this.PAGE_MARGIN : (pdf.internal.pageSize.getWidth() - imgWidth) / 2,
            currentY,
            imgWidth,
            imgHeight
        );

        return currentY + imgHeight + 10;
    }

    private async renderTable(
        pdf: jsPDF,
        tableWrapper: HTMLElement,
        currentY: number,
        pageHeight: number
    ): Promise<number> {
        const table = tableWrapper.querySelector('table');
        if (!table) return currentY;

        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.width = '180mm';
        document.body.appendChild(tempContainer);

        const rows = Array.from(table.rows) as HTMLTableRowElement[];
        let remainingRows = rows.slice(1);

        while (remainingRows.length > 0) {
            const pageTable = document.createElement('table');
            pageTable.className = table.className;
            pageTable.appendChild(rows[0].cloneNode(true));

            let currentPageHeight = rows[0].offsetHeight;
            let rowsToAdd: HTMLTableRowElement[] = [];
            
            for (const row of remainingRows) {
                if (currentPageHeight + row.offsetHeight > pageHeight - currentY - 10) break;
                rowsToAdd.push(row);
                currentPageHeight += row.offsetHeight;
            }

            rowsToAdd.forEach(row => pageTable.appendChild(row.cloneNode(true)));
            remainingRows = remainingRows.slice(rowsToAdd.length);

            tempContainer.innerHTML = '';
            tempContainer.appendChild(pageTable);

            const canvas = await html2canvas(tempContainer as HTMLElement, <any>{ scale: 2 });
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

            currentY += imgHeight + 10;

            if (remainingRows.length > 0) {
                pdf.addPage();
                currentY = this.PAGE_MARGIN;
            }
        }

        document.body.removeChild(tempContainer);
        return currentY;
    }
}