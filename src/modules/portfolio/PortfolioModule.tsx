import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../../components/ui/Components';
import { MOCK_MARKET_DATA } from '../market/data';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const PortfolioModule = () => {
    // Generate Mock Holdings from Market Data
    const [holdings] = useState(() => {
        return MOCK_MARKET_DATA.slice(0, 8).map(bond => ({
            ...bond,
            quantity: Math.floor(Math.random() * 100) + 10,
            avgCost: bond.price * (0.95 + Math.random() * 0.1) // +/- 5% of current price
        }));
    });

    const totalValue = holdings.reduce((sum, h) => sum + (h.price * h.quantity), 0);
    const totalCost = holdings.reduce((sum, h) => sum + (h.avgCost * h.quantity), 0);
    const pnl = totalValue - totalCost;
    const pnlPercent = (pnl / totalCost) * 100;

    // Weighted Durations
    const portfolioDuration = holdings.reduce((sum, h) => sum + (h.duration * (h.price * h.quantity)), 0) / totalValue;
    const portfolioYield = holdings.reduce((sum, h) => sum + (h.yield * (h.price * h.quantity)), 0) / totalValue;

    // Generate Mock Performance History
    const performanceData = Array.from({ length: 30 }).map((_, i) => ({
        day: i + 1,
        value: totalValue * (1 + Math.sin(i / 5) * 0.02) // subtle wave
    }));

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-100">Portfolio Management</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900/50">
                    <CardContent className="pt-6">
                        <div className="text-sm text-slate-400">Total Value</div>
                        <div className="text-2xl font-bold text-slate-100">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50">
                    <CardContent className="pt-6">
                        <div className="text-sm text-slate-400">Total P&L</div>
                        <div className={`text-2xl font-bold ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {pnl >= 0 ? '+' : ''}{pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({pnlPercent.toFixed(2)}%)
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50">
                    <CardContent className="pt-6">
                        <div className="text-sm text-slate-400">Avg Duration</div>
                        <div className="text-2xl font-bold text-amber-400">{portfolioDuration.toFixed(2)} Years</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50">
                    <CardContent className="pt-6">
                        <div className="text-sm text-slate-400">Avg Yield</div>
                        <div className="text-2xl font-bold text-blue-400">{portfolioYield.toFixed(2)}%</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Holdings</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-800">
                                <tr>
                                    <th className="px-4 py-3">Asset</th>
                                    <th className="px-4 py-3 text-right">Qty</th>
                                    <th className="px-4 py-3 text-right">Avg Cost</th>
                                    <th className="px-4 py-3 text-right">Price</th>
                                    <th className="px-4 py-3 text-right">Value</th>
                                    <th className="px-4 py-3 text-right">P&L</th>
                                </tr>
                            </thead>
                            <tbody>
                                {holdings.map(h => {
                                    const val = h.price * h.quantity;
                                    const cost = h.avgCost * h.quantity;
                                    const itemPnl = val - cost;
                                    return (
                                        <tr key={h.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                                            <td className="px-4 py-3 font-medium text-slate-200">
                                                <div>{h.issuer}</div>
                                                <div className="text-xs text-slate-500">{h.rating} • {h.maturityDate.split('-')[0]}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right">{h.quantity}</td>
                                            <td className="px-4 py-3 text-right text-slate-400">${h.avgCost.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right text-slate-200">${h.price.toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right text-slate-100 font-medium">${val.toLocaleString()}</td>
                                            <td className={`px-4 py-3 text-right font-medium ${itemPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {itemPnl >= 0 ? '+' : ''}{itemPnl.toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Performance Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData}>
                                <defs>
                                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="day" hide />
                                <YAxis domain={['auto', 'auto']} hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                                    formatter={(value: number) => [`$${value.toFixed(0)}`, 'Value']}
                                />
                                <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Sharpe Ratio</span>
                                <span className="text-slate-100">1.8</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Risk (Vol)</span>
                                <span className="text-slate-100">12.4%</span>
                            </div>
                            <Button className="w-full mt-4 bg-slate-800 hover:bg-slate-700">Detailed Report</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
