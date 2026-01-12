import { ChartModule } from './chart.js';
import { AnalysisModule } from './analysis.js';
import { PortfolioModule } from './portfolio.js';

// Khởi tạo các module (Chart cần ID container)
const chartApp = new ChartModule('chart-container');

// 1. XỬ LÝ CHUYỂN TAB
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
        // Xóa class active cũ
        document.querySelectorAll('.tab-btn, .tab-panel').forEach(el => el.classList.remove('active'));
        
        // Kích hoạt tab mới
        btn.classList.add('active');
        document.getElementById(btn.dataset.target).classList.add('active');
        
        // Nếu chuyển vào tab chart, cần yêu cầu chart resize lại cho chuẩn diện tích
        if (btn.dataset.target === 'tab-chart') {
            chartApp.resize(); 
        }
    };
});

// 2. HÀM CHỌN MÃ CHUNG
async function onStockSelect(ticker) {
    ticker = ticker.toUpperCase();
    
    // Cập nhật biểu đồ (Tab 2)
    chartApp.load(ticker);
    
    // Cập nhật phân tích (Tab 3)
    AnalysisModule.load(ticker);
    
    // Cập nhật text hiển thị nhanh trên Header
    document.getElementById('global-search').value = ticker;
}

// 3. KHỞI TẠO PORTFOLIO (Tab 2 Sidebar)
PortfolioModule.init(onStockSelect);

// 4. TÌM KIẾM NHANH (Global Search)
document.getElementById('global-search').onkeypress = (e) => {
    if (e.key === 'Enter') onStockSelect(e.target.value);
};