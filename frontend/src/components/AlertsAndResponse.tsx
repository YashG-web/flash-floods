import React, { useState } from 'react';
import type { EarlyWarningAlert } from '../types';
import {
  Bell,
  AlertTriangle,
  Clock,
  MapPin,
  Flame,
  CheckCircle2,
  ShieldAlert,
  Send,
  Building,
  Radio,
  FileCheck
} from 'lucide-react';

interface AlertsAndResponseProps {
  alerts: EarlyWarningAlert[];
  onTriggerAction?: (actionId: string) => void;
}

export const AlertsAndResponse: React.FC<AlertsAndResponseProps> = ({
  alerts,
  onTriggerAction
}) => {
  const [completedActions, setCompletedActions] = useState<{ [key: string]: boolean }>({});

  const toggleAction = (actionId: string) => {
    setCompletedActions(prev => ({
      ...prev,
      [actionId]: !prev[actionId]
    }));
    if (onTriggerAction) onTriggerAction(actionId);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-600 text-white border-red-700 animate-pulse';
      case 'WARNING':
        return 'bg-orange-500 text-white border-orange-600';
      case 'WATCH':
        return 'bg-amber-500 text-slate-900 border-amber-600';
      default:
        return 'bg-emerald-600 text-white border-emerald-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Banner: PREDICT -> EXPLAIN -> ASSESS IMPACT -> ALERT -> RESPOND */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-sky-400" />
          <span className="font-extrabold text-sm tracking-wide uppercase">
            Emergency Standard Operating Procedure (SOP) Action Hub
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <span className="text-slate-300">PREDICT</span>
          <span>→</span>
          <span className="text-slate-300">EXPLAIN</span>
          <span>→</span>
          <span className="text-slate-300">IMPACT</span>
          <span>→</span>
          <span className="text-amber-400">ALERT</span>
          <span>→</span>
          <span className="text-emerald-400 font-extrabold">RESPOND</span>
        </div>
      </div>

      {/* Active Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert) => {
          const isCritical = alert.severity === 'CRITICAL';
          return (
            <div
              key={alert.alert_id}
              className={`bg-white rounded-2xl border-2 overflow-hidden shadow-sm transition ${
                isCritical ? 'border-red-500 shadow-red-500/10' : 'border-slate-200'
              }`}
            >
              {/* Alert Header Bar */}
              <div className={`p-4 flex flex-wrap items-center justify-between gap-3 ${
                isCritical ? 'bg-red-50 border-b border-red-200' : 'bg-slate-50 border-b border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border shadow-xs ${getSeverityBadge(alert.severity)}`}>
                    🚨 {alert.severity}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{alert.headline}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-600 mt-0.5">
                      <span className="flex items-center gap-1 font-bold text-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-red-600" />
                        {alert.location_name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-sky-600" />
                        Lead Window: {alert.expected_window}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Risk Probability</div>
                  <div className="text-xl font-black text-slate-900">{alert.risk_probability}%</div>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-5 space-y-4">
                {/* Diagnostic Cause Quote */}
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase text-[10px] tracking-wider text-amber-800 block">
                      Cause Intelligence: {alert.probable_cause}
                    </span>
                    <p className="mt-0.5 font-medium">{alert.cause_explanation}</p>
                  </div>
                </div>

                {/* Spatial Impact Exposure Summary */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Estimated Spatial Impact (GIS Topology)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block">Properties Exposed</span>
                      <span className="text-lg font-black text-slate-900">{alert.potential_impact.properties}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block">Roads Inundated</span>
                      <span className="text-lg font-black text-slate-900">{alert.potential_impact.roads}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block">Schools / Clinics</span>
                      <span className="text-lg font-black text-slate-900">
                        {(alert.potential_impact.schools || 0) + (alert.potential_impact.hospitals || 0)}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 font-bold block">Residents Vulnerable</span>
                      <span className="text-lg font-black text-red-600">{alert.potential_impact.residents}</span>
                    </div>
                  </div>
                </div>

                {/* Prescribed Action Directives */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Prescribed SOP Action Directives ({alert.recommended_actions.length} Tasks)
                  </h4>
                  <div className="space-y-2">
                    {alert.recommended_actions.map((act) => {
                      const isDone = completedActions[act.action_id];
                      return (
                        <div
                          key={act.action_id}
                          className={`p-3 rounded-xl border transition flex items-start justify-between gap-3 text-xs ${
                            isDone ? 'bg-emerald-50/50 border-emerald-300 text-slate-600' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 flex-1">
                            <input
                              type="checkbox"
                              checked={!!isDone}
                              onChange={() => toggleAction(act.action_id)}
                              className="mt-0.5 rounded text-sky-600 focus:ring-0 cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-extrabold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                  {act.title}
                                </span>
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                                  {act.urgency}
                                </span>
                              </div>
                              <p className="text-slate-600 mt-1">{act.description}</p>
                              <div className="text-[10px] text-slate-400 mt-1">
                                Responsible Authority: <b>{act.department}</b>
                              </div>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                            isDone ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-800'
                          }`}>
                            {isDone ? 'EXECUTED' : act.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
