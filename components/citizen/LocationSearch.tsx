'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Crosshair, Loader2 } from 'lucide-react';
import { resolveUserLocation } from '@/lib/api-clients/geocoding';

interface LocationSearchProps {
    onSelect?: (location: { name: string }) => void;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({ onSelect }) => {
    const [value, setValue] = React.useState('');
    const [isResolvingLocation, setIsResolvingLocation] = React.useState(false);

    const handleSearch = () => {
        if (value.trim() && onSelect) {
            onSelect({ name: value.trim() });
        }
    };

    const handleUseCurrentLocation = async () => {
        if (!onSelect || isResolvingLocation) return;

        setIsResolvingLocation(true);
        try {
            const { locationInfo } = await resolveUserLocation();
            const name = locationInfo.city || locationInfo.display_name;
            onSelect({ name });
        } catch (error) {
            console.error('Failed to resolve current location', error);
        } finally {
            setIsResolvingLocation(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto space-y-3">
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MapPin className="h-5 w-5 text-zinc-300" />
                </div>
                <Input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search for your neighborhood or city..."
                    className="h-14 w-full rounded-2xl border border-teal-300/35 bg-slate-900/80 pl-11 pr-12 text-white text-lg placeholder:text-zinc-300/80 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_10px_30px_rgba(6,182,212,0.18)] outline-none ring-teal-400/35 backdrop-blur-xl transition-all focus:border-teal-300/70 focus:bg-slate-900/90 focus:ring-4 hover:border-teal-300/55 hover:bg-slate-900/85"
                />
                <button
                    onClick={handleSearch}
                    className="absolute inset-y-2 right-2 flex items-center rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 text-white hover:from-teal-400 hover:to-cyan-400 transition-all shadow-lg shadow-teal-500/35"
                    aria-label="Search location"
                >
                    <Search className="h-5 w-5" />
                </button>
            </div>

            <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isResolvingLocation}
                className="mx-auto inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-4 py-1.5 text-sm font-semibold text-teal-200 hover:bg-teal-500/20 hover:border-teal-300/50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
                {isResolvingLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Crosshair className="h-4 w-4" />
                )}
                Use my current location
            </button>
        </div>
    );
};
