import { create } from 'zustand';
import { AQReading } from '@/types/aqi';

interface AQIState {
    readings: Record<string, AQReading>;
    lastUpdated: Record<string, Date>;
    isConnectionActive: boolean;
    setReading: (locationId: string, reading: AQReading) => void;
    bulkSetReadings: (readings: Record<string, AQReading>) => void;
    setConnectionActive: (active: boolean) => void;
}

export const useAQIStore = create<AQIState>((set) => ({
    readings: {},
    lastUpdated: {},
    isConnectionActive: false,
    setReading: (locationId, reading) =>
        set((state) => ({
            readings: { ...state.readings, [locationId]: reading },
            lastUpdated: { ...state.lastUpdated, [locationId]: new Date() },
        })),
    bulkSetReadings: (readings) => {
        const lastUpdated: Record<string, Date> = {};
        const now = new Date();
        Object.keys(readings).forEach((id) => {
            lastUpdated[id] = now;
        });
        set({ readings, lastUpdated });
    },
    setConnectionActive: (active) => set({ isConnectionActive: active }),
}));
