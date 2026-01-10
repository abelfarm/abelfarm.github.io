export class ChartModule {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.chart = LightweightCharts.createChart(this.container, {
            layout: { background: { color: '#131722' }, textColor: '#d1d4dc' },
            grid: { vertLines: { color: '#2a2e39' }, horzLines: { color: '#2a2e39' } },
            crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
            timeScale: { timeVisible: true }
        });
        
        this.candleSeries = this.chart.addCandlestickSeries();
        this.volumeSeries = this.chart.addHistogramSeries({ priceScaleId: 'volume' });
        
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
    zoomOneYear(data) {
        if (!data.length) return;
        const last = data[data.length - 1].time;
        const fromDate = new Date(new Date(last).setFullYear(new Date(last).getFullYear() - 1)).toISOString().split('T')[0];
        this.chart.timeScale().setVisibleRange({ from: fromDate, to: last });
    }
}