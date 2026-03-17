import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { user_id, full_name, invite_code } = await request.json();

        if (!user_id || !full_name || !invite_code) {
            return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
        }

        const supabase = await createAdminClient();

        // Double check invitation is still valid and unused
        const { data: invitation, error: inviteError } = await supabase
            .from('admin_invitations')
            .select('*')
            .eq('invite_code', invite_code.trim().toUpperCase())
            .is('used_by', null)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (inviteError || !invitation) {
            return NextResponse.json({ error: 'invalid_invite' }, { status: 400 });
        }

        // Upsert profile
        const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert({
                id: user_id,
                role: 'admin',
                admin_type: invitation.admin_type,
                assigned_city_id: invitation.assigned_city_id,
                assigned_city_name: invitation.assigned_city_name,
                is_active: true
            });

        if (profileError) {
            console.error('Profile upsert error:', profileError);
            return NextResponse.json({ error: 'profile_creation_failed' }, { status: 500 });
        }

        // Update invitation
        const { error: updateError } = await supabase
            .from('admin_invitations')
            .update({
                used_by: user_id,
                used_at: new Date().toISOString()
            })
            .eq('id', invitation.id);

        if (updateError) {
            console.error('Invitation update error:', updateError);
            return NextResponse.json({ error: 'invitation_update_failed' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Complete registration error:', err);
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}
