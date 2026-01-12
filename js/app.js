import { ChartModule } from './chart.js';
// Giả định bạn đã có các module khác...

// 1. Khởi tạo UI
const chartApp = new ChartModule('chart-container');

// 2. Logic chuyển Tab
const tabs = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.tab-panel');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.target;

        // Xóa active khỏi tất cả các nút và panel
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        // Thêm active vào nút vừa nhấn và panel tương ứng
        tab.classList.add('active');
        document.getElementById(target).classList.add('active');

        // Quan trọng: Resize lại biểu đồ khi tab Chart được hiển thị
        if (target === 'tab-chart') {
            window.dispatchEvent(new Event('resize')); 
        }
    });
});

/**
 * Hàm xử lý khi chọn một mã cổ phiếu
 * @param {string} ticker - Mã cổ phiếu (VD: 'FPT')
 */
// js/app.js

async function handleSelectStock(ticker) {
    const tf = document.getElementById('timeframe-select').value;
    const url = `./data/${ticker.toUpperCase()}.json`;//_${tf}

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
        chartApp.zoomOneYear(candleData);

        // 5. Cập nhật các Tab khác (nếu cần)
        // AnalysisModule.load(ticker);

    } catch (error) {
        console.error("Lỗi xử lý:", error);
    }
}




// 3. Xử lý tìm kiếm toàn cục
document.getElementById('global-search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const ticker = e.target.value.toUpperCase();
        console.log("Đang nạp dữ liệu cho:", ticker);
        // Gọi các hàm nạp dữ liệu từ các module tại đây
    }
});

// Xuất hàm ra để các module khác (như Portfolio) có thể gọi
export { handleSelectStock };