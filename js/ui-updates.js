// ĐỊNH NGHĨA HÀM ZOOM VÀO ĐỐI TƯỢNG WINDOW ĐỂ HTML GỌI ĐƯỢC
window.applyRange = (days) => {
    const data = candlestickSeries.data();
    if (!data.length) return;
    const to = data[data.length - 1].time;
    const toDate = (typeof to === 'string') ? new Date(to) : new Date(to * 1000);
    const fromDate = new Date(toDate);
    fromDate.setDate(fromDate.getDate() - days);
    
    const from = (typeof to === 'string') 
        ? fromDate.toISOString().split('T')[0] 
        : Math.floor(fromDate.getTime() / 1000);

    chart.timeScale().setVisibleRange({ from, to });
};

window.applyFullRange = () => chart.timeScale().fitContent();


// Hàm hiển thị thông tin lên Legend
function updateLegend(candle, ticker, volumeValue) {
    if (!candle) return;
    
    // Hiển thị legend nếu lỡ bị ẩn
    legend.style.display = 'block'; 

    const isUp = candle.close >= candle.open;
    const colorStyle = isUp ? 'color: #26a69a;' : 'color: #ef5350;';
    const change = (candle.close - candle.open).toFixed(2);
    const percent = ((change / candle.open) * 100).toFixed(2);
    const sign = change > 0 ? '+' : '';
    
    // Lấy tên mã cổ phiếu từ input hoặc mặc định
    const displayName = ticker || "N/A";

    legend.innerHTML = `
        <div style="font-size: 20px; font-weight: bold; margin-bottom: 5px; ${colorStyle}">
            ${displayName.toUpperCase()} 
            <span style="font-size: 14px; font-weight: normal;">${sign}${percent}%</span>
        </div>
        <div style="color: #848e9c; font-size: 12px; margin-bottom: 5px;">
            ${candle.time}
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px 10px; font-size: 13px;">
            <div>O: <span style="color: #d1d4dc">${candle.open}</span></div>
            <div>H: <span style="color: #d1d4dc">${candle.high}</span></div>
            <div>L: <span style="color: #d1d4dc">${candle.low}</span></div>
            <div>C: <span style="color: #d1d4dc">${candle.close}</span></div>
        </div>
        <div style="margin-top: 5px; font-size: 12px; color: #848e9c;">
            Vol: <span style="color: #d1d4dc">${(volumeValue / 1000000).toFixed(2)}M</span>
        </div>
    `;
}
