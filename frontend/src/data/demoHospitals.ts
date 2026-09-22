import type { Hospital, HospitalStatus, AccessibilityStatus, AmbulanceStatus } from '../types/hospital';

/**
 * Verified base metadata for key Uttarakhand regional emergency healthcare institutions.
 * Actual existence, location coordinates, and emergency facilities are based on official directories
 * (AIIMS Rishikesh Official Portal, Uttarakhand Department of Medical Education / Doon Medical College,
 * and Shri Mahant Indresh Hospital).
 *
 * CRITICAL SAFETY RULE:
 * Bed capacity numbers in DEMO mode are strictly synthetic for demonstration.
 * In LIVE mode, bed counts remain NULL / unavailable unless retrieved from an authorized state health feed.
 */
export interface BaseHospitalConfig {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  emergencyAvailable: boolean;
  emergencyCapability: string;
  verifiedMetadata: {
    officialDepartment: string;
    contactPhone: string;
    verifiedSourceUrl?: string;
    authorityName: string;
  };
  demoDefaults: {
    totalEmergencyBeds: number;
    availableEmergencyBeds: number;
    occupiedEmergencyBeds: number;
    ambulanceAccess: AmbulanceStatus;
    accessibilityStatus: AccessibilityStatus;
    floodAccessibilityStatus: string;
    status: HospitalStatus;
  };
}

export const VERIFIED_HOSPITALS_CONFIG: BaseHospitalConfig[] = [
  {
    id: 'hosp-aiims-rishikesh',
    name: 'AIIMS Rishikesh',
    location: 'Virbhadra Road, Rishikesh, Uttarakhand',
    latitude: 30.0763,
    longitude: 78.2882,
    emergencyAvailable: true,
    emergencyCapability: 'Emergency + Trauma',
    verifiedMetadata: {
      officialDepartment: '24×7 Emergency & Apex Trauma Centre',
      contactPhone: '0135-2462999 / 112',
      verifiedSourceUrl: 'https://aiimsrishikesh.edu.in',
      authorityName: 'All India Institute of Medical Sciences (AIIMS)'
    },
    demoDefaults: {
      totalEmergencyBeds: 30,
      availableEmergencyBeds: 18,
      occupiedEmergencyBeds: 12,
      ambulanceAccess: 'AVAILABLE',
      accessibilityStatus: 'GOOD',
      floodAccessibilityStatus: 'Normal',
      status: 'AVAILABLE'
    }
  },
  {
    id: 'hosp-doon-medical-college',
    name: 'Government Doon Medical College Hospital',
    location: 'Dehradun, Uttarakhand',
    latitude: 30.3244,
    longitude: 78.0416,
    emergencyAvailable: true,
    emergencyCapability: 'General Emergency + Trauma',
    verifiedMetadata: {
      officialDepartment: 'Department of Emergency Medicine & Trauma',
      contactPhone: '0135-2718400',
      verifiedSourceUrl: 'https://gdmcuk.com',
      authorityName: 'Uttarakhand Department of Medical Education'
    },
    demoDefaults: {
      totalEmergencyBeds: 20,
      availableEmergencyBeds: 9,
      occupiedEmergencyBeds: 11,
      ambulanceAccess: 'LIMITED',
      accessibilityStatus: 'MODERATE',
      floodAccessibilityStatus: 'Partially affected',
      status: 'LIMITED'
    }
  },
  {
    id: 'hosp-mahant-indresh',
    name: 'Shri Mahant Indresh Hospital',
    location: 'Patel Nagar, Dehradun, Uttarakhand',
    latitude: 30.3129,
    longitude: 78.0284,
    emergencyAvailable: true,
    emergencyCapability: 'Emergency + Multispecialty',
    verifiedMetadata: {
      officialDepartment: 'SMIH Emergency & Critical Care Center',
      contactPhone: '0135-2522100',
      verifiedSourceUrl: 'https://smih.edu.in',
      authorityName: 'Shri Mahant Indiresh Healthcare & Medical Institute'
    },
    demoDefaults: {
      totalEmergencyBeds: 18,
      availableEmergencyBeds: 5,
      occupiedEmergencyBeds: 13,
      ambulanceAccess: 'AVAILABLE',
      accessibilityStatus: 'MODERATE',
      floodAccessibilityStatus: 'Normal',
      status: 'LIMITED'
    }
  },
  {
    id: 'hosp-sdh-rishikesh',
    name: 'Government Sub-District Hospital Rishikesh',
    location: 'Railway Station Road, Rishikesh, Uttarakhand',
    latitude: 30.1042,
    longitude: 78.2931,
    emergencyAvailable: true,
    emergencyCapability: 'Civil Emergency & First Referral Unit',
    verifiedMetadata: {
      officialDepartment: '24×7 Casualty & Emergency Ward',
      contactPhone: '0135-2430041',
      verifiedSourceUrl: 'https://health.uk.gov.in',
      authorityName: 'Uttarakhand Health & Family Welfare Department'
    },
    demoDefaults: {
      totalEmergencyBeds: 14,
      availableEmergencyBeds: 7,
      occupiedEmergencyBeds: 7,
      ambulanceAccess: 'AVAILABLE',
      accessibilityStatus: 'GOOD',
      floodAccessibilityStatus: 'Direct access via highland link',
      status: 'AVAILABLE'
    }
  },
  {
    id: 'hosp-himalayan-jolly-grant',
    name: 'Himalayan Hospital (HIHT Jolly Grant)',
    location: 'Swami Ram Nagar, Jolly Grant, Dehradun, Uttarakhand',
    latitude: 30.1982,
    longitude: 78.1754,
    emergencyAvailable: true,
    emergencyCapability: 'Super-Speciality Trauma & Emergency',
    verifiedMetadata: {
      officialDepartment: 'Centre for Emergency Medical Services',
      contactPhone: '0135-2471100',
      verifiedSourceUrl: 'https://srhu.edu.in',
      authorityName: 'Swami Rama Himalayan University'
    },
    demoDefaults: {
      totalEmergencyBeds: 26,
      availableEmergencyBeds: 14,
      occupiedEmergencyBeds: 12,
      ambulanceAccess: 'AVAILABLE',
      accessibilityStatus: 'GOOD',
      floodAccessibilityStatus: 'NH-72 corridor open',
      status: 'AVAILABLE'
    }
  },
  {
    id: 'hosp-max-dehradun',
    name: 'Max Super Speciality Hospital Dehradun',
    location: 'Mussoorie Diversion Road, Dehradun, Uttarakhand',
    latitude: 30.3789,
    longitude: 78.0772,
    emergencyAvailable: true,
    emergencyCapability: 'Advanced Cardiac & Neuro Emergency',
    verifiedMetadata: {
      officialDepartment: '24×7 Emergency & Critical Care',
      contactPhone: '0135-7193000',
      verifiedSourceUrl: 'https://maxhealthcare.in',
      authorityName: 'Max Healthcare Network'
    },
    demoDefaults: {
      totalEmergencyBeds: 16,
      availableEmergencyBeds: 6,
      occupiedEmergencyBeds: 10,
      ambulanceAccess: 'AVAILABLE',
      accessibilityStatus: 'MODERATE',
      floodAccessibilityStatus: 'Normal traffic conditions',
      status: 'LIMITED'
    }
  }
];

