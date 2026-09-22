import React, { useState, useMemo } from 'react';
import type { LocationData, FlashFloodWarning, WarningStatus } from '../types';
import { InverseHydraulicDiagnosisCard } from './InverseHydraulicDiagnosisCard';
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
  onNavigateToAlerts?: () => void;
  onNavigateToFlashFlood?: () => void;
  onNavigateToStreetWaterlogging?: () => void;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  locations,
  onApplyWarning,
  onResetSimulation,
  onNavigateToMap,
  onNavigateToFlashFlood,
  onNavigateToStreetWaterlogging
}) => {
  // Mode switcher: Flash Flood vs Street Waterlogging
  const [simulatorMode, setSimulatorMode] = useState<'flash-flood' | 'street-waterlogging'>('flash-flood');

  // FLASH FLOOD CONTROLS
  const [ffWardId, setFfWardId] = useState<string>('ward-04');
  const [rainfall, setRainfall] = useState<number>(94); // mm/h
  const [soilMoisture, setSoilMoisture] = useState<number>(85); // %
  const [slope, setSlope] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('HIGH');
  const [riverWaterLevel, setRiverWaterLevel] = useState<'NORMAL' | 'RISING' | 'CRITICAL'>('CRITICAL');
  const [historicalRisk, setHistoricalRisk] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('HIGH');
  const [ffWarningGenerated, setFfWarningGenerated] = useState<boolean>(false);

  // STREET WATERLOGGING CONTROLS
  const [swWardId, setSwWardId] = useState<string>('ward-12');
  const [selectedRoadName, setSelectedRoadName] = useState<string>('Main Market Road');
  const [localRainfall, setLocalRainfall] = useState<number>(18); // mm/h
  const [runoffCoefficient, setRunoffCoefficient] = useState<number>(0.82); // Runoff coefficient C
  const [drainageCondition, setDrainageCondition] = useState<'GOOD' | 'STRESSED' | 'CHOKED'>('CHOKED');
  const [blockedDrain, setBlockedDrain] = useState<'NO' | 'PARTIAL' | 'COMPLETELY_BLOCKED'>('COMPLETELY_BLOCKED');
  const [citizenReportsCount, setCitizenReportsCount] = useState<number>(14);
  const [roadWaterLevel, setRoadWaterLevel] = useState<'ANKLE' | 'KNEE' | 'WAIST' | 'SUBMERGED'>('KNEE');
  const [drainageResponse, setDrainageResponse] = useState<'NORMAL' | 'SLUGGISH' | 'RESTRICTED'>('RESTRICTED');
  const [swAlertGenerated, setSwAlertGenerated] = useState<boolean>(false);

  const applyStreetWaterloggingPreset = (preset: 'NORMAL' | 'HEAVY' | 'BLOCKED') => {
    if (preset === 'NORMAL') {
      setLocalRainfall(10);
      setRunoffCoefficient(0.82);
      setDrainageCondition('GOOD');
      setBlockedDrain('NO');
      setCitizenReportsCount(1);
      setRoadWaterLevel('ANKLE');
      setDrainageResponse('NORMAL');
    } else if (preset === 'HEAVY') {
      setLocalRainfall(85);
      setRunoffCoefficient(0.85);
      setDrainageCondition('GOOD');
      setBlockedDrain('NO');
      setCitizenReportsCount(18);
      setRoadWaterLevel('WAIST');
      setDrainageResponse('SLUGGISH');
    } else if (preset === 'BLOCKED') {
      setLocalRainfall(18);
      setRunoffCoefficient(0.82);
      setDrainageCondition('CHOKED');
      setBlockedDrain('COMPLETELY_BLOCKED');
      setCitizenReportsCount(14);
      setRoadWaterLevel('KNEE');
      setDrainageResponse('RESTRICTED');
    }
  };

  // Target Location for Flash Flood
  const targetFfLocation = locations.find(l => l.id === ffWardId) || locations[0];
  // Target Location for Street Waterlogging
  const targetSwLocation = locations.find(l => l.id === swWardId) || locations[0];

  // 1. FLASH FLOOD SIMULATION RESULT
  const ffResult = useMemo(() => {
    let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    let riskScore = 15;
    let warningStatus: WarningStatus = 'NONE';
    let reason = 'Regional river basins and precipitation levels are within safe design thresholds.';
    let action = 'Routine monitoring active. No evacuation needed.';
    let estimatedWindow = 'No Imminent Risk';

    // Calculation based on Flash Flood factors
    if (rainfall > 80 || (rainfall > 50 && soilMoisture > 80) || riverWaterLevel === 'CRITICAL') {
      riskLevel = rainfall > 110 || riverWaterLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH';
      riskScore = riskLevel === 'CRITICAL' ? 95 : 82;
      warningStatus = riskLevel === 'CRITICAL' ? 'CRITICAL' : 'WARNING';
      reason = 'Severe rainfall overload coupled with high ground saturation and rising river levels.';
      action = 'Move away from low-lying river areas. Follow official evacuation instructions.';
      estimatedWindow = 'Next 1–3 Hours';
    } else if (rainfall >= 40 || soilMoisture > 70 || riverWaterLevel === 'RISING') {
      riskLevel = 'MODERATE';
      riskScore = 58;
      warningStatus = 'WATCH';
      reason = 'Continuous precipitation elevating tributary runoff and catchment moisture.';
      action = 'Monitor river level gauges. Low-lying farms and roads should exercise caution.';
      estimatedWindow = 'Next 3–6 Hours';
    }

    return {
      riskLevel,
      riskScore,
      warningStatus,
      reason,
      action,
      estimatedWindow
    };
  }, [rainfall, soilMoisture, slope, riverWaterLevel, historicalRisk]);

  // 2. STREET WATERLOGGING SIMULATION RESULT
  const swResult = useMemo(() => {
    let status: 'CLEAR' | 'MINOR' | 'MODERATE' | 'SEVERE' = 'CLEAR';
    let riskScore = 10;
    let cause = 'Roadway drainage channels flowing without restriction.';
    let action = 'Roads are fully passable for all vehicular traffic.';
    let depthText = 'Dry / Nominal road surface';

    if (blockedDrain === 'COMPLETELY_BLOCKED' || (drainageCondition === 'CHOKED' && localRainfall >= 25)) {
      status = 'SEVERE';
      riskScore = 88;
      cause = 'Stormwater culvert inlet choked with solid debris and silt. Zero outflow throughput.';
      action = `Avoid ${selectedRoadName}. Divert two-wheelers and passenger vehicles.`;
      depthText = roadWaterLevel === 'WAIST' ? '2.0 to 2.5 ft (Waist depth)' : roadWaterLevel === 'SUBMERGED' ? '> 3.0 ft (Hazardous)' : '1.2 to 1.8 ft (Knee depth)';
    } else if (drainageCondition === 'STRESSED' || blockedDrain === 'PARTIAL' || localRainfall > 50) {
      status = 'MODERATE';
      riskScore = 62;
      cause = 'Sluggish storm drain outflow causing gutter surcharge in curb lanes.';
      action = 'Caution advised. Avoid driving through standing curb-side puddles.';
      depthText = '6 to 10 inches (Ankle depth)';
    } else if (localRainfall > 20) {
      status = 'MINOR';
      riskScore = 35;
      cause = 'Minor surface puddling due to slight road depressions.';
      action = 'Drive with slow speed. Elevated sidewalks open.';
      depthText = '2 to 4 inches';
    }

    return {
      status,
      riskScore,
      cause,
      action,
      depthText
    };
  }, [localRainfall, drainageCondition, blockedDrain, citizenReportsCount, roadWaterLevel, selectedRoadName]);

  // Handle Generate Flash Flood Warning
  const handleGenerateFlashFloodWarning = () => {
    const warning: FlashFloodWarning = {
      id: `sim-ff-${Date.now()}`,
      status: ffResult.warningStatus,
      statusLabel: 'FLASH FLOOD WARNING',
      locationId: targetFfLocation.id,
      locationName: targetFfLocation.name,
      roadName: 'Lowland Valley Basin',
      riskLevel: ffResult.riskLevel,
      estimatedWindow: ffResult.estimatedWindow,
      reason: ffResult.reason,
      affectedAreas: [targetFfLocation.name, 'Riparian river terraces', 'Low-elevation settlement'],
      actions: [
        'Move away from vulnerable flood zones',
        'Follow official SDMA evacuation instructions',
        'Emergency shelter locations active (Call 112)'
      ],
      timeline: [
        { label: 'NOW', subtext: `Rainfall recorded at ${rainfall} mm/h`, isTriggered: true },
        { label: 'Soil Saturation', subtext: `Moisture at ${soilMoisture}%`, isTriggered: true },
        { label: 'River Threshold', subtext: `River State: ${riverWaterLevel}`, isTriggered: true },
        { label: '⚠️ REGIONAL WARNING', subtext: ffResult.estimatedWindow, isTriggered: true }
      ],
      timestamp: new Date().toLocaleTimeString('en-IN') + ' IST'
    };

    const updatedLoc: LocationData = {
      ...targetFfLocation,
      risk_level: ffResult.riskLevel,
      risk_probability: ffResult.riskScore,
      rainfall: rainfall,
      soil_moisture: soilMoisture,
      slope: slope === 'HIGH' ? 24 : slope === 'MEDIUM' ? 12 : 4,
      sensor_water_level: riverWaterLevel === 'CRITICAL' ? 4.8 : riverWaterLevel === 'RISING' ? 3.8 : 2.0
    };

    onApplyWarning(warning, updatedLoc);
    setFfWarningGenerated(true);
  };

  // Handle Generate Waterlogging Alert
  const handleGenerateWaterloggingAlert = () => {
    setSwAlertGenerated(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* 1. SIMULATOR HEADER */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-black tracking-widest uppercase mb-1">
              <Sliders className="w-4 h-4" />
              <span>DECISION-SUPPORT STRESS TESTING</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
              FLOOD SCENARIO SIMULATOR
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Test independent emergency conditions. Choose a disaster scenario below.
            </p>
          </div>

          <button
            onClick={onResetSimulation}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition border border-slate-700 self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>
        </div>

        {/* 2. CHOOSE SCENARIO: [ 🌊 FLASH FLOOD ] OR [ 🚧 STREET WATERLOGGING ] */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
            Choose Scenario:
          </span>

          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setSimulatorMode('flash-flood');
                setFfWarningGenerated(false);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${simulatorMode === 'flash-flood'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              <span>🌊 FLASH FLOOD</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSimulatorMode('street-waterlogging');
                setSwAlertGenerated(false);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${simulatorMode === 'street-waterlogging'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              <span>🚧 STREET WATERLOGGING</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. FLASH FLOOD SIMULATOR (Controls: Rainfall, Soil Moisture, Slope, Water Level, Historical Risk) */}
      {simulatorMode === 'flash-flood' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-blue-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase text-blue-700 font-mono tracking-wider">
                REGIONAL SIMULATION CONTROLS
              </span>
              <h2 className="text-xl font-black text-slate-900 font-mono">
                FLASH FLOOD SIMULATOR
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Target Ward:</span>
              <select
                value={ffWardId}
                onChange={(e) => setFfWardId(e.target.value)}
                className="bg-slate-100 border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 cursor-pointer"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Rainfall */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                  <CloudRain className="w-4 h-4 text-blue-600" />
                  <span>Rainfall Intensity</span>
                </span>
                <span className="font-mono font-black text-blue-700 text-sm">{rainfall} mm/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                value={rainfall}
                onChange={(e) => setRainfall(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 mm (Dry)</span>
                <span>50 mm (Heavy)</span>
                <span>150+ mm (Cloudburst)</span>
              </div>
            </div>

            {/* 2. Soil Moisture */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                  <Droplets className="w-4 h-4 text-sky-600" />
                  <span>Soil Moisture Saturation</span>
                </span>
                <span className="font-mono font-black text-sky-700 text-sm">{soilMoisture}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={soilMoisture}
                onChange={(e) => setSoilMoisture(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>10% (Dry)</span>
                <span>50% (Normal)</span>
                <span>90%+ (Saturated)</span>
              </div>
            </div>

            {/* 3. Slope / Terrain */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 font-mono text-xs">
                <Mountain className="w-4 h-4 text-indigo-600" />
                <span>Slope & Terrain Gradient</span>
              </span>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSlope(lvl)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${slope === lvl ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-slate-300 text-slate-700'
                      }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. River / Water Level */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 font-mono text-xs">
                <Waves className="w-4 h-4 text-teal-600" />
                <span>River Water Level Condition</span>
              </span>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(['NORMAL', 'RISING', 'CRITICAL'] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setRiverWaterLevel(lvl)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${riverWaterLevel === lvl
                        ? lvl === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-teal-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-700'
                      }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Historical Risk */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 md:col-span-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 font-mono text-xs">
                <History className="w-4 h-4 text-slate-600" />
                <span>Historical Catchment Flood Vulnerability</span>
              </span>
              <div className="grid grid-cols-3 gap-2 pt-1 max-w-md">
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setHistoricalRisk(lvl)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${historicalRisk === lvl ? 'bg-slate-900 text-white' : 'bg-white border border-slate-300 text-slate-700'
                      }`}
                  >
                    {lvl} RISK HISTORY
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Flash Flood Output Card */}
          <div className="p-5 rounded-2xl bg-blue-50/80 border-2 border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase text-blue-900 font-mono tracking-wider">
                SIMULATED OUTPUT: FLASH FLOOD RISK
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black font-mono ${ffResult.riskLevel === 'CRITICAL' ? 'bg-red-600 text-white' :
                  ffResult.riskLevel === 'HIGH' ? 'bg-amber-600 text-white' :
                    ffResult.riskLevel === 'MODERATE' ? 'bg-yellow-500 text-slate-950' : 'bg-emerald-600 text-white'
                }`}>
                {ffResult.riskLevel} ({ffResult.riskScore}%)
              </span>
            </div>

            <p className="text-xs sm:text-sm text-blue-950 font-bold">
              {ffResult.reason}
            </p>

            <div className="text-xs text-slate-700 font-medium">
              Action: <b className="text-slate-900">{ffResult.action}</b>
            </div>

            {/* Generate Flash Flood Warning Button */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleGenerateFlashFloodWarning}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>GENERATE FLASH FLOOD WARNING</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {ffWarningGenerated && (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Warning dispatched to Flash Flood Dashboard & Risk Map</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. STREET WATERLOGGING SIMULATOR (Controls: Local Rain, Drainage, Blocked Drain, Citizen Reports, Road Water Level) */}
      {simulatorMode === 'street-waterlogging' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-700 font-mono tracking-wider">
                ROAD-LEVEL SIMULATION CONTROLS
              </span>
              <h2 className="text-xl font-black text-slate-900 font-mono">
                STREET WATERLOGGING SIMULATOR
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Target Road:</span>
              <select
                value={selectedRoadName}
                onChange={(e) => setSelectedRoadName(e.target.value)}
                className="bg-slate-100 border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 cursor-pointer"
              >
                <option value="Main Market Road">Main Market Road (Ward 12)</option>
                <option value="Station Culvert Link Road">Station Culvert Link Road</option>
                <option value="Riverfront Embankment Road">Riverfront Embankment Road</option>
                <option value="Old Mandi Cross Road">Old Mandi Cross Road</option>
              </select>
            </div>
          </div>

          {/* PRESETS BAR (Section 16 requirement) */}
          <div className="p-4 bg-amber-500/10 border-2 border-amber-300 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-amber-900 font-mono flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>HYDRAULIC DIAGNOSIS DEMONSTRATION PRESETS:</span>
              </span>
              <span className="text-[10px] text-amber-800 font-bold font-mono">1-Click Scenarios</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => applyStreetWaterloggingPreset('NORMAL')}
                className={`p-3 rounded-xl text-left transition cursor-pointer border ${localRainfall === 10 && drainageCondition === 'GOOD'
                    ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-emerald-400 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
                  }`}
              >
                <div className="font-black text-xs font-mono flex items-center gap-1">
                  <span>🟢</span>
                  <span>NORMAL RAINFALL</span>
                </div>
                <div className={`text-[10px] mt-0.5 ${localRainfall === 10 && drainageCondition === 'GOOD' ? 'text-slate-300' : 'text-slate-500'}`}>
                  10 mm/h · Balanced Flow (Nominal)
                </div>
              </button>

              <button
                type="button"
                onClick={() => applyStreetWaterloggingPreset('HEAVY')}
                className={`p-3 rounded-xl text-left transition cursor-pointer border ${localRainfall === 85
                    ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-blue-400 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
                  }`}
              >
                <div className="font-black text-xs font-mono flex items-center gap-1">
                  <span>🟡</span>
                  <span>HEAVY RAINFALL</span>
                </div>
                <div className={`text-[10px] mt-0.5 ${localRainfall === 85 ? 'text-slate-300' : 'text-slate-500'}`}>
                  85 mm/h · Surface Inundation (No Blockage)
                </div>
              </button>

              <button
                type="button"
                onClick={() => applyStreetWaterloggingPreset('BLOCKED')}
                className={`p-3 rounded-xl text-left transition cursor-pointer border ${localRainfall === 18 && blockedDrain === 'COMPLETELY_BLOCKED'
                    ? 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-400 shadow-md'
                    : 'bg-white hover:bg-amber-50 border-amber-300 text-slate-800'
                  }`}
              >
                <div className="font-black text-xs font-mono flex items-center gap-1">
                  <span>🟠</span>
                  <span>MODERATE RAIN + BLOCKED DRAIN</span>
                </div>
                <div className={`text-[10px] mt-0.5 ${localRainfall === 18 && blockedDrain === 'COMPLETELY_BLOCKED' ? 'text-amber-100' : 'text-amber-700 font-semibold'}`}>
                  18 mm/h · Triggers Hidden Blockage (MH-07)
                </div>
              </button>
            </div>
          </div>

          {/* Controls Grid - All 6 Required Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Rainfall Intensity */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                  <CloudRain className="w-4 h-4 text-amber-600" />
                  <span>Rainfall Intensity</span>
                </span>
                <span className="font-mono font-black text-amber-700 text-sm">{localRainfall} mm/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={localRainfall}
                onChange={(e) => setLocalRainfall(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 mm (Clear)</span>
                <span>18 mm (Moderate)</span>
                <span>80+ mm (Extreme)</span>
              </div>
            </div>

            {/* 2. Impervious Area / Runoff Coefficient (C) */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                  <Sliders className="w-4 h-4 text-slate-700" />
                  <span>Impervious Area / Runoff Coeff (C)</span>
                </span>
                <span className="font-mono font-black text-slate-900 text-sm">{runoffCoefficient.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.30"
                max="0.95"
                step="0.01"
                value={runoffCoefficient}
                onChange={(e) => setRunoffCoefficient(Number(e.target.value))}
                className="w-full accent-slate-800 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.30 (Permeable)</span>
                <span>0.82 (Dense Bazaar)</span>
                <span>0.95 (Concrete)</span>
              </div>
            </div>

            {/* 3. Observed Water Accumulation (Water Depth) */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 font-mono text-xs">
                <Waves className="w-4 h-4 text-blue-600" />
                <span>Observed Water Accumulation</span>
              </span>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {(['ANKLE', 'KNEE', 'WAIST', 'SUBMERGED'] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setRoadWaterLevel(lvl)}
                    className={`py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${roadWaterLevel === lvl
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Drainage Condition */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 font-mono text-xs">
                <Construction className="w-4 h-4 text-amber-600" />
                <span>Drainage Condition</span>
              </span>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(['GOOD', 'STRESSED', 'CHOKED'] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDrainageCondition(lvl)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${drainageCondition === lvl
                        ? lvl === 'CHOKED' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Citizen Reports */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                  <Camera className="w-4 h-4 text-slate-700" />
                  <span>Citizen Reports Received</span>
                </span>
                <span className="font-mono font-black text-slate-900 text-sm">{citizenReportsCount} reports</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={citizenReportsCount}
                onChange={(e) => setCitizenReportsCount(Number(e.target.value))}
                className="w-full accent-slate-800 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 reports</span>
                <span>14 reports</span>
                <span>25+ reports</span>
              </div>
            </div>

            {/* 6. Drainage Network Response */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 font-mono text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Drainage Network Response</span>
              </span>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(['NORMAL', 'SLUGGISH', 'RESTRICTED'] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDrainageResponse(lvl)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${drainageResponse === lvl
                        ? lvl === 'RESTRICTED' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Street Waterlogging Summary Output Card */}
          <div className="p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase text-amber-900 font-mono tracking-wider">
                SIMULATED OUTPUT: STREET WATERLOGGING RISK
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black font-mono ${swResult.status === 'SEVERE' ? 'bg-red-600 text-white' :
                  swResult.status === 'MODERATE' ? 'bg-amber-600 text-white' :
                    swResult.status === 'MINOR' ? 'bg-yellow-500 text-slate-950' : 'bg-emerald-600 text-white'
                }`}>
                {swResult.status} ({swResult.depthText})
              </span>
            </div>

            <p className="text-xs sm:text-sm text-amber-950 font-bold">
              Cause: {swResult.cause}
            </p>

            <div className="text-xs text-slate-700 font-medium">
              Action: <b className="text-slate-900">{swResult.action}</b>
            </div>

            {/* Generate Waterlogging Alert Button */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleGenerateWaterloggingAlert}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>GENERATE WATERLOGGING ALERT</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {swAlertGenerated && (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Road Alert logged for {selectedRoadName}</span>
                </div>
              )}
            </div>
          </div>

          {/* LIVE INVERSE HYDRAULIC DIAGNOSIS ENGINE CARD */}
          <div className="pt-3 border-t-2 border-amber-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-black uppercase text-amber-950 font-mono tracking-wider flex items-center gap-1.5">
                <span>🕳️ INVERSE HYDRAULIC DIAGNOSIS ENGINE (SIMULATED DRAINAGE CORRIDOR)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Live Topological Inference Engine</span>
            </div>

            <InverseHydraulicDiagnosisCard
              input={{
                roadId: 'sim-road-12',
                roadName: selectedRoadName,
                wardId: swWardId,
                rainfallMmHr: localRainfall,
                runoffCoefficient: runoffCoefficient,
                catchmentAreaHa: 12.5,
                observedWaterDepthText: roadWaterLevel,
                citizenReportsCount: citizenReportsCount,
                reportedDrainCondition: drainageCondition,
                waterloggingTrend: blockedDrain === 'COMPLETELY_BLOCKED' || drainageResponse === 'RESTRICTED' || roadWaterLevel === 'KNEE' || roadWaterLevel === 'WAIST' || roadWaterLevel === 'SUBMERGED' ? 'rapid' : 'stable'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
