import { BeerApp } from '@core/BeerApp';
import { Toast } from '@core/Toast';
import '@css/main.css';

interface AppConfig {
    API_BASE_URL: string;
}

const APP_CONFIG: AppConfig = {
    API_BASE_URL: '/api'
};

async function initializeApp(): Promise<void> {
    try {
        const app = new BeerApp(APP_CONFIG.API_BASE_URL);
        await app.init();
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
