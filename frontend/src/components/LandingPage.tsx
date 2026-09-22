import type { LocationData, EarlyWarningAlert, FlashFloodWarning, LiveEnvironmentalData } from '../types';
import {
  ShieldAlert,
  ArrowRight,
  Camera,
  MapPin,
  Clock,
  Droplets,
  CloudRain,
  Construction,
  Bell,
  CheckCircle2
} from 'lucide-react';

interface LandingPageProps {
  locations: LocationData[];
  selectedLocation: LocationData | null;
  onSelectLocation: (loc: LocationData) => void;
  alerts: EarlyWarningAlert[];
  activeFlashWarning: FlashFloodWarning | null;
  lastUpdated: string;
  isDemoMode?: boolean;
  activeScenario?: string;
  liveEnvironment?: LiveEnvironmentalData | null;
  onNavigateToMap: () => void;
  onOpenReportModal: () => void;
  onNavigateToAlerts: () => void;
  onNavigateToReport: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  alerts,
  activeFlashWarning,
  lastUpdated,
  isDemoMode = true,
  activeScenario,
  liveEnvironment,
  onNavigateToMap,
  onOpenReportModal,
  onNavigateToAlerts,
  onNavigateToReport
}) => {
  // Default to first location if none selected
  const activeLoc = selectedLocation || locations[0] || {
    id: 'ward-12',
    name: 'Ward 12 (Station Road / Market)',
    risk_level: 'HIGH',
    risk_probability: 78,
    rainfall: 42,
    drainage_condition: 18,
    soil_moisture: 82,
    cause_intelligence: {
      probable_cause: 'Drainage Culvert Choke + Moderate Rainfall',
      explanation: 'Moderate rainfall combined with severe drain blockage is causing water to accumulate on Main Market Road.'
    }
  } as LocationData;

  const riskLevel = activeLoc.risk_level || 'LOW';
  const hasActiveWarning = activeFlashWarning && activeFlashWarning.status !== 'NONE';

  const getRiskVisuals = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return {
          badgeBg: 'bg-red-600',
          textColor: 'text-red-700',
          borderColor: 'border-red-400',
          symbol: '🔴',
          label: 'CRITICAL RISK',
          subtext: 'Severe flood danger. Immediate caution required.'
        };
      case 'HIGH':
        return {
          badgeBg: 'bg-orange-600',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-400',
          symbol: '🟠',
          label: 'HIGH RISK',
          subtext: 'Waterlogging developing on roads. Avoid affected streets.'
        };
      case 'MODERATE':
        return {
          badgeBg: 'bg-amber-600',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-400',
          symbol: '🟡',
          label: 'MODERATE RISK',
          subtext: 'Rising water levels observed in low-lying spots.'
        };
      default:
        return {
          badgeBg: 'bg-emerald-600',
          textColor: 'text-emerald-700',
          borderColor: 'border-emerald-400',
          symbol: '🟢',
          label: 'LOW RISK',
          subtext: 'Normal water flow. No immediate flood threat.'
        };
    }
  };

  const riskVisual = getRiskVisuals(riskLevel);

  const getPlainExplanation = () => {
    if (activeLoc.cause_intelligence?.explanation) {
      return activeLoc.cause_intelligence.explanation;
    }
    if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
      if (activeLoc.rainfall > 60) {
        return 'Heavy rainfall is increasing water levels in low-lying areas and overflowing local channels.';
      }
      return 'Moderate rainfall combined with suspected drainage blockage is increasing local waterlogging risk.';
    }
    return 'Rainfall and drainage conditions are currently normal across this sector.';
  };

  const rainfallStatus = activeLoc.rainfall > 60 ? 'Heavy' : activeLoc.rainfall > 25 ? 'Moderate' : 'Normal';
  const drainageStatus = activeLoc.drainage_condition < 35 ? 'Severely Choked' : activeLoc.drainage_condition < 65 ? 'Slow / Sluggish' : 'Clear & Flowing';
  const soilStatus = activeLoc.soil_moisture > 75 ? 'Saturated' : activeLoc.soil_moisture > 50 ? 'Partially Damp' : 'Dry';

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-12">

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200">
        <img
          src="/assets/hero.jpg"
          alt="Monsoon Valley Flood Context"
          className="w-full h-36 sm:h-44 object-cover filter contrast-110 brightness-90"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/60 to-transparent flex flex-col justify-end p-5 sm:p-6 text-white">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Community Flood Safety Portal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Local Flood Risk & Early Warning
          </h2>
          <p className="text-xs sm:text-sm text-slate-200">
            Real-time hazard warnings for residents, drivers, shopkeepers, and municipal workers.
          </p>
        </div>
      </div>

      {/* Active Warning Banner (compact, links to Alerts page) */}
      {hasActiveWarning && (
        <button
          onClick={onNavigateToAlerts}
          className="w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl px-5 py-3.5 flex items-center justify-between gap-3 shadow-sm transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl animate-pulse">🚨</span>
            <div className="text-left">
              <div className="text-xs font-black uppercase tracking-wider opacity-90">Active Warning</div>
              <div className="text-sm font-black">
                {activeFlashWarning?.statusLabel} — {activeFlashWarning?.locationName}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold shrink-0">
            <span>VIEW DETAILS</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      )}

      {/* Mode Status Banner */}
      {!isDemoMode ? (
        <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 border border-emerald-500/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-emerald-400 tracking-wide text-xs uppercase">
                  ● LIVE ENVIRONMENTAL TELEMETRY ACTIVE
                </span>
                <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-700/50">
                  REAL-TIME ADAPTED
                </span>
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Observed Weather: <strong className="text-white">Open-Meteo</strong> • Government Alerts: <strong className="text-white">IMD CAP Feed</strong>
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right font-mono text-[11px] text-slate-300 shrink-0">
            <div>Last Observed: <span className="text-emerald-300 font-bold">{liveEnvironment?.observed_at || lastUpdated}</span></div>
            <div className="text-slate-400 text-[10px]">Synced: {liveEnvironment?.retrieved_at || lastUpdated}</div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-950/90 text-white rounded-3xl p-4 sm:p-5 border border-amber-600/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 text-base">
              ⚙
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-amber-400 tracking-wide text-xs uppercase">
                  DEMO / SCENARIO TESTING MODE
                </span>
                <span className="bg-amber-900 text-amber-200 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-600/50">
                  CONTROLLED SIMULATION
                </span>
              </div>
              <p className="text-amber-100 text-[11px] mt-0.5">
                Active Scenario: <strong className="text-white">{activeScenario?.replace(/_/g, ' ').toUpperCase() || 'DEMO SCENARIO'}</strong> • Inputs do not affect live system
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right text-[11px] text-amber-200/90 shrink-0">
            <div>Mode: <span className="text-white font-bold">Offline Simulation</span></div>
            <div className="text-amber-300/70 text-[10px]">Adjust in Authority Center</div>
          </div>
        </div>
      )}

      {/* CURRENT FLOOD RISK — Primary Section */}
      <section className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6 sm:p-8">
        {/* Header row: label + ward selector + last updated */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                {!isDemoMode ? 'CURRENT HYPERLOCAL RISK' : 'SIMULATED HYPERLOCAL RISK'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                !isDemoMode ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {!isDemoMode ? 'LIVE INFERENCE' : 'SIMULATED'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sky-600 shrink-0" />
              <select
                value={activeLoc.id}
                onChange={(e) => {
                  const found = locations.find(l => l.id === e.target.value);
                  if (found) onSelectLocation(found);
                }}
                className="text-lg sm:text-xl font-black text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-500 flex items-center sm:justify-end gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Telemetry freshness: <strong className="text-slate-800">{lastUpdated || 'Recent'}</strong></span>
          </div>
        </div>

        {/* Risk Level Badge */}
        <div className="py-7 sm:py-9 flex flex-col items-center text-center">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-mono mb-2">
            {!isDemoMode ? 'JALRAKSHAK RISK ASSESSMENT (AI Model)' : 'JALRAKSHAK SIMULATED RISK ASSESSMENT'}
          </span>
          <div className={`inline-flex items-center gap-3 px-6 sm:px-10 py-4 sm:py-5 rounded-2xl text-white shadow-md ${riskVisual.badgeBg}`}>
            <span className="text-3xl sm:text-4xl">{riskVisual.symbol}</span>
            <span className="text-2xl sm:text-4xl font-black tracking-wide uppercase font-mono">
              {riskVisual.label}
            </span>
          </div>

          <p className="mt-3 text-sm sm:text-base font-semibold text-slate-700 max-w-lg">
            {riskVisual.subtext}
          </p>

          {/* Primary CTAs */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onNavigateToMap}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition cursor-pointer"
            >
              <span>VIEW RISK MAP</span>
              <ArrowRight className="w-4 h-4 text-sky-400" />
            </button>
            <button
              onClick={onNavigateToAlerts}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-sm border-2 border-slate-200 transition cursor-pointer"
            >
              <Bell className="w-4 h-4 text-red-500" />
              <span>VIEW ALERTS</span>
              {hasActiveWarning && (
                <span className="px-1.5 py-0.5 bg-red-600 text-white rounded-full text-[10px] font-black">1</span>
              )}
            </button>
          </div>
        </div>

        {/* WHAT IS HAPPENING? — Current Conditions */}
        <div className="mt-2 pt-6 border-t border-slate-100 bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              WHAT IS HAPPENING?
            </h3>
            <span className="text-[10px] font-mono text-slate-500">
              {!isDemoMode ? 'Source-by-variable verified' : 'Controlled simulation inputs'}
            </span>
          </div>

          <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed mb-4">
            {getPlainExplanation()}
          </p>

          {/* Condition Indicators with Transparent Provenance */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Rainfall */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-500 mb-1">
                <div className="flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-sky-600" />
                  <span>Rainfall</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  !isDemoMode ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {!isDemoMode ? 'OBSERVED' : 'SIMULATED'}
                </span>
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                {rainfallStatus} ({activeLoc.rainfall} mm/h)
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {!isDemoMode ? 'Source: Open-Meteo' : 'Scenario slider preset'}
              </div>
            </div>

            {/* Drainage Condition */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-500 mb-1">
                <div className="flex items-center gap-1.5">
                  <Construction className="w-4 h-4 text-amber-600" />
                  <span>Drain Condition</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  !isDemoMode ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-800'
                }`}>
                  {!isDemoMode ? 'BASELINE' : 'SIMULATED'}
                </span>
              </div>
              <div className={`text-sm font-extrabold ${activeLoc.drainage_condition < 40 ? 'text-red-600' : 'text-slate-900'}`}>
                {drainageStatus}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {!isDemoMode ? 'Civil standard (No live sensor stream)' : `Efficiency: ${activeLoc.drainage_condition}%`}
              </div>
            </div>

            {/* Soil Moisture */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-500 mb-1">
                <div className="flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  <span>Soil Moisture</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  !isDemoMode ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {!isDemoMode ? 'MODELED' : 'SIMULATED'}
                </span>
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                {soilStatus} ({activeLoc.soil_moisture}%)
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {!isDemoMode ? 'Source: Open-Meteo Hydrological' : 'Scenario soil saturation'}
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500 italic">
            {!isDemoMode
              ? 'External weather & hydrological observations are fed directly into the existing JalRakshak risk engine.'
              : 'Demonstration parameters allow manual risk evaluation across extreme cloudburst & choke point scenarios.'}
          </p>
        </div>
      </section>

      {/* No active warning: general safety reminder */}
      {!hasActiveWarning && (
        <section className="bg-emerald-50 rounded-3xl border-2 border-emerald-200 p-5 sm:p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black text-emerald-900 mb-1">No Active Warnings</div>
            <p className="text-xs text-emerald-800">
              Current conditions are within normal limits for this area. Stay alert if continuous rainfall begins. Keep roadside storm gutters free from debris.
            </p>
          </div>
        </section>
      )}

      {/* Report Flooding CTA */}
      <section className="bg-linear-to-br from-red-600 to-rose-700 rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
            <Camera className="w-3.5 h-3.5" />
            <span>Citizen Action</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black tracking-tight">
            See Flooding or a Blocked Drain?
          </h3>
          <p className="text-xs text-rose-100">
            Take a photo and report waterlogging on your street — your report alerts authorities and updates the live risk map.
          </p>
        </div>

        <button
          onClick={onNavigateToReport}
          className="shrink-0 px-5 py-3 rounded-2xl bg-white text-red-700 hover:bg-rose-50 font-black text-sm shadow-lg transition cursor-pointer flex items-center gap-2"
        >
          <Camera className="w-4 h-4 text-red-600" />
          <span>REPORT FLOODING</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};
