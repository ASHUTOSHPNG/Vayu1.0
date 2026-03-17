"use client";

import { useState, useMemo } from 'react';
import { WardDataTable, WardMetric } from '@/components/dashboard/WardDataTable';
import { WardDetailPanel } from '@/components/dashboard/WardDetailPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileOutput, Loader2, MapPin } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAdminContext } from '@/lib/admin/useAdminContext';
import { useAdminStore } from '@/store/adminStore';
import { createClient } from '@/lib/supabase/client';
import { applyCityFilter } from '@/lib/admin/queryHelpers';

interface PolicyRecommendation {
    reasoning?: string;
    anomaly_summary?: string;
    actions?: string[];
    recommendation_text?: string;
}

export default function WardAnalysisPage() {
    const supabase = createClient();
    const { adminContext, cityName } = useAdminContext();
    const { selectedCityId } = useAdminStore();

    const activeCityName = selectedCityId || cityName;

    const [selectedWard, setSelectedWard] = useState<WardMetric | null>(null);
    const [recommendation, setRecommendation] = useState<PolicyRecommendation | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch real-time ward data
    const { data: wardsData, isLoading } = useQuery({
        queryKey: ['ward-metrics', adminContext, selectedCityId],
        queryFn: async () => {
            if (!adminContext) return [];

            // 1. Fetch locations in the city
            let locQuery = supabase.from('locations').select('*');
            locQuery = applyCityFilter(locQuery, adminContext, selectedCityId, true);
            const { data: locations, error: locError } = await locQuery;
            if (locError) throw locError;
            if (!locations.length) return [];

            const locationIds = locations.map(l => l.id);

            // 2. Fetch latest AQI readings for these locations
            const { data: readings, error: readingError } = await supabase
                .from('aqi_readings')
                .select('*')
                .in('location_id', locationIds)
                .order('recorded_at', { ascending: false });

            if (readingError) throw readingError;

            // Group by location and take latest
            const latestReadings: Record<string, any> = {};
            (readings as any[]).forEach(r => {
                if (!latestReadings[r.location_id]) {
                    latestReadings[r.location_id] = r;
                }
            });

            // 3. Map to WardMetric
            return locations.map(loc => {
                const reading = latestReadings[loc.id] || {};
                return {
                    id: loc.id,
                    name: loc.name,
                    aqiValue: reading.aqi_value || 0,
                    pm25: reading.pm25 || 0,
                    pm10: reading.pm10 || 0,
                    no2: reading.no2 || 0,
                    anomalyScore: reading.anomaly_score || 0,
                    topSource: reading.source || 'STATIONARY',
                    lastUpdated: reading.recorded_at || new Date().toISOString()
                } as WardMetric;
            }).sort((a, b) => b.aqiValue - a.aqiValue);
        },
        enabled: !!adminContext,
        refetchInterval: 30000 // Refresh every 30s
    });

    const recommendMutation = useMutation({
        mutationFn: async (wardId: string) => {
            const res = await fetch('/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ locationId: wardId })
            });
            if (!res.ok) throw new Error('Recommendation failed');
            return res.json();
        },
        onSuccess: (data) => {
            setRecommendation(data);
            setIsModalOpen(true);
        }
    });

    return (
        <div className="w-full space-y-6">
            {/* 1. Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
                        Ward-Level Analysis
                        {activeCityName && (
                            <Badge variant="outline" className="ml-2 border-[#00D4FF] text-[#00D4FF] bg-[#00D4FF]/10 h-6 px-3">
                                <MapPin className="w-3 h-3 mr-1" />
                                {activeCityName}
                            </Badge>
                        )}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {selectedCityId ? 'Multi-Jurisdictional' : adminContext?.type === 'city_admin' ? 'Local Corporation' : 'National'} Monitoring Interface
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Tabs defaultValue="7d" className="w-[150px]">
                        <TabsList className="bg-[#132238] border border-[#1e2a3b] h-9">
                            <TabsTrigger value="7d" className="text-xs">7D</TabsTrigger>
                            <TabsTrigger value="30d" className="text-xs">30D</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Button variant="outline" className="border-[#1e2a3b] bg-[#132238] text-gray-400 hover:text-white h-9 px-3">
                        <FileOutput className="h-4 w-4 mr-2" /> Export
                    </Button>
                </div>
            </div>

            {/* 2. Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8">
                    {isLoading ? (
                        <div className="h-[400px] flex items-center justify-center bg-[#132238] rounded-xl border border-[#1e2a3b]">
                            <Loader2 className="h-8 w-8 animate-spin text-[#00D4FF]" />
                        </div>
                    ) : wardsData?.length ? (
                        <WardDataTable
                            data={wardsData}
                            selectedId={selectedWard?.id}
                            onRowClick={(ward) => setSelectedWard(ward)}
                        />
                    ) : (
                        <div className="h-[200px] flex flex-col items-center justify-center bg-[#132238] rounded-xl border border-[#1e2a3b] text-gray-500">
                            <MapPin className="h-8 w-8 mb-2 opacity-20" />
                            <p>No locations monitored in this scope</p>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-4 h-full sticky top-[20px]">
                    <WardDetailPanel
                        ward={selectedWard}
                        onGenerateRecommendation={(id) => recommendMutation.mutate(id)}
                    />
                </div>
            </div>

            {/* 3. Recommendation Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-[#0A1628] border border-[#00D4FF]/30 text-white max-w-2xl max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <DialogHeader>
                        <DialogTitle className="flex items-center text-[#00D4FF]">
                            <Loader2 className="h-5 w-5 mr-3 animate-spin hidden" />
                            GenAI Policy Insight
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Automated intervention strategy for {selectedWard?.name} based on current pollutants and ML source detection.
                        </DialogDescription>
                    </DialogHeader>

                    {recommendation && (
                        <div className="space-y-6 py-4">
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                                <h4 className="text-sm font-bold text-red-400 mb-1 uppercase tracking-wide">Threat Assessment</h4>
                                <p className="text-sm text-gray-300 italic">{recommendation.reasoning || recommendation.anomaly_summary}</p>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-white border-l-2 border-[#00D4FF] pl-3">Recommended Actions</h4>
                                <ul className="space-y-2">
                                    {(recommendation.actions || [recommendation.recommendation_text])
                                        .filter((action): action is string => !!action)
                                        .map((action, i) => (
                                            <li key={i} className="flex items-start text-sm text-gray-300">
                                                <span className="text-[#00D4FF] mr-3 font-bold">{i + 1}.</span>
                                                {action}
                                            </li>
                                        ))}
                                </ul>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-[#1e2a3b]">
                                <Button
                                    className="bg-[#00D4FF] hover:bg-[#00D4FF]/80 text-black font-bold px-8"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Acknowledge
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
