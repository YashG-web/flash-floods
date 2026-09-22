import React, { useState, useEffect } from 'react';
import { apiClient } from './api/client';
import type {
  LocationData,
  IoTSensor,
  CitizenReport,
  EarlyWarningAlert,
  HistoricalEvent,
  FlashFloodWarning,
  LiveEnvironmentalData,
  OfficialImdWarning,
  Hospital
} from './types';
import { Navbar } from './components/Navbar';
import { getHospitalsForState } from './data/demoHospitals';
import { LandingPage } from './components/LandingPage';
import { FlashFloodPage } from './components/FlashFloodPage';
import { StreetWaterloggingPage } from './components/StreetWaterloggingPage';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { AboutHelpPage } from './components/AboutHelpPage';
import { CommandCenter } from './components/CommandCenter';
import { DisasterMap } from './components/Map/DisasterMap';
import { AlertsAndResponse } from './components/AlertsAndResponse';
import { CitizenReportModal } from './components/CitizenReportModal';
import { ReportPage } from './components/ReportPage';
import { RefreshCw, Camera } from 'lucide-react';

const INITIAL_DEMO_WARNING_SCENARIO_2: FlashFloodWarning = {
  id: 'warn-ward-12-initial',
  status: 'CRITICAL',
  statusLabel: 'FLASH FLOOD WARNING',
  locationId: 'ward-12',
  locationName: 'Ward 12 (Station Road / Market)',
  roadName: 'Main Market Road',
  riskLevel: 'HIGH',
  estimatedWindow: 'NEXT 1–3 HOURS',
  reason: 'Moderate rainfall combined with blocked drainage is creating localized waterlogging',
  affectedAreas: [
    'Main Market Road',
    'Low-Lying Market Zone',
    'Station Road Culvert Ingress'
  ],
  actions: [
    'Avoid Main Market Road',
    'Move away from low-lying areas and ground level shops',
    'Allow municipal suction crews to inspect and clear culvert',
    'Follow local authority instructions (Call 112)'
  ],
  timeline: [
    { label: 'NOW', subtext: 'Surface runoff rate escalating', isTriggered: true },
    { label: 'Rainfall increasing', subtext: '42.0 mm/h inflow recorded', isTriggered: true },
    { label: 'Soil moisture rising', subtext: 'Ground saturation at 82%', isTriggered: true },
    { label: 'Drainage stress detected', subtext: 'Culvert efficiency down to 18% (Choked)', isTriggered: true },
    { label: '⚠️ HIGH FLOOD RISK', subtext: 'NEXT 1–3 HOURS', isTriggered: true }
  ],
  timestamp: '13:30:15 IST'
};

