import { PDFGenerator } from './PDFGenerator';
import { PDFPreviewUI } from './PDFPreviewUI';
import { Toast } from '@core/Toast';

export class PDFManager {
    private generator: PDFGenerator;
    private previewUI?: PDFPreviewUI;
    private isInitialized: boolean = false;
    private isPreviewOpen: boolean = false;

    constructor(
        private triggerElement: HTMLElement,
        private contentElement: HTMLElement,
        private filename: string = 'beer-techniques.pdf'
    ) {
        this.generator = new PDFGenerator();
        console.log('PDFManager constructed for triggerElement:', this.triggerElement);
    }

    public init(): void {
        if (this.isInitialized) {
            console.log('PDFManager.init() skipped: already initialized');
            return;
        }

        console.log('Adding click listener to triggerElement:', this.triggerElement);
        this.triggerElement.addEventListener('click', async (event) => {
            event.stopImmediatePropagation();
            console.log('Click event triggered on triggerElement:', this.triggerElement);
            console.log('Event details:', event.type, event.target);

            if (this.isPreviewOpen) {
                console.log('Preview already open, skipping');
                return;
            }

            try {
                const clonedContent = this.contentElement.cloneNode(true) as HTMLElement;
                // Собираем только основные секции
                const mainSections = Array.from(clonedContent.querySelectorAll(
                    '.intro-section, .stance-section, .energy-system-section'
                )) as HTMLElement[];
                console.log(`PDFManager: Total main sections in cloned content: ${mainSections.length}`);
                mainSections.forEach((section, index) => {
                    console.log(`PDFManager: Main section ${index + 1}: ${section.className}, text: ${section.innerText.substring(0, 50)}...`);
                });

                this.isPreviewOpen = true;
                this.previewUI = new PDFPreviewUI(
                    this.generator,
                    clonedContent,
                    this.filename,
                    this
                );
                await this.previewUI.show();
            } catch (error) {
                console.error('PDF Error:', error);
                Toast.show('Ошибка при создании PDF. Проверьте консоль для деталей.', 'error');
            }
        });

        this.isInitialized = true;
        console.log('PDFManager.init() completed');
    }

    public onPreviewClose(): void {
        this.isPreviewOpen = false;
        console.log('Preview closed, isPreviewOpen reset');
    }
}