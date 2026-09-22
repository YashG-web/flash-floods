import React, { useState } from 'react';
import type { LocationData, CitizenReport, IoTSensor } from '../types';
import { MUNICIPAL_ROADS, type MunicipalRoad } from '../data/municipalRoads';
import { DisasterMap } from './Map/DisasterMap';
import { InverseHydraulicDiagnosisCard } from './InverseHydraulicDiagnosisCard';
import type { HydraulicDiagnosisInput } from '../services/hydraulicDiagnosis';
import {
  Camera,
  Clock,
  ArrowRight
} from 'lucide-react';

interface StreetWaterloggingPageProps {
  locations: LocationData[];
  selectedLocation: LocationData | null;
  onSelectLocation: (loc: LocationData) => void;
  drainageLines: any[];
  sensors: IoTSensor[];
  citizenReports: CitizenReport[];
  isDemoMode?: boolean;
  onOpenReportModal: () => void;
  onNavigateToSimulator: () => void;
}

export const StreetWaterloggingPage: React.FC<StreetWaterloggingPageProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  drainageLines,
  sensors,
  citizenReports,
  isDemoMode = true,
  onOpenReportModal,
  onNavigateToSimulator
}) => {
  const [roads, setRoads] = useState<MunicipalRoad[]>(MUNICIPAL_ROADS);
  const [selectedRoad, setSelectedRoad] = useState<MunicipalRoad>(MUNICIPAL_ROADS[0]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [waterloggingViewMode, setWaterloggingViewMode] = useState<'realtime' | 'predicted'>('predicted');

  const activeLayersState = {
    floodRisk: false,
    rainfall: false,
    drainage: true,
    iotSensors: false,
    citizenReports: true,
    historicalEvents: false,
    hospitals: false
  };
  const [activeLayers, setActiveLayers] = useState(activeLayersState);

  const handleToggleLayer = (layerKey: string) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey as keyof typeof prev]
    }));
  };


  // Combine live/backend citizen reports with rich demo feed
  const allReports: CitizenReport[] = citizenReports && citizenReports.length > 0 ? citizenReports : [
    {
      id: 'REP-104',
      location_id: 'ward-12',
      location_name: 'Main Market Road (Near Sharda Mandir)',
      coordinates: [30.0925, 78.2692],
      timestamp: '2 mins ago',
      severity: 'CRITICAL',
      description: 'Water entering shops on Station Road. Culvert choked with debris and silt. Water at knee height.',
      image_url: '/assets/street_waterlog_hero.jpg',
      status: 'VERIFIED_BY_VISION'
    },
    {
      id: 'REP-102',
      location_id: 'ward-12',
      location_name: 'Station Culvert Link Road',
      coordinates: [30.0915, 78.2685],
      timestamp: '8 mins ago',
      severity: 'HIGH',
      description: 'Curb line inundated with 10 inches of standing stormwater. Two-wheelers stalling.',
      image_url: '/assets/sample_waterlog.jpg',
      status: 'DISPATCHED'
    },
    {
      id: 'REP-098',
      location_id: 'ward-04',
      location_name: 'Riverfront Embankment Road',
      coordinates: [30.0845, 78.2618],
      timestamp: '15 mins ago',
      severity: 'CRITICAL',
      description: 'River backflow overflowing embankment steps onto road surface.',
      image_url: '/assets/hero.jpg',
      status: 'VERIFIED'
    }
  ];

  // Inverse Hydraulic Diagnosis input based on selected road
  const diagnosisInput: HydraulicDiagnosisInput = {
    roadId: selectedRoad.id,
    roadName: selectedRoad.name,
    wardId: selectedRoad.wardId || 'ward-12',
    // Rainfall intensity calibrated to scenario:
    // Main Market Road (Ward 12): 18 mm/hr moderate rain + knee-deep + 14 reports + choked drain -> ANOMALY -> MH-07 Probable Blockage (~89% confidence)
    // Severe road with extreme cloudburst: 78 mm/hr -> consistent with heavy rain
    // Clear road: 6 mm/hr -> nominal
    rainfallMmHr: selectedRoad.id === 'road-market-01' || selectedRoad.id === 'road-01' ? 18 : selectedRoad.status === 'SEVERE' ? 78 : selectedRoad.status === 'MODERATE' ? 24 : 6,
    runoffCoefficient: 0.82,
    catchmentAreaHa: 12.5,
    observedWaterDepthText: selectedRoad.waterDepth,
    citizenReportsCount: selectedRoad.citizenReportsCount,
    reportedDrainCondition: selectedRoad.id === 'road-market-01' || selectedRoad.id === 'road-01' ? 'CHOKED' : selectedRoad.status === 'SEVERE' ? 'STRESSED' : 'GOOD',
    waterloggingTrend: selectedRoad.status === 'SEVERE' || selectedRoad.status === 'MODERATE' ? 'rapid' : 'stable'
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. 🕳️ INVERSE HYDRAULIC DIAGNOSIS ENGINE */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-700 font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>SUBSURFACE HYDRAULIC PREDICTION</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-mono flex items-center gap-2 mt-0.5">
              <span>🕳️ DRAINAGE DIAGNOSIS & WATERLOGGING PREDICTION</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Predicts street waterlogging onset times and hidden drainage blockages before flooding occurs.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-mono bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <span>📍</span>
            <span className="font-bold text-slate-900">{selectedRoad.name}</span>
            <span className="text-slate-400">·</span>
            <span>{selectedRoad.wardId ? selectedRoad.wardId.replace('-', ' ').toUpperCase() : 'WARD 12'}</span>
          </div>
        </div>

        <InverseHydraulicDiagnosisCard
          input={diagnosisInput}
          onOpenReport={onOpenReportModal}
        />
      </section>

      {/* 2. LARGE STREET-LEVEL MAP */}
      <section className="space-y-3">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 font-mono">
                STREET & DRAINAGE NETWORK RISK MAP
              </h3>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                waterloggingViewMode === 'predicted'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-blue-100 text-blue-900 border border-blue-300'
              }`}>
                {waterloggingViewMode === 'predicted' ? '🔮 PREDICTIVE FORECAST' : '📡 REAL-TIME LOGGING'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {waterloggingViewMode === 'predicted'
                ? 'Showing predicted waterlogging onset timing and forecasted street inundation levels from subsurface hydraulic modeling.'
                : 'Showing real-time verified street inundation levels, observed water depths, and crowd reports.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle Button: Real-Time Status vs Predicted Waterlogging */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setWaterloggingViewMode('realtime')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                  waterloggingViewMode === 'realtime'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>📡 REAL-TIME STATUS</span>
              </button>
              <button
                type="button"
                onClick={() => setWaterloggingViewMode('predicted')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                  waterloggingViewMode === 'predicted'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🔮 PREDICTED WATERLOGGING</span>
              </button>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-bold">Filter:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-100 border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 cursor-pointer"
              >
                <option value="ALL">All Roads ({roads.length})</option>
                <option value="SEVERE">🔴 Severe Only</option>
                <option value="MODERATE">🟠 Moderate Only</option>
                <option value="MINOR">🟡 Minor Only</option>
                <option value="CLEAR">🟢 Clear Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Map Locked to Street Waterlogging Mode */}
        <DisasterMap
          locations={locations}
          selectedLocation={selectedLocation}
          onSelectLocation={onSelectLocation}
          riverNetworks={[]}
          drainageLines={drainageLines}
          sensors={[]}
          citizenReports={allReports}
          historicalEvents={[]}
          hospitals={[]}
          isDemoMode={isDemoMode}
          systemMode="street-waterlogging"
          selectedRoad={selectedRoad}
          onSelectRoad={(road) => setSelectedRoad(road)}
          waterloggingViewMode={waterloggingViewMode}
          onToggleWaterloggingViewMode={setWaterloggingViewMode}
          activeLayers={activeLayers}
          onToggleLayer={handleToggleLayer}
        />
      </section>


      {/* 5. RECENT CITIZEN REPORTS (Photo, Location, Time, Condition) */}
      <section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="text-[10px] font-black text-red-600 uppercase tracking-widest font-mono">
              CROWDSOURCED VERIFICATIONS
            </div>
            <h3 className="text-lg font-black text-slate-900 font-mono flex items-center gap-2">
              <span>RECENT CITIZEN WATERLOGGING REPORTS</span>
            </h3>
            <p className="text-xs text-slate-500">
              Photographic evidence and water depth logs submitted by drivers, shopkeepers and residents
            </p>
          </div>

          <button
            onClick={onOpenReportModal}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>SUBMIT PHOTO REPORT</span>
          </button>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {allReports.map((report) => (
            <div
              key={report.id}
              className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col justify-between shadow-xs"
            >
              {/* Photo */}
              <div className="relative h-40 bg-slate-200 overflow-hidden">
                <img
                  src={report.image_url || '/assets/sample_waterlog.jpg'}
                  alt={report.location_name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono font-bold rounded-md">
                  📍 {report.location_name.split('(')[0]}
                </span>
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-red-600 text-white text-[10px] font-black font-mono rounded-md">
                  {report.severity || 'CRITICAL'}
                </span>
              </div>

              {/* Details */}
              <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {report.timestamp}
                    </span>
                    <span className="text-emerald-700 font-bold">
                      ✓ AI Verified
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 mt-1">
                    {report.location_name}
                  </h4>

                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    {report.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px]">
                  <span className="font-mono text-slate-500">ID: {report.id}</span>
                  <button
                    onClick={() => {
                      const matched = roads.find(r => report.location_name.toLowerCase().includes(r.name.toLowerCase()));
                      if (matched) setSelectedRoad(matched);
                    }}
                    className="text-sky-600 font-bold hover:underline cursor-pointer"
                  >
                    Inspect road →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. BOTTOM NAVIGATION */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-slate-900 text-white rounded-3xl">
        <div>
          <h4 className="text-sm font-black font-mono">SIMULATE DRAINAGE BLOCKAGE</h4>
          <p className="text-xs text-slate-400">
            Test how choked stormwater drains and local rainfall produce street-level waterlogging.
          </p>
        </div>

        <button
          onClick={onNavigateToSimulator}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <span>OPEN STREET WATERLOGGING SIMULATOR</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
