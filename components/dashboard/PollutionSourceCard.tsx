"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { RefreshCcw, MapPin, Info } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";

interface SourceDistribution {
    type: string;
    percentage: number;
    color: string;
}

export interface PollutionSourceData {
    id: string;
    locationName: string;
    latitude: number;
    longitude: number;
    anomalyScore: number;
    sources: SourceDistribution[];
    lastDetected: string;
}

interface PollutionSourceCardProps {
    data: PollutionSourceData;
}

export function PollutionSourceCard({ data }: PollutionSourceCardProps) {
    const queryClient = useQueryClient();

    const detectionMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/source-detection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    location_id: data.id,
                    lat: data.latitude,
                    lon: data.longitude
                })
            });
            if (!res.ok) throw new Error('Detection failed');
            return res.json();
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['source-metrics'] });
        }
    });

    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    // Recharts RadialBar expects an array of data. We want a gauge (0-10).
    const gaugeData = [{ value: data.anomalyScore }];
    const gaugeColor = data.anomalyScore > 7 ? '#ef4444' : data.anomalyScore > 4 ? '#f59e0b' : '#34d399';

    if (!mounted) return <div className="h-[200px] w-full bg-[#132238] animate-pulse rounded-xl" />;

    return (
        <Card className="bg-[#132238] border-[#1e2a3b] hover:border-[#00D4FF]/30 transition-all shadow-xl group">
            <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-[#1e2a3b]/50">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#00D4FF]/10 rounded-lg group-hover:scale-110 transition-transform">
                        <MapPin className="h-4 w-4 text-[#00D4FF]" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-bold text-white">{data.locationName}</CardTitle>
                        <span className="text-[10px] text-gray-500 flex items-center">
                            Last check: {new Date(data.lastDetected).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-[#1e2a3b] text-gray-400"
                    onClick={() => detectionMutation.mutate()}
                    disabled={detectionMutation.isPending}
                >
                    <RefreshCcw className={cn("h-4 w-4", detectionMutation.isPending && "animate-spin")} />
                </Button>
            </CardHeader>

            <CardContent className="p-4 space-y-6">
                {/* 1. Anomaly Gauge & Summary */}
                <div className="flex items-center justify-between gap-4">
                    <div className="h-24 w-24 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart
                                innerRadius="80%"
                                outerRadius="100%"
                                data={gaugeData}
                                startAngle={180}
                                endAngle={0}
                            >
                                <PolarAngleAxis
                                    type="number"
                                    domain={[0, 10]}
                                    angleAxisId={0}
                                    tick={false}
                                />
                                <RadialBar
                                    background
                                    dataKey="value"
                                    cornerRadius={5}
                                    fill={gaugeColor}
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
                            <span className="text-xl font-black text-white">{data.anomalyScore.toFixed(1)}</span>
                            <span className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">Anomaly</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                            <Info className="h-3 w-3 text-cyan-400" />
                            <span className="text-[11px] font-bold text-gray-400 uppercase">Detection Confidence</span>
                        </div>
                        <p className="text-xs text-gray-300">
                            Pattern matched with high confidence (92%). Automated intervention recommended.
                        </p>
                    </div>
                </div>

                {/* 2. Source Distribution (Stacked Bars) */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        <span>Source Apportionment</span>
                        <span className="text-white">Probability %</span>
                    </div>

                    <div className="w-full h-3 bg-[#0A1628] rounded-full flex overflow-hidden border border-[#1e2a3b]">
                        {data.sources.map((source, i) => (
                            <div
                                key={i}
                                className="h-full transition-all duration-500"
                                style={{
                                    width: `${source.percentage}%`,
                                    backgroundColor: source.color
                                }}
                                title={`${source.type}: ${source.percentage}%`}
                            />
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
                        {data.sources.map((source, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: source.color }} />
                                <span className="text-[10px] text-gray-400">{source.type}</span>
                                <span className="text-[10px] font-bold text-white">{source.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
