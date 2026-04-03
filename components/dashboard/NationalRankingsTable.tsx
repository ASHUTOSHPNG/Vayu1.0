"use client";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

export function NationalRankingsTable() {
    const supabase = createClient();

    const { data: cityData, isLoading } = useQuery({
        queryKey: ['national-aqi-data'],
        queryFn: async () => {
            const { data: locations, error } = await (supabase as any)
                .from('wards')
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

            const locList = (locations ?? []) as Array<{
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
                        state: loc.state || 'Region',
                        aqi: 0,
                        readingsCount: 0,
                        anomalies: 0,
                        pollutants: { pm25: 0, pm10: 0, no2: 0, so2: 0, co: 0, o3: 0 }
                    };
                }
                const readings = loc.aqi_readings || [];
                readings.forEach((r) => {
                    cityMap[city].aqi += r.aqi_value;
                    cityMap[city].readingsCount += 1;
                    if (r.aqi_value > 300) cityMap[city].anomalies += 1;
                    if (r.pm25) cityMap[city].pollutants.pm25 += r.pm25;
                    if (r.pm10) cityMap[city].pollutants.pm10 += r.pm10;
                });
            });

            return Object.values(cityMap).map((city: any) => {
                const avgAqi = city.readingsCount > 0 ? Math.round(city.aqi / city.readingsCount) : 0;
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

    if (isLoading) {
        return <div className="h-[300px] bg-[#132238] animate-pulse rounded-xl" />;
    }

    return (
        <Card className="bg-[#132238] border-[#1e2a3b] shadow-2xl">
            <CardHeader className="border-b border-[#1e2a3b]">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg font-bold">India City Performance Rankings</CardTitle>
                    <span className="text-xs text-gray-500 font-medium">Sorted by highest AQI</span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-[#0A1628]/80 backdrop-blur-sm">
                        <TableRow className="border-[#1e2a3b] hover:bg-transparent">
                            <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest pl-6">Rank</TableHead>
                            <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">City</TableHead>
                            <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">State</TableHead>
                            <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest text-right">AQI</TableHead>
                            <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest text-right">Top Source</TableHead>
                            <TableHead className="text-gray-400 font-bold uppercase text-[10px] tracking-widest text-right pr-6">Anomalies</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cityData?.map((city, index) => (
                            <TableRow key={city.name} className="border-[#1e2a3b] hover:bg-[#1e2a3b]/50 group transition-all duration-300">
                                <TableCell className="text-gray-500 font-mono text-sm pl-6">{index + 1}</TableCell>
                                <TableCell className="text-white font-bold">{city.name}</TableCell>
                                <TableCell className="text-gray-400 text-sm">{city.state}</TableCell>
                                <TableCell className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-xs font-black shadow-lg ${city.aqi > 300 ? 'bg-red-500/20 text-red-500 shadow-red-500/10' :
                                        city.aqi > 200 ? 'bg-orange-500/20 text-orange-500 shadow-orange-500/10' :
                                            city.aqi > 100 ? 'bg-yellow-500/20 text-yellow-500 shadow-yellow-500/10' :
                                                'bg-green-500/20 text-green-500 shadow-green-500/10'
                                        }`}>
                                        {city.aqi}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge variant="outline" className="text-teal-400 border-teal-900/50 bg-teal-900/10">
                                        {city.topPollutant}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    {city.anomalies > 0 ? (
                                        <div className="flex items-center justify-end space-x-1 text-orange-500 font-bold text-sm">
                                            <span>{city.anomalies}</span>
                                            <AlertTriangle className="h-4 w-4" />
                                        </div>
                                    ) : (
                                        <span className="text-gray-600 text-sm italic">Clean</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}