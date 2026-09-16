import React, { useState, useEffect } from 'react';
import { apiClient } from './api/client';
import type { LocationData, IoTSensor, CitizenReport, EarlyWarningAlert, HistoricalEvent } from './types';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { CommandCenter } from './components/CommandCenter';
import { DisasterMap } from './components/Map/DisasterMap';
import { PredictionEngineWorkbench } from './components/PredictionEngine';
import { AlertsAndResponse } from './components/AlertsAndResponse';
import { CitizenReportModal } from './components/CitizenReportModal';
import { CitizenReportFeed } from './components/CitizenReportFeed';
import { ImpactAssessmentView } from './components/ImpactAssessment';
import { LiveSensorDashboard } from './components/LiveSensorDashboard';
import { HistoricalAnalyticsView } from './components/HistoricalAnalytics';
import { RefreshCw, AlertCircle } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [activeScenario, setActiveScenario] = useState<string>('scenario_2_drainage_blockage');
  const [lastUpdated, setLastUpdated] = useState<string>('13:30:15 IST');

  // Core Data States
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [riverNetworks, setRiverNetworks] = useState<any[]>([]);
  const [drainageLines, setDrainageLines] = useState<any[]>([]);
  const [sensors, setSensors] = useState<IoTSensor[]>([]);
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [infrastructure, setInfrastructure] = useState<any[]>([]);
  const [historicalEvents, setHistoricalEvents] = useState<HistoricalEvent[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [seasonalData, setSeasonalData] = useState<any[]>([]);
  const [timelineStages, setTimelineStages] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<EarlyWarningAlert[]>([]);

  // Layer Toggles
  const [activeLayers, setActiveLayers] = useState({
    floodRisk: true,
    landslideRisk: true,
    rainfall: true,
    soilMoisture: true,
    drainage: true,
    iotSensors: true,
    citizenReports: true,
    infrastructure: true,
    historicalEvents: true
  });

  // Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      const [mapRes, alertsRes, sensorsRes, histRes, analyticsRes, timelineRes] = await Promise.all([
        apiClient.getRiskMap(),
        apiClient.getAlerts(),
        apiClient.getSensors(),
        apiClient.getHistoricalEvents(),
        apiClient.getHistoricalAnalytics(),
        apiClient.getRiskTimeline()
      ]);

      if (mapRes && mapRes.locations) {
        setLocations(mapRes.locations);
        if (!selectedLocation) {
          // Default selection to Ward 12 (Station Road) to demonstrate the unique drainage choke problem
          const ward12 = mapRes.locations.find(l => l.id === 'ward-12') || mapRes.locations[0];
          setSelectedLocation(ward12);
        } else {
          const updatedSelected = mapRes.locations.find(l => l.id === selectedLocation.id);
          if (updatedSelected) setSelectedLocation(updatedSelected);
        }
        setRiverNetworks(mapRes.river_networks || []);
        setDrainageLines(mapRes.drainage_lines || []);
        setInfrastructure(mapRes.critical_infrastructure || []);
      }

      if (alertsRes && alertsRes.alerts) {
        setAlerts(alertsRes.alerts);
      }

      if (sensorsRes && sensorsRes.sensors) {
        setSensors(sensorsRes.sensors);
      }

      if (histRes && histRes.events) {
        setHistoricalEvents(histRes.events);
      }

      if (analyticsRes) {
        setTimeSeriesData(analyticsRes.rainfall_time_series || []);
        setSeasonalData(analyticsRes.seasonal_alerts_distribution || []);
      }

      if (timelineRes && timelineRes.stages) {
        setTimelineStages(timelineRes.stages);
      }

      if (mapRes && mapRes.citizen_reports) {
        setCitizenReports(mapRes.citizen_reports);
      }

      const now = new Date();
      setLastUpdated(now.toLocaleTimeString('en-IN') + ' IST');
    } catch (err) {
      console.error('Error fetching disaster intelligence data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleScenarioChange = async (scenario: string) => {
    setActiveScenario(scenario);
    try {
      await apiClient.switchScenario(scenario);
      fetchAllData();
    } catch (err) {
      console.error('Failed to switch scenario:', err);
    }
  };

  const handleToggleLayer = (layerKey: string) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey as keyof typeof prev]
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isDemoMode={isDemoMode}
        setIsDemoMode={setIsDemoMode}
        activeScenario={activeScenario}
        onScenarioChange={handleScenarioChange}
        activeAlertsCount={alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'WARNING').length}
        lastUpdated={lastUpdated}
        onRefresh={fetchAllData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-sky-600" />
            <div className="font-bold text-sm">Ingesting Multi-Source Hydrological Telemetry...</div>
          </div>
        ) : (
          <>
            {currentTab === 'landing' && (
              <LandingPage
                onOpenCommandCenter={() => setCurrentTab('command-center')}
                onExploreHowItWorks={() => {
                  const el = document.getElementById('how-it-works');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            )}

            {currentTab === 'command-center' && selectedLocation && (
              <CommandCenter
                locations={locations}
                selectedLocation={selectedLocation}
                onSelectLocation={setSelectedLocation}
                riverNetworks={riverNetworks}
                drainageLines={drainageLines}
                sensors={sensors}
                citizenReports={citizenReports}
                infrastructure={infrastructure}
                historicalEvents={historicalEvents}
                alerts={alerts}
                activeLayers={activeLayers}
                onToggleLayer={handleToggleLayer}
                onNavigateTab={setCurrentTab}
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />
            )}

            {currentTab === 'risk-map' && selectedLocation && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
                      Interactive Disaster GIS Overview
                    </h2>
                    <p className="text-xs text-slate-500">
                      Full multi-layer GIS view including Wards, Rivers, Drainage lines, IoT Telemetry, and Citizen Alerts.
                    </p>
                  </div>
                  <div className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-lg border border-sky-200">
                    Active Target: {selectedLocation.name}
                  </div>
                </div>

                <DisasterMap
                  locations={locations}
                  selectedLocation={selectedLocation}
                  onSelectLocation={setSelectedLocation}
                  riverNetworks={riverNetworks}
                  drainageLines={drainageLines}
                  sensors={sensors}
                  citizenReports={citizenReports}
                  infrastructure={infrastructure}
                  historicalEvents={historicalEvents}
                  activeLayers={activeLayers}
                  onToggleLayer={handleToggleLayer}
                />
              </div>
            )}

            {currentTab === 'predictions' && (
              <PredictionEngineWorkbench />
            )}

            {currentTab === 'alerts' && (
              <AlertsAndResponse alerts={alerts} />
            )}

            {currentTab === 'citizen-reports' && (
              <CitizenReportFeed
                reports={citizenReports}
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />
            )}

            {currentTab === 'impact' && selectedLocation && (
              <ImpactAssessmentView location={selectedLocation} />
            )}

            {currentTab === 'response' && (
              <AlertsAndResponse alerts={alerts} />
            )}

            {currentTab === 'analytics' && (
              <HistoricalAnalyticsView
                events={historicalEvents}
                timeSeriesData={timeSeriesData}
                seasonalData={seasonalData}
                timelineStages={timelineStages}
              />
            )}

            {currentTab === 'sensors' && (
              <LiveSensorDashboard
                sensors={sensors}
                dataOrigin={isDemoMode ? 'DEMO / SIMULATED SENSOR TELEMETRY' : 'LIVE IOT GATEWAY'}
                onRefresh={fetchAllData}
              />
            )}
          </>
        )}
      </main>

      {/* Citizen Report Modal */}
      <CitizenReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        locations={locations}
        onReportSubmitted={fetchAllData}
      />

      {/* Government Standard Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-4 border-t border-slate-800 text-xs text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-mono">JALRAKSHAK</span>
            <span>—</span>
            <span>Emergency Operations Center Decision Support Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Model Integration: <b className="text-slate-200">Placeholder Interface Active</b></span>
            <span>•</span>
            <span>Plug-and-play: <b className="text-sky-400">models/flood_model</b> & <b className="text-sky-400">models/yolo_model</b></span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
