import { LocationInfo, LocationSuggestion } from "@/types/geocoding";
import { fetchWithRetry } from "./meteorological";

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<LocationInfo> {
  const url = `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
  const response = await fetchWithRetry(url, {
    headers: { "User-Agent": "VAYU/1.0 (Contact: support@vayu.in)" },
  });
  const data = await response.json();
  if (data.error) throw new Error(`Reverse geocode failed: ${data.error}`);
  const { address, display_name } = data;
  const parts = display_name.split(",").map((p: string) => p.trim());
  let extractedWard = address.city_district || address.suburb || address.neighbourhood;
  if (!extractedWard && parts.length > 0) extractedWard = parts[0];
  let extractedCity =
    address.county || address.city || address.town ||
    address.district || address.village || address.municipality;
  if (!extractedCity && extractedWard && parts.length > 1) extractedCity = parts[1];
  if (!extractedCity && parts.length > 1) extractedCity = parts[1];
  return {
    display_name,
    city: extractedCity,
    state: address.state,
    country: address.country,
    ward: extractedWard,
    suburb: address.suburb,
    postcode: address.postcode,
    lat,
    lon,
  };
}

export async function searchLocations(
  query: string,
): Promise<LocationSuggestion[]> {
  if (!query || query.length < 2) return [];
  const url = `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&countrycodes=in`;
  const response = await fetchWithRetry(url, {
    headers: { "User-Agent": "VAYU/1.0 (Contact: support@vayu.in)" },
  });
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error("Invalid response format from Nominatim");
  return data.map((item: any) => {
    const displayName = item.display_name;
    const parts = displayName.split(",").map((p: string) => p.trim());
    const extractedWard =
      item.address?.city_district || item.address?.suburb ||
      item.address?.neighbourhood || (parts.length > 0 ? parts[0] : undefined);
    const extractedCity =
      item.address?.county || item.address?.city ||
      item.address?.town || item.address?.village ||
      (parts.length > 1 ? parts[1] : undefined);
    return {
      display_name: displayName,
      city: extractedCity,
      state: item.address?.state,
      ward: extractedWard,
      postcode: item.address?.postcode,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    };
  });
}

/**
 * Geocode a city name to coordinates using Nominatim.
 * Used server-side for OpenAQ radius search.
 */
export async function geocodeCity(
  city: string,
): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(city)}&limit=1&addressdetails=0&countrycodes=in`;
    const response = await fetchWithRetry(url, {
      headers: { "User-Agent": "VAYU/1.0 (Contact: support@vayu.in)" },
    });
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };
  } catch {
    return null;
  }
}

export type GeolocationStatus =
  | "idle" | "requesting" | "granted" | "denied" | "unavailable" | "error";

export interface GeolocationResult {
  lat: number;
  lon: number;
  locationInfo: LocationInfo;
  source: "gps" | "ip_fallback";
}

export async function resolveUserLocation(
  onStatusChange?: (status: GeolocationStatus) => void,
): Promise<GeolocationResult> {
  if (!navigator.geolocation) {
    onStatusChange?.("unavailable");
    return fallbackToIPGeolocation();
  }
  if ("permissions" in navigator) {
    try {
      const permission = await navigator.permissions.query({ name: "geolocation" as PermissionName });
      if (permission.state === "denied") {
        onStatusChange?.("denied");
        return fallbackToIPGeolocation();
      }
    } catch (err) {
      console.warn("Permission query not supported", err);
    }
  }
  onStatusChange?.("requesting");
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        onStatusChange?.("granted");
        const { latitude: lat, longitude: lon } = position.coords;
        try {
          const locationInfo = await reverseGeocode(lat, lon);
          resolve({ lat, lon, locationInfo, source: "gps" });
        } catch (error) {
          console.error("Reverse geocode failed", error);
          resolve(await fallbackToIPGeolocation());
        }
      },
      async (error) => {
        onStatusChange?.(error.code === error.PERMISSION_DENIED ? "denied" : "error");
        resolve(await fallbackToIPGeolocation());
      },
      { timeout: 10000, maximumAge: 300000, enableHighAccuracy: false },
    );
  });
}

async function fallbackToIPGeolocation(): Promise<GeolocationResult> {
  const DEFAULT_LAT = 28.6139;
  const DEFAULT_LON = 77.2090;
  const DEFAULT_LOCATION: LocationInfo = {
    display_name: "New Delhi, India",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
    ward: undefined,
    suburb: undefined,
    postcode: undefined,
    lat: DEFAULT_LAT,
    lon: DEFAULT_LON,
  };
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    const lat = data.latitude ?? DEFAULT_LAT;
    const lon = data.longitude ?? DEFAULT_LON;
    try {
      const locationInfo = await reverseGeocode(lat, lon);
      return { lat, lon, locationInfo, source: "ip_fallback" };
    } catch {
      return { lat, lon, locationInfo: { ...DEFAULT_LOCATION, lat, lon }, source: "ip_fallback" };
    }
  } catch {
    return { lat: DEFAULT_LAT, lon: DEFAULT_LON, locationInfo: DEFAULT_LOCATION, source: "ip_fallback" };
  }
}