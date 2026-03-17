'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAQIDisplay, resolveUserLocation } from '@/lib/aqi-utils';
import { Shield, AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react';

type ProfileType = 'General' | 'Child' | 'Elderly' | 'Asthmatic' | 'Pregnant';

const PROFILE_ADVICE: Record<ProfileType, { dos: string[], donts: string[] }> = {
    General: {
        dos: ['Check AQI before outdoor exercise', 'Keep windows closed if AQI > 150', 'Use an air purifier if possible'],
        donts: ['Prolonged outdoor exertion when AQI is High', 'Operating diesel generators in poorly ventilated areas']
    },
    Child: {
        dos: ['Limit outdoor playtime during peak pollution hours', 'Encourage indoor activities', 'Keep classrooms well-ventilated with purified air'],
        donts: ['Playing near heavy traffic roads', 'Outdoor sports matches on "Very Unhealthy" days']
    },
    Elderly: {
        dos: ['Stay indoors during morning and evening peaks', 'Keep rescue medications (if any) handy', 'Monitor for chest pain or shortness of breath'],
        donts: ['Early morning walks when smog is visible', 'Strenuous domestic chores during high pollution']
    },
    Asthmatic: {
        dos: ['Carry your inhaler at all times', 'Follow your asthma action plan strictly', 'Use N95 masks when going out'],
        donts: ['Outdoor activities without medication', 'Ignoring minor wheezing or coughing']
    },
    Pregnant: {
        dos: ['Minimize exposure to traffic exhaust', 'Eat antioxidant-rich foods', 'Consult doctor if experiencing respiratory distress'],
        donts: ['Walking in high-traffic areas', 'Using chemical-heavy indoor sprays/cleaners']
    }
};

export const RiskAssessmentWidget: React.FC = () => {
    const [profile, setProfile] = useState<ProfileType>('General');
    const [location, setLocation] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const loc = await resolveUserLocation();
            // Mocking an AQI for the loc
            setLocation({ ...loc, aqi: 165 }); // Moderate/Unhealthy for demo
            setLoading(false);
        };
        init();
    }, []);

    const advice = PROFILE_ADVICE[profile];
    const aqiDisplay = location ? getAQIDisplay(location.aqi) : null;

    return (
        <Card className="p-8 border-teal-500/30 shadow-2xl shadow-teal-500/10 bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-900 overflow-hidden relative">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Badge className="bg-teal-500/20 text-teal-300 border border-teal-500/30">Personalized Safety</Badge>
                        <h3 className="text-3xl font-black text-white leading-tight">Am I at Risk?</h3>
                        <p className="text-zinc-400">Get specific health advice based on your profile and current local conditions.</p>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Select Your Profile</label>
                        <Select onValueChange={(v) => setProfile(v as ProfileType)} defaultValue="General">
                            <SelectTrigger className="w-full h-14 rounded-2xl border-zinc-700 bg-white/5 text-white focus:ring-teal-500/20 focus:border-teal-500/50">
                                <SelectValue placeholder="Select profile" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-zinc-700 bg-zinc-900">
                                <SelectItem value="General" className="text-zinc-300 focus:bg-teal-500/20 focus:text-white">General Adult</SelectItem>
                                <SelectItem value="Child" className="text-zinc-300 focus:bg-teal-500/20 focus:text-white">Child / Student</SelectItem>
                                <SelectItem value="Elderly" className="text-zinc-300 focus:bg-teal-500/20 focus:text-white">Elderly (65+)</SelectItem>
                                <SelectItem value="Asthmatic" className="text-zinc-300 focus:bg-teal-500/20 focus:text-white">Respiratory Issues (Asthma/COPD)</SelectItem>
                                <SelectItem value="Pregnant" className="text-zinc-300 focus:bg-teal-500/20 focus:text-white">Pregnant Women</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {location && (
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-tighter">Current Location</p>
                                    <p className="font-bold text-white">{location.name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black" style={{ color: aqiDisplay?.color }}>{location.aqi}</p>
                                <p className="text-[10px] uppercase font-bold text-zinc-500">AQI Index</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 rounded-3xl shadow-lg border border-teal-500/20 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-2 pb-4 border-b border-white/10">
                        <div className="h-8 w-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                            <Info className="h-4 w-4" />
                        </div>
                        <h4 className="font-black text-xl text-white">Your Action Plan</h4>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <p className="text-xs font-black text-teal-400 uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle2 className="h-3 w-3" /> Recommended Do's
                            </p>
                            <ul className="space-y-2">
                                {advice.dos.map((item, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-zinc-300 bg-teal-500/5 p-2 rounded-xl border border-teal-500/10">
                                        <span className="shrink-0 text-teal-400 mt-0.5">•</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
                                <XCircle className="h-3 w-3" /> Crucial Dont's
                            </p>
                            <ul className="space-y-2">
                                {advice.donts.map((item, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-zinc-300 bg-red-500/5 p-2 rounded-xl border border-red-500/10">
                                        <span className="shrink-0 text-red-400 mt-0.5">•</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 blur-3xl rounded-full -mr-20 -mt-20"></div>
        </Card>
    );
};
