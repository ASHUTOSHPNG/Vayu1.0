// lib/aqi/types.ts
// Shared TypeScript types for AQI data across Vayu

export interface AqiCategory {
  label: "Good" | "Satisfactory" | "Moderate" | "Poor" | "Very Poor" | "Severe";
  color: string;
}

export interface Pollutants {
  pm25: number | null;
  pm10: number | null;
  no2:  number | null;
  o3:   number | null;
  co:   number | null;
  so2:  number | null;
}

export interface WardAqi {
  source: "openaq" | "waqi";
  ward: string;
  locality?: string | null;
  lat: number | null;
  lon: number | null;
  pm25: number | null;
  pm10: number | null;
  aqi: number | null;
  category: AqiCategory | null;
  lastUpdated: string | null;
}

export interface CityAqi {
  city: string;
  state: string;
  aqi: number | null;
  category: AqiCategory | null;
  pollutants: Pollutants;
  station: string | null;
  geo: [number, number] | null;
  lastUpdated: string | null;
  wards: WardAqi[];
  source: {
    waqi: boolean;
    openaq: boolean;
  };
}

export interface CitiesResponse {
  success: boolean;
  meta: {
    total: number;
    avgAqi: number | null;
    hazardous: number;
    goodOrModerate: number;
    fetchedAt: string;
  };
  data: CityAqi[];
}

export interface WardResponse {
  success: boolean;
  city: string;
  overall: {
    aqi: number | null;
    category: AqiCategory | null;
    station: string | null;
    pollutants: Pollutants;
    lastUpdated: string | null;
  };
  wards: WardAqi[];
  meta: {
    total: number;
    worstWard: string | null;
    worstAqi: number | null;
    fetchedAt: string;
  };
}

// Helper: PM2.5 µg/m³ → India AQI
export function pm25ToAqi(pm: number): number {
  const bp: [number, number, number, number][] = [
    [0, 30, 0, 50], [30, 60, 51, 100], [60, 90, 101, 200],
    [90, 120, 201, 300], [120, 250, 301, 400], [250, 500, 401, 500],
  ];
  for (const [cL, cH, iL, iH] of bp) {
    if (pm >= cL && pm <= cH)
      return Math.round(((iH - iL) / (cH - cL)) * (pm - cL) + iL);
  }
  return 500;
}

// Helper: AQI → category
export function getAqiCategory(aqi: number): AqiCategory {
  if (aqi <= 50)  return { label: "Good",         color: "#55a84f" };
  if (aqi <= 100) return { label: "Satisfactory",  color: "#a3c853" };
  if (aqi <= 200) return { label: "Moderate",      color: "#f5c518" };
  if (aqi <= 300) return { label: "Poor",          color: "#f29c33" };
  if (aqi <= 400) return { label: "Very Poor",     color: "#e93f33" };
  return           { label: "Severe",              color: "#7e0023" };
}
