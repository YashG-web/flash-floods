import React, { useState, useMemo } from 'react';
import type { LocationData, FlashFloodWarning, WarningStatus } from '../types';
import {
  Sliders,
  CloudRain,
  Droplets,
  Construction,
  Waves,
  Camera,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Mountain,
  History,
  Radio
} from 'lucide-react';

interface ScenarioSimulatorProps {
  locations: LocationData[];
  onApplyWarning: (warning: FlashFloodWarning, updatedLocation: LocationData) => void;
  onResetSimulation: () => void;
  onNavigateToMap: () => void;
  onNavigateToAlerts: () => void;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  locations,
  onApplyWarning,
  onResetSimulation,
  onNavigateToMap,
  onNavigateToAlerts
}) => {
  // Simulator Controls State
  const [targetWardId, setTargetWardId] = useState<string>('ward-12');
  const [rainfall, setRainfall] = useState<number>(42); // 0-200 mm
  const [soilMoisture, setSoilMoisture] = useState<number>(60); // 0-100%
  const [slope, setSlope] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [drainage, setDrainage] = useState<'GOOD' | 'STRESSED' | 'BLOCKED'>('BLOCKED');
  const [waterLevel, setWaterLevel] = useState<'NORMAL' | 'RISING' | 'CRITICAL'>('RISING');
  const [citizenReports, setCitizenReports] = useState<number>(14);
  const [historicalRisk, setHistoricalRisk] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [warningGenerated, setWarningGenerated] = useState<boolean>(false);

  // Target Location
  const targetLocation = locations.find(l => l.id === targetWardId) || locations[0] || {
    id: 'ward-12',
    name: 'Ward 12 (Station Road / Market)',
    coordinates: [30.0920, 78.2690]
  } as LocationData;

  // Real-Time Simulation Evaluation
  const simulationResult = useMemo(() => {
    let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    let warningStatus: WarningStatus = 'NONE';
    let primaryCause = 'Normal Weather Conditions';
    let secondaryFactors: string[] = [];
    let reason = 'Precipitation and drainage flow are within safe design thresholds.';
    let action = 'Routine monitoring active. Maintain open storm drains.';
    let estimatedWindow = 'No Imminent Risk';
    let isKeyInnovationScenario = false;

    // Case 1: Heavy Rainfall Overload (Scenario A)
    if (rainfall > 80) {
      riskLevel = rainfall > 130 ? 'CRITICAL' : 'HIGH';
      warningStatus = rainfall > 130 ? 'CRITICAL' : 'WARNING';
      primaryCause = 'Heavy Rainfall Overload (Cloudburst / Runoff Burst)';
      secondaryFactors = [
        `Rainfall Rate: ${rainfall} mm/h (Design limit exceeded)`,
        soilMoisture > 75 ? `Saturated Soil (${soilMoisture}%)` : 'Elevated Runoff',
        `Terrain Slope: ${slope}`
      ];
      reason = 'Heavy rainfall is exceeding local drainage capacity.';
      action = 'Avoid low-lying roads and prepare evacuation measures.';
      estimatedWindow = 'Next 1–3 Hours';
    } 
    // Case 2: Blocked Drain Scenario (Scenario B - The Key Twist!)
    else if (drainage === 'BLOCKED' && rainfall >= 25) {
      isKeyInnovationScenario = true;
      riskLevel = (citizenReports > 8 || waterLevel === 'CRITICAL') ? 'CRITICAL' : 'HIGH';
      warningStatus = 'CRITICAL';
      primaryCause = 'Blocked Drainage Culvert (Station Road Choke Point)';
      secondaryFactors = [
        `Moderate Rainfall: ${rainfall} mm/h`,
        `Drainage Condition: Blocked (18% throughput)`,
        `Multiple Citizen Reports: ${citizenReports} logs verified`
      ];
      reason = 'Moderate rainfall combined with blocked drainage is creating localized waterlogging.';
      action = 'Avoid Main Market Road. Deploy municipal culvert de-silting crew immediately.';
      estimatedWindow = 'Next 1–3 Hours';
    }
    // Case 3: Stressed Drainage or Moderate Rain
    else if (rainfall >= 40 || drainage === 'STRESSED' || waterLevel === 'RISING') {
      riskLevel = 'MODERATE';
      warningStatus = 'WATCH';
      primaryCause = 'Drainage Flow Stress';
      secondaryFactors = [
        `Rainfall: ${rainfall} mm/h`,
        `Drainage: ${drainage}`,
        `Water Level: ${waterLevel}`
      ];
      reason = 'Slow runoff accumulation observed in low-lying intersections.';
      action = 'Caution near roadside ditches. Clear roadside plastic debris.';
      estimatedWindow = 'Next 3–6 Hours';
    }

    return {
      riskLevel,
      warningStatus,
      primaryCause,
      secondaryFactors,
      reason,
      action,
      estimatedWindow,
      isKeyInnovationScenario
    };
  }, [rainfall, soilMoisture, slope, drainage, waterLevel, citizenReports, historicalRisk]);

  // Preset 1: Normal Conditions
  const applyPresetNormal = () => {
    setRainfall(14);
    setSoilMoisture(35);
    setSlope('LOW');
    setDrainage('GOOD');
    setWaterLevel('NORMAL');
    setCitizenReports(0);
    setHistoricalRisk('LOW');
    setWarningGenerated(false);
  };

  // Preset 2: Heavy Rainfall Overload (Scenario A)
  const applyPresetHeavyRain = () => {
    setRainfall(120);
    setSoilMoisture(95);
    setSlope('HIGH');
    setDrainage('STRESSED');
    setWaterLevel('CRITICAL');
    setCitizenReports(3);
    setHistoricalRisk('HIGH');
    setTargetWardId('ward-04');
    setWarningGenerated(false);
  };

  // Preset 3: Blocked Drain with Moderate Rain (Scenario B - The Key Innovation)
  const applyPresetBlockedDrain = () => {
    setRainfall(42);
    setSoilMoisture(60);
    setSlope('MEDIUM');
    setDrainage('BLOCKED');
    setWaterLevel('RISING');
    setCitizenReports(14);
    setHistoricalRisk('MEDIUM');
    setTargetWardId('ward-12');
    setWarningGenerated(false);
  };

  // Generate Flash Flood Warning handler (Section 10)
  const handleGenerateWarning = () => {
    const warningObj: FlashFloodWarning = {
      id: `sim-warn-${Date.now()}`,
      status: simulationResult.warningStatus,
      statusLabel: simulationResult.warningStatus === 'CRITICAL' ? 'FLASH FLOOD WARNING' : 'FLOOD WARNING',
      locationId: targetLocation.id,
      locationName: targetLocation.name,
      roadName: targetLocation.id === 'ward-12' ? 'Main Market Road' : 'Valley Riverside Road',
      riskLevel: simulationResult.riskLevel,
      estimatedWindow: simulationResult.estimatedWindow,
      reason: simulationResult.reason,
      affectedAreas: targetLocation.id === 'ward-12'
        ? ['Main Market Road', 'Station Road Culvert', 'Low-Lying Bazaar Zone']
        : ['Riverside Ghat Approach', 'Terrace Settlements'],
      actions: [
        simulationResult.action,
        'Move away from low-lying ground level shop floors',
        'Do not walk or drive through flowing water',
        'Follow instructions from municipal emergency teams (Call 112)'
      ],
      timeline: [
        { label: 'NOW', subtext: `Simulation active: Rainfall ${rainfall} mm/h`, isTriggered: true },
        { label: 'Rainfall increasing', subtext: 'Surface runoff exceeding normal absorption', isTriggered: true },
        { label: 'Soil moisture rising', subtext: `Saturation at ${soilMoisture}%`, isTriggered: soilMoisture > 50 },
        { label: 'Drainage stress detected', subtext: `Drain status: ${drainage}`, isTriggered: drainage !== 'GOOD' },
        { label: `⚠️ ${simulationResult.riskLevel} FLOOD RISK`, subtext: simulationResult.estimatedWindow, isTriggered: true }
      ],
      timestamp: new Date().toLocaleTimeString('en-IN') + ' IST'
    };

    const updatedLoc: LocationData = {
      ...targetLocation,
      risk_level: simulationResult.riskLevel,
      risk_probability: simulationResult.riskLevel === 'CRITICAL' ? 88 : simulationResult.riskLevel === 'HIGH' ? 76 : simulationResult.riskLevel === 'MODERATE' ? 45 : 15,
      rainfall,
      soil_moisture: soilMoisture,
      drainage_condition: drainage === 'BLOCKED' ? 18 : drainage === 'STRESSED' ? 52 : 85,
      citizen_reports_count: citizenReports,
      cause_intelligence: {
        cause_code: simulationResult.isKeyInnovationScenario ? 'DRAINAGE_BLOCKAGE' : rainfall > 80 ? 'RAINFALL_OVERLOAD' : 'COMBINED_RISK',
        probable_cause: simulationResult.primaryCause,
        confidence: 'HIGH',
        badge_color: 'amber',
        explanation: simulationResult.reason
      }
    };

    onApplyWarning(warningObj, updatedLoc);
    setWarningGenerated(true);
  };

  const handleReset = () => {
    applyPresetNormal();
    onResetSimulation();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Demonstration Label (Section 5 & 13) */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                🟣 DEMO MODE
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Simulated conditions for system demonstration
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight font-mono uppercase text-white">
              FLOOD SCENARIO SIMULATOR
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Simulate local conditions and see how JalRakshak identifies causes and generates warnings.
            </p>
          </div>

          {/* Preset Buttons for Live Judging (Section 11) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={applyPresetNormal}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer"
            >
              ☀️ NORMAL
            </button>
            <button
              onClick={applyPresetHeavyRain}
              className="px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-200 text-xs font-bold border border-red-700/60 transition cursor-pointer"
              title="Scenario A: Heavy Rainfall Overload"
            >
              🌧️ HEAVY RAINFALL
            </button>
            <button
              onClick={applyPresetBlockedDrain}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition cursor-pointer flex items-center gap-1.5"
              title="Scenario B: The Important Twist (Blocked Drain)"
            >
              <span>⚠️ BLOCKED DRAIN</span>
              <span className="text-[10px] font-mono px-1 py-0.2 bg-black text-amber-300 rounded">KEY</span>
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="Reset Simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Simulator Grid: Controls (Left 7 cols) vs Live Output (Right 5 cols) */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left: Sliders & Controls (Section 6) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Environmental & Infrastructure Inputs
              </h3>
            </div>
            
            {/* Target Ward */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-bold">Target Ward:</span>
              <select
                value={targetWardId}
                onChange={(e) => setTargetWardId(e.target.value)}
                className="bg-slate-100 border border-slate-300 rounded-lg px-2 py-1 font-bold text-slate-800 cursor-pointer"
              >
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 1. Rainfall Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-sky-600" />
                <span>🌧 RAINFALL INTENSITY</span>
              </span>
              <span className="font-black text-slate-900 font-mono text-sm bg-slate-100 px-2 py-0.5 rounded">
                {rainfall} mm/h
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={rainfall}
              onChange={(e) => setRainfall(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>0 mm (Clear)</span>
              <span>40 mm (Moderate Rain)</span>
              <span>100 mm (Cloudburst)</span>
              <span>200 mm</span>
            </div>
          </div>

          {/* 2. Soil Moisture Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-blue-600" />
                <span>💧 SOIL MOISTURE SATURATION</span>
              </span>
              <span className="font-black text-slate-900 font-mono text-sm bg-slate-100 px-2 py-0.5 rounded">
                {soilMoisture}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={soilMoisture}
              onChange={(e) => setSoilMoisture(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>0% (Dry)</span>
              <span>50% (Damp)</span>
              <span>85%+ (Completely Saturated)</span>
            </div>
          </div>

          {/* 3. Drainage Condition Selector */}
          <div className="space-y-2">
            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Construction className="w-4 h-4 text-amber-600" />
              <span>🚧 DRAINAGE CONDITION</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['GOOD', 'STRESSED', 'BLOCKED'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDrainage(d)}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition cursor-pointer border ${
                    drainage === d
                      ? d === 'BLOCKED'
                        ? 'bg-red-600 text-white border-red-700 shadow-sm'
                        : d === 'STRESSED'
                        ? 'bg-amber-500 text-slate-950 border-amber-600'
                        : 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {d === 'BLOCKED' ? '🛑 BLOCKED' : d === 'STRESSED' ? '⚠️ STRESSED' : '✓ GOOD'}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Water Level & Terrain Slope */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <span className="font-bold text-slate-800 text-xs block mb-1.5">
                📍 WATER LEVEL
              </span>
              <div className="grid grid-cols-3 gap-1">
                {(['NORMAL', 'RISING', 'CRITICAL'] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWaterLevel(w)}
                    className={`py-1.5 text-[11px] font-bold rounded-lg border transition ${
                      waterLevel === w
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-800 text-xs block mb-1.5">
                ⛰ SLOPE / TERRAIN RISK
              </span>
              <div className="grid grid-cols-3 gap-1">
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSlope(s)}
                    className={`py-1.5 text-[11px] font-bold rounded-lg border transition ${
                      slope === s
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Citizen Reports Slider & Historical Risk */}
          <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                <span className="flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-red-600" />
                  <span>📸 CITIZEN REPORTS</span>
                </span>
                <span className="font-mono text-red-600">{citizenReports} Logs</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={citizenReports}
                onChange={(e) => setCitizenReports(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>

            <div>
              <span className="font-bold text-slate-800 text-xs block mb-1">
                HISTORICAL FLOOD RISK PRIOR
              </span>
              <div className="grid grid-cols-3 gap-1">
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHistoricalRisk(h)}
                    className={`py-1.5 text-[11px] font-bold rounded-lg border transition ${
                      historicalRisk === h
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Simulation Output & Generate Warning (Section 9 & 10) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-xs space-y-5">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                  SIMULATION RESULT
                </span>
                <h3 className="text-lg font-black text-slate-900 font-mono">
                  {targetLocation.name.toUpperCase()}
                </h3>
              </div>

              <div className={`px-3 py-1 rounded-xl text-white font-black text-xs uppercase font-mono ${
                simulationResult.riskLevel === 'CRITICAL' ? 'bg-red-600' :
                simulationResult.riskLevel === 'HIGH' ? 'bg-orange-500' :
                simulationResult.riskLevel === 'MODERATE' ? 'bg-amber-500 text-slate-950' :
                'bg-emerald-600'
              }`}>
                {simulationResult.riskLevel} RISK
              </div>
            </div>

            {/* Key Innovation Highlight Box (Section 8 Requirement) */}
            {simulationResult.isKeyInnovationScenario && (
              <div className="p-3.5 bg-amber-50 rounded-2xl border-2 border-amber-300 text-xs text-amber-950 space-y-1">
                <span className="font-black uppercase tracking-wider text-amber-900 text-[10px] flex items-center gap-1">
                  <span>💡 THE JALRAKSHAK BREAKTHROUGH:</span>
                </span>
                <div className="font-black text-slate-900 text-xs tracking-tight">
                  MODERATE RAINFALL (42 mm) + BLOCKED DRAIN → LOCAL FLOOD RISK → WARNING
                </div>
                <p className="text-[11px] text-amber-900">
                  Standard rainfall gauges would flag this weather as safe. JalRakshak detects the culvert choke and warns before water enters shops.
                </p>
              </div>
            )}

            {/* Primary Cause */}
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                Primary Cause:
              </span>
              <p className="text-sm font-bold text-slate-900">
                {simulationResult.primaryCause}
              </p>
            </div>

            {/* Secondary Factors */}
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Secondary Factors:
              </span>
              <div className="space-y-1 text-xs text-slate-700">
                {simulationResult.secondaryFactors.map((fact, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>{fact}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Risk Window */}
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                Estimated Risk Window:
              </span>
              <p className="text-sm font-black text-red-600 font-mono">
                {simulationResult.estimatedWindow}
              </p>
            </div>

            {/* Recommended Action */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                Recommended Action:
              </span>
              <p className="text-xs font-bold text-slate-900">
                {simulationResult.action}
              </p>
            </div>

            {/* GENERATE FLASH FLOOD WARNING BUTTON (Section 10 Requirement) */}
            <div className="pt-2">
              <button
                onClick={handleGenerateWarning}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2 transform active:scale-98"
              >
                <span className="text-base animate-pulse">🚨</span>
                <span>GENERATE FLASH FLOOD WARNING</span>
              </button>
            </div>

            {/* Confirmation & Direct Links to Other Views */}
            {warningGenerated && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 space-y-2 text-xs text-emerald-950">
                <div className="flex items-center gap-2 font-black text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>✓ Warning Broadcasted Across Platform</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Simulated warning is now live across Home, Alerts, and Risk Map.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={onNavigateToMap}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-xl font-bold text-[11px] hover:bg-slate-800 cursor-pointer"
                  >
                    View on Map →
                  </button>
                  <button
                    onClick={onNavigateToAlerts}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-xl font-bold text-[11px] hover:bg-red-700 cursor-pointer"
                  >
                    View in Alerts →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
