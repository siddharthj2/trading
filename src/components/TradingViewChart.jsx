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
    extraLines = [],
}) {
    const chartContainerRef = useRef();
    const chartRef = useRef();
    const seriesRef = useRef();
    const extraLineRefs = useRef([]);

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
            extraLineRefs.current = [];
        };
    }, [chartType, colors, data]);

    // Handle Extra Lines (Buy Price, etc.)
    useEffect(() => {
        if (!seriesRef.current) return;

        // Cleanup old lines
        extraLineRefs.current.forEach(line => {
            try {
                seriesRef.current.removePriceLine(line);
            } catch (e) {
                // Ignore if already removed
            }
        });
        extraLineRefs.current = [];

        // Add new lines
        if (extraLines && extraLines.length > 0) {
            extraLines.forEach(line => {
                const priceLine = seriesRef.current.createPriceLine({
                    price: line.price,
                    color: line.color || '#2962FF',
                    lineWidth: line.lineWidth || 1,
                    lineStyle: line.lineStyle || 0, // Solid
                    axisLabelVisible: true,
                    title: line.title || '',
                });
                extraLineRefs.current.push(priceLine);
            });
        }
    }, [extraLines, data]);

    return (
        <div ref={chartContainerRef} className="w-full h-full relative min-h-[200px]" />
    );
}
