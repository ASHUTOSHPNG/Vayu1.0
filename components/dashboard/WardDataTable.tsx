"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getAQICategory } from "@/lib/utils/aqi";
import { cn } from "@/lib/utils";

export interface WardMetric {
    id: string;
    name: string;
    aqiValue: number;
    pm25: number;
    pm10: number;
    no2: number;
    anomalyScore: number;
    topSource: string;
    lastUpdated: string;
}

interface WardDataTableProps {
    data: WardMetric[];
    selectedId?: string;
    onRowClick: (ward: WardMetric) => void;
}

export function WardDataTable({ data, selectedId, onRowClick }: WardDataTableProps) {
    return (
        <div className="rounded-md border border-[#1e2a3b] bg-[#132238] overflow-hidden">
            <Table>
                <TableHeader className="bg-[#0A1628]">
                    <TableRow className="border-[#1e2a3b] hover:bg-transparent">
                        <TableHead className="text-gray-400 font-bold">Ward Name</TableHead>
                        <TableHead className="text-gray-400 font-bold text-center">AQI</TableHead>
                        <TableHead className="text-gray-400 font-bold text-center">PM2.5</TableHead>
                        <TableHead className="text-gray-400 font-bold text-center">PM10</TableHead>
                        <TableHead className="text-gray-400 font-bold text-center">NO2</TableHead>
                        <TableHead className="text-gray-400 font-bold text-center">Anomaly</TableHead>
                        <TableHead className="text-gray-400 font-bold">Top Source</TableHead>
                        <TableHead className="text-gray-400 font-bold text-right">Updated</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((ward) => {
                        const category = getAQICategory(ward.aqiValue);
                        const isSelected = selectedId === ward.id;

                        return (
                            <TableRow
                                key={ward.id}
                                className={cn(
                                    "border-[#1e2a3b] cursor-pointer transition-colors",
                                    isSelected ? "bg-[#00D4FF]/20 hover:bg-[#00D4FF]/30" : "hover:bg-[#1e2a3b]/50"
                                )}
                                onClick={() => onRowClick(ward)}
                            >
                                <TableCell className="font-semibold text-white">{ward.name}</TableCell>
                                <TableCell className="text-center">
                                    <Badge className={cn("font-bold text-black", category.color.replace('bg-', 'bg-'))}>
                                        {ward.aqiValue}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center text-gray-300">{ward.pm25}</TableCell>
                                <TableCell className="text-center text-gray-300">{ward.pm10}</TableCell>
                                <TableCell className="text-center text-gray-300">{ward.no2}</TableCell>
                                <TableCell className="text-center">
                                    <span className={cn(
                                        "font-bold",
                                        ward.anomalyScore > 7 ? "text-red-500" : ward.anomalyScore > 4 ? "text-yellow-500" : "text-green-500"
                                    )}>
                                        {ward.anomalyScore.toFixed(1)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-[10px] border-[#1e2a3b] text-cyan-400 uppercase">
                                        {ward.topSource}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right text-xs text-gray-500">
                                    {new Date(ward.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