const INITIAL_DEMO_WARNING_SCENARIO_1: FlashFloodWarning = {
  id: 'warn-ward-04-heavy-rain',
  status: 'CRITICAL',
  statusLabel: 'FLASH FLOOD WARNING',
  locationId: 'ward-04',
  locationName: 'Ward 04 (Upper Valley / Riverside)',
  roadName: 'Valley Riverside Road',
  riskLevel: 'CRITICAL',
  estimatedWindow: 'NEXT 1–3 HOURS',
  reason: 'Heavy rainfall overload exceeding local drainage capacity',
  affectedAreas: [
    'Valley Riverside Road',
    'Lower Ghat Terraces',
    'Bridge Ingress Approach'
  ],
  actions: [
    'Avoid Valley Riverside Road and low-lying river ghats',
    'Move to designated highland emergency shelters',
    'Do not walk or drive through flowing water',
    'Follow instructions from municipal emergency personnel (Call 112)'
  ],
  timeline: [
    { label: 'NOW', subtext: 'Cloudburst precipitation at 110 mm/h', isTriggered: true },
    { label: 'Rainfall increasing', subtext: 'Runoff velocity surging', isTriggered: true },
    { label: 'Soil moisture rising', subtext: 'Pore pressure saturation at 96%', isTriggered: true },
    { label: 'Drainage stress detected', subtext: 'Channel capacity overwhelmed', isTriggered: true },
    { label: '⚠️ CRITICAL FLOOD RISK', subtext: 'NEXT 1–3 HOURS', isTriggered: true }
  ],
  timestamp: '13:30:15 IST'
};

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [activeScenario, setActiveScenario] = useState<string>('scenario_2_drainage_blockage');
  const [lastUpdated, setLastUpdated] = useState<string>('13:30:15 IST');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Live Environmental Data State
  const [liveEnvironment, setLiveEnvironment] = useState<LiveEnvironmentalData | null>(null);
  const [officialImdWarnings, setOfficialImdWarnings] = useState<OfficialImdWarning[]>([]);

  // Core Data States
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [riverNetworks, setRiverNetworks] = useState<any[]>([]);
  const [drainageLines, setDrainageLines] = useState<any[]>([]);
  const [sensors, setSensors] = useState<IoTSensor[]>([]);
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [infrastructure, setInfrastructure] = useState<any[]>([]);
  const [historicalEvents, setHistoricalEvents] = useState<HistoricalEvent[]>([]);
  const [alerts, setAlerts] = useState<EarlyWarningAlert[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>(() =>
    getHospitalsForState(true, 'scenario_2_drainage_blockage', [30.092, 78.269])
  );

  // Flash Flood Warning State (Component 1 & 2)
  const [activeFlashWarning, setActiveFlashWarning] = useState<FlashFloodWarning | null>(INITIAL_DEMO_WARNING_SCENARIO_2);

  // Layer Toggles
  const [activeLayers, setActiveLayers] = useState({
    floodRisk: true,
    landslideRisk: false,
    rainfall: false,
    soilMoisture: false,
    drainage: false,
    iotSensors: false,
    citizenReports: true,
    infrastructure: false,
    historicalEvents: false,
    hospitals: false
  });

  // Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async (targetMode?: 'LIVE' | 'DEMO', forceRefresh: boolean = false) => {
    const effectiveMode = targetMode !== undefined ? targetMode : (isDemoMode ? 'DEMO' : 'LIVE');
    setIsRefreshing(true);
    try {
      const [mapRes, alertsRes, sensorsRes, histRes, liveEnvRes, hospRes] = await Promise.all([
        apiClient.getRiskMap(effectiveMode.toLowerCase()),
        apiClient.getAlerts(effectiveMode.toLowerCase()),
        apiClient.getSensors(),
        apiClient.getHistoricalEvents(),
        effectiveMode === 'LIVE' ? apiClient.getLiveEnvironment(selectedLocation?.id || 'ward-12', forceRefresh) : Promise.resolve(null),
        apiClient.getHospitals(
          effectiveMode,
          activeScenario,
          selectedLocation ? [selectedLocation.coordinates[0], selectedLocation.coordinates[1]] : [30.092, 78.269]
        )
      ]);

      if (hospRes && hospRes.hospitals) {
        setHospitals(hospRes.hospitals);
      }

      if (mapRes && mapRes.locations) {
        setLocations(mapRes.locations);
        if (!selectedLocation) {
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
        if (alertsRes.official_imd_warnings) {
          setOfficialImdWarnings(alertsRes.official_imd_warnings);
        }
      }

      if (effectiveMode === 'LIVE') {
        if (liveEnvRes) {
          setLiveEnvironment(liveEnvRes);
        }
        // In LIVE mode: inspect if actual severe alerts are issued
        const criticalAlert = alertsRes?.alerts?.find(a => a.severity === 'CRITICAL' || a.severity === 'WARNING');
        if (criticalAlert) {
          setActiveFlashWarning({
            id: criticalAlert.alert_id,
            status: criticalAlert.severity as any,
            statusLabel: 'FLASH FLOOD WARNING',
            locationId: criticalAlert.location_id,
            locationName: criticalAlert.location_name,
            roadName: 'Main Valley Corridor',
            riskLevel: criticalAlert.severity as any,
            estimatedWindow: criticalAlert.expected_window,
            reason: criticalAlert.cause_explanation,
            affectedAreas: [criticalAlert.location_name, 'Low-lying riparian roads'],
            actions: criticalAlert.recommended_actions?.map(a => a.title) || ['Avoid low-lying roadways', 'Follow safety guidelines'],
            timeline: [
              { label: 'NOW', subtext: 'External telemetry active', isTriggered: true },
              { label: 'Inflow rate monitored', subtext: 'Real-time observation', isTriggered: true }
            ],
            timestamp: new Date().toLocaleTimeString('en-IN') + ' IST'
          });
        } else {
          setActiveFlashWarning(null);
        }
      } else {
        // DEMO mode: restore scenario warning
        if (activeScenario === 'scenario_2_drainage_blockage') {
          setActiveFlashWarning(INITIAL_DEMO_WARNING_SCENARIO_2);
        } else if (activeScenario === 'scenario_1_heavy_rainfall') {
          setActiveFlashWarning(INITIAL_DEMO_WARNING_SCENARIO_1);
        } else {
          setActiveFlashWarning(null);
        }
      }

      if (sensorsRes && sensorsRes.sensors) {
        setSensors(sensorsRes.sensors);
      }

      if (histRes && histRes.events) {
        setHistoricalEvents(histRes.events);
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
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleModeChange = async (newModeIsDemo: boolean) => {
    setIsDemoMode(newModeIsDemo);
    setIsRefreshing(true);
    try {
      await apiClient.setMode(newModeIsDemo ? 'DEMO' : 'LIVE');
      await fetchAllData(newModeIsDemo ? 'DEMO' : 'LIVE', true);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleScenarioChange = async (scenario: string) => {
    setActiveScenario(scenario);
    try {
      await apiClient.switchScenario(scenario);

      if (scenario === 'baseline') {
        setActiveFlashWarning(null);
      } else if (scenario === 'scenario_1_heavy_rainfall') {
        setActiveFlashWarning({
          id: 'warn-ward-04-heavy-rain',
          status: 'CRITICAL',
          statusLabel: 'FLASH FLOOD WARNING',
          locationId: 'ward-04',
          locationName: 'Ward 04 (Upper Valley / Riverside)',
          roadName: 'Valley Riverside Road',
          riskLevel: 'CRITICAL',
          estimatedWindow: 'NEXT 1–3 HOURS',
          reason: 'Heavy rainfall overload exceeding local drainage capacity',
          affectedAreas: [
            'Valley Riverside Road',
            'Lower Ghat Terraces',
            'Bridge Ingress Approach'
          ],
          actions: [
            'Avoid Valley Riverside Road and low-lying river ghats',
            'Move to designated highland emergency shelters',
            'Do not walk or drive through flowing water',
            'Follow instructions from municipal emergency personnel (Call 112)'
          ],
          timeline: [
            { label: 'NOW', subtext: 'Cloudburst precipitation at 110 mm/h', isTriggered: true },
            { label: 'Rainfall increasing', subtext: 'Runoff velocity surging', isTriggered: true },
            { label: 'Soil moisture rising', subtext: 'Pore pressure saturation at 96%', isTriggered: true },
            { label: 'Drainage stress detected', subtext: 'Channel capacity overwhelmed', isTriggered: true },
            { label: '⚠️ CRITICAL FLOOD RISK', subtext: 'NEXT 1–3 HOURS', isTriggered: true }
          ],
          timestamp: new Date().toLocaleTimeString('en-IN') + ' IST'
        });
      } else if (scenario === 'scenario_2_drainage_blockage') {
        setActiveFlashWarning({
          id: 'warn-ward-12-blocked',
          status: 'CRITICAL',
          statusLabel: 'FLASH FLOOD WARNING',
          locationId: 'ward-12',
          locationName: 'Ward 12 (Station Road / Market)',
          roadName: 'Main Market Road',
          riskLevel: 'HIGH',
          estimatedWindow: 'NEXT 1–3 HOURS',
          reason: 'Moderate rainfall combined with blocked drainage is creating localized waterlogging',
          affectedAreas: [
            'Main Market Road',
            'Low-Lying Market Zone',
            'Station Road Culvert Ingress'
          ],
          actions: [
            'Avoid Main Market Road',
            'Move away from low-lying areas and ground level shops',
            'Allow municipal suction crews to inspect and clear culvert',
            'Follow local authority instructions (Call 112)'
          ],
          timeline: [
            { label: 'NOW', subtext: 'Moderate rainfall at 42.0 mm/h', isTriggered: true },
            { label: 'Rainfall increasing', subtext: 'Surface water accumulating', isTriggered: true },
            { label: 'Soil moisture rising', subtext: 'Saturation at 81.5%', isTriggered: true },
            { label: 'Drainage stress detected', subtext: 'Station culvert choked (18% throughput)', isTriggered: true },
            { label: '⚠️ HIGH FLOOD RISK', subtext: 'NEXT 1–3 HOURS', isTriggered: true }
          ],
          timestamp: new Date().toLocaleTimeString('en-IN') + ' IST'
        });
      }

      fetchAllData();
    } catch (err) {
      console.error('Failed to switch scenario:', err);
    }
  };

  // Simulator Generated Warning handler (Section 10 & 12)
  const handleApplySimulatorWarning = (warning: FlashFloodWarning, updatedLoc: LocationData) => {
    setActiveFlashWarning(warning);
    setSelectedLocation(updatedLoc);
    setLocations(prev => prev.map(l => l.id === updatedLoc.id ? updatedLoc : l));
  };

  const handleResetSimulation = () => {
    handleScenarioChange('baseline');
  };

  const handleToggleLayer = (layerKey: string) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey as keyof typeof prev]
    }));
  };

  // Keep hospital distances and scenario states strictly synchronized with selected ward location
  useEffect(() => {
    const coords: [number, number] = selectedLocation
      ? [selectedLocation.coordinates[0], selectedLocation.coordinates[1]]
      : [30.092, 78.269];
    apiClient.getHospitals(isDemoMode ? 'DEMO' : 'LIVE', activeScenario, coords).then(res => {
      if (res && res.hospitals) {
        setHospitals(res.hospitals);
      }
    });
  }, [selectedLocation?.id, isDemoMode, activeScenario]);

  // Calculate active alerts count including flash warning
  const activeAlertsCount = (activeFlashWarning && activeFlashWarning.status !== 'NONE' ? 1 : 0) +
    alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'WARNING').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Streamlined Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isDemoMode={isDemoMode}
        setIsDemoMode={handleModeChange}
        activeScenario={activeScenario}
        onScenarioChange={handleScenarioChange}
        activeAlertsCount={activeAlertsCount}
        lastUpdated={lastUpdated}
        lastObservedTime={liveEnvironment?.observed_at}
        isRefreshing={isRefreshing}
        onRefresh={() => fetchAllData(undefined, true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-sky-600" />
            <div className="font-bold text-sm">Syncing Local Flood Risk & Sensor Network...</div>
          </div>
        ) : (
          <>
            {/* 1. HOME TAB */}
            {currentTab === 'home' && (
              <LandingPage
                locations={locations}
                selectedLocation={selectedLocation}
                activeFlashWarning={activeFlashWarning}
                lastUpdated={lastUpdated}
                isDemoMode={isDemoMode}
                liveEnvironment={liveEnvironment}
                onNavigateToFlashFlood={() => setCurrentTab('flash-flood')}
                onNavigateToStreetWaterlogging={() => setCurrentTab('street-waterlogging')}
                onNavigateToMap={() => setCurrentTab('flash-flood')}
                onNavigateToReport={() => setCurrentTab('report')}
              />
            )}

            {/* 2. FLASH FLOOD MONITORING TAB */}
            {currentTab === 'flash-flood' && (
              <FlashFloodPage
                locations={locations}
                selectedLocation={selectedLocation}
                onSelectLocation={setSelectedLocation}
                riverNetworks={riverNetworks}
                sensors={sensors}
                activeFlashWarning={activeFlashWarning}
                historicalEvents={historicalEvents}
                officialImdWarnings={officialImdWarnings}
                hospitals={hospitals}
                isDemoMode={isDemoMode}
                onNavigateToReport={() => setCurrentTab('report')}
                onNavigateToSimulator={() => setCurrentTab('simulator')}
              />
            )}

            {/* 3. STREET WATERLOGGING TAB */}
            {currentTab === 'street-waterlogging' && (
              <StreetWaterloggingPage
                locations={locations}
                selectedLocation={selectedLocation}
                onSelectLocation={setSelectedLocation}
                drainageLines={drainageLines}
                sensors={sensors}
                citizenReports={citizenReports}
                isDemoMode={isDemoMode}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                onNavigateToSimulator={() => setCurrentTab('simulator')}
              />
            )}

            {/* 4. REPORT PAGE TAB */}
            {currentTab === 'report' && (
              <ReportPage
                locations={locations}
                selectedLocation={selectedLocation}
                onReportSubmitted={fetchAllData}
                onNavigateToMap={() => setCurrentTab('flash-flood')}
                onNavigateHome={() => setCurrentTab('home')}
              />
            )}

            {/* 5. SIMULATOR TAB */}
            {currentTab === 'simulator' && (
              <ScenarioSimulator
                locations={locations}
                onApplyWarning={handleApplySimulatorWarning}
                onResetSimulation={handleResetSimulation}
                onNavigateToMap={() => setCurrentTab('flash-flood')}
                onNavigateToFlashFlood={() => setCurrentTab('flash-flood')}
                onNavigateToStreetWaterlogging={() => setCurrentTab('street-waterlogging')}
              />
            )}

            {/* 7. ABOUT / HELP TAB */}
            {currentTab === 'about' && (
              <AboutHelpPage
                onNavigateToFlashFlood={() => setCurrentTab('flash-flood')}
                onNavigateToStreetWaterlogging={() => setCurrentTab('street-waterlogging')}
                onNavigateToReport={() => setCurrentTab('report')}
              />
            )}

            {/* 8. RESPONSE CENTER (AUTHORITY TAB: Operations Center + EOC) */}
            {currentTab === 'response-center' && (
              <CommandCenter
                locations={locations}
                selectedLocation={selectedLocation || locations[0]}
                onSelectLocation={setSelectedLocation}
                riverNetworks={riverNetworks}
                drainageLines={drainageLines}
                sensors={sensors}
                citizenReports={citizenReports}
                infrastructure={infrastructure}
                historicalEvents={historicalEvents}
                alerts={alerts}
                activeFlashWarning={activeFlashWarning}
                onApplyWarning={handleApplySimulatorWarning}
                onResetSimulation={handleResetSimulation}
                activeLayers={activeLayers}
                onToggleLayer={handleToggleLayer}
                onNavigateTab={setCurrentTab}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                hospitals={hospitals}
                isDemoMode={isDemoMode}
                activeScenario={activeScenario}
              />
            )}
          </>
        )}
      </main>

      {/* Citizen Waterlogging Report Modal */}
      <CitizenReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        locations={locations}
        onReportSubmitted={fetchAllData}
      />

      {/* Professional Disaster Management Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-4 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="font-black text-white font-mono text-sm tracking-wide">JALRAKSHAK</span>
            <span>—</span>
            <span>Know the risk. Act early.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span>Emergency Helpline: <b className="text-white font-mono">112</b></span>
            <span>•</span>
            <span>Municipal Disaster Management Cell</span>
            <span>•</span>
            <button
              onClick={() => setCurrentTab('response-center')}
              className="text-sky-400 hover:underline font-semibold cursor-pointer"
            >
              Authority Center (EOC / Simulator)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
