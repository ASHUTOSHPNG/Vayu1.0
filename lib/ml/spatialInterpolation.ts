export interface KnownPoint {
    lat: number;
    lon: number;
    aqi: number;
    weight?: number;
}
export interface GridCell {
    lat: number;
    lon: number;
    estimatedAqi: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}
export interface InterpolatedGrid {
    cells: GridCell[];
    resolution: number;
}
export interface BBox {
    minLat: number;
    minLon: number;
    maxLat: number;
    maxLon: number;
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function inverseDistanceWeighting(
    unknownLat: number,
    unknownLon: number,
    knownPoints: KnownPoint[],
    power: number = 3  // ✅ CHANGED: 2 → 3, reduces far-city bleed
): number {
    if (!knownPoints || knownPoints.length === 0) return NaN;

    // ✅ NEW: only use the 8 nearest points, ignore far cities
    const withDistances = knownPoints.map(point => ({
        point,
        distance: haversineDistance(unknownLat, unknownLon, point.lat, point.lon)
    }));
    withDistances.sort((a, b) => a.distance - b.distance);
    const nearest = withDistances.slice(0, 8);

    let sumWeights = 0;
    let sumAqiWeights = 0;

    for (const { point, distance } of nearest) {
        if (distance <= 0.1) return point.aqi;

        // ✅ NEW: max influence radius 600km — beyond that, ignore
        if (distance > 600) continue;

        const weight = 1 / Math.pow(distance, power);
        const customWeight = point.weight !== undefined ? point.weight : 1;
        sumWeights += weight * customWeight;
        sumAqiWeights += (weight * customWeight) * point.aqi;
    }

    return sumWeights === 0 ? NaN : sumAqiWeights / sumWeights;
}

function evaluateConfidence(lat: number, lon: number, knownPoints: KnownPoint[]): 'HIGH' | 'MEDIUM' | 'LOW' {
    let countWithin50km = 0;  // ✅ CHANGED: 5km → 50km (makes sense at country scale)
    for (const point of knownPoints) {
        const distance = haversineDistance(lat, lon, point.lat, point.lon);
        if (distance <= 50.0) countWithin50km++;
    }
    if (countWithin50km >= 3) return 'HIGH';
    if (countWithin50km >= 1) return 'MEDIUM';
    return 'LOW';
}

export function generateInterpolatedGrid(
    boundingBox: BBox,
    knownPoints: KnownPoint[],
    gridResolution: number
): InterpolatedGrid {
    const cells: GridCell[] = [];

    for (let lat = boundingBox.minLat; lat <= boundingBox.maxLat; lat += gridResolution) {
        for (let lon = boundingBox.minLon; lon <= boundingBox.maxLon; lon += gridResolution) {
            const estimatedAqi = inverseDistanceWeighting(lat, lon, knownPoints, 3);
            if (!isNaN(estimatedAqi)) {
                cells.push({
                    lat,
                    lon,
                    estimatedAqi: Math.round(estimatedAqi),
                    confidence: evaluateConfidence(lat, lon, knownPoints),
                });
            }
        }
    }
    return { cells, resolution: gridResolution };
}