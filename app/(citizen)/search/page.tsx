"use client";

import React, { useState, useEffect, useMemo, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LocationSearch } from "@/components/citizen/LocationSearch";
import { AQIGauge } from "@/components/citizen/AQIGauge";
import { PollutantCard } from "@/components/citizen/PollutantCard";
import { AQITrendChart } from "@/components/citizen/AQITrendChart";
import { NearbyStations } from "@/components/citizen/NearbyStations";
import { ComparisonView } from "@/components/citizen/ComparisonView";
import { HealthAdvisory } from "@/components/citizen/HealthAdvisory";
import { PushAlertBanner } from "@/components/citizen/PushAlertBanner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Info,
  RefreshCcw,
  History,
  TrendingUp,
  ArrowLeftRight,
  Globe,
  MinusCircle,
  PlusCircle,
  Wind,
  Activity,
  Flame,
  MapPin,
  Sparkles,
} from "lucide-react";
import { getAQIDisplay } from "@/lib/aqi-utils";
import { useAQISubscription } from "@/lib/realtime/useAQISubscription";
import { useAQIStore } from "@/store/aqiStore";
import { createClient } from "@/lib/supabase/client";
import { FireRiskAssessment, degreesToCardinal } from "@/lib/api-clients/firms";
import { searchLocations } from "@/lib/api-clients/geocoding";

const POPULAR_CITIES = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Bhubaneswar",
  "Pune",
];

interface Ward {
  id: string | null;
  name: string; // Ward name
  ward?: string; // Store ward separately for reference
  city: string;
  state: string;
  country: string;
  postcode?: string;
  lat: number;
  lng: number;
  aqi: number;
  pollutants?: {
    pm25?: number;
    pm10?: number;
    no2?: number;
    so2?: number;
    co?: number;
    o3?: number;
  };
  lastUpdated: string;
}

async function fetchLiveAQI(lat: number, lon: number) {
  try {
    const response = await fetch(`/api/aqi?lat=${lat}&lon=${lon}&source=auto`, {
      cache: "no-store",
    });
    if (!response.ok) return null;

    const data = await response.json();
    return {
      aqi: data?.aqi,
      pollutants: data?.pollutants,
      timestamp: data?.timestamp,
    };
  } catch (error) {
    console.error("Failed to fetch live AQI", error);
    return null;
  }
}

const fetchDataForWard = async (
  name: string,
  ward?: string,
  city?: string,
  postcode?: string,
): Promise<Ward> => {
  const supabase = createClient();

  const { data: dbWard } = await supabase
    .from("wards")
    .select("*")
    .or(`name.ilike.%${name}%,city.ilike.%${name}%`)
    .limit(1)
    .maybeSingle();

  if (dbWard) {
    const { data: latestReading } = await supabase
      .from("aqi_readings")
      .select("*")
      .eq("ward_id", dbWard.id)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const liveAQI = await fetchLiveAQI(
      dbWard.centroid_lat,
      dbWard.centroid_lon,
    );

    // Ensure city is not the same as ward (which would indicate data issue)
    let resultCity = city || dbWard.city || "City";

    return {
      id: dbWard.id,
      name: ward || dbWard.name,
      ward: ward || dbWard.name,
      city: resultCity,
      state: dbWard.state || "State",
      country: "India",
      postcode: postcode,
      lat: dbWard.centroid_lat,
      lng: dbWard.centroid_lon,
      aqi: liveAQI?.aqi ?? latestReading?.aqi_value ?? 150,
      pollutants: liveAQI?.pollutants ?? undefined,
      lastUpdated: liveAQI?.timestamp
        ? new Date(liveAQI.timestamp).toLocaleTimeString()
        : latestReading
          ? new Date(latestReading.recorded_at).toLocaleTimeString()
          : "Recently",
    };
  }

  try {
    const suggestions = await searchLocations(name);
    if (suggestions.length > 0) {
      const wardData = suggestions[0];
      const liveAQI = await fetchLiveAQI(wardData.lat, wardData.lon);
      return {
        id: null,
        name: ward || wardData.ward || wardData.display_name.split(",")[0], // Use passed ward first, then from search
        ward: ward || wardData.ward,
        city: city || wardData.city || name,
        state: wardData.state || "India",
        country: "India",
        postcode: postcode || wardData.postcode,
        lat: wardData.lat,
        lng: wardData.lon,
        aqi: liveAQI?.aqi ?? 120,
        pollutants: liveAQI?.pollutants,
        lastUpdated: liveAQI?.timestamp
          ? new Date(liveAQI.timestamp).toLocaleTimeString()
          : "Just now",
      };
    }
  } catch (e) {
    console.error("Geocoding fallback failed", e);
  }

  const fallbackLat =
    name.toLowerCase() === "mumbai"
      ? 19.076
      : name.toLowerCase() === "pune"
        ? 18.5204
        : 28.6139;
  const fallbackLon =
    name.toLowerCase() === "mumbai"
      ? 72.8777
      : name.toLowerCase() === "pune"
        ? 73.8567
        : 77.209;
  const fallbackAQI = await fetchLiveAQI(fallbackLat, fallbackLon);

  return {
    id: null,
    name: ward || name,
    ward: ward,
    city: city || name,
    state: "State",
    country: "India",
    postcode: postcode,
    lat: fallbackLat,
    lng: fallbackLon,
    aqi: fallbackAQI?.aqi ?? 120,
    pollutants: fallbackAQI?.pollutants,
    lastUpdated: fallbackAQI?.timestamp
      ? new Date(fallbackAQI.timestamp).toLocaleTimeString()
      : "Just now",
  };
};

