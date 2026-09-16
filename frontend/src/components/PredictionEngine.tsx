import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { CauseIntelligenceCard } from './CauseIntelligence';
import { ShapExplainabilityCard } from './ShapExplainability';
import { Sliders, Cpu, Sparkles, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

export const PredictionEngineWorkbench: React.FC = () => {
  const [rainfall, setRainfall] = useState<number>(42.0);
  const [soilMoisture, setSoilMoisture] = useState<number>(81.5);
  const [slope, setSlope] = useState<number>(4.5);
  const [elevation, setElevation] = useState<number>(348.0);
  const [drainageCondition, setDrainageCondition] = useState<number>(22.0);
  const [historicalEvents, setHistoricalEvents] = useState<number>(4);
  const [sensorWaterLevel, setSensorWaterLevel] = useState<number>(2.1);
  const [imperviousSurfacePct, setImperviousSurfacePct] = useState<number>(82.0);
  const [citizenReportsCount, setCitizenReportsCount] = useState<number>(14);

  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);

  const runPrediction = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.predictFlood({
        rainfall,
        soil_moisture: soilMoisture,
        slope,
        elevation,
        drainage_condition: drainageCondition,
        historical_events: historicalEvents,
        sensor_water_level: sensorWaterLevel,
        impervious_surface_pct: imperviousSurfacePct,
        location_id: 'custom-workbench',
        location_name: 'Custom Parameter Simulation',
        citizen_reports_count: citizenReportsCount,
        waterlogging_trend: drainageCondition < 30 ? 'increasing' : 'stable'
      });
      setPredictionResult(res);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run on mount once
  React.useEffect(() => {
    runPrediction();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-600" />
            <h2 className="font-extrabold text-base text-slate-900 uppercase tracking-wider">
              AI Prediction Engine & SHAP Explainability Workbench
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Test and calibrate hydrological parameters with dynamic model_config.json schema validation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 font-semibold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Integration Interface Ready for `model.pkl`</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Parameter Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-sky-600" />
              <span>Hydrological Parameters</span>
            </span>
            <button
              onClick={runPrediction}
              disabled={isLoading}
              className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Computing...' : 'Run Inference'}</span>
            </button>
          </div>

          {/* Rainfall Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700">Hourly Rainfall Rate:</span>
              <span className="font-mono text-sky-600">{rainfall} mm/h</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="1"
              value={rainfall}
              onChange={(e) => setRainfall(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0 (Dry)</span>
              <span>45 (Moderate)</span>
              <span>150 (Cloudburst)</span>
            </div>
          </div>

          {/* Drainage Condition Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700">Drainage Hydraulic Efficiency:</span>
              <span className={`font-mono ${drainageCondition < 30 ? 'text-red-600 font-black' : 'text-emerald-600'}`}>
                {drainageCondition}/100 {drainageCondition < 30 ? '(CRITICALLY CHOKED)' : ''}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={drainageCondition}
              onChange={(e) => setDrainageCondition(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0 (Completely Blocked)</span>
              <span>50 (Restricted)</span>
              <span>100 (Optimal Flow)</span>
            </div>
          </div>

          {/* Soil Moisture */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700">Soil Moisture Saturation:</span>
              <span className="font-mono text-indigo-600">{soilMoisture}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              step="1"
              value={soilMoisture}
              onChange={(e) => setSoilMoisture(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Terrain Slope */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700">Terrain Slope Angle:</span>
              <span className="font-mono text-slate-900">{slope}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="45"
              step="0.5"
              value={slope}
              onChange={(e) => setSlope(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-700"
            />
          </div>

          {/* River / Gauge Water Level */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700">Culvert / Gauge Water Surcharge:</span>
              <span className="font-mono text-red-600">{sensorWaterLevel} m</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="6.0"
              step="0.1"
              value={sensorWaterLevel}
              onChange={(e) => setSensorWaterLevel(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>

          {/* Citizen Reports Count */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700">Verified Citizen Waterlogging Reports:</span>
              <span className="font-mono text-amber-700">{citizenReportsCount} Logs</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={citizenReportsCount}
              onChange={(e) => setCitizenReportsCount(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>

          {/* Presets */}
          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => {
                setRainfall(42);
                setDrainageCondition(18);
                setSoilMoisture(81);
                setCitizenReportsCount(14);
                setSensorWaterLevel(2.2);
              }}
              className="flex-1 py-1.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold cursor-pointer transition"
            >
              Load Choked Drain Preset
            </button>
            <button
              onClick={() => {
                setRainfall(105);
                setDrainageCondition(75);
                setSoilMoisture(94);
                setCitizenReportsCount(4);
                setSensorWaterLevel(4.8);
              }}
              className="flex-1 py-1.5 px-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 text-[11px] font-bold cursor-pointer transition"
            >
              Load Cloudburst Preset
            </button>
          </div>
        </div>

        {/* Right Output Panels (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Prediction Result Summary */}
          {predictionResult && (
            <>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Model Inference Output
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-3xl font-black text-slate-900">
                      {predictionResult.prediction?.probability}%
                    </span>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-black uppercase text-white shadow-xs"
                      style={{ backgroundColor: predictionResult.prediction?.risk_color }}
                    >
                      {predictionResult.prediction?.risk_level} RISK
                    </span>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <div>Status: <b className="text-slate-800">{predictionResult.status_message}</b></div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Thresholds: 0-30 Low, 31-60 Mod, 61-80 High, 81+ Crit</div>
                </div>
              </div>

              {/* Cause Intelligence Card */}
              <CauseIntelligenceCard
                cause={predictionResult.cause_intelligence}
                locationName="Simulation Target"
                rainfall={rainfall}
                drainageScore={drainageCondition}
                citizenReportsCount={citizenReportsCount}
              />

              {/* SHAP Explainability Card */}
              <ShapExplainabilityCard
                explanation={predictionResult.shap_explanation}
                modelProbability={predictionResult.prediction?.probability || 0}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
