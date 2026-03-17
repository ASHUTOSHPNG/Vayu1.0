
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Seeding Chennai ward-level data...');

    const locations = [
        {
            name: 'Adyar',
            city: 'Chennai',
            state: 'Tamil Nadu',
            country: 'India',
            latitude: 13.0033,
            longitude: 13.0033,
            type: 'ward',
            ward_id: 'GCC_ADYA'
        },
        {
            name: 'Anna Nagar',
            city: 'Chennai',
            state: 'Tamil Nadu',
            country: 'India',
            latitude: 13.0850,
            longitude: 80.2101,
            type: 'ward',
            ward_id: 'GCC_ANNA'
        },
        {
            name: 'T. Nagar',
            city: 'Chennai',
            state: 'Tamil Nadu',
            country: 'India',
            latitude: 13.0418,
            longitude: 80.2341,
            type: 'ward',
            ward_id: 'GCC_TNAG'
        },
        {
            name: 'Velachery',
            city: 'Chennai',
            state: 'Tamil Nadu',
            country: 'India',
            latitude: 12.9815,
            longitude: 80.2185,
            type: 'ward',
            ward_id: 'GCC_VELA'
        },
        {
            name: 'Mylapore',
            city: 'Chennai',
            state: 'Tamil Nadu',
            country: 'India',
            latitude: 13.0333,
            longitude: 80.2667,
            type: 'ward',
            ward_id: 'GCC_MYLA'
        }
    ];

    // Correcting Adyar coordinates (they were 13.0033, 13.0033 in some data, actually 13.0067, 80.2578)
    locations[0].latitude = 13.0067;
    locations[0].longitude = 80.2578;

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
        const aqiBase = loc.name === 'T. Nagar' || loc.name === 'Anna Nagar' ? 130 : 90;

        for (let i = 0; i < 24; i++) {
            const time = new Date(now.getTime() - i * 3600000);
            readings.push({
                location_id: loc.id,
                aqi_value: aqiBase + Math.random() * 30,
                pm25: aqiBase * 0.5,
                pm10: aqiBase * 1.1,
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
            location_id: insertedLocations[2].id, // T. Nagar
            source_type: 'traffic',
            confidence_score: 0.95,
            detected_at: now.toISOString()
        },
        {
            location_id: insertedLocations[1].id, // Anna Nagar
            source_type: 'construction',
            confidence_score: 0.82,
            detected_at: now.toISOString()
        }
    ];

    const { error: sourceError } = await supabase.from('pollution_sources').insert(sources);
    if (sourceError) console.error('Error seeding sources:', sourceError);
    else console.log('Inserted pollution sources.');

    console.log('Seeding Chennai complete!');
}

seed();
