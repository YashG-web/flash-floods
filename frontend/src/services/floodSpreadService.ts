import type { LocationData, FlashFloodWarning } from '../types';

export type FloodSpreadStageKey = 'NOW' | '+30 MIN' | '+1 HR' | '+2 HR';

export interface FlowArrow {
  id: string;
  label: string; // e.g. "Flood spread direction →"
  sublabel: string; // e.g. "Downstream River Trunk"
  path: [number, number][];
  arrowheadAngle: number;
  color: string;
  flowVelocityKmh: string;
}

export interface FloodSpreadStage {
  key: FloodSpreadStageKey;
  label: string;
  timeOffsetMinutes: number;
  color: string;         // Yellow -> Orange -> Deep Orange -> Crimson Red
  fillColor: string;
  fillOpacity: number;
  severityLabel: 'MODERATE' | 'HIGH' | 'CRITICAL';
  severityBadgeColor: string;
  inundatedAreaKm2: number;
  inundatedHectares: number;
  depthRangeMeters: string;
  flowVelocityKmh: string;
  polygon: [number, number][];
  centroid: [number, number];
  flowArrows: FlowArrow[];
  secondaryAffectedVillages: string[];
  affectedCorridors: string[];
  description: string;
}

export interface FloodSpreadSimulation {
  targetLocationName: string;
  simulationSeverityScore: number;
  rainfallIntensityMmHr: number;
  soilMoisturePct: number;
  riverLevelM: number;
  stages: Record<FloodSpreadStageKey, FloodSpreadStage>;
  stageOrder: FloodSpreadStageKey[];
}

/**
 * Deterministically computes polygon centroid: [latitude, longitude]
 */
export function getCentroid(coords: [number, number][]): [number, number] {
  if (!coords || coords.length === 0) return [30.1040, 78.2830];
  let sumLat = 0;
  let sumLon = 0;
  for (const c of coords) {
    sumLat += c[0];
    sumLon += c[1];
  }
  return [sumLat / coords.length, sumLon / coords.length];
}

/**
 * Generates an organically curved, realistic hydrodynamic flood shape (smooth plume).
 * Simulates fluid spreading along the river valley topography (downstream elongation,
 * lateral channel confinement, and natural harmonic fluid lobes).
 * Completely eliminates any square, rectangular, or grid artifacts.
 */
export function generateRealisticFloodContour(
  center: [number, number],
  baseRadiusKm: number,
  scaleFactor: number,
  valleyHeadingDeg: number = 205, // Downstream river flow heading (South-Southwest)
  seedFactor: number = 1.0
): [number, number][] {
  const [cLat, cLon] = center;
  const numPoints = 42; // High-resolution smooth fluid boundary
  const flowRad = (valleyHeadingDeg * Math.PI) / 180;
  const rawCoords: [number, number][] = [];

  const effectiveRadius = baseRadiusKm * scaleFactor;

  for (let i = 0; i < numPoints; i++) {
    const theta = (i / numPoints) * 2 * Math.PI;

    // Hydrodynamic valley elongation: water surges downstream along valley axis
    const downstreamFactor = 1.0 + 0.65 * Math.cos(theta - flowRad);

    // Natural fluid wave lobes & riparian depressions
    const waveHarmonics =
      0.14 * Math.cos(2 * (theta - flowRad)) +
      0.08 * Math.sin(3 * theta + seedFactor) +
      0.04 * Math.cos(4 * theta);

    // Radius in km at angle theta
    const rKm = Math.max(0.08, effectiveRadius * (downstreamFactor + waveHarmonics));

    // Downstream gravity drift for the entire plume
    const driftLat = -0.00045 * (scaleFactor - 0.9);
    const driftLon = -0.00035 * (scaleFactor - 0.9);

    // Convert km offset to degrees
    const latOffset = (rKm * Math.cos(theta)) / 111.0 + driftLat;
    const lonOffset = (rKm * Math.sin(theta)) / (111.0 * Math.cos((cLat * Math.PI) / 180)) + driftLon;

    rawCoords.push([cLat + latOffset, cLon + lonOffset]);
  }

  // Smooth the points with 3-point rolling average for organic fluid curvature
  const smoothCoords: [number, number][] = [];
  const len = rawCoords.length;

  for (let i = 0; i < len; i++) {
    const prev = rawCoords[(i - 1 + len) % len];
    const curr = rawCoords[i];
    const next = rawCoords[(i + 1) % len];

    const sLat = prev[0] * 0.25 + curr[0] * 0.5 + next[0] * 0.25;
    const sLon = prev[1] * 0.25 + curr[1] * 0.5 + next[1] * 0.25;

    smoothCoords.push([parseFloat(sLat.toFixed(5)), parseFloat(sLon.toFixed(5))]);
  }

  return smoothCoords;
}

