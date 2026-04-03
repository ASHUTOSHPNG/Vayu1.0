import { NextRequest, NextResponse } from "next/server";
import { fetchCurrentWeather, fetchWeatherForecast } from "@/lib/api-clients/meteorological";
import { createClient } from "@/lib/supabase/server";
import { isRateLimited } from "@/lib/api/rateLimit";

export async function GET(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
        return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    const searchParams = request.nextUrl.searchParams;
    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon");
    const type = searchParams.get("type");
    const hoursParam = searchParams.get("hours") || "72";

    if (!latParam || !lonParam || !type) {
        return NextResponse.json(
            { error: "Missing required query parameters: lat, lon, type" },
            { status: 400 }
        );
    }

    const lat = parseFloat(latParam);
    const lon = parseFloat(lonParam);
    const hours = parseInt(hoursParam, 10);

    if (isNaN(lat) || isNaN(lon) || (type === "forecast" && isNaN(hours))) {
        return NextResponse.json(
            { error: "Invalid query parameters: lat and lon must be numbers, hours must be an integer" },
            { status: 400 }
        );
    }

    if (type !== "current" && type !== "forecast") {
        return NextResponse.json(
            { error: "Invalid type parameter. Must be 'current' or 'forecast'" },
            { status: 400 }
        );
    }

    const supabase = await createClient();
    const cacheKey = `weather_${type}_${lat.toFixed(3)}_${lon.toFixed(3)}${type === "forecast" ? `_${hours}` : ""}`;

    try {
        // 1. Check Supabase cache — weather_cache doesn't exist in schema, cast to any
        const { data: cachedData, error: cacheError } = await (supabase as any)
            .from("weather_cache")
            .select("data, updated_at")
            .eq("key", cacheKey)
            .single();

        if (!cacheError && cachedData) {
            const cacheTimestamp = new Date((cachedData as any).updated_at).getTime();
            const now = Date.now();
            const fifteenMinutesMs = 15 * 60 * 1000;
            if (now - cacheTimestamp < fifteenMinutesMs) {
                return NextResponse.json((cachedData as any).data);
            }
        }

        // 2. Fetch fresh data
        let freshData;
        if (type === "current") {
            freshData = await fetchCurrentWeather(lat, lon);
        } else {
            freshData = await fetchWeatherForecast(lat, lon, hours);
        }

        // 3. Update cache asynchronously
        (async () => {
            try {
                await (supabase as any).from("weather_cache").upsert({
                    key: cacheKey,
                    data: freshData,
                    updated_at: new Date().toISOString()
                });
            } catch (e) {
                console.error("Failed to cache weather data in Supabase:", e);
            }
        })();

        return NextResponse.json(freshData);

    } catch (error) {
        console.error("Error in weather API route:", error);
        return NextResponse.json(
            { error: `Internal Server Error: ${(error as Error).message}` },
            { status: 500 }
        );
    }
}