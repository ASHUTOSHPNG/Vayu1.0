'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { getPollutantStatus } from '@/lib/aqi-utils';

interface PollutantCardProps {
    name: string;
    value: number;
    unit: string;
    description: string;
}

export const PollutantCard: React.FC<PollutantCardProps> = ({
    name,
    value,
    unit,
    description
}) => {
    const status = getPollutantStatus(name, value);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Card className="flex flex-col items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-teal-500/30 transition-all cursor-pointer">
                        <span className="text-sm font-medium text-zinc-400">{name}</span>
                        <div className="my-2 flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-white">{value}</span>
                            <span className="text-xs text-zinc-500">{unit}</span>
                        </div>
                        <Badge variant="outline" className={`font-medium text-xs ${status === 'Safe' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : status === 'Elevated' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {status}
                        </Badge>
                    </Card>
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] bg-zinc-900 text-white border-zinc-700">
                    <p className="text-xs leading-relaxed">{description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
