import { AppInitializer } from '@core/AppInitializer';
import { TableRenderer } from '@core/TableRenderer';
import { Toast } from '@core/Toast';
import { BeerType, TechniquesData, TechniqueStyle } from '@core/Tables-data';
import { validateBeerTypesData, validateTechniquesData } from '@core/DataValidation';

type DataValidator<T> = (value: unknown) => asserts value is T;

export class BeerApp {
    private appInitializer: AppInitializer;
    private apiBaseUrl: string;
    private retryCount = 0;
    private readonly MAX_RETRIES = 2;
    private retryToast: HTMLElement | null = null; // Храним ссылку на уведомление

    constructor(apiBaseUrl: string = '/api') {
        this.appInitializer = new AppInitializer();
        this.apiBaseUrl = apiBaseUrl;
    }

    public async init(): Promise<void> {
        try {
            await this.renderAllTables();
            await this.appInitializer.init();
            Toast.show('Приложение готово к использованию!', 'success'); // Уведомление об успехе
        } catch (error) {
            this.handleInitError(error);
        }
    }

    private async handleInitError(error: unknown): Promise<void> {
        console.error('Initialization error:', error);

        if (this.retryCount < this.MAX_RETRIES) {
            this.retryCount++;
            const retryMessage = `Попытка ${this.retryCount}/${this.MAX_RETRIES}. Перезагружаем...`;
            if (this.retryCount === 1) {
                this.retryToast = document.createElement('div');
                Toast.show(retryMessage, 'error');
            } else if (this.retryToast) {
                this.retryToast.textContent = retryMessage;
            } else {
                this.retryToast = document.createElement('div');
                Toast.show(retryMessage, 'error');
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
            return this.init();
        }

        Toast.show('Не удалось загрузить приложение. Пожалуйста, обновите страницу.', 'error');
        this.renderGlobalErrorState();
    }

    private renderGlobalErrorState(): void {
        const appContainer = document.body;
        if (appContainer) {
            appContainer.innerHTML = `
                <div class="global-error">
                    <h2>🍺 Ой, что-то пошло не так!</h2>
                    <p>Мы не смогли загрузить приложение</p>
                    <button id="reload-button" class="btn-retry">
                        Обновить страницу
                    </button>
                </div>
            `;
            document.getElementById('reload-button')?.addEventListener('click', () => {
                window.location.reload();
            });
        }
    }

    private async fetchData<T>(endpoint: string, validate: DataValidator<T>): Promise<T> {
        try {
            const response = await fetch(`${this.apiBaseUrl}/${endpoint}.json`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data: unknown = await response.json();
            validate(data);
            return data;
        } catch (error) {
            throw error;
        }
    }

    private async renderAllTables(): Promise<void> {
        try {
            const [techniquesData, beerTypesData] = await Promise.all([
                this.fetchData<TechniquesData>('techniques', validateTechniquesData),
                this.fetchData<BeerType[]>('beer-types', validateBeerTypesData)
            ]);
            this.renderTechniquesTables(techniquesData);
            this.renderBeerTable(beerTypesData);
            this.appInitializer.updateHoverManager();
        } catch (error) {
            console.error('Table rendering error:', error);
            throw new Error('Failed to render tables');
        }
    }

    private renderTechniquesTables(data: TechniquesData): void {
        try {
            document.querySelectorAll<HTMLElement>('[data-table-type="techniques"]').forEach(container => {
                const style = container.dataset.style as TechniqueStyle | undefined;
                if (style && data[style]) {
                    TableRenderer.renderTechniquesTable(container, style, data);
                } else {
                    TableRenderer.renderEmptyState(container, 'Стиль техник не найден');
                }
            });
        } catch (error) {
            console.error('Techniques table error:', error);
            throw error;
        }
    }

    private renderBeerTable(data: BeerType[]): void {
        try {
            const container = document.querySelector<HTMLElement>('[data-table-type="beer-types"]');
            if (container) {
                if (data?.length) {
                    TableRenderer.renderBeerTable(container, data);
                } else {
                    TableRenderer.renderEmptyState(container, 'Данные о пиве не загружены');
                }
            }
        } catch (error) {
            console.error('Beer table error:', error);
            throw error;
        }
    }
}
