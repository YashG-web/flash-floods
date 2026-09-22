export interface MunicipalRoad {
  id: string;
  name: string;
  wardId: string;
  wardName: string;
  // Real-time observed telemetry
  status: 'SEVERE' | 'MODERATE' | 'MINOR' | 'CLEAR';
  cause: string;
  citizenReportsCount: number;
  waterDepth: string;
  lastUpdated: string;
  recommendedAction: string;
  alternateRoute: string;
  coordinates: [number, number][];

  // Predictive hydraulic simulation forecasts
  predictedStatus: 'SEVERE' | 'MODERATE' | 'MINOR' | 'CLEAR';
  predictedWaterDepth: string;
  predictedStartTime: string; // Time after which waterlogging will start
  predictedPeakTime: string;  // When inundation reaches maximum depth
  predictionConfidence: number; // 0–100%
}

export const MUNICIPAL_ROADS: MunicipalRoad[] = [
  {
    id: 'road-market-01',
    name: 'Main Market Road',
    wardId: 'ward-12',
    wardName: 'Ward 12 (Station Road / Central Bazaar)',
    status: 'SEVERE',
    cause: 'Blocked drainage culvert inlet with solid silt and plastic debris',
    citizenReportsCount: 14,
    waterDepth: '1.2 to 1.8 feet (Knee depth)',
    lastUpdated: '2 minutes ago',
    recommendedAction: 'Avoid this road completely. Closed to two-wheelers and sedans.',
    alternateRoute: 'Divert via Upper Ridge Road or Cantonment Bypass',
    coordinates: [
      [30.0910, 78.2655],
      [30.0925, 78.2690],
      [30.0938, 78.2725]
    ],
    predictedStatus: 'SEVERE',
    predictedWaterDepth: '1.8 to 2.2 feet (Waist depth)',
    predictedStartTime: 'Starts in 15–25 mins',
    predictedPeakTime: 'Peak in 40 mins',
    predictionConfidence: 91
  },
  {
    id: 'road-riverfront-02',
    name: 'Riverfront Embankment Road',
    wardId: 'ward-04',
    wardName: 'Ward 04 (Riverfront Embankment & Lowlands)',
    status: 'SEVERE',
    cause: 'River backwater ingress overflowing embankment steps and low culvert',
    citizenReportsCount: 11,
    waterDepth: '1.5 feet (Rapid surface flow)',
    lastUpdated: '5 minutes ago',
    recommendedAction: 'Hazardous. Immediate traffic detour in place.',
    alternateRoute: 'Use Highland Bypass (NH-58 Corridor)',
    coordinates: [
      [30.0815, 78.2575],
      [30.0845, 78.2618],
      [30.0868, 78.2655]
    ],
    predictedStatus: 'SEVERE',
    predictedWaterDepth: '2.0+ feet (Submerged road deck)',
    predictedStartTime: 'Starts in 10–20 mins',
    predictedPeakTime: 'Peak in 35 mins',
    predictionConfidence: 88
  },
  {
    id: 'road-station-link-03',
    name: 'Station Culvert Link Road',
    wardId: 'ward-12',
    wardName: 'Ward 12 (Station Road)',
    status: 'MODERATE',
    cause: 'Sluggish storm drain outflow causing gutter surcharge in curb lanes',
    citizenReportsCount: 6,
    waterDepth: '6 to 10 inches (Ankle depth)',
    lastUpdated: '8 minutes ago',
    recommendedAction: 'Drive with caution. Avoid curb side parking and low lanes.',
    alternateRoute: 'Station Feeder Flyover',
    coordinates: [
      [30.0890, 78.2670],
      [30.0915, 78.2685],
      [30.0935, 78.2700]
    ],
    predictedStatus: 'MODERATE',
    predictedWaterDepth: '10 to 14 inches (Knee depth)',
    predictedStartTime: 'Starts in 30–45 mins',
    predictedPeakTime: 'Peak in 60 mins',
    predictionConfidence: 84
  },
  {
    id: 'road-bazaar-lane-04',
    name: 'Old Mandi Cross Road',
    wardId: 'ward-12',
    wardName: 'Ward 12 (Central Bazaar)',
    status: 'MINOR',
    cause: 'Local surface puddling near shops due to slight slope depression',
    citizenReportsCount: 3,
    waterDepth: '3 to 5 inches',
    lastUpdated: '12 minutes ago',
    recommendedAction: 'Slow speed advised. Pedestrian walkway elevated.',
    alternateRoute: 'Direct transit open',
    coordinates: [
      [30.0945, 78.2710],
      [30.0965, 78.2735]
    ],
    predictedStatus: 'MINOR',
    predictedWaterDepth: '4 to 6 inches',
    predictedStartTime: 'Starts in 45–60 mins',
    predictedPeakTime: 'Peak in 75 mins',
    predictionConfidence: 78
  },
  {
    id: 'road-upper-ridge-05',
    name: 'Upper Ridge Arterial (NH Bypass)',
    wardId: 'ward-01',
    wardName: 'Ward 01 (Upper Cantonment Ridge)',
    status: 'CLEAR',
    cause: 'Open gravity drainage channels completely functional',
    citizenReportsCount: 0,
    waterDepth: 'Dry / Normal pavement',
    lastUpdated: 'Just now',
    recommendedAction: 'Clear route. Recommended primary transit corridor.',
    alternateRoute: 'No detour needed',
    coordinates: [
      [30.0740, 78.2675],
      [30.0775, 78.2705],
      [30.0810, 78.2745]
    ],
    predictedStatus: 'CLEAR',
    predictedWaterDepth: 'Nominal / Dry',
    predictedStartTime: 'No waterlogging predicted',
    predictedPeakTime: 'Clear flow maintained',
    predictionConfidence: 95
  },
  {
    id: 'road-cantonment-06',
    name: 'Cantonment Service Road',
    wardId: 'ward-01',
    wardName: 'Ward 01 (Upper Cantonment Ridge)',
    status: 'CLEAR',
    cause: 'High elevation, unobstructed runoff',
    citizenReportsCount: 0,
    waterDepth: 'Dry / Normal pavement',
    lastUpdated: 'Just now',
    recommendedAction: 'All lanes open for regular transit.',
    alternateRoute: 'No detour needed',
    coordinates: [
      [30.0710, 78.2730],
      [30.0735, 78.2765]
    ],
    predictedStatus: 'CLEAR',
    predictedWaterDepth: 'Nominal / Dry',
    predictedStartTime: 'No waterlogging predicted',
    predictedPeakTime: 'Clear flow maintained',
    predictionConfidence: 95
  }
];

export const getAffectedRoadsCount = (roads: MunicipalRoad[] = MUNICIPAL_ROADS) => {
  return roads.filter(r => r.status === 'SEVERE' || r.status === 'MODERATE').length;
};
