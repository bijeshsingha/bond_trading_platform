import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../../components/ui/Components';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Cell } from 'recharts';
import { calculateBondPrice } from '../../utils/finance';
import { useTrading } from '../../context/TradingContext';
import { Link } from 'react-router-dom';

export const ScenarioModule = () => {
    const { holdings } = useTrading();
    const [rateShock, setRateShock] = useState(0); // in basis points, e.g. 50 = +0.50%

    // Calculate current market value of holdings
    const currentTotalValue = holdings.reduce((sum, b) => sum + (b.price * b.quantity), 0);

    // Calculate New Value based on Shock for each holding
    const simulatedPortfolio = holdings.map(bond => {
        // Approx new yield = old yield + shock
        // For floating rate bonds this would be different, but assuming fixed for now
        const newYtm = (bond.yield / 100) + (rateShock / 10000);
        // Using duration as proxy for years left if not explicitly tracking residual maturity perfectly
        // In a real app, calculate days to maturity from bond.maturityDate
        const yearsRemaining = bond.duration / 0.8; // improving the rough proxy from data.ts

        const newPrice = calculateBondPrice(bond.faceValue, bond.coupon / 100, yearsRemaining, newYtm, 2);

        return {
            ...bond,
            newPrice,
            valueChange: (newPrice - bond.price) * bond.quantity,
            projectedValue: newPrice * bond.quantity
        };
    });

    const newTotalValue = simulatedPortfolio.reduce((sum, b) => sum + b.projectedValue, 0);
    const totalChange = newTotalValue - currentTotalValue;
    const percentChange = currentTotalValue > 0 ? (totalChange / currentTotalValue) * 100 : 0;

    // Chart Data: Value impact by Bond
    const impactData = simulatedPortfolio
        .sort((a, b) => Math.abs(b.valueChange) - Math.abs(a.valueChange))
        .map(b => ({
            name: b.issuer + ' ' + b.maturityDate.split('-')[0],
            change: Math.floor(b.valueChange),
            duration: b.duration
        }));

    if (holdings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="p-4 bg-slate-900 rounded-full">
                    <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-200">No Portfolio Data</h2>
                <p className="text-slate-400 max-w-sm">
                    Scenario analysis requires active bond holdings. Visit the market to build your portfolio first.
                </p>
                <Link to="/market">
                    <Button className="bg-blue-600 hover:bg-blue-700">Go to Market</Button>
                </Link>
            </div>
        );
    }

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
