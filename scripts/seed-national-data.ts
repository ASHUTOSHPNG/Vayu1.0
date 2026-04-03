
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Seeding National data for other cities...');

    // 1. Create National Locations
    const locations = [
        {
            name: 'Connaught Place',
            city: 'Delhi',
            state: 'Delhi',
            country: 'India',
            latitude: 28.6315,
            longitude: 77.2167,
            type: 'ward',
            ward_id: 'ND'
        },
        {
            name: 'Indiranagar',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            latitude: 12.9716,
            longitude: 77.6412,
            type: 'ward',
            ward_id: 'BNG_E'
        },
        {
            name: 'Park Street',
            city: 'Kolkata',
            state: 'West Bengal',
            country: 'India',
            latitude: 22.5529,
            longitude: 88.3533,
            type: 'ward',
            ward_id: 'KOL_S'
        },
        {
            name: 'Banjara Hills',
            city: 'Hyderabad',
            state: 'Telangana',
            country: 'India',
            latitude: 17.4123,
            longitude: 78.4484,
            type: 'ward',
            ward_id: 'HYD_W'
        },
        {
            name: 'T. Nagar',
            city: 'Chennai',
            state: 'Tamil Nadu',
            country: 'India',
            latitude: 13.0418,
            longitude: 80.2337,
            type: 'ward',
            ward_id: 'CHN_C'
        },
        {
            name: 'Shivajinagar',
            city: 'Pune',
            state: 'Maharashtra',
            country: 'India',
            latitude: 18.5308,
            longitude: 73.8475,
            type: 'ward',
            ward_id: 'PUN_C'
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

    // 2. Create AQI Readings (Recent - Last 24h)
    const readings = [];
    const now = new Date();

    for (const loc of insertedLocations) {
        // Higher AQI for Delhi, medium for Kolkata/Hyderabad
        let aqiBase = 150;
        if (loc.city === 'Delhi') aqiBase = 380;
        if (loc.city === 'Kolkata') aqiBase = 220;
        if (loc.city === 'Bangalore') aqiBase = 80;

        for (let i = 0; i < 24; i++) {
            const time = new Date(now.getTime() - i * 3600000);
            readings.push({
                location_id: loc.id,
                aqi_value: Math.max(0, aqiBase + (Math.random() - 0.5) * 40),
                pm25: aqiBase * 0.6 + (Math.random() - 0.5) * 20,
                pm10: aqiBase * 1.2 + (Math.random() - 0.5) * 30,
                source: 'iot',
                recorded_at: time.toISOString()
            });
        }
    }

    const { error: aqiError } = await supabase.from('aqi_readings').insert(readings);
    if (aqiError) console.error('Error seeding readings:', aqiError);
    else console.log(`Inserted ${readings.length} AQI readings.`);

    // 3. Create Pollution Sources for new cities
    const sources = [
        {
            location_id: insertedLocations[0].id, // CP, Delhi
            source_type: 'traffic',
            confidence_score: 0.95,
            detected_at: now.toISOString()
        },
        {
            location_id: insertedLocations[2].id, // Park Street, Kolkata
            source_type: 'biomass_burning',
            confidence_score: 0.72,
            detected_at: now.toISOString()
        }
    ];

    const { error: sourceError } = await supabase.from('pollution_sources').insert(sources);
    if (sourceError) console.error('Error seeding sources:', sourceError);
    else console.log('Inserted additional pollution sources.');

    console.log('National seeding complete!');
}

seed();
