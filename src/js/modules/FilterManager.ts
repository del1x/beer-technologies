type BeerFilter = 'all' | 'dark' | 'light';

export class FilterManager {
    private filterButtons: NodeListOf<HTMLElement>;
    private stanceSections: NodeListOf<HTMLElement>;
    private activeFilter: BeerFilter;

    constructor(filterButtons: NodeListOf<HTMLElement>, stanceSections: NodeListOf<HTMLElement>) {
        this.filterButtons = filterButtons;
        this.stanceSections = stanceSections;
        this.activeFilter = 'all';
    }

    init(): void {
        if (!this.filterButtons.length) return;
        
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', this.handleFilterClick.bind(this));
        });
    }

    private handleFilterClick(e: Event): void {
        const target = e.currentTarget as HTMLElement;
        const filter = (target.dataset.filter as BeerFilter) || 'all';
        this.applyFilter(filter);
        this.setActiveButton(target);
    }

    applyFilter(filter: BeerFilter): void {
        this.activeFilter = filter;
        this.stanceSections.forEach(section => {
            section.style.display = this.shouldShowSection(section) ? 'block' : 'none';
        });
    }

    private shouldShowSection(section: HTMLElement): boolean {
        return this.activeFilter === 'all' || section.dataset.stance === this.activeFilter;
    }

    private setActiveButton(activeBtn: HTMLElement): void {
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn === activeBtn);
            btn.ariaPressed = (btn === activeBtn).toString();
        });
    }
}