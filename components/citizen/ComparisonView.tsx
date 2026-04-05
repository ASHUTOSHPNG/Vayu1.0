"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { AQIGauge } from "./AQIGauge";
import { getPollutantStatus } from "@/lib/aqi-utils";

interface PollutantRow {
  name: string;
  unit: string;
  loc1Value: number;
  loc2Value: number;
}

interface ComparisonViewProps {
  loc1: {
    name: string;
    aqi: number;
  };
  loc2: {
    name: string;
    aqi: number;
  };
  pollutants: PollutantRow[];
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  loc1,
  loc2,
  pollutants,
}) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col items-center">
          <p className="text-lg font-bold text-white mb-6">{loc1.name}</p>
          <AQIGauge aqi={loc1.aqi} />
        </Card>
        <Card className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col items-center">
          <p className="text-lg font-bold text-white mb-6">{loc2.name}</p>
          <AQIGauge aqi={loc2.aqi} />
        </Card>
      </div>

      <Card className="overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-zinc-400">
                Pollutant
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-white">
                {loc1.name}
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-white">
                {loc2.name}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {pollutants.map((pollutant) => {
              const isLoc1Worse = pollutant.loc1Value > pollutant.loc2Value;

              return (
                <tr
                  key={pollutant.name}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-white">
                      {pollutant.name}
                    </span>
                    <span className="ml-1 text-[10px] text-zinc-500 uppercase tracking-tighter">
                      ({pollutant.unit})
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 text-sm font-semibold ${isLoc1Worse ? "text-red-400" : "text-green-400"}`}
                  >
                    {pollutant.loc1Value}
                  </td>
                  <td
                    className={`px-6 py-4 text-sm font-semibold ${!isLoc1Worse ? "text-red-400" : "text-green-400"}`}
                  >
                    {pollutant.loc2Value}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
