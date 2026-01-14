export class ChartModule {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        
        // Kiểm tra xem thư viện đã sẵn sàng chưa
        if (typeof LightweightCharts === 'undefined') {
            console.error("Thư viện LightweightCharts chưa được tải!");
            return;
        }

        this.chart = LightweightCharts.createChart(this.container, {
            layout: { 
                            background: { color: '#131722' }, 
                            textColor: '#d1d4dc' 
                        },
            grid: { 
                vertLines: { color: '#2a2e39' }, 
                horzLines: { color: '#2a2e39' } 
            },            
            crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
            timeScale: { 
                timeVisible: true, 
                secondsVisible: false 
            }
        });
        
        this.candleSeries = this.chart.addCandlestickSeries({
            upColor: '#26a69a', 
            downColor: '#ef5350', 
            borderVisible: false,
            wickUpColor: '#26a69a', 
            wickDownColor: '#ef5350'
        });
        this.volumeSeries = this.chart.addHistogramSeries({
            priceFormat: { type: 'volume' },
            priceScaleId: 'volume'
        });
        
        // TĂNG KHÔNG GIAN CHO VOLUME
        this.chart.priceScale('volume').applyOptions({
            scaleMargins: {
                // top: 0.7 nghĩa là Volume bắt đầu từ khoảng 70% độ cao tính từ đỉnh xuống
                // (để lại 30% độ cao cho Volume). 
                // Nếu muốn to nữa, hãy giảm số này xuống (ví dụ 0.5 là chiếm nửa màn hình)
                top: 0.6, 
                bottom: 0, // Sát đáy
            },
        });

        // ĐỒNG THỜI GIẢM KHÔNG GIAN NẾN (để nến không đè lên Volume quá nhiều)
        this.candleSeries.priceScale().applyOptions({
            scaleMargins: {
                top: 0.1,    // Cách đỉnh 10%
                bottom: 0.4, // Cách đáy 40% (chừa chỗ này cho Volume hiện rõ)
            },
        });

        // TẠO CÁC BIẾN LƯU TRỮ DỮ LIỆU
        this.candleData = [];
        this.volumeData = [];
    }

    render(candles, volumes) {

        // LƯU DỮ LIỆU VÀO CLASS ĐỂ DÙNG CHO CÁC HÀM KHÁC (NHƯ ZOOM)
        this.candleData = candles;
        this.volumeData = volumes; 

        // Đẩy dữ liệu lên biểu đồ
        this.candleSeries.setData(candles);
        this.volumeSeries.setData(volumes);
        
        // MẸO: Tự động resize và fit nội dung ngay sau khi render
        // để tránh lỗi biểu đồ trắng xóa do chưa có kích thước
        requestAnimationFrame(() => {
            this.chart.timeScale().fitContent();
            this.resize(); 
        });
    }

    // Hàm Zoom 90DAYS
    applyZoom(days) {
        // Khi zoom, chúng ta thường dựa vào mốc thời gian của Nến
        const data = this.candleData; 
        
        if (!data || !data.length) return;

        const to = data[data.length - 1].time;
        const isString = typeof to === 'string';
        
        const toDate = isString ? new Date(to) : new Date(to * 1000);
        const fromDate = new Date(toDate);
        fromDate.setDate(fromDate.getDate() - days);
        
        let from = isString 
            ? fromDate.toISOString().split('T')[0] 
            : Math.floor(fromDate.getTime() / 1000);

        this.chart.timeScale().setVisibleRange({ from, to });
    }

    // Ví dụ: Hàm lấy thông tin tại một điểm bất kỳ nếu cần
    getStatistics() {
        return {
            totalCandles: this.candleData.length,
            totalVolume: this.volumeData.reduce((sum, v) => sum + v.value, 0)
        };
    }
    // js/chart.js
    resize() {
        this.chart.applyOptions({
            width: this.container.clientWidth,
            height: this.container.clientHeight
        });
        this.chart.timeScale().fitContent(); // Tự động co giãn để thấy hết nến
    }
}