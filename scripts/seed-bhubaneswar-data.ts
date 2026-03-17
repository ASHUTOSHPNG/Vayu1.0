
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Seeding Bhubaneswar ward-level data...');

    const locations = [
        {
            name: 'Saheed Nagar',
            city: 'Bhubaneswar',
            state: 'Odisha',
            country: 'India',
            latitude: 20.2891,
            longitude: 85.8441,
            type: 'ward',
            ward_id: 'BMC_SAHE'
        },
        {
            name: 'Khandagiri',
            city: 'Bhubaneswar',
            state: 'Odisha',
            country: 'India',
            latitude: 20.2541,
            longitude: 85.7831,
            type: 'ward',
            ward_id: 'BMC_KHAN'
        },
        {
            name: 'Patia',
            city: 'Bhubaneswar',
            state: 'Odisha',
            country: 'India',
            latitude: 20.3541,
            longitude: 85.8141,
            type: 'ward',
            ward_id: 'BMC_PATI'
        },
        {
            name: 'Old Town',
            city: 'Bhubaneswar',
            state: 'Odisha',
            country: 'India',
            latitude: 20.2341,
            longitude: 85.8341,
            type: 'ward',
            ward_id: 'BMC_OLDT'
        },
        {
            name: 'Unit-IX',
            city: 'Bhubaneswar',
            state: 'Odisha',
            country: 'India',
            latitude: 20.2841,
            longitude: 85.8341,
            type: 'ward',
            ward_id: 'BMC_UN09'
        }
    ];

    const { data: insertedLocations, error: locError } = await supabase
        .from('locations')
        .insert(locations)
        .select();

    if (locError) {
        console.error('Error seeding locations:', locError);
        return;
    }

    console.log(`Inserted ${insertedLocations.length} locations.`);

    const readings = [];
    const now = new Date();

    for (const loc of insertedLocations) {
        const aqiBase = loc.name === 'Patia' || loc.name === 'Khandagiri' ? 110 : 70;

        for (let i = 0; i < 24; i++) {
            const time = new Date(now.getTime() - i * 3600000);
            readings.push({
                location_id: loc.id,
                aqi_value: aqiBase + Math.random() * 30,
                pm25: aqiBase * 0.45,
                pm10: aqiBase * 1.05,
                source: 'iot',
                recorded_at: time.toISOString()
            });
        }
    }

    const { error: aqiError } = await supabase.from('aqi_readings').insert(readings);
    if (aqiError) console.error('Error seeding readings:', aqiError);
    else console.log(`Inserted ${readings.length} AQI readings.`);

    console.log('Seeding Bhubaneswar complete!');
}

seed();
