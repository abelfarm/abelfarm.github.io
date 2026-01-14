// --- PHẦN 1: IMPORT ---
import { ChartModule } from './chart.js';
// Giả định bạn đã có các module khác...

// --- PHẦN 2: KHỞI TẠO ---
const chartApp = new ChartModule('chart-container');
window.chartApp = chartApp; // Đưa ra global để các nút HTML gọi được applyZoom

// --- PHẦN 3: CÁC HÀM XỬ LÝ (Tab, Search...) ---
const tabs = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.tab-panel');

function switchTab(targetId) {
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));

    const activeTab = document.querySelector(`[data-target="${targetId}"]`);
    const activePanel = document.getElementById(targetId);

    if (activeTab && activePanel) {
        activeTab.classList.add('active');
        activePanel.classList.add('active');
        
        // Lưu Tab vừa chọn vào máy tính
        localStorage.setItem('lastTab', targetId);

        // Nếu là tab biểu đồ, phải resize lại
        if (targetId === 'tab-chart') {
            setTimeout(() => chartApp.resize(), 50);
        }
    }
}

// Gán sự kiện click cho các nút Tab
tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.target));
});

/**
 * Hàm xử lý khi chọn một mã cổ phiếu
 * @param {string} ticker - Mã cổ phiếu (VD: 'FPT')
 */
// js/app.js

async function handleSelectStock(ticker) {
    const tf = document.getElementById('timeframe-select').value;
    const url = `./data/${ticker.toUpperCase()}.json`;//_${tf}
    console.log(ticker)

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Không tìm thấy dữ liệu!");
        const rawData = await response.json();

        // 1. Sắp xếp theo thời gian (đảm bảo tăng dần)
        rawData.sort((a, b) => new Date(a.time) - new Date(b.time));

        // 2. Chuyển đổi dữ liệu sang định dạng của Lightweight Charts
        const candleData = [];
        const volumeData = [];

        rawData.forEach(d => {
            const open = parseFloat(d.open);
            const close = parseFloat(d.close);
            
            // Dữ liệu Nến
            candleData.push({
                time: d.time, // "2006-11-21" hợp lệ với nến Ngày
                open: open,
                high: parseFloat(d.high),
                low: parseFloat(d.low),
                close: close
            });

            // Dữ liệu Khối lượng (Sử dụng trường "value" như bạn yêu cầu)
            volumeData.push({
                time: d.time,
                value: parseFloat(d.value || 0),
                // Màu xanh nếu giá đóng cửa >= mở cửa, ngược lại màu đỏ
                color: close >= open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)'
            });
        });

        // 3. Đẩy dữ liệu vào Chart Module 
        chartApp.render(candleData, volumeData);
        
        
        // 4. Mặc định hiển thị 1 năm gần nhất
        chartApp.applyZoom(90);

        // 5. Cập nhật các Tab khác (nếu cần)
        // AnalysisModule.load(ticker);

        // LƯU VÀO BỘ NHỚ: Ghi nhớ mã này để lần sau mở web tự load
        localStorage.setItem('lastSelectedTicker', ticker);

    } catch (error) {
        console.log("Lỗi xử lý:", error);
    }
}




// 3. Xử lý tìm kiếm toàn cục
document.getElementById('global-search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const ticker = e.target.value.toUpperCase();
        console.log("Đang nạp dữ liệu cho:", ticker);
        // Gọi các hàm nạp dữ liệu từ các module tại đây
        handleSelectStock(ticker)
    }
});

// --- PHẦN 4: BƯỚC NÂNG CAO (NẰM Ở CUỐI) ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("Hệ thống đang khởi tạo dữ liệu cũ...");

    // 1. Tự động quay lại Tab cũ (Nếu không có thì mặc định là tab-dashboard)
    const savedTab = localStorage.getItem('lastTab') || 'tab-dashboard';
    switchTab(savedTab);

    // 2. Tự động load mã cổ phiếu cũ (Nếu không có thì mặc định là FPT)
    const savedTicker = localStorage.getItem('lastSelectedTicker') || 'FPT';
    
    // Đưa mã vào ô tìm kiếm cho đẹp giao diện
    const searchInput = document.getElementById('global-search');
    if (searchInput) searchInput.value = savedTicker;

    // Gọi hàm load dữ liệu
    // Lưu ý: handleSelectStock phải là hàm async bạn đã viết ở các bước trước
    handleSelectStock(savedTicker);
});

// Xuất hàm ra để các module khác (như Portfolio) có thể gọi
export { handleSelectStock };