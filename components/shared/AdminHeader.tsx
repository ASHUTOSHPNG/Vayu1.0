"use client";
import { useState, useEffect } from 'react';
import { Bell, ChevronDown, MapPin, Loader2 } from 'lucide-react';
import { useAQISubscription } from '@/lib/realtime/useAQISubscription';
import { useAdminContext } from '@/lib/admin/useAdminContext';
import { useAdminStore } from '@/store/adminStore';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function AdminHeader() {
    const supabase = createClient();
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const { isConnected } = useAQISubscription();
    const { adminContext, isCentralAdmin, isCityAdmin, cityName } = useAdminContext();
    const { selectedCityId, setSelectedCityId } = useAdminStore();
    const unreadNotifications = 3;

    const { data: cities, isLoading: isCitiesLoading } = useQuery({
        queryKey: ['available-cities'],
        queryFn: async () => {
            const { data: locations, error } = await (supabase as any)
                .from('wards')
                .select('city, aqi_readings(aqi_value, recorded_at)')
                .order('recorded_at', { foreignTable: 'aqi_readings', ascending: false })
                .limit(1, { foreignTable: 'aqi_readings' })
                .order('city');

            if (error) throw error;

            const locList = (locations ?? []) as Array<{
                city: string;
                aqi_readings: Array<{ aqi_value: number; recorded_at: string }>;
            }>;

            const cityMap: Record<string, { name: string, aqiTotal: number, count: number }> = {};
            locList.forEach(loc => {
                if (!cityMap[loc.city]) {
                    cityMap[loc.city] = { name: loc.city, aqiTotal: 0, count: 0 };
                }
                const readings = loc.aqi_readings || [];
                if (readings.length > 0) {
                    const latestReading = readings.sort((a, b) =>
                        new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
                    )[0];
                    cityMap[loc.city].aqiTotal += latestReading.aqi_value;
                    cityMap[loc.city].count += 1;
                }
            });

            const cityList = Object.entries(cityMap).map(([name, data]) => ({
                id: name,
                name: name,
                aqi: data.count > 0 ? Math.round(data.aqiTotal / data.count) : 0
            }));

            const totalAvg = cityList.length > 0
                ? cityList.reduce((acc, c) => acc + c.aqi, 0) / cityList.length
                : 0;

            return [
                { id: 'all', name: '🌐 All Cities (India-wide)', aqi: totalAvg },
                ...cityList
            ];
        },
        enabled: isCentralAdmin
    });

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const currentCity = isCentralAdmin
        ? (cities?.find(c => c.id === (selectedCityId || 'all')) || { name: 'All Cities', aqi: 0 })
        : { name: cityName, aqi: 0 };

    return (
        <header className="h-[72px] bg-[#0A1628]/80 backdrop-blur-md border-b border-[#1e2a3b] flex items-center justify-between px-6 sticky top-0 z-20">
            <div className="flex items-center">
                {isCityAdmin ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center space-x-3 bg-[#132238] border border-[#1e2a3b] rounded-lg px-4 py-2 cursor-default">
                                    <div className="bg-[#00D4FF]/20 p-1 rounded-md">
                                        <MapPin className="h-4 w-4 text-[#00D4FF]" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs text-gray-400 font-medium leading-tight">Your Jurisdiction</p>
                                        <p className="text-sm font-bold text-white leading-tight">📍 {cityName}</p>
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#132238] border-[#1e2a3b] text-white">
                                <p>You are viewing data for your assigned city only</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : isCentralAdmin ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center space-x-2 bg-[#132238] border border-[#1e2a3b] hover:border-[#2a3b50] transition-colors rounded-lg px-4 py-2 outline-none group min-w-[200px]">
                            {isCitiesLoading ? (
                                <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />
                            ) : (
                                <div className="bg-[#00D4FF]/20 p-1 rounded-md">
                                    <MapPin className="h-4 w-4 text-[#00D4FF]" />
                                </div>
                            )}
                            <div className="text-left">
                                <p className="text-xs text-gray-400 font-medium leading-tight">Current Monitoring Region</p>
                                <p className="text-sm font-bold text-white leading-tight">{currentCity.name}</p>
                            </div>
                            <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors ml-auto" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#132238] border-[#1e2a3b] text-white w-56">
                            {cities?.map((city) => (
                                <DropdownMenuItem
                                    key={city.id}
                                    onClick={() => setSelectedCityId(city.id === 'all' ? null : city.id)}
                                    className="hover:bg-[#1e2a3b] hover:text-white cursor-pointer py-2"
                                >
                                    <div className="flex items-center justify-between w-full text-xs">
                                        <span className="font-bold">{city.name}</span>
                                        {city.aqi > 0 && (
                                            <span className={`px-2 py-0.5 rounded-full font-bold ${city.aqi > 300 ? 'bg-red-500/20 text-red-400' :
                                                city.aqi > 200 ? 'bg-orange-500/20 text-orange-400' :
                                                    city.aqi > 100 ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-green-500/20 text-green-400'
                                                }`}>
                                                AQI {Math.round(city.aqi)}
                                            </span>
                                        )}
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <div className="h-10 w-48 bg-[#132238]/50 animate-pulse rounded-lg" />
                )}
            </div>

            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 bg-[#132238] border border-[#1e2a3b] rounded-full px-3 py-1">
                    <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-[pulse_2s_infinite]' : 'bg-gray-500'}`} />
                    <span className="text-[10px] font-bold tracking-widest text-white uppercase">
                        {isConnected ? 'Live' : 'Offline'}
                    </span>
                </div>
                <div className="h-4 w-px bg-[#1e2a3b]" />
                <div className="hidden md:flex flex-col items-end">
                    <p className="text-sm font-bold text-white font-mono tracking-tight">
                        {currentTime ? currentTime.toLocaleTimeString('en-US', {
                            hour12: false,
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                        }) : '--:--:--'}
                    </p>
                    <p className="text-xs text-gray-400 font-medium whitespace-nowrap">
                        {currentTime ? currentTime.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                        }) : '---'}
                    </p>
                </div>
                <div className="h-8 w-px bg-[#1e2a3b] mx-2" />
                <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-[#1e2a3b]">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-[#0A1628]" />
                    )}
                </button>
            </div>
        </header>
    );
}