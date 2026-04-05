
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Seeding Pune ward-level data...');

    const locations = [
        {
            name: 'Kothrud',
            city: 'Pune',
            state: 'Maharashtra',
            country: 'India',
            latitude: 18.5074,
            longitude: 73.8077,
            type: 'ward',
            ward_id: 'PMC_KOTH'
        },
        {
            name: 'Viman Nagar',
            city: 'Pune',
            state: 'Maharashtra',
            country: 'India',
            latitude: 18.5679,
            longitude: 73.9143,
            type: 'ward',
            ward_id: 'PMC_VIMA'
        },
        {
            name: 'Hinjewadi',
            city: 'Pune',
            state: 'Maharashtra',
            country: 'India',
            latitude: 18.5913,
            longitude: 73.7389,
            type: 'ward',
            ward_id: 'PMC_HINJ'
        },
        {
            name: 'Hadapsar',
            city: 'Pune',
            state: 'Maharashtra',
            country: 'India',
            latitude: 18.5089,
            longitude: 73.9259,
            type: 'ward',
            ward_id: 'PMC_HADA'
        },
        {
            name: 'Deccan Gymkhana',
            city: 'Pune',
            state: 'Maharashtra',
            country: 'India',
            latitude: 18.5146,
            longitude: 73.8436,
            type: 'ward',
            ward_id: 'PMC_DECC'
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
        const aqiBase = loc.name === 'Hinjewadi' || loc.name === 'Hadapsar' ? 140 : 100;

        for (let i = 0; i < 24; i++) {
            const time = new Date(now.getTime() - i * 3600000);
            readings.push({
                location_id: loc.id,
                aqi_value: aqiBase + Math.random() * 40,
                pm25: aqiBase * 0.5,
                pm10: aqiBase * 1.15,
                source: 'iot',
                recorded_at: time.toISOString()
            });
        }
    }

    const { error: aqiError } = await supabase.from('aqi_readings').insert(readings);
    if (aqiError) console.error('Error seeding readings:', aqiError);
    else console.log(`Inserted ${readings.length} AQI readings.`);

    console.log('Seeding Pune complete!');
}

seed();
