import { LocationInfo, LocationSuggestion } from "@/types/geocoding";
import { fetchWithRetry } from "./meteorological"; // Reuse utility from met module

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

/**
 * Perform a reverse geocode using Nominatim to get city, country, etc from coordinates.
 * @param lat Latitude
 * @param lon Longitude
 * @returns Parsed LocationInfo
 */
export async function reverseGeocode(
    lat: number,
    lon: number
): Promise<LocationInfo> {
    const url = `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

    // Nominatim requires a user-agent to prevent blocks. We pass it via fetchWithRetry.
    const response = await fetchWithRetry(url, {
        headers: {
            "User-Agent": "VAYU/1.0 (Contact: support@vayu.in)",
        },
    });

    const data = await response.json();

    if (data.error) {
        throw new Error(`Reverse geocode failed: ${data.error}`);
    }

    const { address, display_name } = data;

    return {
        display_name: display_name,
        city:
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.county,
        state: address.state,
        country: address.country,
        ward: address.city_district || address.suburb || address.neighbourhood,
        suburb: address.suburb,
        postcode: address.postcode,
        lat,
        lon,
    };
}

/**
 * Search locations using Nominatim forward geocoding.
 * Biased heavily towards India.
 * @param query The search text
 * @returns Up to 8 location suggestions
 */
export async function searchLocations(
    query: string
): Promise<LocationSuggestion[]> {
    if (!query || query.length < 2) return [];

    // countrycodes=in biases it towards India
    const url = `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(
        query
    )}&limit=8&addressdetails=1&countrycodes=in`;

    const response = await fetchWithRetry(url, {
        headers: {
            "User-Agent": "VAYU/1.0 (Contact: support@vayu.in)", // Required by API Policy
        },
    });

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error("Invalid response format from Nominatim");
    }

    return data.map((item: any) => ({
        display_name: item.display_name,
        city:
            item.address?.city ||
            item.address?.town ||
            item.address?.village ||
            item.address?.county,
        state: item.address?.state,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
    }));
}

export type GeolocationStatus =
    | 'idle'
    | 'requesting'
    | 'granted'
    | 'denied'
    | 'unavailable'
    | 'error';

export interface GeolocationResult {
    lat: number;
    lon: number;
    locationInfo: LocationInfo;
    source: 'gps' | 'ip_fallback';
}

/**
 * Resolves the user's location gracefully.
 * Attempts HTML5 Geolocation first, falls back to IP Geolocation if denied or unavailable.
 * IMPORTANT: This must only be run entirely client-side.
 */
export async function resolveUserLocation(
    onStatusChange?: (status: GeolocationStatus) => void
): Promise<GeolocationResult> {
    // Step 1: Check if geolocation is supported
    if (!navigator.geolocation) {
        onStatusChange?.('unavailable');
        return fallbackToIPGeolocation();
    }

    // Step 2: Check existing permission (no prompt yet)
    if ('permissions' in navigator) {
        try {
            const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
            if (permission.state === 'denied') {
                onStatusChange?.('denied');
                return fallbackToIPGeolocation();
            }
        } catch (err) {
            console.warn("Permission query not supported", err);
        }
    }

    // Step 3: Request GPS — this triggers the browser prompt
    onStatusChange?.('requesting');
    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                onStatusChange?.('granted');
                const { latitude: lat, longitude: lon } = position.coords;
                try {
                    const locationInfo = await reverseGeocode(lat, lon);
                    resolve({ lat, lon, locationInfo, source: 'gps' });
                } catch (error) {
                    console.error("Reverse geocode failed", error);
                    const fallback = await fallbackToIPGeolocation();
                    resolve(fallback);
                }
            },
            async (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    onStatusChange?.('denied');
                } else {
                    onStatusChange?.('error');
                }
                const fallback = await fallbackToIPGeolocation();
                resolve(fallback);
            },
            { timeout: 10000, maximumAge: 300000, enableHighAccuracy: false }
        );
    });
}

async function fallbackToIPGeolocation(): Promise<GeolocationResult> {
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        const lat = data.latitude;
        const lon = data.longitude;
        const locationInfo = await reverseGeocode(lat, lon);
        return { lat, lon, locationInfo, source: 'ip_fallback' };
    } catch {
        // Last resort: default to New Delhi
        const lat = 28.6139, lon = 77.2090;
        const locationInfo = await reverseGeocode(lat, lon);
        return { lat, lon, locationInfo, source: 'ip_fallback' };
    }
}
