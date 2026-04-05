'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Wind, Home, Trees, Droplets, Zap, ShieldCheck, Sun, Info } from 'lucide-react';

const TIPS = [
    { icon: <Wind className="h-5 w-5" />, title: 'Seal the Entry Points', desc: 'Keep windows and doors closed when outdoor AQI levels exceed 100. Check for drafts around frames.' },
    { icon: <Home className="h-5 w-5" />, title: 'Use HEPA Air Purifiers', desc: 'A High-Efficiency Particulate Air (HEPA) filter can remove 99.97% of PM2.5 particles from indoor air.' },
    { icon: <Trees className="h-5 w-5" />, title: 'Natural Purifiers', desc: 'Add plants like Peace Lilies, Spider Plants, and Aloe Vera which are known to absorb toxins like formaldehyde.' },
    { icon: <Droplets className="h-5 w-5" />, title: 'Control Humidity', desc: 'Keep indoor humidity between 30-50% to prevent mold growth and reduce particulate suspension.' },
    { icon: <Zap className="h-5 w-5" />, title: 'Avoid Combustion', desc: 'Minimize the use of gas stoves, candles, and incense during high pollution days as they create indoor PM2.5.' },
    { icon: <ShieldCheck className="h-5 w-5" />, title: 'Daily Cleaning', desc: 'Use damp mops instead of dry brooms to capture dust rather than stirring it back into the air.' },
    { icon: <Sun className="h-5 w-5" />, title: 'Smart Ventilation', desc: 'Open windows only when outdoor AQI is at its daily minimum (usually mid-afternoon on sunny days).' },
    { icon: <Info className="h-5 w-5" />, title: 'Exhaust Fans', desc: 'Always use exhaust fans in kitchens and bathrooms to vent pollutants directly outside.' },
];

export const IAQTips: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                    <Home className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">Indoor Air Quality Strategy</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TIPS.map((tip, i) => (
                    <Card key={i} className="p-6 border-zinc-800 shadow-lg hover:shadow-xl hover:border-teal-500/30 transition-all flex gap-4 text-left bg-white/5">
                        <div className="h-12 w-12 shrink-0 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
                            {tip.icon}
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-bold text-white">{tip.title}</h4>
                            <p className="text-sm text-zinc-400 leading-relaxed">{tip.desc}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
