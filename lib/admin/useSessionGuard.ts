"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAdminStore } from '@/store/adminStore';
import { useQueryClient } from '@tanstack/react-query';

export function useSessionGuard() {
    const router = useRouter();
    const supabase = createClient();
    const queryClient = useQueryClient();
    const { setAdminContext, setSelectedCityId } = useAdminStore();

    const handleSignOut = async (message: string) => {
        setAdminContext(null, null);
        setSelectedCityId(null);
        queryClient.clear();
        router.push(`/login?message=${message}`);
    };

    useEffect(() => {
        // 1. Subscribe to auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                handleSignOut('signed_out');
            }
        });

        // 2. Periodic session check (every 5 minutes)
        const checkInterval = setInterval(async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                handleSignOut('session_expired');
            }
        }, 5 * 60 * 1000);

        // 3. Visibility change check
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible') {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    handleSignOut('session_expired');
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            subscription.unsubscribe();
            clearInterval(checkInterval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);
}
