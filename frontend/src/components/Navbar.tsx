import React from 'react';
import {
  ShieldAlert,
  Activity,
  Layers,
  BrainCircuit,
  Bell,
  Camera,
  Flame,
  FileSpreadsheet,
  Cpu,
  RefreshCw,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
  activeScenario: string;
  onScenarioChange: (scenario: string) => void;
  activeAlertsCount: number;
  lastUpdated: string;
  onRefresh: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  isDemoMode,
  setIsDemoMode,
  activeScenario,
  onScenarioChange,
  activeAlertsCount,
  lastUpdated,
  onRefresh
}) => {
  const navItems = [
    { id: 'command-center', label: 'Command Center', icon: Activity },
    { id: 'risk-map', label: 'Risk Map', icon: Layers },
    { id: 'predictions', label: 'Predictions & SHAP', icon: BrainCircuit },
    { id: 'alerts', label: 'Early Warnings', icon: Bell, badge: activeAlertsCount },
    { id: 'citizen-reports', label: 'Citizen Reports', icon: Camera },
    { id: 'impact', label: 'Impact', icon: Flame },
    { id: 'response', label: 'Response & SOPs', icon: ShieldAlert },
    { id: 'analytics', label: 'Analytics & Timeline', icon: FileSpreadsheet },
    { id: 'sensors', label: 'IoT Sensors', icon: Cpu }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* Top utility bar */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-semibold tracking-wide uppercase">System Status: OPERATIONAL</span>
          </div>
          <span className="text-slate-500">|</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span>Hydrological Basin:</span>
            <span className="text-sky-300 font-semibold">Upper Ganga / Bhagirathi Valley Sector 4</span>
          </div>
          <span className="text-slate-500">|</span>
          <div className="text-slate-400">
            Telemetry Synced: <span className="text-slate-200 font-mono">{lastUpdated}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-1 sm:mt-0">
          {/* Demo Mode Toggle */}
          <div className="flex items-center bg-slate-800 rounded-md p-0.5 border border-slate-700">
            <button
              onClick={() => setIsDemoMode(false)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                !isDemoMode ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              ● LIVE DATA
            </button>
            <button
              onClick={() => setIsDemoMode(true)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                isDemoMode ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              ● DEMO DATA
            </button>
          </div>

          {/* Quick Scenario Selector */}
          <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            <span className="text-[11px] text-slate-400">Scenario:</span>
            <select
              value={activeScenario}
              onChange={(e) => onScenarioChange(e.target.value)}
              className="bg-transparent text-amber-300 text-[11px] font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="scenario_2_drainage_blockage" className="bg-slate-900 text-amber-300">
                ⚠️ Scenario 2: Blocked Drain (Moderate Rain)
              </option>
              <option value="scenario_1_heavy_rainfall" className="bg-slate-900 text-red-300">
                🌧️ Scenario 1: Rainfall Overload (Cloudburst)
              </option>
              <option value="baseline" className="bg-slate-900 text-slate-200">
                ☀️ Baseline: Routine Flow
              </option>
            </select>
          </div>

          <button
            onClick={onRefresh}
            title="Force Telemetry Sync"
            className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main navigation */}
      <div className="px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div
          onClick={() => setCurrentTab('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-linear-to-br from-sky-600 to-indigo-900 flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition">
            <ShieldAlert className="w-6 h-6 text-sky-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900 font-mono">JALRAKSHAK</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-sky-100 text-sky-800 rounded border border-sky-200">
                v1.0 EOC
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 tracking-tight">
              Hyperlocal Flood & Landslide Intelligence and Early Warning System
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px] font-bold animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User / Officer Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('alerts')}
            className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            title="Active Warning Notifications"
          >
            <Bell className="w-5 h-5" />
            {activeAlertsCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-600 ring-2 ring-white animate-ping" />
            )}
          </button>

          <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-left text-xs">
              <div className="font-bold text-slate-900">EOC Duty Officer</div>
              <div className="text-[10px] text-slate-500">SDMA Control Room #04</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tab scroll bar for smaller screens */}
      <div className="xl:hidden flex overflow-x-auto border-t border-slate-200 px-3 py-1.5 gap-1.5 bg-slate-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
                isActive ? 'bg-sky-600 text-white' : 'text-slate-600 bg-white border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="ml-1 px-1 bg-red-500 text-white rounded-full text-[9px] font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
