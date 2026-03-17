
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Seeding Jaipur ward-level data...');

    const locations = [
        {
            name: 'C-Scheme',
            city: 'Jaipur',
            state: 'Rajasthan',
            country: 'India',
            latitude: 26.9067,
            longitude: 75.8033,
            type: 'ward',
            ward_id: 'JMC_CSCH'
        },
        {
            name: 'Malviya Nagar',
            city: 'Jaipur',
            state: 'Rajasthan',
            country: 'India',
            latitude: 26.8549,
            longitude: 75.8243,
            type: 'ward',
            ward_id: 'JMC_MALV'
        },
        {
            name: 'Vaishali Nagar',
            city: 'Jaipur',
            state: 'Rajasthan',
            country: 'India',
            latitude: 26.9033,
            longitude: 75.7433,
            type: 'ward',
            ward_id: 'JMC_VAIS'
        },
        {
            name: 'Mansarovar',
            city: 'Jaipur',
            state: 'Rajasthan',
            country: 'India',
            latitude: 26.8491,
            longitude: 75.7667,
            type: 'ward',
            ward_id: 'JMC_MANS'
        },
        {
            name: 'Old City',
            city: 'Jaipur',
            state: 'Rajasthan',
            country: 'India',
            latitude: 26.9200,
            longitude: 75.8200,
            type: 'ward',
            ward_id: 'JMC_OLDC'
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
        const aqiBase = loc.name === 'Old City' || loc.name === 'Mansarovar' ? 200 : 160;

        for (let i = 0; i < 24; i++) {
            const time = new Date(now.getTime() - i * 3600000);
            readings.push({
                location_id: loc.id,
                aqi_value: aqiBase + Math.random() * 50,
                pm25: aqiBase * 0.6,
                pm10: aqiBase * 1.2,
                source: 'iot',
                recorded_at: time.toISOString()
            });
        }
    }

    const { error: aqiError } = await supabase.from('aqi_readings').insert(readings);
    if (aqiError) console.error('Error seeding readings:', aqiError);
    else console.log(`Inserted ${readings.length} AQI readings.`);

    console.log('Seeding Jaipur complete!');
}

seed();
