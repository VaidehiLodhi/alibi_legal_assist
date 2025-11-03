import type { Position } from "../types/position";

// Ocean points across Indian and Pacific Ocean
// These represent various oceanographic monitoring stations, research points, and key locations
export const oceanPoints: Position[] = [
    // Indian Ocean - Arabian Sea
    { lat: 15.0, lng: 70.0 },
    { lat: 20.0, lng: 65.0 },
    { lat: 18.0, lng: 72.0 },
    { lat: 12.0, lng: 75.0 },
    { lat: 8.0, lng: 78.0 },

    // Indian Ocean - Bay of Bengal
    { lat: 15.0, lng: 85.0 },
    { lat: 12.0, lng: 88.0 },
    { lat: 8.0, lng: 90.0 },
    { lat: 5.0, lng: 92.0 },
    { lat: 2.0, lng: 95.0 },

    // Indian Ocean - Central and Southern
    { lat: 0.0, lng: 80.0 },
    { lat: -5.0, lng: 85.0 },
    { lat: -10.0, lng: 90.0 },
    { lat: -15.0, lng: 95.0 },
    { lat: -20.0, lng: 100.0 },

    // Pacific Ocean - Western Pacific
    { lat: 20.0, lng: 120.0 },
    { lat: 15.0, lng: 125.0 },
    { lat: 10.0, lng: 130.0 },
    { lat: 5.0, lng: 135.0 },
    { lat: 0.0, lng: 140.0 },

    // Pacific Ocean - Central Pacific
    { lat: 10.0, lng: 160.0 },
    { lat: 5.0, lng: 170.0 },
    { lat: 0.0, lng: 180.0 },
    { lat: -5.0, lng: -170.0 },
    { lat: -10.0, lng: -160.0 },

    // Pacific Ocean - Eastern Pacific
    { lat: 20.0, lng: -120.0 },
    { lat: 15.0, lng: -115.0 },
    { lat: 10.0, lng: -110.0 },
    { lat: 5.0, lng: -105.0 },
    { lat: 0.0, lng: -100.0 },

    // Pacific Ocean - Southern Pacific
    { lat: -20.0, lng: 160.0 },
    { lat: -25.0, lng: 170.0 },
    { lat: -30.0, lng: 180.0 },
    { lat: -35.0, lng: -170.0 },
    { lat: -40.0, lng: -160.0 },

    // Transition zones between oceans
    { lat: -10.0, lng: 110.0 },
    { lat: -5.0, lng: 115.0 },
    { lat: 0.0, lng: 120.0 },
    { lat: 5.0, lng: 125.0 },
    { lat: 10.0, lng: 130.0 }
];

// Additional metadata for each point (optional)
export const oceanPointMetadata = oceanPoints.map((point, index) => ({
    ...point,
    id: `ocean-point-${index + 1}`,
    region: getRegion(point),
    depth: getEstimatedDepth(point),
    description: getDescription(point)
}));

function getRegion(point: Position): string {
    const { lat, lng } = point;

    if (lng >= 60 && lng <= 100) {
        if (lat >= 0) return "Indian Ocean - Northern";
        return "Indian Ocean - Southern";
    } else if (lng >= 100 && lng <= 180) {
        if (lat >= 0) return "Pacific Ocean - Western";
        return "Pacific Ocean - Southwestern";
    } else if (lng >= -180 && lng <= -100) {
        if (lat >= 0) return "Pacific Ocean - Eastern";
        return "Pacific Ocean - Southeastern";
    } else if (lng >= 160 && lng <= 200) {
        return "Pacific Ocean - Central";
    }

    return "Transition Zone";
}

function getEstimatedDepth(point: Position): number {
    // Rough depth estimation based on ocean bathymetry
    const { lat, lng } = point;

    // Continental shelves are shallower
    if (Math.abs(lat) < 20 && ((lng > 60 && lng < 100) || (lng > 120 && lng < 160))) {
        return Math.random() * 200 + 50; // 50-250m
    }

    // Deep ocean basins
    return Math.random() * 4000 + 2000; // 2000-6000m
}

function getDescription(point: Position): string {
    const region = getRegion(point);
    const depth = getEstimatedDepth(point);

    return `${region} - Estimated depth: ${Math.round(depth)}m`;
}

