import React from 'react';
import type { EarlyWarningAlert, FlashFloodWarning } from '../types';
import { FlashFloodWarningCard } from './FlashFloodWarningCard';
import {
  Bell,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface AlertsAndResponseProps {
  alerts: EarlyWarningAlert[];
  activeFlashWarning: FlashFloodWarning | null;
  onViewOnMap?: (locationId?: string) => void;
}

export const AlertsAndResponse: React.FC<AlertsAndResponseProps> = ({
  alerts,
  activeFlashWarning,
  onViewOnMap
}) => {
  // Filter for secondary alerts that are not the main flash warning
  const secondaryAlerts = alerts.filter(
    a => a.location_id !== activeFlashWarning?.locationId
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight font-mono">
              FLASH FLOOD WARNING CENTER
            </h2>
            <p className="text-xs text-slate-500">
              Active community hazard warnings, lead-time windows, and prescribed safety actions
            </p>
          </div>
        </div>

        {activeFlashWarning && activeFlashWarning.status !== 'NONE' && (
          <span className="px-3 py-1 bg-red-600 text-white text-xs font-black rounded-full animate-pulse font-mono">
            1 ACTIVE WARNING
          </span>
        )}
      </div>

      {/* 1. Primary Flash Flood Warning Card with 4 statuses & Timeline (Sections 1, 2, 3) */}
      <FlashFloodWarningCard
        warning={activeFlashWarning}
        onViewOnMap={onViewOnMap}
      />

      {/* 2. Secondary Sector Advisories (if any) */}
      {secondaryAlerts.length > 0 && (
        <div className="space-y-3 pt-4">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 block px-1">
            Secondary Sector Bulletins
          </span>

          {secondaryAlerts.map((alert) => (
            <div
              key={alert.alert_id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>{alert.location_name}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-amber-800 font-mono">{alert.severity}</span>
                </div>
                <p className="text-slate-600 mt-1">{alert.headline}</p>
              </div>

              <button
                onClick={() => onViewOnMap && onViewOnMap(alert.location_id)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold shrink-0 self-start sm:self-auto cursor-pointer"
              >
                Inspect on Map →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
