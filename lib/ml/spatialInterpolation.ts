export interface KnownPoint {
    lat: number;
    lon: number;
    aqi: number;
    weight?: number; // Optional weight for the given point's significance
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

/**
 * Calculates the Haversine distance in kilometers between two lat/lon pairs.
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in kilometers
}

/**
 * Applies classic Inverse Distance Weighting (IDW) to estimate AQI at a given unknown point.
 * Matches points closer than 0.1km automatically to return their native value.
 */
export function inverseDistanceWeighting(
    unknownLat: number,
    unknownLon: number,
    knownPoints: KnownPoint[],
    power: number = 2
): number {
    if (!knownPoints || knownPoints.length === 0) return NaN;

    let sumWeights = 0;
    let sumAqiWeights = 0;

    for (const point of knownPoints) {
        const distance = haversineDistance(unknownLat, unknownLon, point.lat, point.lon);

        // Exact or near-exact match override
        if (distance <= 0.1) {
            return point.aqi;
        }

        const weight = 1 / Math.pow(distance, power);
        const customWeight = point.weight !== undefined ? point.weight : 1;

        sumWeights += weight * customWeight;
        sumAqiWeights += (weight * customWeight) * point.aqi;
    }

    return sumWeights === 0 ? NaN : sumAqiWeights / sumWeights;
}

/**
 * Evaluates interpolation confidence iteratively based on the presence of proximal known nodes.
 */
function evaluateConfidence(lat: number, lon: number, knownPoints: KnownPoint[]): 'HIGH' | 'MEDIUM' | 'LOW' {
    let countWithin5km = 0;

    for (const point of knownPoints) {
        const distance = haversineDistance(lat, lon, point.lat, point.lon);
        if (distance <= 5.0) {
            countWithin5km++;
        }
    }

    if (countWithin5km >= 3) return 'HIGH';
    if (countWithin5km >= 1) return 'MEDIUM';
    return 'LOW';
}

/**
 * Automatically calculates bounding coordinate logic and populates an array of 
 * GridCells across that map plane using IDW interpolation.
 */
export function generateInterpolatedGrid(
    boundingBox: BBox,
    knownPoints: KnownPoint[],
    gridResolution: number
): InterpolatedGrid {
    const cells: GridCell[] = [];

    // Iterate across the bounding box bounding box
    // Resolution correlates approx functionally to grid steps (e.g. 0.01 = ~1km squares)
    for (let lat = boundingBox.minLat; lat <= boundingBox.maxLat; lat += gridResolution) {
        for (let lon = boundingBox.minLon; lon <= boundingBox.maxLon; lon += gridResolution) {

            const estimatedAqi = inverseDistanceWeighting(lat, lon, knownPoints, 2);

            // If we don't have enough data to get a mathematical estimate, throw skip
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
