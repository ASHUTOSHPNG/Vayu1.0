'use client';

import React, { useEffect, useState } from 'react';
import { getAQIDisplay } from '@/lib/aqi-utils';

interface AQIGaugeProps {
    aqi: number;
    loading?: boolean;
}

export const AQIGauge: React.FC<AQIGaugeProps> = ({ aqi, loading = false }) => {
    const [animatedAqi, setAnimatedAqi] = useState(0);
    const display = getAQIDisplay(aqi);

    useEffect(() => {
        if (!loading) {
            const duration = 1500;
            const start = 0;
            const end = aqi;
            const startTime = performance.now();

            const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOutQuad = (t: number) => t * (2 - t);
                const currentAqi = Math.round(start + (end - start) * easeOutQuad(progress));

                setAnimatedAqi(currentAqi);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        }
    }, [aqi, loading]);

    const size = 280;
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const circumference = Math.PI * radius; // Half circle for arc

    // Calculate dash offset based on AQI (0-500 scale)
    const maxAqi = 500;
    const percentage = Math.min(aqi / maxAqi, 1);
    const offset = circumference * (1 - percentage);

    if (loading) {
        return (
            <div className="relative flex flex-col items-center justify-center">
                <div className="h-64 w-64 animate-pulse rounded-full bg-white/10" />
                <div className="mt-4 h-8 w-32 animate-pulse rounded bg-white/10" />
            </div>
        );
    }

    return (
        <div className="relative flex flex-col items-center justify-center">
            <svg width={size} height={size / 1.5} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
                {/* Background Arc */}
                <path
                    d={`M ${strokeWidth / 2},${size / 2} A ${radius},${radius} 0 0,1 ${size - strokeWidth / 2},${size / 2}`}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
                {/* Foreground Arc */}
                <path
                    d={`M ${strokeWidth / 2},${size / 2} A ${radius},${radius} 0 0,1 ${size - strokeWidth / 2},${size / 2}`}
                    fill="none"
                    stroke={display.color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1.5s ease-out, stroke 1.5s ease-out' }}
                />

                <text
                    x="50%"
                    y="85%"
                    textAnchor="middle"
                    className="text-5xl font-bold"
                    fill="white"
                >
                    {animatedAqi}
                </text>
            </svg>

            <div
                className="mt-2 rounded-full px-6 py-1 text-lg font-semibold text-white shadow-lg"
                style={{ backgroundColor: display.color, transition: 'background-color 1.5s ease-out' }}
            >
                {display.category}
            </div>
        </div>
    );
};
