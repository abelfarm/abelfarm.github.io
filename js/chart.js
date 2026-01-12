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
        
        this.chart.priceScale('volume').applyOptions({
            scaleMargins: { top: 0.8, bottom: 0 }
        });
    }

    render(candles, volumes) {
        this.candleSeries.setData(candles);
        this.volumeSeries.setData(volumes);
        this.chart.timeScale().fitContent();
    }

    // Hàm Zoom 1 năm
    applyZoom(days, data) {
        const data = this.candlestickSeries.data();
        if (!data.length) return;
        const to = data[data.length - 1].time;
        const toDate = (typeof to === 'string') ? new Date(to) : new Date(to * 1000);
        const fromDate = new Date(toDate);
        fromDate.setDate(fromDate.getDate() - days);
        
        const from = (typeof to === 'string') 
            ? fromDate.toISOString().split('T')[0] 
            : Math.floor(fromDate.getTime() / 1000);

        chart.timeScale().setVisibleRange({ from, to });
    }
}