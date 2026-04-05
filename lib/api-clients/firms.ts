import { cacheGet, cacheSet } from '../cache';

export interface FireHotspot {
    latitude: number;
    longitude: number;
    brightness: number;        // Brightness temperature (Kelvin) — MODIS
    bright_t31: number;        // Channel 31 brightness temp — MODIS
    bright_ti4: number;        // VIIRS I-4 channel brightness temp
    bright_ti5: number;        // VIIRS I-5 channel brightness temp
    scan: number;              // Pixel size in km (along scan)
    track: number;             // Pixel size in km (along track)
    acq_date: string;          // Acquisition date YYYY-MM-DD
    acq_time: string;          // Acquisition time HHMM UTC
    satellite: 'Terra' | 'Aqua' | 'NOAA-20' | 'NOAA-21' | 'Suomi-NPP';
    instrument: 'MODIS' | 'VIIRS';
    confidence: 'low' | 'nominal' | 'high' | number; // VIIRS uses text, MODIS uses 0-100
    version: string;
    frp: number;               // Fire Radiative Power in MW — key intensity metric
    daynight: 'D' | 'N';
    distanceKm?: number;       // Added by our code — distance from the queried point
    windBearing?: number;      // Added by our code — bearing from fire to target location
}

export interface FIRMSQueryResult {
    hotspots: FireHotspot[];
    queryBbox: BoundingBox;
    queriedAt: Date;
    source: 'VIIRS_SNPP_NRT' | 'VIIRS_NOAA20_NRT' | 'MODIS_NRT';
    totalCount: number;
    highConfidenceCount: number;
}

export interface BoundingBox {
    minLat: number; minLon: number;
    maxLat: number; maxLon: number;
}

export interface FireRiskAssessment {
    hasUpwindFire: boolean;
    nearestFireDistanceKm: number | null;
    nearestFireFRP: number | null;         // Fire Radiative Power of nearest fire
    upwindFireCount: number;
    totalFiresInRegion: number;
    smokeImpactScore: number;              // 0–10 score we compute
    dominantWindDirection: number;         // degrees
    hotspots: FireHotspot[];
    riskLevel: 'none' | 'low' | 'moderate' | 'high' | 'critical';
    riskSummary: string;                   // Human-readable summary string
}

export class FIRMSTooManyResultsError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FIRMSTooManyResultsError';
    }
}

export class FIRMSInvalidApiKeyError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'FIRMSInvalidApiKeyError';
    }
}

/**
 * Fetch fire hotspots within a bounding box for a given number of days back.
 */
