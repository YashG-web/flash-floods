import React from 'react';
import type { LocationData, EarlyWarningAlert, FlashFloodWarning } from '../types';
import { FlashFloodWarningCard } from './FlashFloodWarningCard';
import {
  ShieldAlert,
  ArrowRight,
  Camera,
  MapPin,
  Clock,
  Droplets,
  CloudRain,
  Construction,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface LandingPageProps {
  locations: LocationData[];
  selectedLocation: LocationData | null;
  onSelectLocation: (loc: LocationData) => void;
  alerts: EarlyWarningAlert[];
  activeFlashWarning: FlashFloodWarning | null;
  lastUpdated: string;
  onNavigateToMap: () => void;
  onOpenReportModal: () => void;
  onNavigateToAlerts: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  alerts,
  activeFlashWarning,
  lastUpdated,
  onNavigateToMap,
  onOpenReportModal,
  onNavigateToAlerts
}) => {
  // Default to first location if none selected
  const activeLoc = selectedLocation || locations[0] || {
    id: 'ward-12',
    name: 'Ward 12 (Station Road / Market)',
    risk_level: 'HIGH',
    risk_probability: 78,
    rainfall: 42,
    drainage_condition: 18,
    soil_moisture: 82,
    cause_intelligence: {
      probable_cause: 'Drainage Culvert Choke + Moderate Rainfall',
      explanation: 'Moderate rainfall combined with severe drain blockage is causing water to accumulate on Main Market Road.'
    }
  } as LocationData;

  const riskLevel = activeLoc.risk_level || 'LOW';

  const getRiskVisuals = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return {
          badgeBg: 'bg-red-600',
          textColor: 'text-red-700',
          borderColor: 'border-red-500',
          symbol: '🔴',
          label: 'CRITICAL RISK',
          subtext: 'Severe flood danger. Immediate caution required.'
        };
      case 'HIGH':
        return {
          badgeBg: 'bg-orange-600',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-500',
          symbol: '🟠',
          label: 'HIGH RISK',
          subtext: 'Waterlogging developing on roads. Avoid affected streets.'
        };
      case 'MODERATE':
        return {
          badgeBg: 'bg-amber-600',
          textColor: 'text-amber-700',
          borderColor: 'border-amber-500',
          symbol: '🟡',
          label: 'MODERATE RISK',
          subtext: 'Rising water levels observed in low-lying spots.'
        };
      default:
        return {
          badgeBg: 'bg-emerald-600',
          textColor: 'text-emerald-700',
          borderColor: 'border-emerald-500',
          symbol: '🟢',
          label: 'LOW RISK',
          subtext: 'Normal water flow. No immediate flood threat.'
        };
    }
  };

  const riskVisual = getRiskVisuals(riskLevel);

  // Simplified Plain-Language Explanation
  const getPlainExplanation = () => {
    if (activeLoc.cause_intelligence?.explanation) {
      return activeLoc.cause_intelligence.explanation;
    }
    if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
      if (activeLoc.rainfall > 60) {
        return 'Heavy rainfall is increasing water levels in low-lying areas and overflowing local channels.';
      }
      return 'Moderate rainfall combined with suspected drainage blockage is increasing local waterlogging risk.';
    }
    return 'Rainfall and drainage conditions are currently normal across this sector.';
  };

  // Plain-Language Condition Indicators
  const rainfallStatus = activeLoc.rainfall > 60 ? 'Heavy' : activeLoc.rainfall > 25 ? 'Moderate' : 'Normal';
  const drainageStatus = activeLoc.drainage_condition < 35 ? 'Severely Choked' : activeLoc.drainage_condition < 65 ? 'Slow / Sluggish' : 'Clear & Flowing';
  const soilStatus = activeLoc.soil_moisture > 75 ? 'Saturated (Cannot absorb rain)' : activeLoc.soil_moisture > 50 ? 'Partially Damp' : 'Dry';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Real-World Context Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200">
        <img
          src="/assets/hero.jpg"
          alt="Monsoon Valley Flood Context"
          className="w-full h-36 sm:h-44 object-cover filter contrast-110 brightness-90"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/60 to-transparent flex flex-col justify-end p-5 sm:p-6 text-white">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Community Flood Safety Portal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Local Flood Risk & Early Warning
          </h2>
          <p className="text-xs sm:text-sm text-slate-200">
            Real-time hazard warnings for residents, drivers, shopkeepers, and municipal workers.
          </p>
        </div>
      </div>

      {/* 1. HERO AREA: WHAT IS THE CURRENT RISK? */}
      <section className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
              CURRENT FLOOD RISK
            </span>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sky-600 shrink-0" />
              <select
                value={activeLoc.id}
                onChange={(e) => {
                  const found = locations.find(l => l.id === e.target.value);
                  if (found) onSelectLocation(found);
                }}
                className="text-lg sm:text-xl font-black text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-500 flex items-center sm:justify-end gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Last updated: <strong className="text-slate-800 font-mono">{lastUpdated || '2 minutes ago'}</strong></span>
          </div>
        </div>

        {/* The Most Prominent Element: Risk Level Display */}
        <div className="py-6 sm:py-8 flex flex-col items-center text-center">
          <div className={`inline-flex items-center gap-3 px-6 sm:px-10 py-4 sm:py-5 rounded-2xl text-white shadow-md ${riskVisual.badgeBg}`}>
            <span className="text-3xl sm:text-4xl">{riskVisual.symbol}</span>
            <span className="text-2xl sm:text-4xl font-black tracking-wide uppercase font-mono">
              {riskVisual.label}
            </span>
          </div>

          <p className="mt-3 text-sm sm:text-base font-semibold text-slate-700 max-w-lg">
            {riskVisual.subtext}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onNavigateToMap}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition cursor-pointer"
            >
              <span>VIEW RISK MAP</span>
              <ArrowRight className="w-4 h-4 text-sky-400" />
            </button>
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>REPORT WATERLOGGING</span>
            </button>
          </div>
        </div>

        {/* 2. WHAT IS HAPPENING? */}
        <div className="mt-4 pt-6 border-t border-slate-100 bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span>WHAT IS HAPPENING?</span>
          </h3>

          <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed mb-4">
            {getPlainExplanation()}
          </p>

          {/* Plain Condition Factors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                <CloudRain className="w-4 h-4 text-sky-600" />
                <span>Rainfall</span>
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                {rainfallStatus} ({activeLoc.rainfall} mm/h)
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                <Construction className="w-4 h-4 text-amber-600" />
                <span>Drain Condition</span>
              </div>
              <div className={`text-sm font-extrabold ${activeLoc.drainage_condition < 40 ? 'text-red-600' : 'text-slate-900'}`}>
                {drainageStatus}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                <Droplets className="w-4 h-4 text-blue-600" />
                <span>Soil Moisture</span>
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                {soilStatus}
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500 italic">
            These conditions determine local flood risk across your streets.
          </p>
        </div>
      </section>

      {/* 3. PROMINENT FLASH FLOOD WARNING SYSTEM (Component 1 & 2 Requirement) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">
            ACTIVE HAZARD FORECAST
          </span>
          <button
            onClick={onNavigateToAlerts}
            className="text-xs font-bold text-sky-700 hover:text-sky-900 underline flex items-center gap-1 cursor-pointer"
          >
            <span>All Warnings & Statuses</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <FlashFloodWarningCard
          warning={activeFlashWarning}
          onViewOnMap={onNavigateToMap}
        />
      </section>

      {/* 4. WHAT SHOULD I DO? (ACTION CARD) */}
      <section className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
          <ShieldCheck className="w-6 h-6 text-sky-600" />
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
            WHAT SHOULD YOU DO?
          </h3>
        </div>

        {riskLevel === 'CRITICAL' || riskLevel === 'HIGH' ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-200 text-red-900 text-sm font-semibold">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">1</span>
              <span>Avoid Main Market Road and Station Road — water levels are hazardous.</span>
            </div>
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-xl border border-orange-200 text-orange-900 text-sm font-semibold">
              <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">2</span>
              <span>Move away from low-lying areas and ground-level shop floors.</span>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-sm font-semibold">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">3</span>
              <span>Do not walk or drive through flowing water — depth can be deceptive.</span>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-sm font-semibold">
              <span className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 text-xs font-bold">4</span>
              <span>Follow instructions from local police and municipal teams. Call <strong>112</strong> for immediate help.</span>
            </div>
            {activeLoc.drainage_condition < 40 && (
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-sky-950 text-xs font-medium">
                <strong>Drainage Blockage Action:</strong> Avoid the blocked drain channel. Municipal cleaning teams are responding.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>Current conditions are safe in this area. No active flood risk.</span>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-sm">
              <span className="w-6 h-6 rounded-full bg-slate-400 text-white flex items-center justify-center shrink-0 text-xs font-bold">•</span>
              <span>Keep roadside storm gutters free from garbage and plastic bags to maintain drainage.</span>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-sm">
              <span className="w-6 h-6 rounded-full bg-slate-400 text-white flex items-center justify-center shrink-0 text-xs font-bold">•</span>
              <span>Stay alert if continuous rainfall begins over the next 2–3 hours.</span>
            </div>
          </div>
        )}
      </section>

      {/* 5. REPORT FLOODING PROMINENT ACTION */}
      <section className="bg-linear-to-br from-red-600 to-rose-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
            <Camera className="w-4 h-4" />
            <span>Citizen Action</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            See Flooding or a Blocked Drain?
          </h3>
          <p className="text-sm text-rose-100 max-w-xl">
            Take a quick photo and report waterlogging on your street. Your report directly alerts authorities and updates the live risk map for your neighbors.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="shrink-0 px-6 py-3.5 rounded-2xl bg-white text-red-700 hover:bg-rose-50 font-black text-sm sm:text-base shadow-lg transition cursor-pointer flex items-center gap-2"
        >
          <Camera className="w-5 h-5 text-red-600" />
          <span>📸 REPORT FLOODING</span>
        </button>
      </section>
    </div>
  );
};
