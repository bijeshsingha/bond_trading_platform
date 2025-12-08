import React from 'react';
import { LayoutDashboard, Calculator, LineChart, Briefcase, TrendingUp } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';

const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Calculator', path: '/calculator', icon: Calculator },
    { name: 'Market', path: '/market', icon: LineChart },
    { name: 'Portfolio', path: '/portfolio', icon: Briefcase },
    { name: 'Scenarios', path: '/scenario', icon: TrendingUp },
];

export const Sidebar: React.FC = () => {
    const location = useLocation();

    return (
        <div className="h-screen w-64 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col">
            <div className="p-6 border-b border-slate-800">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    BondTrader
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                                isActive
                                    ? "bg-blue-600/10 text-blue-400"
                                    : "hover:bg-slate-800 text-slate-400 hover:text-slate-100"
                            )}
                        >
                            <Icon size={20} className={cn(isActive ? "text-blue-400" : "group-hover:text-cyan-400")} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center space-x-3 px-4 py-3 bg-slate-800/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-bold">
                        JD
                    </div>
                    <div>
                        <p className="text-sm font-medium">John Doe</p>
                        <p className="text-xs text-slate-400">Pro Trader</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
