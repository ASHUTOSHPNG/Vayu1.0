
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Seeding Ahmedabad ward-level data...');

    const locations = [
        {
            name: 'Navrangpura',
            city: 'Ahmedabad',
            state: 'Gujarat',
            country: 'India',
            latitude: 23.0373,
            longitude: 72.5613,
            type: 'ward',
            ward_id: 'AMC_NAVR'
        },
        {
            name: 'Satellite',
            city: 'Ahmedabad',
            state: 'Gujarat',
            country: 'India',
            latitude: 23.0300,
            longitude: 72.5176,
            type: 'ward',
            ward_id: 'AMC_SATE'
        },
        {
            name: 'Vastrapur',
            city: 'Ahmedabad',
            state: 'Gujarat',
            country: 'India',
            latitude: 23.0358,
            longitude: 72.5293,
            type: 'ward',
            ward_id: 'AMC_VAST'
        },
        {
            name: 'Maninagar',
            city: 'Ahmedabad',
            state: 'Gujarat',
            country: 'India',
            latitude: 22.9978,
            longitude: 72.6026,
            type: 'ward',
            ward_id: 'AMC_MANI'
        },
        {
            name: 'Naroda Industrial Estate',
            city: 'Ahmedabad',
            state: 'Gujarat',
            country: 'India',
            latitude: 23.0667,
            longitude: 72.6500,
            type: 'ward',
            ward_id: 'AMC_NARO'
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
        const aqiBase = loc.name === 'Naroda Industrial Estate' || loc.name === 'Maninagar' ? 220 : 160;

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
            location_id: insertedLocations[4].id, // Naroda
            source_type: 'industrial',
            confidence_score: 0.93,
            detected_at: now.toISOString()
        }
    ];

    const { error: sourceError } = await supabase.from('pollution_sources').insert(sources);
    if (sourceError) console.error('Error seeding sources:', sourceError);
    else console.log('Inserted pollution sources.');

    console.log('Seeding Ahmedabad complete!');
}

seed();
