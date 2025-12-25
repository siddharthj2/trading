import { createChart, ColorType, CandlestickSeries, AreaSeries, LineSeries } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

const DEFAULT_COLORS = {
    backgroundColor: 'transparent',
    lineColor: '#2962FF',
    textColor: '#A3A3A3',
    areaTopColor: '#2962FF',
    areaBottomColor: 'rgba(41, 98, 255, 0.28)',
};

export default function TradingViewChart({
    data,
    chartType = 'CANDLE',
    colors = DEFAULT_COLORS,
}) {
    const chartContainerRef = useRef();
    const chartRef = useRef();
    const seriesRef = useRef();

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: colors.backgroundColor },
                textColor: colors.textColor,
            },
            width: chartContainerRef.current.clientWidth || 800,
            height: chartContainerRef.current.clientHeight || 400,
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 0.1)' },
                horzLines: { color: 'rgba(42, 46, 57, 0.1)' },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
        });
        chartRef.current = chart;

        if (chartType === 'CANDLE') {
            seriesRef.current = chart.addSeries(CandlestickSeries, {
                upColor: '#22c55e',
                downColor: '#ef4444',
                borderVisible: false,
                wickUpColor: '#22c55e',
                wickDownColor: '#ef4444',
            });
        } else {
            seriesRef.current = chart.addSeries(LineSeries, {
                color: colors.lineColor,
                lineWidth: 2,
            });
        }

        if (data && data.length > 0) {
            seriesRef.current.setData(data);
            chart.timeScale().fitContent();
        }

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [chartType, colors, data]); // Re-create on data change for simplicity in debug mode

    return (
        <div ref={chartContainerRef} className="w-full h-full relative min-h-[200px]" />
    );
}
