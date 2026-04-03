import { NextResponse } from 'next/server';
import { classifyPollutionSource, computeAnomalyScore, detectSustainedAnomaly, AQReading, WeatherData } from '@/lib/ml/sourceDetection';
import { createAdminClient } from '@/lib/supabase/server';

async function fetchRecentReadings(locationId: string): Promise<AQReading[]> {
    const supabase = await createAdminClient();
    const { data } = await supabase
        .from('aqi_readings')
        .select('*')
        .eq('ward_id', locationId)
        .order('recorded_at', { ascending: false })
        .limit(24);

    if (!data || data.length === 0) return [];

    return (data as any[]).map(r => ({
        timestamp: r.recorded_at,
        aqi: r.aqi_value,
        pm25: r.pm25,
        pm10: r.pm10,
        no2: r.no2,
        so2: r.so2,
        co: r.co,
        o3: r.o3
    }));
}

async function fetchCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    try {
        const res = await fetch(`${baseUrl}/api/weather?lat=${lat}&lon=${lon}&type=current`);
        if (!res.ok) throw new Error('Weather API failed');
        const data = await res.json();
        return {
            windSpeed: data.wind_speed || 0,
            windDirection: data.wind_direction || 0,
            temperature: data.temperature || 0,
            humidity: data.humidity || 0,
        };
    } catch (error) {
        console.error('Error fetching weather for source detection:', error);
        return { windSpeed: 0, windDirection: 0, temperature: 0, humidity: 0 };
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const location_id = body.location_id || body.locationId;
        const lat = body.lat;
        const lon = body.lon;
        const fireRisk = body.fireRisk;

        if (!location_id) {
            return NextResponse.json({ error: 'Missing required parameter: location_id' }, { status: 400 });
        }

        // 1. Fetch data
        const history = await fetchRecentReadings(location_id);
        if (!history || history.length === 0) {
            return NextResponse.json({ error: 'No historical readings found for location: ' + location_id }, { status: 404 });
        }

        const currentReading = history[0];

        // 2. Fetch weather if lat/lon provided, otherwise use latest reading weather
        let weather: WeatherData;
        if (lat && lon) {
            weather = await fetchCurrentWeather(lat, lon);
        } else {
            const supabase = await createAdminClient();
            const { data: latest } = await supabase
                .from('aqi_readings')
                .select('*')
                .eq('ward_id', location_id)
                .order('recorded_at', { ascending: false })
                .limit(1)
                .single();

            weather = {
                windSpeed: (latest as any)?.wind_speed || 0,
                windDirection: (latest as any)?.wind_direction || 0,
                temperature: (latest as any)?.temperature || 0,
                humidity: (latest as any)?.humidity || 0
            };
        }

        // 3. Run Heuristic ML Rules
        const signatures = classifyPollutionSource(currentReading, weather, history, fireRisk);
        const anomalyScore = computeAnomalyScore(currentReading, history);
        const isSustained = detectSustainedAnomaly(history, 6);

        // 4. Save to database — pollution_sources doesn't exist in schema
        const supabase = await createAdminClient();
        if (signatures.length > 0) {
            await (supabase as any).from('pollution_sources').insert({
                location_id,
                source_type: signatures[0].sourceType,
                confidence_score: signatures[0].confidence,
                detected_at: new Date().toISOString(),
                fire_risk_data: fireRisk || null,
                raw_features: {
                    anomaly_score: anomalyScore,
                    is_sustained: isSustained,
                    indicators: signatures[0].indicators,
                    weather_at_detection: weather
                }
            });
        }

        return NextResponse.json({
            location_id,
            current_aqi: currentReading.aqi,
            detected_sources: signatures,
            fire_risk: fireRisk,
            anomaly_score: anomalyScore,
            sustained_anomaly: isSustained,
            trigger_policy_engine: anomalyScore > 6 || isSustained
        });

    } catch (error: Error | any) {
        console.error('Error in source-detection API:', error);
        return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
    }
}