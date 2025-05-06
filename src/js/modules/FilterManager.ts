export class FilterManager {
    private filterButtons: NodeListOf<HTMLElement>;
    private stanceSections: NodeListOf<HTMLElement>;
    private activeFilter: string;

    constructor(filterButtons: NodeListOf<HTMLElement>, stanceSections: NodeListOf<HTMLElement>) {
        this.filterButtons = filterButtons;
        this.stanceSections = stanceSections;
        this.activeFilter = 'all';
    }

    init(): void {
        if (!this.filterButtons.length) return;
        
        this.filterButtons.forEach((btn: HTMLElement) => {
            btn.addEventListener('click', (e: Event) => {
                const target = e.currentTarget as HTMLElement;
                const filter = target.dataset.filter || 'all';
                this.applyFilter(filter);
                this.setActiveButton(target);
            });
        });
    }

    applyFilter(filter: string): void {
        this.activeFilter = filter;
        this.stanceSections.forEach((section: HTMLElement) => {
            section.style.display = this.shouldShowSection(section) ? 'block' : 'none';
        });
    }

    private shouldShowSection(section: HTMLElement): boolean {
        return this.activeFilter === 'all' || 
               section.dataset.stance === this.activeFilter;
    }

    private setActiveButton(activeBtn: HTMLElement): void {
        this.filterButtons.forEach((btn: HTMLElement) => {
            btn.classList.toggle('active', btn === activeBtn);
        });
    }

    getCurrentFilter(): string {
        return this.activeFilter;
    }
}