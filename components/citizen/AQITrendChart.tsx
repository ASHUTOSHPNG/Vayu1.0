'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

interface TrendData {
    time: string;
    aqi: number;
}

interface AQITrendChartProps {
    data: TrendData[];
}

export const AQITrendChart: React.FC<AQITrendChartProps> = ({ data }) => {
    return (
        <Card className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 h-[350px] w-full">
            <h3 className="text-sm font-semibold text-zinc-400 mb-6 uppercase tracking-wider">24-Hour AQI Trend</h3>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#71717A' }}
                            minTickGap={30}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#71717A' }}
                            domain={[0, 'auto']}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(24, 24, 27, 0.95)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}
                            itemStyle={{ color: '#14B8A6', fontWeight: 'bold' }}
                            labelStyle={{ color: '#A1A1AA' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="aqi"
                            stroke="#14B8A6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorAqi)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
