"use client";

import { useQuery } from '@tanstack/react-query';
import CountUp from 'react-countup';
import { Activity, AlertTriangle, ArrowUpRight, ArrowDownRight, ShieldAlert, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getAQIColor } from '@/lib/utils/aqi';
import { createClient } from '@/lib/supabase/client';
import { useAdminContext } from '@/lib/admin/useAdminContext';
import { useAdminStore } from '@/store/adminStore';
import { applyCityFilter } from '@/lib/admin/queryHelpers';

export function StatCards() {
    const supabase = createClient();
    const { adminContext, isCentralAdmin } = useAdminContext();
    const { selectedCityId } = useAdminStore();

    const { data: stats, isLoading } = useQuery({
        queryKey: ['dashboard-stats', adminContext?.type, selectedCityId],
        queryFn: async () => {
            if (!adminContext) return null;

            // 1. Fetch Policy Actions count with filter
            let policyQuery = supabase
                .from('policy_recommendations')
                .select('*, locations!inner(city)', { count: 'exact', head: true })
                .eq('status', 'pending');

            policyQuery = applyCityFilter(policyQuery, adminContext, selectedCityId);
            const { count: policiesCount } = await policyQuery;

            // 2. Fetch Active Anomalies (AQI > 300 as proxy for critical anomalies)
            let anomalyQuery = supabase
                .from('aqi_readings')
                .select('id, locations!inner(city)')
                .gte('recorded_at', new Date(Date.now() - 3600000).toISOString())
                .gte('aqi_value', 300);

            anomalyQuery = applyCityFilter(anomalyQuery, adminContext, selectedCityId);
            const { data: recentAnomalies } = await anomalyQuery;
            const activeAnomalies = recentAnomalies?.length || 0;

            // 3. Average AQI for current scope
            let aqiQuery = supabase
                .from('aqi_readings')
                .select('aqi_value, locations!inner(city)')
                .order('recorded_at', { ascending: false })
                .limit(50);

            aqiQuery = applyCityFilter(aqiQuery, adminContext, selectedCityId);
            const { data: aqiData } = await aqiQuery;
            const avgAqi = aqiData?.length
                ? Math.round(aqiData.reduce((acc, curr) => acc + curr.aqi_value, 0) / aqiData.length)
                : 180;

            // 4. Cities Monitored (Super Admin ONLY)
            let citiesCount = 0;
            if (isCentralAdmin && !selectedCityId) {
                const { data: locations } = await supabase
                    .from('locations')
                    .select('city');

                const uniqueCities = new Set(locations?.map(l => l.city));
                citiesCount = uniqueCities.size;
            }

            return {
                aqi: avgAqi,
                aqiTrend: avgAqi > 200 ? 'up' : 'down',
                aqiChange: 5,
                anomalies: activeAnomalies,
                policies: policiesCount || 0,
                citiesCount
            };
        },
        enabled: !!adminContext,
    });

    if (isLoading || !stats) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="bg-[#132238] border-[#1e2a3b] h-[120px] animate-pulse" />
                ))}
            </div>
        );
    }

    const aqiColorClass = getAQIColor(stats.aqi);
    const isNationalView = isCentralAdmin && !selectedCityId;

    return (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${isNationalView ? '4' : '3'} gap-6 mb-6`}>

            {/* 1. City/National AQI Card */}
            <Card className="bg-[#132238] border-[#1e2a3b] overflow-hidden relative group">
                <div className={`absolute top-0 left-0 w-1 h-full ${aqiColorClass} opacity-50 group-hover:opacity-100 transition-opacity`} />
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">
                                {isNationalView ? 'National Average AQI' : 'City Average AQI'}
                            </p>
                            <div className="flex items-baseline mt-2">
                                <h3 className="text-4xl font-bold text-white tracking-tight">
                                    <CountUp end={stats.aqi} duration={2} />
                                </h3>
                                <span className={`ml-2 text-sm font-medium flex items-center ${stats.aqiTrend === 'down' ? 'text-green-400' : 'text-red-400'}`}>
                                    {stats.aqiTrend === 'down' ? <ArrowDownRight className="h-4 w-4 mr-0.5" /> : <ArrowUpRight className="h-4 w-4 mr-0.5" />}
                                    {stats.aqiChange} pt
                                </span>
                            </div>
                        </div>
                        <div className={`p-3 rounded-xl bg-[#0A1628] border border-[#1e2a3b]`}>
                            <Activity className={`h-6 w-6 ${stats.aqiTrend === 'down' ? 'text-green-400' : 'text-red-400'}`} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Active Anomalies */}
            <Card className="bg-[#132238] border-[#1e2a3b] overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Active Anomalies</p>
                            <div className="flex items-baseline mt-2">
                                <h3 className="text-4xl font-bold text-white tracking-tight">
                                    <CountUp end={stats.anomalies} duration={2} />
                                </h3>
                            </div>
                            <p className="text-xs text-orange-400 mt-1 font-medium">Critical readings in last hour</p>
                        </div>
                        <div className="p-3 rounded-xl bg-[#0A1628] border border-[#1e2a3b]">
                            <AlertTriangle className="h-6 w-6 text-orange-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 3. Open Policy Actions */}
            <Card className="bg-[#132238] border-[#1e2a3b] overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#00D4FF] opacity-50 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Open Policy Actions</p>
                            <div className="flex items-baseline mt-2">
                                <h3 className="text-4xl font-bold text-white tracking-tight">
                                    <CountUp end={stats.policies} duration={2} />
                                </h3>
                            </div>
                            <p className="text-xs text-[#00D4FF] mt-1 font-medium">Pending GenAI Recommendations</p>
                        </div>
                        <div className="p-3 rounded-xl bg-[#0A1628] border border-[#1e2a3b]">
                            <ShieldAlert className="h-6 w-6 text-[#00D4FF]" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 4. Cities Monitored (Super Admin ONLY) */}
            {isNationalView && (
                <Card className="bg-[#132238] border-[#1e2a3b] overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">Cities Monitored</p>
                                <div className="flex items-baseline mt-2">
                                    <h3 className="text-4xl font-bold text-white tracking-tight">
                                        <CountUp end={stats.citiesCount} duration={2} />
                                    </h3>
                                </div>
                                <p className="text-xs text-purple-400 mt-1 font-medium">Active across India</p>
                            </div>
                            <div className="p-3 rounded-xl bg-[#0A1628] border border-[#1e2a3b]">
                                <Building2 className="h-6 w-6 text-purple-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
