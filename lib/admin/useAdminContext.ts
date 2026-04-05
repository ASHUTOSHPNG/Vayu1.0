'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAdminStore } from '@/store/adminStore';
import { AdminContext, getAdminContext } from '@/types/admin';
import { UserProfile } from '@/types';

export function useAdminContext() {
    const supabase = createClient();
    const { adminContext, profile, setAdminContext } = useAdminStore();
    const [isLoading, setIsLoading] = useState(!adminContext);
    const [fullName, setFullName] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const fetchedRef = useRef(false);

    useEffect(() => {
        // If we already have it in store or we already started fetching, don't re-run
        if ((adminContext && profile) || fetchedRef.current) {
            setIsLoading(false);
            if (profile) {
                // We should still set the name/email if they are local state
                // But avoid calling state setters every render
            }
            return;
        }

        async function fetchAdminData() {
            fetchedRef.current = true;
            setIsLoading(true);

            const { data: { session } } = await supabase.auth.getSession();
            console.log('session:', session);

            if (!session) {
                setIsLoading(false);
                return;
            }

            setFullName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Administrator');
            setEmail(session.user.email || null);

            const { data: profileData, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            console.log('profileData:', profileData, 'error:', error);

            if (profileData && !error) {
                const profile = profileData as unknown as UserProfile;
                const context = getAdminContext(profile);
                setAdminContext(context, profile);
            }
            setIsLoading(false);
        }

        fetchAdminData();
    }, [adminContext, profile, setAdminContext, supabase.auth]);

    return {
        adminContext,
        profile,
        fullName,
        email,
        isLoading,
        isCentralAdmin: adminContext?.type === 'central_admin',
        isCityAdmin: adminContext?.type === 'city_admin',
        cityName: adminContext?.type === 'city_admin' ? adminContext.cityFilter.name : null
    };
}
