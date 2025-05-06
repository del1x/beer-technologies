import { BeerTechniques } from '@core/BeerTechniques';
import { PDFManager } from '@modules/PDFManager';
import '@css/main.css';

interface WindowWithApp extends Window {
  app?: BeerTechniques;
}

const pdfManager = new PDFManager(
  document.querySelector('.print-button'),
  'beer-techniques.pdf'
);
pdfManager.init();

document.addEventListener('DOMContentLoaded', () => {
  const app = new BeerTechniques();
  app.init();

  (window as WindowWithApp).app = app;
});