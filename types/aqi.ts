import { FireRiskAssessment } from "@/lib/api-clients/firms";

export interface PollutantValues {
    pm25?: number; // µg/m³
    pm10?: number; // µg/m³
    no2?: number;  // ppb or µg/m³
    so2?: number;  // ppb or µg/m³
    o3?: number;   // ppb or µg/m³
    co?: number;   // ppm or µg/m³
}

export type DataSource = 'openaq' | 'satellite' | 'auto';

export interface AQReading {
    aqi: number;
    pollutants: PollutantValues;
    source: DataSource;
    timestamp: string; // ISO String
    fireRiskAssessment?: FireRiskAssessment;
}

export interface SatelliteReading {
    no2_column_density?: number; // mol/m^2
    aerosol_optical_depth?: number;
    timestamp: string;
}

export interface AQICategory {
    label: string;
    color: string;
    healthMessage: string;
}

/**
 * Helper function to map an AQI score to the US EPA AQI category.
 */
export function getAQICategory(aqi: number): AQICategory {
    if (aqi <= 50) {
        return { label: "Good", color: "#00e400", healthMessage: "Air quality is satisfactory, and air pollution poses little or no risk." };
    }
    if (aqi <= 100) {
        return { label: "Moderate", color: "#ffff00", healthMessage: "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution." };
    }
    if (aqi <= 150) {
        return { label: "Unhealthy for Sensitive Groups", color: "#ff7e00", healthMessage: "Members of sensitive groups may experience health effects. The general public is less likely to be affected." };
    }
    if (aqi <= 200) {
        return { label: "Unhealthy", color: "#ff0000", healthMessage: "Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects." };
    }
    if (aqi <= 300) {
        return { label: "Very Unhealthy", color: "#8f3f97", healthMessage: "Health alert: The risk of health effects is increased for everyone." };
    }
    return { label: "Hazardous", color: "#7e0023", healthMessage: "Health warning of emergency conditions: everyone is more likely to be affected." };
}
