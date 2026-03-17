
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const additionalCities = [
    { city: "Ahmedabad", country: "India", latitude: 23.02579, longitude: 72.58727, name: "Ahmedabad Main Center", state: "Gujarat", type: "city", ward_id: "AHME" },
    { city: "Surat", country: "India", latitude: 21.19594, longitude: 72.83023, name: "Surat Main Center", state: "Gujarat", type: "city", ward_id: "SURA" },
    { city: "Jaipur", country: "India", latitude: 26.91962, longitude: 75.78781, name: "Jaipur Main Center", state: "Rajasthan", type: "city", ward_id: "JAIP" },
    { city: "Lucknow", country: "India", latitude: 26.83928, longitude: 80.92313, name: "Lucknow Main Center", state: "Uttar Pradesh", type: "city", ward_id: "LUCK" },
    { city: "Kanpur", country: "India", latitude: 26.46523, longitude: 80.34975, name: "Kanpur Main Center", state: "Uttar Pradesh", type: "city", ward_id: "KANP" },
    { city: "Nagpur", country: "India", latitude: 21.14631, longitude: 79.08491, name: "Nagpur Main Center", state: "Maharashtra", type: "city", ward_id: "NAGP" },
    { city: "Indore", country: "India", latitude: 22.71792, longitude: 75.8333, name: "Indore Main Center", state: "Madhya Pradesh", type: "city", ward_id: "INDO" },
    { city: "Thane", country: "India", latitude: 19.18333, longitude: 72.96667, name: "Thane Main Center", state: "Maharashtra", type: "city", ward_id: "THAN" },
    { city: "Bhopal", country: "India", latitude: 23.25469, longitude: 77.40289, name: "Bhopal Main Center", state: "Madhya Pradesh", type: "city", ward_id: "BHOP" },
    { city: "Visakhapatnam", country: "India", latitude: 17.68009, longitude: 83.20161, name: "Visakhapatnam Main Center", state: "Andhra Pradesh", type: "city", ward_id: "VISA" },
    { city: "Pimpri-Chinchwad", country: "India", latitude: 18.62292, longitude: 73.80696, name: "Pimpri-Chinchwad Main Center", state: "Maharashtra", type: "city", ward_id: "PIMP" },
    { city: "Patna", country: "India", latitude: 25.59408, longitude: 85.13563, name: "Patna Main Center", state: "Bihar", type: "city", ward_id: "PATN" },
    { city: "Vadodara", country: "India", latitude: 22.29941, longitude: 73.20812, name: "Vadodara Main Center", state: "Gujarat", type: "city", ward_id: "VADO" },
    { city: "Ghaziabad", country: "India", latitude: 28.66535, longitude: 77.43915, name: "Ghaziabad Main Center", state: "Uttar Pradesh", type: "city", ward_id: "GHAZ" },
    { city: "Ludhiana", country: "India", latitude: 30.91204, longitude: 75.85379, name: "Ludhiana Main Center", state: "Punjab", type: "city", ward_id: "LUDH" },
    { city: "Agra", country: "India", latitude: 27.17667, longitude: 78.00807, name: "Agra Main Center", state: "Uttar Pradesh", type: "city", ward_id: "AGRA" },
    { city: "Nashik", country: "India", latitude: 19.99727, longitude: 73.79096, name: "Nashik Main Center", state: "Maharashtra", type: "city", ward_id: "NASH" },
    { city: "Faridabad", country: "India", latitude: 28.41124, longitude: 77.31316, name: "Faridabad Main Center", state: "Haryana", type: "city", ward_id: "FARI" },
    { city: "Meerut", country: "India", latitude: 28.98002, longitude: 77.70636, name: "Meerut Main Center", state: "Uttar Pradesh", type: "city", ward_id: "MEER" },
    { city: "Rajkot", country: "India", latitude: 22.29161, longitude: 70.79322, name: "Rajkot Main Center", state: "Gujarat", type: "city", ward_id: "RAJK" },
    { city: "Kalyan-Dombivli", country: "India", latitude: 19.24, longitude: 73.13, name: "Kalyan-Dombivli Main Center", state: "Maharashtra", type: "city", ward_id: "KALY" },
    { city: "Vasai-Virar", country: "India", latitude: 19.46, longitude: 72.79, name: "Vasai-Virar Main Center", state: "Maharashtra", type: "city", ward_id: "VASA" },
    { city: "Varanasi", country: "India", latitude: 25.31668, longitude: 83.01041, name: "Varanasi Main Center", state: "Uttar Pradesh", type: "city", ward_id: "VARA" },
    { city: "Srinagar", country: "India", latitude: 34.08565, longitude: 74.80555, name: "Srinagar Main Center", state: "Jammu and Kashmir", type: "city", ward_id: "SRIN" },
    { city: "Aurangabad", country: "India", latitude: 19.87757, longitude: 75.34226, name: "Aurangabad Main Center", state: "Maharashtra", type: "city", ward_id: "AURA" },
    { city: "Dhanbad", country: "India", latitude: 23.79876, longitude: 86.43518, name: "Dhanbad Main Center", state: "Jharkhand", type: "city", ward_id: "DHAN" },
    { city: "Amritsar", country: "India", latitude: 31.63389, longitude: 74.87256, name: "Amritsar Main Center", state: "Punjab", type: "city", ward_id: "AMRI" },
    { city: "Navi Mumbai", country: "India", latitude: 19.03681, longitude: 73.01582, name: "Navi Mumbai Main Center", state: "Maharashtra", type: "city", ward_id: "NAVI" },
    { city: "Allahabad", country: "India", latitude: 25.43545, longitude: 81.84656, name: "Allahabad Main Center", state: "Uttar Pradesh", type: "city", ward_id: "ALLA" },
    { city: "Howrah", country: "India", latitude: 22.59, longitude: 88.31, name: "Howrah Main Center", state: "West Bengal", type: "city", ward_id: "HOWR" },
    { city: "Ranchi", country: "India", latitude: 23.34316, longitude: 85.3094, name: "Ranchi Main Center", state: "Jharkhand", type: "city", ward_id: "RANC" },
    { city: "Jabalpur", country: "India", latitude: 23.16697, longitude: 79.95006, name: "Jabalpur Main Center", state: "Madhya Pradesh", type: "city", ward_id: "JABA" },
    { city: "Gwalior", country: "India", latitude: 26.2183, longitude: 78.17463, name: "Gwalior Main Center", state: "Madhya Pradesh", type: "city", ward_id: "GWAL" },
    { city: "Coimbatore", country: "India", latitude: 11.00555, longitude: 76.96612, name: "Coimbatore Main Center", state: "Tamil Nadu", type: "city", ward_id: "COIM" },
    { city: "Vijayawada", country: "India", latitude: 16.50745, longitude: 80.64084, name: "Vijayawada Main Center", state: "Andhra Pradesh", type: "city", ward_id: "VIJA" },
    { city: "Jodhpur", country: "India", latitude: 26.26841, longitude: 73.00594, name: "Jodhpur Main Center", state: "Rajasthan", type: "city", ward_id: "JODH" },
    { city: "Madurai", country: "India", latitude: 9.9185, longitude: 78.11951, name: "Madurai Main Center", state: "Tamil Nadu", type: "city", ward_id: "MADU" },
    { city: "Raipur", country: "India", latitude: 21.23333, longitude: 81.63333, name: "Raipur Main Center", state: "Chhattisgarh", type: "city", ward_id: "RAIP" },
    { city: "Kota", country: "India", latitude: 25.18254, longitude: 75.83907, name: "Kota Main Center", state: "Rajasthan", type: "city", ward_id: "KOTA" },
    { city: "Guwahati", country: "India", latitude: 26.1438, longitude: 91.73809, name: "Guwahati Main Center", state: "Assam", type: "city", ward_id: "GUWA" },
    { city: "Chandigarh", country: "India", latitude: 30.73331, longitude: 76.77941, name: "Chandigarh Main Center", state: "Chandigarh", type: "city", ward_id: "CHAN" },
    { city: "Solapur", country: "India", latitude: 17.67152, longitude: 75.91044, name: "Solapur Main Center", state: "Maharashtra", type: "city", ward_id: "SOLA" },
    { city: "Hubli-Dharwad", country: "India", latitude: 15.36491, longitude: 75.13724, name: "Hubli-Dharwad Main Center", state: "Karnataka", type: "city", ward_id: "HUBL" },
    { city: "Tiruchirappalli", country: "India", latitude: 10.82541, longitude: 78.68714, name: "Tiruchirappalli Main Center", state: "Tamil Nadu", type: "city", ward_id: "TIRU" },
    { city: "Tiruppur", country: "India", latitude: 11.10777, longitude: 77.34111, name: "Tiruppur Main Center", state: "Tamil Nadu", type: "city", ward_id: "TPUR" },
    { city: "Moradabad", country: "India", latitude: 28.83893, longitude: 78.77684, name: "Moradabad Main Center", state: "Uttar Pradesh", type: "city", ward_id: "MORA" },
    { city: "Mysore", country: "India", latitude: 12.29791, longitude: 76.63925, name: "Mysore Main Center", state: "Karnataka", type: "city", ward_id: "MYSO" },
    { city: "Bareilly", country: "India", latitude: 28.36421, longitude: 79.42307, name: "Bareilly Main Center", state: "Uttar Pradesh", type: "city", ward_id: "BARE" },
    { city: "Gurgaon", country: "India", latitude: 28.45894, longitude: 77.02663, name: "Gurgaon Main Center", state: "Haryana", type: "city", ward_id: "GURG" },
    { city: "Aligarh", country: "India", latitude: 27.88145, longitude: 78.0801, name: "Aligarh Main Center", state: "Uttar Pradesh", type: "city", ward_id: "ALIG" },
    { city: "Bhubaneswar", country: "India", latitude: 20.2961, longitude: 85.8245, name: "Bhubaneswar Main Center", state: "Odisha", type: "city", ward_id: "BHUB" },
    { city: "Rourkela", country: "India", latitude: 22.2270, longitude: 84.8536, name: "Rourkela Main Center", state: "Odisha", type: "city", ward_id: "ROUR" },
    { city: "Cuttack", country: "India", latitude: 20.4625, longitude: 85.8830, name: "Cuttack Main Center", state: "Odisha", type: "city", ward_id: "CUTT" },
    { city: "Sambalpur", country: "India", latitude: 21.4669, longitude: 83.9812, name: "Sambalpur Main Center", state: "Odisha", type: "city", ward_id: "SAMB" }
];

