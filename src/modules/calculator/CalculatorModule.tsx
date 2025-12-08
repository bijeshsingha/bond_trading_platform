import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input } from '../../components/ui/Components';
import { calculateYTM, calculateMacaulayDuration, calculateModifiedDuration, calculateConvexity, calculateBondPrice } from '../../utils/finance';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const CalculatorModule = () => {
    const [faceValue, setFaceValue] = useState(1000);
    const [couponRate, setCouponRate] = useState(5); // %
    const [years, setYears] = useState(5);
    const [price, setPrice] = useState(950);
    const [frequency, setFrequency] = useState(2); // Semiannual

    const [results, setResults] = useState({
        ytm: 0,
        macDuration: 0,
        modDuration: 0,
        convexity: 0
    });

    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const cRate = couponRate / 100;

        // Calculate Metrics
        const ytm = calculateYTM(price, faceValue, cRate, years, frequency);
        const macDur = calculateMacaulayDuration(faceValue, cRate, years, ytm, frequency);
        const modDur = calculateModifiedDuration(macDur, ytm, frequency);
        const conv = calculateConvexity(faceValue, cRate, years, ytm, frequency);

        setResults({
            ytm: ytm * 100, // Convert to %
            macDuration: macDur,
            modDuration: modDur,
            convexity: conv
        });

        // Generate Chart Data (Price vs Yield)
        const data = [];
        const centerYield = ytm;
        for (let i = -20; i <= 20; i++) {
            const y = centerYield + (i * 0.001); // +/- 2% range
            if (y < 0) continue;
            const p = calculateBondPrice(faceValue, cRate, years, y, frequency);
            data.push({ yield: (y * 100).toFixed(2), price: p.toFixed(2) });
        }
        setChartData(data);

    }, [faceValue, couponRate, years, price, frequency]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Bond Parameters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Face Value ($)"
                                type="number"
                                value={faceValue}
                                onChange={(e) => setFaceValue(Number(e.target.value))}
                            />
                            <Input
                                label="Price ($)"
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Coupon Rate (%)"
                                type="number"
                                value={couponRate}
                                onChange={(e) => setCouponRate(Number(e.target.value))}
                            />
                            <Input
                                label="Years to Maturity"
                                type="number"
                                value={years}
                                onChange={(e) => setYears(Number(e.target.value))}
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Frequency</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 outline-none"
                                    value={frequency}
                                    onChange={(e) => setFrequency(Number(e.target.value))}
                                >
                                    <option value={1}>Annual</option>
                                    <option value={2}>Semiannual</option>
                                    <option value={4}>Quarterly</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-blue-900/20 border-blue-500/30">
                        <CardContent className="pt-6">
                            <div className="text-sm text-blue-400 font-medium">Yield to Maturity</div>
                            <div className="text-3xl font-bold text-blue-100">{results.ytm.toFixed(3)}%</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-emerald-900/20 border-emerald-500/30">
                        <CardContent className="pt-6">
                            <div className="text-sm text-emerald-400 font-medium">Modified Duration</div>
                            <div className="text-3xl font-bold text-emerald-100">{results.modDuration.toFixed(3)}</div>
                            <div className="text-xs text-emerald-500/70 mt-1">Sensitivity to 1% change</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-purple-900/20 border-purple-500/30">
                        <CardContent className="pt-6">
                            <div className="text-sm text-purple-400 font-medium">Convexity</div>
                            <div className="text-3xl font-bold text-purple-100">{results.convexity.toFixed(3)}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-amber-900/20 border-amber-500/30">
                        <CardContent className="pt-6">
                            <div className="text-sm text-amber-400 font-medium">Mac Duration</div>
                            <div className="text-3xl font-bold text-amber-100">{results.macDuration.toFixed(3)}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Price-Yield Analysis</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis
                                dataKey="yield"
                                label={{ value: 'Yield (%)', position: 'insideBottom', offset: -5 }}
                                stroke="#64748b"
                                tick={{ fill: '#64748b' }}
                            />
                            <YAxis
                                label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
                                stroke="#64748b"
                                tick={{ fill: '#64748b' }}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                            />
                            <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};
