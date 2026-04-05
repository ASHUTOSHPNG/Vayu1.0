export interface WeatherData {
    temperature: number; // in Celsius
    humidity: number; // in %
    wind_speed: number; // in m/s
    wind_direction: number; // in degrees
    boundary_layer_description?: string; // e.g. "stable", "unstable", "neutral"
    weather_condition: string; // e.g., "Clear", "Rain"
    dispersion_factor?: number; // 0-1 score indicating how well pollutants will disperse
}

export interface WeatherForecast {
    time: string; // ISO 8601 string
    temperature_2m: number; // in Celsius
    relative_humidity_2m: number; // in %
    wind_speed_10m: number; // in km/h or m/s (standardize to m/s based on API)
    wind_direction_10m: number; // in degrees
    precipitation_probability: number; // in %
}
