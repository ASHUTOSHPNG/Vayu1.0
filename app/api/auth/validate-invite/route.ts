import { createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { invite_code } = await request.json();

        if (!invite_code) {
            return NextResponse.json({ error: 'invite_code_required' }, { status: 400 });
        }

        const supabase = await createAdminClient();
        const normalizedCode = invite_code.trim().toUpperCase();
        console.log('Looking for code:', normalizedCode);

        const { data: invitation, error } = await supabase
            .from('admin_invitations')
            .select('*')
            .eq('invite_code', normalizedCode)
            .is('used_by', null)
            .gt('expires_at', new Date().toISOString())
            .maybeSingle();
        console.log('Result:', { invitation, error });

        if (error) {
            console.error('DB error:', error);
            return NextResponse.json({ error: 'db_error' }, { status: 500 });
        }

        if (!invitation) {
            return NextResponse.json({ error: 'invalid_invite' }, { status: 404 });
        }

        return NextResponse.json({
            valid: true,
            admin_type: invitation.admin_type,
            city_name: invitation.assigned_city_name,
            city_id: invitation.assigned_city_id
        });

    } catch (err) {
        console.error('Validate invite error:', err);
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}