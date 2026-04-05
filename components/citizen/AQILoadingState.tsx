'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type LoadingStage = 'locating' | 'fetching' | 'processing';

interface AQILoadingStateProps {
    stage: LoadingStage;
    locationName?: string;
}

export const AQILoadingState: React.FC<AQILoadingStateProps> = ({ stage, locationName }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (stage === 'processing') {
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 2;
                });
            }, 30);
            return () => clearInterval(interval);
        } else {
            setProgress(0);
        }
    }, [stage]);

    const stages = {
        locating: {
            icon: (
                <div className="relative">
                    <MapPin size={48} className="text-teal-600 animate-bounce" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/10 rounded-full blur-[2px] animate-pulse" />
                </div>
            ),
            text: "Finding your location...",
        },
        fetching: {
            icon: <Loader2 size={48} className="text-teal-600 animate-spin" />,
            text: locationName ? `Fetching air quality data for ${locationName}...` : "Fetching air quality data...",
        },
        processing: {
            icon: (
                <div className="w-full max-w-xs space-y-4">
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-teal-600 transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            ),
            text: "Calculating your AQI...",
        },
    };

    return (
        <div className="flex flex-col items-center justify-center p-12 space-y-6 animate-in fade-in duration-500">
            <div className="h-16 flex items-center justify-center w-full">
                {stages[stage].icon}
            </div>
            <p className="text-zinc-500 font-medium animate-pulse">
                {stages[stage].text}
            </p>
        </div>
    );
};
