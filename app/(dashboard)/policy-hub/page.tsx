"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { useAdminContext } from '@/lib/admin/useAdminContext';
import { useAdminStore } from '@/store/adminStore';
import { CheckCircle2, ShieldAlert, FileText, MapPin } from 'lucide-react';
import { PolicyCard } from '@/components/admin/PolicyCard';

export default function PolicyHubPage() {
    const supabase = createClient();
    const queryClient = useQueryClient();
    const { adminContext } = useAdminContext();
    const { selectedCityId } = useAdminStore();

    const { data: recommendations, isLoading } = useQuery({
    queryKey: ['policy-recommendations'],
    queryFn: async () => {
        const { data, error } = await (supabase as any)
            .from('policy_actions')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        console.log('data:', data);
        console.log('error:', error);

        if (error) throw error;
        return data as any[];
    },
    enabled: true
});
    const updateStatus = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: 'approved' | 'rejected' }) => {
            const { error } = await supabase
                .from('policy_actions')
                .update({ status })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['policy-recommendations'] });
        }
    });

    // Group policies by city
    const groupedByCity = recommendations?.reduce((acc: Record<string, any[]>, rec) => {
        const city = rec.city || 'Unknown City';
        if (!acc[city]) acc[city] = [];
        acc[city].push(rec);
        return acc;
    }, {});

    const approvedCount = 12; // replace with real query if needed
    const pendingCount = recommendations?.length || 0;

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
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
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Approved</p>
                            <p className="text-lg font-bold text-white leading-none">{approvedCount}</p>
                        </div>
                    </Card>
                    <Card className="bg-[#132238] border-[#1e2a3b] p-3 flex items-center space-x-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <ShieldAlert className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Pending</p>
                            <p className="text-lg font-bold text-white leading-none">{pendingCount}</p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 gap-6">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="bg-[#132238] border-[#1e2a3b] h-32 animate-pulse" />
                    ))}
                </div>
            ) : !groupedByCity || Object.keys(groupedByCity).length === 0 ? (
                <div className="text-center py-20 bg-[#132238] rounded-3xl border border-dashed border-[#1e2a3b]">
                    <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-white font-bold">No Policy Recommendations</h3>
                    <p className="text-gray-500 text-sm">System is currently observing no critical air quality events.</p>
                </div>
            ) : (
                // Group by city
                Object.entries(groupedByCity).map(([city, policies]) => (
                    <div key={city} className="space-y-4">
                        {/* City Header */}
                        <div className="flex items-center gap-2 border-b border-[#1e2a3b] pb-2">
                            <MapPin className="h-4 w-4 text-cyan-400" />
                            <h2 className="text-cyan-400 font-bold text-lg tracking-wide">{city}</h2>
                            <span className="text-xs text-gray-500 ml-1">
                                {policies.length} pending {policies.length === 1 ? 'policy' : 'policies'}
                            </span>
                        </div>

                        {/* Policy Cards under this city */}
                        <div className="grid grid-cols-1 gap-4 pl-2 border-l-2 border-cyan-400/20">
                            {policies.map((rec) => (
                                <PolicyCard
                                    key={rec.id}
                                    recommendation={rec}
                                    onApprove={(id) => updateStatus.mutate({ id, status: 'approved' })}
                                    onDismiss={(id) => updateStatus.mutate({ id, status: 'rejected' })}
                                    isProcessing={updateStatus.isPending}
                                />
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}