'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Wind, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';
import { resolveUserLocation, getAQIDisplay } from '@/lib/aqi-utils';

export const LocalHealthAdvisory: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'denied' | 'error'>('idle');
    const [location, setLocation] = useState<any>(null);
    const [aqiData, setAqiData] = useState<any>(null);

    const handleEnableLocation = async () => {
        setStatus('loading');
        try {
            const loc = await resolveUserLocation();
            setLocation(loc);

            // Fetch real-time AQI for these coords
            const response = await fetch(`/api/aqi?lat=${loc.lat}&lon=${loc.lng}`);
            if (!response.ok) throw new Error('Failed to fetch AQI');
            const data = await response.json();
            setAqiData(data);
            setStatus('success');
        } catch (error) {
            console.error("Location or AQI fetch failed:", error);
            setStatus('error');
        }
    };

    // Note: We don't auto-trigger to avoid immediate permission prompts upon page load, 
    // which is better UX for a secondary resource page.

    if (status === 'idle') {
        return (
            <Card className="p-12 border-none bg-gradient-to-br from-teal-600 to-teal-800 shadow-2xl shadow-teal-500/20 rounded-[3rem] text-white overflow-hidden relative group">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="space-y-6 text-center md:text-left flex-1">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-md border border-white/20">
                            <MapPin className="h-4 w-4 text-teal-200" />
                            <span className="text-xs font-black uppercase tracking-widest text-teal-100">Hyper-Local Context</span>
                        </div>
                        <h3 className="text-4xl font-black leading-tight tracking-tight">
                            Personalize Your <br />Health Advisory
                        </h3>
                        <p className="text-teal-50/80 text-lg max-w-md">
                            Get real-time air quality guides and health recommendations tailored specifically for your current city.
                        </p>
                    </div>
                    <div>
                        <button
                            onClick={handleEnableLocation}
                            className="bg-white text-teal-700 font-black px-10 py-5 rounded-3xl hover:bg-teal-50 transition-all text-xl shadow-xl hover:scale-105 active:scale-95 duration-200 flex items-center gap-3 group"
                        >
                            Enable Local Guide <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -mr-48 -mt-48 transition-all duration-1000 group-hover:bg-white/20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/20 blur-[80px] rounded-full -ml-32 -mb-32"></div>
            </Card>
        );
    }

    if (status === 'loading') {
        return (
            <Card className="p-20 border-teal-500/30 flex flex-col items-center justify-center space-y-6 text-center rounded-[3rem] bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-900 shadow-2xl shadow-teal-500/10 border">
                <div className="relative">
                    <Loader2 className="h-16 w-16 text-teal-400 animate-spin" />
                    <MapPin className="h-6 w-6 text-teal-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="space-y-2">
                    <p className="text-2xl font-black text-white">Locating... </p>
                    <p className="text-zinc-400 font-medium">Fetching hyper-local air quality intelligence</p>
                </div>
            </Card>
        );
    }

    if (status === 'success' && location && aqiData) {
        const display = getAQIDisplay(aqiData.aqi || 165);
        return (
            <Card className="p-1 border-teal-500/30 shadow-2xl overflow-hidden rounded-[3.5rem] bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-900 group animate-in fade-in zoom-in-95 duration-700">
                <div className="p-8 md:p-14 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-5 space-y-8">
                        <div className="flex items-center gap-3">
                            <Badge className="bg-teal-500/20 text-teal-300 border border-teal-500/30 px-4 py-1.5 rounded-full font-bold flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> {location.name}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 border-zinc-700">Local Resource</Badge>
                        </div>

                        <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-[0.9]">
                            Healthy Living <br /> in <span className="text-teal-400 underline decoration-teal-500/30 underline-offset-8">{location.name}</span>
                        </h2>

                        <div className="flex items-center gap-8 p-8 bg-white/5 rounded-[2.5rem] border border-white/10 group-hover:border-teal-500/30 transition-all duration-500 shadow-inner">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Local AQI Now</p>
                                <p className="text-7xl font-black md:text-8xl" style={{ color: display.color }}>{aqiData.aqi}</p>
                            </div>
                            <div className="flex-1">
                                <p className="font-black text-2xl" style={{ color: display.color }}>{display.category}</p>
                                <p className="text-sm text-zinc-400 font-bold leading-tight">{display.description}</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7 space-y-10">
                        <div className="space-y-6">
                            <h4 className="font-black text-2xl text-white flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                                    <ShieldAlert className="h-6 w-6" />
                                </div>
                                Real-time City Advisory
                            </h4>
                            <div className="p-8 bg-teal-500/10 rounded-[2rem] border-l-8 border-teal-500 shadow-lg shadow-teal-500/10">
                                <p className="text-teal-50 text-xl font-bold leading-relaxed italic animate-in fade-in slide-in-from-left-4 duration-700">
                                    "{display.message}"
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl shadow-sm hover:shadow-xl hover:border-teal-500/30 hover:bg-white/10 transition-all duration-300">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                                        <Wind className="h-5 w-5" />
                                    </div>
                                    <p className="font-black text-zinc-300 uppercase text-xs tracking-widest">Primary concern</p>
                                </div>
                                <p className="text-sm text-zinc-400 font-medium">
                                    {location.name.toLowerCase().includes('mumbai')
                                        ? 'Industrial emissions from Chembur and vehicle exhaust are primary local sources.'
                                        : location.name.toLowerCase().includes('delhi')
                                            ? 'Regional cross-border smog and local traffic are primary concerns today.'
                                            : aqiData.pollutants?.pm25
                                                ? 'Fine particulate matter (PM2.5) is currently the dominant pollutant in your area.'
                                                : 'Air quality is influenced by localized urban dispersion patterns.'}
                                </p>
                            </div>

                            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl shadow-sm hover:shadow-xl hover:border-teal-500/30 hover:bg-white/10 transition-all duration-300">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <p className="font-black text-zinc-300 uppercase text-xs tracking-widest">Recommended Action</p>
                                </div>
                                <p className="text-sm text-zinc-400 font-medium">{display.action}</p>
                            </div>
                        </div>

                        {/* City specific advisory for Mumbai/Delhi */}
                        {(location.name.toLowerCase().includes('mumbai') || location.name.toLowerCase().includes('delhi')) && (
                            <div className="p-6 bg-gradient-to-r from-red-500/20 to-red-600/10 rounded-[2rem] border border-red-500/30 text-white flex items-center justify-between">
                                <div className="space-y-1">
                                    <Badge className="bg-red-500 text-white font-bold text-[10px]">LOCAL ALERT</Badge>
                                    <p className="text-sm font-black italic">
                                        {location.name.toLowerCase().includes('mumbai')
                                            ? "Construction dust in Worli/Bandra sector is elevated."
                                            : "GRAP Stage III restrictions may apply to your area."}
                                    </p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-red-400" />
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-12 border-red-500/30 bg-gradient-to-br from-red-950/50 via-red-900/30 to-slate-900 text-center space-y-6 rounded-[3rem]">
            <div className="h-16 w-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
                <ShieldAlert className="h-8 w-8" />
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">Location Access Required</h3>
                <p className="text-red-300/70 font-medium max-w-sm mx-auto">We need your permission to provide local health intelligence. Please enable location access in your browser.</p>
            </div>
            <button
                onClick={handleEnableLocation}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white font-black px-10 py-4 rounded-2xl hover:from-red-400 hover:to-red-500 transition-all shadow-lg shadow-red-500/25 active:scale-95"
            >
                Grant Access & Refresh
            </button>
        </Card>
    );
};
