import html2pdf from 'html2pdf.js/dist/html2pdf.bundle.min.js';
import '../css/main.css';

class BeerTechniques {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.searchInput = document.querySelector('.search-input');
        this.noResultsMessage = document.querySelector('.no-results');
        this.printButton = document.querySelector('.print-button');
        
        this.init();
    }

    init() {
        this.initFilters();
        this.initHoverEffects();
        this.initThemeToggle();
        this.initSearch();
        this.initPDFExport();
        this.restoreTheme();
    }

    // ==================== FILTERS ====================
    initFilters() {
        const filterButtons = document.querySelectorAll('.btn-filter'); // Изменено с .filter-btn на .btn-filter
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.applyFilter(filter);
                this.setActiveFilterButton(e.currentTarget);
            });
        });
    }
    
    applyFilter(filter) {
        const sections = document.querySelectorAll('.stance-section');
        sections.forEach(section => {
            if (filter === 'all') {
                section.style.display = 'block';
            } else {
                section.style.display = section.dataset.stance === filter ? 'block' : 'none';
            }
        });
    }
    
    setActiveFilterButton(activeBtn) {
        document.querySelectorAll('.btn-filter').forEach(btn => { // Изменено с .filter-btn на .btn-filter
            btn.classList.toggle('active', btn === activeBtn);
        });
    }

    // ==================== HOVER EFFECTS ====================
    initHoverEffects() {
        document.querySelectorAll('tbody tr').forEach(row => {
            row.addEventListener('mouseenter', () => {
                row.style.transform = 'scale(1.02)';
                row.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                row.style.transition = 'all 0.3s ease';
            });
            
            row.addEventListener('mouseleave', () => {
                row.style.transform = '';
                row.style.boxShadow = '';
            });
        });
    }

    // ==================== THEME TOGGLE ====================
    initThemeToggle() {
        if (!this.themeToggle) return;
        
        this.themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            this.updateThemeUI(newTheme);
        });
    }

    updateThemeUI(theme) {
        try {
            const themeText = this.themeToggle.querySelector('.theme-text');
            const themeIcon = this.themeToggle.querySelector('.theme-icon');
            
            if (themeText) {
                themeText.textContent = theme === 'dark' ? 'Тёмная тема' : 'Светлая тема';
            }
            if (themeIcon) {
                themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
            }
        } catch (e) {
            console.log('UI update error:', e);
        }
    }

    restoreTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeUI(savedTheme);
    }

    // ==================== SEARCH ====================
    initSearch() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim().toLowerCase();
                this.performSearch(query);
            });
        }
    }

    performSearch(query) {
        const searchQuery = query.trim().toLowerCase();
        const rows = document.querySelectorAll('.table tbody tr');
        let hasResults = false;
    
        
        if (!searchQuery) {
            rows.forEach(row => row.style.display = '');
            this.noResultsMessage?.classList.remove('show');
            return;
        }
    
        
        rows.forEach(row => {
            const rowText = Array.from(row.querySelectorAll('td'))
                .map(td => td.textContent.toLowerCase())
                .join(' ');
            const isVisible = rowText.includes(searchQuery);
            row.style.display = isVisible ? '' : 'none';
            if (isVisible) hasResults = true;
        });
    
        
        if (this.noResultsMessage) {
            this.noResultsMessage.classList.toggle('show', !hasResults);
        }
    }

    // ==================== PDF EXPORT ====================
    initPDFExport() {
        if (this.printButton) {
            this.printButton.addEventListener('click', () => this.generatePDF());
        }
    }

    async generatePDF() {
        try {
            const elementsToHide = document.querySelectorAll('.control-panel, .search-box');
            
            elementsToHide.forEach(el => el.style.display = 'none');
            document.documentElement.setAttribute('data-theme', 'light');
            
            const options = {
                margin: [15, 10],
                filename: 'beer-techniques.pdf',
                html2canvas: { scale: 1.1 },
                jsPDF: { unit: 'mm', format: 'a4' }
            };

            await new Promise(resolve => setTimeout(resolve, 300));
            await html2pdf().set(options).from(document.body).save();

        } catch (error) {
            console.error('PDF Export Error:', error);
        } finally {
            document.querySelectorAll('.control-panel, .search-box').forEach(el => {
                el.style.display = '';
            });
            this.restoreTheme();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BeerTechniques();
});