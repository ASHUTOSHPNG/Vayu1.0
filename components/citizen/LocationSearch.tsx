"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Crosshair, Loader2, X } from "lucide-react";
import {
  resolveUserLocation,
  searchLocations,
} from "@/lib/api-clients/geocoding";
import { LocationSuggestion } from "@/types/geocoding";

interface LocationSearchProps {
  onSelect?: (location: {
    name: string;
    ward?: string;
    city?: string;
    lat?: number;
    lon?: number;
    postcode?: string;
  }) => void;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({ onSelect }) => {
  const [value, setValue] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<LocationSuggestion[]>(
    [],
  );
  const [isSearching, setIsSearching] = React.useState(false);
  const [isResolvingLocation, setIsResolvingLocation] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const searchTimeoutRef = React.useRef<NodeJS.Timeout>();

  const handleSearchInput = async (query: string) => {
    setValue(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    setShowSuggestions(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchLocations(query);
        setSuggestions(results);
      } catch (error) {
        console.error("Search failed:", error);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSelectLocation = (location: LocationSuggestion) => {
    if (onSelect) {
      onSelect({
        name: location.ward || location.city || location.display_name,
        ward: location.ward,
        city: location.city,
        postcode: location.postcode,
        lat: location.lat,
        lon: location.lon,
      });
    }
    setValue("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleUseCurrentLocation = async () => {
    if (!onSelect || isResolvingLocation) return;

    setIsResolvingLocation(true);
    try {
      const { locationInfo } = await resolveUserLocation();

      // Extract city, handling case where city might equal ward (ward level detail)
      let city = locationInfo.city;
      if (city === locationInfo.ward && locationInfo.state) {
        // If city equals ward, use state or try to extract from display_name
        const parts = locationInfo.display_name.split(",").map((p) => p.trim());
        // Try to find a part that's different from the ward (likely the city)
        city =
          parts.find(
            (p) => p !== locationInfo.ward && p !== locationInfo.state,
          ) || locationInfo.city;
      }

      onSelect({
        name:
          locationInfo.ward || locationInfo.city || locationInfo.display_name,
        ward: locationInfo.ward,
        city: city,
        postcode: locationInfo.postcode,
        lat: locationInfo.lat,
        lon: locationInfo.lon,
      });
      setValue("");
      setSuggestions([]);
      setShowSuggestions(false);
    } catch (error) {
      console.error("Failed to resolve current location", error);
    } finally {
      setIsResolvingLocation(false);
    }
  };

  const clearSearch = () => {
    setValue("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-2">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MapPin className="h-5 w-5 text-zinc-300" />
        </div>
        <Input
          type="text"
          value={value}
          onChange={(e) => handleSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") clearSearch();
          }}
          onFocus={() => value.length >= 2 && setShowSuggestions(true)}
          placeholder="Search an area or address..."
          className="h-12 w-full rounded-xl border border-teal-300/35 bg-slate-900/80 pl-11 pr-10 text-white text-sm placeholder:text-zinc-300/80 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_10px_30px_rgba(6,182,212,0.18)] outline-none ring-teal-400/35 backdrop-blur-xl transition-all focus:border-teal-300/70 focus:bg-slate-900/90 focus:ring-4 hover:border-teal-300/55 hover:bg-slate-900/85"
        />
        {value && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-2 flex items-center text-zinc-400 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Search Results Dropdown */}
        {showSuggestions && value.length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto rounded-xl border border-teal-300/35 bg-slate-900/95 backdrop-blur-xl shadow-lg z-50">
            {isSearching && (
              <div className="space-y-3 p-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-4 h-4 rounded-full bg-teal-500/20 shrink-0 mt-1 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-teal-500/10 rounded w-3/4 animate-pulse" />
                      <div className="h-2 bg-teal-500/5 rounded w-full animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isSearching && suggestions.length === 0 && (
              <div className="p-6 text-center">
                <MapPin className="h-8 w-8 text-zinc-600 mx-auto mb-2 opacity-50" />
                <p className="text-zinc-400 text-sm font-medium">
                  No areas found
                </p>
                <p className="text-zinc-500 text-xs mt-1">
                  Try searching by city name, ward, or area
                </p>
              </div>
            )}

            {!isSearching && suggestions.length > 0 && (
              <>
                <div className="sticky top-0 px-4 py-2 border-b border-teal-300/20 bg-slate-900/80 backdrop-blur-sm">
                  <p className="text-xs text-zinc-400">
                    {suggestions.length} result
                    {suggestions.length > 1 ? "s" : ""} found
                  </p>
                </div>
                <div className="divide-y divide-teal-300/20">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectLocation(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-teal-500/15 transition-colors border-b border-teal-300/10 last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-teal-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm flex items-center gap-2">
                            {suggestion.ward ? (
                              <>
                                <span>{suggestion.ward}</span>
                                <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                                  Ward
                                </span>
                              </>
                            ) : (
                              <>
                                <span>{suggestion.city || "Location"}</span>
                                <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                                  City
                                </span>
                              </>
                            )}
                          </div>
                          {suggestion.city && suggestion.ward && (
                            <div className="text-xs text-zinc-400 mt-0.5">
                              {suggestion.city}
                            </div>
                          )}
                          <div className="text-xs text-zinc-500 mt-1 truncate">
                            {suggestion.state}
                            {suggestion.postcode && ` · ${suggestion.postcode}`}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={isResolvingLocation}
        className="mx-auto inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-4 py-1.5 text-sm font-semibold text-teal-200 hover:bg-teal-500/20 hover:border-teal-300/50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors w-full justify-center"
      >
        {isResolvingLocation ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Crosshair className="h-4 w-4" />
        )}
        Current location
      </button>
    </div>
  );
};
