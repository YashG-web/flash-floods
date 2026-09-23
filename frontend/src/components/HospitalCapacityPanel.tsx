import React, { useState, useMemo } from 'react';
import type { Hospital, HospitalStatus, AccessibilityStatus } from '../types/hospital';
import { useTranslation } from '../services/LanguageContext';
import { HospitalCard } from './HospitalCard';
import {
  Building2,
  SlidersHorizontal,
  Info,
  ShieldCheck,
  Activity,
  AlertCircle
} from 'lucide-react';

interface HospitalCapacityPanelProps {
  hospitals: Hospital[];
  isDemoMode: boolean;
  activeScenario?: string;
  selectedLocationName?: string;
  onViewOnMap?: (hospital: Hospital) => void;
  compact?: boolean;
}

export const HospitalCapacityPanel: React.FC<HospitalCapacityPanelProps> = ({
  hospitals,
  isDemoMode,
  activeScenario,
  selectedLocationName,
  onViewOnMap,
  compact = false
}) => {
  const { t, tr } = useTranslation();
  const [sortBy, setSortBy] = useState<'distance' | 'availability' | 'accessibility'>('distance');
  const [filterAccessibleOnly, setFilterAccessibleOnly] = useState<boolean>(false);

  // Factual sorting without biased "best hospital" labels
  const sortedHospitals = useMemo(() => {
    let list = [...hospitals];

    if (filterAccessibleOnly) {
      list = list.filter(h => h.accessibilityStatus === 'GOOD' || h.accessibilityStatus === 'MODERATE');
    }

    list.sort((a, b) => {
      if (sortBy === 'distance') {
        return a.distanceKm - b.distanceKm;
      }
      if (sortBy === 'availability') {
        // Sort by available beds in DEMO, or fallback to name in LIVE
        const aBeds = a.availableEmergencyBeds ?? -1;
        const bBeds = b.availableEmergencyBeds ?? -1;
        return bBeds - aBeds;
      }
      if (sortBy === 'accessibility') {
        const order: Record<AccessibilityStatus, number> = {
          GOOD: 1,
          MODERATE: 2,
          LIMITED: 3,
          UNKNOWN: 4
        };
        return (order[a.accessibilityStatus] || 5) - (order[b.accessibilityStatus] || 5);
      }
      return 0;
    });

    return list;
  }, [hospitals, sortBy, filterAccessibleOnly]);

  // Aggregate statistics
  const totalFacilities = hospitals.length;
  const accessibleCount = hospitals.filter(
    h => h.accessibilityStatus === 'GOOD' || h.accessibilityStatus === 'MODERATE'
  ).length;
  const limitedAccessCount = hospitals.filter(h => h.accessibilityStatus === 'LIMITED').length;

  return (
    <section className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-7 shadow-xs space-y-5">
      {/* Header and Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 font-mono">
              {t.hospitalPanelTitle}
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            {t.hospitalPanelDesc}
            {selectedLocationName ? ` (${tr('relative to')} ${tr(selectedLocationName)})` : ''}
          </p>
        </div>

        {/* Mode Label */}
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-black font-mono uppercase tracking-wider ${
              isDemoMode
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}
          >
            {isDemoMode ? tr('DEMO CAPACITY DATA') : tr('VERIFIED REGISTRY')}
          </span>
        </div>
      </div>

      {/* Mode Transparency Banner */}
      {isDemoMode ? (
        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">
              {tr('DEMO DATA — Hospital capacity values are simulated for system demonstration.')}
            </span>
            <p className="text-[11px] text-amber-800">
              {tr('In DEMO mode, capacity and accessibility values are simulated for scenario evaluation.')}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 text-xs flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900 block">
              {tr('LIVE DATA — Capacity shown only when reported by verified source.')}
            </span>
            <p className="text-[11px] text-slate-500">
              {tr('Institution existence and trauma capabilities are verified from statutory health registries.')}
            </p>
          </div>
        </div>
      )}

      {/* Operational Summary Bar & Sorting Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs">
        {/* Summary Badges */}
        <div className="flex items-center gap-3 font-mono font-bold text-slate-700">
          <span>{totalFacilities} {tr('nearby facilities')}</span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-700">{accessibleCount} {tr('accessible')}</span>
          {limitedAccessCount > 0 && (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-red-700">{limitedAccessCount} {tr('limited access')}</span>
            </>
          )}
        </div>

        {/* Factual Sort & Filter */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-semibold text-[11px]">{tr('Sort:')}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-300 text-slate-800 text-[11px] font-bold rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="distance">{t.sortByDistance}</option>
              {isDemoMode && <option value="availability">{t.sortByAvailability}</option>}
              <option value="accessibility">{t.sortByAccessibility}</option>
            </select>
          </div>

          <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={filterAccessibleOnly}
              onChange={(e) => setFilterAccessibleOnly(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
            />
            <span>{t.accessibleOnly}</span>
          </label>
        </div>
      </div>

      {/* Hospital Cards Grid */}
      {sortedHospitals.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs">
          <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <span>{tr('No facilities match current filter criteria.')}</span>
        </div>
      ) : (
        <div
          className={`grid gap-4 ${
            compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {sortedHospitals.map((hospital) => (
            <HospitalCard
              key={hospital.id}
              hospital={hospital}
              isDemoMode={isDemoMode}
              onViewOnMap={onViewOnMap}
            />
          ))}
        </div>
      )}
    </section>
  );
};
