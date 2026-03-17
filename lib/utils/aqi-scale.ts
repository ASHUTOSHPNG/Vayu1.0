export type AQICategory =
  | "Good"
  | "Moderate"
  | "Unhealthy for Sensitive Groups"
  | "Unhealthy"
  | "Very Unhealthy"
  | "Hazardous"
  | "Unknown";

export interface AQIInfo {
  category: AQICategory;
  color: string;
  cssVar: string;
}

/**
 * Returns the AQI category and associated color for a given AQI value.
 * @param aqi The Air Quality Index value (0 - 500+)
 * @returns AQIInfo object containing category, hex color, and CSS variable name
 */
export function getAQIInfo(aqi: number): AQIInfo {
  if (aqi < 0) {
    return { category: "Unknown", color: "#9ca3af", cssVar: "bg-gray-400" };
  }
  if (aqi <= 50) {
    return { category: "Good", color: "#00E400", cssVar: "var(--color-aqi-good)" };
  }
  if (aqi <= 100) {
    return { category: "Moderate", color: "#FFFF00", cssVar: "var(--color-aqi-moderate)" };
  }
  if (aqi <= 150) {
    return { category: "Unhealthy for Sensitive Groups", color: "#FF7E00", cssVar: "var(--color-aqi-usg)" };
  }
  if (aqi <= 200) {
    return { category: "Unhealthy", color: "#FF0000", cssVar: "var(--color-aqi-unhealthy)" };
  }
  if (aqi <= 300) {
    return { category: "Very Unhealthy", color: "#8F3F97", cssVar: "var(--color-aqi-very-unhealthy)" };
  }
  
  // 301+
  return { category: "Hazardous", color: "#7E0023", cssVar: "var(--color-aqi-hazardous)" };
}
