"use client";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { useAdminContext } from '@/lib/admin/useAdminContext';
import { useAdminStore } from '@/store/adminStore';
import { applyCityFilter } from '@/lib/admin/queryHelpers';
import { Bell, AlertTriangle, ShieldAlert, Clock, MapPin, Flame, Globe, TrendingUp, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress";

export default function AlertsPage() {
    const supabase = createClient();
    const { adminContext } = useAdminContext();
    const { selectedCityId } = useAdminStore();

    // 1. System Alerts — high AQI readings
    const { data: alerts, isLoading: alertsLoading } = useQuery({
        queryKey: ['system-alerts', adminContext, selectedCityId],
        queryFn: async () => {
            if (!adminContext) return [];
            let query = (supabase as any)
                .from('aqi_readings')
                .select('*, wards!inner(name, city)')
                .gte('aqi_value', 200)
                .order('recorded_at', { ascending: false })
                .limit(20);
            query = applyCityFilter(query, adminContext as any, selectedCityId);
            const { data, error } = await query;
            if (error) throw error;
            return data as any[];
        },
        enabled: !!adminContext
    });

    // 2. Fire Snapshots (cast to any — table may not exist yet)
    const { data: fireSnapshots, isLoading: fireSnapshotsLoading } = useQuery({
        queryKey: ['fire-snapshots'],
        queryFn: async () => {
            const { data, error } = await (supabase as any)
                .from('fire_snapshots')
                .select('*')
                .order('snapshot_date', { ascending: false })
                .limit(4);
            if (error) throw error;
            return data as any[];
        }
    });

    // 3. Satellite Fire Events
    const { data: fireEvents, isLoading: fireEventsLoading } = useQuery({
        queryKey: ['fire-events', adminContext, selectedCityId],
        queryFn: async () => {
            let query = (supabase as any)
                .from('aqi_readings')
                .select('*, wards!inner(name, city)')
                .not('fire_risk_data', 'is', null)
                .order('recorded_at', { ascending: false })
                .limit(10);
            query = applyCityFilter(query, adminContext as any, selectedCityId);
            const { data, error } = await query;
            if (error) throw error;
            return (data as any[]).filter(d =>
                ['moderate', 'high', 'critical'].includes(d.fire_risk_data?.riskLevel)
            );
        },
        enabled: !!adminContext
    });

    return (
        <div className="p-8 space-y-10 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
                    <Bell className="h-8 w-8 mr-3 text-[#00D4FF]" />
                    Central Monitoring Hub
                </h1>
                <p className="text-gray-400 mt-2">Real-time oversight of air quality anomalies, satellite fire events, and regional health data.</p>
            </div>

            {/* NASA FIRMS PANEL */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <Flame className="h-5 w-5 mr-2 text-red-500" />
                        Real-Time Fire Activity (NASA FIRMS)
                    </h2>
                    <Badge className="bg-red-500/10 text-red-500 border-none px-3">
                        <span className="animate-pulse mr-2 w-2 h-2 rounded-full bg-red-500 block" />
                        LIVE SATELLITE FEED
                    </Badge>
                </div>

                {/* Regional Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {fireSnapshotsLoading ? (
                        [1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-[#132238] rounded-2xl animate-pulse" />)
                    ) : fireSnapshots?.map((snap: any) => (
                        <Card key={snap.id} className="bg-[#132238] border-[#1e2a3b] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                                <Globe className="h-12 w-12 text-white" />
                            </div>
                            <CardContent className="p-6">
                                <p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-widest">{snap.region_name}</p>
                                <div className="flex items-end gap-2">
                                    <h3 className="text-2xl font-black text-white">{snap.hotspot_count}</h3>
                                    <span className="text-xs text-red-400 font-bold mb-1">active fires</span>
                                </div>
                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold">
                                        <span className="text-gray-500">PEAK INTENSITY</span>
                                        <span className="text-white">{Math.round(snap.max_frp || 0)} MW</span>
                                    </div>
                                    <Progress value={Math.min(100, (snap.avg_frp || 0) / 10)} className="h-1 bg-gray-800" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Fire Impact Table */}
                <div className="bg-[#132238] rounded-3xl border border-[#1e2a3b] overflow-hidden">
                    <div className="p-6 border-b border-[#1e2a3b] flex justify-between items-center">
                        <h3 className="text-white font-bold flex items-center">
                            <Filter className="h-4 w-4 mr-2 text-gray-500" />
                            Satellite-Confirmed Smoke Impact Events
                        </h3>
                    </div>
                    <div>
                        {fireEventsLoading ? (
                            <div className="p-8 text-center text-gray-500">Loading detection logs...</div>
                        ) : fireEvents?.length === 0 ? (
                            <div className="p-12 text-center">
                                <ShieldAlert className="h-8 w-8 text-gray-700 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No high-risk biomass burning events detected across monitored cities.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#1e2a3b]">
                                {fireEvents?.map((event: any) => (
                                    <div key={event.id} className="p-5 flex items-center justify-between hover:bg-[#1a2b45] transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl ${event.fire_risk_data?.riskLevel === 'critical' ? 'bg-red-500/10' : 'bg-orange-500/10'}`}>
                                                <Flame className={`h-6 w-6 ${event.fire_risk_data?.riskLevel === 'critical' ? 'text-red-500' : 'text-orange-500'}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h4 className="text-white font-bold">{event.wards?.name}</h4>
                                                    <Badge variant="outline" className={`${event.fire_risk_data?.riskLevel === 'critical' ? 'text-red-400 border-red-500/20' : 'text-orange-400 border-orange-500/20'} text-[9px] uppercase font-black`}>
                                                        {event.fire_risk_data?.riskLevel} Risk
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-gray-400">{event.fire_risk_data?.riskSummary}</p>
                                                <div className="flex items-center text-[10px] text-gray-500 mt-2 gap-3">
                                                    <span className="flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> Peak AQI: {event.aqi_value}</span>
                                                    <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {Math.round(event.fire_risk_data?.nearestFireDistanceKm || 0)}km distance</span>
                                                    <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {new Date(event.recorded_at).toLocaleTimeString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <button className="text-xs font-bold text-[#00D4FF] bg-[#00D4FF]/10 px-3 py-1.5 rounded-lg hover:bg-[#00D4FF]/20 transition-colors">
                                                VIEW SMOKE PLUME
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* SYSTEM ALERTS PANEL */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <ShieldAlert className="h-5 w-5 mr-2 text-[#00D4FF]" />
                    General System Alerts
                </h2>
                <div className="grid grid-cols-1 gap-4">
                    {alertsLoading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-[#132238] rounded-2xl animate-pulse" />
                        ))
                    ) : alerts?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-[#132238]/50 rounded-3xl border border-dashed border-[#1e2a3b]">
                            <ShieldAlert className="h-12 w-12 text-gray-700 mb-4" />
                            <h3 className="text-white font-medium">No active pollution spikes</h3>
                            <p className="text-gray-500 text-sm">Industrial and traffic levels are currently within safe thresholds.</p>
                        </div>
                    ) : (
                        alerts?.map((alert: any) => (
                            <Card key={alert.id} className="bg-[#132238] border-[#1e2a3b] hover:bg-[#1a2b45] transition-colors border-l-4 border-l-cyan-500 overflow-hidden">
                                <CardContent className="p-5 flex items-center">
                                    <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 mr-5">
                                        <AlertTriangle className="h-6 w-6 text-cyan-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className="text-cyan-400 border-cyan-500/30 text-[10px] font-bold uppercase">
                                                Pollution Spike
                                            </Badge>
                                        </div>
                                        <h4 className="text-white font-bold text-lg">
                                            Elevated Pollution Spike Detected in {alert.wards?.name}
                                        </h4>
                                        <div className="flex items-center text-xs text-gray-500 mt-2 gap-4">
                                            <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {alert.wards?.city}</span>
                                            <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {new Date(alert.recorded_at).toLocaleString()}</span>
                                            <span className="flex items-center text-cyan-400 font-bold">AQI: {Math.round(alert.aqi_value)}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge className="bg-cyan-500/20 text-cyan-400 border-none font-bold">MONITORING</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}