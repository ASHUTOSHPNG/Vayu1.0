"use client";
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap, CircleMarker, Tooltip, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { useAQISubscription } from '@/lib/realtime/useAQISubscription';
import { useAQIStore } from '@/store/aqiStore';
import { getAQICategory } from '@/lib/utils/aqi';
import { createClient } from '@/lib/supabase/client';
import { useAdminContext } from '@/lib/admin/useAdminContext';
import { useAdminStore } from '@/store/adminStore';
import { applyCityFilter } from '@/lib/admin/queryHelpers';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, Flame } from 'lucide-react';
import { AQIColorScale } from '@/components/shared/AQIColorScale';
import { formatDistanceToNow } from 'date-fns';
import { useDebounce } from '@/lib/hooks/useDebounce';
import L from 'leaflet';

const CITY_COORDINATES: Record<string, { lat: number, lng: number, zoom: number }> = {
    'Mumbai': { lat: 19.0760, lng: 72.8777, zoom: 11 },
    'New Delhi': { lat: 28.6139, lng: 77.2090, zoom: 11 },
    'Delhi': { lat: 28.6139, lng: 77.2090, zoom: 11 },
    'Bangalore': { lat: 12.9716, lng: 77.5946, zoom: 11 },
    'Chennai': { lat: 13.0827, lng: 80.2707, zoom: 11 },
    'Kolkata': { lat: 22.5726, lng: 88.3639, zoom: 11 },
    'Hyderabad': { lat: 17.3850, lng: 78.4867, zoom: 11 },
    'Ahmedabad': { lat: 23.0225, lng: 72.5714, zoom: 11 },
    'Pune': { lat: 18.5204, lng: 73.8567, zoom: 11 },
    'Jaipur': { lat: 26.9124, lng: 75.7873, zoom: 11 },
    'Lucknow': { lat: 26.8467, lng: 80.9462, zoom: 11 },
};

const INDIA_BOUNDS: L.LatLngBoundsExpression = [
    [6.0, 68.0],
    [38.0, 98.5],
];

function FireMarkers({ fireData }: { fireData: any }) {
    if (!fireData?.hotspots) return null;
    return <>
        {fireData.hotspots.map((h: any, i: number) => (
            <CircleMarker
                key={i}
                center={[h.latitude, h.longitude]}
                radius={h.frp > 200 ? 10 : h.frp > 50 ? 7 : 4}
                pathOptions={{
                    color: '#FFFFFF',
                    weight: 1.5,
                    fillColor: h.confidence === 'high' ? '#FF2200' : h.confidence === 'nominal' ? '#FF6600' : '#FFAA00',
                    fillOpacity: 0.85
                }}
            >
                <Tooltip>Fire - {h.confidence} confidence</Tooltip>
            </CircleMarker>
        ))}
    </>;
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => { map.setView(center, map.getZoom()); }, [center, map]);
    return null;
}

