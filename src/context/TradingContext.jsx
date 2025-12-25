import { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_BALANCE, MOCK_STOCKS as INITIAL_STOCKS } from '../lib/mockData';

const TradingContext = createContext();

export function TradingProvider({ children }) {
    const [stocks, setStocks] = useState(INITIAL_STOCKS);
    const [balance, setBalance] = useState(() => {
        const saved = localStorage.getItem('trading_balance');
        const parsed = saved ? parseFloat(saved) : INITIAL_BALANCE;
        return isNaN(parsed) ? INITIAL_BALANCE : parsed;
    });

    const [holdings, setHoldings] = useState(() => {
        try {
            const saved = localStorage.getItem('trading_holdings');
            const parsed = saved ? JSON.parse(saved) : {};

            // Ensure parsed is a valid object (not null)
            if (!parsed || typeof parsed !== 'object') return {};

            // Migration: Convert old number format to object format
            const migrated = {};
            Object.entries(parsed).forEach(([symbol, value]) => {
                if (typeof value === 'number') {
                    migrated[symbol] = { quantity: value, avgPrice: 0 };
                } else if (typeof value === 'object' && value !== null) {
                    migrated[symbol] = value;
                }
            });
            return migrated;
        } catch (e) {
            console.error("Failed to parse holdings:", e);
            return {};
        }
    });

    const [transactions, setTransactions] = useState(() => {
        try {
            const saved = localStorage.getItem('trading_transactions');
            const parsed = saved ? JSON.parse(saved) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error("Failed to parse transactions:", e);
            return [];
        }
    });

    // Simulate live market updates
    useEffect(() => {
        const interval = setInterval(() => {
            setStocks(currentStocks =>
                currentStocks.map(stock => {
                    // Random movement between -0.2% and +0.2%
                    const changePercent = (Math.random() * 0.4) - 0.2;
                    const newPrice = stock.price * (1 + changePercent / 100);
                    return {
                        ...stock,
                        price: newPrice,
                        change: newPrice - stock.open,
                        changePercent: ((newPrice - stock.open) / stock.open) * 100
                    };
                })
            );
        }, 1000); // Update every 1 second

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        localStorage.setItem('trading_balance', balance.toString());
        localStorage.setItem('trading_holdings', JSON.stringify(holdings));
        localStorage.setItem('trading_transactions', JSON.stringify(transactions));
    }, [balance, holdings, transactions]);

    const buyStock = (symbol, price, quantity, type = 'DELIVERY') => {
        const cost = price * quantity;
        // Intraday margin: 20% (5x leverage)
        const requiredMargin = type === 'INTRADAY' ? cost * 0.2 : cost;

        if (requiredMargin > balance) {
            throw new Error(`Insufficient funds. Required: ₹${requiredMargin.toFixed(2)}`);
        }

        setBalance(prev => prev - requiredMargin);
        setHoldings(prev => {
            const current = prev[symbol] || { quantity: 0, avgPrice: 0 };
            const newQuantity = current.quantity + quantity;
            const newAvgPrice = ((current.quantity * current.avgPrice) + (quantity * price)) / newQuantity;

            return {
                ...prev,
                [symbol]: {
                    quantity: newQuantity,
                    avgPrice: newAvgPrice
                }
            };
        });

        addTransaction({ type: 'BUY', symbol, price, quantity, orderType: type, date: new Date().toISOString() });
    };

    const sellStock = (symbol, price, quantity, type = 'DELIVERY') => {
        const current = holdings[symbol] || { quantity: 0, avgPrice: 0 };
        if (quantity > current.quantity) {
            throw new Error("Insufficient holdings");
        }

        const revenue = price * quantity;
        setBalance(prev => prev + revenue);
        setHoldings(prev => {
            const newQty = current.quantity - quantity;
            if (newQty <= 0) {
                const { [symbol]: _, ...rest } = prev;
                return rest;
            }
            return {
                ...prev,
                [symbol]: {
                    ...current,
                    quantity: newQty
                }
            };
        });

        addTransaction({ type: 'SELL', symbol, price, quantity, orderType: type, date: new Date().toISOString() });
    };

    const addTransaction = (transaction) => {
        setTransactions(prev => [transaction, ...prev]);
    };

    const resetAccount = () => {
        setBalance(INITIAL_BALANCE);
        setHoldings({});
        setTransactions([]);
    };

    return (
        <TradingContext.Provider value={{
            stocks, // Expose dynamic stocks
            balance,
            holdings,
            transactions,
            buyStock,
            sellStock,
            resetAccount
        }}>
            {children}
        </TradingContext.Provider>
    );
}

export function useTrading() {
    const context = useContext(TradingContext);
    if (!context) {
        throw new Error("useTrading must be used within a TradingProvider");
    }
    return context;
}
