import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
    console.error('Could not read .env.local', e);
    process.exit(1);
}

const getEnvValue = (key: string) => {
    // Escape dots and add line anchor
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvValue('SUPABASE_URL') || getEnvValue('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnvValue('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRealtime() {
    console.log('--- Checking Supabase Realtime Configuration ---');

    // Try to check if table is in some publication
    // Unfortunately we can't query system tables easily without superuser or proper VPC
    // But let's try a simple query that might give clues

    try {
        const { data, error } = await supabase.from('aqi_readings').select('id').limit(1);
        if (error) {
            console.error('Could not even query aqi_readings:', error.message);
        } else {
            console.log('SUCCESS: Can query aqi_readings with service role.');
        }
    } catch (e) {
        console.error('Failed to query table:', e);
    }

    console.log('--- Check Complete ---');
    console.log('If you still see Offline, please verify that "aqi_readings" is added to the "supabase_realtime" publication in the Supabase Dashboard.');
}

checkRealtime().catch(console.error);
