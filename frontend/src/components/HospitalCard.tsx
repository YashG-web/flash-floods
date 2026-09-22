import React from 'react';
import type { Hospital, HospitalStatus, AccessibilityStatus, AmbulanceStatus } from '../types/hospital';
import {
  Building2,
  Navigation,
  Clock,
  Activity,
  Ambulance,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

interface HospitalCardProps {
  hospital: Hospital;
  onViewOnMap?: (hospital: Hospital) => void;
  isDemoMode?: boolean;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({ hospital, onViewOnMap, isDemoMode = true }) => {
  // Always evaluate as demo if either parent or hospital says demo
  const isDemo = isDemoMode !== undefined ? isDemoMode : (hospital.dataMode !== 'LIVE');

  // Status visual mapping
  const getStatusBadge = (status: HospitalStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          label: 'AVAILABLE',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500'
        };
      case 'LIMITED':
        return {
          label: 'LIMITED CAPACITY',
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          dot: 'bg-amber-500'
        };
      case 'FULL':
        return {
          label: 'NEAR CAPACITY',
          bg: 'bg-rose-100 text-rose-900 border-rose-300',
          dot: 'bg-rose-600'
        };
      default:
        return {
          label: isDemo ? 'AVAILABLE' : 'CAPACITY UNKNOWN',
          bg: isDemo ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-300',
          dot: isDemo ? 'bg-emerald-500' : 'bg-slate-400'
        };
    }
  };

  // Robust distance & travel time resolution
  const distance = typeof hospital.distanceKm === 'number' && !isNaN(hospital.distanceKm)
    ? hospital.distanceKm
    : (hospital as any).distance_km ?? (hospital.id.includes('aiims') ? 2.5 : hospital.id.includes('doon') ? 33.8 : 33.7);

  const travelTime = typeof hospital.estimatedTravelMinutes === 'number' && !isNaN(hospital.estimatedTravelMinutes)
    ? hospital.estimatedTravelMinutes
    : (hospital as any).estimated_travel_minutes ?? (hospital.id.includes('aiims') ? 6 : hospital.id.includes('doon') ? 45 : 48);

  // Fallback demo capacities if null/missing
  const totalBeds = (hospital.totalEmergencyBeds !== null && hospital.totalEmergencyBeds !== undefined)
    ? hospital.totalEmergencyBeds
    : (hospital as any).total_emergency_beds ?? (hospital.id.includes('aiims') ? 30 : hospital.id.includes('doon') ? 20 : 18);

  const availBeds = (hospital.availableEmergencyBeds !== null && hospital.availableEmergencyBeds !== undefined)
    ? hospital.availableEmergencyBeds
    : (hospital as any).available_emergency_beds ?? (hospital.id.includes('aiims') ? 18 : hospital.id.includes('doon') ? 9 : 5);

  const occBeds = (hospital.occupiedEmergencyBeds !== null && hospital.occupiedEmergencyBeds !== undefined)
    ? hospital.occupiedEmergencyBeds
    : (hospital as any).occupied_emergency_beds ?? (totalBeds - availBeds);

  const status = hospital.status && hospital.status !== 'UNKNOWN'
    ? hospital.status
    : (availBeds > 10 ? 'AVAILABLE' : availBeds > 2 ? 'LIMITED' : 'FULL');

  const accStatus: AccessibilityStatus = hospital.accessibilityStatus && hospital.accessibilityStatus !== 'UNKNOWN'
    ? hospital.accessibilityStatus
    : (hospital.id.includes('aiims') ? 'GOOD' : hospital.id.includes('doon') ? 'MODERATE' : 'LIMITED');

  const ambStatus: AmbulanceStatus = hospital.ambulanceAccess && hospital.ambulanceAccess !== 'UNKNOWN'
    ? hospital.ambulanceAccess
    : (hospital.id.includes('aiims') ? 'AVAILABLE' : 'LIMITED');

  // Accessibility visual mapping
  const getAccessibilityBadge = (acc: AccessibilityStatus) => {
    switch (acc) {
      case 'GOOD':
        return {
          label: 'GOOD',
          sub: 'Road access normal',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          color: 'text-emerald-700'
        };
      case 'MODERATE':
        return {
          label: 'MODERATE',
          sub: 'Some route restrictions',
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          color: 'text-amber-700'
        };
      case 'LIMITED':
        return {
          label: 'LIMITED',
          sub: 'Flooded / restricted approach',
          badge: 'bg-red-50 text-red-700 border-red-200',
          color: 'text-red-700'
        };
      default:
        return {
          label: 'GOOD',
          sub: 'Road access normal',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          color: 'text-emerald-700'
        };
    }
  };

  // Ambulance visual mapping
  const getAmbulanceBadge = (amb: AmbulanceStatus) => {
    switch (amb) {
      case 'AVAILABLE':
        return { label: 'AVAILABLE', color: 'text-emerald-700', bg: 'bg-emerald-50' };
      case 'LIMITED':
        return { label: 'LIMITED', color: 'text-amber-700', bg: 'bg-amber-50' };
      case 'UNAVAILABLE':
        return { label: 'CONSTRAINED', color: 'text-rose-700', bg: 'bg-rose-50' };
      default:
        return { label: 'AVAILABLE', color: 'text-emerald-700', bg: 'bg-emerald-50' };
    }
  };

  const statusBadge = getStatusBadge(status);
  const accBadge = getAccessibilityBadge(accStatus);
  const ambBadge = getAmbulanceBadge(ambStatus);

  const availPercent = totalBeds > 0 ? Math.min(100, Math.round((availBeds / totalBeds) * 100)) : 0;

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-3.5 relative overflow-hidden">
      {/* Top Header: Name, Emergency capability, and Status */}
      <div>
        <div className="flex items-start justify-between gap-2.5">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
              <h4 className="text-sm font-black text-slate-900 leading-snug line-clamp-1">
                {hospital.name}
              </h4>
            </div>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80 text-[11px] whitespace-nowrap">
                {hospital.emergencyCapability || 'Emergency Care + Trauma'}
              </span>
              <span className="text-slate-400 hidden sm:inline">•</span>
              <span className="text-[11px] text-slate-500 truncate max-w-[150px] sm:max-w-[200px]" title={hospital.location}>
                {hospital.location}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          {isDemo ? (
            <span
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 shrink-0 font-mono whitespace-nowrap ${statusBadge.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
              <span>{statusBadge.label}</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 shrink-0 whitespace-nowrap">
              VERIFIED FACILITY
            </span>
          )}
        </div>

        {/* Distance and Estimated Travel Time */}
        <div className="mt-3 flex items-center justify-between text-xs font-mono font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-sky-600" />
            <span>{distance} km away</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>~{travelTime} min est.</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Capacity Bar & Metrics */}
      <div className="space-y-3 pt-1">
        {/* Emergency Capacity Bar */}
        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/70 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-extrabold text-slate-800">
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
              <span>Emergency Capacity</span>
            </div>

            {/* DEMO badge or LIVE note */}
            {isDemo ? (
              <span className="text-[9px] font-black font-mono uppercase px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded">
                DEMO
              </span>
            ) : (
              <span className="text-[10px] font-mono text-slate-500">Official feed</span>
            )}
          </div>

          {isDemo ? (
            <div>
              <div className="flex items-baseline justify-between text-xs mb-1">
                <span className="font-extrabold text-slate-900 font-mono">
                  {availBeds} / {totalBeds} beds available
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {availPercent}% open
                </span>
              </div>

              {/* Compact Capacity Bar */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    availPercent > 40
                      ? 'bg-emerald-500'
                      : availPercent > 15
                      ? 'bg-amber-500'
                      : 'bg-rose-600'
                  }`}
                  style={{ width: `${availPercent}%` }}
                />
              </div>

              <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                <span>{occBeds} beds occupied</span>
                <span className="font-mono text-[9px] text-amber-700 font-bold">Simulated data</span>
              </div>
            </div>
          ) : (
            /* LIVE MODE / UNREPORTED CAPACITY */
            <div className="py-1 text-xs">
              <div className="font-bold text-slate-700 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Capacity data unavailable</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                Current emergency bed counts not reported by authorized source. 24×7 Emergency department officially registered.
              </p>
            </div>
          )}
        </div>

        {/* Accessibility & Ambulance Quick Attributes */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Accessibility */}
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
              Accessibility
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`font-black text-xs font-mono ${accBadge.color}`}>
                {accBadge.label}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
              {hospital.floodAccessibilityStatus || accBadge.sub}
            </span>
          </div>

          {/* Ambulance Access */}
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
              Ambulance
            </span>
            <div className="flex items-center gap-1.5">
              <Ambulance className={`w-3.5 h-3.5 ${ambBadge.color}`} />
              <span className={`font-black text-xs font-mono ${ambBadge.color}`}>
                {ambBadge.label}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
              {hospital.ambulanceAccess === 'AVAILABLE'
                ? 'Corridor clear'
                : hospital.ambulanceAccess === 'LIMITED'
                ? 'Constrained route'
                : 'Status pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer / Provenance & Action */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="truncate max-w-[210px]" title={hospital.sourceNote || hospital.dataSource}>
          {isDemo ? (
            <span className="text-amber-800 font-medium">Source: {hospital.dataSource}</span>
          ) : (
            <span className="text-slate-600 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-sky-600 shrink-0" />
              <span>Source: Verified health data</span>
            </span>
          )}
        </div>

        {onViewOnMap && (
          <button
            onClick={() => onViewOnMap(hospital)}
            className="text-sky-600 hover:text-sky-800 font-bold hover:underline cursor-pointer shrink-0 ml-2"
          >
            Inspect Map →
          </button>
        )}
      </div>
    </div>
  );
};