export async function fetchFireHotspots(
    bbox: BoundingBox,
    daysBack: number = 2,
    source: 'VIIRS_SNPP_NRT' | 'VIIRS_NOAA20_NRT' | 'MODIS_NRT' = 'VIIRS_SNPP_NRT'
): Promise<FIRMSQueryResult> {
    const cacheKey = `firms:${source}:${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}:${daysBack}`;
    const cached = cacheGet<FIRMSQueryResult>(cacheKey);
    if (cached) return cached;

    const apiKey = process.env.NASA_FIRMS_API_KEY;
    if (!apiKey || /your_|changeme|paste/i.test(apiKey)) {
        throw new Error('NASA_FIRMS_API_KEY is not defined in environment variables');
    }

    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/${source}/${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}/${daysBack}`;

    let responseBody = '';
    let retries = 2;
    let backoff = 1000;

    while (retries >= 0) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            responseBody = await response.text();

            if (!response.ok) {
                if (responseBody.includes('Invalid MAP_KEY')) {
                    throw new FIRMSInvalidApiKeyError('Invalid NASA_FIRMS_API_KEY. Please verify your FIRMS MAP_KEY in environment variables.');
                }
                throw new Error(`FIRMS API returned ${response.status}: ${responseBody}`);
            }

            if (responseBody.includes('Sorry, too many results')) {
                throw new FIRMSTooManyResultsError('FIRMS API returned too many results. Try reducing the bounding box or daysBack.');
            }

            break;
        } catch (error) {
            if (error instanceof FIRMSTooManyResultsError || error instanceof FIRMSInvalidApiKeyError) throw error;
            if (retries === 0) {
                throw new Error(`Failed to fetch FIRMS data after retries: ${(error as Error).message}`);
            }
            console.warn(`FIRMS fetch failed, retrying in ${backoff}ms...`, error);
            await new Promise(resolve => setTimeout(resolve, backoff));
            retries--;
            backoff *= 2;
        }
    }

    const hotspots = parseFirmsCsv(responseBody);

    let highConfidenceCount = 0;
    for (const h of hotspots) {
        if (h.instrument === 'VIIRS') {
            if (h.confidence === 'high') highConfidenceCount++;
        } else {
            if (Number(h.confidence) > 70) highConfidenceCount++;
        }
    }

    const result: FIRMSQueryResult = {
        hotspots,
        queryBbox: bbox,
        queriedAt: new Date(),
        source,
        totalCount: hotspots.length,
        highConfidenceCount
    };

    // Cache for 60 minutes (TTL in seconds)
    cacheSet(cacheKey, result, 60 * 60);

    return result;
}

/**
 * Fetch hotspots around a specific point within a radius.
 */
export async function fetchFiresNearPoint(
    lat: number,
    lon: number,
    radiusKm: number = 300,
    daysBack: number = 2
): Promise<FIRMSQueryResult> {
    const latOffset = radiusKm / 111;
    const lonOffset = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

    const bbox: BoundingBox = {
        minLat: lat - latOffset,
        maxLat: lat + latOffset,
        minLon: lon - lonOffset,
        maxLon: lon + lonOffset
    };

    let result = await fetchFireHotspots(bbox, daysBack, 'VIIRS_SNPP_NRT');

    // Fallback to MODIS if VIIRS returns nothing
    if (result.hotspots.length === 0) {
        result = await fetchFireHotspots(bbox, daysBack, 'MODIS_NRT');
    }

    result.hotspots = result.hotspots.map(h => ({
        ...h,
        distanceKm: haversineDistance(lat, lon, h.latitude, h.longitude),
        windBearing: bearingFromTo(h.latitude, h.longitude, lat, lon)
    }));

    result.hotspots.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

    return result;
}

/**
 * Assess fire risk and smoke impact.
 */
export async function assessFireRisk(
    lat: number,
    lon: number,
    windDirectionDeg: number,
    windSpeedKmh: number,
    daysBack: number = 2,
    preFetchedHotspots?: FireHotspot[]
): Promise<FireRiskAssessment> {
    const hotspots = preFetchedHotspots
        ? preFetchedHotspots.map(h => ({
            ...h,
            distanceKm: haversineDistance(lat, lon, h.latitude, h.longitude),
            windBearing: bearingFromTo(h.latitude, h.longitude, lat, lon)
        })).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0))
        : (await fetchFiresNearPoint(lat, lon, 500, daysBack)).hotspots;

    const upwindHotspots = hotspots.filter(h => {
        const diff = angularDifference(h.windBearing || 0, windDirectionDeg);
        return Math.abs(diff) < 45;
    });

    // Risk logic
    let smokeImpactScore = 0;
    let upwindHighConfidence = 0;
    let totalFRP = 0;

    for (const h of upwindHotspots) {
        const isHighConf = h.instrument === 'VIIRS' ? h.confidence === 'high' : Number(h.confidence) > 70;
        if (isHighConf) upwindHighConfidence++;

        // Base contribution from presence (cap at 5)
        let contribution = 1;

        // FRP weight (FRP > 100MW scores higher)
        if (h.frp > 100) contribution *= 1.5;
        if (h.frp > 500) contribution *= 2;

        // Distance weight (closer = higher impact)
        const distWeight = 1 - ((h.distanceKm || 0) / 500);
        contribution *= distWeight;

        smokeImpactScore += contribution;
        totalFRP += h.frp;
    }

    // Factor in base score (up to 5)
    const baseScore = Math.min(5, upwindHighConfidence);
    smokeImpactScore = (smokeImpactScore * 0.7) + (baseScore * 0.3);

    // Wind speed weight (higher wind = faster transport)
    // Assume 15km/h is "baseline"
    const windWeight = Math.min(2, windSpeedKmh / 15);
    smokeImpactScore *= windWeight;

    // Normalize to 0-10
    smokeImpactScore = Math.min(10, smokeImpactScore);

    let riskLevel: FireRiskAssessment['riskLevel'] = 'none';
    if (smokeImpactScore > 7.0) riskLevel = 'critical';
    else if (smokeImpactScore > 4.5) riskLevel = 'high';
    else if (smokeImpactScore > 2.0) riskLevel = 'moderate';
    else if (smokeImpactScore > 0) riskLevel = 'low';

    const nearestFire = hotspots.length > 0 ? hotspots[0] : null;

    let riskSummary = "No active fires detected within 500km.";
    if (riskLevel !== 'none' && nearestFire) {
        const dist = Math.round(nearestFire.distanceKm || 0);
        const dir = degreesToCardinal(nearestFire.windBearing || 0);

        switch (riskLevel) {
            case 'low':
                riskSummary = `Minor fire activity detected ${dist}km to the ${dir}. Limited smoke impact expected.`;
                break;
            case 'moderate':
                riskSummary = `${upwindHotspots.length} fires active within ${dist}km upwind. Moderate smoke transport possible.`;
                break;
            case 'high':
                riskSummary = `Significant fire cluster detected ${dist}km ${dir} with FRP ${Math.round(nearestFire.frp)}MW. Smoke plume likely reaching this area.`;
                break;
            case 'critical':
                riskSummary = `Multiple large fires (${Math.round(totalFRP)}MW total FRP) directly upwind. Severe smoke impact expected. Emergency advisory warranted.`;
                break;
        }
    }

    return {
        hasUpwindFire: upwindHotspots.length > 0,
        nearestFireDistanceKm: nearestFire ? nearestFire.distanceKm || null : null,
        nearestFireFRP: nearestFire ? nearestFire.frp : null,
        upwindFireCount: upwindHotspots.length,
        totalFiresInRegion: hotspots.length,
        smokeImpactScore,
        dominantWindDirection: windDirectionDeg,
        hotspots: upwindHotspots,
        riskLevel,
        riskSummary
    };
}

// Helpers

function parseFirmsCsv(csv: string): FireHotspot[] {
    const lines = csv.trim().split('\n');
    if (lines.length <= 1) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const headerMap: Record<string, number> = {};
    headers.forEach((header, index) => {
        headerMap[header] = index;
    });

    return lines.slice(1).map(line => {
        const cols = line.split(',');
        const get = (key: string) => cols[headerMap[key]]?.trim();

        return {
            latitude: parseFloat(get('latitude')),
            longitude: parseFloat(get('longitude')),
            brightness: parseFloat(get('brightness') || '0'),
            bright_t31: parseFloat(get('bright_t31') || '0'),
            bright_ti4: parseFloat(get('bright_ti4') || '0'),
            bright_ti5: parseFloat(get('bright_ti5') || '0'),
            scan: parseFloat(get('scan')),
            track: parseFloat(get('track')),
            acq_date: get('acq_date'),
            acq_time: get('acq_time'),
            satellite: get('satellite') as FireHotspot['satellite'],
            instrument: (get('instrument') || (headerMap['bright_ti4'] !== undefined ? 'VIIRS' : 'MODIS')) as FireHotspot['instrument'],
            confidence: (isNaN(Number(get('confidence'))) ? get('confidence') : Number(get('confidence'))) as FireHotspot['confidence'],
            version: get('version'),
            frp: parseFloat(get('frp')),
            daynight: get('daynight') as FireHotspot['daynight']
        };
    });
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function bearingFromTo(fromLat: number, fromLon: number, toLat: number, toLon: number): number {
    const fLat = fromLat * Math.PI / 180;
    const fLon = fromLon * Math.PI / 180;
    const tLat = toLat * Math.PI / 180;
    const tLon = toLon * Math.PI / 180;

    const y = Math.sin(tLon - fLon) * Math.cos(tLat);
    const x = Math.cos(fLat) * Math.sin(tLat) -
        Math.sin(fLat) * Math.cos(tLat) * Math.cos(tLon - fLon);
    const brng = Math.atan2(y, x) * 180 / Math.PI;
    return (brng + 360) % 360;
}

function angularDifference(a: number, b: number): number {
    let diff = a - b;
    while (diff < -180) diff += 360;
    while (diff > 180) diff -= 360;
    return diff;
}

export function degreesToCardinal(deg: number): string {
    const cardinals = [
        'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
        'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
    ];
    const index = Math.round(deg / 22.5) % 16;
    return cardinals[index];
}
