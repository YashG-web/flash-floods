import React from 'react';
import type { LocationData, FlashFloodWarning, LiveEnvironmentalData } from '../types';
import { getAffectedRoadsCount } from '../data/municipalRoads';
import {
  ShieldAlert,
  ArrowRight,
  Waves,
  Construction,
  CloudRain,
  Droplets,
  Mountain,
  AlertTriangle,
  Clock,
  Compass,
  CheckCircle2,
  MapPin,
  ExternalLink
} from 'lucide-react';

interface LandingPageProps {
  locations: LocationData[];
  selectedLocation: LocationData | null;
  onSelectLocation?: (loc: LocationData) => void;
  activeFlashWarning: FlashFloodWarning | null;
  lastUpdated: string;
  isDemoMode?: boolean;
  liveEnvironment?: LiveEnvironmentalData | null;
  onNavigateToFlashFlood: () => void;
  onNavigateToStreetWaterlogging: () => void;
  onNavigateToMap: () => void;
  onNavigateToReport: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  locations,
  selectedLocation,
  activeFlashWarning,
  lastUpdated,
  isDemoMode = true,
  liveEnvironment,
  onNavigateToFlashFlood,
  onNavigateToStreetWaterlogging,
  onNavigateToMap,
  onNavigateToReport
}) => {
  const activeLoc = selectedLocation || locations[0] || {
    name: 'Ward 12 (Station Road / Market)',
    risk_level: 'HIGH'
  };

  const hasFlashWarning = activeFlashWarning && activeFlashWarning.status !== 'NONE';
  const affectedRoadsCount = getAffectedRoadsCount();

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* 1. HERO SECTION */}
      <section className="text-center py-6 sm:py-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-sky-400 text-xs font-black uppercase tracking-widest font-mono shadow-xs">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Community Disaster Intelligence Portal</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 font-mono tracking-tight leading-none">
          JALRAKSHAK
        </h1>

        <p className="text-lg sm:text-xl font-bold text-sky-700 tracking-wide">
          “Know the risk. Act early.”
        </p>

        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Two dedicated monitoring engines protecting Himalayan river basins and municipal urban roadways.
        </p>
      </section>

      {/* 2. TWO LARGE SEPARATE CARDS SIDE-BY-SIDE */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* CARD 1: 🌊 FLASH FLOOD (Regional / Ward-Level Risk) */}
        <div className="group rounded-3xl bg-white border-2 border-blue-200 hover:border-blue-500 transition-all duration-300 shadow-md hover:shadow-xl flex flex-col justify-between overflow-hidden">
          {/* Real Himalayan Flood Photography */}
          <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
            <img
              src="/assets/flash_flood_hero.jpg"
              alt="Flash Flood Mountain Valley"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500 contrast-105 brightness-95"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-blue-600/90 text-white rounded-full text-xs font-black font-mono tracking-wider shadow-xs backdrop-blur-xs flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5" />
                <span>REGIONAL / WARD SCALE</span>
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl sm:text-3xl font-black text-white font-mono flex items-center gap-2">
                <span>🌊 FLASH FLOOD</span>
              </h2>
              <p className="text-xs text-blue-200 font-semibold mt-0.5">
                Regional / Ward-Level Risk
              </p>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="text-xs font-black uppercase text-slate-400 font-mono tracking-wider">
                Monitor:
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-semibold">
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  <span>Heavy rainfall</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  <span>Soil saturation</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  <span>Terrain / slope</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  <span>River / water levels</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  <span>Historical risk</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onNavigateToFlashFlood}
              className="w-full py-3.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md group-hover:bg-blue-700"
            >
              <span>VIEW FLASH FLOOD</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>

        {/* CARD 2: 🚧 STREET WATERLOGGING (Road-Level Local Risk) */}
        <div className="group rounded-3xl bg-white border-2 border-amber-200 hover:border-amber-500 transition-all duration-300 shadow-md hover:shadow-xl flex flex-col justify-between overflow-hidden">
          {/* Real Urban Waterlogging Photography */}
          <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
            <img
              src="/assets/street_waterlog_hero.jpg"
              alt="Street Level Waterlogging"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500 contrast-105 brightness-95"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-amber-600/90 text-white rounded-full text-xs font-black font-mono tracking-wider shadow-xs backdrop-blur-xs flex items-center gap-1.5">
                <Construction className="w-3.5 h-3.5" />
                <span>ROAD / STREET SCALE</span>
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-2xl sm:text-3xl font-black text-white font-mono flex items-center gap-2">
                <span>🚧 STREET WATERLOGGING</span>
              </h2>
              <p className="text-xs text-amber-200 font-semibold mt-0.5">
                Road-Level Local Risk
              </p>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="text-xs font-black uppercase text-slate-400 font-mono tracking-wider">
                Monitor:
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-semibold">
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                  <span>Waterlogging</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                  <span>Blocked drains</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                  <span>Citizen reports</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                  <span>Drainage condition</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                  <span>Road-level flooding</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onNavigateToStreetWaterlogging}
              className="w-full py-3.5 px-5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md group-hover:bg-amber-700"
            >
              <span>VIEW STREET WATERLOGGING</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. CURRENT LOCAL STATUS (Small status bar with direct links) */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 font-mono">
              CURRENT LOCAL STATUS
            </h3>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Observed at {lastUpdated}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Flash Flood Status Mini Card */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col justify-between gap-3">
            <div>
              <div className="text-[10px] font-black uppercase text-blue-800 font-mono tracking-wider mb-1 flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-blue-600" />
                <span>Regional Flood Danger</span>
              </div>
              <div className="text-base font-black text-slate-900 font-mono flex items-center gap-2">
                <span>{hasFlashWarning ? '🔴 HIGH FLASH FLOOD RISK' : '🟢 NORMAL RIVER FLOWS'}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {hasFlashWarning
                  ? `Active warning issued for ${activeFlashWarning.locationName.split(' ')[0]}. Expected in next 1–3 hours.`
                  : 'All regional river basins and drainage channels are operating within safe design limits.'}
              </p>
            </div>

            <button
              onClick={onNavigateToFlashFlood}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 self-start cursor-pointer hover:underline"
            >
              <span>Go to Flash Flood Monitoring</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Street Waterlogging Status Mini Card */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 flex flex-col justify-between gap-3">
            <div>
              <div className="text-[10px] font-black uppercase text-amber-800 font-mono tracking-wider mb-1 flex items-center gap-1.5">
                <Construction className="w-3.5 h-3.5 text-amber-600" />
                <span>Road-Level Conditions</span>
              </div>
              <div className="text-base font-black text-slate-900 font-mono flex items-center gap-2">
                <span>🔴 {affectedRoadsCount} ROADS WATERLOGGED</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Severe waterlogging confirmed on Main Market Road due to choked culvert. Diversions active.
              </p>
            </div>

            <button
              onClick={onNavigateToStreetWaterlogging}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 self-start cursor-pointer hover:underline"
            >
              <span>Go to Street Waterlogging Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
