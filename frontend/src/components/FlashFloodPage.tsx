import React, { useState, useMemo, useEffect } from 'react';
import type {
  LocationData,
  FlashFloodWarning,
  IoTSensor,
  HistoricalEvent,
  OfficialImdWarning,
  Hospital
} from '../types';
import { DisasterMap } from './Map/DisasterMap';
import { FlashFloodWarningCard } from './FlashFloodWarningCard';
import { HospitalCapacityPanel } from './HospitalCapacityPanel';
import { LocationSafetyModal } from './LocationSafetyModal';
import {
  calculateFloodSpreadSimulation,
  type FloodSpreadStageKey,
  type FloodSpreadSimulation
} from '../services/floodSpreadService';
import {
  ShieldCheck,
  ArrowRight,
  Home,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface FlashFloodPageProps {
  locations: LocationData[];
  selectedLocation: LocationData | null;
  onSelectLocation: (loc: LocationData) => void;
  riverNetworks: any[];
  sensors: IoTSensor[];
  activeFlashWarning: FlashFloodWarning | null;
  historicalEvents?: HistoricalEvent[];
  officialImdWarnings?: OfficialImdWarning[];
  hospitals?: Hospital[];
  isDemoMode?: boolean;
  onNavigateToReport: () => void;
  onNavigateToSimulator: () => void;
}

export const FlashFloodPage: React.FC<FlashFloodPageProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  riverNetworks,
  sensors,
  activeFlashWarning,
  historicalEvents = [],
  officialImdWarnings = [],
  hospitals = [],
  isDemoMode = true,
  onNavigateToReport,
  onNavigateToSimulator
}) => {
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  const activeLoc = selectedLocation || locations[0] || {
    id: 'ward-04',
    name: 'Ward 04 (Riverfront Embankment & Lowlands)',
    risk_level: 'CRITICAL',
    rainfall: 94,
    soil_moisture: 92,
    slope: 2.1,
    sensor_water_level: 4.6
  } as LocationData;

  // 🌊 Flood Spread Prediction Simulation (Deterministic, strictly based on current flash flood simulation parameters)
  const spreadSimulation: FloodSpreadSimulation = useMemo(() => {
    return calculateFloodSpreadSimulation(activeLoc, activeFlashWarning);
  }, [activeLoc, activeFlashWarning]);

  const [activeSpreadStageKey, setActiveSpreadStageKey] = useState<FloodSpreadStageKey>('NOW');
  const [animationState, setAnimationState] = useState<'idle' | 'running' | 'completed'>('idle');

  // Progressive animation driver: NOW -> +30 MIN -> +1 HR -> +2 HR (then finish at max spread)
  useEffect(() => {
    if (animationState !== 'running') return;

    const interval = setInterval(() => {
      setActiveSpreadStageKey(prev => {
        const order = spreadSimulation.stageOrder;
        const currentIdx = order.indexOf(prev);
        if (currentIdx >= order.length - 1) {
          // Reached final stage (+2 HR)
          setAnimationState('completed');
          return prev;
        }
        return order[currentIdx + 1];
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [animationState, spreadSimulation.stageOrder]);

  const handleStartAnimation = () => {
    setActiveSpreadStageKey('NOW');
    setAnimationState('running');
  };

  const handleTogglePause = () => {
    setAnimationState(prev => (prev === 'running' ? 'idle' : 'running'));
  };

  const currentSpreadStage = spreadSimulation.stages[activeSpreadStageKey] || spreadSimulation.stages['NOW'];

  const [activeLayers, setActiveLayers] = useState({
    floodRisk: true,
    rainfall: true,
    drainage: false,
    iotSensors: true,
    citizenReports: false,
    historicalEvents: false,
    hospitals: true
  });

  const handleToggleLayer = (layerKey: string) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey as keyof typeof prev]
    }));
  };


  // Filter IoT Sensors strictly for Flash Flood factors (Rain gauge, river level, soil moisture)
  const floodSensors = sensors.filter(
    s => s.type === 'Rain Gauge' || s.type === 'Water Level' || s.type === 'Soil Moisture' || s.type === 'Slope Sensor'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. 🏠 "IS MY LOCATION SAFE?" HERO ACTION BANNER */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-5 sm:p-7 text-white shadow-xl border-2 border-indigo-900/60 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-blue-500/20 text-blue-300 border border-blue-400/40">
              Personalized Flood Risk Assessment
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Open-Meteo Weather + Soil Moisture + IMD Feed
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white flex items-center gap-2.5">
            <span>🏠 Is My Location Safe?</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Check real-time flood risk for your current GPS location, ward, or town. Evaluates live rainfall, soil saturation, and official IMD warnings through the JalRakshak risk engine.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsSafetyModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm transition flex items-center gap-2.5 cursor-pointer shadow-lg hover:shadow-amber-500/20 shrink-0 self-start md:self-auto z-10"
        >
          <Home className="w-4 h-4" />
          <span>CHECK MY LOCATION</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Subtle background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
      </div>

      {/* 2. DEDICATED FLASH FLOOD WARNING */}
      {activeFlashWarning && activeFlashWarning.status !== 'NONE' ? (
        <FlashFloodWarningCard
          warning={activeFlashWarning}
          onViewOnMap={() => {}}
        />
      ) : (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 sm:p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
              ✓
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-emerald-800 font-mono tracking-wider">
                NO ACTIVE FLASH FLOOD WARNING
              </div>
              <p className="text-xs text-emerald-950 font-medium mt-0.5">
                Regional river trunks and basin precipitation levels remain below critical surge thresholds.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-700 font-bold hidden sm:inline">
            SDMA Monitoring Active
          </span>
        </div>
      )}



      {/* 5. REGIONAL RISK MAP (Flash Flood Focus) */}
      <section className="space-y-4">
        {/* FLASH FLOOD RISK MAP — FLOOD SPREAD ANIMATION PROMINENT CONTROL HEADER */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-5 sm:p-6 text-white shadow-xl border-2 border-indigo-900/70 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  SIMULATION / PREDICTED SPREAD
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Live Hydrodynamic Wavefront Engine
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                <span>FLASH FLOOD RISK MAP — FLOOD SPREAD ANIMATION</span>
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Simulates real-time flood wave propagation from the starting high-risk zone ({activeLoc.name.split('(')[0].trim()}) along river corridors, roadways, and neighboring sectors.
              </p>
            </div>

            {/* Prominent Action Button: START / PAUSE / REPLAY */}
            <div className="shrink-0 flex items-center gap-3">
              {animationState === 'completed' ? (
                <button
                  type="button"
                  onClick={handleStartAnimation}
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:via-orange-400 hover:to-red-500 text-slate-950 font-black rounded-2xl text-xs sm:text-sm transition flex items-center gap-2.5 cursor-pointer shadow-xl hover:shadow-orange-500/25"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>↻ REPLAY ANIMATION</span>
                </button>
              ) : animationState === 'running' ? (
                <button
                  type="button"
                  onClick={handleTogglePause}
                  className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/50 font-black rounded-2xl text-xs sm:text-sm transition flex items-center gap-2.5 cursor-pointer shadow-lg"
                >
                  <Pause className="w-4 h-4" />
                  <span>⏸ PAUSE ANIMATION</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartAnimation}
                  className="px-7 py-3.5 sm:py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:via-orange-400 hover:to-red-500 text-slate-950 font-black rounded-2xl text-xs sm:text-sm md:text-base transition flex items-center gap-3 cursor-pointer shadow-2xl hover:shadow-orange-500/30 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Play className="w-5 h-5 fill-slate-950 animate-pulse" />
                  <span>▶ START FLOOD SPREAD ANIMATION</span>
                </button>
              )}
            </div>
          </div>

          {/* Timeline Indicator & Visual Progression Bar */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            {/* Small live timeline indicator: NOW | +30 MIN | +1 HR | +2 HR */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                Timeline:
              </span>
              <div className="flex items-center gap-1.5">
                {spreadSimulation.stageOrder.map((key) => {
                  const stage = spreadSimulation.stages[key];
                  const isActive = activeSpreadStageKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setActiveSpreadStageKey(key);
                        if (animationState === 'running') setAnimationState('idle');
                      }}
                      className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-black transition flex items-center gap-1.5 cursor-pointer ${
                        isActive
                          ? 'text-white shadow-lg'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                      }`}
                      style={isActive ? { backgroundColor: stage.color } : {}}
                    >
                      {isActive && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
                      <span>{key}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Message / Completion Badge */}
            <div>
              {animationState === 'completed' || activeSpreadStageKey === '+2 HR' ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-950/80 border border-red-500/60 rounded-xl text-red-200 font-mono text-[11px] font-black">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>Predicted Maximum Spread — +2 HR</span>
                </div>
              ) : animationState === 'running' ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-950/80 border border-amber-500/60 rounded-xl text-amber-200 font-mono text-[11px] font-black">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Simulating Flood Wavefront ({activeSpreadStageKey})...</span>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                  <span>Color key:</span>
                  <span className="text-yellow-400 font-bold">● Yellow (Approaching)</span>
                  <span>→</span>
                  <span className="text-orange-400 font-bold">● Orange (Increasing)</span>
                  <span>→</span>
                  <span className="text-red-400 font-bold">● Red (Severe)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ward Inspection Selector Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight font-mono flex items-center gap-2">
              <span>ACTIVE RISK MAP LAYER VIEW</span>
            </h3>
            <p className="text-xs text-slate-500">
              Showing flood-risk zones, ultrasonic river gauge networks, and predicted flow vectors
            </p>
          </div>

          {/* Quick Ward Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Inspect Ward:</span>
            <select
              value={activeLoc.id}
              onChange={(e) => {
                const found = locations.find(l => l.id === e.target.value);
                if (found) onSelectLocation(found);
              }}
              className="bg-slate-100 border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 cursor-pointer"
            >
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.risk_level || 'EVALUATING'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Existing Map locked to Flash Flood System */}
        <DisasterMap
          locations={locations}
          selectedLocation={activeLoc}
          onSelectLocation={onSelectLocation}
          riverNetworks={riverNetworks}
          drainageLines={[]}
          sensors={floodSensors}
          citizenReports={[]}
          historicalEvents={historicalEvents}
          activeFlashWarning={activeFlashWarning}
          hospitals={hospitals}
          isDemoMode={isDemoMode}
          systemMode="flash-flood"
          activeSpreadStage={currentSpreadStage}
          allSpreadStages={spreadSimulation.stageOrder.map(k => spreadSimulation.stages[k])}
          animationActive={animationState === 'running'}
          animationFinished={animationState === 'completed'}
          onReplayAnimation={handleStartAnimation}
          onSelectSpreadStage={(stageKey) => {
            setActiveSpreadStageKey(stageKey);
            if (animationState === 'running') setAnimationState('idle');
          }}
          activeLayers={activeLayers}
          onToggleLayer={handleToggleLayer}
        />
      </section>

      {/* 6. EVACUATION & REGIONAL EMERGENCY HOSPITAL CAPACITY */}
      <section className="space-y-3">
        <HospitalCapacityPanel
          hospitals={hospitals}
          selectedLocationName={activeLoc.name}
          isDemoMode={isDemoMode}
          activeScenario={isDemoMode ? 'flash-flood' : undefined}
        />
      </section>

      {/* 7. OFFICIAL IMD METEOROLOGICAL WARNINGS */}
      {officialImdWarnings && officialImdWarnings.length > 0 && (
        <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-sky-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono">
              OFFICIAL WEATHER WARNINGS — INDIA METEOROLOGICAL DEPARTMENT (IMD)
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {officialImdWarnings.map((warn, i) => (
              <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 font-mono">{warn.title}</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold text-[10px] rounded-full font-mono uppercase">
                    {warn.feed_type || warn.source}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">{warn.description}</div>
                <div className="text-[10px] text-slate-400 font-mono">Published: {warn.published_at}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. QUICK ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-slate-900 text-white rounded-3xl">
        <div>
          <h4 className="text-sm font-black font-mono">SIMULATE FLASH FLOOD SCENARIOS</h4>
          <p className="text-xs text-slate-400">
            Stress-test heavy cloudburst and rainfall saturation scenarios in the simulator.
          </p>
        </div>

        <button
          onClick={onNavigateToSimulator}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <span>OPEN FLASH FLOOD SIMULATOR</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 9. 🏠 IS MY LOCATION SAFE? MODAL */}
      <LocationSafetyModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
        isDemoMode={isDemoMode}
        locations={locations}
        officialImdWarnings={officialImdWarnings}
      />
    </div>
  );
};
