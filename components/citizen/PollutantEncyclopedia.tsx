'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Factory, Car, Trees, Flame } from 'lucide-react';

interface PollutantInfo {
    name: string;
    fullName: string;
    icon: React.ReactNode;
    sources: string[];
    effects: string[];
    whoLimit: string;
    description: string;
}

const POLLUTANTS: PollutantInfo[] = [
    {
        name: 'PM2.5',
        fullName: 'Fine Particulate Matter',
        icon: <Factory className="h-5 w-5" />,
        sources: ['Vehicle exhaust', 'Industrial emissions', 'Wildfires', 'Construction'],
        effects: ['Heart disease', 'Lung cancer', 'Asthma attacks', 'Premature death'],
        whoLimit: '15 µg/m³ (24h mean)',
        description: 'Tiny particles (under 2.5 microns) that can enter deep into the lungs and even the bloodstream.'
    },
    {
        name: 'PM10',
        fullName: 'Coarse Particulate Matter',
        icon: <Trees className="h-5 w-5" />,
        sources: ['Road dust', 'Agricultural burning', 'Desert sand', 'Sea salt'],
        effects: ['Coughing', 'Wheezing', 'Inflammation of lungs'],
        whoLimit: '45 µg/m³ (24h mean)',
        description: 'Particles between 2.5 and 10 microns, often visible as dust or haze.'
    },
    {
        name: 'NO2',
        fullName: 'Nitrogen Dioxide',
        icon: <Car className="h-5 w-5" />,
        sources: ['Combustion engines', 'Power plants', 'Gas stoves'],
        effects: ['Bronchitis', 'Increased sensitivity to allergens'],
        whoLimit: '25 µg/m³ (24h mean)',
        description: 'A brown, toxic gas that is a major component of urban smog.'
    },
    {
        name: 'SO2',
        fullName: 'Sulfur Dioxide',
        icon: <Flame className="h-5 w-5" />,
        sources: ['Coal burning', 'Oil refining', 'Volcanic activity'],
        effects: ['Burning eyes', 'Tightness in chest', 'Acid rain'],
        whoLimit: '40 µg/m³ (24h mean)',
        description: 'A colorless gas with a pungent odor, produced mainly from fossil fuel combustion.'
    },
    {
        name: 'O3',
        fullName: 'Ground-level Ozone',
        icon: <Info className="h-5 w-5" />,
        sources: ['Chemical reactions between NOx and VOCs', 'Sunlight'],
        effects: ['Reduced lung function', 'Permanent lung tissue damage'],
        whoLimit: '100 µg/m³ (8h mean)',
        description: 'Not emitted directly but created by chemical reactions between other pollutants.'
    },
    {
        name: 'CO',
        fullName: 'Carbon Monoxide',
        icon: <Car className="h-5 w-5" />,
        sources: ['Incomplete combustion', 'Traffic', 'Indoor heaters'],
        effects: ['Dizziness', 'Confusion', 'Reduced oxygen delivery'],
        whoLimit: '4 mg/m³ (24h mean)',
        description: 'A colorless, odorless gas that blocks oxygen transport in the body.'
    },
    {
        name: 'Smoke',
        fullName: 'Wood Smoke (PM2.5)',
        icon: <Flame className="h-5 w-5" />,
        sources: ['Wildfires', 'Crop burning', 'Forest clearing'],
        effects: ['Severe inflammation', 'Systemic toxicity', 'Blood clots'],
        whoLimit: 'Satellite Detected',
        description: 'Specific particulate matter from biomass burning. VAYU uses NASA FIRMS satellite data to detect these plumes in real-time.'
    }
];

export const PollutantEncyclopedia: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {POLLUTANTS.map((p) => (
                <Card key={p.name} className="p-6 border-zinc-800 shadow-lg hover:shadow-xl hover:border-teal-500/30 transition-all group overflow-hidden relative bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-900">
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-all duration-500 border border-teal-500/20">
                                    {p.icon}
                                </div>
                                <div className="text-left">
                                    <h4 className="font-black text-xl text-white tracking-tight">{p.name}</h4>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{p.fullName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400">WHO Alert</Badge>
                                <p className="text-xs font-bold text-red-400 mt-1">{p.whoLimit}</p>
                            </div>
                        </div>

                        <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed text-left">
                            {p.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Sources</p>
                                <ul className="space-y-1">
                                    {p.sources.slice(0, 2).map((s, i) => (
                                        <li key={i} className="text-xs text-zinc-400 flex items-center gap-1.5">
                                            <div className="h-1 w-1 rounded-full bg-teal-500" /> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Health Risks</p>
                                <ul className="space-y-1">
                                    {p.effects.slice(0, 2).map((e, i) => (
                                        <li key={i} className="text-xs text-red-400/80 flex items-center gap-1.5 font-medium">
                                            <div className="h-1 w-1 rounded-full bg-red-500" /> {e}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -bottom-8 -right-8 h-24 w-24 bg-teal-500/5 rounded-full group-hover:bg-teal-500/10 transition-colors duration-500" />
                </Card>
            ))}
        </div>
    );
};
