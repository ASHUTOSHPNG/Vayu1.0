'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAQIStore } from '@/store/aqiStore';
import { AQReading } from '@/types/aqi';
import { RealtimeChannel } from '@supabase/supabase-js';

// Singleton tracker to avoid multiple global subscriptions fighting over store state
let globalChannelInstance: RealtimeChannel | null = null;
let globalSubscriberCount = 0;

export function useAQISubscription(locationId?: string) {
    const isConnectionActive = useAQIStore((state) => state.isConnectionActive);
    const setConnectionActive = useAQIStore((state) => state.setConnectionActive);
    const setStoreReading = useAQIStore((state) => state.setReading);

    const [latestReading, setLatestReading] = useState<AQReading | null>(null);
    const supabase = createClient();
    const channelRef = useRef<RealtimeChannel | null>(null);
    const retryCountRef = useRef(0);
    const isGlobal = !locationId;
    const MAX_RETRIES =         0;

    const subscribe = useCallback(() => {
        // Guard against double subscription for THIS hook instance
        if (channelRef.current) return;

        // Special handling for the global channel to avoid concurrent connections
        if (isGlobal && globalChannelInstance) {
            console.log('[Realtime] Attaching to existing global channel singleton.');
            channelRef.current = globalChannelInstance;
            globalSubscriberCount++;
            return;
        }

        const channelName = isGlobal ? 'aqi-updates-global' : `aqi-updates-${locationId}`;
        console.log(`[Realtime] 🛰️ Initiating subscription: ${channelName}...`);

        const newChannel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'aqi_readings',
                    ...(locationId ? { filter: `ward_id=eq.${locationId}` } : {}),
                },
                (payload) => {
                    const newReading = payload.new as any;
                    console.log(`[Realtime] 📩 New reading received for ${locationId || 'global'}:`, newReading);

                    const formattedReading: AQReading = {
                        aqi: newReading.aqi_value,
                            pollutants: {
                            pm25: newReading.pm25,
                            pm10: newReading.pm10,
                            no2: newReading.no2,
                            so2: newReading.so2,
                            co: newReading.co,
                            o3: newReading.o3,
                        },
                        source: newReading.source || 'auto',
                        timestamp: newReading.recorded_at || new Date().toISOString(),
                    };

                    setLatestReading(formattedReading);
                    const locId = newReading.ward_id|| locationId;
                    if (locId) {
                        setStoreReading(locId, formattedReading);
                    }
                }
            )
            .subscribe((status, error) => {
                const connected = status === 'SUBSCRIBED';

                // Track status in console with more visibility
                if (connected) {
                    console.log(`[Realtime] ✅ ${channelName} is now LIVE.`);
                    retryCountRef.current = 0;
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    console.error(`[Realtime] ❌ ${channelName} failed with status: ${status}.`, error?.message || 'Check if Realtime publication exists on aqi_readings table.');

                    if (retryCountRef.current < MAX_RETRIES) {
                        retryCountRef.current += 1;
                        console.warn(`[Realtime] Retrying in ${2000 * retryCountRef.current}ms... (${retryCountRef.current}/${MAX_RETRIES})`);
                        setTimeout(() => {
                            if (channelRef.current === newChannel) {
                                channelRef.current = null;
                                if (isGlobal) globalChannelInstance = null;
                                subscribe();
                            }
                        }, 2000 * retryCountRef.current);
                    }
                } else {
                    console.log(`[Realtime] ℹ️ ${channelName} status change: ${status}`);
                }

                // Global state management
                if (isGlobal) {
                    setConnectionActive(connected);
                }
            });

        channelRef.current = newChannel;
        if (isGlobal) {
            globalChannelInstance = newChannel;
            globalSubscriberCount++;
        }
    }, [locationId, isGlobal, supabase, setStoreReading, setConnectionActive]);

    const unsubscribe = useCallback(() => {
        if (channelRef.current) {
            if (isGlobal) {
                globalSubscriberCount--;
                // Only remove the channel if NO other component is using it
                if (globalSubscriberCount <= 0) {
                    console.log(`[Realtime] 🛑 Last global subscriber disconnected. Closing channel...`);
                    supabase.removeChannel(channelRef.current);
                    globalChannelInstance = null;
                    setConnectionActive(false);
                    channelRef.current = null;
                } else {
                    console.log(`[Realtime] ✋ Detached from global channel. ${globalSubscriberCount} subscribers remaining.`);
                    channelRef.current = null;
                }
            } else {
                console.log(`[Realtime] 🛑 Closing filtered channel ${locationId}...`);
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        }
    }, [supabase, isGlobal, locationId, setConnectionActive]);

    useEffect(() => {
        // Short delay to prevent re-subscriptions during rapid navigation
        const timeout = setTimeout(subscribe, 300);

        return () => {
            clearTimeout(timeout);
            unsubscribe();
        };
    }, [subscribe, unsubscribe]);

    return { latestReading, isConnected: isGlobal ? isConnectionActive : !!channelRef.current, subscribe, unsubscribe };
}
