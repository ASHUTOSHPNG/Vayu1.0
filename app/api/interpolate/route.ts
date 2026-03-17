import { NextRequest, NextResponse } from 'next/server';
import { generateInterpolatedGrid, KnownPoint, BBox } from '@/lib/ml/spatialInterpolation';
import { isRateLimited } from '@/lib/api/rateLimit';
// import { createClient } from '@/lib/supabase/server'; // Will implement full Supabase client in later phase

// Mock Supabase fetch for demonstration purposes
async function fetchReadingsInBBox(bbox: BBox): Promise<KnownPoint[]> {
    // In a real implementation:
    // const supabase = createClient();
    // const { data } = await supabase.rpc('get_readings_in_bbox', { 
    //   min_lat: bbox.minLat, min_lon: bbox.minLon, max_lat: bbox.maxLat, max_lon: bbox.maxLon 
    // });

    // Generating a randomized cluster of 5 pseudo-known sensor locations 
    // scaled somewhat internally around the bounding box to test the logic.
    const knownPoints: KnownPoint[] = [];
    const latRange = bbox.maxLat - bbox.minLat;
    const lonRange = bbox.maxLon - bbox.minLon;

    for (let i = 0; i < 5; i++) {
        knownPoints.push({
            lat: bbox.minLat + Math.random() * latRange,
            lon: bbox.minLon + Math.random() * lonRange,
            aqi: Math.floor(40 + Math.random() * 200), // Random AQI 40-240
        });
    }

    return knownPoints;
}

export async function GET(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
        return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }
    try {
        const { searchParams } = new URL(request.url);
        const bboxParam = searchParams.get('bbox'); // ?bbox={minLat},{minLon},{maxLat},{maxLon}

        // Default to ~1km grids if resolution is not provided
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

        // 1. Fetch all known readings within this area over the last hour
        const knownPoints = await fetchReadingsInBBox(bbox);

        // 2. Run Spatial Interpolation 
        const grid = generateInterpolatedGrid(bbox, knownPoints, resolution);

        // 3. Map into GeoJSON FeatureCollection format for Mapbox GL
        const features = grid.cells.map(cell => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [cell.lon, cell.lat], // GeoJSON expects [lon, lat]
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
