import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input } from '../../components/ui/Components';
import { MOCK_MARKET_DATA } from './data';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export const MarketModule = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSector, setSelectedSector] = useState<string>('All');

    const filteredData = MOCK_MARKET_DATA.filter(bond => {
        const matchesSearch = bond.issuer.toLowerCase().includes(searchTerm.toLowerCase()) || bond.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSector = selectedSector === 'All' || bond.sector === selectedSector;
        return matchesSearch && matchesSector;
    });

    const scatterData = filteredData.map(bond => ({
        x: bond.duration,
        y: bond.yield,
        z: bond.rating === 'AAA' ? 200 : bond.rating === 'AA' ? 100 : 50,
        name: bond.issuer,
        rating: bond.rating,
        id: bond.id
    }));

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-100">Market Explorer</h2>
                <div className="flex gap-2 w-full md:w-auto">
                    <Input
                        placeholder="Search Issuer or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64"
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
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 h-[500px]">
                    <CardHeader>
                        <CardTitle>Yield vs Duration Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[430px]">
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

                <Card className="h-[500px] flex flex-col">
                    <CardHeader>
                        <CardTitle>Bond List</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto pr-2">
                        <div className="space-y-3">
                            {filteredData.slice(0, 50).map(bond => (
                                <div key={bond.id} className="p-3 bg-slate-950/50 rounded border border-slate-800 hover:border-slate-600 transition-colors cursor-pointer group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-medium text-slate-200 group-hover:text-blue-400">{bond.issuer}</div>
                                            <div className="text-xs text-slate-500">{bond.id} • {bond.sector}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-emerald-400">{bond.yield.toFixed(2)}%</div>
                                            <div className="text-xs text-slate-400 px-1.5 py-0.5 bg-slate-800 rounded inline-block mt-1">{bond.rating}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
