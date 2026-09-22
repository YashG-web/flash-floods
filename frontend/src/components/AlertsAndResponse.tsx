import type { EarlyWarningAlert, FlashFloodWarning, OfficialImdWarning, Hospital } from '../types';
import { FlashFloodWarningCard } from './FlashFloodWarningCard';
import { HospitalCapacityPanel } from './HospitalCapacityPanel';
import {
  Bell,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Activity,
  MapPin,
  AlertTriangle,
  ExternalLink,
  Info
} from 'lucide-react';

interface AlertsAndResponseProps {
  alerts: EarlyWarningAlert[];
  activeFlashWarning: FlashFloodWarning | null;
  isDemoMode?: boolean;
  activeScenario?: string;
  officialImdWarnings?: OfficialImdWarning[];
  hospitals?: Hospital[];
  onViewOnMap?: (locationId?: string) => void;
}

export const AlertsAndResponse: React.FC<AlertsAndResponseProps> = ({
  alerts,
  activeFlashWarning,
  isDemoMode = true,
  activeScenario,
  officialImdWarnings = [],
  hospitals = [],
  onViewOnMap
}) => {
  const hasActiveWarning = activeFlashWarning && activeFlashWarning.status !== 'NONE';

  // Secondary alerts that are not the main flash warning
  const secondaryAlerts = alerts.filter(
    a => a.location_id !== activeFlashWarning?.locationId
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">

      {/* Page Header */}
      <div className={`rounded-3xl border shadow-xs overflow-hidden ${
        hasActiveWarning ? 'border-red-300' : 'border-slate-200'
      } bg-white`}>
        <div className={`px-5 sm:px-6 py-4 flex items-center justify-between ${
          hasActiveWarning ? 'bg-red-600 text-white' : 'bg-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
              hasActiveWarning ? 'bg-white/20' : 'bg-red-100 text-red-600'
            }`}>
              <Bell className={`w-5 h-5 ${hasActiveWarning ? 'text-white' : 'text-red-600'}`} />
            </div>
            <div>
              <h2 className={`text-xl font-black tracking-tight font-mono ${
                hasActiveWarning ? 'text-white' : 'text-slate-900'
              }`}>
                ALERTS & EARLY WARNINGS
              </h2>
              <p className={`text-xs ${hasActiveWarning ? 'text-red-100' : 'text-slate-500'}`}>
                Active community hazard warnings, escalation timelines, and prescribed safety actions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono uppercase ${
              !isDemoMode ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {!isDemoMode ? 'LIVE MODE' : 'DEMO MODE'}
            </span>
            {hasActiveWarning ? (
              <span className="px-3 py-1 bg-white text-red-700 text-xs font-black rounded-full font-mono shrink-0 animate-pulse">
                1 ACTIVE
              </span>
            ) : (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full font-mono shrink-0">
                ALL CLEAR
              </span>
            )}
          </div>
        </div>
      </div>

      {/* OFFICIAL GOVERNMENT WARNING SECTION (India Meteorological Department - IMD) */}
      <section className="rounded-3xl border-2 border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono">
                OFFICIAL WEATHER WARNINGS — INDIA METEOROLOGICAL DEPARTMENT (IMD)
              </h3>
              <p className="text-[11px] text-slate-500">
                Direct statutory warnings retrieved via the official IMD Common Alerting Protocol (CAP)
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold hidden sm:inline">
            GOVT DATA SOURCE
          </span>
        </div>

        {!isDemoMode ? (
          officialImdWarnings && officialImdWarnings.length > 0 ? (
            <div className="space-y-3">
              {officialImdWarnings.map((warn, i) => (
                <div key={i} className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono bg-amber-200 text-amber-900">
                      OFFICIAL IMD WARNING
                    </span>
                    <span className="text-[11px] text-amber-800 font-mono">
                      Issued: {warn.published_at}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">{warn.title}</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">{warn.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 text-[11px] text-slate-500">
                    <span>Source: {warn.source}</span>
                    {warn.link && (
                      <a
                        href={warn.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-600 hover:underline flex items-center gap-1 font-bold"
                      >
                        <span>Official IMD Bulletin</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-black uppercase tracking-wide">
                  ✓ NO SEVERE WEATHER WARNING ISSUED BY IMD
                </div>
                <p className="text-xs text-emerald-800 mt-0.5">
                  India Meteorological Department (IMD) has issued no active heavy rainfall or flash flood warnings for the selected Uttarakhand district.
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 flex items-start gap-3">
            <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-black uppercase tracking-wide text-slate-900">
                OFFICIAL IMD BULLETINS PAUSED IN SIMULATION MODE
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Demonstration mode is active ({activeScenario?.replace(/_/g, ' ')}). Switch to <strong>LIVE DATA</strong> to retrieve real official meteorological warnings from IMD.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* No-warning state for JalRakshak system */}
      {!hasActiveWarning && (
        <div className="bg-white rounded-3xl border-2 border-emerald-300 shadow-xs p-7 sm:p-9">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-wider mb-1">
                <span>{!isDemoMode ? 'JALRAKSHAK RISK STATUS: NOMINAL' : 'SIMULATED STATUS: NOMINAL'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                ✓ NO ACTIVE FLASH FLOOD WARNING
              </h3>
              <p className="text-sm text-slate-600 mt-2 max-w-xl">
                Current conditions are being monitored across all municipal sectors. Drainage and river thresholds are within nominal limits.
              </p>
            </div>
          </div>

          {/* Monitoring info */}
          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500">Monitoring Status</div>
                <div className="font-extrabold text-slate-900 text-xs">All sensors active</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500">Drainage Status</div>
                <div className="font-extrabold text-slate-900 text-xs">Within limits</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500">Alert Engine</div>
                <div className="font-extrabold text-slate-900 text-xs">Running — no trigger</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Warning — Primary Flash Flood Warning Card */}
      {hasActiveWarning && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono">
              {!isDemoMode ? 'JALRAKSHAK HYPERLOCAL RISK ASSESSMENT' : 'SIMULATED HAZARD FORECAST (DEMO)'}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-black ${
              !isDemoMode ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {!isDemoMode ? 'AI INFERENCE' : 'SCENARIO SIMULATION'}
            </span>
          </div>
          <FlashFloodWarningCard
            warning={activeFlashWarning}
            onViewOnMap={onViewOnMap}
          />
        </div>
      )}

      {/* Active Warning — Contextual "What Should You Do?" */}
      {hasActiveWarning && activeFlashWarning && (
        <section className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
            <ShieldCheck className="w-6 h-6 text-sky-600" />
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
              WHAT SHOULD YOU DO?
            </h3>
          </div>

          <div className="space-y-3">
            {activeFlashWarning.actions.map((action, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm font-semibold ${
                  idx === 0
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : idx === 1
                    ? 'bg-orange-50 border-orange-200 text-orange-900'
                    : idx === 2
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <span className={`w-6 h-6 rounded-full text-white flex items-center justify-center shrink-0 text-xs font-black ${
                  idx === 0 ? 'bg-red-600' : idx === 1 ? 'bg-orange-600' : idx === 2 ? 'bg-amber-600' : 'bg-slate-700'
                }`}>
                  {idx + 1}
                </span>
                <span>{action}</span>
              </div>
            ))}

            {/* Drainage-specific tip if choked */}
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 text-xs font-medium">
              <strong>Emergency Helpline:</strong> Contact municipal disaster control room at{' '}
              <strong className="font-black font-mono">112</strong> if you are in immediate danger.
            </div>
          </div>
        </section>
      )}

      {/* Secondary Sector Advisories */}
      {secondaryAlerts.length > 0 && (
        <div className="space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 block px-1">
            Secondary Sector Bulletins
          </span>

          {secondaryAlerts.map((alert) => (
            <div
              key={alert.alert_id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{alert.location_name}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-amber-800 font-mono">{alert.severity}</span>
                </div>
                <p className="text-slate-600">{alert.headline}</p>
              </div>

              <button
                onClick={() => onViewOnMap && onViewOnMap(alert.location_id)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold shrink-0 self-start sm:self-auto cursor-pointer flex items-center gap-1"
              >
                <span>Inspect on Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Relevant Emergency Healthcare Facilities (Section 25 Requirement) */}
      <div className="pt-2">
        <HospitalCapacityPanel
          hospitals={hospitals}
          isDemoMode={isDemoMode}
          activeScenario={activeScenario}
          selectedLocationName={activeFlashWarning?.locationName}
          compact={false}
          onViewOnMap={() => {
            if (onViewOnMap) onViewOnMap();
          }}
        />
      </div>
    </div>
  );
};
