export const PortfolioModule = {
    list: JSON.parse(localStorage.getItem('watchlist')) || ['FPT', 'VIC'],

    init(onSelect) {
        this.onSelect = onSelect;
        this.render();
    },

    add(ticker) {
        if (!this.list.includes(ticker)) {
            this.list.push(ticker);
            this.save();
        }
    },

    save() {
        localStorage.setItem('watchlist', JSON.stringify(this.list));
        this.render();
    },

    render() {
        const container = document.getElementById('watchlist');
        container.innerHTML = this.list.map(s => `
            <div class="watch-item" data-symbol="${s}">${s}</div>
        `).join('');

        container.querySelectorAll('.watch-item').forEach(el => {
            el.onclick = () => this.onSelect(el.dataset.symbol);
        });
    }
};