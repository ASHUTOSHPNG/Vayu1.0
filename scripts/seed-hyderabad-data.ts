
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Seeding Hyderabad ward-level data...');

    const locations = [
        {
            name: 'Gachibowli',
            city: 'Hyderabad',
            state: 'Telangana',
            country: 'India',
            latitude: 17.4401,
            longitude: 78.3489,
            type: 'ward',
            ward_id: 'GHMC_GACH'
        },
        {
            name: 'Jubilee Hills',
            city: 'Hyderabad',
            state: 'Telangana',
            country: 'India',
            latitude: 17.4326,
            longitude: 78.4071,
            type: 'ward',
            ward_id: 'GHMC_JUBI'
        },
        {
            name: 'Banjara Hills',
            city: 'Hyderabad',
            state: 'Telangana',
            country: 'India',
            latitude: 17.4123,
            longitude: 78.4324,
            type: 'ward',
            ward_id: 'GHMC_BANJ'
        },
        {
            name: 'Hitech City',
            city: 'Hyderabad',
            state: 'Telangana',
            country: 'India',
            latitude: 17.4435,
            longitude: 78.3773,
            type: 'ward',
            ward_id: 'GHMC_HITE'
        },
        {
            name: 'Secunderabad',
            city: 'Hyderabad',
            state: 'Telangana',
            country: 'India',
            latitude: 17.4399,
            longitude: 78.4983,
            type: 'ward',
            ward_id: 'GHMC_SECU'
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
        const aqiBase = loc.name === 'Secunderabad' || loc.name === 'Gachibowli' ? 160 : 120;

        for (let i = 0; i < 24; i++) {
            const time = new Date(now.getTime() - i * 3600000);
            readings.push({
                location_id: loc.id,
                aqi_value: aqiBase + Math.random() * 40,
                pm25: aqiBase * 0.55,
                pm10: aqiBase * 1.15,
                source: 'iot',
                recorded_at: time.toISOString()
            });
        }
    }

    const { error: aqiError } = await supabase.from('aqi_readings').insert(readings);
    if (aqiError) console.error('Error seeding readings:', aqiError);
    else console.log(`Inserted ${readings.length} AQI readings.`);

    const sources = [
        {
            location_id: insertedLocations[0].id, // Gachibowli
            source_type: 'construction',
            confidence_score: 0.88,
            detected_at: now.toISOString()
        },
        {
            location_id: insertedLocations[4].id, // Secunderabad
            source_type: 'traffic',
            confidence_score: 0.92,
            detected_at: now.toISOString()
        }
    ];

    const { error: sourceError } = await supabase.from('pollution_sources').insert(sources);
    if (sourceError) console.error('Error seeding sources:', sourceError);
    else console.log('Inserted pollution sources.');

    console.log('Seeding Hyderabad complete!');
}

seed();
