"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAdminContext } from '@/lib/admin/useAdminContext';
import { useAdminStore } from '@/store/adminStore';
import { applyCityFilter } from '@/lib/admin/queryHelpers';
import { Badge } from '@/components/ui/badge';

export function LatestPolicy() {
    const queryClient = useQueryClient();
    const supabase = createClient();
    const { adminContext, isCentralAdmin } = useAdminContext();
    const { selectedCityId } = useAdminStore();

    const { data: policy, isLoading } = useQuery({
        queryKey: ['latest-policy', adminContext, selectedCityId],
        queryFn: async () => {
            if (!adminContext) return null;

            let query = (supabase as any)
                .from('policy_recommendations')
                .select(`
                    id,
                    location_id,
                    recommendation_text,
                    status,
                    created_at,
                    locations!inner ( name, city )
                `)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            query = applyCityFilter(query, adminContext, selectedCityId);
            const { data, error } = await query.limit(1).maybeSingle();
            if (error) throw error;
            return data as any;
        },
        refetchInterval: 60000,
        enabled: !!adminContext,
    });

    const updateStatus = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: 'actioned' | 'dismissed' }) => {
            const { error } = await (supabase as any)
                .from('policy_recommendations')
                .update({ status })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['latest-policy'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
    });

    return (
        <Card className="bg-[#00D4FF]/10 border-[#00D4FF]/30 shadow-[0_0_15px_rgba(0,212,255,0.1)] flex flex-col h-full relative overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00D4FF] rounded-full blur-[100px] opacity-20 pointer-events-none" />
            <CardHeader className="p-4 border-b border-[#00D4FF]/20 relative z-10">
                <CardTitle className="text-sm font-bold text-[#00D4FF] flex items-center uppercase tracking-wider">
                    <ShieldAlert className="h-4 w-4 mr-2" />
                    {isCentralAdmin && !selectedCityId ? 'National Policy Alerts' : 'Local Policy Action Required'}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-5 flex-1 relative z-10 flex flex-col">
                {isLoading ? (
                    <div className="space-y-3 animate-pulse">
                        <div className="h-4 bg-[#1e2a3b] rounded w-3/4" />
                        <div className="h-4 bg-[#1e2a3b] rounded w-full" />
                        <div className="h-4 bg-[#1e2a3b] rounded w-5/6" />
                    </div>
                ) : !policy ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 py-6">
                        <CheckCircle2 className="h-10 w-10 mb-2 opacity-30 text-green-500" />
                        <p className="text-sm">No pending policy actions required.<br />System is operating nominally.</p>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <div className="mb-3 flex justify-between items-start">
                            <h4 className="font-bold text-white text-base leading-tight">
                                {typeof policy.recommendation_text === 'string'
                                    ? JSON.parse(policy.recommendation_text).headline
                                    : (policy.recommendation_text as any)?.headline || 'Immediate Dust Mitigation Protocol'}
                            </h4>
                            <Badge className="bg-red-500/20 text-red-400 border-none font-bold ml-2 shrink-0">
                                CRITICAL
                            </Badge>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-3 mb-4 leading-relaxed flex-1">
                            {typeof policy.recommendation_text === 'string'
                                ? JSON.parse(policy.recommendation_text).immediateActions[0]
                                : (policy.recommendation_text as any)?.immediateActions?.[0] || 'Deploy targeted water sprinkling and halt heavy construction.'}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 font-medium overflow-hidden">
                            <FileText className="h-3.5 w-3.5 mr-1 shrink-0" />
                            <span className="truncate">For: <span className="text-white ml-1">{(policy.locations as any)?.name || 'Unknown Region'}</span></span>
                            <span className="mx-2 shrink-0">•</span>
                            <span className="shrink-0">{policy.created_at ? new Date(policy.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                        </div>
                    </div>
                )}
            </CardContent>
            {policy && (
                <CardFooter className="p-4 pt-0 border-t border-[#00D4FF]/20 relative z-10 mt-auto flex gap-3">
                    <Button
                        onClick={() => updateStatus.mutate({ id: policy.id, status: 'actioned' })}
                        disabled={updateStatus.isPending}
                        className="flex-1 bg-[#00D4FF] hover:bg-[#00b0d6] text-black font-bold h-9 text-xs"
                    >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Enact
                    </Button>
                    <Button
                        onClick={() => updateStatus.mutate({ id: policy.id, status: 'dismissed' })}
                        disabled={updateStatus.isPending}
                        variant="outline"
                        className="flex-[0.5] border-[#1e2a3b] text-gray-400 hover:text-white hover:bg-[#1e2a3b] h-9 text-xs"
                    >
                        <XCircle className="w-4 h-4 mr-1.5" /> Dismiss
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}