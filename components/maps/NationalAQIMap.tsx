"use client";

import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { getAQIColor } from '@/lib/utils/aqi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Flame } from 'lucide-react';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const NATIONAL_CENTER: [number, number] = [78.9629, 20.5937];

export function NationalAQIMap() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const supabase = createClient();

    const { data: fires } = useQuery({
        queryKey: ['national-fires'],
        queryFn: async () => {
            const res = await fetch('/api/firms?bbox=68,8,97,37&days=1');
            if (!res.ok) return null;
            return res.json();
        },
        refetchInterval: 300000 // 5 mins
    });

    const { data: cityData, isLoading } = useQuery({
        queryKey: ['national-aqi-data'],
        queryFn: async () => {
            const { data: locations, error } = await supabase
                .from('locations')
                .select(`
                    id,
                    name,
                    city,
                    state,
                    latitude,
                    longitude,
                    aqi_readings (
                        aqi_value,
                        pm25,
                        pm10,
                        no2,
                        so2,
                        co,
                        o3,
                        recorded_at
                    )
                `)
                .order('recorded_at', { foreignTable: 'aqi_readings', ascending: false })
                .limit(1, { foreignTable: 'aqi_readings' });

            if (error) throw error;

            // Group by city and aggregate
            const cityMap: Record<string, any> = {};

            locations.forEach(loc => {
                const city = loc.city;
                if (!cityMap[city]) {
                    cityMap[city] = {
                        name: city,
                        lat: loc.latitude,
                        lon: loc.longitude,
                        state: loc.state || 'Region',
                        aqi: 0,
                        readingsCount: 0,
                        anomalies: 0,
                        pollutants: { pm25: 0, pm10: 0, no2: 0, so2: 0, co: 0, o3: 0 }
                    };
                }

                const readings = (loc as any).aqi_readings || [];
                readings.forEach((r: any) => {
                    cityMap[city].aqi += r.aqi_value;
                    cityMap[city].readingsCount += 1;
                    if (r.aqi_value > 300) cityMap[city].anomalies += 1;

                    // Aggregate pollutants for finding "top"
                    if (r.pm25) cityMap[city].pollutants.pm25 += r.pm25;
                    if (r.pm10) cityMap[city].pollutants.pm10 += r.pm10;
                });
            });

            return Object.values(cityMap).map((city: any) => {
                const avgAqi = city.readingsCount > 0 ? Math.round(city.aqi / city.readingsCount) : 0;

                // Simple logic for top pollutant
                const topPollutant = city.pollutants.pm25 > city.pollutants.pm10 ? 'PM2.5' : 'PM10';

                return {
                    name: city.name,
                    lat: city.lat,
                    lon: city.lon,
                    aqi: avgAqi,
                    state: city.state,
                    topPollutant,
                    anomalies: city.anomalies
                };
            }).sort((a, b) => b.aqi - a.aqi);
        }
    });

    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: NATIONAL_CENTER,
            zoom: 4,
            attributionControl: false
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.current.on('load', () => {
            if (!map.current) return;

            map.current.addSource('firms-fires', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });

            map.current.addLayer({
                id: 'firms-fires-layer',
                type: 'circle',
                source: 'firms-fires',
                paint: {
                    'circle-radius': [
                        'interpolate', ['linear'], ['get', 'frp'],
                        0, 3,
                        100, 8,
                        500, 15
                    ],
                    'circle-color': [
                        'match', ['get', 'confidence'],
                        'high', '#FF2200',
                        'nominal', '#FF7700',
                        'low', '#FFAA00',
                        '#FF7700'
                    ],
                    'circle-opacity': 0.8,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#fff'
                }
            });

            // Fire Popup logic
            const popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
                className: 'fire-popup'
            });

            map.current.on('mouseenter', 'firms-fires-layer', (e) => {
                map.current!.getCanvas().style.cursor = 'pointer';
                const coordinates = (e.features![0].geometry as any).coordinates.slice();
                const props = e.features![0].properties;

                popup.setLngLat(coordinates)
                    .setHTML(`
                        <div class="p-2 bg-[#0A1628] border border-orange-500/30 rounded text-white shadow-2xl">
                            <p class="text-[10px] font-bold text-orange-500 flex items-center mb-1">
                                <span class="animate-pulse mr-1">🔥</span> SATELLITE CONFIRMED FIRE
                            </p>
                            <div class="space-y-1">
                                <p class="text-[13px] font-bold">Intensity: ${props?.frp} MW</p>
                                <p class="text-[10px] text-gray-400 capitalize">Confidence: ${props?.confidence}</p>
                                <p class="text-[9px] text-gray-500">${props?.latitude}, ${props?.longitude}</p>
                            </div>
                        </div>
                    `)
                    .addTo(map.current!);
            });

            map.current.on('mouseleave', 'firms-fires-layer', () => {
                map.current!.getCanvas().style.cursor = '';
                popup.remove();
            });
        });

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    useEffect(() => {
        if (!map.current || !cityData) return;

        // Clean up old markers
        const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
        existingMarkers.forEach(m => m.remove());

        cityData.forEach((city) => {
            const el = document.createElement('div');
            el.className = 'national-marker';

            const hexColor = city.aqi > 300 ? '#ef4444' : city.aqi > 200 ? '#f97316' : city.aqi > 100 ? '#eab308' : '#22c55e';
            const size = Math.max(12, city.aqi / 10);

            el.style.backgroundColor = hexColor;
            el.style.width = `${size}px`;
            el.style.height = `${size}px`;
            el.style.borderRadius = '50%';
            el.style.border = '2px solid white';
            el.style.boxShadow = `0 0 15px ${hexColor}`;
            el.style.cursor = 'pointer';

            const category = city.aqi > 300 ? 'Hazardous' : city.aqi > 200 ? 'Poor' : city.aqi > 100 ? 'Moderate' : 'Good';

            new mapboxgl.Marker(el)
                .setLngLat([city.lon, city.lat])
                .setPopup(
                    new mapboxgl.Popup({ offset: 25, closeButton: false })
                        .setHTML(`
                            <div class="p-3 bg-[#0A1628] text-white border border-[#1e2a3b] rounded-lg shadow-xl min-w-[200px]">
                                <div class="flex items-center justify-between mb-2">
                                    <h3 class="font-bold text-lg">${city.name}</h3>
                                    <span class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">${city.state}</span>
                                </div>
                                <div class="space-y-2">
                                    <div class="flex justify-between items-center bg-[#132238] p-2 rounded">
                                        <span class="text-sm font-medium">Current AQI</span>
                                        <span class="text-xl font-black" style="color: ${hexColor}">${city.aqi}</span>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2">
                                        <div class="bg-[#132238] p-2 rounded flex flex-col items-center">
                                            <span class="text-[9px] text-gray-400 uppercase">Category</span>
                                            <span class="text-xs font-bold" style="color: ${hexColor}">${category}</span>
                                        </div>
                                        <div class="bg-[#132238] p-2 rounded flex flex-col items-center">
                                            <span class="text-[9px] text-gray-400 uppercase">Top Pollutant</span>
                                            <span class="text-xs font-bold text-teal-400">${city.topPollutant}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `)
                )
                .addTo(map.current!);
        });

        // Update FIRMS source
        if (fires?.hotspots && map.current.isStyleLoaded()) {
            const source = map.current.getSource('firms-fires') as mapboxgl.GeoJSONSource;
            if (source) {
                source.setData({
                    type: 'FeatureCollection',
                    features: fires.hotspots.map((h: any) => ({
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [h.longitude, h.latitude] },
                        properties: { ...h }
                    }))
                });
            }
        }
    }, [cityData, fires]);

    return (
        <Card className="bg-[#132238] border-[#1e2a3b] overflow-hidden group shadow-2xl relative h-full">
            <div className="absolute top-4 left-4 z-10 bg-[#0A1628]/80 backdrop-blur-md border border-[#1e2a3b] rounded-lg p-3">
                <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-2">AQI Legend</h3>
                <div className="space-y-1">
                    {[
                        { label: 'Hazardous (300+)', color: '#ef4444' },
                        { label: 'Poor (201-300)', color: '#f97316' },
                        { label: 'Moderate (101-200)', color: '#eab308' },
                        { label: 'Good (0-100)', color: '#22c55e' }
                    ].map(item => (
                        <div key={item.label} className="flex items-center space-x-2">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-[10px] text-gray-300 font-medium">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {fires?.hotspots && (
                <div className="absolute top-4 right-16 z-10">
                    <div className={`px-4 py-2 rounded-full border backdrop-blur-md transition-all flex items-center gap-2 shadow-2xl ${fires.hotspots.length > 50
                        ? 'bg-red-500/20 border-red-500/50 text-red-400'
                        : 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                        }`}>
                        <Flame className="h-4 w-4 animate-pulse" />
                        <span className="font-black text-sm">{fires.hotspots.length} ACTIVE FIRES DETECTED</span>
                    </div>
                </div>
            )}
            <CardHeader className="border-b border-[#1e2a3b] bg-[#0A1628]/50 flex flex-row items-center justify-between">
                <CardTitle className="text-white text-lg">National Air Quality Distribution</CardTitle>
                <Badge variant="outline" className="text-[#00D4FF] border-[#00D4FF]/30">LIVE National Stats</Badge>
            </CardHeader>
            <div ref={mapContainer} className="h-full min-h-[500px] w-full" />
        </Card>
    );
}

// Global styles for mapbox popups in high-prio dark mode
const mapStyle = `
.mapboxgl-popup-content {
    background: transparent !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
}
.mapboxgl-popup-tip {
    border-top-color: #0A1628 !important;
    border-bottom-color: #0A1628 !important;
}
`;
if (typeof document !== 'undefined') {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = mapStyle;
    document.head.appendChild(styleEl);
}
