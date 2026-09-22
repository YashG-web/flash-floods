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
  secondaryAffectedWards: string[];
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
function getCentroid(coords: [number, number][]): [number, number] {
  if (!coords || coords.length === 0) return [30.0845, 78.2618];
  let sumLat = 0;
  let sumLon = 0;
  for (const c of coords) {
    sumLat += c[0];
    sumLon += c[1];
  }
  return [sumLat / coords.length, sumLon / coords.length];
}

/**
 * Deterministically expands a polygon outward from its centroid along the river valley gradient.
 * Vector bias towards the river valley (southwest / downstream, lower elevation).
 */
function expandPolygon(
  coords: [number, number][],
  scaleFactor: number,
  downstreamBias: number = 0.0003
): [number, number][] {
  const [cLat, cLon] = getCentroid(coords);
  return coords.map(([lat, lon]) => {
    // Distance from centroid
    const dLat = lat - cLat;
    const dLon = lon - cLon;

    // Downstream gravity bias (simulating water flowing towards river valley depression)
    const driftLat = -downstreamBias * (scaleFactor - 1.0);
    const driftLon = -downstreamBias * 0.8 * (scaleFactor - 1.0);

    const newLat = cLat + dLat * scaleFactor + driftLat;
    const newLon = cLon + dLon * scaleFactor + driftLon;

    return [parseFloat(newLat.toFixed(5)), parseFloat(newLon.toFixed(5))];
  });
}

/**
 * Calculates deterministic flood spread stages based on current simulation telemetry.
 * NO RANDOM NUMBERS: All values are mathematical functions of current rainfall, soil moisture,
 * river water level, and warning status.
 */
