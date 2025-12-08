import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Components';
import { MOCK_MARKET_DATA } from '../market/data';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Cell } from 'recharts';
import { calculateBondPrice } from '../../utils/finance';

export const ScenarioModule = () => {
    const [rateShock, setRateShock] = useState(0); // in basis points, e.g. 50 = +0.50%

    // Use a subset of market data as "My Portfolio" for simulation
    const portfolio = MOCK_MARKET_DATA.slice(0, 10).map(b => ({ ...b, quantity: 100 }));

    const currentTotalValue = portfolio.reduce((sum, b) => sum + (b.price * b.quantity), 0);

    // Calculate New Value based on Shock
    const simulatedPortfolio = portfolio.map(bond => {
        // Approx new yield = old yield + shock
        // Accurately we should use YTM, but for simplicity:
        const newYtm = (bond.yield / 100) + (rateShock / 10000);
        const newPrice = calculateBondPrice(bond.faceValue, bond.coupon / 100, Math.max(0.5, bond.duration), newYtm, 2); // Using duration as proxy for years left
        return {
            ...bond,
            newPrice,
            valueChange: (newPrice - bond.price) * bond.quantity
        };
    });

    const newTotalValue = simulatedPortfolio.reduce((sum, b) => sum + (b.newPrice * b.quantity), 0);
    const totalChange = newTotalValue - currentTotalValue;
    const percentChange = (totalChange / currentTotalValue) * 100;

    // Chart Data: Value impact by Bond (Top 5 losers/gainers)
    const impactData = simulatedPortfolio
        .sort((a, b) => Math.abs(b.valueChange) - Math.abs(a.valueChange))
        .slice(0, 8)
        .map(b => ({
            name: b.issuer + ' ' + b.maturityDate.split('-')[0],
            change: Math.floor(b.valueChange),
            duration: b.duration
        }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-100">Scenario Analysis</h2>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 flex items-center gap-4">
                    <span className="text-slate-400 text-sm">Interest Rate Shock:</span>
                    <input
                        type="range"
                        min="-200"
                        max="200"
                        value={rateShock}
                        onChange={(e) => setRateShock(Number(e.target.value))}
                        className="w-48 accent-blue-500 cursor-pointer"
                    />
                    <span className={`font-bold w-16 text-right ${rateShock > 0 ? 'text-red-400' : rateShock < 0 ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {rateShock > 0 ? '+' : ''}{rateShock / 100}%
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 bg-slate-900/80">
                    <CardHeader>
                        <CardTitle>Impact Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <div className="text-sm text-slate-400">Projected Portfolio Value</div>
                            <div className="text-3xl font-bold text-slate-100">${newTotalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-400">Value Change</div>
                            <div className={`text-3xl font-bold ${totalChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {totalChange >= 0 ? '+' : ''}{totalChange.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                            <div className={`text-sm ${totalChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {percentChange.toFixed(2)}%
                            </div>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded border border-slate-700">
                            <p className="text-xs text-slate-400 mb-1">Analysis</p>
                            <p className="text-sm text-slate-300">
                                {rateShock > 0
                                    ? "Rising rates negatively impact bond prices. Long-duration bonds suffer the most."
                                    : rateShock < 0
                                        ? "Falling rates boost bond prices. Your long-duration assets see significant gains."
                                        : "No interest rate shock applied. Portfolio at baseline."
                                }
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Asset Impact Sensitivity</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={impactData} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={true} />
                                <XAxis type="number" stroke="#64748b" tickFormatter={(val) => `$${val}`} />
                                <YAxis type="category" dataKey="name" stroke="#94a3b8" width={100} style={{ fontSize: '10px' }} />
                                <Tooltip
                                    cursor={{ fill: '#1e293b' }}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                                    formatter={(val: number) => [`$${val.toFixed(0)}`, 'Impact']}
                                />
                                <ReferenceLine x={0} stroke="#475569" />
                                <Bar dataKey="change" name="Value Change" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                                    {
                                        impactData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.change >= 0 ? '#10b981' : '#ef4444'} />
                                        ))
                                    }
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