/**
 * Calculates deterministic, realistic flood spread stages for a selected VILLAGE.
 * Generates smooth, realistic hydrodynamic flood wave contours without grids or boxes.
 */
export function calculateFloodSpreadSimulation(
  location: LocationData,
  activeWarning?: FlashFloodWarning | null
): FloodSpreadSimulation {
  const rf = Number(location.rainfall ?? 85);
  const sm = Number(location.soil_moisture ?? 80);
  const riverLvl = Number(location.sensor_water_level ?? 3.8);

  // Normalized severity factor (0.15 - 1.0) derived deterministically from village telemetry
  const rainFactor = Math.min(1.0, Math.max(0.1, rf / 90));
  const soilFactor = Math.min(1.0, Math.max(0.1, sm / 95));
  const riverFactor = Math.min(1.0, Math.max(0.1, riverLvl / 5.0));

  const simulationSeverityScore = Math.round(
    (rainFactor * 0.5 + soilFactor * 0.35 + riverFactor * 0.15) * 100
  );

  const centroid = location.coordinates && location.coordinates.length === 2
    ? location.coordinates
    : getCentroid(location.polygon || []);
  const [cLat, cLon] = centroid;

  // Base footprint scale (in km) tailored to village valley geography
  const baseRadiusKm = 0.38 + (simulationSeverityScore / 100) * 0.22;
  const baseAreaKm2 = parseFloat((Math.PI * Math.pow(baseRadiusKm * 1.3, 2)).toFixed(2));
  const villageLabel = location.name.split('(')[0].trim();

  // STAGE 1: NOW (T = 0) - Initial Inundation
  // Color: Yellow = Approaching Risk
  const polyNow = generateRealisticFloodContour(centroid, baseRadiusKm, 0.95, 205, 1.1);
  const stageNow: FloodSpreadStage = {
    key: 'NOW',
    label: 'NOW (Initial Inundation)',
    timeOffsetMinutes: 0,
    color: '#eab308', // Yellow
    fillColor: '#fef08a',
    fillOpacity: 0.38,
    severityLabel: simulationSeverityScore >= 70 ? 'HIGH' : 'MODERATE',
    severityBadgeColor: simulationSeverityScore >= 70 ? 'bg-orange-500 text-white' : 'bg-yellow-500 text-slate-950',
    inundatedAreaKm2: parseFloat((baseAreaKm2 * 1.0).toFixed(2)),
    inundatedHectares: Math.round(baseAreaKm2 * 100),
    depthRangeMeters: '0.4 – 0.8 m',
    flowVelocityKmh: '8 – 12 km/h',
    polygon: polyNow,
    centroid: getCentroid(polyNow),
    flowArrows: [
      {
        id: 'arrow-downstream-now',
        label: 'Flood spread direction →',
        sublabel: `${villageLabel} River Channel`,
        path: [
          [cLat + 0.0015, cLon + 0.001],
          [cLat - 0.002, cLon - 0.001],
          [cLat - 0.005, cLon - 0.0025]
        ],
        arrowheadAngle: 205,
        color: '#eab308',
        flowVelocityKmh: '8 – 12 km/h'
      }
    ],
    secondaryAffectedVillages: [],
    affectedCorridors: [
      `${villageLabel} Lowland Riverbank`,
      'Ghat Access Trail',
      'Lower Terraced Cultivation'
    ],
    description: 'Initial river overtopping along the low-lying valley stream bed. Rapid surface runoff accumulating in natural depressions.'
  };

  // STAGE 2: +30 MIN (T = 30) - Expanding Floodwave
  // Color: Orange = Increasing Risk
  const area30m = parseFloat((baseAreaKm2 * 1.65).toFixed(2));
  const poly30m = generateRealisticFloodContour(centroid, baseRadiusKm, 1.45, 205, 1.4);
  const stage30Min: FloodSpreadStage = {
    key: '+30 MIN',
    label: '+30 MIN (Valley Runoff Expansion)',
    timeOffsetMinutes: 30,
    color: '#f97316', // Orange
    fillColor: '#fdba74',
    fillOpacity: 0.44,
    severityLabel: simulationSeverityScore >= 50 ? 'HIGH' : 'MODERATE',
    severityBadgeColor: 'bg-orange-500 text-white',
    inundatedAreaKm2: area30m,
    inundatedHectares: Math.round(area30m * 100),
    depthRangeMeters: '0.9 – 1.4 m',
    flowVelocityKmh: '14 – 18 km/h',
    polygon: poly30m,
    centroid: getCentroid(poly30m),
    flowArrows: [
      {
        id: 'arrow-downstream-30m',
        label: 'Flood spread direction →',
        sublabel: 'Downstream Riparian Corridor',
        path: [
          [cLat + 0.002, cLon + 0.001],
          [cLat - 0.003, cLon - 0.0015],
          [cLat - 0.0075, cLon - 0.0038]
        ],
        arrowheadAngle: 205,
        color: '#f97316',
        flowVelocityKmh: '14 – 18 km/h'
      }
    ],
    secondaryAffectedVillages: [],
    affectedCorridors: [
      `${villageLabel} Riverside Road Link`,
      'Lower Terraces & Homesteads',
      'Pedestrian Suspension Bridge Footing'
    ],
    description: 'Flood wave expanding down the valley floor. Water entering agricultural fields and lower residential habitations.'
  };

  // STAGE 3: +1 HR (T = 60) - Peak Catchment Surge
  // Color: Red-Orange = Severe Risk
  const area1h = parseFloat((baseAreaKm2 * 2.45).toFixed(2));
  const poly1h = generateRealisticFloodContour(centroid, baseRadiusKm, 2.05, 205, 1.8);
  const stage1Hr: FloodSpreadStage = {
    key: '+1 HR',
    label: '+1 HR (Peak Catchment Surge)',
    timeOffsetMinutes: 60,
    color: '#ea580c', // Deep Orange
    fillColor: '#fb923c',
    fillOpacity: 0.50,
    severityLabel: 'CRITICAL',
    severityBadgeColor: 'bg-red-600 text-white',
    inundatedAreaKm2: area1h,
    inundatedHectares: Math.round(area1h * 100),
    depthRangeMeters: '1.5 – 2.2 m',
    flowVelocityKmh: '20 – 26 km/h',
    polygon: poly1h,
    centroid: getCentroid(poly1h),
    flowArrows: [
      {
        id: 'arrow-downstream-1h',
        label: 'Flood spread direction →',
        sublabel: 'Main Valley Floodplain Surge',
        path: [
          [cLat + 0.0025, cLon + 0.0015],
          [cLat - 0.004, cLon - 0.002],
          [cLat - 0.010, cLon - 0.005]
        ],
        arrowheadAngle: 205,
        color: '#ea580c',
        flowVelocityKmh: '20 – 26 km/h'
      }
    ],
    secondaryAffectedVillages: [],
    affectedCorridors: [
      `${villageLabel} Central Valley Floor`,
      'Main Embankment Approach Road',
      'Secondary Drainage Sluice Outfall'
    ],
    description: 'High velocity flash flood surge occupying the full valley width. Lower road links impassable.'
  };

  // STAGE 4: +2 HR (T = 120) - Maximum Inundation Extent
  // Color: Red = Critical Threat
  const area2h = parseFloat((baseAreaKm2 * 3.3).toFixed(2));
  const poly2h = generateRealisticFloodContour(centroid, baseRadiusKm, 2.7, 205, 2.2);
  const stage2Hr: FloodSpreadStage = {
    key: '+2 HR',
    label: '+2 HR (Maximum Inundation Extent)',
    timeOffsetMinutes: 120,
    color: '#dc2626', // Red
    fillColor: '#f87171',
    fillOpacity: 0.55,
    severityLabel: 'CRITICAL',
    severityBadgeColor: 'bg-red-700 text-white',
    inundatedAreaKm2: area2h,
    inundatedHectares: Math.round(area2h * 100),
    depthRangeMeters: '2.2 – 3.4 m',
    flowVelocityKmh: '24 – 32 km/h',
    polygon: poly2h,
    centroid: getCentroid(poly2h),
    flowArrows: [
      {
        id: 'arrow-downstream-2h',
        label: 'Flood spread direction →',
        sublabel: 'Maximum Catchment Extent',
        path: [
          [cLat + 0.003, cLon + 0.002],
          [cLat - 0.005, cLon - 0.003],
          [cLat - 0.013, cLon - 0.007]
        ],
        arrowheadAngle: 205,
        color: '#dc2626',
        flowVelocityKmh: '24 – 32 km/h'
      }
    ],
    secondaryAffectedVillages: [],
    affectedCorridors: [
      `${villageLabel} Complete Riparian Lowland`,
      'Inter-Village Road Corridor',
      'Valley Bottom Settlement Zone'
    ],
    description: 'Peak hydrodynamic inundation envelope reached. Complete evacuation of valley floor required.'
  };

  return {
    targetLocationName: location.name,
    simulationSeverityScore,
    rainfallIntensityMmHr: rf,
    soilMoisturePct: sm,
    riverLevelM: riverLvl,
    stages: {
      'NOW': stageNow,
      '+30 MIN': stage30Min,
      '+1 HR': stage1Hr,
      '+2 HR': stage2Hr
    },
    stageOrder: ['NOW', '+30 MIN', '+1 HR', '+2 HR']
  };
}
