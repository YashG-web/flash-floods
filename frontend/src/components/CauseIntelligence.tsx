import React from 'react';
import type { CauseIntelligence } from '../types';
import { AlertTriangle, CloudRain, Construction, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CauseIntelligenceCardProps {
  cause?: CauseIntelligence;
  locationName?: string;
  rainfall?: number;
  drainageScore?: number;
  citizenReportsCount?: number;
}

export const CauseIntelligenceCard: React.FC<CauseIntelligenceCardProps> = ({
  cause,
  locationName = "Selected Ward",
  rainfall = 42,
  drainageScore = 22,
  citizenReportsCount = 14
}) => {
  if (!cause) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flood Cause Intelligence</div>
        <p className="text-sm text-slate-500 mt-2">Select a location on the map to evaluate diagnostic root cause.</p>
      </div>
    );
  }

  const isDrainageBlockage = cause.cause_code === 'DRAINAGE_BLOCKAGE';
  const isRainfallOverload = cause.cause_code === 'RAINFALL_OVERLOAD';
  const isCombined = cause.cause_code === 'COMBINED_RISK';

  return (
    <div className={`bg-white rounded-2xl border-2 p-5 shadow-sm overflow-hidden ${
      isDrainageBlockage
        ? 'border-amber-400 bg-amber-50/20'
        : isRainfallOverload
        ? 'border-red-400 bg-red-50/20'
        : 'border-slate-300'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
            isDrainageBlockage
              ? 'bg-amber-600'
              : isRainfallOverload
              ? 'bg-red-600'
              : 'bg-slate-700'
          }`}>
            {isDrainageBlockage ? <Construction className="w-5 h-5" /> : <CloudRain className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Diagnostic Cause Intelligence
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              {cause.probable_cause}
            </h3>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confidence</span>
          <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
            cause.confidence === 'HIGH'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-amber-100 text-amber-800 border border-amber-300'
          }`}>
            {cause.confidence} CONFIDENCE
          </span>
        </div>
      </div>

      {/* Explanation Quote */}
      <div className="bg-white/80 p-3 rounded-xl border border-slate-200 mb-3 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
        “{cause.explanation}”
      </div>

      {/* Trigger metrics row */}
      <div className="grid grid-cols-3 gap-2 bg-slate-100/70 p-2.5 rounded-xl border border-slate-200 text-xs mb-3">
        <div>
          <span className="text-[10px] text-slate-500 font-bold block">Rainfall Rate</span>
          <span className="font-extrabold text-slate-900">{rainfall} mm/h</span>
          <span className="text-[10px] text-slate-500 block">
            {rainfall > 60 ? 'Exceeds Design' : 'Moderate Inflow'}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 font-bold block">Drain Efficiency</span>
          <span className={`font-extrabold ${drainageScore < 40 ? 'text-red-600' : 'text-emerald-600'}`}>
            {drainageScore}/100
          </span>
          <span className="text-[10px] text-slate-500 block">
            {drainageScore < 40 ? 'Severe Silt/Choke' : 'Flowing'}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 font-bold block">Crowd Reports</span>
          <span className="font-extrabold text-red-600">{citizenReportsCount} Logs</span>
          <span className="text-[10px] text-slate-500 block">Station Road Cluster</span>
        </div>
      </div>

      {/* Diagnostic Signals Checklist */}
      {cause.key_signals && cause.key_signals.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Confirmed Diagnostic Signals
          </span>
          {cause.key_signals.map((signal, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{signal}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