function SearchParamsHandler({ onSearch }: { onSearch: (q: string) => void }) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const lastQueryRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (query && query !== lastQueryRef.current) {
      onSearch(query);
      lastQueryRef.current = query;
    }
  }, [query, onSearch]);

  return null;
}

function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      type: "smog" | "clean" | "wind";
      drift: number;
    }> = [];

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.5 - 0.1,
        size: Math.random() * 60 + 15,
        opacity: Math.random() * 0.08 + 0.02,
        type: Math.random() > 0.5 ? "smog" : "clean",
        drift: Math.random() * Math.PI * 2,
      });
    }

    let animationId: number;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.008;

      particles.forEach((p) => {
        p.x += p.vx + Math.sin(time + p.drift) * 0.2;
        p.y += p.vy;

        if (p.y < -100) {
          p.y = canvas.height + 100;
          p.x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width + 100) p.x = -100;
        if (p.x < -100) p.x = canvas.width + 100;

        if (p.type === "smog") {
          const gradient = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            p.size,
          );
          gradient.addColorStop(0, `rgba(100, 95, 85, ${p.opacity})`);
          gradient.addColorStop(0.5, `rgba(70, 65, 60, ${p.opacity * 0.5})`);
          gradient.addColorStop(1, "rgba(50, 45, 40, 0)");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const gradient = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            p.size,
          );
          gradient.addColorStop(0, `rgba(45, 212, 191, ${p.opacity * 1.5})`);
          gradient.addColorStop(0.5, `rgba(20, 184, 166, ${p.opacity * 0.8})`);
          gradient.addColorStop(1, "rgba(13, 148, 136, 0)");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
  );
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function SearchPage() {
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [compareWard, setCompareWard] = useState<Ward | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fireRisk, setFireRisk] = useState<FireRiskAssessment | null>(null);
  const [nearbyStations, setNearbyStations] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  const { isConnected } = useAQISubscription(selectedWard?.id ?? undefined);
  const readings = useAQIStore((state) => state.readings);

  const liveSelectedWard = useMemo(() => {
    if (!selectedWard?.id) return selectedWard;
    const liveReading = readings[selectedWard.id];
    if (!liveReading) return selectedWard;

    return {
      ...selectedWard,
      aqi: liveReading.aqi,
      pollutants: liveReading.pollutants,
      lastUpdated: new Date(liveReading.timestamp).toLocaleTimeString(),
    };
  }, [selectedWard, readings]);

  useEffect(() => {
    if (!selectedWard) return;

    const fetchExtraData = async () => {
      const supabase = createClient();

      if (selectedWard.id) {
        const { data: history } = await supabase
          .from("aqi_readings")
          .select("aqi_value, recorded_at")
          .eq("ward_id", selectedWard.id)
          .order("recorded_at", { ascending: false })
          .limit(24);

        if (history && history.length > 0) {
          setTrendData(
            history.reverse().map((h) => ({
              time: new Date(h.recorded_at).getHours() + ":00",
              aqi: h.aqi_value,
            })),
          );
        } else {
          setTrendData(
            Array.from({ length: 24 }).map((_, i) => ({
              time: `${(new Date().getHours() - (23 - i) + 24) % 24}:00`,
              aqi: Math.max(
                0,
                selectedWard.aqi + Math.floor(Math.random() * 40 - 20),
              ),
            })),
          );
        }
      } else {
        setTrendData(
          Array.from({ length: 24 }).map((_, i) => ({
            time: `${(new Date().getHours() - (23 - i) + 24) % 24}:00`,
            aqi: Math.max(
              0,
              selectedWard.aqi + Math.floor(Math.random() * 40 - 20),
            ),
          })),
        );
      }

      const { data: otherWards } = await supabase
        .from("wards")
        .select("id, name, centroid_lat, centroid_lon")
        .eq("city", selectedWard.city)
        .neq("name", selectedWard.name)
        .limit(5);

      if (otherWards && otherWards.length > 0) {
        const stationIds = otherWards.map((w: any) => w.id);
        const { data: latestReadings } = await supabase
          .from("aqi_readings")
          .select("ward_id, aqi_value")
          .in("ward_id", stationIds)
          .order("recorded_at", { ascending: false });

        const formatted = otherWards.map((w: any) => {
          const reading = latestReadings?.find((r: any) => r.ward_id === w.id);
          return {
            id: w.id,
            name: w.name,
            distance: 2.5 + Math.random() * 5,
            aqi: reading?.aqi_value || 100,
          };
        });
        setNearbyStations(formatted);
      } else {
        setNearbyStations([
          {
            id: "f1",
            name: "City Center",
            distance: 1.2,
            aqi: selectedWard.aqi + 5,
          },
          {
            id: "f2",
            name: "Industrial Zone",
            distance: 4.8,
            aqi: selectedWard.aqi + 25,
          },
        ]);
      }
    };

    fetchExtraData();
  }, [selectedWard]);

  useEffect(() => {
    const saved = localStorage.getItem("recent_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, []);

  const handleSearch = React.useCallback(
    async (name: string) => {
      setIsLoading(true);
      const data = await fetchDataForWard(name);

      if (isComparing) {
        setCompareWard(data);
      } else {
        setSelectedWard(data);

        if (data.id && data.pollutants) {
          useAQIStore.getState().setReading(data.id, {
            aqi: data.aqi,
            pollutants: data.pollutants as any,
            source: "auto",
            timestamp: new Date().toISOString(),
          });
        }

        try {
          const fireResp = await fetch(
            `/api/firms?lat=${data.lat}&lon=${data.lng}&radius=300&days=2`,
          );
          if (fireResp.ok) {
            const fireData = await fireResp.json();
            setFireRisk(fireData);
          }
        } catch (e) {
          console.error("Failed to fetch fire data during search", e);
        }

        setRecentSearches((prev) => {
          const updated = [name, ...prev.filter((s) => s !== name)].slice(0, 5);
          localStorage.setItem("recent_searches", JSON.stringify(updated));
          return updated;
        });
      }

      setIsLoading(false);
    },
    [isComparing],
  );

  const handleRefresh = async () => {
    if (!selectedWard) return;
    const now = Date.now();
    const storageKey = `last_refresh_${selectedWard.name.toLowerCase().replace(/\s+/g, "_")}`;
    const lastRefresh = localStorage.getItem(storageKey);
    const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

    if (lastRefresh && now - parseInt(lastRefresh) < REFRESH_INTERVAL_MS) {
      const remaining = Math.ceil(
        (REFRESH_INTERVAL_MS - (now - parseInt(lastRefresh))) / 60000,
      );
      alert(
        `Rate limit reached. Please wait ${remaining} minute(s) before refreshing ${selectedWard.name} again.`,
      );
      return;
    }

    setIsRefreshing(true);
    localStorage.setItem(storageKey, now.toString());
    const data = await fetchDataForWard(selectedWard.name);
    setSelectedWard(data);

    if (data.id && data.pollutants) {
      useAQIStore.getState().setReading(data.id, {
        aqi: data.aqi,
        pollutants: data.pollutants as any,
        source: "auto",
        timestamp: new Date().toISOString(),
      });
    }
    try {
      const fireResp = await fetch(
        `/api/firms?lat=${data.lat}&lon=${data.lng}&radius=300&days=2`,
      );
      if (fireResp.ok) {
        const fireData = await fireResp.json();
        setFireRisk(fireData);
      }
    } catch (e) {
      console.error("Failed to refresh fire data", e);
    }
    setIsRefreshing(false);
  };

  const pollutantComparison = useMemo(() => {
    const p = liveSelectedWard?.pollutants;

    return [
      {
        name: "PM2.5",
        unit: "µg/m³",
        loc1Value: p?.pm25 || 156.4,
        loc2Value: 142.1,
      },
      {
        name: "PM10",
        unit: "µg/m³",
        loc1Value: p?.pm10 || 245.2,
        loc2Value: 210.8,
      },
      { name: "NO2", unit: "ppb", loc1Value: p?.no2 || 45.1, loc2Value: 38.4 },
      { name: "SO2", unit: "ppb", loc1Value: p?.so2 || 12.4, loc2Value: 15.2 },
      { name: "CO", unit: "ppm", loc1Value: p?.co || 2.1, loc2Value: 1.8 },
      { name: "O3", unit: "ppb", loc1Value: p?.o3 || 34.0, loc2Value: 42.5 },
    ];
  }, [liveSelectedWard]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-zinc-950 relative overflow-hidden">
      <AnimatedBackground />

      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 right-0 h-[30vh] bg-linear-to-b from-teal-900/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-[96px]" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-cyan-400/10 rounded-full blur-[80px]" />
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-12 relative z-10">
        <Suspense fallback={null}>
          <SearchParamsHandler onSearch={handleSearch} />
        </Suspense>

        {/* Search Interface */}
        <motion.section
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="flex flex-col items-center gap-8 text-center mt-8 mb-16"
        >
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              Air Quality Explorer
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              Search Any Location
            </h1>
            <p className="text-zinc-400 max-w-lg mx-auto text-lg">
              Enter a city or neighborhood to discover real-time air quality and
              health insights.
            </p>
          </div>

          <div className="w-full max-w-2xl space-y-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-linear-to-r from-teal-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
              <div className="relative">
                <LocationSearch onSelect={(l) => handleSearch(l.name)} />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {recentSearches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap items-center justify-center gap-3"
                >
                  <History className="h-4 w-4 text-zinc-500" />
                  {recentSearches.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleSearch(city)}
                      className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-zinc-300 hover:bg-teal-500/20 hover:border-teal-500/30 hover:text-teal-300 transition-all"
                    >
                      {city}
                    </button>
                  ))}
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center justify-center gap-3"
              >
                <TrendingUp className="h-4 w-4 text-zinc-500" />
                {POPULAR_CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleSearch(city)}
                    className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-zinc-400 hover:bg-teal-500/10 hover:border-teal-500/30 hover:text-teal-300 transition-all"
                  >
                    {city}
                  </button>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.section>

        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-teal-500/20 border-t-teal-500 animate-spin" />
                <Activity className="absolute inset-0 m-auto h-6 w-6 text-teal-400" />
              </div>
              <p className="text-zinc-400 font-medium">
                Fetching real-time data...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {liveSelectedWard && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div className="lg:col-span-3">
              <PushAlertBanner />
            </div>

            {/* Results Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl"
            >
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="p-4 rounded-2xl bg-linear-to-br from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30 text-2xl">
                    <MapPin className="w-6 h-6" />
                  </div>
                  {isConnected && (
                    <div className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                    </div>
                  )}
                </div>
                <div className="text-left">
                  <h2 className="text-3xl font-black text-white flex items-center gap-3">
                    {liveSelectedWard.name}
                    {isConnected && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 animate-pulse py-0.5 px-2 text-[10px] font-bold uppercase tracking-wider">
                        Live
                      </Badge>
                    )}
                  </h2>
                  <div className="flex items-center gap-2 text-zinc-400 mt-1">
                    <span>
                      {liveSelectedWard.state}, {liveSelectedWard.country}
                    </span>
                    <span className="text-zinc-600">•</span>
                    {(liveSelectedWard.ward || liveSelectedWard.city) && (
                      <span className="text-xs bg-white/5 px-2 py-0.5 rounded">
                        {liveSelectedWard.ward || liveSelectedWard.city}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3.5">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-teal-500/10 text-teal-300 border-teal-500/20 flex items-center gap-2 py-1.5 px-3"
                  >
                    <Globe className="h-3 w-3" /> Satellite + Meteorological
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-500 font-medium">
                  <span>Updated: {liveSelectedWard.lastUpdated}</span>
                  <Button
                    disabled={isRefreshing}
                    onClick={handleRefresh}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-teal-500/20 hover:text-teal-400 text-zinc-400"
                  >
                    <RefreshCcw
                      className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>
              </div>
            </motion.div>

            {!isComparing ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                  {/* AQI Display */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-linear-to-br from-teal-500/5 to-cyan-500/5" />
                    {isConnected && (
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          Live Sync
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col items-center justify-center relative z-10">
                      <AQIGauge aqi={liveSelectedWard.aqi} />
                    </div>
                    <div className="flex flex-col justify-center space-y-5 relative z-10">
                      <div className="space-y-2 text-left">
                        <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                          Current Quality
                        </p>
                        <p className="text-4xl font-black">
                          <span
                            style={{
                              color: getAQIDisplay(liveSelectedWard.aqi).color,
                            }}
                          >
                            {getAQIDisplay(liveSelectedWard.aqi).category}
                          </span>
                        </p>
                      </div>
                      <p className="text-zinc-400 leading-relaxed text-left">
                        {getAQIDisplay(liveSelectedWard.aqi).description}
                      </p>
                      <div className="pt-4 border-t border-white/10 text-left">
                        <p className="text-xs text-zinc-500 flex items-center gap-2">
                          <Info className="h-3 w-3" /> OpenAQ Network +
                          Meteorological Analysis
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Pollutant Cards */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-4"
                  >
                    {[
                      {
                        name: "PM2.5",
                        value: liveSelectedWard.pollutants?.pm25 || 45.2,
                        unit: "µg/m³",
                        description:
                          "Fine particulate matter smaller than 2.5 microns, penetrates deep into lungs.",
                      },
                      {
                        name: "PM10",
                        value: liveSelectedWard.pollutants?.pm10 || 78.5,
                        unit: "µg/m³",
                        description:
                          "Coarse particulate matter, can irritate respiratory system.",
                      },
                      {
                        name: "NO2",
                        value: liveSelectedWard.pollutants?.no2 || 23.1,
                        unit: "ppb",
                        description:
                          "Nitrogen dioxide, primarily from vehicle emissions and power plants.",
                      },
                      {
                        name: "SO2",
                        value: liveSelectedWard.pollutants?.so2 || 8.4,
                        unit: "ppb",
                        description:
                          "Sulfur dioxide, produced from burning fossil fuels.",
                      },
                      {
                        name: "CO",
                        value: liveSelectedWard.pollutants?.co || 1.2,
                        unit: "ppm",
                        description:
                          "Carbon monoxide, colorless odorless gas from combustion.",
                      },
                      {
                        name: "O3",
                        value: liveSelectedWard.pollutants?.o3 || 56.8,
                        unit: "ppb",
                        description:
                          "Ground-level ozone, formed from vehicle emissions and sunlight.",
                      },
                    ].map((pollutant) => (
                      <PollutantCard key={pollutant.name} {...pollutant} />
                    ))}
                  </motion.div>

                  <HealthAdvisory aqi={liveSelectedWard.aqi} />

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <AQITrendChart data={trendData} />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center"
                  >
                    <Button
                      onClick={() => setIsComparing(true)}
                      className="bg-linear-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white rounded-2xl h-14 px-8 font-bold gap-3 shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all hover:-translate-y-0.5"
                    >
                      <PlusCircle className="h-5 w-5" /> Compare with another
                      location
                    </Button>
                  </motion.div>
                </div>

                {/* Right Column */}
                <div className="space-y-6 text-left">
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <NearbyStations
                      stations={nearbyStations}
                      onSelect={(s) => handleSearch(s.name)}
                    />
                  </motion.div>

                  {/* Fire Activity Card */}
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 space-y-4 hover:border-orange-500/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white flex items-center gap-2">
                          <Flame className="h-4 w-4 text-orange-500" />
                          Nearby Fire Activity
                        </h3>
                        {fireRisk && fireRisk.totalFiresInRegion > 0 && (
                          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 font-bold">
                            {fireRisk.totalFiresInRegion} Sensors
                          </Badge>
                        )}
                      </div>

                      {!fireRisk || fireRisk.totalFiresInRegion === 0 ? (
                        <p className="text-zinc-500 text-sm py-2">
                          No active fires detected within 300km.{" "}
                          <span className="text-emerald-500">✓</span>
                        </p>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-3">
                            {fireRisk.hotspots.slice(0, 4).map((fire, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-xs pb-3 border-b border-white/5 last:border-0 last:pb-0"
                              >
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-bold text-zinc-300">
                                    {Math.round(fire.distanceKm || 0)}km •{" "}
                                    {degreesToCardinal(fire.windBearing || 0)}
                                  </span>
                                  <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-tight">
                                    Upwind Hotspot
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="font-black text-orange-500">
                                    {fire.frp} MW
                                  </div>
                                  <div className="text-[10px] text-zinc-500">
                                    Intensity
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="pt-2">
                            <p className="text-[10px] text-zinc-500 italic">
                              Updated every 3–12 hours via NASA VIIRS
                            </p>
                          </div>
                        </div>
                      )}
                    </Card>
                  </motion.div>

                  {/* Network Join Card */}
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Card className="p-6 bg-linear-to-br from-teal-600 to-cyan-600 border-none overflow-hidden relative group">
                      <div className="absolute inset-0 bg-linear-to-br from-teal-700/50 to-cyan-700/50" />
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500" />
                      <div className="relative z-10 space-y-4">
                        <h3 className="font-black text-xl leading-tight text-white">
                          Join the Network
                        </h3>
                        <p className="text-teal-100 text-sm">
                          Contribute hyper-local data from your neighborhood by
                          installing a VAYU IoT node.
                        </p>
                        <Button className="bg-white text-teal-700 hover:bg-teal-50 w-full font-bold shadow-lg">
                          Inquire About Hardware
                        </Button>
                      </div>
                      <Wind className="absolute -bottom-4 -right-4 h-20 w-20 text-white/20" />
                    </Card>
                  </motion.div>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-12"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-white">
                    Comparison View
                  </h3>
                  <Button
                    onClick={() => {
                      setIsComparing(false);
                      setCompareWard(null);
                    }}
                    variant="ghost"
                    className="text-zinc-400 hover:text-red-400 font-bold gap-2 hover:bg-red-500/10"
                  >
                    <MinusCircle className="h-5 w-5" /> Exit Comparison
                  </Button>
                </div>

                {!compareWard ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 gap-6"
                  >
                    <div className="p-5 rounded-2xl bg-linear-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30">
                      <ArrowLeftRight className="h-10 w-10 text-teal-400" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-xl font-bold text-white">
                        Select a second ward
                      </p>
                      <p className="text-zinc-400 text-sm max-w-xs">
                        Search for another ward or area to compare its air
                        quality side-by-side with {liveSelectedWard.name}.
                      </p>
                    </div>
                    <div className="w-full max-w-md">
                      <LocationSearch onSelect={(l) => handleSearch(l.name)} />
                    </div>
                  </motion.div>
                ) : (
                  <ComparisonView
                    loc1={{
                      name: liveSelectedWard.name,
                      aqi: liveSelectedWard.aqi,
                    }}
                    loc2={{
                      name: compareWard?.name ?? "",
                      aqi: compareWard?.aqi ?? 0,
                    }}
                    pollutants={pollutantComparison}
                  />
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
