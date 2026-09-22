import React from 'react';
import {
  AlertTriangle,
  MapPin,
  Clock,
  ArrowRight,
  ShieldAlert,
  Compass,
  CheckCircle2,
  Construction
} from 'lucide-react';

export interface StreetWaterloggingAlertData {
  id: string;
  roadName: string;
  wardName: string;
  status: 'SEVERE' | 'MODERATE' | 'MINOR' | 'CLEAR';
  cause: string;
  citizenReportsCount: number;
  lastUpdated: string;
  waterDepth?: string;
  recommendedAction: string;
  alternateRoute?: string;
}

interface StreetWaterloggingAlertCardProps {
  alert: StreetWaterloggingAlertData | null;
  onViewOnMap?: (roadName?: string) => void;
  onOpenReport?: () => void;
}

export const StreetWaterloggingAlertCard: React.FC<StreetWaterloggingAlertCardProps> = ({
  alert,
  onViewOnMap,
  onOpenReport
}) => {
  if (!alert || alert.status === 'CLEAR') {
    return (
      <div className="bg-white rounded-3xl border-2 border-emerald-300 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-wider mb-0.5">
              <span>ROAD CONDITION: ALL PASSABLE</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 font-mono">
              ✓ NO SEVERE ROAD WATERLOGGING REPORTED
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Municipal arterial roads and key commercial corridors are currently clear for vehicle and pedestrian transit.
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-mono shrink-0">
          Street Patrol Active
        </div>
      </div>
    );
  }

  const getStatusConfig = (status: 'SEVERE' | 'MODERATE' | 'MINOR' | 'CLEAR') => {
    switch (status) {
      case 'SEVERE':
        return {
          bannerBg: 'bg-red-600',
          badgeBg: 'bg-red-100 text-red-800 border-red-200',
          border: 'border-red-500',
          indicator: '🔴',
          label: 'SEVERE WATERLOGGING',
          sub: 'Road impassable for two-wheelers and compact vehicles. Avoid route.'
        };
      case 'MODERATE':
        return {
          bannerBg: 'bg-amber-600',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
          border: 'border-amber-500',
          indicator: '🟠',
          label: 'MODERATE WATERLOGGING',
          sub: 'Water accumulating in curb lanes. Drive with extreme caution.'
        };
      case 'MINOR':
        return {
          bannerBg: 'bg-yellow-500',
          badgeBg: 'bg-yellow-100 text-yellow-900 border-yellow-200',
          border: 'border-yellow-400',
          indicator: '🟡',
          label: 'MINOR WATERLOGGING',
          sub: 'Puddle accumulation near storm drain inlets.'
        };
      default:
        return {
          bannerBg: 'bg-emerald-600',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          border: 'border-emerald-500',
          indicator: '🟢',
          label: 'PASSABLE',
          sub: 'Normal road conditions.'
        };
    }
  };

  const config = getStatusConfig(alert.status);

  return (
    <div className={`bg-white rounded-3xl border-3 ${config.border} shadow-md overflow-hidden`}>
      {/* Header Banner */}
      <div className={`${config.bannerBg} text-white px-5 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <Construction className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-white/90 font-mono">
              ROAD HAZARD ALERT
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">
              🚧 STREET WATERLOGGING
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white text-slate-900 font-black text-xs rounded-full font-mono shadow-xs">
            {config.indicator} {config.label}
          </span>
        </div>
      </div>

      {/* Main Alert Body */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Road & Location Name */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Affected Roadway
            </div>
            <div className="text-xl font-black text-slate-900 font-mono flex items-center gap-2 mt-0.5">
              <span>{alert.roadName}</span>
              <span className="text-xs font-bold text-slate-500 font-sans">({alert.wardName})</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Updated {alert.lastUpdated}</span>
            </div>
            <span>•</span>
            <div className="font-semibold text-slate-700">
              {alert.citizenReportsCount} citizen reports
            </div>
          </div>
        </div>

        {/* Cause & Recommended Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl">
            <div className="text-[11px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>Observed Cause</span>
            </div>
            <p className="text-xs text-amber-950 font-medium">
              {alert.cause}
            </p>
            {alert.waterDepth && (
              <div className="mt-2 text-[11px] font-bold text-amber-800">
                Water Depth: <span className="font-mono">{alert.waterDepth}</span>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-2xl">
            <div className="text-[11px] font-black uppercase text-red-900 tracking-wider flex items-center gap-1.5 mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-red-700" />
              <span>Recommended Action</span>
            </div>
            <p className="text-xs text-red-950 font-bold">
              ⚠ {alert.recommendedAction}
            </p>
            {alert.alternateRoute && (
              <div className="mt-2 text-[11px] text-slate-700 font-medium">
                Alternate Route: <span className="font-bold text-slate-900">{alert.alternateRoute}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {onViewOnMap && (
            <button
              onClick={() => onViewOnMap(alert.roadName)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>VIEW STREET MAP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            >
              <span>UPDATE / REPORT THIS ROAD</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
