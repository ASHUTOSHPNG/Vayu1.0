import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvValue = (key: string) => {
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvValue('SUPABASE_URL') || getEnvValue('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnvValue('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function checkData() {
    const { count, error } = await supabase.from('aqi_readings').select('*', { count: 'exact', head: true });
    console.log('Total AQI readings:', count);

    if (count && count > 0) {
        const { data: latest } = await supabase.from('aqi_readings').select('recorded_at').order('recorded_at', { ascending: false }).limit(5);
        console.log('Latest 5 readings at:', latest?.map(l => l.recorded_at));

        const now = new Date();
        const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

        console.log('Current time (server/script):', now.toISOString());

        const { count: count12 } = await supabase.from('aqi_readings').select('*', { count: 'exact', head: true }).gte('recorded_at', twelveHoursAgo.toISOString());
        const { count: count24 } = await supabase.from('aqi_readings').select('*', { count: 'exact', head: true }).gte('recorded_at', twentyFourHoursAgo.toISOString());
        const { count: count48 } = await supabase.from('aqi_readings').select('*', { count: 'exact', head: true }).gte('recorded_at', fortyEightHoursAgo.toISOString());

        console.log('Readings in last 12h:', count12);
        console.log('Readings in last 24h:', count24);
        console.log('Readings in last 48h:', count48);

        // Check a random location's readings
        const { data: locations } = await supabase.from('wards').select('id, city').limit(5);
        for (const loc of locations || []) {
            const { data: locReadings } = await supabase.from('aqi_readings').select('aqi_value, recorded_at').eq('location_id', loc.id).order('recorded_at', { ascending: false }).limit(1);
            console.log(`Latest reading for ${loc.city} (${loc.id}):`, locReadings?.[0]);
        }
    }
}

checkData().catch(console.error);
