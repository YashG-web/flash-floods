export type HospitalStatus = 'AVAILABLE' | 'LIMITED' | 'FULL' | 'UNKNOWN';
export type AccessibilityStatus = 'GOOD' | 'MODERATE' | 'LIMITED' | 'UNKNOWN';
export type AmbulanceStatus = 'AVAILABLE' | 'LIMITED' | 'UNAVAILABLE' | 'UNKNOWN';

export interface Hospital {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  coordinates: [number, number]; // [lat, lon] for Leaflet mapping

  distanceKm: number;
  estimatedTravelMinutes: number;

  emergencyAvailable: boolean;
  emergencyCapability: string;

  totalEmergencyBeds: number | null;
  availableEmergencyBeds: number | null;
  occupiedEmergencyBeds: number | null;

  ambulanceAccess: AmbulanceStatus;
  accessibilityStatus: AccessibilityStatus;
  floodAccessibilityStatus: string;

  status: HospitalStatus;

  dataMode: 'LIVE' | 'DEMO';
  dataSource: string;
  sourceNote?: string;

  observedAt?: string;
  updatedAt?: string;

  verifiedMetadata?: {
    officialDepartment?: string;
    contactPhone?: string;
    verifiedSourceUrl?: string;
    authorityName?: string;
  };
}
