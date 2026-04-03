// PATH: Vayu1.0/app/api/aqi/ward/route.ts
// Fetches ward-level AQI breakdown for a specific city
// Usage: GET /api/aqi/ward?city=Ghaziabad
//        GET /api/aqi/ward?city=Delhi&limit=30

import { NextRequest, NextResponse } from "next/server";

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

  // 1. OpenAQ — ward-level stations
  const openaqRes = await fetch(
    `https://api.openaq.org/v3/locations?city=${encodeURIComponent(city)}&country_id=IN&limit=${limit}&order_by=lastUpdated&sort=desc`,
    {
      headers: { "X-API-Key": OPENAQ_API_KEY },
      next: { revalidate: 600 },
    }
  );
  const openaqJson = await openaqRes.json();

  // 2. WAQI — city-level feed for overall AQI + pollutants
  const waqiRes = await fetch(
    `https://api.waqi.info/feed/${encodeURIComponent(city.toLowerCase())}/?token=${WAQI_TOKEN}`,
    { next: { revalidate: 600 } }
  );
  const waqiJson  = await waqiRes.json();
  const waqiData  = waqiJson.status === "ok" ? waqiJson.data : null;

  // 3. WAQI search — extra nearby stations for more ward coverage
  const waqiSearchRes = await fetch(
    `https://api.waqi.info/search/?token=${WAQI_TOKEN}&keyword=${encodeURIComponent(city)}`,
    { next: { revalidate: 600 } }
  );
  const waqiSearchJson = await waqiSearchRes.json();
  const waqiStations: any[] = waqiSearchJson.status === "ok"
    ? waqiSearchJson.data.slice(0, limit)
    : [];

  // Build wards from OpenAQ
  const openaqWards = (openaqJson.results ?? []).map((loc: any) => {
    const pm25sensor = loc.sensors?.find((s: any) =>
      s.parameter?.name?.toLowerCase() === "pm25"
    );
    const pm10sensor = loc.sensors?.find((s: any) =>
      s.parameter?.name?.toLowerCase() === "pm10"
    );
    const pm25  = pm25sensor?.latest?.value ?? null;
    const aqi   = pm25 !== null ? pm25ToAqi(pm25) : null;
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

  // Build wards from WAQI search
  const waqiWards = waqiStations
    .filter((s: any) => s.aqi && !isNaN(Number(s.aqi)))
    .map((s: any) => {
      const aqi = Number(s.aqi);
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

  // Merge + deduplicate by ward name
  const wardMap = new Map<string, any>();
  [...openaqWards, ...waqiWards].forEach(w => {
    const key = w.ward.toLowerCase().trim();
    if (!wardMap.has(key)) {
      wardMap.set(key, w);
    } else {
      // prefer the entry that has PM2.5 data
      const existing = wardMap.get(key);
      if (w.pm25 !== null && existing.pm25 === null) wardMap.set(key, w);
    }
  });

  const wards = Array.from(wardMap.values())
    .sort((a, b) => (b.aqi ?? 0) - (a.aqi ?? 0));

  const cityAqi      = waqiData?.aqi ?? (wards[0]?.aqi ?? null);
  const cityCategory = cityAqi !== null ? getCategory(cityAqi) : null;

  return NextResponse.json({
    success: true,
    city,
    overall: {
      aqi:      cityAqi,
      category: cityCategory,
      station:  waqiData?.city?.name ?? null,
      pollutants: {
        pm25: waqiData?.iaqi?.pm25?.v ?? null,
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
