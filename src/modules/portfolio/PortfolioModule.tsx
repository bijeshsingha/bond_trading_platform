import { Card, CardContent, CardHeader, CardTitle, Button } from '../../components/ui/Components';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useTrading } from '../../context/TradingContext';

export const PortfolioModule = () => {
    const { holdings, cash, getHoldingsValuation } = useTrading();
    const { totalValue: holdingsValue, unrealizedPnl } = getHoldingsValuation();

    const totalAccountValue = cash + holdingsValue;
    const pnlPercent = holdingsValue > 0 ? (unrealizedPnl / (holdingsValue - unrealizedPnl)) * 100 : 0;

    // Weighted Durations (Live Calc)
    const portfolioDuration = holdings.length > 0
        ? holdings.reduce((sum, h) => sum + (h.duration * (h.price * h.quantity)), 0) / holdingsValue
        : 0;

    const portfolioYield = holdings.length > 0
        ? holdings.reduce((sum, h) => sum + (h.yield * (h.price * h.quantity)), 0) / holdingsValue
        : 0;

    // Mock Performance Data (since we don't store historical timeseries yet)
    const performanceData = Array.from({ length: 30 }).map((_, i) => ({
        day: i + 1,
        value: totalAccountValue * (1 + Math.sin(i / 5) * 0.02)
    }));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-100">Portfolio Management</h2>
                <div className="text-slate-400">
                    Cash Balance: <span className="text-slate-100 font-bold">${cash.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900/50">
                    <CardContent className="pt-6">
                        <div className="text-sm text-slate-400">Total Account Value</div>
                        <div className="text-2xl font-bold text-slate-100">${totalAccountValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50">
                    <CardContent className="pt-6">
                        <div className="text-sm text-slate-400">Unrealized P&L</div>
                        <div className={`text-2xl font-bold ${unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {unrealizedPnl >= 0 ? '+' : ''}{unrealizedPnl.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({pnlPercent.toFixed(2)}%)
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
                        {holdings.length === 0 ? (
                            <div className="text-center py-10 text-slate-500">
                                No holdings yet. Go to Market to trade.
                            </div>
                        ) : (
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
                                                    <div className="text-xs text-slate-500">{h.rating} • {h.maturityDate}</div>
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
                        )}
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
