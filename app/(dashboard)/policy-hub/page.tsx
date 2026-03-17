
"use client";

import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { useAdminContext } from '@/lib/admin/useAdminContext';
import { useAdminStore } from '@/store/adminStore';
import { applyCityFilter } from '@/lib/admin/queryHelpers';
import { ShieldAlert, CheckCircle2, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PolicyCard } from '@/components/admin/PolicyCard';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function PolicyHubPage() {
    const supabase = createClient();
    const queryClient = useQueryClient();
    const { adminContext } = useAdminContext();
    const { selectedCityId } = useAdminStore();

    const { data: recommendations, isLoading } = useQuery({
        queryKey: ['policy-recommendations', adminContext, selectedCityId],
        queryFn: async () => {
            if (!adminContext) return [];
            let query = supabase
                .from('policy_recommendations')
                .select('*, locations!inner(name, city)')
                .eq('status', 'pending') // Only show pending in hub
                .order('created_at', { ascending: false });

            query = applyCityFilter(query, adminContext, selectedCityId);
            const { data, error } = await query;
            if (error) throw error;
            return data as any[];
        },
        enabled: !!adminContext
    });

    const updateStatus = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: 'actioned' | 'dismissed' }) => {
            const { error } = await supabase
                .from('policy_recommendations')
                .update({ status: status as any })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['policy-recommendations'] });
        }
    });

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Policy Hub</h1>
                    <p className="text-gray-400 mt-2">AI-Generated environmental interventions and regulatory actions.</p>
                </div>
                <div className="flex gap-4">
                    <Card className="bg-[#132238] border-[#1e2a3b] p-3 flex items-center space-x-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Actioned</p>
                            <p className="text-lg font-bold text-white leading-none">12</p>
                        </div>
                    </Card>
                    <Card className="bg-[#132238] border-[#1e2a3b] p-3 flex items-center space-x-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <ShieldAlert className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Pending</p>
                            <p className="text-lg font-bold text-white leading-none">
                                {recommendations?.length || 0}
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                    [1, 2, 3].map(i => (
                        <Card key={i} className="bg-[#132238] border-[#1e2a3b] h-32 animate-pulse" />
                    ))
                ) : recommendations?.length === 0 ? (
                    <div className="text-center py-20 bg-[#132238] rounded-3xl border border-dashed border-[#1e2a3b]">
                        <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-white font-bold">No Policy Recommendations</h3>
                        <p className="text-gray-500 text-sm">System is currently observing no critical air quality events.</p>
                    </div>
                ) : (
                    recommendations?.map((rec) => (
                        <PolicyCard
                            key={rec.id}
                            recommendation={rec}
                            onApprove={(id) => updateStatus.mutate({ id, status: 'actioned' })}
                            onDismiss={(id) => updateStatus.mutate({ id, status: 'dismissed' })}
                            isProcessing={updateStatus.isPending}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

