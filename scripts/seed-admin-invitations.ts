import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const cities = [
    { name: 'Ghaziabad', code: 'GZB' },
    { name: 'Delhi', code: 'DEL' },
    { name: 'Mumbai', code: 'MUM' },
    { name: 'Bangalore', code: 'BLR' },
    { name: 'Hyderabad', code: 'HYD' },
    { name: 'Chennai', code: 'CHE' },
    { name: 'Kolkata', code: 'KOL' },
    { name: 'Pune', code: 'PUN' },
    { name: 'Bhubaneswar', code: 'BBS' },
    { name: 'Ahmedabad', code: 'AMD' },
    { name: 'Jaipur', code: 'JAI' },
];

async function seed() {
    console.log('Starting seed process...');

    // 1. Central Admin Invitation
    const { error: superError } = await supabase
        .from('admin_invitations')
        .upsert({
            invite_code: 'CENTRAL_ADMIN',
            admin_type: 'central_admin',
            expires_at: '2099-12-31T23:59:59Z',
        }, { onConflict: 'invite_code' });

    if (superError) {
        console.error('Error creating super admin invite:', superError);
    } else {
        console.log('Central Admin invite created/updated.');

        // If the primary code is already consumed, keep a backup code available.
        const { data: centralInvite, error: centralFetchError } = await supabase
            .from('admin_invitations')
            .select('used_by')
            .eq('invite_code', 'CENTRAL_ADMIN')
            .maybeSingle();

        if (centralFetchError) {
            console.error('Error checking CENTRAL_ADMIN usage:', centralFetchError);
        } else if (centralInvite?.used_by) {
            const { error: backupError } = await supabase
                .from('admin_invitations')
                .upsert({
                    invite_code: 'CENTRAL_ADMIN_2',
                    admin_type: 'central_admin',
                    expires_at: '2099-12-31T23:59:59Z',
                }, { onConflict: 'invite_code' });

            if (backupError) {
                console.error('Error creating backup central admin invite:', backupError);
            } else {
                console.log('Backup central admin invite is ready: CENTRAL_ADMIN_2');
            }
        }
    }

    // 2. City Admin Invitations
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    for (const city of cities) {
        // Try to find matching city in locations table
        const { data: locations, error: locError } = await supabase
            .from('locations')
            .select('id, name')
            .or(`name.ilike.%${city.name}%,city.ilike.%${city.name}%`)
            .limit(1);

        if (locError) {
            console.error(`Error searching for ${city.name}:`, locError);
            continue;
        }

        const assigned_city_id = locations?.[0]?.id || null;
        const assigned_city_name = city.name;

        if (!assigned_city_id) {
            console.warn(`Warning: Could not find location ID for ${city.name}. Invitation will be created without ID.`);
        }

        const { error: inviteError } = await supabase
            .from('admin_invitations')
            .upsert({
                invite_code: `CITY_ADMIN_${city.code}`,
                admin_type: 'city_admin',
                assigned_city_id,
                assigned_city_name,
                expires_at: oneYearFromNow.toISOString(),
            }, { onConflict: 'invite_code' });

        if (inviteError) {
            console.error(`Error creating invite for ${city.name}:`, inviteError);
        } else {
            console.log(`Invite created for ${city.name} (${inviteError ? 'failed' : 'success'}).`);
        }
    }

    console.log('Seed process completed.');
}

seed();
