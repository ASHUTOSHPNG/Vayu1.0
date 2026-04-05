import { NextRequest, NextResponse } from "next/server";
import { fetchFireHotspots, fetchFiresNearPoint, assessFireRisk, FIRMSInvalidApiKeyError } from "@/lib/api-clients/firms";
import { isRateLimited } from "@/lib/api/rateLimit";

export async function GET(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // Rate limiting: max 30 requests per 5 minutes per IP
    if (isRateLimited(ip, 30, 5 * 60 * 1000)) {
        return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    const firmsKey = process.env.NASA_FIRMS_API_KEY;
    if (!firmsKey || /your_|changeme|paste/i.test(firmsKey)) {
        return NextResponse.json(
            { error: 'FIRMS API not configured', hotspots: [], riskAssessment: null },
            { status: 200 } // Return 200 with empty data, not 500, so UI degrades gracefully
        );
    }

    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') ?? '');
    const lon = parseFloat(searchParams.get('lon') ?? '');
    const radius = parseFloat(searchParams.get('radius') ?? '300');
    const days = Math.min(parseInt(searchParams.get('days') ?? '2'), 7);
    const bboxParam = searchParams.get('bbox');

    // MODE 2: bbox query (used for map rendering)
    if (bboxParam) {
        const coords = bboxParam.split(',').map(Number);
        if (coords.length !== 4 || coords.some(isNaN)) {
            return NextResponse.json({ error: 'Invalid bbox format. Expected minLon,minLat,maxLon,maxLat' }, { status: 400 });
        }
        const [minLon, minLat, maxLon, maxLat] = coords;
        try {
            const result = await fetchFireHotspots({ minLat, minLon, maxLat, maxLon }, days);
            return NextResponse.json(result);
        } catch (error) {
            return NextResponse.json({ error: (error as Error).message }, { status: 500 });
        }
    }

    // MODE 1: point + radius query
    if (isNaN(lat) || isNaN(lon)) {
        return NextResponse.json({ error: 'lat and lon are required unless bbox is provided' }, { status: 400 });
    }

    try {
        // We need wind data to compute upwind assessment
        // Fetch weather from the existing weather API route
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const weatherRes = await fetch(
            `${appUrl}/api/weather?lat=${lat}&lon=${lon}&type=current`
        );
        const weather = weatherRes.ok ? await weatherRes.json() : null;

        const windDirection = weather?.wind_direction ?? 0;
        const windSpeed = weather?.wind_speed ?? 10;

        const [hotspotsResult, riskAssessment] = await Promise.all([
            fetchFiresNearPoint(lat, lon, radius, days),
            assessFireRisk(lat, lon, windDirection, windSpeed, days)
        ]);

        return NextResponse.json({
            hotspots: hotspotsResult.hotspots,
            totalCount: hotspotsResult.totalCount,
            highConfidenceCount: hotspotsResult.highConfidenceCount,
            queriedAt: hotspotsResult.queriedAt,
            riskAssessment,
            windContext: { direction: windDirection, speedKmh: windSpeed }
        });
    } catch (error) {
        if (error instanceof FIRMSInvalidApiKeyError) {
            return NextResponse.json(
                { error: error.message, hotspots: [], riskAssessment: null },
                { status: 200 }
            );
        }
        console.error("FIRMS Route Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
