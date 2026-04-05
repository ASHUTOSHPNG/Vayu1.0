// PATH: Vayu1.0/app/api/aqi/cities/route.ts
// Fetches real-time AQI for 51 major Indian cities using WAQI + OpenAQ
// Usage: GET /api/aqi/cities
//        GET /api/aqi/cities?city=Ghaziabad

import { NextRequest, NextResponse } from "next/server";

const WAQI_TOKEN = process.env.WAQI_TOKEN!;
const OPENAQ_API_KEY = process.env.OPENAQ_API_KEY!;

const CITIES = [
  { name: "Ghaziabad",     state: "Uttar Pradesh",  waqi: "ghaziabad"      },
  { name: "Delhi",         state: "Delhi",           waqi: "delhi"          },
  { name: "Mumbai",        state: "Maharashtra",     waqi: "mumbai"         },
  { name: "Kolkata",       state: "West Bengal",     waqi: "kolkata"        },
  { name: "Chennai",       state: "Tamil Nadu",      waqi: "chennai"        },
  { name: "Bengaluru",     state: "Karnataka",       waqi: "bangalore"      },
  { name: "Hyderabad",     state: "Telangana",       waqi: "hyderabad"      },
  { name: "Ahmedabad",     state: "Gujarat",         waqi: "ahmedabad"      },
  { name: "Pune",          state: "Maharashtra",     waqi: "pune"           },
  { name: "Jaipur",        state: "Rajasthan",       waqi: "jaipur"         },
  { name: "Lucknow",       state: "Uttar Pradesh",   waqi: "lucknow"        },
  { name: "Kanpur",        state: "Uttar Pradesh",   waqi: "kanpur"         },
  { name: "Nagpur",        state: "Maharashtra",     waqi: "nagpur"         },
  { name: "Indore",        state: "Madhya Pradesh",  waqi: "indore"         },
  { name: "Thane",         state: "Maharashtra",     waqi: "thane"          },
  { name: "Bhopal",        state: "Madhya Pradesh",  waqi: "bhopal"         },
  { name: "Visakhapatnam", state: "Andhra Pradesh",  waqi: "visakhapatnam"  },
  { name: "Patna",         state: "Bihar",           waqi: "patna"          },
  { name: "Vadodara",      state: "Gujarat",         waqi: "vadodara"       },
  { name: "Ludhiana",      state: "Punjab",          waqi: "ludhiana"       },
  { name: "Agra",          state: "Uttar Pradesh",   waqi: "agra"           },
  { name: "Nashik",        state: "Maharashtra",     waqi: "nashik"         },
  { name: "Faridabad",     state: "Haryana",         waqi: "faridabad"      },
  { name: "Meerut",        state: "Uttar Pradesh",   waqi: "meerut"         },
  { name: "Rajkot",        state: "Gujarat",         waqi: "rajkot"         },
  { name: "Varanasi",      state: "Uttar Pradesh",   waqi: "varanasi"       },
  { name: "Srinagar",      state: "J&K",             waqi: "srinagar"       },
  { name: "Aurangabad",    state: "Maharashtra",     waqi: "aurangabad"     },
  { name: "Dhanbad",       state: "Jharkhand",       waqi: "dhanbad"        },
  { name: "Amritsar",      state: "Punjab",          waqi: "amritsar"       },
  { name: "Navi Mumbai",   state: "Maharashtra",     waqi: "navi-mumbai"    },
  { name: "Allahabad",     state: "Uttar Pradesh",   waqi: "allahabad"      },
  { name: "Ranchi",        state: "Jharkhand",       waqi: "ranchi"         },
  { name: "Howrah",        state: "West Bengal",     waqi: "howrah"         },
  { name: "Coimbatore",    state: "Tamil Nadu",      waqi: "coimbatore"     },
  { name: "Jabalpur",      state: "Madhya Pradesh",  waqi: "jabalpur"       },
  { name: "Gwalior",       state: "Madhya Pradesh",  waqi: "gwalior"        },
  { name: "Vijayawada",    state: "Andhra Pradesh",  waqi: "vijayawada"     },
  { name: "Jodhpur",       state: "Rajasthan",       waqi: "jodhpur"        },
  { name: "Madurai",       state: "Tamil Nadu",      waqi: "madurai"        },
  { name: "Raipur",        state: "Chhattisgarh",    waqi: "raipur"         },
  { name: "Kota",          state: "Rajasthan",       waqi: "kota"           },
  { name: "Chandigarh",    state: "Chandigarh",      waqi: "chandigarh"     },
  { name: "Guwahati",      state: "Assam",           waqi: "guwahati"       },
  { name: "Solapur",       state: "Maharashtra",     waqi: "solapur"        },
  { name: "Hubli",         state: "Karnataka",       waqi: "hubli"          },
  { name: "Bareilly",      state: "Uttar Pradesh",   waqi: "bareilly"       },
  { name: "Moradabad",     state: "Uttar Pradesh",   waqi: "moradabad"      },
  { name: "Mysuru",        state: "Karnataka",       waqi: "mysore"         },
  { name: "Pimpri",        state: "Maharashtra",     waqi: "pimpri"         },
  { name: "Noida",         state: "Uttar Pradesh",   waqi: "noida"          },
];

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

