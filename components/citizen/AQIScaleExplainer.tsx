'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const SCALE_DATA = [
    { range: '0 - 50', category: 'Good', color: '#10B981', who: 'Everyone', action: 'Enjoy your usual outdoor activities.' },
    { range: '51 - 100', category: 'Moderate', color: '#F59E0B', who: 'Sensitive groups', action: 'Consider reducing prolonged or heavy exertion. Watch for symptoms such as coughing or shortness of breath.' },
    { range: '101 - 150', category: 'Unhealthy for Sensitive Groups', color: '#F97316', who: 'General public', action: 'Reduce outdoor activities if you experience symptoms. Sensitive groups should wear N95 masks.' },
    { range: '151 - 200', category: 'Unhealthy', color: '#EF4444', who: 'Everyone', action: 'Wear an N95 mask outdoors. Avoid strenuous outdoor activities. Keep windows closed.' },
    { range: '201 - 300', category: 'Very Unhealthy', color: '#8B5CF6', who: 'Everyone', action: 'Stay indoors as much as possible. Use an air purifier. Essential outdoor trips only with N99 masks.' },
    { range: '301+', category: 'Hazardous', color: '#7F1D1D', who: 'Everyone', action: 'Health warning of emergency conditions. Stay in purified indoor environments. All outdoor activities should be avoided.' },
];

export const AQIScaleExplainer: React.FC = () => {
    return (
        <Card className="p-8 border-zinc-800 shadow-xl overflow-hidden bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-900">
            <h3 className="text-2xl font-black text-white mb-8 tracking-tight">Understanding the AQI Scale</h3>
            <Accordion type="single" collapsible className="w-full space-y-4">
                {SCALE_DATA.map((item, i) => (
                    <AccordionItem key={i} value={`item-${i}`} className="border rounded-2xl border-zinc-800 px-6 overflow-hidden bg-white/5 hover:bg-white/10 transition-colors">
                        <AccordionTrigger className="hover:no-underline py-6">
                            <div className="flex items-center gap-6 w-full pr-4">
                                <div className="h-12 w-24 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg" style={{ backgroundColor: item.color }}>
                                    {item.range}
                                </div>
                                <div className="text-left flex-1">
                                    <p className="font-black text-lg" style={{ color: item.color }}>{item.category}</p>
                                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Impact Group: {item.who}</p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 pt-2 border-t border-zinc-800">
                            <div className="space-y-4">
                                <p className="text-zinc-300 font-medium leading-relaxed">
                                    <span className="text-white font-black uppercase text-[10px] tracking-widest block mb-1">Recommended Action</span>
                                    {item.action}
                                </p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </Card>
    );
};