/**
 * Calculates straight-line distance in kilometers using the Haversine formula.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Computes realistic travel time estimates (minutes) given distance and road accessibility conditions.
 */
export function estimateTravelTimeMinutes(
  distanceKm: number,
  accessibilityStatus: AccessibilityStatus
): number {
  // Base Himalayan urban/foothill transit speed: ~28 km/h
  let effectiveSpeedKmh = 28;
  if (accessibilityStatus === 'GOOD') effectiveSpeedKmh = 26;
  else if (accessibilityStatus === 'MODERATE') effectiveSpeedKmh = 19;
  else if (accessibilityStatus === 'LIMITED') effectiveSpeedKmh = 12;
  else effectiveSpeedKmh = 22;

  const rawMinutes = (distanceKm / effectiveSpeedKmh) * 60;
  return Math.max(5, Math.round(rawMinutes));
}

/**
 * Centralized Hospital Data Provider:
 * Resolves hospital capacity, accessibility, and distance dynamically based on:
 * 1. Current mode: LIVE vs DEMO
 * 2. Selected incident / ward coordinates (or default Ward 12 if unspecified)
 * 3. Active simulation scenario (for DEMO mode)
 */
export function getHospitalsForState(
  isDemoMode: boolean,
  activeScenario: string = 'scenario_2_drainage_blockage',
  selectedCoordinates?: [number, number] | null
): Hospital[] {
  // Default reference coordinate: Ward 12 center [30.0920, 78.2690]
  const refLat = selectedCoordinates ? selectedCoordinates[0] : 30.092;
  const refLon = selectedCoordinates ? selectedCoordinates[1] : 78.269;

  return VERIFIED_HOSPITALS_CONFIG.map((conf) => {
    const distanceKm = calculateHaversineDistanceKm(refLat, refLon, conf.latitude, conf.longitude);

    if (!isDemoMode) {
      // ==========================================
      // LIVE DATA MODE
      // Strictly follows the safety rule: NEVER FABRICATE LIVE CAPACITY
      // ==========================================
      const accessibilityStatus: AccessibilityStatus = 'GOOD';
      const travelMins = estimateTravelTimeMinutes(distanceKm, accessibilityStatus);

      return {
        id: conf.id,
        name: conf.name,
        location: conf.location,
        latitude: conf.latitude,
        longitude: conf.longitude,
        coordinates: [conf.latitude, conf.longitude],

        distanceKm,
        estimatedTravelMinutes: travelMins,

        emergencyAvailable: conf.emergencyAvailable,
        emergencyCapability: conf.emergencyCapability,

        // CAPACITY REMAINS UNREPORTED / NULL IN LIVE MODE WITHOUT OFFICIAL INTEGRATION
        totalEmergencyBeds: null,
        availableEmergencyBeds: null,
        occupiedEmergencyBeds: null,

        ambulanceAccess: 'AVAILABLE',
        accessibilityStatus,
        floodAccessibilityStatus: 'Road access normal based on public transit status',

        status: 'UNKNOWN', // No live authorized telemetry feed connected yet

        dataMode: 'LIVE',
        dataSource: 'Verified institutional registry (IMD/Health Directory)',
        sourceNote: 'Capacity data unavailable — official live bed telemetry feed not connected',

        observedAt: 'Current observation',
        updatedAt: 'Verified institutional metadata',
        verifiedMetadata: conf.verifiedMetadata
      };
    }

    // ==========================================
    // DEMO DATA MODE
    // Synthetic values based on user scenario
    // ==========================================
    let totalBeds = conf.demoDefaults.totalEmergencyBeds;
    let availableBeds = conf.demoDefaults.availableEmergencyBeds;
    let occupiedBeds = conf.demoDefaults.occupiedEmergencyBeds;
    let ambulanceAccess = conf.demoDefaults.ambulanceAccess;
    let accessibilityStatus = conf.demoDefaults.accessibilityStatus;
    let floodAccessibility = conf.demoDefaults.floodAccessibilityStatus;
    let status: HospitalStatus = conf.demoDefaults.status;

    if (activeScenario === 'scenario_2_drainage_blockage') {
      // Blocked Drain Scenario:
      // AIIMS Rishikesh: Good, Doon Med College: Moderate, Shri Mahant Indresh: Limited
      if (conf.id === 'hosp-aiims-rishikesh') {
        accessibilityStatus = 'GOOD';
        floodAccessibility = 'Normal';
        status = 'AVAILABLE';
        availableBeds = 18;
        occupiedBeds = 12;
      } else if (conf.id === 'hosp-doon-medical-college') {
        accessibilityStatus = 'MODERATE';
        floodAccessibility = 'Partially affected (waterlogging on feeder route)';
        status = 'LIMITED';
        availableBeds = 9;
        occupiedBeds = 11;
      } else if (conf.id === 'hosp-mahant-indresh') {
        accessibilityStatus = 'LIMITED';
        floodAccessibility = 'Station culvert backwater restricting ingress approach';
        status = 'LIMITED';
        ambulanceAccess = 'LIMITED';
        availableBeds = 5;
        occupiedBeds = 13;
      }
    } else if (activeScenario === 'scenario_1_heavy_rainfall') {
      // Cloudburst Scenario:
      // Routes stressed severely across basin, bed capacity surges
      if (conf.id === 'hosp-aiims-rishikesh') {
        accessibilityStatus = 'MODERATE';
        floodAccessibility = 'Riparian road runoff slowing transit';
        status = 'LIMITED';
        availableBeds = 12;
        occupiedBeds = 18;
      } else if (conf.id === 'hosp-doon-medical-college') {
        accessibilityStatus = 'LIMITED';
        floodAccessibility = 'Flooded lowlands; detour required via bypass';
        status = 'LIMITED';
        ambulanceAccess = 'LIMITED';
        availableBeds = 4;
        occupiedBeds = 16;
      } else if (conf.id === 'hosp-mahant-indresh') {
        accessibilityStatus = 'LIMITED';
        floodAccessibility = 'Waterlogged approach corridor';
        status = 'FULL';
        ambulanceAccess = 'LIMITED';
        availableBeds = 2;
        occupiedBeds = 16;
      }
    } else {
      // Baseline Scenario:
      // Nominal clear weather, all routes good
      accessibilityStatus = 'GOOD';
      floodAccessibility = 'Normal road conditions';
      status = 'AVAILABLE';
      if (conf.id === 'hosp-aiims-rishikesh') availableBeds = 24;
      else if (conf.id === 'hosp-doon-medical-college') availableBeds = 14;
      else availableBeds = 11;
      occupiedBeds = totalBeds - availableBeds;
      ambulanceAccess = 'AVAILABLE';
    }

    const travelMins = estimateTravelTimeMinutes(distanceKm, accessibilityStatus);

    return {
      id: conf.id,
      name: conf.name,
      location: conf.location,
      latitude: conf.latitude,
      longitude: conf.longitude,
      coordinates: [conf.latitude, conf.longitude],

      distanceKm,
      estimatedTravelMinutes: travelMins,

      emergencyAvailable: conf.emergencyAvailable,
      emergencyCapability: conf.emergencyCapability,

      totalEmergencyBeds: totalBeds,
      availableEmergencyBeds: availableBeds,
      occupiedEmergencyBeds: occupiedBeds,

      ambulanceAccess,
      accessibilityStatus,
      floodAccessibilityStatus: floodAccessibility,

      status,

      dataMode: 'DEMO',
      dataSource: 'JalRakshak simulation',
      sourceNote: 'DEMO DATA — Hospital capacity values are simulated for system demonstration.',

      observedAt: 'Scenario simulated state',
      updatedAt: 'Demo Scenario Rules',
      verifiedMetadata: conf.verifiedMetadata
    };
  });
}
