import { TECHNIQUES_DATA, BEER_TYPES_DATA } from '@core/Tables-data';
import { ThemeManager } from '@modules/ThemeManager';
import { SearchManager } from '@modules/SearchManager';
import { PDFManager } from '@modules/PDFManager';
import { FilterManager } from '@modules/FilterManager';
import { HoverManager } from '@modules/HoverManager';

export class BeerTechniques {
    private modules: {
        theme: ThemeManager;
        search: SearchManager;
        pdf: PDFManager;
        filter: FilterManager;
        hover: HoverManager;
    };

    constructor() {
        this.modules = {
            theme: new ThemeManager(document.getElementById('themeToggle')!),
            search: new SearchManager(
                document.querySelector('.search-input')!,
                document.querySelector('.no-results')
            ),
            pdf: new PDFManager(document.querySelector('.print-button')!),
            filter: new FilterManager(
                document.querySelectorAll('.btn-filter'),
                document.querySelectorAll('.stance-section')
            ),
            hover: new HoverManager(document.querySelectorAll('[data-technique-row]'))
        };
    }

    public init(): void {
        this.renderAllTables();
        this.initModules();
        this.setupEventListeners();
    }

    private initModules(): void {
        Object.values(this.modules).forEach(module => module.init?.());
    }

    private renderAllTables(): void {
        // Рендерим таблицы приёмов
        document.querySelectorAll<HTMLElement>('[data-table-type="techniques"]').forEach(container => {
            const style = container.dataset.style;
            if (style && TECHNIQUES_DATA[style]) {
                this.renderTechniquesTable(container, TECHNIQUES_DATA[style]);
            }
        });

        // Рендерим таблицу сортов пива
        const beerTableContainer = document.querySelector<HTMLElement>('[data-table-type="beer-types"]');
        if (beerTableContainer) {
            this.renderBeerTable(beerTableContainer, BEER_TYPES_DATA);
        }
    }

    private renderTechniquesTable(container: HTMLElement, data: typeof TECHNIQUES_DATA[keyof typeof TECHNIQUES_DATA]): void {
        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>№</th>
                        <th>Название</th>
                        <th>Эффект</th>
                        <th>Энергия</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(item => `
                        <tr data-technique-row data-id="${item.id}">
                            <td>${item.id}</td>
                            <td>${item.name}</td>
                            <td>${item.effect}</td>
                            <td>${item.energy}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    private renderBeerTable(container: HTMLElement, data: typeof BEER_TYPES_DATA): void {
        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Тип пива</th>
                        <th>Стойка</th>
                        <th>Стиль</th>
                        <th>Энергия/порция</th>
                        <th>Особенность</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td><span class="${item.stance}-badge">${item.stance === 'dark' ? 'Тёмная' : 'Светлая'}</span></td>
                            <td>${item.style}</td>
                            <td>${item.energy}</td>
                            <td>${item.feature}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    private setupEventListeners(): void {
        // Реинициализируем HoverManager после рендера таблиц
        this.modules.hover = new HoverManager(document.querySelectorAll('[data-technique-row]'));
        this.modules.hover.init();
    }
}