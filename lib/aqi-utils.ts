// AQI Category type is now imported from @/types/aqi

export interface AQIDisplay {
    category: string;
    description: string;
    message: string;
    color: string;
    action: string;
}

export const getAQIDisplay = (aqi: number): AQIDisplay => {
    const level = aqi;
    switch (true) {
        case level <= 50:
            return { category: 'Good', color: '#10b981', action: 'Great day for outdoor activities!', description: 'Air quality is satisfactory.', message: 'The air is clean and fresh. Enjoy your day outdoors!' };
        case level <= 100:
            return { category: 'Moderate', color: '#f59e0b', action: 'Reduce intense outdoor exertion.', description: 'Air quality is acceptable.', message: 'Sensitive individuals should limit prolonged exertion.' };
        case level <= 150:
            return { category: 'Unhealthy for Sensitive Groups', color: '#f97316', action: 'Stay indoors if you have respiratory issues.', description: 'Members of sensitive groups may experience health effects.', message: 'Wear a mask if you have asthma or lung conditions.' };
        case level <= 200:
            return { category: 'Unhealthy', color: '#ef4444', action: 'Avoid heavy outdoor exercise.', description: 'Everyone may begin to experience health effects.', message: 'Everyone should avoid prolonged outdoor exposure.' };
        case level <= 300:
            return { category: 'Very Unhealthy', color: '#8b5cf6', action: 'Stay indoors and use air purifiers.', description: 'Health alert: everyone may experience more serious health effects.', message: 'Health emergency conditions. Stay indoors and keep windows closed.' };
        default:
            return { category: 'Hazardous', color: '#7f1d1d', action: 'Absolute indoor stay required.', description: 'Health warnings of emergency conditions.', message: 'Extreme danger. Avoid all outdoor physical activity.' };
    }
};

import { resolveUserLocation as realResolveUserLocation } from './api-clients/geocoding';

export const resolveUserLocation = async (): Promise<{ name: string; lat: number; lng: number; aqi: number }> => {
    try {
        const result = await realResolveUserLocation();
        return {
            name: result.locationInfo.city || result.locationInfo.display_name.split(',')[0],
            lat: result.lat,
            lng: result.lon,
            aqi: 165 // Still mocking AQI for now as we don't have a direct "get city AQI" utility easily accessible here without more logic
        };
    } catch (error) {
        console.error("Failed to resolve user location:", error);
        return {
            name: 'New Delhi',
            lat: 28.6139,
            lng: 77.2090,
            aqi: 165
        };
    }
};

export const getPollutantStatus = (name: string, value: number): 'Safe' | 'Elevated' | 'High' => {
    // Basic logic for pollutant status markers
    // PM2.5: Safe < 15, Elevated < 35, High > 35 (WHO/EPA targets simplified)
    if (name === 'PM2.5') {
        if (value <= 15) return 'Safe';
        if (value <= 35) return 'Elevated';
        return 'High';
    }
    if (name === 'PM10') {
        if (value <= 45) return 'Safe';
        if (value <= 100) return 'Elevated';
        return 'High';
    }
    // Fallback for other pollutants
    if (value <= 50) return 'Safe';
    if (value <= 100) return 'Elevated';
    return 'High';
};

export { getAQICategory } from '@/types/aqi';
export type { AQICategory } from '@/types/aqi';
