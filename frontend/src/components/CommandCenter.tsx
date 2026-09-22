import React, { useState } from 'react';
import type { LocationData, IoTSensor, CitizenReport, EarlyWarningAlert, FlashFloodWarning, Hospital } from '../types';
import { DisasterMap } from './Map/DisasterMap';
import { ScenarioSimulator } from './ScenarioSimulator';
import { HospitalCapacityPanel } from './HospitalCapacityPanel';
import {
  Radio,
  Sliders,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  Camera,
  Activity,
  AlertTriangle
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
  activeFlashWarning: FlashFloodWarning | null;
  onApplyWarning: (warning: FlashFloodWarning, updatedLoc: LocationData) => void;
  onResetSimulation: () => void;
  activeLayers: any;
  onToggleLayer: (layerKey: string) => void;
  onNavigateTab: (tab: string) => void;
  onOpenReportModal: () => void;
  hospitals?: Hospital[];
  isDemoMode?: boolean;
  activeScenario?: string;
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
  activeFlashWarning,
  onApplyWarning,
  onResetSimulation,
  activeLayers,
  onToggleLayer,
  onNavigateTab,
  onOpenReportModal,
  hospitals = [],
  isDemoMode = true,
  activeScenario = 'scenario_2_drainage_blockage'
}) => {
  const [authoritySubTab, setAuthoritySubTab] = useState<'operations' | 'simulator'>('operations');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [completedActions, setCompletedActions] = useState<{ [key: string]: boolean }>({
    action_1: false,
    action_2: false,
    action_3: false,
    action_4: false
  });

  const toggleAction = (key: string) => {
    setCompletedActions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const activeRisk = selectedLocation.risk_level || 'LOW';

  const getRiskBadge = (lvl: string) => {
    switch (lvl) {
      case 'CRITICAL': return { bg: 'bg-red-600', text: 'text-red-700', symbol: '🔴', label: 'CRITICAL RISK' };
      case 'HIGH': return { bg: 'bg-orange-500', text: 'text-orange-700', symbol: '🟠', label: 'HIGH RISK' };
      case 'MODERATE': return { bg: 'bg-amber-500', text: 'text-amber-700', symbol: '🟡', label: 'MODERATE RISK' };
      default: return { bg: 'bg-emerald-600', text: 'text-emerald-700', symbol: '🟢', label: 'LOW RISK' };
    }
  };

  const riskBadge = getRiskBadge(activeRisk);

  // Cause
  const causeText = selectedLocation.cause_intelligence?.probable_cause || (
    selectedLocation.drainage_condition < 35 
      ? 'Possible drainage blockage + localized waterlogging' 
      : 'Intense precipitation exceeding channel capacity'
  );

  // Filtered reports for this location
  const locReports = citizenReports.filter(r => r.location_id === selectedLocation.id);
  const reportsCount = locReports.length || selectedLocation.citizen_reports_count || 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Response Center Header Bar with Authority Sub-navigation */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-xs">
            <Radio className="w-6 h-6 text-sky-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-white font-mono">
                AUTHORITY / RESPONSE CENTER
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-bold">
                EOC Operations
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Operational decision support, real-time sensor network, and live scenario simulation
            </p>
          </div>
        </div>

        {/* Authority Navigation Switcher: Operations vs Scenario Simulator (Section 5) */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
          <button
            onClick={() => setAuthoritySubTab('operations')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              authoritySubTab === 'operations'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-sky-300" />
            <span>Response Center</span>
          </button>

          <button
            onClick={() => setAuthoritySubTab('simulator')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              authoritySubTab === 'simulator'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-300" />
            <span>Scenario Simulator</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black rounded">
              JUDGING DEMO
            </span>
          </button>
        </div>
      </div>

      {/* Sub-view 2: FLOOD SCENARIO SIMULATOR (Section 5 & 6) */}
      {authoritySubTab === 'simulator' ? (
        <ScenarioSimulator
          locations={locations}
          onApplyWarning={onApplyWarning}
          onResetSimulation={onResetSimulation}
          onNavigateToMap={() => onNavigateTab('flash-flood')}
          onNavigateToAlerts={() => onNavigateTab('alerts')}
        />
      ) : (
        /* Sub-view 1: RESPONSE OPERATIONS CENTER (Section 9) */
        <div className="space-y-6">
          {/* Target Ward Switcher & Warning Alert Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-600" />
              <span className="text-xs text-slate-500 font-bold">Target Inspection Ward:</span>
              <select
                value={selectedLocation.id}
                onChange={(e) => {
                  const found = locations.find(l => l.id === e.target.value);
                  if (found) onSelectLocation(found);
                }}
                className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-hidden cursor-pointer"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {activeFlashWarning && activeFlashWarning.status !== 'NONE' && (
              <div className="flex items-center gap-2 text-xs font-black text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl">
                <span className="animate-pulse">🚨</span>
                <span>ACTIVE FORECAST: {activeFlashWarning.statusLabel} ({activeFlashWarning.estimatedWindow})</span>
              </div>
            )}
          </div>

          {/* Main Operational Grid: Map & Telemetry (Left 7 cols) vs Decision Briefing (Right 5 cols) */}
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* Left: Interactive Risk Map & Sensor Status */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white p-3 rounded-3xl border border-slate-200 shadow-xs">
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
                  activeFlashWarning={activeFlashWarning}
                  hospitals={hospitals}
                  isDemoMode={isDemoMode}
                  activeLayers={activeLayers}
                  onToggleLayer={onToggleLayer}
                />
              </div>

              {/* Operational Sensor Status Cards */}
              <div>
                <div className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-sky-600" />
                  <span>Real-Time Sensor Telemetry Status</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Rainfall Rate</span>
                    <span className="text-lg font-black text-slate-900 font-mono">{selectedLocation.rainfall} mm/h</span>
                    <span className={`text-[10px] font-bold block mt-0.5 ${
                      selectedLocation.rainfall > 60 ? 'text-red-600' : selectedLocation.rainfall > 25 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {selectedLocation.rainfall > 60 ? 'CRITICAL INFLOW' : selectedLocation.rainfall > 25 ? 'MODERATE RAIN' : 'NORMAL'}
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Drain Efficiency</span>
                    <span className={`text-lg font-black font-mono ${
                      selectedLocation.drainage_condition < 35 ? 'text-red-600' : 'text-slate-900'
                    }`}>
                      {selectedLocation.drainage_condition}%
                    </span>
                    <span className={`text-[10px] font-bold block mt-0.5 ${
                      selectedLocation.drainage_condition < 35 ? 'text-red-600' : 'text-emerald-600'
                    }`}>
                      {selectedLocation.drainage_condition < 35 ? 'CHOKED DRAIN' : 'FLOWING NORMALLY'}
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">River Gauge</span>
                    <span className="text-lg font-black text-slate-900 font-mono">
                      {selectedLocation.sensor_water_level || 4.2} m
                    </span>
                    <span className="text-[10px] text-amber-600 font-bold block mt-0.5">
                      WARNING THRESHOLD
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Citizen Logs</span>
                    <span className="text-lg font-black text-red-600 font-mono">{reportsCount} Reports</span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                      Verified Local Hazard
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Operational Briefing (Section 9 Requirement) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Main Operational Assessment Card */}
              <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                {/* Ward & Risk Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      AREA UNDER REVIEW
                    </span>
                    <h3 className="text-lg font-black text-slate-900 font-mono">
                      {selectedLocation.name.toUpperCase()}
                    </h3>
                  </div>
                  <div className={`px-3 py-1 rounded-xl text-white text-xs font-black uppercase font-mono ${riskBadge.bg}`}>
                    {riskBadge.symbol} {riskBadge.label}
                  </div>
                </div>

                {/* CAUSE */}
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    CAUSE:
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {causeText}
                  </p>
                </div>

                {/* WHY IS THE RISK HIGH? (Section 10 & 11 Requirement) */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">
                    WHY IS THE RISK {activeRisk}?
                  </span>
                  <div className="space-y-1.5 text-xs text-slate-800">
                    <div className="flex items-center gap-2">
                      <span>🌧️</span>
                      <span className="font-semibold">Rainfall:</span>
                      <strong className="text-slate-900">
                        {selectedLocation.rainfall > 60 ? 'High' : selectedLocation.rainfall > 25 ? 'Moderate' : 'Low'} ({selectedLocation.rainfall} mm/h)
                      </strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>💧</span>
                      <span className="font-semibold">Soil moisture:</span>
                      <strong className="text-slate-900">
                        {selectedLocation.soil_moisture > 75 ? 'High (Saturated)' : 'Normal'}
                      </strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🚧</span>
                      <span className="font-semibold">Drainage:</span>
                      <strong className={selectedLocation.drainage_condition < 40 ? 'text-red-600' : 'text-slate-900'}>
                        {selectedLocation.drainage_condition < 40 ? 'Poor / Choked' : 'Good'}
                      </strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-200 mt-2">
                    These conditions are increasing local flood risk.
                  </p>
                </div>

                {/* REPORTS */}
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    REPORTS:
                  </span>
                  <p className="text-xs font-bold text-red-700">
                    {reportsCount} citizen reports logged in this sector
                  </p>
                </div>

                {/* AFFECTED */}
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    AFFECTED ROADS:
                  </span>
                  <p className="text-xs font-bold text-slate-900">
                    {selectedLocation.id === 'ward-12' 
                      ? 'Main Market Road, Station Road, Culvert #4 Crossing'
                      : 'Lower River Ghat Road, Terraced Valley Lanes'}
                  </p>
                </div>

                {/* CRITICAL INFRASTRUCTURE */}
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    CRITICAL INFRASTRUCTURE:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold border border-slate-200">
                      District Hospital (0.4 km)
                    </span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold border border-slate-200">
                      Power Substation #2
                    </span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold border border-slate-200">
                      Municipal High School
                    </span>
                  </div>
                </div>

                {/* RECOMMENDED ACTION CHECKLIST (Section 9 Requirement) */}
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-sky-800 block mb-2">
                    RECOMMENDED ACTION:
                  </span>

                  <div className="space-y-2">
                    <div
                      onClick={() => toggleAction('action_1')}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                        completedActions.action_1 ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      {completedActions.action_1 ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <span className={completedActions.action_1 ? 'line-through text-slate-500' : 'font-semibold'}>
                        Inspect drainage channel and deploy de-silting crew
                      </span>
                    </div>

                    <div
                      onClick={() => toggleAction('action_2')}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                        completedActions.action_2 ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      {completedActions.action_2 ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <span className={completedActions.action_2 ? 'line-through text-slate-500' : 'font-semibold'}>
                        Close affected road if water rises further; position police barricades
                      </span>
                    </div>

                    <div
                      onClick={() => toggleAction('action_3')}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                        completedActions.action_3 ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      {completedActions.action_3 ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      )}
                      <span className={completedActions.action_3 ? 'line-through text-slate-500' : 'font-semibold'}>
                        Broadcast municipal SMS flood warning to residents in Ward 12
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Citizen Reports Live Feed for Authorities */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-red-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Citizen Hazard Reports
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    {citizenReports.length} Total Logs
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {citizenReports.slice(0, 3).map((rep) => (
                    <div key={rep.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 block">{rep.location_name}</span>
                        <span className="text-slate-600 text-[11px]">{rep.description}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded-md shrink-0">
                        VERIFIED
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional Technical Details Toggle (Section 10 Requirement) */}
              <div className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className="w-full p-4 flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900 transition cursor-pointer"
                >
                  <span>TECHNICAL DETAILS & MODEL DIAGNOSTICS</span>
                  {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showTechnicalDetails && (
                  <div className="p-4 pt-0 text-xs text-slate-600 space-y-3 border-t border-slate-200 mt-1">
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block">Engine:</span>
                        <span className="font-bold text-slate-800">XGBoost Risk Pipeline</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block">Explainability:</span>
                        <span className="font-bold text-slate-800">SHAP Diagnostics</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block">Vision Verification:</span>
                        <span className="font-bold text-slate-800">Hazard Detection</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block">Coordinates:</span>
                        <span className="font-bold text-slate-800">
                          {selectedLocation.coordinates[0].toFixed(3)}, {selectedLocation.coordinates[1].toFixed(3)}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400">
                      Data ingest handles multi-source hydrological radar, Culvert IoT gauges, and crowdsourced field reports.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: EMERGENCY HEALTHCARE CAPACITY AWARENESS (Primary New Capability) */}
          <div className="pt-2">
            <HospitalCapacityPanel
              hospitals={hospitals}
              isDemoMode={isDemoMode}
              activeScenario={activeScenario}
              selectedLocationName={selectedLocation.name}
              onViewOnMap={(hosp) => {
                // Toggle hospitals layer on if disabled
                if (!activeLayers.hospitals) {
                  onToggleLayer('hospitals');
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
