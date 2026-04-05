// PATH: Vayu1.0/app/api/aqi/ward/route.ts
import { NextRequest, NextResponse } from "next/server";
import { geocodeCity } from "@/lib/api-clients/geocoding";

const OPENAQ_API_KEY = process.env.OPENAQ_API_KEY!;
const WAQI_TOKEN = process.env.WAQI_TOKEN!;

function pm25ToAqi(pm: number): number {
  const bp: [number, number, number, number][] = [
    [0, 30, 0, 50], [30, 60, 51, 100], [60, 90, 101, 200],
    [90, 120, 201, 300], [120, 250, 301, 400], [250, 500, 401, 500],
  ];
  for (const [cL, cH, iL, iH] of bp) {
    if (pm >= cL && pm <= cH)
      return Math.round(((iH - iL) / (cH - cL)) * (pm - cL) + iL);
  }
  return 500;
}

function getCategory(aqi: number) {
  if (aqi <= 50)  return { label: "Good",        color: "#55a84f" };
  if (aqi <= 100) return { label: "Satisfactory", color: "#a3c853" };
  if (aqi <= 200) return { label: "Moderate",     color: "#f5c518" };
  if (aqi <= 300) return { label: "Poor",         color: "#f29c33" };
  if (aqi <= 400) return { label: "Very Poor",    color: "#e93f33" };
  return           { label: "Severe",             color: "#7e0023" };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city  = searchParams.get("city");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "25"), 50);

  if (!city) {
    return NextResponse.json(
      { success: false, error: "city query param is required" },
      { status: 400 }
    );
  }

  // 1. Geocode city to coordinates for radius-based OpenAQ search
  const cityCoords = await geocodeCity(city);

  // 2. OpenAQ — radius search if coords available, fallback to city name
  const openaqUrl = cityCoords
    ? `https://api.openaq.org/v3/locations?coordinates=${cityCoords.lat},${cityCoords.lon}&radius=30000&country_id=IN&limit=${limit}&order_by=lastUpdated&sort=desc`
    : `https://api.openaq.org/v3/locations?city=${encodeURIComponent(city)}&country_id=IN&limit=${limit}&order_by=lastUpdated&sort=desc`;

  const openaqRes = await fetch(openaqUrl, {
    headers: { "X-API-Key": OPENAQ_API_KEY },
    next: { revalidate: 600 },
  });
  const openaqJson = await openaqRes.json();

  // 3. WAQI — city-level feed for overall AQI + pollutants
  const waqiRes = await fetch(
    `https://api.waqi.info/feed/${encodeURIComponent(city.toLowerCase())}/?token=${WAQI_TOKEN}`,
    { next: { revalidate: 600 } }
  );
  const waqiJson = await waqiRes.json();
  const waqiData = waqiJson.status === "ok" ? waqiJson.data : null;

  // 4. Compute correct CPCB city AQI from PM2.5 concentration
  const cityPm25 = waqiData?.iaqi?.pm25?.v ?? null;
  const cityAqi  = cityPm25 !== null ? pm25ToAqi(cityPm25) : null;
  const cityCategory = cityAqi !== null ? getCategory(cityAqi) : null;

  // 5. Calibration ratio: CPCB city AQI / WAQI city AQI
  // This corrects ward-level WAQI AQIs from US EPA scale to CPCB scale
  const waqiCityAqi = waqiData?.aqi ?? null;
  const scaleFactor = (cityAqi && waqiCityAqi)
    ? cityAqi / waqiCityAqi
    : 0.72; // fallback: typical CPCB/EPA ratio for India

  // 6. Build wards from OpenAQ (accurate — raw PM2.5 → CPCB AQI)
  const openaqWards = (openaqJson.results ?? []).map((loc: any) => {
    const pm25sensor = loc.sensors?.find((s: any) =>
      s.parameter?.name?.toLowerCase() === "pm25"
    );
    const pm10sensor = loc.sensors?.find((s: any) =>
      s.parameter?.name?.toLowerCase() === "pm10"
    );
    const pm25 = pm25sensor?.latest?.value ?? null;
    const aqi  = pm25 !== null ? pm25ToAqi(pm25) : null;
    return {
      source:      "openaq" as const,
      ward:        loc.name,
      locality:    loc.locality ?? null,
      lat:         loc.coordinates?.latitude  ?? null,
      lon:         loc.coordinates?.longitude ?? null,
      pm25:        pm25 !== null ? Math.round(pm25 * 10) / 10 : null,
      pm10:        pm10sensor?.latest?.value
                     ? Math.round(pm10sensor.latest.value * 10) / 10
                     : null,
      aqi,
      category:    aqi !== null ? getCategory(aqi) : null,
      lastUpdated: loc.datetimeLast?.local ?? null,
    };
  }).filter((w: any) => w.pm25 !== null);

  // 7. WAQI nearby stations — scale EPA AQI to CPCB using calibration ratio
  const waqiSearchRes = await fetch(
    `https://api.waqi.info/search/?token=${WAQI_TOKEN}&keyword=${encodeURIComponent(city)}`,
    { next: { revalidate: 600 } }
  );
  const waqiSearchJson = await waqiSearchRes.json();
  const waqiStations: any[] = waqiSearchJson.status === "ok"
    ? waqiSearchJson.data.slice(0, 5)
    : [];

  const waqiWards = waqiStations
    .filter((s: any) => s.station?.name && !isNaN(Number(s.aqi)))
    .map((s: any) => {
      const rawWaqiAqi = Number(s.aqi);
      // Apply calibration: convert US EPA AQI → CPCB AQI
      const aqi = Math.round(Math.min(500, rawWaqiAqi * scaleFactor));
      return {
        source:      "waqi" as const,
        ward:        s.station?.name ?? "Unknown",
        locality:    null,
        lat:         s.station?.geo?.[0] ?? null,
        lon:         s.station?.geo?.[1] ?? null,
        pm25:        null,
        pm10:        null,
        aqi,
        category:    getCategory(aqi),
        lastUpdated: s.time?.stime ?? null,
      };
    });

  // 8. Merge + deduplicate by ward name (OpenAQ preferred over WAQI)
  const wardMap = new Map<string, any>();
  [...openaqWards, ...waqiWards].forEach(w => {
    const key = w.ward.toLowerCase().trim();
    if (!wardMap.has(key)) {
      wardMap.set(key, w);
    } else {
      const existing = wardMap.get(key);
      if (w.pm25 !== null && existing.pm25 === null) wardMap.set(key, w);
    }
  });

  const wards = Array.from(wardMap.values())
    .sort((a, b) => (b.aqi ?? 0) - (a.aqi ?? 0));

  return NextResponse.json({
    success: true,
    city,
    overall: {
      aqi:      cityAqi,
      category: cityCategory,
      station:  waqiData?.city?.name ?? null,
      pollutants: {
        pm25: cityPm25,
        pm10: waqiData?.iaqi?.pm10?.v ?? null,
        no2:  waqiData?.iaqi?.no2?.v  ?? null,
        o3:   waqiData?.iaqi?.o3?.v   ?? null,
        co:   waqiData?.iaqi?.co?.v   ?? null,
        so2:  waqiData?.iaqi?.so2?.v  ?? null,
      },
      lastUpdated: waqiData?.time?.s ?? null,
    },
    wards,
    meta: {
      total:     wards.length,
      worstWard: wards[0]?.ward  ?? null,
      worstAqi:  wards[0]?.aqi   ?? null,
      fetchedAt: new Date().toISOString(),
    },
  });
}