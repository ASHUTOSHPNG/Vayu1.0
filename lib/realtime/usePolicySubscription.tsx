"use client";
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/types/database';
import { RealtimeChannel, RealtimePostgresInsertPayload } from '@supabase/supabase-js';

type PolicyRecommendation = Database['public']['Tables']['policy_actions']['Row'];

export function usePolicySubscription() {
    const [latestRecommendation, setLatestRecommendation] = useState<PolicyRecommendation | null>(null);
    const [newCount, setNewCount] = useState(0);
    const supabase = createClient();
    const [channel, setChannel] = useState<RealtimeChannel | null>(null);

    const subscribe = useCallback(() => {
        if (channel) return;
        const newChannel = supabase
            .channel('policy-updates')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'policy_recommendations', // runtime table name unchanged
                },
                (payload: RealtimePostgresInsertPayload<PolicyRecommendation>) => {
                    const recommendation = payload.new;
                    setLatestRecommendation(recommendation);
                    setNewCount((prev) => prev + 1);
                    toast.info('New Policy Recommendation', {
                        description: (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${(recommendation as any).severity === 'critical' ? 'bg-red-500 text-white' :
                                            (recommendation as any).severity === 'high' ? 'bg-orange-500 text-white' :
                                                (recommendation as any).severity === 'moderate' ? 'bg-yellow-500 text-black' :
                                                    'bg-blue-500 text-white'
                                        }`}>
                                        {(recommendation as any).severity}
                                    </span>
                                    <span className="font-semibold text-sm">{(recommendation as any).anomaly_summary || 'New Update'}</span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">{(recommendation as any).recommendation_text}</p>
                                <button
                                    onClick={() => window.location.href = `/admin/policies/${recommendation.id}`}
                                    className="w-fit text-[11px] font-bold text-[#00D4FF] hover:underline"
                                >
                                    View Details
                                </button>
                            </div>
                        ),
                        duration: 5000,
                    });
                }
            )
            .subscribe();
        setChannel(newChannel);
    }, [channel, supabase]);

    const unsubscribe = useCallback(() => {
        if (channel) {
            supabase.removeChannel(channel);
            setChannel(null);
        }
    }, [channel, supabase]);

    useEffect(() => {
        subscribe();
        return () => {
            unsubscribe();
        };
    }, [subscribe, unsubscribe]);

    return { latestRecommendation, newCount };
}