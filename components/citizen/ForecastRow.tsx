'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Sun, Cloud, CloudRain, CloudLightning, Wind } from 'lucide-react';
import { getAQIDisplay } from '@/lib/aqi-utils';

interface ForecastData {
    time: string;
    temp: number;
    aqi: number;
    weatherCode: string; // Simplified for demo
}

interface ForecastRowProps {
    data: ForecastData[];
}

export const ForecastRow: React.FC<ForecastRowProps> = ({ data }) => {
    const getWeatherIcon = (code: string) => {
        switch (code) {
            case 'sun': return <Sun className="h-6 w-6 text-amber-500" />;
            case 'cloud': return <Cloud className="h-6 w-6 text-zinc-400" />;
            case 'rain': return <CloudRain className="h-6 w-6 text-blue-500" />;
            case 'storm': return <CloudLightning className="h-6 w-6 text-purple-500" />;
            default: return <Wind className="h-6 w-6 text-teal-500" />;
        }
    };

    return (
        <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4 pt-2">
            {data.map((item, index) => {
                const aqiDisplay = getAQIDisplay(item.aqi);
                return (
                    <Card key={index} className="flex min-w-[120px] flex-col items-center p-4 shadow-sm border-zinc-100">
                        <span className="text-xs font-medium text-zinc-500">{item.time}</span>
                        <div className="my-3">{getWeatherIcon(item.weatherCode)}</div>
                        <span className="text-lg font-bold text-zinc-900">{item.temp}°</span>
                        <div
                            className="mt-2 h-2 w-full rounded-full"
                            style={{ backgroundColor: aqiDisplay.color }}
                            title={`AQI: ${item.aqi}`}
                        />
                        <span className="mt-1 text-[10px] uppercase tracking-wider text-zinc-400">AQI {item.aqi}</span>
                    </Card>
                );
            })}
        </div>
    );
};
