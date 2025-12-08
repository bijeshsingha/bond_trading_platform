import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../../components/ui/Components';
import { Calculator, LineChart, Briefcase, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

// Mock daily yield curve / trend
const trendData = Array.from({ length: 20 }).map((_, i) => ({
    time: `10:${i}0`,
    value: 4.2 + Math.random() * 0.1
}));

export const DashboardModule = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
                    Welcome back, Trader
                </h1>
                <div className="flex gap-2">
                    <Button className="bg-blue-600 hover:bg-blue-700">Quick Trade</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link to="/portfolio" className="block group">
                    <Card className="h-full border-l-4 border-l-emerald-500 hover:bg-slate-900/80 transition-all">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Total Portfolio</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-100">$2,450,200</div>
                            <div className="text-xs text-emerald-400 mt-1 flex items-center">
                                <TrendingUp size={12} className="mr-1" /> +1.2% Today
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/market" className="block group">
                    <Card className="h-full border-l-4 border-l-blue-500 hover:bg-slate-900/80 transition-all">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Market Yield (10Y)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-100">4.25%</div>
                            <div className="text-xs text-blue-400 mt-1">Stable</div>
                        </CardContent>
                    </Card>
                </Link>
                <Link to="/calculator" className="block group">
                    <Card className="h-full border-l-4 border-l-purple-500 hover:bg-slate-900/80 transition-all">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">New Opportunities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-100">12</div>
                            <div className="text-xs text-purple-400 mt-1">Bonds matching criteria</div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Intraday Yield Trend (10Y Gov)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="yieldColor" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" hide />
                                <YAxis domain={['dataMin - 0.05', 'dataMax + 0.05']} hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                                    formatter={(value: number) => [`${value.toFixed(3)}%`, 'Yield']}
                                />
                                <Area type="monotone" dataKey="value" stroke="#60a5fa" fill="url(#yieldColor)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Link to="/calculator">
                            <Button className="w-full justify-start bg-slate-800 hover:bg-slate-700 text-slate-300 mb-2">
                                <Calculator className="mr-2 h-4 w-4" /> Calculate Bond Fair Value
                            </Button>
                        </Link>
                        <Link to="/market">
                            <Button className="w-full justify-start bg-slate-800 hover:bg-slate-700 text-slate-300 mb-2">
                                <LineChart className="mr-2 h-4 w-4" /> Scan Market
                            </Button>
                        </Link>
                        <Link to="/portfolio">
                            <Button className="w-full justify-start bg-slate-800 hover:bg-slate-700 text-slate-300 mb-2">
                                <Briefcase className="mr-2 h-4 w-4" /> View Holdings
                            </Button>
                        </Link>
                        <Link to="/scenario">
                            <Button className="w-full justify-start bg-slate-800 hover:bg-slate-700 text-slate-300">
                                <TrendingUp className="mr-2 h-4 w-4" /> Stress Test Portfolio
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
