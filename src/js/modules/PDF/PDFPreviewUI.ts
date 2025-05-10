import { PDFGenerator } from "./PDFGenerator";

export class PDFPreviewUI {
    private modal: HTMLElement | null = null;

    constructor(
        private pdfGenerator: PDFGenerator,
        private content: HTMLElement,
        private filename: string
    ) {}

    public async show(): Promise<void> {
        this.modal = this.createModal();
        document.body.appendChild(this.modal);
        document.body.style.overflow = 'hidden';

        this.setupEventListeners();
        await this.updatePreview();

        setTimeout(() => {
            this.modal?.classList.add('active');
        }, 10);
    }

    private createModal(): HTMLElement {
        const modal = document.createElement('div');
        modal.className = 'pdf-preview-modal-container';
        modal.innerHTML = `
            <div class="pdf-preview-modal">
                <div class="pdf-preview-header">
                    <h3 style="color:var(--text-secondary);">Предпросмотр PDF</h3>
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
        return modal;
    }

    private setupEventListeners(): void {
        this.modal?.querySelector('.close-preview')?.addEventListener('click', () => this.close());
        this.modal?.querySelector('.btn-download')?.addEventListener('click', async () => {
            const fullWidth = (this.modal?.querySelector('#fullWidth') as HTMLInputElement)?.checked;
            await this.pdfGenerator.generatePDF(this.content, this.filename, fullWidth, false);
            this.close();
        });
    }

    private async updatePreview(): Promise<void> {
        const pdfBlob = await this.pdfGenerator.generatePDF(this.content, this.filename, true, true);
        const iframe = this.modal?.querySelector('#pdf-preview-frame') as HTMLIFrameElement;
        iframe.src = URL.createObjectURL(pdfBlob);
    }

    public close(): void {
        if (this.modal) {
            this.modal.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(this.modal as HTMLElement);
                document.body.style.overflow = '';
                this.modal = null;
            }, 300);
        }
    }
}