"use client";

import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { WardMetric } from './WardDataTable';
import { Activity, BarChart3, Zap, MapPin } from 'lucide-react';
import { getAQIColor } from '@/lib/utils/aqi';

interface WardDetailPanelProps {
    ward: WardMetric | null;
    onGenerateRecommendation: (wardId: string) => void;
}

const POLLUTANT_COLORS: Record<string, string> = {
    PM25: '#00D4FF',
    PM10: '#34d399',
    NO2: '#fbbf24',
    SO2: '#f87171',
    CO: '#a78bfa',
    O3: '#f472b6'
};

export function WardDetailPanel({ ward, onGenerateRecommendation }: WardDetailPanelProps) {
    const { data: history, isLoading: historyLoading } = useQuery({
        queryKey: ['ward-history', ward?.id],
        enabled: !!ward,
        queryFn: async () => {
            // Mock history data
            await new Promise(r => setTimeout(r, 600));
            return Array.from({ length: 24 }, (_, i) => ({
                time: `${i}:00`,
                aqi: Math.floor(100 + Math.random() * 200)
            }));
        }
    });

    if (!ward) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-[#132238] border border-dashed border-[#1e2a3b] rounded-lg">
                <MapPin className="h-12 w-12 text-gray-600 mb-4 opacity-20" />
                <h3 className="text-lg font-bold text-gray-500">No Ward Selected</h3>
                <p className="text-sm text-gray-600 mt-2">Select a ward from the table to view detailed analytics and generate policy actions.</p>
            </div>
        );
    }

    const pollutantData = [
        { name: 'PM2.5', value: ward.pm25 },
        { name: 'PM10', value: ward.pm10 },
        { name: 'NO2', value: ward.no2 },
        { name: 'SO2', value: 12 }, // Mocked
        { name: 'CO', value: 0.8 * 100 }, // Scaled
        { name: 'O3', value: 45 }, // Mocked
    ];

    return (
        <div className="space-y-6 h-full flex flex-col">
            <Card className="bg-[#132238] border-[#1e2a3b] shadow-xl overflow-hidden flex flex-col flex-1">
                <CardHeader className="p-4 border-b border-[#1e2a3b] bg-[#0A1628]/50 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold text-white">{ward.name}</CardTitle>
                        <p className="text-xs text-gray-500">Local Area Analysis Dashboard</p>
                    </div>
                    <Button
                        size="sm"
                        className="bg-[#00D4FF] hover:bg-[#00D4FF]/80 text-black font-bold text-xs"
                        onClick={() => onGenerateRecommendation(ward.id)}
                    >
                        <Zap className="h-3 w-3 mr-2" />
                        GenAI Action
                    </Button>
                </CardHeader>

                <CardContent className="p-4 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                    {/* 1. Historical AQI Trend */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-400 flex items-center uppercase tracking-wider">
                            <Activity className="h-3 w-3 mr-2 text-[#00D4FF]" />
                            24h AQI Trend
                        </h4>
                        <div className="h-[180px] w-full bg-[#0A1628]/30 rounded-lg p-2 border border-[#1e2a3b]/50">
                            {historyLoading ? (
                                <div className="w-full h-full animate-pulse bg-[#1e2a3b]/30 rounded" />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={history}>
                                        <defs>
                                            <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3b" vertical={false} />
                                        <XAxis dataKey="time" hide />
                                        <YAxis hide domain={['dataMin - 20', 'dataMax + 20']} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0A1628', border: '1px solid #1e2a3b', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area type="monotone" dataKey="aqi" stroke="#00D4FF" fillOpacity={1} fill="url(#colorAqi)" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* 2. Pollutant Breakdown */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-400 flex items-center uppercase tracking-wider">
                            <BarChart3 className="h-3 w-3 mr-2 text-green-400" />
                            Latest Pollutant Distribution
                        </h4>
                        <div className="h-[200px] w-full bg-[#0A1628]/30 rounded-lg p-2 border border-[#1e2a3b]/50">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={pollutantData}>
                                    <XAxis
                                        dataKey="name"
                                        stroke="#4b5563"
                                        tick={{ fill: '#9ca3af', fontSize: 10 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0A1628', border: '1px solid #1e2a3b', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {pollutantData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={POLLUTANT_COLORS[entry.name.replace('.', '')] || '#9ca3af'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 3. Source Attribution Quick View */}
                    <div className="p-4 bg-[#0A1628]/80 border border-[#1e2a3b] rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold text-gray-400 uppercase">Primary Source</span>
                            <div className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold border border-purple-500/30 uppercase">
                                {ward.topSource}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="text-gray-500">Source Probability</span>
                                <span className="text-[#00D4FF]">85%</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#1e2a3b] rounded-full overflow-hidden">
                                <div className="h-full bg-[#00D4FF] rounded-full" style={{ width: '85%' }} />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
