import { useTrading } from '../context/TradingContext';
import { MOCK_STOCKS, INITIAL_BALANCE } from '../lib/mockData';
import { TrendingUp, TrendingDown, DollarSign, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock chart data
const chartData = [
    { name: 'Mon', value: 1000000 },
    { name: 'Tue', value: 1005000 },
    { name: 'Wed', value: 998000 },
    { name: 'Thu', value: 1012000 },
    { name: 'Fri', value: 1025000 },
    { name: 'Sat', value: 1025000 },
    { name: 'Sun', value: 1030000 },
];

export default function Dashboard() {
    const { balance, holdings, stocks } = useTrading();

    // Calculate total portfolio value
    const portfolioValue = Object.entries(holdings).reduce((total, [symbol, holding]) => {
        const stock = stocks.find(s => s.symbol === symbol);
        return total + (stock ? stock.price * holding.quantity : 0);
    }, 0);

    const totalValue = balance + portfolioValue;
    const totalGain = totalValue - INITIAL_BALANCE;
    const totalGainPercent = (totalGain / INITIAL_BALANCE) * 100;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">Welcome back to your trading simulator.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card
                    title="Total Account Value"
                    value={`₹${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                    icon={DollarSign}
                    trend={totalGainPercent}
                />
                <Card
                    title="Cash Balance"
                    value={`₹${balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                    icon={Briefcase}
                />
                <Card
                    title="Portfolio Value"
                    value={`₹${portfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                    icon={TrendingUp}
                />
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold mb-4">Portfolio Performance</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                                formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']}
                            />
                            <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 bg-card rounded-xl border border-border p-6">
                    <h3 className="font-semibold mb-4">Market Overview</h3>
                    <div className="space-y-4">
                        {stocks.slice(0, 5).map(stock => (
                            <Link key={stock.symbol} to={`/market/${stock.symbol}`} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors block">
                                <div>
                                    <div className="font-medium">{stock.symbol}</div>
                                    <div className="text-sm text-muted-foreground">{stock.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">₹{stock.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                                    <div className={`text-sm ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                        <Link to="/market" className="text-primary hover:underline text-sm font-medium">
                            View all stocks &rarr;
                        </Link>
                    </div>
                </div>

                <div className="col-span-3 bg-card rounded-xl border border-border p-6">
                    <h3 className="font-semibold mb-4">Your Holdings</h3>
                    {Object.keys(holdings).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No stocks in portfolio</p>
                            <Link to="/market" className="mt-2 inline-block text-primary hover:underline">
                                Start Trading
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(holdings).slice(0, 5).map(([symbol, holding]) => {
                                const stock = stocks.find(s => s.symbol === symbol);
                                if (!stock) return null;
                                return (
                                    <div key={symbol} className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">{symbol}</div>
                                            <div className="text-sm text-muted-foreground">{holding.quantity} shares</div>
                                        </div>
                                        <div className="font-medium">
                                            ₹{(stock.price * holding.quantity).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function Card({ title, value, icon: Icon, trend }) {
    return (
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{title}</h3>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div className="flex items-center justify-between pt-2">
                <div className="text-2xl font-bold">{value}</div>
                {trend !== undefined && (
                    <div className={`text-xs font-medium flex items-center ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {Math.abs(trend).toFixed(2)}%
                    </div>
                )}
            </div>
        </div>
    );
}
