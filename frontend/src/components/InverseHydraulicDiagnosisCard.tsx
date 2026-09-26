import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { DrainageManholeRecord } from '../types';
import { apiClient } from '../api/client';
import { useTranslation } from '../services/LanguageContext';
import defaultDrainageData from '../data/jalrakshak_mumbai_drainage_manhole_450.json';
import {
  Clock,
  ShieldAlert,
  MapPin,
  Search,
  Check,
  ChevronDown,
  Info,
  Radio,
  ExternalLink
} from 'lucide-react';

interface InverseHydraulicDiagnosisCardProps {
  input?: any;
  onOpenReport?: () => void;
  isDemoMode?: boolean;
}


const ALL_RECORDS: DrainageManholeRecord[] = defaultDrainageData as DrainageManholeRecord[];

export const InverseHydraulicDiagnosisCard: React.FC<InverseHydraulicDiagnosisCardProps> = ({
  input,
  onOpenReport,
  isDemoMode = true
}) => {

  const { t, tr } = useTranslation();

  // Search & Record Selection State
  const [selectedRecord, setSelectedRecord] = useState<DrainageManholeRecord>(ALL_RECORDS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<DrainageManholeRecord[]>(ALL_RECORDS.slice(0, 15));
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(false);
  const [apiDiagnosis, setApiDiagnosis] = useState<any>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (input?.roadName) {
      const q = String(input.roadName).toLowerCase();
      const matched = ALL_RECORDS.find(r => r.sewer_stretch_location.toLowerCase().includes(q) || q.includes(r.sewer_stretch_location.toLowerCase()));
      if (matched) setSelectedRecord(matched);
    }
  }, [input?.roadName]);


  // Autocomplete search across road location, area, and ward
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(ALL_RECORDS.slice(0, 15));
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    const terms = q.split(/\s+/);

    const matches = ALL_RECORDS.filter(r => {
      const loc = (r.sewer_stretch_location || '').toLowerCase();
      const area = (r.area || '').toLowerCase();
      const ward = (r.ward_or_zone || '').toLowerCase();
      const combined = `${loc} ${area} ${ward}`;
      return terms.every(term => combined.includes(term));
    });

    setSearchResults(matches.slice(0, 20));
  }, [searchQuery]);

  // Fetch or calculate diagnosis dynamically whenever record or mode changes
  useEffect(() => {
    let isCancelled = false;

    const fetchDiagnosis = async () => {
      setIsLoadingApi(true);
      try {
        const mode = isDemoMode ? 'DEMO' : 'LIVE';
        const res = await apiClient.getDrainageDiagnosis({
          sr_no: selectedRecord.sr_no,
          mode
        });

        if (!isCancelled && res && res.success) {
          setApiDiagnosis(res.diagnosis);
          if (res.record) {
            setSelectedRecord(res.record);
          }
        }
      } catch (err) {
        console.error('Failed to fetch drainage diagnosis from API:', err);
      } finally {
        if (!isCancelled) setIsLoadingApi(false);
      }
    };

    fetchDiagnosis();

    return () => {
      isCancelled = true;
    };
  }, [selectedRecord.sr_no, isDemoMode]);

  // Deterministic local computation matching the 4-matrix requirements for instant response
  const activeDiagnosis = useMemo(() => {
    if (apiDiagnosis) return apiDiagnosis;

    const r = selectedRecord;
    const cond = (r.drainage_condition || 'NORMAL').toUpperCase();
    const risk = (r.drainage_risk || 'MODERATE').toUpperCase();

    // Mode-specific inputs
    let rainfall = 18.0;
    let waterDepthText = 'High (1.2 to 1.8 feet (Knee depth))';
    let reportsCount = 14;

    if (!isDemoMode) {
      // LIVE mode
      rainfall = 32.0;
      waterDepthText = 'Moderate (0.6 to 1.0 feet)';
      reportsCount = 6;
    } else {
      // DEMO mode
      if (cond === 'CHOKED' || cond === 'STRESSED') {
        rainfall = 18.0;
        waterDepthText = 'High (1.2 to 1.8 feet (Knee depth))';
        reportsCount = 14;
      } else if (risk === 'CRITICAL' || risk === 'HIGH') {
        rainfall = 78.0;
        waterDepthText = 'High (1.5 to 2.2 feet)';
        reportsCount = 18;
      } else {
        rainfall = 8.0;
        waterDepthText = 'Low (Normal road surface / Puddles)';
        reportsCount = 1;
      }
    }

    if (input) {
      if (typeof input.rainfallMmHr === 'number') rainfall = input.rainfallMmHr;
      if (input.observedWaterDepthText) waterDepthText = String(input.observedWaterDepthText);
      if (typeof input.citizenReportsCount === 'number') reportsCount = input.citizenReportsCount;
    }


    const isStressedOrChoked = cond === 'STRESSED' || cond === 'CHOKED';
    const isHighAccumulation = waterDepthText.toLowerCase().includes('high') || waterDepthText.toLowerCase().includes('knee');
    const isModerateRain = rainfall >= 12.0 && rainfall < 45.0;
    const isHeavyRain = rainfall >= 45.0;

    let state = 'NORMAL_DRAINAGE';
    let stateTitle = 'NORMAL DRAINAGE PREDICTED';
    let statusLabel = '🟢 NORMAL DRAINAGE';
    let symbol = '🟢';
    let bgClass = 'bg-emerald-500/10';
    let borderClass = 'border-emerald-300';
    let textClass = 'text-emerald-900';
    let headline = 'Surface runoff is predicted to drain smoothly with no waterlogging expected.';
    let mainReason = 'Nominal Gravity Flow — Clear Subsurface Conduits';
    let conclusion = 'Water accumulation is consistent with current rainfall.';
    let onsetTime = 'No waterlogging predicted';
    let peakTime = 'Clear flow maintained';

    if (isModerateRain && isHighAccumulation && isStressedOrChoked) {
      state = 'PROBABLE_BLOCKAGE';
      stateTitle = 'PREDICTED DRAINAGE BLOCKAGE';
      statusLabel = '🟠 PREDICTED OBSTRUCTION';
      symbol = '🟠';
      bgClass = 'bg-amber-500/15';
      borderClass = 'border-amber-400';
      textClass = 'text-amber-900';
      headline = 'Water is predicted to accumulate rapidly due to drainage obstruction.';
      mainReason = 'Probable Drainage Blockage — Field Verification Required';
      conclusion = 'Water is predicted to accumulate unusually high for current rainfall.';
      onsetTime = 'Starts in 20–35 minutes';
      peakTime = 'Full backpressure in ~45 mins';
    } else if (isHeavyRain && isHighAccumulation && !isStressedOrChoked) {
      state = 'RAINFALL_DRIVEN';
      stateTitle = 'RAINFALL-DRIVEN WATERLOGGING';
      statusLabel = '🔴 EXTREME INTENSITY';
      symbol = '🔴';
      bgClass = 'bg-red-500/15';
      borderClass = 'border-red-400';
      textClass = 'text-red-900';
      headline = 'High intensity precipitation exceeding gravity hydraulic design capacity.';
      mainReason = 'Precipitation Rate Exceeds Pipe Flow Capacity (No Blockage Detected)';
      conclusion = 'Severe rainfall inundation occurs even while internal conduit flow remains clear.';
      onsetTime = 'Starts in 10–20 minutes';
      peakTime = 'Peak street surcharge in ~30 mins';
    } else if ((isHeavyRain || isModerateRain) && isStressedOrChoked && isHighAccumulation) {
      state = 'COMBINED_RISK';
      stateTitle = 'COMBINED WATERLOGGING RISK';
      statusLabel = '🔴 SEVERE DRAINAGE RESTRICTION';
      symbol = '🔴';
      bgClass = 'bg-rose-500/15';
      borderClass = 'border-rose-400';
      textClass = 'text-rose-900';
      headline = 'Severe water accumulation driven by both intense rain and poor drainage condition.';
      mainReason = 'Probable Drainage Blockage & Hydraulic Overload — Field Verification Required';
      conclusion = 'High rainfall combined with choked underground culvert leads to extensive street inundation.';
      onsetTime = 'Immediate / Ongoing';
      peakTime = 'Severe surcharge reaching crest in ~25 mins';
    }

    const roadSegment = r.sewer_stretch_location;
    const area = r.area;
    const ward = r.ward_or_zone;
    const probableLocation = `Drainage Point — ${roadSegment}`;

    const citizenAction = state !== 'NORMAL_DRAINAGE'
      ? `Avoid ${roadSegment} in ${area} (Ward ${ward}) if possible. Predicted runoff surcharge will pool in low-lying curb lanes. Use alternate arterial corridors.`
      : `${roadSegment} in ${area} is clear for normal transit.`;

    const authorityAction = state !== 'NORMAL_DRAINAGE'
      ? `Inspect nearby drainage nodes along ${roadSegment} (${probableLocation}). Check silt traps across ${r.estimated_manhole_count} manholes and verify ${r.sewer_diameter_mm}mm conduit clearance.`
      : `Routine maintenance patrol along ${roadSegment}. ${r.estimated_manhole_count} manholes at ~${r.typical_manhole_spacing_m}m spacing nominal.`;

    return {
      state,
      state_badge: { symbol, title: stateTitle, bg_class: bgClass, border_class: borderClass, text_class: textClass },
      status_label: statusLabel,
      headline,
      main_reason: mainReason,
      predicted_start_time: onsetTime,
      predicted_peak_time: peakTime,
      probable_location: probableLocation,
      verification_notice: 'Field verification required',
      why: {
        rainfall_text: `${rainfall < 30 ? 'Light / Moderate' : 'Heavy'} (${rainfall.toFixed(0)} mm/hr)`,
        accumulation_text: waterDepthText,
        reports_text: `Multiple (${reportsCount} reports)`,
        drainage_condition_text: `${cond} (${r.sewer_diameter_mm}mm Ø)`,
        summary: conclusion
      },
      actions: {
        citizen: citizenAction,
        authority: authorityAction
      }
    };
  }, [selectedRecord, isDemoMode, apiDiagnosis]);

  const isBlockageOrIssue = activeDiagnosis.state !== 'NORMAL_DRAINAGE';

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden p-5 sm:p-7 space-y-6">
      {/* 1. TOP HEADER: Title & Search with Autocomplete */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
            🕳️
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-950 font-mono tracking-tight">
              {tr('Why is this road flooded? (Drain Diagnosis)')}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {tr('Underground drain analysis & waterlogging timing forecast')}
            </p>
          </div>
        </div>

        {/* Dynamic Search Road / Area / Ward with Autocomplete */}
        <div className="relative w-full lg:w-96" ref={searchContainerRef}>
          <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-300 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 px-3 py-1.5 transition">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder={tr('Search Road / Area / Ward (500+ records)...')}
              className="w-full bg-transparent text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults(ALL_RECORDS.slice(0, 15));
                }}
                className="text-xs text-slate-400 hover:text-slate-600 px-1 font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 max-h-72 overflow-y-auto divide-y divide-slate-100">
              <div className="p-2 bg-slate-50 text-[10px] font-mono font-bold text-slate-500 uppercase flex items-center justify-between">
                <span>Matching Mumbai Drainage Records ({searchResults.length})</span>
                <span className="text-sky-600 font-black">FastAPI Indexed</span>
              </div>
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  {tr('No matching drainage stretch found')}
                </div>
              ) : (
                searchResults.map((rec) => {
                  const isSelected = selectedRecord.sr_no === rec.sr_no;
                  const condColor =
                    rec.drainage_condition === 'CHOKED'
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : rec.drainage_condition === 'STRESSED'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300';

                  return (
                    <div
                      key={rec.sr_no}
                      onClick={() => {
                        setSelectedRecord(rec);
                        setSearchQuery(rec.sewer_stretch_location);
                        setIsSearchOpen(false);
                      }}
                      className={`p-2.5 hover:bg-sky-50/70 transition cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected ? 'bg-sky-50/90' : ''
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {rec.sewer_stretch_location}
                          </span>
                          {isSelected && <Check className="w-3 h-3 text-sky-600 shrink-0" />}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{rec.area}</span>
                          <span>•</span>
                          <span className="font-mono">Ward {rec.ward_or_zone}</span>
                          <span>•</span>
                          <span className="font-mono">{rec.sewer_diameter_mm}mm Ø</span>
                        </div>
                      </div>

                      <span className={`text-[9px] font-black uppercase font-mono px-2 py-0.5 rounded border shrink-0 ${condColor}`}>
                        {rec.drainage_condition}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Current Selection Chip */}
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-600 truncate">
            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
            <span className="text-slate-900 truncate">{selectedRecord.sewer_stretch_location}</span>
            <span className="text-slate-400">·</span>
            <span>{selectedRecord.area}</span>
            <span className="text-slate-400">·</span>
            <span className="bg-slate-100 px-1.5 py-0.2 rounded text-slate-700">Ward {selectedRecord.ward_or_zone}</span>
          </div>
        </div>
      </div>

      {/* 2. DYNAMICALLY LOADED SEWER ASSET METRICS STRIP */}
      <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-200/90 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-mono font-black uppercase tracking-wider text-slate-700 text-[10px] flex items-center gap-1.5">
            <span>⚙️ DRAINAGE ASSET ATTRIBUTES:</span>
            <span className="text-sky-700 font-bold">{selectedRecord.sewer_stretch_location}</span>
          </span>
          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300">
            {selectedRecord.data_status || 'SYNTHETIC PROTOTYPE ESTIMATE'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Sewer Diameter</span>
            <span className="font-black font-mono text-slate-900 text-sm">{selectedRecord.sewer_diameter_mm} mm</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Segment Length</span>
            <span className="font-black font-mono text-slate-900 text-sm">{selectedRecord.sewer_length_m} m</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Manhole Depth</span>
            <span className="font-black font-mono text-slate-900 text-sm">{selectedRecord.manhole_depth_min_m}m – {selectedRecord.manhole_depth_max_m}m</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Manhole Nodes</span>
            <span className="font-black font-mono text-slate-900 text-sm">{selectedRecord.estimated_manhole_count} (~{selectedRecord.typical_manhole_spacing_m}m)</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Condition</span>
            <span className={`font-black font-mono text-xs uppercase ${
              selectedRecord.drainage_condition === 'CHOKED'
                ? 'text-red-700'
                : selectedRecord.drainage_condition === 'STRESSED'
                ? 'text-amber-700'
                : 'text-emerald-700'
            }`}>
              {selectedRecord.drainage_condition}
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Drainage Risk</span>
            <span className={`font-black font-mono text-xs uppercase ${
              selectedRecord.drainage_risk === 'CRITICAL' || selectedRecord.drainage_risk === 'HIGH'
                ? 'text-red-700'
                : selectedRecord.drainage_risk === 'MODERATE'
                ? 'text-amber-700'
                : 'text-emerald-700'
            }`}>
              {selectedRecord.drainage_risk}
            </span>
          </div>
        </div>
      </div>

      {/* 3. MAIN PRIMARY DIAGNOSIS BANNER (As in Screenshot) */}
      <div className={`p-5 sm:p-6 rounded-2xl border-2 space-y-3 transition-colors ${
        activeDiagnosis.state === 'PROBABLE_BLOCKAGE'
          ? 'bg-amber-50/70 border-amber-300'
          : activeDiagnosis.state === 'RAINFALL_DRIVEN'
          ? 'bg-red-50/70 border-red-300'
          : activeDiagnosis.state === 'COMBINED_RISK'
          ? 'bg-rose-50/70 border-rose-300'
          : 'bg-emerald-50/70 border-emerald-300'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xl sm:text-2xl font-black font-mono flex items-center gap-2 tracking-tight text-slate-950">
            <span>{activeDiagnosis.state_badge?.symbol || '🟠'}</span>
            <span>{tr(activeDiagnosis.state_badge?.title || 'PREDICTED DRAINAGE BLOCKAGE')}</span>
          </div>

          <span className="text-[11px] font-black uppercase font-mono px-2.5 py-0.5 rounded-full bg-white/90 border border-slate-300 text-slate-700">
            {tr(activeDiagnosis.status_label || '🟠 PREDICTED OBSTRUCTION')}
          </span>
        </div>

        <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
          {tr(activeDiagnosis.headline)}
        </p>

        {/* PREDICTED ONSET TIMING (Dark Bar as in Screenshot) */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-950 text-white rounded-xl shadow-xs border border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono">
                {t.spreadSimulationTitle}
              </div>
              <div className="text-sm font-black font-mono text-white flex items-center gap-1.5">
                <span>⏱️</span>
                <span>{tr(activeDiagnosis.predicted_start_time)}</span>
              </div>
            </div>
          </div>

          {activeDiagnosis.predicted_peak_time && activeDiagnosis.predicted_peak_time !== 'N/A' && (
            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800 w-full sm:w-auto">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                {t.estimatedTime}
              </div>
              <div className="text-xs font-mono font-bold text-slate-200">
                🌊 {tr(activeDiagnosis.predicted_peak_time)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. MAIN REASON (As in Screenshot) */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono block">
          {t.primaryCause}
        </span>
        <div className="text-sm sm:text-base font-black text-slate-950">
          {tr(activeDiagnosis.main_reason)}
        </div>
      </div>

      {/* 5. WHY THIS WATERLOGGING PREDICTION? (As in Screenshot) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="text-[11px] font-black uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
          <span>WHY THIS WATERLOGGING PREDICTION?</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] uppercase font-mono font-bold block mb-0.5">
              Rainfall
            </span>
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>🌧</span>
              <span>{activeDiagnosis.why?.rainfall_text}</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] uppercase font-mono font-bold block mb-0.5">
              Water Accumulation
            </span>
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>💧</span>
              <span>{activeDiagnosis.why?.accumulation_text}</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] uppercase font-mono font-bold block mb-0.5">
              Nearby Reports
            </span>
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>👥</span>
              <span>{activeDiagnosis.why?.reports_text}</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 font-medium pt-1">
          <strong>Conclusion: </strong>
          <span>{activeDiagnosis.why?.summary}</span>
        </div>
      </div>

      {/* 6. PROBABLE LOCATION (As in Screenshot) */}
      {isBlockageOrIssue && (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 font-mono block">
            PROBABLE LOCATION
          </span>
          <div className="text-sm sm:text-base font-black text-slate-950 font-mono flex items-center gap-1.5">
            <span>📍 {activeDiagnosis.probable_location}</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-red-700">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>⚠ {activeDiagnosis.verification_notice || 'Field verification required'}</span>
          </div>
        </div>
      )}

      {/* 7. WHAT SHOULD I DO? (With Refined Road Avoidance Details as Requested) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white space-y-3">
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono block">
          WHAT SHOULD I DO?
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              For Citizens & Drivers:
            </span>
            <div className="font-bold text-white text-xs leading-relaxed">
              {activeDiagnosis.actions?.citizen}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              For Municipal / Response Teams:
            </span>
            <div className="font-bold text-white text-xs leading-relaxed">
              {activeDiagnosis.actions?.authority}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
