import React from 'react';
import type { ShapExplanation } from '../types';
import { HelpCircle, Info, Sparkles, SlidersHorizontal } from 'lucide-react';

interface ShapExplainabilityProps {
  explanation?: ShapExplanation;
  modelProbability: number;
}

export const ShapExplainabilityCard: React.FC<ShapExplainabilityProps> = ({
  explanation,
  modelProbability
}) => {
  const contributions = explanation?.contributions || [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              SHAP Model Explainability
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mathematical feature attribution explaining why this specific location is at risk.
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Model Probability</span>
          <span className="text-base font-black text-slate-900">{modelProbability}%</span>
        </div>
      </div>

      {/* Critical Scientific Note on Probability vs Contribution */}
      <div className="bg-sky-50 p-2.5 rounded-xl border border-sky-200 mb-4 flex items-start gap-2 text-xs text-sky-900">
        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <strong>Scientific Distinction:</strong> The <strong>Model Probability ({modelProbability}%)</strong> represents the overall statistical likelihood of flash flooding. The bars below represent <strong>relative feature contributions (SHAP values)</strong> pushing the baseline risk upward or downward.
        </div>
      </div>

      <div className="space-y-3">
        {contributions.map((item, idx) => {
          const isIncreasing = item.direction === 'RISK_INCREASING';
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isIncreasing ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  {item.feature_name}
                </span>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-slate-500">
                    SHAP: <span className={item.shap_value > 0 ? 'text-red-700 font-bold' : 'text-emerald-700'}>
                      {item.shap_value > 0 ? `+${item.shap_value}` : item.shap_value}
                    </span>
                  </span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-900 font-bold">
                    {item.relative_contribution_pct}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.feature_id === 'rainfall'
                      ? 'bg-sky-600'
                      : item.feature_id === 'drainage_condition'
                      ? 'bg-amber-600'
                      : item.feature_id === 'soil_moisture'
                      ? 'bg-indigo-600'
                      : item.feature_id === 'sensor_water_level'
                      ? 'bg-red-600'
                      : 'bg-slate-600'
                  }`}
                  style={{ width: `${Math.max(5, Math.min(100, item.severity_score))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Engine: <b>shap.TreeExplainer (Active)</b></span>
        <span>Base Prior Value: <b>{explanation?.base_value?.toFixed(1) || '16.3'}%</b></span>
      </div>
    </div>
  );
};
