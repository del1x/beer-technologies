import { PDFGenerator } from "./PDFGenerator";
import { PDFManager } from "./PDFManager";
import { cloneContentForExport } from "./PDFContentSelector";
import {
    DOCUMENT_SECTION_IDS,
    DocumentSectionId,
    PDFExportOptions,
    PDFMarginPreset,
    PDFOrientation,
    PDFPageFormat
} from "./PDFExportOptions";

export class PDFPreviewUI {
    private modal: HTMLElement | null = null;
    private previewUrl: string | null = null;

    constructor(
        private pdfGenerator: PDFGenerator,
        private content: HTMLElement,
        private filename: string,
        private pdfManager?: PDFManager // Добавляем опциональный параметр
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
                    <button class="close-preview">×</button>
                </div>
                <div class="pdf-preview-options">
                    <fieldset class="pdf-option-group">
                        <legend>Экспорт</legend>
                        <label>
                            <input type="radio" name="pdf-export-mode" value="all" checked>
                            Весь документ
                        </label>
                        <label>
                            <input type="radio" name="pdf-export-mode" value="selected">
                            Выбранные разделы
                        </label>
                        <div class="pdf-section-options" hidden>
                            <label><input type="checkbox" data-section-option="intro" checked> Введение</label>
                            <label><input type="checkbox" data-section-option="dark-stance" checked> Тёмная стойка</label>
                            <label><input type="checkbox" data-section-option="light-stance" checked> Светлая стойка</label>
                            <label><input type="checkbox" data-section-option="energy-system" checked> Система энергии</label>
                        </div>
                        <p class="pdf-selection-error" role="alert" hidden>Выберите хотя бы один раздел</p>
                    </fieldset>
                    <fieldset class="pdf-option-group pdf-page-options">
                        <legend>Страница</legend>
                        <label for="pdf-format">Формат</label>
                        <select id="pdf-format">
                            <option value="a4" selected>A4</option>
                            <option value="letter">Letter</option>
                        </select>
                        <label for="pdf-orientation">Ориентация</label>
                        <select id="pdf-orientation">
                            <option value="portrait" selected>Книжная</option>
                            <option value="landscape">Альбомная</option>
                        </select>
                        <label for="pdf-margin">Поля</label>
                        <select id="pdf-margin">
                            <option value="10">Узкие — 10 мм</option>
                            <option value="15" selected>Стандартные — 15 мм</option>
                            <option value="20">Широкие — 20 мм</option>
                        </select>
                    </fieldset>
                    <div class="pdf-preview-actions">
                        <button class="btn btn-update-preview" type="button">Обновить предпросмотр</button>
                        <button class="btn btn-download" type="button">Скачать PDF</button>
                    </div>
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

        this.modal?.querySelectorAll<HTMLInputElement>('[name="pdf-export-mode"]').forEach(input => {
            input.addEventListener('change', () => this.updateSelectionState());
        });

        this.modal?.querySelectorAll<HTMLInputElement>('[data-section-option]').forEach(input => {
            input.addEventListener('change', () => this.updateSelectionState());
        });

        this.modal?.querySelector('.btn-update-preview')?.addEventListener('click', async () => {
            await this.updatePreview();
        });

        this.modal?.querySelector('.btn-download')?.addEventListener('click', async () => {
            const options = this.readOptions();
            if (!options) return;

            const exportContent = cloneContentForExport(this.content, options);
            await this.pdfGenerator.generatePDF(exportContent, this.filename, true, false, options);
            this.close();
        });

        this.updateSelectionState();
    }

    private async updatePreview(): Promise<void> {
        const options = this.readOptions();
        if (!options) return;

        const exportContent = cloneContentForExport(this.content, options);
        const pdfBlob = await this.pdfGenerator.generatePDF(
            exportContent,
            this.filename,
            true,
            true,
            options
        );
        const iframe = this.modal?.querySelector('#pdf-preview-frame') as HTMLIFrameElement;
        if (this.previewUrl && typeof URL.revokeObjectURL === 'function') {
            URL.revokeObjectURL(this.previewUrl);
        }
        this.previewUrl = URL.createObjectURL(pdfBlob);
        iframe.src = this.previewUrl;
    }

    private readOptions(): PDFExportOptions | null {
        const selectedMode = this.modal?.querySelector<HTMLInputElement>(
            '[name="pdf-export-mode"]:checked'
        )?.value;
        const mode = selectedMode === 'selected' ? 'selected' : 'all';
        const selectedSectionIds = DOCUMENT_SECTION_IDS.filter(sectionId => {
            return this.modal?.querySelector<HTMLInputElement>(
                `[data-section-option="${sectionId}"]`
            )?.checked;
        });

        if (mode === 'selected' && selectedSectionIds.length === 0) {
            return null;
        }

        return {
            mode,
            selectedSectionIds,
            format: this.readSelectValue<PDFPageFormat>('#pdf-format', 'a4'),
            orientation: this.readSelectValue<PDFOrientation>('#pdf-orientation', 'portrait'),
            marginMm: this.readMargin()
        };
    }

    private readSelectValue<T extends string>(selector: string, fallback: T): T {
        return (this.modal?.querySelector<HTMLSelectElement>(selector)?.value as T) || fallback;
    }

    private readMargin(): PDFMarginPreset {
        const margin = Number(this.modal?.querySelector<HTMLSelectElement>('#pdf-margin')?.value);
        return margin === 10 || margin === 20 ? margin : 15;
    }

    private updateSelectionState(): void {
        const selectedMode = this.modal?.querySelector<HTMLInputElement>(
            '[name="pdf-export-mode"]:checked'
        )?.value === 'selected';
        const sectionOptions = this.modal?.querySelector<HTMLElement>('.pdf-section-options');
        const selectionError = this.modal?.querySelector<HTMLElement>('.pdf-selection-error');
        const hasSelectedSections = this.getSelectedSectionIds().length > 0;
        const selectionIsValid = !selectedMode || hasSelectedSections;

        if (sectionOptions) sectionOptions.hidden = !selectedMode;
        if (selectionError) selectionError.hidden = selectionIsValid;
        this.modal?.querySelectorAll<HTMLButtonElement>(
            '.btn-update-preview, .btn-download'
        ).forEach(button => {
            button.disabled = !selectionIsValid;
        });
    }

    private getSelectedSectionIds(): DocumentSectionId[] {
        return DOCUMENT_SECTION_IDS.filter(sectionId => {
            return this.modal?.querySelector<HTMLInputElement>(
                `[data-section-option="${sectionId}"]`
            )?.checked;
        });
    }

    public close(): void {
        if (this.modal) {
            this.modal.classList.remove('active');
            setTimeout(() => {
                if (this.previewUrl && typeof URL.revokeObjectURL === 'function') {
                    URL.revokeObjectURL(this.previewUrl);
                    this.previewUrl = null;
                }
                document.body.removeChild(this.modal as HTMLElement);
                document.body.style.overflow = '';
                this.modal = null;
                // Сообщаем PDFManager, что окно закрыто
                this.pdfManager?.onPreviewClose();
            }, 300);
        }
    }
}
