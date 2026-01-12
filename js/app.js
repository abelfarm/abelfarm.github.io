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

// 3. Xử lý tìm kiếm toàn cục
document.getElementById('global-search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const ticker = e.target.value.toUpperCase();
        console.log("Đang nạp dữ liệu cho:", ticker);
        // Gọi các hàm nạp dữ liệu từ các module tại đây
    }
});