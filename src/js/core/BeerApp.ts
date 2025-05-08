import { TableRenderer } from '@core/TableRenderer';
import { AppInitializer } from '@core/AppInitializer';
import { TECHNIQUES_DATA } from '@core/Tables-data';

export class BeerApp {
    private appInitializer: AppInitializer;

    constructor() {
        this.appInitializer = new AppInitializer();
    }

    public init(): void {
        this.renderAllTables();
        this.appInitializer.init();
    }

    private renderAllTables(): void {
        // Рендерим таблицы приёмов
        document.querySelectorAll<HTMLElement>('[data-table-type="techniques"]').forEach(container => {
            const style = container.dataset.style as keyof typeof TECHNIQUES_DATA;
            if (style) TableRenderer.renderTechniquesTable(container, style);
        });

        // Рендерим таблицу пива
        const beerTableContainer = document.querySelector<HTMLElement>('[data-table-type="beer-types"]');
        if (beerTableContainer) TableRenderer.renderBeerTable(beerTableContainer);

        // Обновляем HoverManager
        this.appInitializer.updateHoverManager();
    }
}