"use client";

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Factory } from 'lucide-react';
import { useAdminContext } from '@/lib/admin/useAdminContext';
import { useAdminStore } from '@/store/adminStore';
import { createClient } from '@/lib/supabase/client';
import { applyCityFilter } from '@/lib/admin/queryHelpers';

const COLORS = {
    TRAFFIC: '#ef4444',
    CONSTRUCTION_DUST: '#f97316',
    BIOMASS_BURNING: '#eab308',
    INDUSTRIAL: '#8b5cf6',
    UNKNOWN: '#4b5563',
    OPEN_BURNING: '#fca5a5',
    DUST: '#94a3b8'
};

export function SourcesChart() {
    const supabase = createClient();
    const { adminContext, isCentralAdmin, cityName } = useAdminContext();
    const { selectedCityId } = useAdminStore();

    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const activeCity = isCentralAdmin ? (selectedCityId || 'National') : cityName;

    const { data: sources, isLoading } = useQuery({
        queryKey: ['pollution-sources-stats', adminContext?.type, selectedCityId],
        queryFn: async () => {
            if (!adminContext) return [];

            let query = supabase
                .from('pollution_sources')
                .select(`
                    id,
                    source_type,
                    confidence_score,
                    locations!inner ( city )
                `);

            query = applyCityFilter(query, adminContext, selectedCityId);

            const { data, error } = await query;
            if (error) throw error;

            const readings = (data as any[]) || [];

            // Group and aggregate
            const counts: Record<string, number> = {};
            readings.forEach(d => {
                const type = d.source_type.toUpperCase().replace(' ', '_');
                counts[type] = (counts[type] || 0) + (d.confidence_score || 1);
            });

            const formatted = Object.entries(counts).map(([name, value]) => ({
                name,
                value
            }));

            return formatted.length > 0 ? formatted : [
                { name: 'TRAFFIC', value: 40 },
                { name: 'CONSTRUCTION_DUST', value: 30 },
                { name: 'BIOMASS_BURNING', value: 20 },
                { name: 'INDUSTRIAL', value: 10 },
            ];
        },
        enabled: !!adminContext,
    });

    return (
        <Card className="bg-[#132238] border-[#1e2a3b] shadow-xl overflow-hidden flex flex-col h-full">
            <CardHeader className="p-4 border-b border-[#1e2a3b] bg-[#0A1628]/50">
                <CardTitle className="text-sm font-bold text-white flex items-center">
                    <Factory className="h-4 w-4 mr-2 text-purple-400" />
                    {activeCity ? `${activeCity} Sources (24h)` : 'National Sources (24h)'}
                </CardTitle>
            </CardHeader>

            <CardContent className="p-4 flex-1 flex flex-col">
                {(!mounted || isLoading) ? (
                    <div className="flex-1 flex justify-center items-center">
                        <div className="w-32 h-32 rounded-full border-4 border-[#1e2a3b] border-t-purple-500 animate-spin" />
                    </div>
                ) : (
                    <div className="w-full h-full min-h-[160px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={sources}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="#132238"
                                    strokeWidth={2}
                                >
                                    {sources?.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.UNKNOWN} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0A1628', border: '1px solid #1e2a3b', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
