"use client";
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin } from 'lucide-react';
import { PolicyRecommendation } from '@/types/admin';

interface PolicyCardProps {
    recommendation: PolicyRecommendation;
    onApprove: (id: string) => void;
    onDismiss: (id: string) => void;
    isProcessing?: boolean;
}

export function PolicyCard({ recommendation, onApprove, onDismiss, isProcessing }: PolicyCardProps) {
    const severity = recommendation.severity;

    return (
        <Card className="bg-[#132238] border-[#1e2a3b] overflow-hidden group hover:border-[#00D4FF]/30 transition-all shadow-xl">
            <div className="flex flex-col lg:flex-row">
                {/* Left Severity Indicator */}
                <div className={`w-1.5 shrink-0 ${
                    severity === 'critical' ? 'bg-red-500' :
                    severity === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                }`} />

                <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="border-[#1e2a3b] text-gray-400 font-mono text-[10px]">
                                    {recommendation.id.slice(0, 8).toUpperCase()}
                                </Badge>
                                <Badge className={`font-bold text-[10px] ${
                                    severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                                    severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                    'bg-blue-500/20 text-blue-400'
                                }`}>
                                    {severity?.toUpperCase()}
                                </Badge>
                                <Badge className="bg-purple-500/20 text-purple-400 border-none font-bold text-[10px]">
                                    {recommendation.action_type?.replace('_', ' ').toUpperCase()}
                                </Badge>
                            </div>
                            <h3 className="text-xl font-bold text-white group-hover:text-[#00D4FF] transition-colors">
                                {recommendation.title || 'Policy Recommendation'}
                            </h3>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Location</p>
                            <p className="text-sm text-white font-bold flex items-center justify-end">
                                <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                                {recommendation.ward}, {recommendation.city}
                            </p>
                        </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-6 leading-relaxed max-w-4xl">
                        {recommendation.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#0A1628] rounded-2xl p-5 border border-[#1e2a3b]">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center">
                                <ArrowRight className="h-3 w-3 mr-1.5 text-[#00D4FF]" />
                                Pollutant
                            </p>
                            <p className="text-white font-bold text-lg">{recommendation.pollutant}</p>
                        </div>
                        <div className="bg-[#0A1628] rounded-2xl p-5 border border-[#1e2a3b]">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                                AQI at Trigger
                            </p>
                            <p className="text-red-400 font-bold text-lg">{recommendation.aqi_at_trigger}</p>
                        </div>
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