import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { fetchFireHotspots, assessFireRisk, FireHotspot } from "@/lib/api-clients/firms";

export const dynamic = "force-dynamic";

// Define broad geographic regions for fire data pre-fetching
const INDIA_REGIONS = [
    { name: 'North India', bbox: { minLat: 25, minLon: 72, maxLat: 37, maxLon: 85 } },
    { name: 'South India', bbox: { minLat: 8, minLon: 72, maxLat: 20, maxLon: 85 } },
    { name: 'East India', bbox: { minLat: 20, minLon: 82, maxLat: 28, maxLon: 97 } },
    { name: 'West India', bbox: { minLat: 15, minLon: 68, maxLat: 25, maxLon: 75 } }
];

export async function GET(request: NextRequest) {
    return handleRequest(request);
}

export async function POST(request: NextRequest) {
    return handleRequest(request);
}

async function handleRequest(request: NextRequest) {
    const supabase = await createClient();
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // 1. Security check
    let isAuthorized = false;
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
        isAuthorized = true;
    } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('admin_type')
                .eq('id', user.id)
                .single();
            if (profile?.admin_type === 'central_admin') isAuthorized = true;
        }
    }

    if (!isAuthorized) return new NextResponse("Unauthorized", { status: 401 });

    const startTime = new Date();
    const host = (await headers()).get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    let recordsProcessed = 0;
    let totalHotspotsDetected = 0;
    const highRiskCities: string[] = [];

    try {
        // --- STEP 1: PRE-FETCH REGIONAL FIRE DATA ---
        console.log("Pre-fetching regional fire hotspots...");
        const regionalHotspots: Record<string, FireHotspot[]> = {};
        let allUniqueHotspots: FireHotspot[] = [];

        for (const region of INDIA_REGIONS) {
            try {
                const result = await fetchFireHotspots(region.bbox, 1); // Last 24 hours
                regionalHotspots[region.name] = result.hotspots;
                allUniqueHotspots = [...allUniqueHotspots, ...result.hotspots];
                totalHotspotsDetected += result.hotspots.length;

                // ARCHIVE: Save snapshot to fire_snapshots
                const maxFRP = result.hotspots.length > 0 ? Math.max(...result.hotspots.map(h => h.frp)) : 0;
                const avgFRP = result.hotspots.length > 0 ? result.hotspots.reduce((sum, h) => sum + h.frp, 0) / result.hotspots.length : 0;

                await supabase.from('fire_snapshots').upsert({
                    region_name: region.name,
                    bbox: region.bbox as any,
                    hotspot_count: result.hotspots.length,
                    high_confidence_count: result.highConfidenceCount,
                    max_frp: maxFRP,
                    avg_frp: avgFRP,
                    snapshot_date: new Date().toISOString().split('T')[0],
                    metadata: { hotspots_preview: result.hotspots.slice(0, 50) } as any
                } as any, { onConflict: 'region_name,snapshot_date' });

            } catch (regionErr) {
                console.error(`Error fetching fire data for ${region.name}:`, regionErr);
            }
        }

        // --- STEP 2: PROCESS LOCATIONS ---
        const { data: locations, error: locError } = await supabase
            .from("locations")
            .select("id, latitude, longitude, name")
            .or('type.eq.city,type.eq.ward');

        if (locError) throw locError;
        if (!locations || locations.length === 0) {
            return NextResponse.json({ message: "No locations to process", count: 0 });
        }

        const batchSize = 10;
        for (let i = 0; i < locations.length; i += batchSize) {
            const batch = locations.slice(i, i + batchSize);

            await Promise.allSettled(batch.map(async (loc) => {
                try {
                    // a. Call Weather API (Wait for weather as it's needed for fire risk)
                    const weatherResp = await fetch(`${baseUrl}/api/weather?lat=${loc.latitude}&lon=${loc.longitude}&type=current`);
                    if (!weatherResp.ok) throw new Error(`Weather API failed: ${weatherResp.status}`);
                    const weatherData = await weatherResp.json();

                    // b. Fire risk assessment using pre-fetched data
                    // Filter down broad regional data to hotspots within 500km of city
                    const cityFireRisk = await assessFireRisk(
                        loc.latitude,
                        loc.longitude,
                        weatherData.wind_direction || 0,
                        weatherData.wind_speed || 0,
                        1,
                        allUniqueHotspots // Pass pre-fetched national/regional list
                    );

                    if (cityFireRisk.riskLevel === 'high' || cityFireRisk.riskLevel === 'critical') {
                        highRiskCities.push(loc.name);
                    }

                    // c. Call AQI API (Passing fireRisk assessment)
                    const aqiResp = await fetch(`${baseUrl}/api/aqi`, {
                        method: 'POST',
                        body: JSON.stringify({
                            lat: loc.latitude,
                            lon: loc.longitude,
                            fireRisk: cityFireRisk
                        })
                    });
                    if (!aqiResp.ok) throw new Error(`AQI API failed: ${aqiResp.status}`);
                    const aqiData = await aqiResp.json();

                    // d. Compute dispersion adjusted AQI
                    const dispersionFactor = weatherData.dispersion_factor || 1.0;
                    const safeDispersion = Math.max(0.1, dispersionFactor);
                    const adjustedAQI = Math.round(aqiData.aqi * (1 / safeDispersion));

                    // e. Save to Supabase
                    const hourTruncated = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate(), startTime.getHours()).toISOString();

                    const { error: upsertError } = await supabase
                        .from("aqi_readings")
                        .upsert({
                            location_id: loc.id,
                            aqi_value: adjustedAQI,
                            recorded_at: hourTruncated,
                            source: aqiData.source,
                            pm25: aqiData.pollutants?.pm25,
                            pm10: aqiData.pollutants?.pm10,
                            no2: aqiData.pollutants?.no2,
                            so2: aqiData.pollutants?.so2,
                            co: aqiData.pollutants?.co,
                            o3: aqiData.pollutants?.o3,
                            temperature: weatherData.temperature,
                            humidity: weatherData.humidity,
                            wind_speed: weatherData.wind_speed,
                            wind_direction: weatherData.wind_direction,
                            fire_risk_data: cityFireRisk as any // Integrated column
                        } as any, { onConflict: 'location_id,recorded_at' });

                    if (upsertError) throw upsertError;

                    // f. Anomaly / Source detection (pass fireRisk)
                    const detectionResp = await fetch(`${baseUrl}/api/source-detection`, {
                        method: 'POST',
                        body: JSON.stringify({
                            location_id: loc.id,
                            lat: loc.latitude,
                            lon: loc.longitude,
                            fireRisk: cityFireRisk
                        })
                    });

                    if (detectionResp.ok) {
                        const detectionData = await detectionResp.json();

                        // NEW: Update the reading with the anomaly score
                        await supabase
                            .from("aqi_readings")
                            .update({ anomaly_score: detectionData.anomaly_score } as any)
                            .eq('location_id', loc.id)
                            .eq('recorded_at', hourTruncated);

                        if (detectionData.anomaly_score > 6 || detectionData.sustained_anomaly) {

                            await fetch(`${baseUrl}/api/recommend`, {
                                method: 'POST',
                                body: JSON.stringify({
                                    location_id: loc.id,
                                    locationName: loc.name,
                                    anomalyData: {
                                        aqi: adjustedAQI,
                                        anomalyScore: detectionData.anomaly_score,
                                        summary: detectionData.sustained_anomaly ? "Sustained high AQI detected" : "AQI anomaly detected"
                                    },
                                    detectedSources: detectionData.detected_sources,
                                    weatherData: weatherData,
                                    fireRiskAssessment: cityFireRisk
                                })
                            });
                        }
                    }

                    recordsProcessed++;
                } catch (err) {
                    console.error(`Error processing location ${loc.id}:`, err);
                }
            }));
        }

        // --- STEP 3: LOG JOB RUN ---
        await supabase.from("cron_logs").insert({
            job_name: "refresh-data",
            status: "success",
            records_processed: recordsProcessed,
            ran_at: startTime.toISOString(),
            metadata: {
                total_hotspots: totalHotspotsDetected,
                high_risk_cities: highRiskCities,
                execution_time_ms: Date.now() - startTime.getTime()
            } as any
        } as any);

        return NextResponse.json({
            success: true,
            records_processed: recordsProcessed,
            hotspots_detected: totalHotspotsDetected,
            high_risk_cities: highRiskCities.length,
            duration_ms: Date.now() - startTime.getTime()
        });

    } catch (error: any) {
        console.error("Cron Job Failed:", error);
        await supabase.from("cron_logs").insert({
            job_name: "refresh-data",
            status: "failed",
            error_message: error.message,
            ran_at: startTime.toISOString()
        });

        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
