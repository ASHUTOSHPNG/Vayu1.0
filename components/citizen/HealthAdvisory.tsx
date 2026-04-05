'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, AlertTriangle, ShieldAlert } from 'lucide-react';
import { FireRiskAssessment } from '@/lib/api-clients/firms';
import { getAQIDisplay } from '@/lib/aqi-utils';

interface HealthAdvisoryProps {
    aqi: number;
    source?: string;
    fireRisk?: FireRiskAssessment;
    detectedSource?: string;
}

export const HealthAdvisory: React.FC<HealthAdvisoryProps> = ({ aqi, source, fireRisk, detectedSource }) => {
    const display = getAQIDisplay(aqi);

    const isBiomassBurning = (detectedSource === 'biomass_burning' || source === 'satellite') && fireRisk?.hasUpwindFire;

    const getAdvisoryMessage = () => {
        if (isBiomassBurning) {
            return "🔥 Satellite-confirmed smoke from active fires is affecting air quality in your area. PM2.5 levels are elevated due to fine smoke particles. Avoid all outdoor activity. Keep windows and doors closed. Run your air purifier on maximum setting. Smoke particles are extremely harmful — an N95 mask is essential if you must go outside.";
        }

        if (aqi <= 50) return "Ideal conditions for outdoor activities. Enjoy the fresh air!";
        if (aqi <= 100) return "Air quality is acceptable. Sensitive individuals should monitor symptoms.";
        if (aqi <= 150) {
            if (source === 'Traffic') return "Vehicular pollution is elevated. Avoid major roads for exercise.";
            return "Sensitive groups should reduce prolonged outdoor exertion.";
        }
        if (aqi <= 200) {
            const base = "Everyone may begin to experience health effects.";
            if (source === 'Traffic') return `${base} Vehicular pollution is high. Avoid outdoor exercise between 7-10 AM and 5-8 PM. Wear an N95 mask if outdoors.`;
            if (source === 'Industrial') return `${base} Industrial emissions are high nearby. Keep windows closed and use air purifiers.`;
            return `${base} Limit outdoor activities.`;
        }
        return "Health alert: everyone may experience more serious health effects. Stay indoors.";
    };

    const Icon = isBiomassBurning ? ShieldAlert : aqi > 200 ? ShieldAlert : aqi > 100 ? AlertTriangle : Info;

    return (
        <div className="space-y-4 text-left">
            <Alert
                className="border-none shadow-sm bg-white/5 backdrop-blur-sm"
                style={{ borderLeft: `4px solid ${isBiomassBurning ? '#F59E0B' : display.color}` }}
            >
                <Icon className="h-5 w-5" style={{ color: isBiomassBurning ? '#F59E0B' : display.color }} />
                <AlertTitle className="font-bold ml-2" style={{ color: isBiomassBurning ? '#F59E0B' : display.color }}>
                    {isBiomassBurning ? 'Biomass Smoke Alert' : `Health Advisory for ${display.category}`}
                </AlertTitle>
                <AlertDescription className="mt-2 text-zinc-300 leading-relaxed ml-2">
                    {getAdvisoryMessage()}
                </AlertDescription>
            </Alert>

            {(aqi > 100 || isBiomassBurning) && (
                <Alert className="bg-orange-500/10 border-orange-500/20 backdrop-blur-sm">
                    <AlertTriangle className="h-5 w-5 text-orange-400" />
                    <AlertTitle className="text-orange-400 font-bold ml-2">Sensitive Groups Alert</AlertTitle>
                    <AlertDescription className="text-orange-300 ml-2">
                        {isBiomassBurning
                            ? "⚠ Children, elderly, and those with respiratory conditions should remain indoors until AQI returns to Moderate (< 100)."
                            : "Children, elderly, and those with respiratory conditions like asthma should stay indoors or wear protection."
                        }
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
};
