
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Seeding Bangalore ward-level data...');

    const locations = [
        {
            name: 'Indiranagar',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            latitude: 12.9719,
            longitude: 77.6412,
            type: 'ward',
            ward_id: 'BBMP_INDI'
        },
        {
            name: 'Koramangala',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            latitude: 12.9352,
            longitude: 77.6245,
            type: 'ward',
            ward_id: 'BBMP_KORA'
        },
        {
            name: 'Whitefield',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            latitude: 12.9698,
            longitude: 77.7500,
            type: 'ward',
            ward_id: 'BBMP_WHIT'
        },
        {
            name: 'Jayanagar',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            latitude: 12.9308,
            longitude: 77.5838,
            type: 'ward',
            ward_id: 'BBMP_JAYA'
        },
        {
            name: 'Electronic City',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            latitude: 12.8399,
            longitude: 77.6770,
            type: 'ward',
            ward_id: 'BBMP_ECITY'
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
        const aqiBase = loc.name === 'Whitefield' || loc.name === 'Electronic City' ? 140 : 80;

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
            location_id: insertedLocations[2].id, // Whitefield
            source_type: 'construction',
            confidence_score: 0.9,
            detected_at: now.toISOString()
        },
        {
            location_id: insertedLocations[0].id, // Indiranagar
            source_type: 'traffic',
            confidence_score: 0.85,
            detected_at: now.toISOString()
        }
    ];

    const { error: sourceError } = await supabase.from('pollution_sources').insert(sources);
    if (sourceError) console.error('Error seeding sources:', sourceError);
    else console.log('Inserted pollution sources.');

    console.log('Seeding Bangalore complete!');
}

seed();
