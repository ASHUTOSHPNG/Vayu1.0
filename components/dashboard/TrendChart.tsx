"use client";

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAdminContext } from '@/lib/admin/useAdminContext';
import { useAdminStore } from '@/store/adminStore';
import { applyCityFilter } from '@/lib/admin/queryHelpers';
import { format, subDays } from 'date-fns';

export function TrendChart() {
    const supabase = createClient();
    const { adminContext, isCentralAdmin } = useAdminContext();
    const { selectedCityId } = useAdminStore();

    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const { data: trendData, isLoading } = useQuery({
        queryKey: ['aqi-7day-trend', adminContext, selectedCityId],
        queryFn: async () => {
            if (!adminContext) return [];

            const sevenDaysAgo = subDays(new Date(), 7).toISOString();

            let query = supabase
                .from('aqi_readings')
                .select(`
                    aqi_value,
                    recorded_at,
                    locations!inner ( city )
                `)
                .gte('recorded_at', sevenDaysAgo)
                .order('recorded_at', { ascending: true });

            query = applyCityFilter(query, adminContext, selectedCityId);

            const { data, error } = await query;

            if (error) throw error;

            const readings = data as any[];

            // Group by day and calculate average
            const groups = readings.reduce((acc: any, curr) => {
                const day = format(new Date(curr.recorded_at), 'EEE');
                if (!acc[day]) acc[day] = { count: 0, total: 0 };
                acc[day].count++;
                acc[day].total += curr.aqi_value;
                return acc;
            }, {});

            // Ensure all last 7 days are represented
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const dayName = format(subDays(new Date(), 6 - i), 'EEE');
                const group = groups[dayName];
                return {
                    date: dayName,
                    avgAqi: group ? Math.round(group.total / group.count) : null
                };
            });

            return last7Days;
        },
        refetchInterval: 300000,
        enabled: !!adminContext,
    });

    const isAllCities = isCentralAdmin && !selectedCityId;

    return (
        <Card className="bg-[#132238] border-[#1e2a3b] shadow-2xl h-full flex flex-col">
            <CardHeader className="p-5 border-b border-[#1e2a3b] bg-[#0A1628]/50 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold text-white flex items-center">
                    <Activity className="h-5 w-5 mr-3 text-green-400" />
                    7-Day Historic AQI Trend
                </CardTitle>
                <div className="flex space-x-4 text-xs font-medium">
                    <div className="flex items-center text-gray-400">
                        <span className="w-3 h-3 rounded-full bg-[#00D4FF] mr-2"></span>
                        {isAllCities ? 'National Average' : 'City Average'}
                    </div>
                    <div className="flex items-center text-gray-400">
                        <span className="w-3 h-3 rounded-full bg-red-500/50 mr-2 border border-dashed border-red-500"></span>
                        Emergency Threshold
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 min-h-[250px]">
                {(!mounted || isLoading) ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-pulse flex space-x-2 items-end h-[150px]">
                            {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                <div key={i} className="w-12 bg-[#1e2a3b] rounded-t opacity-50" style={{ height: `${(i * 13) % 100}%` }} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3b" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#4b5563"
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#4b5563"
                                tick={{ fill: '#9ca3af', fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                dx={-10}
                                domain={[0, 'dataMax + 50']}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0A1628', border: '1px solid #1e2a3b', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ stroke: '#1e2a3b', strokeWidth: 2 }}
                            />
                            <ReferenceLine y={300} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Severe/Emergency', fill: '#ef4444', fontSize: 10 }} />
                            <Line
                                type="monotone"
                                dataKey="avgAqi"
                                stroke="#00D4FF"
                                strokeWidth={3}
                                connectNulls
                                dot={{ r: 4, fill: '#0A1628', stroke: '#00D4FF', strokeWidth: 2 }}
                                activeDot={{ r: 6, fill: '#00D4FF' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
