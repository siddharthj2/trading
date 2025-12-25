export interface Stock {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    sector: string;
}

export const MOCK_STOCKS: Stock[] = [
    { symbol: "RELIANCE", name: "Reliance Industries", price: 2500.00, change: 15.50, changePercent: 0.62, sector: "Energy" },
    { symbol: "TCS", name: "Tata Consultancy Services", price: 3450.20, change: -10.00, changePercent: -0.29, sector: "IT" },
    { symbol: "HDFCBANK", name: "HDFC Bank", price: 1600.50, change: 5.00, changePercent: 0.31, sector: "Finance" },
    { symbol: "INFY", name: "Infosys", price: 1450.00, change: 8.20, changePercent: 0.57, sector: "IT" },
    { symbol: "ICICIBANK", name: "ICICI Bank", price: 950.00, change: 2.50, changePercent: 0.26, sector: "Finance" },
    { symbol: "SBIN", name: "State Bank of India", price: 580.00, change: -1.50, changePercent: -0.26, sector: "Finance" },
    { symbol: "BHARTIARTL", name: "Bharti Airtel", price: 850.00, change: 4.00, changePercent: 0.47, sector: "Telecom" },
    { symbol: "ITC", name: "ITC Limited", price: 450.00, change: 1.00, changePercent: 0.22, sector: "FMCG" },
    { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", price: 1800.00, change: -5.00, changePercent: -0.28, sector: "Finance" },
    { symbol: "LT", name: "Larsen & Toubro", price: 2900.00, change: 20.00, changePercent: 0.69, sector: "Construction" },
    { symbol: "NIFTY 50", name: "Nifty 50 Index", price: 21456.70, change: 120.50, changePercent: 0.56, sector: "Index" },
];

export const INITIAL_BALANCE = 1000000; // ₹10,00,000
