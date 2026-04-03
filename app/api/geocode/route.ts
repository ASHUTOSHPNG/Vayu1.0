import { NextRequest, NextResponse } from "next/server";
import { searchLocations } from "@/lib/api-clients/geocoding";
import { isRateLimited } from "@/lib/api/rateLimit";

// Direct Nominatim call with proper headers to avoid 429
async function reverseGeocodeWithFallback(lat: number, lon: number) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=16`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Vayu1.0/1.0 (your@email.com)", // ← Required by Nominatim ToS
      "Accept-Language": "en",
    },
    next: { revalidate: 300 }, // Cache for 5 minutes to reduce hits
  });

  if (!res.ok) {
    throw new Error(`Nominatim returned ${res.status}`);
  }

  const data = await res.json();
  const addr = data.address || {};

  // Extract the most meaningful name for display
  const ward =
    addr.neighbourhood ||
    addr.suburb ||
    addr.quarter ||
    addr.village ||
    addr.town ||
    addr.city_district ||
    addr.county ||
    null;

  const city =
    addr.city || addr.town || addr.municipality || addr.state_district || null;

  const displayName =
    ward && city
      ? `${ward}, ${city}`
      : ward || city || data.display_name || "Current Location";

  return {
    display_name: displayName,
    ward,
    suburb: addr.suburb || null,
    city,
    state: addr.state || null,
    country: addr.country || "India",
    postcode: addr.postcode || null,
    lat,
    lon,
  };
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
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

      try {
        const locationInfo = await reverseGeocodeWithFallback(lat, lon);
        return NextResponse.json(locationInfo);
      } catch (err: any) {
        console.warn("Nominatim failed, returning coordinate fallback:", err.message);
        // Graceful fallback — never show raw coords to user
        return NextResponse.json({
          display_name: "Current Location",
          city: "Current Location",
          state: null,
          country: "India",
          ward: "Current Location",
          suburb: null,
          postcode: null,
          lat,
          lon,
        });
      }
    }

    // Neither q nor lat/lon provided
    return NextResponse.json(
      { error: "Provide either 'q' for search OR 'lat' and 'lon' for reverse geocoding." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Geocoding API Error:", error);
    return NextResponse.json(
      { error: "Failed to resolve location.", details: error.message },
      { status: 500 }
    );
  }
}