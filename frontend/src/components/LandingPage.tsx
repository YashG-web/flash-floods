import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
  Database,
  Brain,
  BellRing,
  CheckCircle2,
  CloudRain,
  AlertTriangle,
  Compass,
  FileCheck2,
  Users,
  Eye
} from 'lucide-react';

interface LandingPageProps {
  onOpenCommandCenter: () => void;
  onExploreHowItWorks: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenCommandCenter,
  onExploreHowItWorks
}) => {
  return (
    <div className="bg-slate-50 text-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-16 lg:py-24 border-b border-slate-800">
        {/* Background Image with dark tactical gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/hero.jpg"
            alt="Bhagirathi Himalayan River Basin Disaster Telemetry Overlay"
            className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity filter contrast-125"
          />
          <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/85 to-slate-950/60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.15),transparent_50%)]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-600/40 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-6">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>National Disaster Management Decision-Support Standard</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-white mb-4">
              JALRAKSHAK
            </h1>

            <p className="text-xl sm:text-2xl font-semibold text-sky-300 mb-4 tracking-tight">
              Hyperlocal Flood & Landslide Intelligence and Early Warning System
            </p>

            <blockquote className="text-base sm:text-lg text-slate-300 font-light border-l-2 border-sky-500 pl-4 py-1 mb-8 italic">
              “Predict the risk. Understand the cause. Protect communities.”
            </blockquote>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
              A mission-critical disaster management platform fusing environmental precipitation radar, 
              soil pore pressure, terrain topography, drainage hydraulic status, IoT culvert gauges, and 
              YOLO-verified crowd imagery to distinguish between <strong>Rainfall Overload</strong> and 
              <strong> Drainage Blockages</strong> with explainable SHAP intelligence.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                id="cta-open-command-center"
                onClick={onOpenCommandCenter}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-600/30 transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Open Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="cta-explore-how-it-works"
                onClick={onExploreHowItWorks}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition cursor-pointer"
              >
                <Compass className="w-4 h-4 text-sky-400" />
                <span>Explore How It Works</span>
              </button>
            </div>
          </div>

          {/* Core Pipeline Bar */}
          <div className="mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/70 backdrop-blur-xs p-4 rounded-xl border border-slate-800">
              <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" /> Step 1
              </div>
              <div className="text-base font-bold text-white">MULTI-SOURCE DATA</div>
              <div className="text-xs text-slate-400 mt-1">Radar, Soil, IoT Gauges, Vision Reports</div>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-xs p-4 rounded-xl border border-slate-800">
              <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" /> Step 2
              </div>
              <div className="text-base font-bold text-white">AI RISK ENGINE</div>
              <div className="text-xs text-slate-400 mt-1">XGBoost & SHAP Explainability</div>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-xs p-4 rounded-xl border border-slate-800">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5" /> Step 3
              </div>
              <div className="text-base font-bold text-white">HYPERLOCAL WARNING</div>
              <div className="text-xs text-slate-400 mt-1">Ward-level 1–3h Lead Time & Cause</div>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-xs p-4 rounded-xl border border-slate-800">
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Step 4
              </div>
              <div className="text-base font-bold text-white">PRESCRIBED ACTION</div>
              <div className="text-xs text-slate-400 mt-1">SOP Evacuation & Drain De-silting</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Problem Highlight: Rainfall Overload vs Drainage Blockage */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-sky-700 tracking-wider uppercase bg-sky-100 px-3 py-1 rounded-full">
            Core Scientific Breakthrough
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3 mb-3">
            Why Rainfall Alone Cannot Explain Every Flood Event
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            During the Indian monsoon, two identical rainfall readings produce completely different disaster outcomes. 
            JALRAKSHAK decouples the physics to give emergency authorities the exact intervention required.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card A: Rainfall Overload */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                <CloudRain className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Classification A</span>
                <h3 className="text-xl font-bold text-slate-900">Rainfall Overload</h3>
              </div>
            </div>

            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              Torrential downpour (&gt; 60 mm/hr) saturates the watershed catchment, completely overpowering natural river beds and standard municipal stormwater culvert design capacity.
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-700">
                <span className="font-medium">Precipitation Rate:</span>
                <span className="font-bold text-red-700">80 – 140 mm/h (Extreme)</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span className="font-medium">Drain Condition:</span>
                <span className="font-semibold text-slate-900">Operating Normally</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span className="font-medium">Direct Action Needed:</span>
                <span className="font-bold text-red-700">Relief Shelters, Downriver Evacuation, Road Closure</span>
              </div>
            </div>
          </div>

          {/* Card B: Drainage Blockage */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-amber-400/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Classification B (Unique Insight)</span>
                <h3 className="text-xl font-bold text-slate-900">Drainage Blockage</h3>
              </div>
            </div>

            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              Moderate precipitation (30–45 mm/hr) that the ward should easily handle causes severe knee-deep inundation due to silt, plastic waste choking inlet gratings, or structural collapse.
            </p>

            <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-700">
                <span className="font-medium">Precipitation Rate:</span>
                <span className="font-bold text-amber-800">30 – 45 mm/h (Moderate)</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span className="font-medium">Drain Condition:</span>
                <span className="font-bold text-red-700">&lt; 30% Efficiency (Choked)</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span className="font-medium">Direct Action Needed:</span>
                <span className="font-bold text-amber-900">Immediate Jetting Machine QRT, Silt Excavator, Traffic Divert</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-slate-100 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-indigo-700 tracking-wider uppercase bg-indigo-100 px-3 py-1 rounded-full">
              System Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3 mb-3">
              How JALRAKSHAK Operates
            </h2>
            <p className="text-slate-600 text-sm">
              End-to-end telemetry pipeline from sensor ingestion to citizen safety.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stage 1 */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">1. DATA INGESTION</h3>
              <ul className="text-xs text-slate-600 space-y-1.5 flex-1">
                <li>• Automatic Rain Gauges (ARG)</li>
                <li>• Soil Moisture TDR probes</li>
                <li>• Topographic DEM Slope & Elevation</li>
                <li>• Drainage Culvert Flow Velocity</li>
                <li>• Crowd Waterlogging Images</li>
                <li>• Historical Multi-year Disasters</li>
              </ul>
            </div>

            {/* Stage 2 */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mb-4">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">2. AI INFERENCE</h3>
              <ul className="text-xs text-slate-600 space-y-1.5 flex-1">
                <li>• <strong>XGBoost Model:</strong> Hyperlocal flood & landslide risk probability (0-100%)</li>
                <li>• <strong>YOLO Vision:</strong> Auto-detects blocked grates, water depth, submerged vehicles</li>
                <li>• <strong>SHAP TreeExplainer:</strong> Mathematical feature attribution per location</li>
              </ul>
            </div>

            {/* Stage 3 */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-4">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">3. INTELLIGENCE</h3>
              <ul className="text-xs text-slate-600 space-y-1.5 flex-1">
                <li>• <strong>Root Cause Analysis:</strong> Overload vs Drainage Choke</li>
                <li>• <strong>Lead Time:</strong> Expected risk window (1–3h advance)</li>
                <li>• <strong>Impact Overlays:</strong> Affected houses, shops, schools, hospitals, population</li>
                <li>• <strong>Dynamic Thresholds:</strong> Low, Moderate, High, Critical</li>
              </ul>
            </div>

            {/* Stage 4 */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-4">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">4. SOP RESPONSE</h3>
              <ul className="text-xs text-slate-600 space-y-1.5 flex-1">
                <li>• Automated Multi-Tier Early Warnings</li>
                <li>• Causeway & Road Closures</li>
                <li>• Drainage Jetting Crew Dispatches</li>
                <li>• Relief Shelter Activation</li>
                <li>• Cell Broadcast SMS Notifications</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={onOpenCommandCenter}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition cursor-pointer"
            >
              <span>Launch Live Disaster Command Center</span>
              <ArrowRight className="w-4 h-4 text-sky-400" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
