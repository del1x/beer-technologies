import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PDFTableHandler } from '@modules/PDF/PDFTableHandler';

export class PDFGenerator {
    private readonly PAGE_MARGIN = 15; // Отступы в мм
    private readonly PAGE_WIDTH = 210; // Ширина A4 в мм
    private readonly PAGE_HEIGHT = 297; // Высота A4 в мм
    private readonly CONTENT_WIDTH = this.PAGE_WIDTH - this.PAGE_MARGIN * 2;
    private readonly USABLE_HEIGHT = this.PAGE_HEIGHT - this.PAGE_MARGIN * 2;

    public async generatePDF(
        content: HTMLElement,
        filename: string,
        fullWidth: boolean = true,
        forPreview: boolean = false
    ): Promise<Blob> {
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const backgroundColorHex = currentTheme === 'dark' ? '#18110a' : '#f9f5ed';
        const rgb = this.hexToRgb(backgroundColorHex);

        try {
            const mainSections = Array.from(content.querySelectorAll(
                '.intro-section, .stance-section, .energy-system-section'
            )) as HTMLElement[];

            console.log(`Total main sections found in content: ${mainSections.length}`);
            mainSections.forEach((section, index) => {
                const parentClass = section.parentElement ? section.parentElement.className : 'No parent';
                console.log(`Main section ${index + 1}: ${section.className}, text: ${section.innerText.substring(0, 50)}..., parent: ${parentClass}`);
            });

            for (let i = 0; i < mainSections.length; i++) {
                if (i > 0) pdf.addPage();
                pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
                (pdf as any).rect(0, 0, this.PAGE_WIDTH, this.PAGE_HEIGHT, 'F');

                const section = mainSections[i];
                console.log(`Rendering main section ${i + 1} (${section.className}) on page ${pdf.internal.getNumberOfPages()}`);

                const printContainer = this.createPrintContainer(section, backgroundColorHex);
                const tableWrapper = printContainer.querySelector('.table-wrapper') as HTMLElement;

                try {
                    if (tableWrapper) {
                        // Рендерим секцию без таблицы
                        tableWrapper.style.display = 'none';
                        const canvas = await html2canvas(printContainer, <any> {
                            scale: 2,
                            backgroundColor: backgroundColorHex,
                            useCORS: true
                        });

                        const imgWidth = this.CONTENT_WIDTH;
                        let imgHeight = (canvas.height * imgWidth) / canvas.width;
                        let yPos = this.PAGE_MARGIN;

                        pdf.addImage(
                            canvas.toDataURL('image/jpeg', 0.9),
                            'JPEG',
                            this.PAGE_MARGIN,
                            yPos,
                            imgWidth,
                            imgHeight
                        );

                        yPos += imgHeight + 10; // Отступ после секции

                        // Рендерим таблицу отдельно
                        tableWrapper.style.display = 'block';
                        const tableHandler = new PDFTableHandler();
                        await tableHandler.handleTable(pdf, tableWrapper, yPos);
                    } else {
                        await this.renderSection(pdf, printContainer, backgroundColorHex);
                    }
                } catch (error) {
                    console.error(`Error rendering section ${i + 1} (${section.className}):`, error);
                } finally {
                    document.body.removeChild(printContainer);
                }
            }

            console.log('Finished rendering all sections. Saving PDF...');
            if (forPreview) {
                return pdf.output('blob');
            } else {
                pdf.save(filename);
                return pdf.output('blob');
            }
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            throw error;
        }
    }

    private createPrintContainer(content: HTMLElement, backgroundColor: string): HTMLElement {
        const printContainer = document.createElement('div');
        printContainer.id = 'pdf-print-container';
        printContainer.style.position = 'absolute';
        printContainer.style.left = '-9999px';
        printContainer.style.width = `${this.PAGE_WIDTH}mm`;
        printContainer.style.padding = '0';
        printContainer.style.background = backgroundColor;
        printContainer.style.color = getComputedStyle(document.body).color;

        const contentClone = content.cloneNode(true) as HTMLElement;
        contentClone.querySelectorAll('.no-print').forEach(el => el.remove());
        printContainer.appendChild(contentClone);
        document.body.appendChild(printContainer);

        return printContainer;
    }

    private async renderSection(pdf: jsPDF, section: HTMLElement, backgroundColor: string): Promise<void> {
        section.style.background = backgroundColor;

        const canvas = await html2canvas(section, <any> {
            scale: 2,
            backgroundColor: backgroundColor,
            useCORS: true
        });

        const imgWidth = this.CONTENT_WIDTH;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const yPos = (this.PAGE_HEIGHT - imgHeight) / 2;
        
        pdf.addImage(
            canvas.toDataURL('image/jpeg', 0.9),
            'JPEG',
            this.PAGE_MARGIN,
            Math.max(this.PAGE_MARGIN, yPos),
            imgWidth,
            imgHeight
        );
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