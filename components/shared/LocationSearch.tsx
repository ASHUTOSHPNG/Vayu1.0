"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2, MapPin } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { LocationSuggestion } from "@/types/geocoding";
import { resolveUserLocation } from "@/lib/api-clients/geocoding";

interface LocationSearchProps {
    onLocationSelect: (lat: number, lon: number, name: string) => void;
    variant?: "citizen" | "admin";
    placeholder?: string;
    className?: string;
}

export function LocationSearch({
    onLocationSelect,
    variant = "citizen",
    placeholder = "Search area, city...",
    className,
}: LocationSearchProps) {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [suggestions, setSuggestions] = React.useState<LocationSuggestion[]>(
        []
    );
    const [isLoading, setIsLoading] = React.useState(false);
    const [isResolvingLocation, setIsResolvingLocation] = React.useState(false);

    // Debounced search effect
    React.useEffect(() => {
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await fetch(
                    `/api/geocode?q=${encodeURIComponent(query)}`
                );
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data);
                }
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsLoading(false);
            }
        }, 400); // 400ms debounce

        return () => clearTimeout(timer);
    }, [query]);

    const handleUseMyLocation = async () => {
        setIsResolvingLocation(true);
        try {
            const { lat, lon, locationInfo } = await resolveUserLocation();
            setOpen(false);
            onLocationSelect(lat, lon, locationInfo.display_name);
        } catch (error) {
            console.error("Failed to resolve user location", error);
            // Fallback UI indication could be added here
        } finally {
            setIsResolvingLocation(false);
        }
    };

    const handleSelect = (suggestion: LocationSuggestion) => {
        setOpen(false);
        onLocationSelect(
            suggestion.lat,
            suggestion.lon,
            suggestion.display_name
        );
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full max-w-[400px] justify-between",
                        variant === "admin"
                            ? "bg-slate-900 border-slate-800 text-slate-100 hover:bg-slate-800"
                            : "bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md",
                        className
                    )}
                >
                    {placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command
                    className={cn(
                        variant === "admin"
                            ? "bg-slate-900 text-slate-100 border-slate-800"
                            : ""
                    )}
                    shouldFilter={false} // We are filtering server-side via API
                >
                    <CommandInput
                        placeholder={placeholder}
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {isLoading ? (
                                <div className="flex items-center justify-center p-4">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                                    <span>Searching...</span>
                                </div>
                            ) : query.length < 3 ? (
                                "Type at least 3 characters to search..."
                            ) : (
                                "No locations found."
                            )}
                        </CommandEmpty>

                        <CommandGroup>
                            <CommandItem
                                onSelect={handleUseMyLocation}
                                className="font-medium text-blue-600 dark:text-blue-400 cursor-pointer"
                            >
                                {isResolvingLocation ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <MapPin className="mr-2 h-4 w-4" />
                                )}
                                Use my current location
                            </CommandItem>
                        </CommandGroup>
                        <CommandSeparator />

                        {suggestions.length > 0 && (
                            <CommandGroup heading="Suggestions">
                                {suggestions.map((suggestion, i) => (
                                    <CommandItem
                                        key={`${suggestion.lat}-${suggestion.lon}-${i}`}
                                        value={suggestion.display_name} // CommandItem requires a unique string value
                                        onSelect={() => handleSelect(suggestion)}
                                        className="cursor-pointer"
                                    >
                                        <div className="flex flex-col">
                                            <span className="truncate w-[350px]">
                                                {suggestion.display_name}
                                            </span>
                                            {suggestion.city && suggestion.state && (
                                                <span className="text-xs text-muted-foreground mt-0.5">
                                                    {suggestion.city}, {suggestion.state}
                                                </span>
                                            )}
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
