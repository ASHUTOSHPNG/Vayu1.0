"use client";
import { useState, useMemo } from 'react';
import { PollutionSourceCard, PollutionSourceData } from '@/components/dashboard/PollutionSourceCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, BrainCircuit, Download, Filter, AreaChart, Loader2, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAdminContext } from '@/lib/admin/useAdminContext';
import { useAdminStore } from '@/store/adminStore';
import { createClient } from '@/lib/supabase/client';
import { applyCityFilter } from '@/lib/admin/queryHelpers';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

const SOURCE_COLORS: Record<string, string> = {
    'traffic': '#00D4FF',
    'construction': '#34d399',
    'industrial': '#fbbf24',
    'biomass_burning': '#a78bfa',
    'unknown': '#4b5563'
};

const SOURCE_LABELS: Record<string, string> = {
    'traffic': 'Traffic',
    'construction': 'Construction',
    'industrial': 'Industrial',
    'biomass_burning': 'Biomass',
    'unknown': 'Unknown'
};

export default function SourceDetectionPage() {
    const supabase = createClient();
    const { adminContext, cityName, isCentralAdmin } = useAdminContext();
    const { selectedCityId } = useAdminStore();
    const activeCityName = selectedCityId || cityName || (isCentralAdmin ? 'All Cities' : null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSource, setFilterSource] = useState('all');

    const { data: sourceData, isLoading } = useQuery({
        queryKey: ['source-apportionment', adminContext, selectedCityId],
        queryFn: async () => {
            if (!adminContext) return [];

            // 1. Get locations — doesn't exist in schema, cast to any
            let locQuery = (supabase as any).from('wards').select('id, name, latitude, longitude');
            locQuery = applyCityFilter(locQuery, adminContext, selectedCityId, true);
            const { data: locationsRaw, error: locError } = await locQuery;
            if (locError) throw locError;

            const locations = (locationsRaw ?? []) as Array<{
                id: string;
                name: string;
                latitude: number;
                longitude: number;
            }>;

            if (!locations.length) return [];
            const locationIds = locations.map(l => l.id);

            // 2. Get recent detections — pollution_sources doesn't exist in schema
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const { data: detections, error: detError } = await (supabase as any)
                .from('pollution_sources')
                .select('*')
                .in('location_id', locationIds)
                .gte('detected_at', sevenDaysAgo.toISOString());
            if (detError) throw detError;

            // 3. Get latest anomaly scores
            const { data: readings, error: readError } = await supabase
                .from('aqi_readings')
                .select('ward_id, anomaly_score, recorded_at')
                .in('ward_id', locationIds)
                .order('recorded_at', { ascending: false });
            if (readError) throw readError;

            const latestAnomaly: Record<string, number> = {};
            (readings as any[]).forEach(r => {
                if (!latestAnomaly[r.ward_id]) {
                    latestAnomaly[r.ward_id] = r.anomaly_score || 0;
                }
            });

            // 4. Process and group
            return locations.map(loc => {
                const locDetections = (detections as any[]).filter(d => d.location_id === loc.id);
                const total = locDetections.length || 1;

                const counts: Record<string, number> = {};
                locDetections.forEach(d => {
                    counts[d.source_type] = (counts[d.source_type] || 0) + 1;
                });

                const sources = Object.entries(counts).map(([type, count]) => ({
                    type: SOURCE_LABELS[type] || type,
                    percentage: Math.round((count / total) * 100),
                    color: SOURCE_COLORS[type] || SOURCE_COLORS.unknown
                })).sort((a, b) => b.percentage - a.percentage);

                if (sources.length === 0) {
                    sources.push({ type: 'Stationary', percentage: 100, color: '#4b5563' });
                }

                return {
                    id: loc.id,
                    locationName: loc.name,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    anomalyScore: latestAnomaly[loc.id] || 0,
                    lastDetected: locDetections[0]?.detected_at || new Date().toISOString(),
                    sources
                } as any;
            }).sort((a, b) => b.anomalyScore - a.anomalyScore);
        },
        enabled: !!adminContext
    });

    const filteredData = useMemo(() => {
        if (!sourceData) return [];
        return sourceData.filter((item: any) => {
            const matchesSearch = item.locationName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterSource === 'all' || item.sources.some((s: any) => s.type.toLowerCase() === filterSource.toLowerCase());
            return matchesSearch && matchesFilter;
        });
    }, [sourceData, searchTerm, filterSource]);

    const handleExport = () => {
        const headers = ['Location', 'Anomaly Score', 'Primary Source', 'Distribution'];
        const rows = filteredData.map((item: any) => [
            item.locationName,
            item.anomalyScore.toFixed(1),
            item.sources[0]?.type || 'N/A',
            item.sources.map((s: any) => `${s.type}:${s.percentage}%`).join(' | ')
        ]);
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `airsense_sources_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <BrainCircuit className="h-6 w-6 text-cyan-400" />
                        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                            Source Apportionment Engine
                            {activeCityName && (
                                <Badge variant="outline" className="ml-2 border-[#00D4FF] text-[#00D4FF] bg-[#00D4FF]/10 h-6 px-3">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {activeCityName}
                                </Badge>
                            )}
                        </h1>
                    </div>
                    <p className="text-sm text-gray-500 max-w-xl">
                        Using multi-pollutant ratios and local emission patterns to identify the probable origins of detected pollution anomalies.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        className="bg-[#132238] border-[#1e2a3b] text-gray-400 hover:text-white hover:bg-[#1e2a3b]"
                        variant="outline"
                        onClick={handleExport}
                    >
                        <Download className="h-4 w-4 mr-2" /> Export CSV
                    </Button>
                </div>
            </div>

            <Card className="bg-[#0A1628]/50 border-cyan-500/20 shadow-inner">
                <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 rounded-full bg-cyan-500/10 shrink-0">
                        <AreaChart className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">How it works</h4>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                            The VAYU ML model analyzes the CO/NO2 and PM2.5/PM10 secondary ratios across our sensor network. By correlating these shifts with high-resolution weather vectors, we can calculate the probability of specific source contributions in real-time.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col md:flex-row gap-4 bg-[#132238] border border-[#1e2a3b] p-4 rounded-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search by ward or station name..."
                        className="pl-10 bg-[#0A1628] border-[#1e2a3b] text-white focus-visible:ring-cyan-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase px-2">
                        <Filter className="h-3 w-3" /> Filter Dominant Source:
                    </div>
                    <Select value={filterSource} onValueChange={setFilterSource}>
                        <SelectTrigger className="w-[180px] bg-[#0A1628] border-[#1e2a3b] text-white">
                            <SelectValue placeholder="All Sources" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#132238] border-[#1e2a3b] text-white">
                            <SelectItem value="all">All Sources</SelectItem>
                            <SelectItem value="traffic">Traffic</SelectItem>
                            <SelectItem value="construction">Construction</SelectItem>
                            <SelectItem value="industrial">Industrial</SelectItem>
                            <SelectItem value="biomass">Biomass</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-[250px] bg-[#132238] rounded-xl border border-[#1e2a3b] animate-pulse" />
                    ))
                ) : filteredData.length > 0 ? (
                    filteredData.map((item) => (
                        <PollutionSourceCard key={item.id} data={item} />
                    ))
                ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-[#1e2a3b] rounded-2xl">
                        <Search className="h-10 w-10 mb-4 opacity-20" />
                        <p>No results match your current search and filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}