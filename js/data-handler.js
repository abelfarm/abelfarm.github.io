
// Hàm tải dữ liệu
window.loadData = (ticker) => {
    const tf = document.getElementById('timeframe-select').value;
    const fileName = `./data/${ticker.toUpperCase()}.json`; //_${tf}

    fetch(fileName)
        .then(res => {
            if (!res.ok) throw new Error("Không tìm thấy file " + fileName);
            return res.json();
        })
        .then(data => {
            data.sort((a, b) => (typeof a.time === 'string' ? new Date(a.time) : a.time) - (typeof b.time === 'string' ? new Date(b.time) : b.time));

            // TẠO BIẾN DỮ LIỆU BÊN TRONG KHỐI .THEN
            const candleData = data.map(d => ({
                time: d.time, 
                open: parseFloat(d.open), 
                high: parseFloat(d.high), 
                low: parseFloat(d.low), 
                close: parseFloat(d.close)
            }));

            const volumeData = data.map(d => ({
                time: d.time, 
                value: parseFloat(d.value || d.volume),
                color: d.close >= d.open ? 'rgba(38, 166, 154, 0.5)' : 'rgba(239, 83, 80, 0.5)'
            }));

            // Đưa dữ liệu vào Series
            candlestickSeries.setData(candleData);
            volumeSeries.setData(volumeData);

            // GỌI HÀM CẬP NHẬT LEGEND TẠI ĐÂY (Vì lúc này candleData mới tồn tại)
            const lastCandle = candleData[candleData.length - 1];
            const lastVol = volumeData[volumeData.length - 1].value;
            updateLegend(lastCandle, ticker, lastVol);

            // Lưu vào bộ nhớ (localStorage)
            localStorage.setItem('lastTicker', ticker);
            localStorage.setItem('lastTF', tf);
            
            // --- THAY ĐỔI TẠI ĐÂY: CHỈ HIỂN THỊ 1 NĂM KHI LOAD ---
            if (candleData.length > 0) {
                const lastDate = candleData[candleData.length - 1].time;
                let fromDate;

                // Kiểm tra định dạng thời gian là chuỗi "YYYY-MM-DD" hay timestamp
                if (typeof lastDate === 'string') {
                    const dateObj = new Date(lastDate);
                    dateObj.setFullYear(dateObj.getFullYear() - 1); // Trừ đi 1 năm
                    fromDate = dateObj.toISOString().split('T')[0];
                } else {
                    // Nếu là timestamp (số giây)
                    fromDate = lastDate - (365 * 24 * 60 * 60);
                }

                // Áp dụng vùng hiển thị (Zoom)
                chart.timeScale().setVisibleRange({
                    from: fromDate,
                    to: lastDate,
                });
            }
        })
        .catch(err => alert(err.message));
    
    
};

const legend = document.getElementById('legend');


// Lắng nghe di chuyển chuột
chart.subscribeCrosshairMove(param => {
    const ticker = document.getElementById('stock-input').value || 'CP';

    // Nếu chuột trong vùng biểu đồ
    if (param.time && param.point && param.point.x >= 0) {
        const candle = param.seriesData.get(candlestickSeries);
        const vol = param.seriesData.get(volumeSeries);
        if (candle) updateLegend(candle, ticker, vol ? vol.value : 0);
    } 
    // Nếu chuột ra ngoài, hiện lại nến cuối cùng
    else {
        const allData = candlestickSeries.data();
        if (allData.length > 0) {
            const last = allData[allData.length - 1];
            const allVol = volumeSeries.data();
            const lastVol = allVol.length > 0 ? allVol[allVol.length - 1].value : 0;
            updateLegend(last, ticker, lastVol);
        }
    }
});



// Sự kiện tìm kiếm
document.getElementById('search-btn').onclick = () => {
    loadData(document.getElementById('stock-input').value.trim());
};

// Lấy các phần tử giao diện
const stockInput = document.getElementById('stock-input');
const searchBtn = document.getElementById('search-btn');

// Hàm thực hiện tìm kiếm và hiển thị
function handleSearch() {
    const ticker = stockInput.value.trim().toUpperCase();
    if (ticker) {
        loadData(ticker); // Gọi hàm tải dữ liệu (đã viết ở các bước trước)
        stockInput.blur(); // Ẩn bàn phím/bỏ focus sau khi nhấn Enter
    } else {
        alert("Vui lòng nhập mã cổ phiếu!");
    }
}

// Lắng nghe sự kiện nhấn phím Enter trên ô nhập liệu
stockInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Lắng nghe sự kiện nhấn nút Tìm kiếm
searchBtn.addEventListener('click', handleSearch);

// Khởi tạo mã cũ
const last = localStorage.getItem('lastTicker') || 'VIC';
const lastTF = localStorage.getItem('lastTF') || '1d';
document.getElementById('stock-input').value = last;
document.getElementById('timeframe-select').value = lastTF;
loadData(last);

// Resize
window.onresize = () => chart.applyOptions({ width: container.clientWidth, height: container.clientHeight });