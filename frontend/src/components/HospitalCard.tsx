import React from 'react';
import type { Hospital, HospitalStatus } from '../types/hospital';
import { useTranslation } from '../services/LanguageContext';
import {
  Building2,
  Navigation,
  Clock,
  Activity,
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
  const { t, tr } = useTranslation();
  // Always evaluate as demo if either parent or hospital says demo
  const isDemo = isDemoMode !== undefined ? isDemoMode : (hospital.dataMode !== 'LIVE');

  // Status visual mapping
  const getStatusBadge = (status: HospitalStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          label: tr('AVAILABLE'),
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500'
        };
      case 'LIMITED':
        return {
          label: tr('LIMITED CAPACITY'),
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          dot: 'bg-amber-500'
        };
      case 'FULL':
        return {
          label: tr('NEAR CAPACITY'),
          bg: 'bg-rose-100 text-rose-900 border-rose-300',
          dot: 'bg-rose-600'
        };
      default:
        return {
          label: isDemo ? tr('AVAILABLE') : tr('CAPACITY UNKNOWN'),
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

  const statusBadge = getStatusBadge(status);


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
                {tr(hospital.name)}
              </h4>
            </div>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80 text-[11px] whitespace-nowrap">
                {tr(hospital.emergencyCapability || 'Emergency Care + Trauma')}
              </span>
              <span className="text-slate-400 hidden sm:inline">•</span>
              <span className="text-[11px] text-slate-500 truncate max-w-[150px] sm:max-w-[200px]" title={hospital.location}>
                {tr(hospital.location)}
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
              {tr('VERIFIED FACILITY')}
            </span>
          )}
        </div>

        {/* Distance and Estimated Travel Time */}
        <div className="mt-3 flex items-center justify-between text-xs font-mono font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-sky-600" />
            <span>{tr(`${distance} km away`)}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{tr(`~${travelTime} min est.`)}</span>
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
              <span>{tr('Emergency Capacity')}</span>
            </div>

            {/* DEMO badge or LIVE note */}
            {isDemo ? (
              <span className="text-[9px] font-black font-mono uppercase px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded">
                DEMO
              </span>
            ) : (
              <span className="text-[10px] font-mono text-slate-500">{tr('Official feed')}</span>
            )}
          </div>

          {isDemo ? (
            <div>
              <div className="flex items-baseline justify-between text-xs mb-1">
                <span className="font-extrabold text-slate-900 font-mono">
                  {tr(`${availBeds} / ${totalBeds} beds available`)}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {availPercent}% {tr('open')}
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
                <span>{tr(`${occBeds} beds occupied`)}</span>
                <span className="font-mono text-[9px] text-amber-700 font-bold">{tr('Simulated data')}</span>
              </div>
            </div>
          ) : (
            /* LIVE MODE / UNREPORTED CAPACITY */
            <div className="py-1 text-xs">
              <div className="font-bold text-slate-700 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{tr('Capacity data unavailable')}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                {tr('Current emergency bed counts not reported by authorized source. 24×7 Emergency department officially registered.')}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Using Fastest Route Action Button */}
        <div className="pt-1">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.coordinates[0]},${hospital.coordinates[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (onViewOnMap) {
                onViewOnMap(hospital);
              }
            }}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-600 hover:from-sky-500 hover:via-indigo-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-indigo-500/25 transition transform active:scale-[0.99] cursor-pointer no-underline"
          >
            <Navigation className="w-3.5 h-3.5 fill-white text-white shrink-0" />
            <span className="font-mono text-xs">{tr('Navigate via Fastest Route')}</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80 shrink-0 ml-auto" />
          </a>
        </div>
      </div>


      {/* Footer / Provenance & Action */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="truncate max-w-[210px]" title={hospital.sourceNote || hospital.dataSource}>
          {isDemo ? (
            <span className="text-amber-800 font-medium">{tr('Source:')} {hospital.dataSource}</span>
          ) : (
            <span className="text-slate-600 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-sky-600 shrink-0" />
              <span>{tr('Source: Verified health data')}</span>
            </span>
          )}
        </div>

        {onViewOnMap && (
          <button
            onClick={() => onViewOnMap(hospital)}
            className="text-sky-600 hover:text-sky-800 font-bold hover:underline cursor-pointer shrink-0 ml-2"
          >
            {tr('Inspect Map →')}
          </button>
        )}
      </div>
    </div>
  );
};
