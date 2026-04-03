import { NextRequest, NextResponse } from 'next/server';
import { generateInterpolatedGrid, KnownPoint, BBox } from '@/lib/ml/spatialInterpolation';
import { isRateLimited } from '@/lib/api/rateLimit';

const INDIA_CITY_POINTS: KnownPoint[] = [
    // North India - High pollution belt
    { lat: 28.6139, lon: 77.2090, aqi: 280 }, // Delhi
    { lat: 28.4595, lon: 77.0266, aqi: 265 }, // Gurgaon
    { lat: 28.6692, lon: 77.4538, aqi: 270 }, // Ghaziabad
    { lat: 26.8467, lon: 80.9462, aqi: 220 }, // Lucknow
    { lat: 25.3176, lon: 82.9739, aqi: 210 }, // Varanasi
    { lat: 27.1767, lon: 78.0081, aqi: 195 }, // Agra
    { lat: 26.4499, lon: 80.3319, aqi: 185 }, // Kanpur
    { lat: 24.5854, lon: 73.7125, aqi: 140 }, // Udaipur
    { lat: 26.9124, lon: 75.7873, aqi: 160 }, // Jaipur
    { lat: 30.7333, lon: 76.7794, aqi: 175 }, // Chandigarh
    { lat: 31.1471, lon: 75.3412, aqi: 165 }, // Ludhiana
    { lat: 29.3909, lon: 76.9635, aqi: 180 }, // Panipat

    // East India
    { lat: 22.5726, lon: 88.3639, aqi: 160 }, // Kolkata
    { lat: 25.5941, lon: 85.1376, aqi: 190 }, // Patna
    { lat: 23.3441, lon: 85.3096, aqi: 145 }, // Ranchi
    { lat: 20.2961, lon: 85.8245, aqi: 120 }, // Bhubaneswar
    { lat: 26.1445, lon: 91.7362, aqi: 95 },  // Guwahati

    // West India
    { lat: 19.0760, lon: 72.8777, aqi: 145 }, // Mumbai
    { lat: 23.0225, lon: 72.5714, aqi: 155 }, // Ahmedabad
    { lat: 18.5204, lon: 73.8567, aqi: 120 }, // Pune
    { lat: 21.1702, lon: 72.8311, aqi: 110 }, // Surat
    { lat: 22.3072, lon: 73.1812, aqi: 105 }, // Vadodara
    { lat: 19.9975, lon: 73.7898, aqi: 100 }, // Nashik

    // South India - Lower pollution
    { lat: 12.9716, lon: 77.5946, aqi: 85 },  // Bangalore
    { lat: 13.0827, lon: 80.2707, aqi: 90 },  // Chennai
    { lat: 17.3850, lon: 78.4867, aqi: 110 }, // Hyderabad
    { lat: 9.9312,  lon: 76.2673, aqi: 55 },  // Kochi
    { lat: 8.5241,  lon: 76.9366, aqi: 45 },  // Thiruvananthapuram
    { lat: 11.0168, lon: 76.9558, aqi: 65 },  // Coimbatore
    { lat: 10.7905, lon: 78.7047, aqi: 70 },  // Tiruchirappalli
    { lat: 15.3173, lon: 75.7139, aqi: 75 },  // Hubli
    { lat: 16.5062, lon: 80.6480, aqi: 80 },  // Vijayawada
    { lat: 14.4426, lon: 79.9865, aqi: 85 },  // Nellore

    // Central India
    { lat: 23.2599, lon: 77.4126, aqi: 150 }, // Bhopal
    { lat: 22.7196, lon: 75.8577, aqi: 145 }, // Indore
    { lat: 21.1458, lon: 79.0882, aqi: 130 }, // Nagpur
    { lat: 21.2514, lon: 81.6296, aqi: 125 }, // Raipur

    // Northeast & Hills - Clean air
    { lat: 27.0238, lon: 74.2179, aqi: 60 },  // Ajmer
    { lat: 32.7266, lon: 74.8570, aqi: 55 },  // Jammu
    { lat: 34.0837, lon: 74.7973, aqi: 40 },  // Srinagar
    { lat: 31.1048, lon: 77.1734, aqi: 35 },  // Shimla
    { lat: 30.0668, lon: 79.0193, aqi: 30 },  // Uttarakhand hills
];

async function fetchReadingsInBBox(bbox: BBox): Promise<KnownPoint[]> {
    const buffer = 3.0;
    const filtered = INDIA_CITY_POINTS.filter(p =>
        p.lat >= bbox.minLat - buffer &&
        p.lat <= bbox.maxLat + buffer &&
        p.lon >= bbox.minLon - buffer &&
        p.lon <= bbox.maxLon + buffer
    );
    return filtered.length >= 3 ? filtered : INDIA_CITY_POINTS;
}

export async function GET(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
        return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
    try {
        const { searchParams } = new URL(request.url);
        const bboxParam = searchParams.get('bbox');
        const resolutionParam = searchParams.get('resolution');
        const resolution = resolutionParam ? parseFloat(resolutionParam) : 0.01;

        if (!bboxParam) {
            return NextResponse.json({ error: 'Missing required parameter: bbox' }, { status: 400 });
        }

        const bboxParts = bboxParam.split(',').map(parseFloat);
        if (bboxParts.length !== 4 || bboxParts.some(isNaN)) {
            return NextResponse.json({ error: 'Invalid bbox format. Expected: minLat,minLon,maxLat,maxLon' }, { status: 400 });
        }

        const bbox: BBox = {
            minLat: bboxParts[0],
            minLon: bboxParts[1],
            maxLat: bboxParts[2],
            maxLon: bboxParts[3],
        };

        const knownPoints = await fetchReadingsInBBox(bbox);
        const grid = generateInterpolatedGrid(bbox, knownPoints, resolution);

        const features = grid.cells.map(cell => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [cell.lon, cell.lat],
            },
            properties: {
                aqi: cell.estimatedAqi,
                confidence: cell.confidence,
            }
        }));

        const featureCollection = {
            type: 'FeatureCollection',
            features,
        };

        return NextResponse.json(featureCollection);
    } catch (error: Error | any) {
        console.error('Error in interpolate API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}