import { BeerApp } from '@core/BeerApp';
import { PDFManager } from '@modules/PDF/PDFManager';
import '@css/main.css';

interface AppConfig {
    API_BASE_URL: string;
    PDF_FILENAME: string;
}

const APP_CONFIG: AppConfig = {
    API_BASE_URL: '/api',
    PDF_FILENAME: 'beer-techniques.pdf'
};

async function initializeApp(): Promise<void> {
    try {
        const app = new BeerApp(APP_CONFIG.API_BASE_URL);
        await app.init();
        
        const printButton = document.querySelector('.print-button');
        const mainContent = document.querySelector('.main-content');
        
        if (!printButton || !mainContent) {
            throw new Error('PDF elements not found');
        }

        new PDFManager(
            printButton as HTMLElement,
            mainContent as HTMLElement,
            APP_CONFIG.PDF_FILENAME
        ).init();
        
    } catch (error) {
        console.error('App initialization failed:', error);
        showFatalError('Не удалось загрузить приложение. Пожалуйста, попробуйте позже.');
    }
}

function showFatalError(message: string): void {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'global-error';
    errorContainer.innerHTML = `
        <div class="error-content">
            <h2>🍺 Ошибка загрузки</h2>
            <p>${message}</p>
            <button id="reload-app">Обновить страницу</button>
        </div>
    `;
    document.body.prepend(errorContainer);
    
    document.getElementById('reload-app')?.addEventListener('click', () => {
        window.location.reload();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeApp, 100);
});