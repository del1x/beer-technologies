import { Technique, BeerType } from './Tables-data';

export class TableRenderer {
    static renderTechniquesTable(
        container: HTMLElement,
        style: string,
        data: Record<string, Technique[]>
    ): void {
        if (!container) {
            console.error('Container is null or undefined');
            return;
        }

        try {
            const techniques = data?.[style];
            
            if (!techniques || !techniques.length) {
                return this.renderEmptyState(container, 'Техники для выбранного стиля не найдены');
            }

            this.safeRender(container, this.generateTechniquesTable(techniques));
        } catch (error) {
            console.error('Error rendering techniques table:', error);
            this.renderErrorState(container);
        }
    }

    static renderBeerTable(
        container: HTMLElement,
        data: BeerType[]
    ): void {
        if (!container) {
            console.error('Container is null or undefined');
            return;
        }

        try {
            if (!data || !data.length) {
                return this.renderEmptyState(container, 'Данные о пиве не найдены');
            }

            this.safeRender(container, this.generateBeerTable(data));
        } catch (error) {
            console.error('Error rendering beer table:', error);
            this.renderErrorState(container);
        }
    }

    private static safeRender(container: HTMLElement, html: string): void {
        container.innerHTML = '';
        const template = document.createElement('template');
        template.innerHTML = html;
        container.appendChild(template.content.cloneNode(true));
    }

    private static generateTechniquesTable(techniques: Technique[]): string {
        return `
            <table class="table techniques-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Название</th>
                        <th>Эффект</th>
                        <th>Энергия</th>
                    </tr>
                </thead>
                <tbody>
                    ${techniques.map(item => `
                        <tr data-technique-row data-id="${this.escapeAttr(String(item.id))}">
                            <td>${this.escapeHtml(item.id)}</td>
                            <td>${this.escapeHtml(item.name)}</td>
                            <td>${this.escapeHtml(item.effect)}</td>
                            <td>${this.escapeHtml(item.energy)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    private static generateBeerTable(beers: BeerType[]): string {
        return `
            <table class="table beer-table">
                <thead>
                    <tr>
                        <th>Тип пива</th>
                        <th>Стойка</th>
                        <th>Энергия/порция</th>
                        <th>Особенность</th>
                    </tr>
                </thead>
                <tbody>
                    ${beers.map(item => `
                        <tr data-beer-type data-name="${this.escapeAttr(item.name)}">
                            <td>${this.escapeHtml(item.name)}</td>
                            <td>
                                <span class="stance-badge ${this.escapeAttr(item.stance)}">
                                    ${item.stance === 'dark' ? 'Тёмная' : 'Светлая'}
                                </span>
                            </td>
                            <td>${this.escapeHtml(item.energy)}</td>
                            <td>${this.escapeHtml(item.feature)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    public static renderEmptyState(container: HTMLElement, message: string): void {
        this.safeRender(container, `
            <div class="table-empty">
                <p>${this.escapeHtml(message)}</p>
            </div>
        `);
    }

    public static renderErrorState(container: HTMLElement): void {
        this.safeRender(container, `
            <div class="table-error">
                <p>🍺 Произошла ошибка при загрузке данных</p>
                <button class="btn-retry">
                    Попробовать снова
                </button>
            </div>
        `);
    }

    private static escapeHtml(unsafe: string | number): string {
        if (typeof unsafe === 'number') return String(unsafe);
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    private static escapeAttr(unsafe: string): string {
        return this.escapeHtml(unsafe).replace(/\s+/g, '-').toLowerCase();
    }
}