import React, { useState } from 'react';
import {
  ShieldAlert,
  Home,
  Map,
  Camera,
  Bell,
  Radio,
  RefreshCw,
  Menu,
  X
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
  lastObservedTime?: string;
  isRefreshing?: boolean;
  onRefresh: () => void;
  onOpenReportModal: () => void;
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
  lastObservedTime,
  isRefreshing = false,
  onRefresh,
  onOpenReportModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navTabs = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'risk-map', label: 'RISK MAP', icon: Map },
    { id: 'report', label: 'REPORT FLOODING', icon: Camera, isReport: true },
    { id: 'alerts', label: 'ALERTS', icon: Bell, badge: activeAlertsCount }
  ];

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Utility Status Bar */}
      <div className={`px-4 py-1.5 flex flex-wrap items-center justify-between text-xs font-medium transition-colors ${
        !isDemoMode ? 'bg-slate-950 text-slate-200 border-b border-emerald-950/40' : 'bg-slate-900 text-slate-300'
      }`}>
        <div className="flex items-center gap-3">
          {!isDemoMode ? (
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-xs shadow-emerald-400/50" />
              <span className="text-emerald-400 font-black uppercase tracking-wider text-[11px] font-mono">
                ● LIVE DATA ACTIVE
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-300 text-[11px] hidden md:inline">
                Source: <b className="text-white">IMD CAP</b> + <b className="text-white">Open-Meteo</b>
              </span>
              <span className="text-slate-600 hidden md:inline">•</span>
              <span className="text-slate-400 text-[11px] hidden sm:inline">
                Observed: <span className="text-emerald-300 font-mono font-bold">{lastObservedTime || lastUpdated}</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-amber-400 font-black uppercase tracking-wider text-[11px] font-mono">
                ⚙ DEMO / SIMULATION MODE
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-400 text-[11px] hidden sm:inline">
                Controlled parameters • Not live data
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Mode Switcher Toggle */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700 shadow-xs">
            <button
              onClick={() => setIsDemoMode(false)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                !isDemoMode
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to Real External Weather & Government Observations"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${!isDemoMode ? 'bg-white animate-pulse' : 'bg-slate-500'}`} />
              <span>LIVE DATA</span>
            </button>
            <button
              onClick={() => setIsDemoMode(true)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                isDemoMode
                  ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Switch to Demonstration Scenario Testing Mode"
            >
              <span>⚙</span>
              <span>DEMO DATA</span>
            </button>
          </div>

          {/* Quick Scenario Selector (Visible in Demo Mode) */}
          {isDemoMode && (
            <div className="hidden md:flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-md border border-slate-700 text-[11px]">
              <span className="text-amber-400 font-bold">Scenario:</span>
              <select
                value={activeScenario}
                onChange={(e) => onScenarioChange(e.target.value)}
                className="bg-transparent text-amber-200 font-semibold focus:outline-hidden cursor-pointer text-[11px]"
              >
                <option value="scenario_2_drainage_blockage" className="bg-slate-900 text-amber-300">
                  ⚠️ Blocked Drain + Rain (Ward 12)
                </option>
                <option value="scenario_1_heavy_rainfall" className="bg-slate-900 text-red-300">
                  🌧️ Heavy Rain / Cloudburst (Ward 04)
                </option>
                <option value="baseline" className="bg-slate-900 text-slate-200">
                  ☀️ Nominal Baseline (Clear)
                </option>
              </select>
            </div>
          )}

          {!isDemoMode && (
            <div className="hidden lg:flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded text-[10px] text-emerald-300 font-mono">
              <span>Region:</span>
              <span className="font-bold text-white">Uttarakhand (Rishikesh Basin)</span>
            </div>
          )}

          <button
            onClick={onRefresh}
            title="Refresh external data sources"
            disabled={isRefreshing}
            className={`p-1.5 hover:bg-slate-800 rounded-md text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
              isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden xl:inline">{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div
          onClick={() => setCurrentTab('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-700 to-sky-600 flex items-center justify-center text-white shadow-md group-hover:shadow-indigo-500/25 transition">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none font-mono">
              JALRAKSHAK
            </h1>
            <p className="text-xs font-bold text-sky-700 tracking-normal mt-0.5">
              “Know the risk. Act early.”
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs: 4 Core Citizen Tabs */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
          {navTabs.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                  item.isReport
                    ? isActive
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'bg-red-600 text-white hover:bg-red-700 shadow-xs'
                    : isActive
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.isReport ? 'text-white' : isActive ? 'text-sky-600' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[10px] font-black animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Dedicated Authority Tab */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('response-center')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              currentTab === 'response-center'
                ? 'bg-slate-900 text-sky-300 border-slate-900 shadow-xs'
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 hover:text-slate-900'
            }`}
            title="Municipal Workers & Emergency Responders Command Center"
          >
            <Radio className={`w-4 h-4 ${currentTab === 'response-center' ? 'text-sky-400' : 'text-slate-500'}`} />
            <span>RESPONSE CENTER</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-slate-800 text-amber-300 rounded font-bold">
              Authority
            </span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>REPORT</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-lg">
          {navTabs.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                  item.isReport
                    ? 'bg-red-600 text-white'
                    : isActive
                    ? 'bg-slate-100 text-sky-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 bg-red-600 text-white rounded-full text-xs font-black">
                    {item.badge} ACTIVE
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setCurrentTab('response-center');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold cursor-pointer ${
                currentTab === 'response-center'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-sky-400" />
                <span>RESPONSE CENTER (AUTHORITY)</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-amber-300 rounded font-bold">
                EOC
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
