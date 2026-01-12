import { ChartModule } from './chart.js';
import { AnalysisModule } from './analysis.js';
import { PortfolioModule } from './portfolio.js';

const chartApp = new ChartModule('chart-container');

// Hàm xử lý chính khi người dùng chọn mã
async function handleSelectStock(ticker) {
    ticker = ticker.toUpperCase();
    const tf = document.getElementById('timeframe-select').value
    time = "_" + tf;
    if (tf== '1d') time ="";

    try {
        const res = await fetch(`./data/${ticker}${time}.json`);
        const data = await res.json();

        // 1. Vẽ biểu đồ
        chartApp.render(data.candles, data.volumes);
        chartApp.zoomOneYear(data.candles);

        // 2. Tải phân tích
        AnalysisModule.load(ticker);
        
        // 3. Cập nhật URL hoặc tiêu đề
        document.title = `S-Invest | ${ticker}`;
    } catch (e) {
        alert("Không tìm thấy dữ liệu cho mã: " + ticker);
    }
}

// Lắng nghe sự kiện từ giao diện
document.getElementById('stock-input').onkeypress = (e) => {
    if (e.key === 'Enter') handleSelectStock(e.target.value);
};

// Khởi tạo Portfolio
PortfolioModule.init((symbol) => {
    document.getElementById('stock-input').value = symbol;
    handleSelectStock(symbol);
});

// Xuất ra window nếu cần dùng trực tiếp trong HTML
window.addCurrentToWatchlist = () => {
    const ticker = document.getElementById('stock-input').value;
    PortfolioModule.add(ticker.toUpperCase());
};