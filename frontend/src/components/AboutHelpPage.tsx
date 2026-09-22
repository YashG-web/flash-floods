import React from 'react';
import {
  ShieldAlert,
  Waves,
  Construction,
  Phone,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
  MapPin,
  Clock
} from 'lucide-react';

interface AboutHelpPageProps {
  onNavigateToFlashFlood: () => void;
  onNavigateToStreetWaterlogging: () => void;
  onNavigateToReport: () => void;
}

export const AboutHelpPage: React.FC<AboutHelpPageProps> = ({
  onNavigateToFlashFlood,
  onNavigateToStreetWaterlogging,
  onNavigateToReport
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* 1. HEADER */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-sky-400 text-xs font-black uppercase tracking-widest font-mono">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>HELP & SYSTEM GUIDE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 font-mono tracking-tight">
          ABOUT JALRAKSHAK
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Understand the difference between regional flash floods and local road waterlogging, and how to stay safe.
        </p>
      </div>

      {/* 2. THE TWO DISTINCT SYSTEMS EXPLAINED */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-xl font-black text-slate-900 font-mono">
            TWO DISTINCT DISASTER MONITORING SYSTEMS
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            JalRakshak operates two separate monitoring engines because regional flood events require different responses than road-level waterlogging.
          </p>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Flash Flood System */}
          <div className="p-5 rounded-2xl bg-blue-50/70 border-2 border-blue-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-700 font-mono font-black text-xs uppercase tracking-wider">
                <Waves className="w-4 h-4" />
                <span>SYSTEM 1: FLASH FLOOD</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 font-mono">
                Regional & Ward-Level Flood Danger
              </h3>
              <div className="p-3 bg-white rounded-xl border border-blue-200 text-xs text-blue-950 font-semibold">
                Core Question: <span className="font-bold">“Could a dangerous flood event develop?”</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Scale:</strong> Region → Ward → River Catchment Basin</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Inputs:</strong> Heavy rain, soil saturation, slope, river surge, historical flood patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Action:</strong> Evacuation, moving to highlands, emergency shelter readiness</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onNavigateToFlashFlood}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Open Flash Flood Monitoring →
            </button>
          </div>

          {/* Street Waterlogging System */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-amber-700 font-mono font-black text-xs uppercase tracking-wider">
                <Construction className="w-4 h-4" />
                <span>SYSTEM 2: STREET WATERLOGGING</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 font-mono">
                Road-Level Local Risk
              </h3>
              <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-amber-950 font-semibold">
                Core Question: <span className="font-bold">“Which road is flooded right now and why?”</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Scale:</strong> Ward → Street → Individual Road</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Inputs:</strong> Citizen photos, blocked storm drains, local puddles, culvert efficiency</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Action:</strong> Avoid flooded road, reroute traffic, deploy municipal suction crews</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onNavigateToStreetWaterlogging}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Open Street Waterlogging Dashboard →
            </button>
          </div>
        </div>
      </section>

      {/* 3. EMERGENCY CONTACTS DIRECTORY */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <Phone className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-black text-slate-900 font-mono">
            EMERGENCY HELPLINES & DISASTER CELLS
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center">
            <div className="text-[10px] font-black uppercase text-red-700 font-mono">NATIONAL EMERGENCY</div>
            <div className="text-3xl font-black text-red-600 font-mono my-1">112</div>
            <div className="text-xs text-slate-600">Police, Fire & Medical Responders</div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
            <div className="text-[10px] font-black uppercase text-slate-600 font-mono">DISASTER MANAGEMENT CELL</div>
            <div className="text-3xl font-black text-slate-900 font-mono my-1">1077</div>
            <div className="text-xs text-slate-600">District Emergency Ops Center (DEOC)</div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
            <div className="text-[10px] font-black uppercase text-slate-600 font-mono">MUNICIPAL DRAINAGE CELL</div>
            <div className="text-3xl font-black text-slate-900 font-mono my-1">1070</div>
            <div className="text-xs text-slate-600">State Disaster Management (SDMA)</div>
          </div>
        </div>
      </section>
    </div>
  );
};
