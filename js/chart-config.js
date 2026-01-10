// Khai báo biến toàn cục để các file khác có thể truy cập
let chart, candlestickSeries, volumeSeries;

document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra xem thư viện đã sẵn sàng chưa
    if (typeof LightweightCharts === 'undefined') {
        console.error("Thư viện LightweightCharts chưa được tải!");
        return;
    }

    const container = document.getElementById('chart-container');
    
    // Khởi tạo biểu đồ
    chart = LightweightCharts.createChart(container, {
        layout: { 
            background: { color: '#131722' }, 
            textColor: '#d1d4dc' 
        },
        grid: { 
            vertLines: { color: '#2a2e39' }, 
            horzLines: { color: '#2a2e39' } 
        },
        timeScale: { 
            timeVisible: true, 
            secondsVisible: false 
        }
    });

    // Tạo series nến
    const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a', 
        downColor: '#ef5350', 
        borderVisible: false,
        wickUpColor: '#26a69a', 
        wickDownColor: '#ef5350'
    });

    // Tạo series volume
    const volumeSeries = chart.addHistogramSeries({
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
    });

    // Cấu hình scale cho Volume
    chart.priceScale('volume').applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
        visible: false
    });

});