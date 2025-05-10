import { PDFGenerator } from './PDFGenerator';
import { PDFPreviewUI } from './PDFPreviewUI';

export class PDFManager {
    private generator: PDFGenerator;
    private previewUI?: PDFPreviewUI;

    constructor(
        private triggerElement: HTMLElement,
        private contentElement: HTMLElement,
        private filename: string = 'beer-techniques.pdf'
    ) {
        this.generator = new PDFGenerator();
    }

    public init(): void {
        this.triggerElement.addEventListener('click', async () => {
            try {
                this.previewUI = new PDFPreviewUI(
                    this.generator,
                    this.contentElement,
                    this.filename
                );
                await this.previewUI.show();
            } catch (error) {
                console.error('PDF Error:', error);
                alert('Ошибка при создании PDF. Проверьте консоль для деталей.');
            }
        });
    }
}