async function fetchWAQI(slug: string) {
  try {
    const res = await fetch(
      `https://api.waqi.info/feed/${slug}/?token=${WAQI_TOKEN}`,
      { next: { revalidate: 900 } }
    );
    const json = await res.json();
    if (json.status !== "ok") return null;
    const d = json.data;
    return {
      aqi:     typeof d.aqi === "number" ? d.aqi : null,
      pm25:    d.iaqi?.pm25?.v ?? null,
      pm10:    d.iaqi?.pm10?.v ?? null,
      no2:     d.iaqi?.no2?.v  ?? null,
      o3:      d.iaqi?.o3?.v   ?? null,
      co:      d.iaqi?.co?.v   ?? null,
      so2:     d.iaqi?.so2?.v  ?? null,
      station: d.city?.name    ?? null,
      time:    d.time?.s       ?? null,
      geo:     d.city?.geo     ?? null,
    };
  } catch {
    return null;
  }
}

async function fetchOpenAQWards(cityName: string) {
  try {
    const res = await fetch(
      `https://api.openaq.org/v3/locations?city=${encodeURIComponent(cityName)}&country_id=IN&limit=20&order_by=lastUpdated&sort=desc`,
      {
        headers: { "X-API-Key": OPENAQ_API_KEY },
        next: { revalidate: 900 },
      }
    );
    const json = await res.json();
    if (!json.results?.length) return [];

    return json.results.map((loc: any) => {
      const pm25sensor = loc.sensors?.find((s: any) =>
        s.parameter?.name?.toLowerCase() === "pm25"
      );
      const rawVal = pm25sensor?.latest?.value ?? null;
      const approxAqi = rawVal !== null ? pm25ToAqi(rawVal) : null;
      return {
        ward:        loc.name ?? "Unknown",
        locality:    loc.locality ?? null,
        lat:         loc.coordinates?.latitude  ?? null,
        lon:         loc.coordinates?.longitude ?? null,
        pm25:        rawVal !== null ? Math.round(rawVal * 10) / 10 : null,
        aqi:         approxAqi,
        category:    approxAqi !== null ? getCategory(approxAqi) : null,
        lastUpdated: loc.datetimeLast?.local ?? null,
      };
    }).filter((w: any) => w.pm25 !== null);
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cityFilter = searchParams.get("city")?.toLowerCase();

  const targets = cityFilter
    ? CITIES.filter(c => c.name.toLowerCase().includes(cityFilter))
    : CITIES;

  const results = await Promise.all(
    targets.map(async (city) => {
      const [waqi, wards] = await Promise.all([
        fetchWAQI(city.waqi),
        fetchOpenAQWards(city.name),
      ]);

      const aqi = waqi?.aqi ?? (wards[0]?.aqi ?? null);
      const category = aqi !== null ? getCategory(aqi) : null;

      return {
        city:  city.name,
        state: city.state,
        aqi,
        category,
        pollutants: {
          pm25: waqi?.pm25 ?? null,
          pm10: waqi?.pm10 ?? null,
          no2:  waqi?.no2  ?? null,
          o3:   waqi?.o3   ?? null,
          co:   waqi?.co   ?? null,
          so2:  waqi?.so2  ?? null,
        },
        station:     waqi?.station ?? null,
        geo:         waqi?.geo     ?? null,
        lastUpdated: waqi?.time    ?? null,
        wards,
        source: {
          waqi:   waqi !== null,
          openaq: wards.length > 0,
        },
      };
    })
  );

  const withAqi = results.filter(r => r.aqi !== null);
  const avgAqi = withAqi.length
    ? Math.round(withAqi.reduce((s, r) => s + r.aqi!, 0) / withAqi.length)
    : null;

  return NextResponse.json({
    success: true,
    meta: {
      total:          results.length,
      avgAqi,
      hazardous:      results.filter(r => r.aqi !== null && r.aqi > 300).length,
      goodOrModerate: results.filter(r => r.aqi !== null && r.aqi <= 200).length,
      fetchedAt:      new Date().toISOString(),
    },
    data: results.sort((a, b) => (b.aqi ?? 0) - (a.aqi ?? 0)),
  });
}
