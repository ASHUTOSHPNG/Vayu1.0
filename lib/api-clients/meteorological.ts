import { WeatherData, WeatherForecast } from "@/types/weather";

const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const TIMEOUT_MS = 10000;
const MAX_RETRIES = 3;

/**
 * Fetch with timeout and retry logic.
 */
export async function fetchWithRetry(
    url: string,
    options: RequestInit = {},
    retries = MAX_RETRIES,
    backoff = 1000
): Promise<Response> {
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(id);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
    } catch (error) {
        if (retries > 0) {
            console.warn(`Fetch failed (${(error as Error).message}). Retrying in ${backoff}ms...`);
            await new Promise((resolve) => setTimeout(resolve, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw new Error(`Fetch failed after ${MAX_RETRIES} retries: ${(error as Error).message}`);
    }
}

/**
 * Calculates a dispersion factor (0-1) based on wind speed and boundary layer height.
 * Higher score = better dispersion (lower pollutant concentration).
 * 
 * @param windSpeed m/s
 * @param boundaryLayerHeight meters (approximate if not provided directly by API)
 * @returns 0 to 1 score
 */
export function calculateDispersionFactor(windSpeed: number, boundaryLayerHeight: number): number {
    // Simple heuristic model:
    // Dispersion roughly proportional to wind speed * boundary layer height (Ventilation Coefficient)
    // Normal VC ranges from 2000 (poor) to 6000+ (good) m^2/s depending on geography.
    const ventilationCoefficient = windSpeed * boundaryLayerHeight;

    // Normalize between 0 and 1
    // Assumes VC > 6000 is excellent (1.0), and VC < 1000 is very poor (0.0)
    const MAX_VC = 6000;
    let factor = ventilationCoefficient / MAX_VC;

    factor = Math.max(0, Math.min(1, factor)); // Clamp between 0 and 1

    return Number(factor.toFixed(2));
}

/**
 * Derives a rough boundary layer description and height based on solar time, weather, and wind.
 * Real boundary layer height requires sounding data or specialized models, so this is a 
 * placeholder heuristic required downstream.
 */
function estimateBoundaryLayer(weatherId: number, windSpeed: number, lat: number, lon: number): { height: number, description: string } {
    // simplified heuristic
    // Day time + clear + low wind = high BL (unstable)
    // Night time + clear + low wind = low BL (stable - inversion)
    // High wind = neutral, mechanical mixing (~1000m)

    // Default to a neutral mixing height
    let height = 1000;
    let description = "neutral";

    if (windSpeed > 5) {
        description = "neutral (mechanically mixed)";
        height = 1000 + (windSpeed * 50); // wind increases mechanical mixing
    } else if (weatherId >= 800 && weatherId <= 801) { // Clear or mostly clear
        // In a real app we'd use local solar time. Randomize slightly for demo or use fixed typical day value
        description = "unstable (daytime convective)";
        height = 1500;
    } else {
        description = "stable (inversion potential)";
        height = 500;
    }

    return { height, description };
}

/**
 * Fetches current weather from OpenWeatherMap. Falls back to Open-Meteo.
 */
export async function fetchCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    if (OPENWEATHERMAP_API_KEY) {
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;
            const response = await fetchWithRetry(url);
            const data = await response.json();

            const bl = estimateBoundaryLayer(data.weather[0].id, data.wind.speed, lat, lon);
            const dispersion_factor = calculateDispersionFactor(data.wind.speed, bl.height);

            return {
                temperature: data.main.temp,
                humidity: data.main.humidity,
                wind_speed: data.wind.speed, // m/s
                wind_direction: data.wind.deg,
                boundary_layer_description: bl.description,
                weather_condition: data.weather[0].main,
                dispersion_factor
            };
        } catch (error) {
            console.warn("OpenWeatherMap fetch failed, falling back to Open-Meteo:", error);
            // Fall through to Open-Meteo
        }
    } else {
        console.warn("OPENWEATHERMAP_API_KEY is not defined. Using Open-Meteo as primary for current weather.");
    }

    // Fallback to Open-Meteo
    return fetchCurrentWeatherOpenMeteo(lat, lon);
}

