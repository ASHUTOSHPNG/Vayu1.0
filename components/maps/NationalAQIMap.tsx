"use client";
import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers, Flame } from 'lucide-react';
import L from 'leaflet';

const INDIA_CENTER: [number, number] = [22.5, 80.0];
const INDIA_BOUNDS: L.LatLngBoundsExpression = [[6.0, 68.0], [38.0, 98.5]];
const WINDY_URL = `https://embed.windy.com/embed2.html?lat=22.5&lon=80.0&zoom=5&level=surface&overlay=temp&product=ecmwf&menu=&message=&marker=&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=km/h&metricTemp=°C&radarRange=-1`;

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
                <Tooltip>🔥 {h.frp} MW — {h.confidence} confidence</Tooltip>
            </CircleMarker>
        ))}
    </>;
}

export function NationalAQIMap() {
    const supabase = createClient();
    const [activeLayer, setActiveLayer] = useState<'heatmap' | 'satellite'>('heatmap');
    const [showFires, setShowFires] = useState(false);

    const { data: fires } = useQuery({
        queryKey: ['national-fires'],
        queryFn: async () => {
            const res = await fetch('/api/firms?bbox=68,8,97,37&days=1');
            if (!res.ok) return null;
            return res.json();
        },
        enabled: showFires,
        refetchInterval: 300000
    });

    const { data: cityData } = useQuery({
        queryKey: ['national-aqi-data'],
        queryFn: async () => {
            const { data: locations, error } = await supabase
                .from('wards')
                .select(`
                    id, name, city, state, latitude, longitude,
                    aqi_readings (
                        aqi_value, pm25, pm10, recorded_at
                    )
                `);

            if (error) throw error;

            // wards schema doesn't have city/state/latitude/longitude — cast to any
            const locList = (locations ?? []) as any[] as Array<{
    id: string;
    name: string;
    city: string;
    state: string | null;
    latitude: number;
    longitude: number;
    aqi_readings: Array<{ aqi_value: number; pm25: number | null; pm10: number | null; recorded_at: string }>;
}>;

            const cityMap: Record<string, any> = {};
            locList.forEach(loc => {
                const city = loc.city;
                if (!cityMap[city]) {
                    cityMap[city] = {
                        name: city,
                        lat: loc.latitude,
                        lon: loc.longitude,
                        state: loc.state || '',
                        aqi: 0,
                        readingsCount: 0,
                        pollutants: { pm25: 0, pm10: 0 }
                    };
                }
                const readings = (loc.aqi_readings || [])
                    .sort((a, b) =>
                        new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
                    )
                    .slice(0, 1);

                readings.forEach((r) => {
                    cityMap[city].aqi += r.aqi_value;
                    cityMap[city].readingsCount += 1;
                    if (r.pm25) cityMap[city].pollutants.pm25 += r.pm25;
                    if (r.pm10) cityMap[city].pollutants.pm10 += r.pm10;
                });
            });

            return Object.values(cityMap).map((city: any) => {
                const avgAqi = city.readingsCount > 0 ? Math.round(city.aqi / city.readingsCount) : 0;
                const topPollutant = city.pollutants.pm25 > city.pollutants.pm10 ? 'PM2.5' : 'PM10';
                return { name: city.name, lat: city.lat, lon: city.lon, aqi: avgAqi, state: city.state, topPollutant };
            }).sort((a, b) => b.aqi - a.aqi);
        }
    });

    return (
        <Card className="bg-[#132238] border-[#1e2a3b] h-[590px] flex flex-col overflow-hidden relative group shadow-2xl">
            <CardHeader
                className="p-4 pb-2 flex flex-row items-center justify-between border-b border-[#1e2a3b] bg-[#0A1628]/80 backdrop-blur-sm absolute top-0 w-full left-0"
                style={{ zIndex: 1000 }}
            >
                <CardTitle className="text-lg font-bold text-white flex items-center">
                    <Layers className="w-5 h-5 mr-2 text-[#00D4FF]" />
                    Spatial Interpolation Engine
                </CardTitle>
                <div className="flex items-center gap-2">
                    {fires?.hotspots && showFires && (
                        <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1 ${
                            fires.hotspots.length > 50
                                ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                : 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                        }`}>
                            <Flame className="h-3 w-3 animate-pulse" />
                            {fires.hotspots.length} FIRES
                        </div>
                    )}
                    <div className="flex bg-[#0A1628] rounded-md border border-[#1e2a3b] p-1 shadow-inner gap-1">
                        <button
                            onClick={() => setActiveLayer('heatmap')}
                            className={`px-3 py-1 text-xs font-semibold rounded ${activeLayer === 'heatmap' ? 'bg-[#00D4FF] text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            Heatmap
                        </button>
                        <button
                            onClick={() => setActiveLayer('satellite')}
                            className={`px-3 py-1 text-xs font-semibold rounded ${activeLayer === 'satellite' ? 'bg-[#00D4FF] text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                            Satellite
                        </button>
                        <div className="w-[1px] bg-[#1e2a3b] mx-1" />
                        <button
                            onClick={() => setShowFires(!showFires)}
                            className={`px-3 py-1 text-xs font-semibold rounded flex items-center ${showFires ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Flame className={`w-3 h-3 mr-1 ${showFires ? 'animate-pulse' : ''}`} />
                            Fire Hotspots
                        </button>
                    </div>
                </div>
            </CardHeader>

            <div className="flex-1 w-full relative" style={{ marginTop: '60px', background: '#0A1628' }}>
                {activeLayer === 'heatmap' ? (
                    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
                        <iframe
                            src={WINDY_URL}
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
                    <MapContainer
                        center={INDIA_CENTER}
                        zoom={5}
                        style={{ width: '100%', height: '100%' }}
                        zoomControl={false}
                        maxBounds={INDIA_BOUNDS}
                        maxBoundsViscosity={1.0}
                        minZoom={4}
                        worldCopyJump={false}
                    >
                        <ZoomControl position="bottomright" />
                        <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            attribution="Tiles &copy; Esri"
                            bounds={INDIA_BOUNDS}
                            noWrap={true}
                        />
                        {cityData?.map((city) => {
                            const color = city.aqi > 300 ? '#ef4444'
                                : city.aqi > 200 ? '#f97316'
                                : city.aqi > 100 ? '#eab308'
                                : '#22c55e';
                            const category = city.aqi > 300 ? 'Hazardous'
                                : city.aqi > 200 ? 'Poor'
                                : city.aqi > 100 ? 'Moderate' : 'Good';
                            return (
                                <CircleMarker
                                    key={city.name}
                                    center={[city.lat, city.lon]}
                                    radius={Math.max(8, Math.min(city.aqi / 20, 20))}
                                    pathOptions={{ color: '#FFFFFF', weight: 2, fillColor: color, fillOpacity: 0.9 }}
                                >
                                    <Tooltip>
                                        <strong>{city.name}</strong> — AQI {city.aqi} ({category})<br />Top: {city.topPollutant}
                                    </Tooltip>
                                </CircleMarker>
                            );
                        })}
                        {showFires && <FireMarkers fireData={fires} />}
                    </MapContainer>
                )}
            </div>

            {activeLayer === 'satellite' && (
                <div className="absolute bottom-6 left-4 z-[1000]">
                    <div className="p-3 bg-[#0A1628]/90 backdrop-blur-md border border-[#1e2a3b] rounded-xl shadow-xl">
                        <p className="text-[10px] text-white font-bold mb-2 uppercase tracking-widest">AQI Legend</p>
                        <div className="space-y-1">
                            {[
                                { label: 'Hazardous (300+)', color: '#ef4444' },
                                { label: 'Poor (201-300)', color: '#f97316' },
                                { label: 'Moderate (101-200)', color: '#eab308' },
                                { label: 'Good (0-100)', color: '#22c55e' },
                            ].map(item => (
                                <div key={item.label} className="flex items-center space-x-2">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-[10px] text-gray-300">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showFires && fires?.hotspots && activeLayer === 'satellite' && (
                <div className="absolute bottom-6 right-4 z-[1000]">
                    <div className="p-3 bg-[#0A1628]/90 backdrop-blur-md border border-[#1e2a3b] rounded-xl shadow-xl">
                        <p className="text-[10px] text-orange-500 font-bold mb-2 uppercase tracking-widest flex items-center">
                            <Flame className="w-3 h-3 mr-1" /> NASA FIRMS
                        </p>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#FF2200]" /><span className="text-[9px] text-gray-300">High Confidence</span></div>
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#FF6600]" /><span className="text-[9px] text-gray-300">Nominal</span></div>
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#FFAA00]" /><span className="text-[9px] text-gray-300">Low</span></div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}