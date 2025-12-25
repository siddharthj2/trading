import { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import TradeForm from './TradeForm';
import { Link } from 'react-router-dom';

export default function Market() {
    const { stocks } = useTrading();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStock, setSelectedStock] = useState(null);

    const filteredStocks = stocks.filter(stock =>
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Market</h2>
                    <p className="text-muted-foreground">Explore and trade Indian stocks.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search stocks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-card border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground uppercase">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Symbol</th>
                                        <th className="px-6 py-3 font-medium">Price</th>
                                        <th className="px-6 py-3 font-medium">Change</th>
                                        <th className="px-6 py-3 font-medium">Sector</th>
                                        <th className="px-6 py-3 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredStocks.map((stock) => (
                                        <tr key={stock.symbol} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <Link to={`/market/${stock.symbol}`} className="block hover:text-primary transition-colors">
                                                    <div className="font-medium">{stock.symbol}</div>
                                                    <div className="text-xs text-muted-foreground">{stock.name}</div>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 font-medium">₹{stock.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                                            <td className={`px-6 py-4 ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                <div className="flex items-center gap-1">
                                                    {stock.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                    {stock.changePercent.toFixed(2)}%
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">{stock.sector}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedStock(stock)}
                                                    className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition-colors"
                                                >
                                                    Trade
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredStocks.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground">
                                No stocks found matching "{searchTerm}"
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    {selectedStock ? (
                        <div className="sticky top-6">
                            <TradeForm stock={selectedStock} onClose={() => setSelectedStock(null)} />
                        </div>
                    ) : (
                        <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground border-dashed">
                            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>Select a stock to start trading</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
