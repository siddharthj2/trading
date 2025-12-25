import { useState, useEffect } from 'react';
import { useTrading } from '../context/TradingContext';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function TradeForm({ stock, onClose, compact = false, defaultType = 'BUY' }) {
    const { buyStock, sellStock, balance, holdings } = useTrading();
    const [quantity, setQuantity] = useState(1);
    const [type, setType] = useState(defaultType); // 'BUY' or 'SELL'
    const [orderType, setOrderType] = useState('DELIVERY'); // 'DELIVERY' or 'INTRADAY'

    // Reset state when stock changes
    useEffect(() => {
        setQuantity(1);
        setType(defaultType);
    }, [stock.symbol, defaultType]);

    const currentHolding = holdings[stock.symbol] || { quantity: 0, avgPrice: 0 };
    const holdingQty = currentHolding.quantity || 0;
    const avgBuyPrice = currentHolding.avgPrice || 0;

    const totalCost = stock.price * quantity;
    const requiredMargin = orderType === 'INTRADAY' && type === 'BUY' ? totalCost * 0.2 : totalCost;

    // Calculate P&L for Sell
    const pnl = (stock.price - avgBuyPrice) * quantity;
    const isProfit = pnl >= 0;

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log("Submitting trade:", { type, stock: stock.symbol, quantity, orderType });

        // Simulate a small delay to show feedback
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            if (type === 'BUY') {
                buyStock(stock.symbol, stock.price, quantity, orderType);
                toast.success(`Bought ${quantity} ${stock.symbol} at ₹${stock.price.toFixed(2)}`);
            } else {
                sellStock(stock.symbol, stock.price, quantity, orderType);
                const pnlText = pnl >= 0 ? `Profit: ₹${pnl.toFixed(2)}` : `Loss: ₹${Math.abs(pnl).toFixed(2)}`;
                toast.success(`Sold ${quantity} ${stock.symbol}`, {
                    description: pnlText
                });
            }
            if (onClose) onClose();
        } catch (err) {
            console.error("Trade error:", err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("bg-card border border-border", compact ? "p-3 border-0" : "p-6 rounded-xl")}>
            {!compact && (
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Trade {stock.symbol}</h3>
                    <div className="text-sm text-muted-foreground">
                        Current Price: <span className="text-foreground font-medium">₹{stock.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                </div>
            )}

            <div className="flex gap-2 mb-4 p-1 bg-muted rounded-lg">
                <button
                    type="button"
                    onClick={() => setType('BUY')}
                    className={cn(
                        "flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all",
                        type === 'BUY'
                            ? "bg-green-500 text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Buy
                </button>
                <button
                    type="button"
                    onClick={() => setType('SELL')}
                    className={cn(
                        "flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all",
                        type === 'SELL'
                            ? "bg-red-500 text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Sell
                </button>
            </div>

            <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="orderType"
                        checked={orderType === 'DELIVERY'}
                        onChange={() => setOrderType('DELIVERY')}
                        className="accent-primary w-3 h-3"
                    />
                    <span className="text-xs font-medium">Delivery</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        name="orderType"
                        checked={orderType === 'INTRADAY'}
                        onChange={() => setOrderType('INTRADAY')}
                        className="accent-primary w-3 h-3"
                    />
                    <span className="text-xs font-medium">Intraday (5x)</span>
                </label>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">Quantity</label>
                    <div className="relative">
                        <input
                            type="number"
                            min="1"
                            max={type === 'SELL' ? holdingQty : Math.floor(balance / stock.price)}
                            value={quantity}
                            onChange={(e) => {
                                let val = parseInt(e.target.value) || 0;
                                if (type === 'SELL' && val > holdingQty) {
                                    val = holdingQty;
                                }
                                setQuantity(val);
                            }}
                            className="w-full px-3 py-1.5 bg-background border border-input rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                if (type === 'BUY') {
                                    const maxBuy = Math.floor(balance / (orderType === 'INTRADAY' ? stock.price * 0.2 : stock.price));
                                    setQuantity(Math.max(1, maxBuy));
                                } else {
                                    setQuantity(Math.max(1, holdingQty));
                                }
                            }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary hover:bg-primary/10 px-1.5 py-0.5 rounded transition-colors"
                        >
                            MAX
                        </button>
                    </div>
                    {type === 'SELL' && (
                        <div className="text-[10px] text-muted-foreground mt-1 text-right">
                            Available: {holdingQty}
                        </div>
                    )}
                </div>

                <div className="space-y-1 text-xs mt-2">
                    {type === 'BUY' ? (
                        <>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Margin Req.</span>
                                <span className="font-medium text-foreground">₹{(requiredMargin || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Available</span>
                                <span className="font-medium text-foreground">₹{(balance || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Avg. Buy Price</span>
                                <span className="font-medium text-foreground">₹{(avgBuyPrice || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-border mt-2">
                                <span className="text-muted-foreground font-medium">Est. P&L</span>
                                <span className={cn("font-bold", isProfit ? "text-green-500" : "text-red-500")}>
                                    {isProfit ? '+' : ''}₹{(pnl || 0).toFixed(2)}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={cn(
                        "w-full py-2.5 text-sm font-bold rounded transition-colors flex items-center justify-center gap-2",
                        type === 'BUY'
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-red-500 text-white hover:bg-red-600",
                        loading && "opacity-70 cursor-not-allowed"
                    )}
                >
                    {loading ? "Processing..." : `${type} ${stock.symbol}`}
                </button>
            </form>
        </div>
    );
}