/**
 * Open-Meteo fallback for current weather.
 */
async function fetchCurrentWeatherOpenMeteo(lat: number, lon: number): Promise<WeatherData> {
    // Open-Meteo is free and doesn't require a key
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m`;

    try {
        const response = await fetchWithRetry(url);
        const data = await response.json();

        // Open-Meteo weather codes need mapping to generic condition strings
        // WMO Weather interpretation codes (WW)
        const condition = mapWmoCodeToCondition(data.current.weather_code);

        // Convert wind speed from km/h to m/s
        const windSpeedMs = data.current.wind_speed_10m / 3.6;

        const bl = estimateBoundaryLayer(data.current.weather_code, windSpeedMs, lat, lon);
        const dispersion_factor = calculateDispersionFactor(windSpeedMs, bl.height);

        return {
            temperature: data.current.temperature_2m,
            humidity: data.current.relative_humidity_2m,
            wind_speed: windSpeedMs,
            wind_direction: data.current.wind_direction_10m,
            boundary_layer_description: bl.description,
            weather_condition: condition,
            dispersion_factor
        };
    } catch (error) {
        console.error("Open-Meteo fetch failed:", error);
        throw new Error(`Failed to fetch current weather data from all sources: ${(error as Error).message}`);
    }
}

/**
 * Fetches the weather forecast for the next `hours` from Open-Meteo.
 */
export async function fetchWeatherForecast(lat: number, lon: number, hours: number): Promise<WeatherForecast[]> {
    const normalizedHours = Math.min(Math.max(1, hours), 72); // Max 72 hours

    // Need to request 'forecast_hours' instead of just 'hourly' usually we just request hourly and slice the array
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,wind_direction_10m&forecast_days=4`;

    try {
        const response = await fetchWithRetry(url);
        const data = await response.json();

        const forecast: WeatherForecast[] = [];

        const now = new Date();
        // Find the closest hour index
        let startIndex = 0;
        for (let i = 0; i < data.hourly.time.length; i++) {
            if (new Date(data.hourly.time[i]) >= now) {
                startIndex = i;
                break;
            }
        }

        for (let i = 0; i < normalizedHours; i++) {
            const index = startIndex + i;
            if (index >= data.hourly.time.length) break;

            forecast.push({
                time: data.hourly.time[index],
                temperature_2m: data.hourly.temperature_2m[index],
                relative_humidity_2m: data.hourly.relative_humidity_2m[index],
                // keeping wind speed in m/s for consistency, Open-Meteo returns km/h
                wind_speed_10m: data.hourly.wind_speed_10m[index] / 3.6,
                wind_direction_10m: data.hourly.wind_direction_10m[index],
                precipitation_probability: data.hourly.precipitation_probability[index]
            });
        }

        return forecast;
    } catch (error) {
        console.error("Failed to fetch forecast from Open-Meteo:", error);
        throw new Error(`Failed to fetch forecast: ${(error as Error).message}`);
    }
}

/**
 * Maps WMO code to simple string.
 */
function mapWmoCodeToCondition(code: number): string {
    if (code === 0) return "Clear";
    if (code >= 1 && code <= 3) return "Clouds";
    if (code >= 45 && code <= 48) return "Fog";
    if (code >= 51 && code <= 55) return "Drizzle";
    if (code >= 61 && code <= 65) return "Rain";
    if (code >= 71 && code <= 77) return "Snow";
    if (code >= 80 && code <= 82) return "Rain Showers";
    if (code >= 85 && code <= 86) return "Snow Showers";
    if (code >= 95) return "Thunderstorm";
    return "Unknown";
}
