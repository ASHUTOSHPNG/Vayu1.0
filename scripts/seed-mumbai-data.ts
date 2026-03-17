
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Seeding Mumbai data...');

    // 1. Create Mumbai Locations
    const locations = [
        {
            name: 'Colaba',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            latitude: 18.9067,
            longitude: 72.8147,
            type: 'ward',
            ward_id: 'A_WARD'
        },
        {
            name: 'Andheri West',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            latitude: 19.1363,
            longitude: 72.8273,
            type: 'ward',
            ward_id: 'K_WEST'
        },
        {
            name: 'Bandra West',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            latitude: 19.0596,
            longitude: 72.8295,
            type: 'ward',
            ward_id: 'H_WEST'
        },
        {
            name: 'Worli',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            latitude: 19.0176,
            longitude: 72.8174,
            type: 'ward',
            ward_id: 'G_SOUTH'
        },
        {
            name: 'Chembur',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            latitude: 19.0522,
            longitude: 72.8995,
            type: 'ward',
            ward_id: 'M_WEST'
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

    // 2. Create AQI Readings (Recent)
    const readings = [];
    const now = new Date();

    for (const loc of insertedLocations) {
        // High AQI for some to show in critical areas
        const aqiBase = loc.name === 'Chembur' || loc.name === 'Worli' ? 350 : 150;

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

    // 3. Create Pollution Sources
    const sources = [
        {
            location_id: insertedLocations[4].id, // Chembur
            source_type: 'industrial',
            confidence_score: 0.85,
            detected_at: now.toISOString()
        },
        {
            location_id: insertedLocations[1].id, // Andheri
            source_type: 'traffic',
            confidence_score: 0.92,
            detected_at: now.toISOString()
        },
        {
            location_id: insertedLocations[3].id, // Worli
            source_type: 'construction',
            confidence_score: 0.78,
            detected_at: now.toISOString()
        }
    ];

    const { error: sourceError } = await supabase.from('pollution_sources').insert(sources);
    if (sourceError) console.error('Error seeding sources:', sourceError);
    else console.log('Inserted pollution sources.');

    // 4. Create a Policy Recommendation
    const recommendation = {
        location_id: insertedLocations[4].id,
        trigger_source: 'Critical PM2.5 Levels',
        severity: 'critical',
        anomaly_summary: 'Industrial cluster in Chembur showing sustained high emission levels above threshold.',
        recommendation_text: JSON.stringify({
            headline: 'Immediate Industrial Emission Control',
            immediateActions: [
                'Halt operations in Sector-4 industrial units for 6 hours.',
                'Deploy mobile water mist cannons across Chembur ward.',
                'Issue health advisory for susceptible populations.'
            ]
        }),
        status: 'pending'
    };

    const { error: recError } = await supabase.from('policy_recommendations').insert(recommendation);
    if (recError) console.error('Error seeding recommendation:', recError);
    else console.log('Inserted policy recommendation.');

    console.log('Seeding complete!');
}

seed();
