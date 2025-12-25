import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Share2, MoreHorizontal, TrendingUp, Clock, DollarSign, Activity, BarChart2, LineChart as LineIcon, Maximize, Bell, Plus, Calendar, Camera, Crosshair, Type, Scissors, MousePointer2, Smile, Ruler, Maximize2, Magnet, Lock, Eye, Trash2, Pencil } from 'lucide-react';
import { useTrading } from '../context/TradingContext';
import TradingViewChart from './TradingViewChart';
import OptionsChain from './OptionsChain';
import TradeForm from './TradeForm';
import { cn } from '../lib/utils';
import { SMA, EMA } from 'technicalindicators';
import IndicatorsModal from './IndicatorsModal';
import { generateOptionChain } from '../lib/optionsUtils';

const TOOLBAR_ITEMS = [
    { id: 'cursor', icon: Crosshair, label: 'Crosshair' },
    { id: 'trend', icon: TrendingUp, label: 'Horizontal Line' },
    { id: 'fib', icon: BarChart2, label: 'Fib Retracement' },
    { id: 'brush', icon: Pencil, label: 'Brush' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'patterns', icon: Scissors, label: 'Patterns' },
    { id: 'prediction', icon: MousePointer2, label: 'Prediction' },
    { id: 'icons', icon: Smile, label: 'Icons' },
    { id: 'measure', icon: Ruler, label: 'Measure' },
    { id: 'zoom', icon: Maximize2, label: 'Zoom' },
    { id: 'magnet', icon: Magnet, label: 'Magnet' },
    { id: 'lock', icon: Lock, label: 'Lock All' },
    { id: 'visibility', icon: Eye, label: 'Hide All' },
    { id: 'delete', icon: Trash2, label: 'Remove Objects' },
];

