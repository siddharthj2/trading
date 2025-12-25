import { useTrading } from '../context/TradingContext';
import { PieChart, History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function Portfolio() {
    const { holdings, transactions, balance, stocks, resetAccount } = useTrading();

    console.log("Portfolio State:", { holdings, transactions, balance });

    if (!holdings) {
        return <div className="p-8 text-center">Loading portfolio...</div>;
    }

    const portfolioItems = Object.entries(holdings).map(([symbol, holding]) => {
        const stock = stocks.find(s => s.symbol === symbol);
        const quantity = holding?.quantity || 0;
        const price = stock?.price || 0;
        return {
            symbol,
            qty: quantity,
            stock,
            currentValue: price * quantity
        };
    });

    const totalPortfolioValue = portfolioItems.reduce((acc, item) => acc + item.currentValue, 0);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Portfolio</h2>
                    <p className="text-muted-foreground">Manage your investments and view history.</p>
                </div>
                <button
                    onClick={() => {
                        if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
                            resetAccount();
                            window.location.reload();
                        }
                    }}
                    className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-md text-sm font-medium transition-colors"
                >
                    Reset Data
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Equity</h3>
                    <div className="text-2xl font-bold">₹{(totalPortfolioValue + balance).toLocaleString()}</div>
                </div>
                <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Invested Amount</h3>
                    <div className="text-2xl font-bold">₹{totalPortfolioValue.toLocaleString()}</div>
                </div>
                <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Available Cash</h3>
                    <div className="text-2xl font-bold">₹{balance.toLocaleString()}</div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-semibold">Current Holdings</h3>
                    </div>

                    {portfolioItems.length === 0 ? (
                        <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
                            No active holdings.
                        </div>
                    ) : (
                        <div className="bg-card rounded-xl border border-border overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground uppercase">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Stock</th>
                                        <th className="px-4 py-3 font-medium text-right">Qty</th>
                                        <th className="px-4 py-3 font-medium text-right">Value</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {portfolioItems.map((item) => (
                                        <tr key={item.symbol} className="hover:bg-muted/50">
                                            <td className="px-4 py-3 font-medium">{item.symbol}</td>
                                            <td className="px-4 py-3 text-right">{item.qty}</td>
                                            <td className="px-4 py-3 text-right">₹{item.currentValue.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-semibold">Recent Transactions</h3>
                    </div>

                    {transactions.length === 0 ? (
                        <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
                            No transactions yet.
                        </div>
                    ) : (
                        <div className="bg-card rounded-xl border border-border overflow-hidden">
                            <div className="max-h-[400px] overflow-y-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-muted-foreground uppercase sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Action</th>
                                            <th className="px-4 py-3 font-medium">Stock</th>
                                            <th className="px-4 py-3 font-medium">Order Type</th>
                                            <th className="px-4 py-3 font-medium text-right">Price</th>
                                            <th className="px-4 py-3 font-medium text-right">Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {transactions.map((tx, i) => (
                                            <tr key={i} className="hover:bg-muted/50">
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${tx.type === 'BUY'
                                                        ? 'bg-green-500/10 text-green-500'
                                                        : 'bg-red-500/10 text-red-500'
                                                        }`}>
                                                        {tx.type === 'BUY' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                                        {tx.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-medium">{tx.symbol}</td>
                                                <td className="px-4 py-3 text-xs font-medium text-muted-foreground">
                                                    {tx.orderType === 'INTRADAY' ? 'MIS (Intraday)' : 'CNC (Delivery)'}
                                                </td>
                                                <td className="px-4 py-3 text-right">₹{tx.price.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-right">{tx.qty}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
