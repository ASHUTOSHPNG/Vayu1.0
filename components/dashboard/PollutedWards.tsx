"use client";

import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { getAQICategory, getAQIColor, getAQIHex } from '@/lib/utils/aqi';
import { AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAdminContext } from '@/lib/admin/useAdminContext';
import { useAdminStore } from '@/store/adminStore';
import { applyCityFilter } from '@/lib/admin/queryHelpers';

export function PollutedWards() {
    const supabase = createClient();
    const { adminContext } = useAdminContext();
    const { selectedCityId } = useAdminStore();

    const { data: wards, isLoading } = useQuery({
        queryKey: ['polluted-wards', adminContext, selectedCityId],
        queryFn: async () => {
            if (!adminContext) return [];

            // Fetch top 5 locations with highest recent AQI
            let query = supabase
                .from('aqi_readings')
                .select(`
                    id,
                    aqi_value,
                    recorded_at,
                    location_id,
                    locations!inner ( 
                        name, 
                        city
                    )
                `)
                .order('recorded_at', { ascending: false })
                .order('aqi_value', { ascending: false });

            query = applyCityFilter(query, adminContext, selectedCityId);

            const { data, error } = await query.limit(20); // Fetch more to deduplicate

            if (error) throw error;

            // Deduplicate by location and get latest for each
            const latestByLocation = (data as any[]).reduce((acc: any[], current: any) => {
                if (!acc.find(item => item.location_id === current.location_id)) {
                    acc.push(current);
                }
                return acc;
            }, []);

            return latestByLocation.slice(0, 5).map(item => ({
                id: item.location_id,
                name: (item.locations as any)?.name || 'Unknown',
                currentAqi: item.aqi_value,
                // Sample history
                history: [
                    { aqi: item.aqi_value - 10 },
                    { aqi: item.aqi_value - 5 },
                    { aqi: item.aqi_value + 2 },
                    { aqi: item.aqi_value }
                ]
            }));
        },
        refetchInterval: 300000,
        enabled: !!adminContext,
    });

    return (
        <Card className="bg-[#132238] border-[#1e2a3b] shadow-xl overflow-hidden flex flex-col h-full">
            <CardHeader className="p-4 border-b border-[#1e2a3b] bg-[#0A1628]/50">
                <CardTitle className="text-sm font-bold text-white flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                    Critical Areas (Top 5)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <div className="p-4 space-y-4">
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-12 bg-[#0A1628] animate-pulse rounded" />)}
                    </div>
                ) : wards?.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm italic">
                        No critical areas detected.
                    </div>
                ) : (
                    <div className="divide-y divide-[#1e2a3b]">
                        {wards?.map((ward, idx) => (
                            <div key={ward.id} className="p-4 hover:bg-[#1e2a3b]/50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center space-x-4 w-1/2 overflow-hidden">
                                    <div className="w-6 h-6 rounded-full bg-[#0A1628] border border-[#1e2a3b] flex items-center justify-center text-xs font-bold text-gray-500 group-hover:text-white transition-colors shrink-0">
                                        {idx + 1}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-semibold text-white truncate">{ward.name}</p>
                                        <p className={`text-[10px] font-medium ${ward.currentAqi > 300 ? 'text-red-400' : 'text-orange-400'
                                            }`}>
                                            {getAQICategory(ward.currentAqi).label}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end w-1/2 space-x-3">
                                    {/* Sparkline */}
                                    <div className="h-8 w-12 opacity-70 group-hover:opacity-100 transition-opacity">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={ward.history}>
                                                <YAxis domain={['dataMin - 20', 'dataMax + 20']} hide />
                                                <Line
                                                    type="monotone"
                                                    dataKey="aqi"
                                                    stroke={getAQIHex(ward.currentAqi)}
                                                    strokeWidth={2}
                                                    dot={false}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Current AQI Badge */}
                                    {(() => {
                                        const colorObj = getAQIColor(ward.currentAqi);
                                        return (
                                            <div className={`px-2 py-0.5 rounded text-[11px] font-black ${colorObj.bg} ${colorObj.text} min-w-[40px] text-center shadow-sm`}>
                                                {ward.currentAqi}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
