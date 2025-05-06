export class HoverManager {
  private rows: NodeListOf<HTMLElement>;

  constructor(tableRows: NodeListOf<HTMLElement>) {
      this.rows = tableRows;
  }

  init(): void {
      if (!this.rows.length) return;
      
      this.rows.forEach((row: HTMLElement) => {
          row.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
          row.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
      });
  }

  private handleMouseEnter(e: MouseEvent): void {
      const row = e.currentTarget as HTMLElement;
      row.style.transform = 'scale(1.02)';
      row.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
      row.style.transition = 'all 0.3s ease';
  }

  private handleMouseLeave(e: MouseEvent): void {
      const row = e.currentTarget as HTMLElement;
      row.style.transform = '';
      row.style.boxShadow = '';
  }
}