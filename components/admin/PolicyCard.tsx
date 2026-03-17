"use client";

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Flame, MapPin, Satellite } from 'lucide-react';
import { PolicyRecommendation } from '@/types/admin';
import { cn } from '@/lib/utils';

interface PolicyCardProps {
    recommendation: PolicyRecommendation;
    onApprove: (id: string) => void;
    onDismiss: (id: string) => void;
    isProcessing?: boolean;
}

export function PolicyCard({ recommendation, onApprove, onDismiss, isProcessing }: PolicyCardProps) {
    const content = typeof recommendation.recommendation_text === 'string'
        ? JSON.parse(recommendation.recommendation_text)
        : recommendation.recommendation_text;

    const fireCoords = recommendation.fire_coordinates || [];
    const hasFires = fireCoords.length > 0;

    const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    // Generate static map URL if fires exist
    const staticMapUrl = hasFires && MAPBOX_TOKEN ? (() => {
        const pin = fireCoords[0];
        // Create path or markers for top 3 fires
        const markers = fireCoords.slice(0, 3).map(f =>
            `pin-s-fire+ff4400(${f.lon},${f.lat})`
        ).join(',');

        return `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${markers}/auto/400x250@2x?access_token=${MAPBOX_TOKEN}`;
    })() : null;

    return (
        <Card className="bg-[#132238] border-[#1e2a3b] overflow-hidden group hover:border-[#00D4FF]/30 transition-all shadow-xl">
            <div className="flex flex-col lg:flex-row">
                {/* Left Severity Indicator */}
                <div className={`w-1.5 shrink-0 ${recommendation.severity === 'critical' ? 'bg-red-500' :
                    recommendation.severity === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                    }`} />

                <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="border-[#1e2a3b] text-gray-400 font-mono text-[10px]">
                                    {recommendation.id.slice(0, 8).toUpperCase()}
                                </Badge>
                                <Badge className={`font-bold text-[10px] ${recommendation.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {recommendation.severity.toUpperCase()}
                                </Badge>
                                {hasFires && (
                                    <Badge className="bg-orange-500/20 text-orange-400 border-none font-bold text-[10px] flex items-center gap-1">
                                        <Satellite className="h-3 w-3" /> SATELLITE CONFIRMED
                                    </Badge>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-white group-hover:text-[#00D4FF] transition-colors">
                                {content.headline || 'Policy Recommendation'}
                            </h3>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Location</p>
                            <p className="text-sm text-white font-bold flex items-center justify-end">
                                <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                                {recommendation.locations?.name}, {recommendation.locations?.city}
                            </p>
                        </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-6 leading-relaxed max-w-4xl">
                        {recommendation.anomaly_summary}
                    </p>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Actions List */}
                        <div className="bg-[#0A1628] rounded-2xl p-5 border border-[#1e2a3b]">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center">
                                <ArrowRight className="h-3 w-3 mr-1.5 text-[#00D4FF]" />
                                Proposed Interventions
                            </p>
                            <ul className="space-y-3">
                                {content.immediateActions?.map((action: string, idx: number) => (
                                    <li key={idx} className="flex items-start text-sm text-gray-300">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#00D4FF] mt-1.5 mr-3 shrink-0" />
                                        {action}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Fire Intel (Conditionally Rendered) */}
                        {hasFires && (
                            <div className="bg-[#0A1628] rounded-2xl overflow-hidden border border-[#1e2a3b] flex flex-col">
                                {staticMapUrl ? (
                                    <div className="h-32 w-full relative overflow-hidden">
                                        <img
                                            src={staticMapUrl}
                                            alt="Fire Location"
                                            className="w-full h-full object-cover opacity-80"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] to-transparent" />
                                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] text-white font-bold border border-white/10 flex items-center gap-1">
                                            <Flame className="h-2.5 w-2.5 text-orange-500" />
                                            Active Hotspots Detected
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 border-b border-[#1e2a3b] flex items-center gap-2">
                                        <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Satellite Fire Intelligence</span>
                                    </div>
                                )}
                                <div className="p-4 space-y-3">
                                    {fireCoords.slice(0, 2).map((fire, idx) => (
                                        <div key={idx} className="flex items-center justify-between text-xs">
                                            <div className="flex flex-col">
                                                <span className="text-gray-400 font-medium">Upwind Hotspot</span>
                                                <span className="text-white font-bold">{fire.distanceKm?.toFixed(1)}km away • {fire.bearingDeg?.toFixed(0)}°</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-gray-500">Intensity</span>
                                                <div className="text-orange-400 font-black">{fire.frpMW} MW</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions Panel */}
                <div className="p-6 bg-[#0A1628]/50 border-l border-[#1e2a3b] flex flex-col justify-center items-center gap-3 w-full lg:w-48">
                    <Button
                        onClick={() => onApprove(recommendation.id)}
                        disabled={isProcessing}
                        className="w-full bg-[#00D4FF] hover:bg-[#00b0d6] text-black font-extrabold h-11"
                    >
                        Approve
                    </Button>
                    <Button
                        onClick={() => onDismiss(recommendation.id)}
                        disabled={isProcessing}
                        variant="outline"
                        className="w-full border-[#1e2a3b] text-gray-400 hover:text-white hover:bg-[#1e2a3b] h-11"
                    >
                        Dismiss
                    </Button>
                </div>
            </div>
        </Card>
    );
}

