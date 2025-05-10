import { ThemeManager } from '@modules/ThemeManager';
import { SearchManager } from '@modules/SearchManager';
import { PDFManager } from '@modules/PDF/PDFManager';
import { FilterManager } from '@modules/FilterManager';
import { HoverManager } from '@modules/HoverManager';

export class AppInitializer {
    private modules: {
        theme: ThemeManager;
        search: SearchManager;
        pdf: PDFManager;
        filter: FilterManager;
        hover: HoverManager;
    };

    constructor() {
        const printButton = document.querySelector('.print-button');
        const mainContent = document.querySelector('.main-content');
        
        if (!printButton || !mainContent) {
            throw new Error('Required elements for PDF manager not found');
        }

        this.modules = {
            theme: new ThemeManager(document.getElementById('themeToggle')!),
            search: new SearchManager(
                document.querySelector('.search-input')!,
                document.querySelector('.no-results')
            ),
            pdf: new PDFManager(
                printButton as HTMLElement,
                mainContent as HTMLElement
            ),
            filter: new FilterManager(
                document.querySelectorAll('.btn-filter'),
                document.querySelectorAll('.stance-section'),
            ),
            hover: new HoverManager(document.querySelectorAll('[data-technique-row]'))
        };
    }

    public init(): void {
        Object.values(this.modules).forEach(module => module.init?.());
    }

    public updateHoverManager(): void {
        this.modules.hover = new HoverManager(document.querySelectorAll('[data-technique-row]'));
        this.modules.hover.init();
    }
}