export default function StockDetail() {
    const { symbol } = useParams();
    const navigate = useNavigate();
    const { stocks, holdings } = useTrading();
    const stock = stocks.find(s => s.symbol === symbol);

    const [timeframe, setTimeframe] = useState('1D');
    const [chartType, setChartType] = useState('CANDLE');
    const [activeTab, setActiveTab] = useState('CHART');
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [showSellModal, setShowSellModal] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [optionChain, setOptionChain] = useState([]);
    const [activeTool, setActiveTool] = useState('cursor');
    const [drawings, setDrawings] = useState([]);
    const [userMarkers, setUserMarkers] = useState([]);
    const [showDrawings, setShowDrawings] = useState(true);
    const [showIndicatorsModal, setShowIndicatorsModal] = useState(false);
    const [indicators, setIndicators] = useState([]);
    const [indicatorsData, setIndicatorsData] = useState([]);
    const [fullscreen, setFullscreen] = useState(false);

    const handleToolSelect = (toolId) => {
        if (toolId === 'delete') {
            setDrawings([]);
            setUserMarkers([]);
            setActiveTool('cursor');
            return;
        }
        if (toolId === 'visibility') {
            setShowDrawings(!showDrawings);
            setActiveTool('cursor');
            return;
        }
        if (['fib', 'brush', 'patterns', 'prediction', 'icons', 'measure', 'zoom', 'magnet', 'lock'].includes(toolId)) {
            alert(`The ${toolId} tool is not supported in this lightweight version.`);
            setActiveTool('cursor');
            return;
        }
        setActiveTool(toolId);
    };

    const handleChartClick = (params) => {
        if (!showDrawings) return;

        if (activeTool === 'trend') {
            setDrawings(prev => [
                ...prev,
                {
                    price: params.price,
                    color: '#2962FF',
                    lineWidth: 2,
                    lineStyle: 0,
                    title: 'Line'
                }
            ]);
            setActiveTool('cursor');
        } else if (activeTool === 'text') {
            setUserMarkers(prev => [
                ...prev,
                {
                    time: params.time,
                    position: 'aboveBar',
                    color: '#EAB308',
                    shape: 'arrowDown',
                    text: 'Note',
                    size: 2
                }
            ]);
            setActiveTool('cursor');
        }
    };

    const handleAddIndicator = (indicator) => {
        setIndicators(prev => [...prev, indicator]);
    };

    useEffect(() => {
        if (chartData.length === 0 || indicators.length === 0) {
            setIndicatorsData([]);
            return;
        }

        const newIndicatorsData = indicators.map(ind => {
            const values = chartData.map(d => d.close);
            let result = [];

            if (ind.id === 'SMA') {
                result = SMA.calculate({ period: ind.params.period, values });
            } else if (ind.id === 'EMA') {
                result = EMA.calculate({ period: ind.params.period, values });
            }

            // Align result with chartData (technicalindicators returns fewer points)
            const diff = chartData.length - result.length;
            const alignedData = result.map((val, i) => ({
                time: chartData[i + diff].time,
                value: val
            }));

            return {
                id: ind.instanceId,
                name: `${ind.name} (${ind.params.period})`,
                color: ind.params.color,
                data: alignedData
            };
        });

        setIndicatorsData(newIndicatorsData);
    }, [chartData, indicators]);

    const [range, setRange] = useState('1D');

    // Map timeframe to seconds
    const TIMEFRAME_SECONDS = {
        '1m': 60,
        '5m': 300,
        '15m': 900,
        '1h': 3600,
        '4h': 14400,
        'D': 86400,
        'W': 604800,
        'M': 2592000
    };

    const RANGE_CONFIG = {
        '1D': { timeframe: '5m', candles: 288 },   // 24h * 12
        '5D': { timeframe: '15m', candles: 480 },  // 5d * 24h * 4
        '1M': { timeframe: '1h', candles: 720 },   // 30d * 24h
        '3M': { timeframe: '4h', candles: 540 },   // 90d * 6
        '6M': { timeframe: 'D', candles: 180 },    // 180d
        'YTD': { timeframe: 'D', candles: 250 },   // Approx
        '1Y': { timeframe: 'D', candles: 365 },    // 365d
        '5Y': { timeframe: 'W', candles: 260 },    // 5y * 52w
        'ALL': { timeframe: 'M', candles: 120 }    // 10y
    };

    const handleRangeSelect = (newRange) => {
        setRange(newRange);
        const config = RANGE_CONFIG[newRange];
        if (config) {
            setTimeframe(config.timeframe);
        }
    };

    useEffect(() => {
        if (!stock) return;

        // Mock Data Generation based on Timeframe
        const data = [];
        let price = stock.price;
        const interval = TIMEFRAME_SECONDS[timeframe] || 300;

        // Determine number of candles based on range or default to 100
        const candleCount = RANGE_CONFIG[range]?.candles || 100;

        let currentTime = Math.floor(Date.now() / 1000) - (candleCount * interval);
        const isOption = stock.type === 'OPTION';

        for (let i = 0; i < candleCount; i++) {
            const volatility = isOption ? 0.8 : 0.3;
            // Adjust volatility for larger timeframes to make charts look realistic
            const volMultiplier = Math.sqrt(interval / 300);
            const change = ((Math.random() * (volatility * 2)) - volatility) * volMultiplier;

            const close = price * (1 + change / 100);
            const high = Math.max(price, close) * (1 + (Math.random() * 0.2 * volMultiplier) / 100);
            const low = Math.min(price, close) * (1 - (Math.random() * 0.2 * volMultiplier) / 100);
            const volume = Math.floor(Math.random() * 50000) + 10000;

            data.push({
                time: currentTime,
                value: close,
                open: price,
                close: close,
                high: high,
                low: low,
                volume: volume
            });

            price = close;
            currentTime += interval;
        }
        setChartData(data);
    }, [stock?.symbol, timeframe, range]);

    // Sync Chart with Live Global Data
    useEffect(() => {
        if (!stock || chartData.length === 0) return;

        setChartData(prevData => {
            const lastCandle = prevData[prevData.length - 1];
            const currentPrice = stock.price;

            // Update the last candle
            const updatedCandle = {
                ...lastCandle,
                close: currentPrice,
                high: Math.max(lastCandle.high, currentPrice),
                low: Math.min(lastCandle.low, currentPrice),
                value: currentPrice
            };

            const newData = [...prevData];
            newData[newData.length - 1] = updatedCandle;
            return newData;
        });
    }, [stock?.price]);

    useEffect(() => {
        if (stock && stock.type === 'INDEX') {
            setOptionChain(generateOptionChain(stock.price, stock.symbol));
        }
    }, [stock?.price, stock?.symbol]);

    if (!stock) {
        return <div className="p-8 text-center">Asset not found</div>;
    }

    const handleOptionSelect = (option) => {
        navigate(`/market/${option.symbol}`);
    };

    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setFullscreen(false);
            }
        }
    };

    const handleScreenshot = () => {
        alert("Screenshot saved to clipboard!");
    };

    // Calculate Avg Buy Price if holding
    const holding = holdings[stock.symbol] || { quantity: 0, avgPrice: 0 };
    const currentHolding = holding.quantity;
    const avgPrice = holding.avgPrice;

    const markers = []; // Define base markers

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] -m-6 md:-m-8 bg-background text-foreground">
            {/* Top Toolbar (TradingView Style) */}
            <div className="flex items-center justify-between px-2 py-1 border-b border-border bg-card">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-md text-muted-foreground">
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    {/* Symbol Info */}
                    <div className="flex items-center gap-2 px-2 border-r border-border mr-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                            {stock.symbol[0]}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm leading-none">{stock.symbol}</span>
                            <span className="text-[10px] text-muted-foreground">{stock.type}</span>
                        </div>
                    </div>

                    {/* Timeframes */}
                    <div className="hidden md:flex items-center gap-0.5">
                        {['1m', '5m', '15m', '1h', '4h', 'D', 'W', 'M'].map((tf) => (
                            <button
                                key={tf}
                                onClick={() => { setTimeframe(tf); setRange(''); }}
                                className={cn("px-2 py-1.5 text-xs font-medium rounded hover:bg-muted transition-colors", timeframe === tf ? "text-primary bg-primary/10" : "text-muted-foreground")}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-6 bg-border mx-2 hidden md:block"></div>

                    {/* Chart Types */}
                    <div className="flex items-center gap-0.5">
                        <button onClick={() => setChartType('CANDLE')} className={cn("p-1.5 rounded hover:bg-muted", chartType === 'CANDLE' && "text-primary bg-primary/10")}><BarChart2 className="w-4 h-4" /></button>
                        <button onClick={() => setChartType('LINE')} className={cn("p-1.5 rounded hover:bg-muted", chartType === 'LINE' && "text-primary bg-primary/10")}><LineIcon className="w-4 h-4" /></button>
                        <button onClick={() => setChartType('AREA')} className={cn("p-1.5 rounded hover:bg-muted", chartType === 'AREA' && "text-primary bg-primary/10")}><Activity className="w-4 h-4" /></button>
                    </div>

                    <div className="w-px h-6 bg-border mx-2 hidden md:block"></div>

                    {/* Tools */}
                    <button
                        onClick={() => setShowIndicatorsModal(true)}
                        className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted rounded hidden md:flex"
                    >
                        <Settings className="w-4 h-4" /> Indicators
                    </button>
                    <button className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted rounded hidden md:flex">
                        <Bell className="w-4 h-4" /> Alert
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {stock.type === 'INDEX' && (
                        <div className="flex bg-muted rounded-md p-0.5 mr-2">
                            <button onClick={() => setActiveTab('CHART')} className={cn("px-3 py-1 text-xs font-medium rounded-sm transition-all", activeTab === 'CHART' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}>Chart</button>
                            <button onClick={() => setActiveTab('OPTIONS')} className={cn("px-3 py-1 text-xs font-medium rounded-sm transition-all", activeTab === 'OPTIONS' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}>Options</button>
                        </div>
                    )}
                    <button className="p-2 hover:bg-muted rounded text-muted-foreground"><Settings className="w-5 h-5" /></button>
                    <button onClick={handleFullscreen} className="p-2 hover:bg-muted rounded text-muted-foreground hidden md:block">
                        {fullscreen ? <Maximize2 className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </button>
                    <button onClick={handleScreenshot} className="p-2 hover:bg-muted rounded text-muted-foreground hidden md:block"><Camera className="w-5 h-5" /></button>
                    <button className="bg-primary text-primary-foreground px-4 py-1.5 rounded text-xs font-bold">Publish</button>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* Left Sidebar (Drawing Tools) */}
                {activeTab === 'CHART' && (
                    <div className="w-14 border-r border-border bg-card flex flex-col items-center py-4 gap-4 overflow-y-auto no-scrollbar z-20 hidden md:flex">
                        {TOOLBAR_ITEMS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleToolSelect(item.id)}
                                className={cn("p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-colors relative group", activeTool === item.id && "bg-primary/10 text-primary")}
                                title={item.label}
                            >
                                <item.icon size={20} strokeWidth={1.5} />
                                {/* Tooltip */}
                                <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50 shadow-md border border-border">
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Center Chart Area */}
                <div className="flex-1 relative bg-background flex flex-col">
                    {activeTab === 'CHART' ? (
                        <>
                            {/* OHLC Header Overlay */}
                            <div className="absolute top-2 left-2 z-10 flex flex-col pointer-events-none">
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-lg font-bold">{stock.symbol}</h2>
                                    <span className="text-xs text-muted-foreground">{timeframe} · NSE</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-mono mt-1">
                                    <span className="text-green-500">O {stock.open.toFixed(2)}</span>
                                    <span className="text-red-500">H {stock.high.toFixed(2)}</span>
                                    <span className="text-red-500">L {stock.low.toFixed(2)}</span>
                                    <span className={stock.change >= 0 ? "text-green-500" : "text-red-500"}>C {stock.price.toFixed(2)}</span>
                                    <span className={stock.change >= 0 ? "text-green-500" : "text-red-500"}>{stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)</span>
                                </div>
                            </div>

                            {/* Floating Buy/Sell Buttons */}
                            <div className="absolute top-16 left-2 z-10 flex flex-col gap-1">
                                <div className="flex rounded-md overflow-hidden shadow-md border border-border bg-card">
                                    <button onClick={() => setShowSellModal(true)} className="flex flex-col items-start px-3 py-1.5 bg-card hover:bg-red-500/10 transition-colors group border-r border-border">
                                        <span className="text-[10px] font-bold text-red-500 group-hover:text-red-600">Sell</span>
                                        <span className="text-sm font-mono text-red-500 group-hover:text-red-600">{(stock.price * 0.9995).toFixed(2)}</span>
                                    </button>
                                    <div className="flex flex-col items-center justify-center px-1 bg-card text-xs text-muted-foreground">
                                        <span>0.05</span>
                                    </div>
                                    <button onClick={() => setShowBuyModal(true)} className="flex flex-col items-end px-3 py-1.5 bg-card hover:bg-green-500/10 transition-colors group border-l border-border">
                                        <span className="text-[10px] font-bold text-green-500 group-hover:text-green-600">Buy</span>
                                        <span className="text-sm font-mono text-green-500 group-hover:text-green-600">{(stock.price * 1.0005).toFixed(2)}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 w-full h-full pb-8">
                                <TradingViewChart
                                    data={chartData}
                                    chartType={chartType}
                                    markers={showDrawings ? [...markers, ...userMarkers] : markers}
                                    avgBuyPrice={currentHolding > 0 ? avgPrice : null}
                                    positionQty={currentHolding}
                                    extraLines={showDrawings ? drawings : []}
                                    indicatorsData={indicatorsData}
                                    onChartClick={handleChartClick}
                                />
                            </div>

                            {/* Bottom Time Range Selector */}
                            <div className="h-8 border-t border-border flex items-center justify-center gap-1 bg-card px-4">
                                {['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'ALL'].map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => handleRangeSelect(r)}
                                        className={cn(
                                            "px-2 py-0.5 text-[10px] font-bold rounded transition-colors",
                                            range === r ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-muted"
                                        )}
                                    >
                                        {r}
                                    </button>
                                ))}
                                <div className="w-px h-4 bg-border mx-2"></div>
                                <button className="px-2 py-0.5 text-[10px] font-bold text-muted-foreground hover:text-primary hover:bg-muted rounded transition-colors flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Go to...
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="absolute inset-0 overflow-auto pb-20">
                            <OptionsChain chain={optionChain} onSelectOption={handleOptionSelect} />
                        </div>
                    )}
                </div>

                {/* Right Sidebar (Order Panel - Desktop) */}
                <div className="hidden md:flex w-72 border-l border-border bg-card flex-col">
                    <div className="p-3 border-b border-border flex items-center justify-between shrink-0">
                        <span className="font-bold text-sm">Watchlist</span>
                        <Plus className="w-4 h-4 text-muted-foreground cursor-pointer" />
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0 no-scrollbar">
                        {/* Mock Watchlist */}
                        {stocks.slice(0, 8).map(s => (
                            <div key={s.symbol} onClick={() => navigate(`/market/${s.symbol}`)} className="flex justify-between items-center p-3 hover:bg-muted/50 cursor-pointer border-b border-border/50">
                                <div>
                                    <div className="text-xs font-bold">{s.symbol}</div>
                                    <div className="text-[10px] text-muted-foreground">{s.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className={cn("text-xs font-medium", s.change >= 0 ? "text-green-500" : "text-red-500")}>{s.price.toFixed(2)}</div>
                                    <div className={cn("text-[10px]", s.change >= 0 ? "text-green-500" : "text-red-500")}>{s.changePercent.toFixed(2)}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 border-t border-border bg-muted/20 shrink-0 overflow-y-auto max-h-[50vh]">
                        <TradeForm stock={stock} compact={true} />
                    </div>
                </div>
            </div>

            {/* Bottom Bar (Mobile Only) */}
            <div className="md:hidden h-14 border-t border-border bg-card px-4 flex items-center gap-4 z-20">
                <button
                    onClick={() => setShowSellModal(true)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-lg transition-colors text-sm"
                >
                    Sell
                </button>
                <button
                    onClick={() => setShowBuyModal(true)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition-colors text-sm"
                >
                    Buy
                </button>
            </div>

            {/* Mobile Trade Modals */}
            {(showBuyModal || showSellModal) && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-end md:hidden">
                    <div className="bg-card w-full rounded-t-xl p-4 animate-in slide-in-from-bottom duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">{showBuyModal ? 'Buy' : 'Sell'} {stock.symbol}</h2>
                            <button onClick={() => { setShowBuyModal(false); setShowSellModal(false); }} className="p-2">✕</button>
                        </div>
                        <TradeForm stock={stock} defaultType={showBuyModal ? 'BUY' : 'SELL'} />
                    </div>
                </div>
            )}

            <IndicatorsModal
                isOpen={showIndicatorsModal}
                onClose={() => setShowIndicatorsModal(false)}
                onAddIndicator={handleAddIndicator}
            />
        </div>
    );
}
