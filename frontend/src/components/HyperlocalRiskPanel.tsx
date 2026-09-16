import React from 'react';
import type { LocationData } from '../types';
import {
  TrendingUp,
  Clock,
  Droplet,
  Mountain,
  AlertCircle,
  Building,
  HelpCircle,
  Cpu
} from 'lucide-react';

interface HyperlocalRiskPanelProps {
  location: LocationData;
  onOpenSopAction: () => void;
  onOpenPredictionWorkbench: () => void;
}

export const HyperlocalRiskPanel: React.FC<HyperlocalRiskPanelProps> = ({
  location,
  onOpenSopAction,
  onOpenPredictionWorkbench
}) => {
  const prob = location.risk_probability !== undefined ? location.risk_probability : 50;
  const level = location.risk_level || (prob >= 80 ? 'CRITICAL' : prob >= 60 ? 'HIGH' : prob >= 30 ? 'MODERATE' : 'LOW');
  
  const getBadgeStyle = (lvl: string) => {
    switch (lvl) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MODERATE':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  const contributions = location.shap_explanation?.contributions || [
    { feature_id: 'rainfall', feature_name: 'Rainfall Intensity', relative_contribution_pct: 35.0, severity_score: 88 },
    { feature_id: 'drainage_condition', feature_name: 'Drainage Choking / Inefficiency', relative_contribution_pct: 30.0, severity_score: 82 },
    { feature_id: 'soil_moisture', feature_name: 'Soil Moisture Saturation', relative_contribution_pct: 20.0, severity_score: 75 },
    { feature_id: 'historical_events', feature_name: 'Historical Recurrence Prior', relative_contribution_pct: 10.0, severity_score: 55 },
    { feature_id: 'slope', feature_name: 'Terrain Slope Angle', relative_contribution_pct: 5.0, severity_score: 45 }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">
            {location.type} HYPERLOCAL TELEMETRY
          </span>
          <h2 className="text-lg font-black tracking-tight text-white">{location.name}</h2>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${getBadgeStyle(level)}`}>
          {level} RISK
        </div>
      </div>

      {/* Model Integration Notice Banner */}
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5 font-medium">
          <Cpu className="w-3.5 h-3.5 text-sky-600" />
          <span>ML Interface: <b>Ready for User-Trained model.pkl</b></span>
        </div>
        <span className="text-slate-400">XGBoost & SHAP Architecture</span>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Core Metric Cards */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500">Flood Probability</div>
            <div className={`text-2xl font-black mt-0.5 ${
              prob >= 80 ? 'text-red-600' : prob >= 60 ? 'text-orange-600' : prob >= 30 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {prob}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Model Output</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-sky-600" /> Risk Window
            </div>
            <div className="text-sm font-black text-slate-800 mt-1">
              {location.expected_window}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Lead Time</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3 text-red-600" /> Risk Trend
            </div>
            <div className="text-sm font-black text-red-600 mt-1">
              {location.risk_trend}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Telemetry Delta</div>
          </div>
        </div>

        {/* Contributing Factors Breakdown (SHAP-driven) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Contributing Risk Factors (Explainability)
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Relative Contribution</span>
          </div>

          <div className="space-y-2">
            {contributions.slice(0, 5).map((factor, idx) => (
              <div key={idx} className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
                <div className="flex justify-between font-semibold text-slate-800 mb-1">
                  <span>{factor.feature_name}</span>
                  <span className="font-mono text-slate-900 font-bold">
                    {factor.relative_contribution_pct}% contribution
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      factor.feature_id === 'drainage_condition'
                        ? 'bg-amber-500'
                        : factor.feature_id === 'rainfall'
                        ? 'bg-sky-600'
                        : factor.feature_id === 'soil_moisture'
                        ? 'bg-blue-800'
                        : 'bg-slate-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(8, factor.severity_score))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Measured Telemetry */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="text-xs font-bold text-slate-900 mb-2">Active Field Telemetry</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">Rainfall:</span>
              <span className="font-mono font-bold text-slate-900">{location.rainfall} mm/h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Soil Moisture:</span>
              <span className="font-mono font-bold text-slate-900">{location.soil_moisture}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Drain Efficiency:</span>
              <span className={`font-mono font-bold ${location.drainage_condition < 40 ? 'text-red-600' : 'text-emerald-700'}`}>
                {location.drainage_condition}/100 {location.drainage_condition < 40 ? '(CHOKED)' : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Terrain Slope:</span>
              <span className="font-mono font-bold text-slate-900">{location.slope}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Elevation:</span>
              <span className="font-mono font-bold text-slate-900">{location.elevation}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Crowd Reports:</span>
              <span className="font-mono font-bold text-red-600">{location.citizen_reports_count} verified</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex gap-2">
          <button
            onClick={onOpenSopAction}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition text-center cursor-pointer"
          >
            Trigger SOP Actions
          </button>
          <button
            onClick={onOpenPredictionWorkbench}
            className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition cursor-pointer"
          >
            Tune Simulation
          </button>
        </div>
      </div>
    </div>
  );
};
