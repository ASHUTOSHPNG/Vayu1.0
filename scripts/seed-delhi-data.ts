
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Seeding Delhi ward-level data...');

    // 1. Create Delhi Locations
    const locations = [
        {
            name: 'Connaught Place',
            city: 'Delhi',
            state: 'Delhi',
            country: 'India',
            latitude: 28.6304,
            longitude: 77.2177,
            type: 'ward',
            ward_id: 'NDMC_CP'
        },
        {
            name: 'Chanakyapuri',
            city: 'Delhi',
            state: 'Delhi',
            country: 'India',
            latitude: 28.5919,
            longitude: 77.1856,
            type: 'ward',
            ward_id: 'NDMC_CHAN'
        },
        {
            name: 'Dwarka',
            city: 'Delhi',
            state: 'Delhi',
            country: 'India',
            latitude: 28.5823,
            longitude: 77.0500,
            type: 'ward',
            ward_id: 'SDMC_DWAR'
        },
        {
            name: 'Okhla Industrial Area',
            city: 'Delhi',
            state: 'Delhi',
            country: 'India',
            latitude: 28.5287,
            longitude: 77.2721,
            type: 'ward',
            ward_id: 'SDMC_OKHL'
        },
        {
            name: 'Rohini',
            city: 'Delhi',
            state: 'Delhi',
            country: 'India',
            latitude: 28.7041,
            longitude: 77.1025,
            type: 'ward',
            ward_id: 'NDMC_ROHI'
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
        // High AQI for some to show in critical areas - Delhi generally has higher AQI
        const aqiBase = loc.name === 'Okhla Industrial Area' || loc.name === 'Rohini' ? 420 : 280;

        for (let i = 0; i < 24; i++) {
            const time = new Date(now.getTime() - i * 3600000);
            readings.push({
                location_id: loc.id,
                aqi_value: aqiBase + Math.random() * 80,
                pm25: aqiBase * 0.7,
                pm10: aqiBase * 1.3,
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
            location_id: insertedLocations[3].id, // Okhla
            source_type: 'industrial',
            confidence_score: 0.94,
            detected_at: now.toISOString()
        },
        {
            location_id: insertedLocations[0].id, // CP
            source_type: 'traffic',
            confidence_score: 0.88,
            detected_at: now.toISOString()
        },
        {
            location_id: insertedLocations[4].id, // Rohini
            source_type: 'construction',
            confidence_score: 0.82,
            detected_at: now.toISOString()
        }
    ];

    const { error: sourceError } = await supabase.from('pollution_sources').insert(sources);
    if (sourceError) console.error('Error seeding sources:', sourceError);
    else console.log('Inserted pollution sources.');

    // 4. Create a Policy Recommendation
    const recommendation = {
        location_id: insertedLocations[3].id,
        trigger_source: 'Severe Industrial Pollution',
        severity: 'critical',
        anomaly_summary: 'Extreme emission spikes detected in Okhla Phase-3 during morning hours.',
        recommendation_text: JSON.stringify({
            headline: 'Delhi GRAP Stage 4 Implementation',
            immediateActions: [
                'Ban entry of truck traffic into Delhi except for essential commodities.',
                'Shut down all industrial operations in Okhla Industrial Area for 12 hours.',
                'Transition all schools to online learning modes.',
                'Intensive sprinkling of water on roads via fire tenders.'
            ]
        }),
        status: 'pending'
    };

    const { error: recError } = await supabase.from('policy_recommendations').insert(recommendation);
    if (recError) console.error('Error seeding recommendation:', recError);
    else console.log('Inserted policy recommendation.');

    console.log('Seeding Delhi complete!');
}

seed();
