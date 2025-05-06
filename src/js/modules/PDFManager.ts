import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class PDFManager {
  private printButton: HTMLElement | null;
  private filename: string;

  constructor(printButton: HTMLElement | null, filename: string = 'beer-techniques.pdf') {
    this.printButton = printButton;
    this.filename = filename;
  }

  init(): void {
    this.printButton?.addEventListener('click', () => this.exportPDF());
  }

  private async exportPDF(): Promise<void> {
    try {
      const elementsToHide = document.querySelectorAll<HTMLElement>('.control-panel, .search-box');
      this.toggleElements(elementsToHide, false);
      
      await this.generatePDF();
    } catch (error) {
      console.error('PDF Export Error:', error);
    } finally {
      const elementsToShow = document.querySelectorAll<HTMLElement>('.control-panel, .search-box');
      this.toggleElements(elementsToShow, true);
    }
  }

  private async generatePDF(): Promise<void> {
    const element = document.body;
    
  
    const options = {
      scale: 2,
      useCORS: true,
      logging: false
    } as any; 
    
    const canvas = await html2canvas(element, options);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(this.filename);
  }

  private toggleElements(elements: NodeListOf<HTMLElement>, show: boolean): void {
    elements.forEach(el => el.style.display = show ? '' : 'none');
  }
}