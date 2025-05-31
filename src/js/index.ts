import { BeerApp } from '@core/BeerApp';
import { PDFManager } from '@modules/PDF/PDFManager';
import { Toast } from '@core/Toast';
import '@css/main.css';

interface AppConfig {
    API_BASE_URL: string;
    PDF_FILENAME: string;
}

const APP_CONFIG: AppConfig = {
    API_BASE_URL: '/api',
    PDF_FILENAME: 'beer-techniques.pdf'
};

let pdfManager: PDFManager | null = null;

async function initializeApp(): Promise<void> {
    try {
        const app = new BeerApp(APP_CONFIG.API_BASE_URL);
        await app.init();

        const printButtons = document.querySelectorAll('.print-button');
        console.log(`Found ${printButtons.length} elements with class .print-button`);
        if (printButtons.length !== 1) {
            console.warn('Unexpected number of .print-button elements. Expected 1, found:', printButtons.length);
        }

        const printButton = printButtons[0] as HTMLElement;
        const mainContent = document.querySelector('.main-content') as HTMLElement;

        if (!printButton || !mainContent) {
            throw new Error('PDF elements not found');
        }

        if (!pdfManager) {
            pdfManager = new PDFManager(printButton, mainContent, APP_CONFIG.PDF_FILENAME);
            pdfManager.init();
        }
    } catch (error) {
        console.error('App initialization failed:', error);
        showFatalError('Не удалось загрузить приложение. Пожалуйста, попробуйте позже.');
    }
}

function showFatalError(message: string): void {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'global-error';
    errorContainer.innerHTML = `
        <h2>🍺 Ошибка загрузки</h2>
        <p>${message}</p>
        <button id="reload-app" class="btn-retry">Обновить страницу</button>
    `;
    document.body.prepend(errorContainer);

    document.getElementById('reload-app')?.addEventListener('click', () => {
        window.location.reload();
    });

    Toast.show(message, 'error');
}

document.addEventListener('DOMContentLoaded', initializeApp);