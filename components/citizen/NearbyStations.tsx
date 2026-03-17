'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, ArrowRight } from 'lucide-react';
import { getAQIDisplay } from '@/lib/aqi-utils';

interface Station {
    id: string;
    name: string;
    distance: number;
    aqi: number;
}

interface NearbyStationsProps {
    stations: Station[];
    onSelect: (station: Station) => void;
}

export const NearbyStations: React.FC<NearbyStationsProps> = ({ stations, onSelect }) => {
    return (
        <Card className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col gap-4 hover:border-teal-500/20 transition-colors">
            <h3 className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Monitoring Stations Nearby</h3>
            <div className="flex flex-col gap-3">
                {stations.map((station) => {
                    const display = getAQIDisplay(station.aqi);
                    return (
                        <div
                            key={station.id}
                            onClick={() => onSelect(station)}
                            className="group flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-teal-500/30 transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white/10 border border-white/10">
                                    <MapPin className="h-4 w-4 text-zinc-400 group-hover:text-teal-400 transition-colors" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{station.name}</p>
                                    <p className="text-xs text-zinc-500">{station.distance} km away</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm font-black" style={{ color: display.color }}>{station.aqi}</p>
                                    <p className="text-[10px] text-zinc-500 font-medium">{display.category}</p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-teal-400 transition-all transform group-hover:translate-x-1" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};
