import { NextRequest, NextResponse } from "next/server";
import { searchLocations, reverseGeocode } from "@/lib/api-clients/geocoding";
import { isRateLimited } from "@/lib/api/rateLimit";

export async function GET(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
        return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q");
    const latStr = searchParams.get("lat");
    const lonStr = searchParams.get("lon");

    try {
        // Forward Geocoding (Search)
        if (query) {
            const results = await searchLocations(query);
            return NextResponse.json(results);
        }

        // Reverse Geocoding
        if (latStr && lonStr) {
            const lat = parseFloat(latStr);
            const lon = parseFloat(lonStr);

            if (isNaN(lat) || isNaN(lon)) {
                return NextResponse.json(
                    { error: "Invalid latitude or longitude" },
                    { status: 400 }
                );
            }

            const locationInfo = await reverseGeocode(lat, lon);
            return NextResponse.json(locationInfo);
        }

        return NextResponse.json(
            { error: "Provide either 'q' for search OR 'lat' and 'lon' for reverse geocoding." },
            { status: 400 }
        );
    } catch (error: Error | any) {
        console.error("Geocoding API Error:", error);
        return NextResponse.json(
            { error: "Failed to resolve location.", details: error.message },
            { status: 500 }
        );
    }
}