export function CityHeatMap() {
    const supabase = createClient();
    const { adminContext, cityName } = useAdminContext();
    const { selectedCityId } = useAdminStore();
    const activeCity = selectedCityId || cityName;

    const [center, setCenter] = useState<[number, number]>([23.0, 80.0]);
    const [zoom, setZoom] = useState(6);
    const [activeLayer, setActiveLayer] = useState<'heatmap' | 'satellite'>('heatmap');
    const [showFires, setShowFires] = useState(false);
    const [viewState, setViewState] = useState({
        longitude: 80.0,
        latitude: 23.0,
        zoom: 6,
    });

    const debouncedViewState = useDebounce(viewState, 1000);

    useEffect(() => {
        if (activeCity && CITY_COORDINATES[activeCity]) {
            const coords = CITY_COORDINATES[activeCity];
            setCenter([coords.lat, coords.lng]);
            setZoom(coords.zoom);
            setViewState({ longitude: coords.lng, latitude: coords.lat, zoom: coords.zoom });
        }
    }, [activeCity]);

    useAQISubscription();
    const readings = useAQIStore((state) => state.readings);

    const { data: locations } = useQuery({
        queryKey: ['locations', adminContext, selectedCityId],
        queryFn: async () => {
            if (!adminContext) return [];
            let query = supabase.from('locations').select('*');
            query = applyCityFilter(query, adminContext, selectedCityId, true);
            const { data, error } = await query;
            if (error) throw error;
            return data;
        },
        enabled: !!adminContext
    });

    const { data: fireData } = useQuery({
        queryKey: ['firms-data', debouncedViewState.longitude, debouncedViewState.latitude],
        queryFn: async () => {
            if (!showFires) return null;
            const latDelta = 2 / Math.pow(2, debouncedViewState.zoom - 8);
            const lonDelta = latDelta * 1.5;
            const bbox = `${(debouncedViewState.longitude - lonDelta).toFixed(4)},${(debouncedViewState.latitude - latDelta).toFixed(4)},${(debouncedViewState.longitude + lonDelta).toFixed(4)},${(debouncedViewState.latitude + latDelta).toFixed(4)}`;
            const res = await fetch(`/api/firms?bbox=${bbox}&days=1`);
            if (!res.ok) return null;
            return res.json();
        },
        enabled: showFires,
        staleTime: 60000
    });

    // Windy iframe URL - centered on India
    const windyUrl = `https://embed.windy.com/embed2.html?lat=23.0&lon=80.0&zoom=9&level=surface&overlay=temp&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km/h&metricTemp=°C&radarRange=-1`;

    return (
        <Card className="bg-[#132238] border-[#1e2a3b] h-[590px] flex flex-col overflow-hidden relative group shadow-2xl">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between border-b border-[#1e2a3b] z-10 bg-[#0A1628]/80 backdrop-blur-sm absolute top-0 w-full left-0" style={{ zIndex: 1000 }}>
                <CardTitle className="text-lg font-bold text-white flex items-center">
                    <Layers className="w-5 h-5 mr-2 text-[#00D4FF]" />
                    {activeCity ? `${activeCity} Spatial AQI Engine` : 'Spatial Interpolation Engine'}
                </CardTitle>
                <div className="flex bg-[#0A1628] rounded-md border border-[#1e2a3b] p-1 shadow-inner gap-1">
                    <button onClick={() => setActiveLayer('heatmap')} className={`px-3 py-1 text-xs font-semibold rounded ${activeLayer === 'heatmap' ? 'bg-[#00D4FF] text-black' : 'text-gray-400 hover:text-white'}`}>Heatmap</button>
                    <button onClick={() => setActiveLayer('satellite')} className={`px-3 py-1 text-xs font-semibold rounded ${activeLayer === 'satellite' ? 'bg-[#00D4FF] text-black' : 'text-gray-400 hover:text-white'}`}>Satellite</button>
                    <div className="w-[1px] bg-[#1e2a3b] mx-1" />
                    <button onClick={() => setShowFires(!showFires)} className={`px-3 py-1 text-xs font-semibold rounded flex items-center ${showFires ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                        <Flame className={`w-3 h-3 mr-1 ${showFires ? 'animate-pulse' : ''}`} />
                        Fire Hotspots
                    </button>
                </div>
            </CardHeader>

            <div className="flex-1 w-full relative" style={{ marginTop: '60px', background: '#0A1628' }}>
                {activeLayer === 'heatmap' ? (
                    // ✅ Windy embed - temperature heatmap
                   <div style={{ 
    width: '100%', 
    height: '100%', 
    overflow: 'hidden',
    position: 'relative'
}}>
    <iframe
        src={windyUrl}
        style={{ 
            width: '100%', 
            height: 'calc(100% + 300px)',
            border: 'none',
            marginTop: '-350px',
            minHeight: '850px'
        }}
        allowFullScreen
    />
</div>
                ) : (
                    // ✅ Leaflet satellite map
                    <MapContainer
                        center={center}
                        zoom={zoom}
                        style={{ width: '100%', height: '100%' }}
                        zoomControl={false}
                        maxBounds={INDIA_BOUNDS}
                        maxBoundsViscosity={1.0}
                        minZoom={5}
                        worldCopyJump={false}
                    >
                        <MapUpdater center={center} />
                        <ZoomControl position="bottomright" />
                        <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            attribution="Tiles &copy; Esri"
                            bounds={INDIA_BOUNDS}
                            noWrap={true}
                        />
                        {showFires && <FireMarkers fireData={fireData} />}
                        {locations?.map((loc: any) => {
                            const reading = readings[loc.id];
                            const aqi = reading?.aqi || 0;
                            const category = getAQICategory(aqi);
                            return (
                                <CircleMarker
                                    key={loc.id}
                                    center={[loc.latitude, loc.longitude]}
                                    radius={8}
                                    pathOptions={{
                                        color: '#FFFFFF',
                                        weight: 2,
                                        fillColor: category.color,
                                        fillOpacity: 1
                                    }}
                                >
                                    <Tooltip>{loc.name}: AQI {aqi} ({category.label})</Tooltip>
                                </CircleMarker>
                            );
                        })}
                    </MapContainer>
                )}
            </div>

            {/* Legend - only show on satellite */}
            {false && (
                <div className="absolute bottom-6 left-6 flex flex-col gap-3" style={{ zIndex: 1000 }}>
                    {showFires && fireData && (
                        <div className="p-3 bg-[#0A1628]/90 backdrop-blur-md border border-[#1e2a3b] rounded-xl shadow-xl">
                            <p className="text-[10px] text-orange-500 font-bold mb-2 uppercase tracking-widest flex items-center">
                                <Flame className="w-3 h-3 mr-1" /> Fire Hotspots (NASA FIRMS)
                            </p>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#FF2200]" /><span className="text-[9px] text-gray-300">High Confidence</span></div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#FF6600]" /><span className="text-[9px] text-gray-300">Nominal</span></div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#FFAA00]" /><span className="text-[9px] text-gray-300">Low</span></div>
                                <p className="text-[8px] text-gray-500 mt-2">{fireData.queriedAt ? formatDistanceToNow(new Date(fireData.queriedAt)) : 'recent'} ago</p>
                            </div>
                        </div>
                    )}
                    <div className="p-3 bg-[#0A1628]/90 backdrop-blur-md border border-[#1e2a3b] rounded-xl shadow-xl">
                        <p className="text-[10px] text-gray-400 font-semibold mb-2 uppercase tracking-wider">AQI Density</p>
                        <AQIColorScale />
                    </div>
                </div>
            )}
        </Card>
    );
}