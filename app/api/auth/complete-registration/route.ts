import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { user_id, full_name, invite_code } = await request.json();

        if (!user_id || !full_name || !invite_code) {
            return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
        }

        const supabase = await createAdminClient();

        // Verify user exists in Supabase Auth
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(user_id);

        if (userError || !user) {
            return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
        }

        const emailConfirmed = !!user.email_confirmed_at;

        const { data: invitation, error: inviteError } = await supabase
            .from('admin_invitations')
            .select('*')
            .eq('invite_code', invite_code.trim().toUpperCase())
            .is('used_by', null)
            .gt('expires_at', new Date().toISOString())
            .maybeSingle();

        if (inviteError) {
            console.error('Invite fetch error:', inviteError);
            return NextResponse.json({ error: 'db_error' }, { status: 500 });
        }

        if (!invitation) {
            return NextResponse.json({ error: 'invalid_invite' }, { status: 400 });
        }

        // Only activate profile if email is confirmed
        const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert({
                id: user_id,
                full_name,
                role: 'admin',
                admin_type: invitation.admin_type,
                assigned_city_id: invitation.assigned_city_id,
                assigned_city_name: invitation.assigned_city_name,
                is_active: emailConfirmed
            });

        if (profileError) {
            console.error('Profile upsert error:', profileError);
            return NextResponse.json({ error: 'profile_creation_failed' }, { status: 500 });
        }

        // Only burn the invite after email is confirmed, and record used_at
        if (emailConfirmed) {
            const { error: updateError } = await supabase
                .from('admin_invitations')
                .update({
                    used_by: user_id,
                    used_at: new Date().toISOString(),
                })
                .eq('id', invitation.id);

            if (updateError) {
                console.error('Invitation update error:', updateError);
                return NextResponse.json({ error: 'invitation_update_failed' }, { status: 500 });
            }
        }

        return NextResponse.json({
            success: true,
            email_confirmed: emailConfirmed
        });

    } catch (err) {
        console.error('Complete registration error:', err);
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}