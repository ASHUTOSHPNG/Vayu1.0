"use client";

import dynamic from 'next/dynamic';
import { StatCards } from '@/components/dashboard/StatCards';
import { useAdminContext } from '@/lib/admin/useAdminContext';
import { useAdminStore } from '@/store/adminStore';
import { Badge } from '@/components/ui/badge';

const CityHeatMap = dynamic(
    () => import('@/components/maps/CityHeatMap').then((mod) => mod.CityHeatMap),
    {
        ssr: false,
        loading: () => <div className="lg:col-span-8 h-[600px] bg-[#132238] animate-pulse rounded-xl" />
    }
);

const NationalAQIMap = dynamic(
    () => import('@/components/maps/NationalAQIMap').then((mod) => mod.NationalAQIMap),
    {
        ssr: false,
        loading: () => <div className="lg:col-span-8 h-[600px] bg-[#132238] animate-pulse rounded-xl" />
    }
);

import { PollutedWards } from '@/components/dashboard/PollutedWards';
import { LatestPolicy } from '@/components/dashboard/LatestPolicy';
import { SourcesChart } from '@/components/dashboard/SourcesChart';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { NationalRankingsTable } from '@/components/dashboard/NationalRankingsTable';

export default function AdminDashboardOverview() {
    const { fullName, isCentralAdmin, isCityAdmin, cityName } = useAdminContext();
    const { selectedCityId } = useAdminStore();

    const isAllCities = isCentralAdmin && !selectedCityId;

    return (
        <div className="w-full h-full flex flex-col space-y-6">

            {/* Context Banners */}
            {isCityAdmin && (
                <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4">
                    <h2 className="text-white font-bold text-lg">🏛️ {fullName} — {cityName} Municipal Corporation Dashboard</h2>
                    <p className="text-gray-400 text-sm">Showing ward-level data for {cityName}</p>
                </div>
            )}

            {isCentralAdmin && !selectedCityId && (
                <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-4">
                    <h2 className="text-white font-bold text-lg">⚡ Central Administration Dashboard — All Cities</h2>
                    <p className="text-gray-400 text-sm">Monitoring national data across India</p>
                </div>
            )}

            {isCentralAdmin && selectedCityId && (
                <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-white font-bold text-lg">🏛️ {fullName} — {selectedCityId} Dashboard</h2>
                        <p className="text-gray-400 text-sm">Ward-level monitoring for {selectedCityId}</p>
                    </div>
                    <Badge className="bg-teal-500/20 text-teal-400 border-none px-3 py-1">Viewing as Super Admin</Badge>
                </div>
            )}

            {/* 1. Header Metrics Row */}
            <StatCards />

            {/* 2. Middle Dense Grid - Split 60% Map / 40% Side Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">

                {/* Map Panel (takes 7 columns on large screens ~60%) */}
                <div className="lg:col-span-8 h-full">
                    {isAllCities ? <NationalAQIMap /> : <CityHeatMap />}
                </div>

                {/* Side Panels (takes 5 columns ~40%) */}
                <div className="lg:col-span-4 flex flex-col space-y-6 h-full min-h-0">
                    {/* Top: GenAI Policy Card (Prio 1) */}
                    <div className="flex-[0.4] min-h-0">
                        <LatestPolicy />
                    </div>

                    {/* Mid: Wards List (Prio 2) - Increased height to show all 5 cities */}
                    <div className="flex-[0.6] min-h-0">
                        <PollutedWards />
                    </div>
                </div>

            </div>

            {/* 3. Bottom Row: Sources (Left) and Trend (Right) */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[368px]">
                {/* Sources Chart (Left side of Trend) */}
                <div className="lg:col-span-4 overflow-hidden">
                    <SourcesChart />
                </div>

                {/* Trend Chart (Right side) */}
                <div className="lg:col-span-8">
                    <TrendChart />
                </div>
            </div>

            {/* 4. India City Performance Rankings (Full Width) */}
            {isAllCities && (
                <div className="w-full mt-6">
                    <NationalRankingsTable />
                </div>
            )}

        </div>
    );
}
