export function getAQICategory(aqi: number): { label: string; color: string; text: string } {
    if (aqi <= 50) return { label: 'Good', color: 'bg-green-500', text: 'text-black' };
    if (aqi <= 100) return { label: 'Satisfactory', color: 'bg-yellow-500', text: 'text-black' };
    if (aqi <= 200) return { label: 'Moderate', color: 'bg-orange-500', text: 'text-black' };
    if (aqi <= 300) return { label: 'Poor', color: 'bg-red-500', text: 'text-white' };
    if (aqi <= 400) return { label: 'Very Poor', color: 'bg-purple-500', text: 'text-white' };
    return { label: 'Severe', color: 'bg-rose-900', text: 'text-white' };
}

export function getAQIColor(aqi: number): { bg: string; text: string } {
    if (aqi <= 50) return { bg: 'bg-green-500', text: 'text-black' };
    if (aqi <= 100) return { bg: 'bg-yellow-500', text: 'text-black' };
    if (aqi <= 200) return { bg: 'bg-orange-500', text: 'text-black' };
    if (aqi <= 300) return { bg: 'bg-red-500', text: 'text-white' };
    if (aqi <= 400) return { bg: 'bg-purple-500', text: 'text-white' };
    return { bg: 'bg-rose-900', text: 'text-white' };
}

export function getAQIHex(aqi: number): string {
    if (aqi <= 50) return '#22c55e'; // green-500
    if (aqi <= 100) return '#eab308'; // yellow-500
    if (aqi <= 200) return '#f97316'; // orange-500
    if (aqi <= 300) return '#ef4444'; // red-500
    if (aqi <= 400) return '#a855f7'; // purple-500
    return '#881337'; // rose-900
}
