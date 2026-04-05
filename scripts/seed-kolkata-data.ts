
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Seeding Kolkata ward-level data...');

    const locations = [
        {
            name: 'Salt Lake',
            city: 'Kolkata',
            state: 'West Bengal',
            country: 'India',
            latitude: 22.5851,
            longitude: 88.4146,
            type: 'ward',
            ward_id: 'KMC_SALT'
        },
        {
            name: 'Park Street',
            city: 'Kolkata',
            state: 'West Bengal',
            country: 'India',
            latitude: 22.5511,
            longitude: 88.3518,
            type: 'ward',
            ward_id: 'KMC_PARK'
        },
        {
            name: 'Ballygunge',
            city: 'Kolkata',
            state: 'West Bengal',
            country: 'India',
            latitude: 22.5256,
            longitude: 88.3615,
            type: 'ward',
            ward_id: 'KMC_BALL'
        },
        {
            name: 'Behala',
            city: 'Kolkata',
            state: 'West Bengal',
            country: 'India',
            latitude: 22.4990,
            longitude: 88.3182,
            type: 'ward',
            ward_id: 'KMC_BEHA'
        },
        {
            name: 'Howrah',
            city: 'Kolkata',
            state: 'West Bengal',
            country: 'India',
            latitude: 22.5830,
            longitude: 88.3297,
            type: 'ward',
            ward_id: 'HMC_HOWR'
        }
    ];

    const { data: insertedLocations, error: locError } = await supabase
        .from('wards')
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
        const aqiBase = loc.name === 'Howrah' || loc.name === 'Behala' ? 240 : 180;

        for (let i = 0; i < 24; i++) {
            const time = new Date(now.getTime() - i * 3600000);
            readings.push({
                location_id: loc.id,
                aqi_value: aqiBase + Math.random() * 50,
                pm25: aqiBase * 0.6,
                pm10: aqiBase * 1.25,
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
            location_id: insertedLocations[4].id, // Howrah
            source_type: 'industrial',
            confidence_score: 0.91,
            detected_at: now.toISOString()
        },
        {
            location_id: insertedLocations[1].id, // Park Street
            source_type: 'traffic',
            confidence_score: 0.89,
            detected_at: now.toISOString()
        }
    ];

    const { error: sourceError } = await supabase.from('pollution_sources').insert(sources);
    if (sourceError) console.error('Error seeding sources:', sourceError);
    else console.log('Inserted pollution sources.');

    console.log('Seeding Kolkata complete!');
}

seed();
