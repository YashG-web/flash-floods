import React, { useState } from 'react';
import { diagnoseInverseHydraulics } from '../services/hydraulicDiagnosis';
import type {
  HydraulicDiagnosisInput,
  HydraulicDiagnosisResult,
  DrainageNode
} from '../services/hydraulicDiagnosis';
import { useTranslation } from '../services/LanguageContext';
import {
  AlertTriangle,
  ArrowRight,
  Construction,
  GitBranch,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Check,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';

interface InverseHydraulicDiagnosisCardProps {
  input: HydraulicDiagnosisInput;
  onOpenReport?: () => void;
}

export const InverseHydraulicDiagnosisCard: React.FC<InverseHydraulicDiagnosisCardProps> = ({
  input,
  onOpenReport
}) => {
  const { t, tr } = useTranslation();
  const diagnosis: HydraulicDiagnosisResult = diagnoseInverseHydraulics(input);
  const simple = diagnosis.simple;

  const [showTraceModal, setShowTraceModal] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<DrainageNode | null>(
    diagnosis.probableBlockageNode || diagnosis.tracePath[3]
  );
  const [inspectionMarked, setInspectionMarked] = useState<boolean>(false);
  const [showAuthorityMode, setShowAuthorityMode] = useState<boolean>(false);

  const isBlockage = simple.state === 'PROBABLE_BLOCKAGE' || simple.state === 'POSSIBLE_ISSUE';
  const isSevereRain = simple.state === 'SEVERE_WATERLOGGING';

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden p-6 sm:p-7 space-y-6">
      {/* 1. TOP HEADER: Title & Location */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
            🕳️
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-950 font-mono tracking-tight">
              {t.hydraulicDiagnosisTitle}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t.hydraulicDiagnosisSubtitle}
            </p>
          </div>
        </div>

        {/* Location Badge (Section 12 requirement: Clean "📍 Road Name · Ward 12") */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800 self-start sm:self-auto">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <span>{input.roadName}</span>
          <span className="text-slate-400">·</span>
          <span>{input.wardId.replace('-', ' ').toUpperCase()}</span>
        </div>
      </div>

      {/* 2. MAIN PRIMARY DIAGNOSIS (Section 13: Large title, short explanation) */}
      <div className={`p-5 sm:p-6 rounded-2xl border-2 space-y-3 transition-colors ${
        simple.state === 'PROBABLE_BLOCKAGE'
          ? 'bg-amber-50/70 border-amber-300'
          : simple.state === 'SEVERE_WATERLOGGING'
          ? 'bg-red-50/70 border-red-300'
          : simple.state === 'POSSIBLE_ISSUE'
          ? 'bg-yellow-50/70 border-yellow-300'
          : simple.state === 'INSUFFICIENT_DATA'
          ? 'bg-slate-50 border-slate-200'
          : 'bg-emerald-50/70 border-emerald-300'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xl sm:text-2xl font-black font-mono flex items-center gap-2 tracking-tight text-slate-950">
            <span>{simple.stateBadge.symbol}</span>
            <span>{tr(simple.stateBadge.title)}</span>
          </div>

          <span className="text-[11px] font-black uppercase font-mono px-2.5 py-0.5 rounded-full bg-white/90 border border-slate-300 text-slate-700">
            {tr(simple.statusLabel)}
          </span>
        </div>

        <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
          {tr(simple.headline)}
        </p>

        {/* PREDICTED ONSET TIMING */}
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
                <span>{tr(simple.predictedStartTime)}</span>
              </div>
            </div>
          </div>

          {simple.predictedPeakTime && simple.predictedPeakTime !== 'N/A' && (
            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800 w-full sm:w-auto">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                {t.estimatedTime}
              </div>
              <div className="text-xs font-mono font-bold text-slate-200">
                🌊 {tr(simple.predictedPeakTime)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. PROBABLE CAUSE */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono block">
          {t.primaryCause}
        </span>
        <div className="text-sm sm:text-base font-black text-slate-950">
          {tr(simple.probableCause)}
        </div>
      </div>

      {/* 4. CLEAR 'WHY?' SECTION (Section 8: 2-3 simple reasons, no math) */}
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
              <span>{simple.why.rainfallText}</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] uppercase font-mono font-bold block mb-0.5">
              Water Accumulation
            </span>
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>💧</span>
              <span>{simple.why.accumulationText}</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] uppercase font-mono font-bold block mb-0.5">
              Nearby Reports
            </span>
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span>📸</span>
              <span>{simple.why.reportsText}</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 font-medium pt-1">
          <strong>Conclusion: </strong>
          <span>{simple.why.summary}</span>
        </div>
      </div>

      {/* 5. PROBABLE LOCATION (When blockage or issue suspected) */}
      {isBlockage && (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 font-mono block">
            PROBABLE LOCATION
          </span>
          <div className="text-sm sm:text-base font-black text-slate-950 font-mono flex items-center gap-1.5">
            <span>📍 {simple.likelyLocation}</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-red-700">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>⚠ {simple.verificationNotice}</span>
          </div>
        </div>
      )}

      {/* 6. WHAT SHOULD I DO? (Section 9: Clear separate actions for Citizen vs Authority) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white space-y-3">
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono block">
          WHAT SHOULD I DO?
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              For Citizens & Drivers:
            </span>
            <div className="font-bold text-white text-xs">
              {simple.actions.citizen}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
              For Municipal / Response Teams:
            </span>
            <div className="font-bold text-white text-xs">
              {simple.actions.authority}
            </div>
          </div>
        </div>
      </div>

      {/* 7. ACTION BAR: View Drainage Trace & Authority Toggle */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowTraceModal(!showTraceModal)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <GitBranch className="w-4 h-4 text-amber-400" />
          <span>{showTraceModal ? 'HIDE DRAINAGE TRACE' : 'VIEW DRAINAGE TRACE'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => setShowAuthorityMode(!showAuthorityMode)}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
        >
          <span>🔬 Authority Analysis Mode</span>
          {showAuthorityMode ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 8. SIMPLE DRAINAGE TRACE VISUAL (Section 10 requirement) */}
      {showTraceModal && (
        <div className="bg-slate-950 text-white rounded-2xl p-5 sm:p-6 space-y-5 border border-slate-800 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-400 font-mono tracking-widest">
                DIGITAL DRAINAGE NETWORK
              </span>
              <h4 className="text-base font-black text-white font-mono flex items-center gap-2 mt-0.5">
                <span>INFERRED DRAINAGE FLOW PATH</span>
              </h4>
            </div>

            <div className="text-xs text-amber-400 font-mono font-bold flex items-center gap-1.5">
              <span>⚠ Field verification required</span>
            </div>
          </div>

          {/* Simple Visual Flow (Section 10: WATERLOGGED ROAD → DRAIN INLET → PIPE NETWORK → PROBABLE BLOCKAGE → OUTLET) */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[620px] flex items-center justify-between gap-2">
              {diagnosis.tracePath.map((node, idx) => {
                const isProbable = node.status === 'PROBABLE_BLOCKAGE' && isBlockage;
                const isSelected = selectedNode?.id === node.id;
                return (
                  <React.Fragment key={node.id}>
                    <div
                      onClick={() => setSelectedNode(node)}
                      className={`p-3 rounded-xl border text-center transition cursor-pointer shrink-0 max-w-[130px] ${
                        isProbable
                          ? 'bg-amber-950/90 border-amber-500 ring-2 ring-amber-400/60 shadow-md'
                          : isSelected
                          ? 'bg-slate-800 border-sky-400'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs mb-1">
                        {isProbable ? '🟠' : node.type === 'ROAD_SURFACE' ? '🔵' : node.type === 'OUTFALL' ? '🌊' : '🔘'}
                      </div>
                      <div className="font-bold text-[11px] text-white truncate font-mono">
                        {node.name.split(' ')[0]} {node.name.split(' ')[1] || ''}
                      </div>
                      <div className={`text-[9px] font-mono mt-0.5 ${
                        isProbable ? 'text-amber-400 font-black' : 'text-slate-400'
                      }`}>
                        {isProbable ? 'PROBABLE BLOCKAGE' : node.type.replace('_', ' ')}
                      </div>
                    </div>

                    {idx < diagnosis.tracePath.length - 1 && (
                      <div className="flex flex-col items-center justify-center shrink-0 text-slate-600">
                        <span className="text-xs animate-pulse text-amber-400">→</span>
                        <span className="text-[8px] font-mono">flow</span>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Node Inspector & Mark For Inspection Button */}
          {selectedNode && (
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {selectedNode.status === 'PROBABLE_BLOCKAGE' && isBlockage ? '🟠' : '🔘'}
                  </span>
                  <div>
                    <h5 className="text-sm font-black font-mono text-white">
                      {selectedNode.name} ({selectedNode.id})
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      {selectedNode.notes}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-amber-400">
                  {selectedNode.status === 'PROBABLE_BLOCKAGE' && isBlockage ? 'Probable Hidden Obstruction' : 'Operational Conduit'}
                </span>
              </div>

              {/* Recommended Action & Mark for Inspection Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="text-xs text-slate-300">
                  <b className="text-amber-400 font-mono">Action:</b> {diagnosis.recommendedAction}
                </div>

                <div className="shrink-0 w-full sm:w-auto">
                  {inspectionMarked ? (
                    <div className="p-3 bg-amber-500/15 border border-amber-400 text-amber-200 text-xs font-mono rounded-xl space-y-1">
                      <div className="flex items-center justify-between gap-3 font-black text-amber-300">
                        <span>STATUS: 🟠 INSPECTION REQUIRED</span>
                        <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black">PRIORITY: HIGH</span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        <span className="text-slate-400 font-bold">Location:</span> Manhole MH-07 | <span className="text-slate-400 font-bold">Issue:</span> Probable hidden drainage blockage
                      </div>
                      <div className="text-[11px] text-slate-200">
                        <span className="text-slate-400 font-bold">Recommended:</span> "Inspect drainage node and connected upstream segment."
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setInspectionMarked(true)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Construction className="w-3.5 h-3.5" />
                      <span>MARK FOR INSPECTION</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 9. AUTHORITY ANALYSIS MODE (Section 11: All technical metrics tucked inside here) */}
      {showAuthorityMode && (
        <div className="p-5 bg-slate-100 rounded-2xl border border-slate-300 space-y-3 text-xs font-mono text-slate-800 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="font-black text-slate-900 text-sm">
              🔬 AUTHORITY HYDRAULIC ATTRIBUTION ENGINE
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-amber-300 rounded font-bold">
              ENGINEERING AUDIT
            </span>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] block">Runoff Equation:</span>
              <strong className="text-slate-900">{diagnosis.engineeringDetails.formula}</strong>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] block">Runoff Coeff (C):</span>
              <strong className="text-slate-900">{diagnosis.engineeringDetails.cCoefficient} (Dense Asphalt / Bazaar)</strong>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] block">Expected Discharge (Q):</span>
              <strong className="text-slate-900">{diagnosis.engineeringDetails.expectedDischargeCumecs} m³/s</strong>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-[10px]">Relative Hydraulic Resistance Anomaly:</span>
              <span className="font-bold text-amber-700">{diagnosis.relativeResistance}</span>
            </div>
            <p className="text-[11px] text-slate-600">{diagnosis.relativeResistanceExplanation}</p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] block">Model Confidence Tier (Evidence-Weighted):</span>
            <span className="font-bold text-slate-900">{diagnosis.confidenceLevel}</span>
            <div className="pt-1.5 space-y-1 text-[11px] text-slate-600">
              {diagnosis.evidenceChecklist.map((ev, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{ev}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