async function seed() {
    console.log('Cleaning up existing city data...');
    const { error: deleteError } = await supabase
        .from('locations')
        .delete()
        .eq('type', 'city');

    if (deleteError) {
        console.error('Error during cleanup:', deleteError);
    }

    console.log(`Seeding ${additionalCities.length} additional Indian cities...`);

    const { data: insertedLocations, error: locError } = await supabase
        .from('locations')
        .insert(additionalCities)
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
        // Randomly assign AQI base between 50 and 350
        const aqiBase = 50 + Math.random() * 300;

        for (let i = 0; i < 24; i++) {
            const time = new Date(now.getTime() - i * 3600000);
            readings.push({
                location_id: loc.id,
                aqi_value: Math.max(0, aqiBase + (Math.random() - 0.5) * 60),
                pm25: aqiBase * 0.6 + (Math.random() - 0.5) * 30,
                pm10: aqiBase * 1.2 + (Math.random() - 0.5) * 40,
                source: 'iot',
                recorded_at: time.toISOString()
            });
        }
    }

    // Insert in chunks to avoid payload size limits if many readings
    const chunkSize = 500;
    for (let i = 0; i < readings.length; i += chunkSize) {
        const chunk = readings.slice(i, i + chunkSize);
        const { error: aqiError } = await supabase.from('aqi_readings').insert(chunk);
        if (aqiError) {
            console.error(`Error seeding readings (chunk ${i}):`, aqiError);
        }
    }

    console.log(`Inserted ${readings.length} AQI readings across ${insertedLocations.length} cities.`);
    console.log('Additional cities seeding complete!');
}

seed();
