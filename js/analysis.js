export const AnalysisModule = {
    async load(ticker) {
        try {
            const res = await fetch(`./data/${ticker}_info.json`);
            const info = await res.json();
            
            document.getElementById('comp-name').innerText = info.name;
            document.getElementById('val-pe').innerText = info.pe;
            document.getElementById('val-eps').innerText = info.eps;
            document.getElementById('val-roe').innerText = info.roe;
            
            this.loadNews(ticker);
        } catch (e) {
            console.warn("Chưa có dữ liệu cơ bản cho " + ticker);
        }
    },

    loadNews(ticker) {
        const newsList = document.getElementById('news-list');
        newsList.innerHTML = `<div class="news-item">Tin tức mới về ${ticker}: Dự kiến tăng trưởng quý tới...</div>`;
    }
};