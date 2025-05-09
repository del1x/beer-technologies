import { AppInitializer } from '@core/AppInitializer';
import { TableRenderer } from '@core/TableRenderer';

export class BeerApp {
    private appInitializer: AppInitializer;
    private apiBaseUrl: string;

    constructor(apiBaseUrl: string = '/api') {
        this.appInitializer = new AppInitializer();
        this.apiBaseUrl = apiBaseUrl;
    }

    public async init(): Promise<void> {
        try {
            await this.renderAllTables();
            this.appInitializer.init();
        } catch (error) {
            console.error('Initialization failed:', error);
            throw error;
        }
    }

    private async fetchData<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.apiBaseUrl}/${endpoint}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load ${endpoint}: ${response.status}`);
        }
        return await response.json();
    }

    private async renderAllTables(): Promise<void> {
        try {
            const [techniquesData, beerTypesData] = await Promise.all([
                this.fetchData<Record<string, any>>('techniques'),
                this.fetchData<any[]>('beer-types')
            ]);

            this.renderTechniquesTables(techniquesData);
            this.renderBeerTable(beerTypesData);
            this.appInitializer.updateHoverManager();
        } catch (error) {
            console.error('Error rendering tables:', error);
            throw error;
        }
    }

    private renderTechniquesTables(data: Record<string, any>): void {
        document.querySelectorAll<HTMLElement>('[data-table-type="techniques"]').forEach(container => {
            const style = container.dataset.style;
            if (style && data[style]) {
                TableRenderer.renderTechniquesTable(container, style, data);
            } else {
                TableRenderer.renderEmptyState(container, 'Стиль техник не найден');
            }
        });
    }

    private renderBeerTable(data: any[]): void {
        const container = document.querySelector<HTMLElement>('[data-table-type="beer-types"]');
        if (container) {
            if (data?.length) {
                TableRenderer.renderBeerTable(container, data);
            } else {
                TableRenderer.renderEmptyState(container, 'Данные о пиве не загружены');
            }
        }
    }
}