export function calculateFloodSpreadSimulation(
  location: LocationData,
  activeWarning?: FlashFloodWarning | null
): FloodSpreadSimulation {
  const rf = Number(location.rainfall ?? 85);
  const sm = Number(location.soil_moisture ?? 80);
  const riverLvl = Number(location.sensor_water_level ?? 3.8);

  // Normalized severity factor (0.15 - 1.0) derived deterministically from simulation state
  const rainFactor = Math.min(1.0, Math.max(0.1, rf / 90));
  const soilFactor = Math.min(1.0, Math.max(0.1, sm / 95));
  const riverFactor = Math.min(1.0, Math.max(0.1, riverLvl / 5.0));

  const simulationSeverityScore = Math.round(
    (rainFactor * 0.5 + soilFactor * 0.35 + riverFactor * 0.15) * 100
  );

  // Base polygon from location geometry
  const basePolygon: [number, number][] =
    location.polygon && location.polygon.length >= 3
      ? location.polygon
      : [
          [30.0820, 78.2580],
          [30.0860, 78.2590],
          [30.0870, 78.2660],
          [30.0840, 78.2670],
          [30.0810, 78.2620]
        ];

  // Base footprint scale
  const baseAreaKm2 = 0.55 + (simulationSeverityScore / 100) * 0.85;

  // Corridors in the catchment zone
  const isWarned = activeWarning && activeWarning.status !== 'NONE';
  const locationLabel = location.name.split('(')[0].trim();
  const [cLat, cLon] = getCentroid(basePolygon);

  // STAGE 1: NOW (T = 0) - Initial Inundation
  // Color: Yellow = Approaching Risk
  const polyNow = expandPolygon(basePolygon, 1.0);
  const stageNow: FloodSpreadStage = {
    key: 'NOW',
    label: 'NOW (Initial Inundation)',
    timeOffsetMinutes: 0,
    color: '#eab308', // Yellow
    fillColor: '#fef08a',
    fillOpacity: 0.35,
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
        sublabel: 'Downstream River Trunk',
        path: [
          [cLat + 0.001, cLon - 0.001],
          [cLat - 0.003, cLon + 0.001]
        ],
        arrowheadAngle: 160,
        color: '#eab308',
        flowVelocityKmh: '8 – 12 km/h'
      }
    ],
    secondaryAffectedWards: [],
    affectedCorridors: [
      `${locationLabel} River Ghat Terraces`,
      'Lower Embankment Steps',
      'Culvert Ingress #01'
    ],
    description: 'Initial water overtopping riverbank steps. Fast-moving surface sheet flow accumulating in lowest depressions.'
  };

  // STAGE 2: +30 MIN (T = 30) - Expanding Floodwave
  // Color: Orange = Increasing Risk
  const area30m = baseAreaKm2 * (1.65 + (rainFactor * 0.2));
  const poly30m = expandPolygon(basePolygon, 1.48);
  const stage30Min: FloodSpreadStage = {
    key: '+30 MIN',
    label: '+30 MIN (Valley Runoff Expansion)',
    timeOffsetMinutes: 30,
    color: '#f97316', // Orange
    fillColor: '#fdba74',
    fillOpacity: 0.45,
    severityLabel: simulationSeverityScore >= 50 ? 'HIGH' : 'MODERATE',
    severityBadgeColor: 'bg-orange-500 text-white',
    inundatedAreaKm2: parseFloat(area30m.toFixed(2)),
    inundatedHectares: Math.round(area30m * 100),
    depthRangeMeters: '0.9 – 1.4 m',
    flowVelocityKmh: '14 – 18 km/h',
    polygon: poly30m,
    centroid: getCentroid(poly30m),
    flowArrows: [
      {
        id: 'arrow-downstream-30m',
        label: 'Flood spread direction →',
        sublabel: 'Downstream River Trunk',
        path: [
          [cLat + 0.001, cLon - 0.001],
          [cLat - 0.003, cLon + 0.001],
          [cLat - 0.007, cLon + 0.003]
        ],
        arrowheadAngle: 160,
        color: '#f97316',
        flowVelocityKmh: '14 – 18 km/h'
      },
      {
        id: 'arrow-road-30m',
        label: 'Flood spread direction →',
        sublabel: 'Embankment Road Overspill',
        path: [
          [cLat, cLon],
          [cLat + 0.004, cLon + 0.005]
        ],
        arrowheadAngle: 45,
        color: '#f97316',
        flowVelocityKmh: '12 – 15 km/h'
      }
    ],
    secondaryAffectedWards: ['ward-04'],
    affectedCorridors: [
      `${locationLabel} Riverfront Road`,
      'Riverside Embankment Approach',
      'Lower Bazaar Link Culvert',
      'Tributary Sluice Channel'
    ],
    description: 'River backwater ingressing onto parallel roadway. Surface flow speeds rising as catchment tributary surges.'
  };

  // STAGE 3: +1 HR (T = 60) - Severe Valley Submergence
  // Color: Red-Orange / Deep Orange = Increasing / Severe Risk
  const area1h = baseAreaKm2 * (2.45 + (rainFactor * 0.35));
  const poly1h = expandPolygon(basePolygon, 2.05);
  const stage1Hr: FloodSpreadStage = {
    key: '+1 HR',
    label: '+1 HR (Peak Catchment Surge)',
    timeOffsetMinutes: 60,
    color: '#ea580c', // Deep Orange
    fillColor: '#fb923c',
    fillOpacity: 0.55,
    severityLabel: 'CRITICAL',
    severityBadgeColor: 'bg-red-600 text-white',
    inundatedAreaKm2: parseFloat(area1h.toFixed(2)),
    inundatedHectares: Math.round(area1h * 100),
    depthRangeMeters: '1.5 – 2.2 m',
    flowVelocityKmh: '20 – 26 km/h',
    polygon: poly1h,
    centroid: getCentroid(poly1h),
    flowArrows: [
      {
        id: 'arrow-downstream-1h',
        label: 'Flood spread direction →',
        sublabel: 'Downstream River Basin',
        path: [
          [cLat + 0.001, cLon - 0.001],
          [cLat - 0.004, cLon + 0.002],
          [cLat - 0.010, cLon + 0.004]
        ],
        arrowheadAngle: 160,
        color: '#ea580c',
        flowVelocityKmh: '20 – 26 km/h'
      },
      {
        id: 'arrow-road-1h',
        label: 'Flood spread direction →',
        sublabel: 'NH Corridor Ingress',
        path: [
          [cLat, cLon],
          [cLat + 0.005, cLon + 0.006],
          [cLat + 0.008, cLon + 0.009]
        ],
        arrowheadAngle: 45,
        color: '#ea580c',
        flowVelocityKmh: '18 – 22 km/h'
      },
      {
        id: 'arrow-trib-1h',
        label: 'Flood spread direction →',
        sublabel: 'Tributary Confluence Surge',
        path: [
          [cLat + 0.002, cLon + 0.002],
          [cLat + 0.009, cLon + 0.011],
          [cLat + 0.015, cLon + 0.018]
        ],
        arrowheadAngle: 35,
        color: '#ea580c',
        flowVelocityKmh: '16 – 20 km/h'
      }
    ],
    secondaryAffectedWards: ['ward-04', 'village-sangam'],
    affectedCorridors: [
      `${locationLabel} Roadway Deck`,
      'Valley Connecting Bridge Ingress',
      'Lowland Residential Terraces',
      'NH-58 River Corridor Feeder'
    ],
    description: 'High-velocity torrent submerging bridge ingress. Lowland terraces fully covered by turbulent floodwater.'
  };

  // STAGE 4: +2 HR (T = 120) - Maximum Projected Extent
  // Color: Crimson Red = Severe / Affected
  const area2h = baseAreaKm2 * (3.35 + (rainFactor * 0.5));
  const poly2h = expandPolygon(basePolygon, 2.75);
  const stage2Hr: FloodSpreadStage = {
    key: '+2 HR',
    label: '+2 HR (Maximum Projected Inundation)',
    timeOffsetMinutes: 120,
    color: '#dc2626', // Crimson Red
    fillColor: '#f87171',
    fillOpacity: 0.65,
    severityLabel: 'CRITICAL',
    severityBadgeColor: 'bg-red-700 text-white animate-pulse',
    inundatedAreaKm2: parseFloat(area2h.toFixed(2)),
    inundatedHectares: Math.round(area2h * 100),
    depthRangeMeters: '2.3 – 3.2 m',
    flowVelocityKmh: '24 – 32 km/h',
    polygon: poly2h,
    centroid: getCentroid(poly2h),
    flowArrows: [
      {
        id: 'arrow-downstream-2h',
        label: 'Flood spread direction →',
        sublabel: 'Full River Floodplain Inundation',
        path: [
          [cLat + 0.002, cLon - 0.002],
          [cLat - 0.005, cLon + 0.002],
          [cLat - 0.014, cLon + 0.005]
        ],
        arrowheadAngle: 160,
        color: '#dc2626',
        flowVelocityKmh: '24 – 32 km/h'
      },
      {
        id: 'arrow-road-2h',
        label: 'Flood spread direction →',
        sublabel: 'NH Bypass Submergence',
        path: [
          [cLat, cLon],
          [cLat + 0.006, cLon + 0.007],
          [cLat + 0.011, cLon + 0.012]
        ],
        arrowheadAngle: 45,
        color: '#dc2626',
        flowVelocityKmh: '22 – 28 km/h'
      },
      {
        id: 'arrow-trib-2h',
        label: 'Flood spread direction →',
        sublabel: 'Village Sangam Basin Submergence',
        path: [
          [cLat + 0.002, cLon + 0.002],
          [cLat + 0.010, cLon + 0.012],
          [cLat + 0.018, cLon + 0.021]
        ],
        arrowheadAngle: 35,
        color: '#dc2626',
        flowVelocityKmh: '20 – 26 km/h'
      }
    ],
    secondaryAffectedWards: ['ward-04', 'village-sangam', 'ward-12'],
    affectedCorridors: [
      'Entire River Floodplain Basin',
      'NH Bypass Low Overpass Approach',
      'Downstream River Terraces & Settlements',
      'Inter-Ward Drainage Trunk Culvert Zone'
    ],
    description: 'Maximum predicted flood footprint reached. River channel discharge exceeding historical high-water mark.'
  };

  const stages: Record<FloodSpreadStageKey, FloodSpreadStage> = {
    'NOW': stageNow,
    '+30 MIN': stage30Min,
    '+1 HR': stage1Hr,
    '+2 HR': stage2Hr
  };

  return {
    targetLocationName: location.name,
    simulationSeverityScore,
    rainfallIntensityMmHr: rf,
    soilMoisturePct: sm,
    riverLevelM: riverLvl,
    stages,
    stageOrder: ['NOW', '+30 MIN', '+1 HR', '+2 HR']
  };
}
