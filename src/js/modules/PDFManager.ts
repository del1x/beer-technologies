import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class PDFManager {
    private readonly PAGE_MARGIN = 15; // mm
    private readonly TITLE = '🍻 Полный список пивных приёмов';

    constructor(
        private triggerElement: HTMLElement | null,
        private filename: string = 'beer-techniques.pdf'
    ) {}

    public init(): void {
        this.triggerElement?.addEventListener('click', async () => {
            try {
                await this.generatePDF();
            } catch (error) {
                console.error('PDF generation error:', error);
                alert('Ошибка при создании PDF. Проверьте консоль для деталей.');
            }
        });
    }

    private async generatePDF(): Promise<void> {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const content = document.querySelector('.main-content') as HTMLElement;
        if (!content) throw new Error('Main content not found');

        // Создаем временный контейнер
        const printContainer = document.createElement('div');
        printContainer.id = 'pdf-print-container';
        printContainer.style.position = 'fixed';
        printContainer.style.left = '-9999px';
        printContainer.style.width = '210mm';
        printContainer.style.padding = '20mm';
        printContainer.style.background = getComputedStyle(document.body).backgroundColor;
        printContainer.style.color = getComputedStyle(document.body).color;
        printContainer.style.fontFamily = 'Arial, sans-serif';

        // Клонируем контент
        const contentClone = content.cloneNode(true) as HTMLElement;
        
        printContainer.appendChild(contentClone);
        document.body.appendChild(printContainer);

        // Добавляем заголовок
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(20);
        pdf.setTextColor(40, 40, 40);
        pdf.text(this.TITLE, pdf.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

        // Разбиваем на страницы
        let currentY = 30;
        const pageHeight = pdf.internal.pageSize.getHeight() - this.PAGE_MARGIN * 2;
        const sections = Array.from(contentClone.children) as HTMLElement[];

        for (const section of sections) {
            const canvas = await html2canvas(section, <any>{
                scale: 2,
                backgroundColor: getComputedStyle(document.body).backgroundColor,
                logging: true,
                useCORS: true,
                allowTaint: true,
                windowWidth: section.scrollWidth,
                windowHeight: section.scrollHeight
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pdf.internal.pageSize.getWidth() - this.PAGE_MARGIN * 2;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            if (currentY + imgHeight > pageHeight) {
                pdf.addPage();
                currentY = this.PAGE_MARGIN;
            }

            pdf.addImage(
                imgData,
                'PNG',
                this.PAGE_MARGIN,
                currentY,
                imgWidth,
                imgHeight
            );

            currentY += imgHeight + 10;
        }

        document.body.removeChild(printContainer);
        pdf.save(this.filename);
    }
}