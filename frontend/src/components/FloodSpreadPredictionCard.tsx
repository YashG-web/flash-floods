import React, { useState, useEffect, useRef } from 'react';
import type { FloodSpreadSimulation, FloodSpreadStage, FloodSpreadStageKey } from '../services/floodSpreadService';
import { useTranslation } from '../services/LanguageContext';
import {
  Play,
  Pause,
  Clock,
  Waves,
  MapPin,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Maximize2
} from 'lucide-react';

interface FloodSpreadPredictionCardProps {
  simulation: FloodSpreadSimulation;
  activeStageKey: FloodSpreadStageKey;
  onSelectStage: (stageKey: FloodSpreadStageKey) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const FloodSpreadPredictionCard: React.FC<FloodSpreadPredictionCardProps> = ({
  simulation,
  activeStageKey,
  onSelectStage,
  isPlaying,
  onTogglePlay
}) => {
  const { t, tr } = useTranslation();
  const activeStage = simulation.stages[activeStageKey];
  const stageKeys = simulation.stageOrder;

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden p-5 sm:p-7 space-y-5">
      {/* 1. HEADER: Title, Subtitle & Clear Simulation Tag */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-blue-500/15 text-blue-700 border border-blue-300">
              {t.flashFloodCardTitle}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-amber-500/15 text-amber-800 border border-amber-300">
              {t.spreadSimulationTitle}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-slate-900 font-mono tracking-tight flex items-center gap-2 mt-1">
            <span>{t.spreadSimulationTitle}</span>
          </h3>

          <p className="text-xs text-slate-500">
            {t.spreadSimulationDesc}
          </p>
        </div>

        {/* Location badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800 self-start md:self-auto shrink-0">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span>{tr(simulation.targetLocationName.split('(')[0].trim())}</span>
        </div>
      </div>

      {/* 2. INTERACTIVE ANIMATED TIMELINE BAR */}
      <div className="bg-slate-950 text-white rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{tr('TIME PROGRESSION:')}</span>
            <span className="text-white font-black bg-slate-800 px-2 py-0.5 rounded">
              {tr(activeStage.label)}
            </span>
          </div>

          {/* Play / Pause Toggle Button */}
          <button
            type="button"
            onClick={onTogglePlay}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black font-mono transition flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 ring-2 ring-amber-300/40'
                : 'bg-blue-600 hover:bg-blue-500 text-white ring-1 ring-blue-400/40'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>{tr('PAUSE ANIMATION')}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{tr('PLAY ANIMATION')}</span>
              </>
            )}
          </button>
        </div>

        {/* Timeline Stage Buttons (NOW -> +30 MIN -> +1 HR -> +2 HR) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {stageKeys.map((key, index) => {
            const stage = simulation.stages[key];
            const isSelected = activeStageKey === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectStage(key)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-white ring-2 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                }`}
                style={{
                  boxShadow: isSelected ? `0 0 16px ${stage.color}40` : undefined,
                  borderColor: isSelected ? stage.color : undefined
                }}
              >
                {/* Stage step indicator */}
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className="text-[10px] font-black font-mono px-1.5 py-0.2 rounded"
                    style={{
                      background: stage.color,
                      color: key === 'NOW' ? '#0f172a' : '#ffffff'
                    }}
                  >
                    {tr('STAGE')} {index + 1}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    {tr(stage.severityLabel)}
                  </span>
                </div>

                <div className="text-sm font-black font-mono text-white mt-0.5">
                  {tr(key)}
                </div>

                <div className="text-[11px] font-mono text-slate-300 mt-1 flex items-center justify-between">
                  <span>{stage.inundatedAreaKm2} km²</span>
                  <span className="text-[10px] text-slate-400">+{stage.timeOffsetMinutes}m</span>
                </div>

                {/* Bottom colored severity bar */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1 transition-all"
                  style={{
                    backgroundColor: stage.color,
                    opacity: isSelected ? 1 : 0.4
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. ACTIVE STAGE METRICS GRID (Deterministic Telemetry) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
        {/* Inundated Area */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
            {tr('Predicted Inundation Area')}
          </span>
          <div className="text-base font-black text-slate-950 flex items-center gap-1.5">
            <Waves className="w-4 h-4 text-blue-600" />
            <span>{activeStage.inundatedAreaKm2} km²</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-bold">
            {activeStage.inundatedHectares} {tr('Hectares covered')}
          </div>
        </div>

        {/* Projected Water Depth */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
            {tr('Surface Water Depth')}
          </span>
          <div className="text-base font-black text-slate-950 flex items-center gap-1.5">
            <span className="text-blue-500">📏</span>
            <span>{activeStage.depthRangeMeters}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {tr('Above river baseline datum')}
          </div>
        </div>

        {/* Floodwave Velocity */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
            {tr('Estimated Wave Velocity')}
          </span>
          <div className="text-base font-black text-slate-950 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <span>{activeStage.flowVelocityKmh}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {tr('Valley downhill surge speed')}
          </div>
        </div>

        {/* Severity Level */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <span className="text-slate-500 text-[10px] uppercase font-bold block mb-1">
            {tr('Hazard Severity')}
          </span>
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0"
              style={{ backgroundColor: activeStage.color }}
            />
            <span
              className="text-sm font-black uppercase"
              style={{ color: activeStage.color }}
            >
              {tr(activeStage.severityLabel)} {tr('SURGE')}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {tr('STAGE')} {stageKeys.indexOf(activeStageKey) + 1} / 4
          </div>
        </div>
      </div>

      {/* 4. AFFECTED CORRIDORS & STAGE EXPLANATION */}
      <div className="p-4 rounded-2xl border bg-slate-50 border-slate-200 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 font-mono">
            {tr('PREDICTED INUNDATION REACHES AT')} {tr(activeStage.key)}:
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            {activeStage.affectedCorridors.length} {tr('vulnerable corridors mapped')}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {activeStage.affectedCorridors.map((corridor, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-white border border-slate-300 text-slate-800 shadow-2xs flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>{tr(corridor)}</span>
            </span>
          ))}
        </div>

        <p className="text-xs text-slate-600 leading-relaxed pt-1">
          <strong>{tr('Hydrological Dynamics:')} </strong>
          {tr(activeStage.description)}
        </p>
      </div>
    </div>
  );
};
