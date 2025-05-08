import { BeerApp } from '@core/BeerApp';
import { PDFManager } from '@modules/PDFManager';
import '@css/main.css';

interface WindowWithApp extends Window {
  app?: BeerApp; 
}

// Инициализация PDFManager (остаётся без изменений)
const pdfManager = new PDFManager(
  document.querySelector('.print-button'),
  'beer-techniques.pdf'
);
pdfManager.init();


document.addEventListener('DOMContentLoaded', () => {
  const app = new BeerApp();  
  app.init();

  (window as WindowWithApp).app = app; 
});