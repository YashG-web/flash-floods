import React from 'react';
import type { LocationData, IoTSensor, CitizenReport, EarlyWarningAlert } from '../types';
import { DisasterMap } from './Map/DisasterMap';
import { HyperlocalRiskPanel } from './HyperlocalRiskPanel';
import { CauseIntelligenceCard } from './CauseIntelligence';
import {
  AlertTriangle,
  Flame,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Cpu,
  Radio,
  FileText
} from 'lucide-react';

interface CommandCenterProps {
  locations: LocationData[];
  selectedLocation: LocationData;
  onSelectLocation: (loc: LocationData) => void;
  riverNetworks: any[];
  drainageLines: any[];
  sensors: IoTSensor[];
  citizenReports: CitizenReport[];
  infrastructure: any[];
  historicalEvents: any[];
  alerts: EarlyWarningAlert[];
  activeLayers: any;
  onToggleLayer: (layerKey: string) => void;
  onNavigateTab: (tab: string) => void;
  onOpenReportModal: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  riverNetworks,
  drainageLines,
  sensors,
  citizenReports,
  infrastructure,
  historicalEvents,
  alerts,
  activeLayers,
  onToggleLayer,
  onNavigateTab,
  onOpenReportModal
}) => {
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'WARNING');

  return (
    <div className="space-y-4">
      {/* Alert Notification Ticker */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-600 text-white px-4 py-2.5 rounded-xl shadow-sm flex items-center justify-between gap-3 text-xs font-semibold">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="px-2 py-0.5 bg-white text-red-700 font-black rounded text-[10px] uppercase shrink-0 animate-pulse">
              🚨 ACTIVE FLASH WARNING
            </span>
            <span className="truncate">
              <b>{criticalAlerts[0].location_name}:</b> {criticalAlerts[0].headline} — {criticalAlerts[0].cause_explanation}
            </span>
          </div>

          <button
            onClick={() => onNavigateTab('alerts')}
            className="shrink-0 underline text-red-100 hover:text-white font-bold cursor-pointer flex items-center gap-1"
          >
            <span>Review Response SOPs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid: Left Map (7 cols) and Right Intelligence Panels (5 cols) */}
      <div className="grid lg:grid-cols-12 gap-4 items-start">
        {/* Left Map Area */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between px-2 pb-2.5 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <span className="uppercase tracking-wider">Interactive Geospatial Hazard Grid</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Click any ward or village polygon to inspect localized intelligence
              </div>
            </div>

            <div className="mt-2.5">
              <DisasterMap
                locations={locations}
                selectedLocation={selectedLocation}
                onSelectLocation={onSelectLocation}
                riverNetworks={riverNetworks}
                drainageLines={drainageLines}
                sensors={sensors}
                citizenReports={citizenReports}
                infrastructure={infrastructure}
                historicalEvents={historicalEvents}
                activeLayers={activeLayers}
                onToggleLayer={onToggleLayer}
              />
            </div>
          </div>

          {/* Quick Telemetry Bar under map */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              onClick={() => onNavigateTab('sensors')}
              className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-slate-300 transition"
            >
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Rainfall Gauge (Station)</span>
              <span className="text-lg font-black text-slate-900 font-mono">42.0 mm/h</span>
              <span className="text-[10px] text-amber-600 font-bold block mt-0.5">MODERATE INFLOW</span>
            </div>

            <div
              onClick={() => onNavigateTab('sensors')}
              className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-slate-300 transition"
            >
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Station Nullah Drain</span>
              <span className="text-lg font-black text-red-600 font-mono">18% Efficiency</span>
              <span className="text-[10px] text-red-600 font-bold block mt-0.5">CRITICALLY CHOKED</span>
            </div>

            <div
              onClick={() => onNavigateTab('sensors')}
              className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-slate-300 transition"
            >
              <span className="text-[10px] uppercase font-bold text-slate-400 block">River Water Gauge</span>
              <span className="text-lg font-black text-orange-600 font-mono">4.6 m (High)</span>
              <span className="text-[10px] text-orange-600 font-bold block mt-0.5">SURGING ↑↑</span>
            </div>

            <div
              onClick={() => onNavigateTab('citizen-reports')}
              className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-slate-300 transition"
            >
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Crowd Waterlog Logs</span>
              <span className="text-lg font-black text-red-600 font-mono">14 Reports</span>
              <span className="text-[10px] text-red-600 font-bold block mt-0.5">+ Submit New Photo</span>
            </div>
          </div>
        </div>

        {/* Right Hyperlocal Intelligence Panels */}
        <div className="lg:col-span-5 space-y-4">
          {/* Hyperlocal Risk Detail Card */}
          <HyperlocalRiskPanel
            location={selectedLocation}
            onOpenSopAction={() => onNavigateTab('response')}
            onOpenPredictionWorkbench={() => onNavigateTab('predictions')}
          />

          {/* Cause Intelligence Card */}
          <CauseIntelligenceCard
            cause={selectedLocation.cause_intelligence}
            locationName={selectedLocation.name}
            rainfall={selectedLocation.rainfall}
            drainageScore={selectedLocation.drainage_condition}
            citizenReportsCount={selectedLocation.citizen_reports_count}
          />
        </div>
      </div>
    </div>
  );
};
