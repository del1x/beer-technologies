import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class PDFManager {
    private readonly PAGE_MARGIN = 15; // mm
    private readonly TITLE = '🍻 Полный список пивных приёмов';
    private modal: HTMLElement | null = null;

    constructor(
        private triggerElement: HTMLElement | null,
        private filename: string = 'beer-techniques.pdf'
    ) {}

    public init(): void {
        this.triggerElement?.addEventListener('click', async () => {
            try {
                await this.showPreviewModal();
            } catch (error) {
                console.error('PDF generation error:', error);
                alert('Ошибка при создании PDF. Проверьте консоль для деталей.');
            }
        });
    }

    private async showPreviewModal(): Promise<void> {
    // Создаем модальное окно
    this.modal = document.createElement('div');
    this.modal.className = 'pdf-preview-modal-container';
    this.modal.innerHTML = `
        <div class="pdf-preview-modal">
            <div class="pdf-preview-header">
                <h3>Предпросмотр PDF</h3>
                <button class="close-preview">&times;</button>
            </div>
            <div class="pdf-preview-options">
                <label>
                    <input type="checkbox" id="fullWidth" checked>
                    Печатать на всю ширину
                </label>
                <button class="btn btn-download">Скачать PDF</button>
            </div>
            <div class="pdf-preview-content">
                <iframe id="pdf-preview-frame" style="width:100%; height:500px; border:none;"></iframe>
            </div>
        </div>
    `;
    
    document.body.appendChild(this.modal);
    document.body.style.overflow = 'hidden';

    // Добавляем CSS стили (теперь они в отдельном файле)
    this.addModalStyles();

    // Обработчики событий
    this.modal.querySelector('.close-preview')?.addEventListener('click', () => {
        this.closeModal();
    });

    this.modal.querySelector('.btn-download')?.addEventListener('click', async () => {
        const fullWidth = (this.modal?.querySelector('#fullWidth') as HTMLInputElement)?.checked;
        await this.generatePDF(fullWidth);
        this.closeModal();
    });

    // Добавляем класс active после небольшой задержки, чтобы применились стили
    setTimeout(() => {
        this.modal?.classList.add('active');
    }, 10);

    // Генерируем предпросмотр
    const pdfBlob = await this.generatePDF(true, true);
    const url = URL.createObjectURL(pdfBlob);
    const iframe = this.modal.querySelector('#pdf-preview-frame') as HTMLIFrameElement;
    iframe.src = url;
}

    private addModalStyles(): void {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'pdf-modal-styles.css';
        document.head.appendChild(link);
    }

    private closeModal(): void {
    if (this.modal) {
        this.modal.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(this.modal as HTMLElement);
            document.body.style.overflow = '';
            this.modal = null;
        }, 300); // Должно соответствовать длительности анимации
    }
}

    private async generatePDF(fullWidth: boolean = true, forPreview: boolean = false): Promise<Blob> {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const content = document.querySelector('.main-content') as HTMLElement;
        if (!content) throw new Error('Main content not found');

        // Создаем временный контейнер
        const printContainer = document.createElement('div');
        printContainer.id = 'pdf-print-container';
        printContainer.style.position = 'fixed';
        printContainer.style.left = '-9999px';
        printContainer.style.width = fullWidth ? '210mm' : '180mm';
        printContainer.style.padding = '20mm';
        printContainer.style.background = getComputedStyle(document.body).backgroundColor;
        printContainer.style.color = getComputedStyle(document.body).color;
        printContainer.style.fontFamily = 'Arial, sans-serif';

        // Клонируем контент
        const contentClone = content.cloneNode(true) as HTMLElement;
        
        // Удаляем ненужные элементы для печати
        const elementsToRemove = contentClone.querySelectorAll('.header, .control-panel, .search-box, .btn, .theme-toggle, .no-print');
        elementsToRemove.forEach(el => el.remove());

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
            // Специальная обработка таблиц
            if (section.classList.contains('table-wrapper')) {
                currentY = await this.handleTablePDF(pdf, section as HTMLElement, currentY, pageHeight);
                continue;
            }

            const canvas = await html2canvas(section, <any> {
                scale: 2,
                backgroundColor: getComputedStyle(document.body).backgroundColor,
                logging: true,
                useCORS: true,
                allowTaint: true,
                windowWidth: section.scrollWidth,
                windowHeight: section.scrollHeight
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

            currentY += imgHeight + 10;
        }

        document.body.removeChild(printContainer);

        if (forPreview) {
            return pdf.output('blob');
        } else {
            pdf.save(this.filename);
            return pdf.output('blob');
        }
    }

    private async handleTablePDF(pdf: jsPDF, tableWrapper: HTMLElement, currentY: number, pageHeight: number): Promise<number> {
        const table = tableWrapper.querySelector('table');
        if (!table) return currentY;

        // Создаем временный контейнер
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.width = '180mm';
        document.body.appendChild(tempContainer);

        // Клонируем таблицу
        const tableClone = table.cloneNode(true) as HTMLTableElement;
        const rows = Array.from(tableClone.rows) as HTMLTableRowElement[];
        if (rows.length === 0) return currentY;

        const header = rows[0];
        let remainingRows = rows.slice(1);

        while (remainingRows.length > 0) {
            // Создаем таблицу для текущей страницы
            const pageTable = document.createElement('table');
            pageTable.className = tableClone.className;
            pageTable.appendChild(header.cloneNode(true));

            let currentPageHeight = header.offsetHeight;
            let rowsToAdd: HTMLTableRowElement[] = [];

            // Выбираем строки для текущей страницы
            for (let i = 0; i < remainingRows.length; i++) {
                const row = remainingRows[i];
                const rowHeight = row.offsetHeight;

                if (currentPageHeight + rowHeight > pageHeight - currentY - 10) {
                    break;
                }

                rowsToAdd.push(row);
                currentPageHeight += rowHeight;
            }

            // Добавляем выбранные строки
            rowsToAdd.forEach(row => pageTable.appendChild(row.cloneNode(true)));
            remainingRows = remainingRows.slice(rowsToAdd.length);

            // Рендерим часть таблицы
            tempContainer.innerHTML = '';
            tempContainer.appendChild(pageTable);

            const canvas = await html2canvas(tempContainer as HTMLElement, <any> {
                scale: 2,
                backgroundColor: getComputedStyle(document.body).backgroundColor
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 180;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Проверяем, помещается ли на текущую страницу
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

            // Если остались строки - новая страница
            if (remainingRows.length > 0) {
                pdf.addPage();
                currentY = this.PAGE_MARGIN;
            }
        }

        document.body.removeChild(tempContainer);
        return currentY;
    }
}