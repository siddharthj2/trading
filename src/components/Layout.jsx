import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Search, PieChart, TrendingUp, Menu, X, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

export default function Layout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Market', path: '/market', icon: TrendingUp },
        { name: 'Portfolio', path: '/portfolio', icon: PieChart },
        { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Desktop Sidebar */}
            <aside className={cn(
                "hidden md:flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out relative",
                isCollapsed ? "w-16 p-2" : "w-64 p-4"
            )}>
                {/* Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-6 bg-primary text-primary-foreground rounded-full p-1 shadow-md hover:bg-primary/90 transition-colors z-50"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                <div className={cn("flex items-center gap-2 mb-8 transition-all", isCollapsed ? "justify-center px-0" : "px-2")}>
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                        <TrendingUp className="w-5 h-5 text-primary-foreground" />
                    </div>
                    {!isCollapsed && <h1 className="text-xl font-bold whitespace-nowrap overflow-hidden">TradeLearn</h1>}
                </div>

                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 py-2 rounded-lg transition-colors",
                                    isCollapsed ? "justify-center px-2" : "px-3",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                                title={isCollapsed ? item.name : ''}
                            >
                                <Icon className="w-5 h-5 shrink-0" />
                                {!isCollapsed && <span className="font-medium whitespace-nowrap overflow-hidden">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Mobile Header & Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <h1 className="text-xl font-bold">TradeLearn</h1>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </header>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-16 left-0 right-0 bg-card border-b border-border z-50 p-4">
                        <nav className="space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                                        location.pathname === item.path
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-muted"
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                )}

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
