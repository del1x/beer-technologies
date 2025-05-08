import { TECHNIQUES_DATA, BEER_TYPES_DATA } from '@core/Tables-data';

export class TableRenderer {
    static renderTechniquesTable(container: HTMLElement, style: keyof typeof TECHNIQUES_DATA): void {
        const data = TECHNIQUES_DATA[style];
        if (!data) return;

        container.innerHTML = `
            <table class="table">
                <thead><tr><th>№</th><th>Название</th><th>Эффект</th><th>Энергия</th></tr></thead>
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

    static renderBeerTable(container: HTMLElement): void {
        container.innerHTML = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Тип пива</th>
                        <th>Стойка</th>
                        <th>Энергия/порция</th>
                        <th>Особенность</th>
                    </tr>
                </thead>
                <tbody>
                    ${BEER_TYPES_DATA.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td><span class="${item.stance}-badge">${item.stance === 'dark' ? 'Тёмная' : 'Светлая'}</span></td>
                            <td>${item.energy}</td>
                            <td>${item.feature}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
}