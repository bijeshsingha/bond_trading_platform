import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Button } from '../../components/ui/Components';
import { MOCK_MARKET_DATA, type Bond } from './data';
import { OrderDialog } from './OrderDialog';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export const MarketModule = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSector, setSelectedSector] = useState<string>('All');
    const [selectedRating, setSelectedRating] = useState<string>('All');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Bond; direction: 'asc' | 'desc' } | null>(null);
    const [selectedBond, setSelectedBond] = useState<Bond | null>(null);
    const [isOrderOpen, setIsOrderOpen] = useState(false);

    // Filtering
    const filteredData = MOCK_MARKET_DATA.filter(bond => {
        const matchesSearch = bond.issuer.toLowerCase().includes(searchTerm.toLowerCase()) || bond.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSector = selectedSector === 'All' || bond.sector === selectedSector;
        const matchesRating = selectedRating === 'All' || bond.rating === selectedRating;
        return matchesSearch && matchesSector && matchesRating;
    });

    // Sorting
    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (key: keyof Bond) => {
        setSortConfig(current => ({
            key,
            direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleTradeClick = (bond: Bond) => {
        setSelectedBond(bond);
        setIsOrderOpen(true);
    };

    // Scatter Data for Chart
    const scatterData = sortedData.map(bond => ({
        x: bond.duration,
        y: bond.yield,
        z: bond.rating === 'AAA' ? 200 : bond.rating === 'AA' ? 100 : 50,
        name: bond.issuer,
        rating: bond.rating,
        id: bond.id
    }));

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-100">Market Explorer</h2>
                    <p className="text-slate-400 text-sm">Real-time bond market data and execution</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <Input
                        placeholder="Search Issuer or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-48"
                    />
                    <select
                        className="h-10 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 focus:border-blue-500 outline-none"
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                    >
                        <option value="All">All Sectors</option>
                        <option value="Government">Government</option>
                        <option value="Corporate">Corporate</option>
                        <option value="Municipal">Municipal</option>
                    </select>
                    <select
                        className="h-10 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 focus:border-blue-500 outline-none"
                        value={selectedRating}
                        onChange={(e) => setSelectedRating(e.target.value)}
                    >
                        <option value="All">All Ratings</option>
                        <option value="AAA">AAA</option>
                        <option value="AA">AA</option>
                        <option value="A">A</option>
                        <option value="BBB">BBB</option>
                    </select>
                </div>
            </div>

            {/* Split View: Chart & Data Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Chart Section */}
                <Card className="lg:col-span-3 h-[400px]">
                    <CardHeader>
                        <CardTitle>Yield Curve Analysis (Yield vs Duration)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis type="number" dataKey="x" name="Duration" unit=" yrs" stroke="#64748b" />
                                <YAxis type="number" dataKey="y" name="Yield" unit="%" stroke="#64748b" />
                                <ZAxis type="category" dataKey="name" name="Issuer" />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    content={({ active, payload }: any) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-slate-900 border border-slate-700 p-2 rounded shadow text-xs text-slate-100">
                                                    <p className="font-bold">{data.name}</p>
                                                    <p>Rating: {data.rating}</p>
                                                    <p>Yield: {data.y}%</p>
                                                    <p>Duration: {data.x} yrs</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Scatter name="Bonds" data={scatterData} fill="#8884d8">
                                    {scatterData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.rating === 'AAA' ? '#4ade80' : entry.rating === 'AA' ? '#60a5fa' : '#f472b6'} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Data Table Section */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Market Depth</CardTitle>
                            <span className="text-xs text-slate-500">{sortedData.length} opportunities found</span>
                        </div>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-800">
                                <tr>
                                    <th className="px-4 py-3 cursor-pointer hover:text-blue-400" onClick={() => handleSort('issuer')}>Issuer ↕</th>
                                    <th className="px-4 py-3 cursor-pointer hover:text-blue-400" onClick={() => handleSort('rating')}>Rating ↕</th>
                                    <th className="px-4 py-3 text-right cursor-pointer hover:text-blue-400" onClick={() => handleSort('coupon')}>Coupon ↕</th>
                                    <th className="px-4 py-3 text-right cursor-pointer hover:text-blue-400" onClick={() => handleSort('maturityDate')}>Maturity ↕</th>
                                    <th className="px-4 py-3 text-right cursor-pointer hover:text-blue-400" onClick={() => handleSort('yield')}>YTM ↕</th>
                                    <th className="px-4 py-3 text-right cursor-pointer hover:text-blue-400" onClick={() => handleSort('price')}>Price ↕</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedData.slice(0, 20).map(bond => (
                                    <tr key={bond.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-200">
                                            <div>{bond.issuer}</div>
                                            <div className="text-xs text-slate-500">{bond.id} • {bond.sector}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs border ${bond.rating.startsWith('A') ? 'border-green-800 bg-green-900/20 text-green-400' :
                                                    'border-amber-800 bg-amber-900/20 text-amber-400'
                                                }`}>
                                                {bond.rating}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-300">{bond.coupon.toFixed(2)}%</td>
                                        <td className="px-4 py-3 text-right text-slate-400">{bond.maturityDate}</td>
                                        <td className="px-4 py-3 text-right font-bold text-emerald-400">{bond.yield.toFixed(2)}%</td>
                                        <td className="px-4 py-3 text-right font-medium text-slate-200">${bond.price.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                className="bg-blue-600 hover:bg-blue-700 h-8 text-xs"
                                                onClick={() => handleTradeClick(bond)}
                                            >
                                                Trade
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>

            <OrderDialog
                bond={selectedBond}
                open={isOrderOpen}
                onClose={() => setIsOrderOpen(false)}
            />
        </div>
    );
};
