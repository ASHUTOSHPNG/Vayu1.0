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

async function testQuery() {
    console.log('Testing "latest reading per location" query...');

    const { data: locations, error } = await supabase
        .from('wards')
        .select('name, city, aqi_readings(aqi_value, recorded_at)')
        .order('recorded_at', { foreignTable: 'aqi_readings', ascending: false })
        .limit(1, { foreignTable: 'aqi_readings' })
        .limit(5); // limit parents for test

    if (error) {
        console.error('Error:', error);
        return;
    }

    locations.forEach(loc => {
        console.log(`Location: ${loc.name} (${loc.city})`);
        console.log(`  Reading:`, loc.aqi_readings?.[0]);
    });
}

testQuery();
