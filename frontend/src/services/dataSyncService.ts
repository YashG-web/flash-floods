import type {
  LocationData,
  FlashFloodWarning,
  CitizenReport,
  EarlyWarningAlert,
  RiskLevel
} from '../types';
import { staticData } from '../data/staticData';

const SYNC_CHANNEL_NAME = 'jalrakshak_realtime_sync_v2';
const STORAGE_KEY = 'jalrakshak_sync_state_v2';

export interface DataSyncState {
  version: number;
  lastUpdated: string;
  isDemoMode: boolean;
  activeScenario: string;
  selectedVillageId: string;
  selectedWardId: string;
  selectedRoadId: string;
  waterloggingViewMode: 'realtime' | 'predicted';
  activeFlashWarning: FlashFloodWarning | null;
  locations: LocationData[];
  citizenReports: CitizenReport[];
  alerts: EarlyWarningAlert[];
}

export type SyncActionType =
  | 'SET_FULL_STATE'
  | 'SET_VILLAGE'
  | 'SET_WARD'
  | 'SET_ROAD'
  | 'SET_SCENARIO'
  | 'SET_MODE'
  | 'UPDATE_LOCATION'
  | 'UPDATE_FLASH_WARNING'
  | 'ADD_CITIZEN_REPORT'
  | 'SET_WATERLOGGING_VIEW'
  | 'APPLY_SIMULATION'
  | 'RESET_SIMULATION';

export interface SyncMessage {
  type: SyncActionType;
  payload: any;
  timestamp: number;
  sourceTabId: string;
}

const TAB_ID = Math.random().toString(36).substring(2, 10);

class DataSyncService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(state: DataSyncState) => void> = new Set();
  private currentState: DataSyncState;

  constructor() {
    this.currentState = this.loadInitialState();
    this.initBroadcastChannel();
    this.initStorageListener();
  }

  private loadInitialState(): DataSyncState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.locations) && parsed.locations.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }

    const defaultWarning: FlashFloodWarning = {
      id: 'warn-village-sangam-initial',
      status: 'CRITICAL',
      statusLabel: 'FLASH FLOOD WARNING',
      locationId: 'village-sangam',
      locationName: 'Village Sangam (Tributary Confluence)',
      roadName: 'Valley Riparian Corridor',
      riskLevel: 'CRITICAL',
      estimatedWindow: 'NEXT 1–2 HOURS',
      reason: 'Extreme upstream catchment precipitation and rapid tributary surge',
      affectedAreas: [
        'Village Sangam (Lower Terraces)',
        'Tributary Sluice Corridor',
        'Ghat Approach Terraces'
      ],
      actions: [
        'Immediate evacuation of low-lying village riverbank dwellings',
        'Move cattle and family members to upper ridge relief shelters',
        'Do not cross pedestrian rope bridges over rising torrents',
        'Tune into local Gram Panchayat emergency wireless alerts (Call 112)'
      ],
      timeline: [
        { label: 'NOW', subtext: 'Tributary water level surged by +1.4m', isTriggered: true },
        { label: 'Upstream surge', subtext: '68 mm/h catchment rainfall recorded', isTriggered: true },
        { label: 'Soil saturated', subtext: 'Pore pressure at 74% capacity', isTriggered: true },
        { label: '⚠️ FLASH FLOOD ALERT', subtext: 'NEXT 1–2 HOURS', isTriggered: true }
      ],
      timestamp: new Date().toLocaleTimeString('en-IN') + ' IST'
    };

    return {
      version: 1,
      lastUpdated: new Date().toLocaleTimeString('en-IN') + ' IST',
      isDemoMode: true,
      activeScenario: 'scenario_2_drainage_blockage',
      selectedVillageId: 'village-sangam',
      selectedWardId: 'ward-12',
      selectedRoadId: 'ROAD-01',
      waterloggingViewMode: 'predicted',
      activeFlashWarning: defaultWarning,
      locations: staticData.locations || [],
      citizenReports: staticData.citizen_reports || [],
      alerts: staticData.alerts || []
    };
  }

  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
          if (!event.data || event.data.sourceTabId === TAB_ID) return;
          this.handleIncomingSync(event.data);
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization failed, falling back to localStorage events', err);
      }
    }
  }

  private initStorageListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && e.newValue) {
          try {
            const newState = JSON.parse(e.newValue);
            this.currentState = newState;
            this.notifyListeners();
          } catch {
            // Ignore parse errors
          }
        }
      });
    }
  }

  private handleIncomingSync(msg: SyncMessage) {
    switch (msg.type) {
      case 'SET_FULL_STATE':
        this.currentState = msg.payload;
        break;
      case 'SET_VILLAGE':
        this.currentState = {
          ...this.currentState,
          selectedVillageId: msg.payload,
          lastUpdated: new Date().toLocaleTimeString('en-IN') + ' IST'
        };
        break;
      case 'SET_WARD':
        this.currentState = {
          ...this.currentState,
          selectedWardId: msg.payload,
          lastUpdated: new Date().toLocaleTimeString('en-IN') + ' IST'
        };
        break;
      case 'SET_ROAD':
        this.currentState = {
          ...this.currentState,
          selectedRoadId: msg.payload
        };
        break;
      case 'SET_SCENARIO':
        this.currentState = {
          ...this.currentState,
          activeScenario: msg.payload.scenario,
          activeFlashWarning: msg.payload.warning !== undefined ? msg.payload.warning : this.currentState.activeFlashWarning,
          lastUpdated: new Date().toLocaleTimeString('en-IN') + ' IST'
        };
        break;
      case 'SET_MODE':
        this.currentState = {
          ...this.currentState,
          isDemoMode: msg.payload,
          lastUpdated: new Date().toLocaleTimeString('en-IN') + ' IST'
        };
        break;
      case 'UPDATE_LOCATION':
        this.currentState = {
          ...this.currentState,
          locations: this.currentState.locations.map(loc =>
            loc.id === msg.payload.id ? { ...loc, ...msg.payload } : loc
          ),
          lastUpdated: new Date().toLocaleTimeString('en-IN') + ' IST'
        };
        break;
      case 'UPDATE_FLASH_WARNING':
        this.currentState = {
          ...this.currentState,
          activeFlashWarning: msg.payload,
          lastUpdated: new Date().toLocaleTimeString('en-IN') + ' IST'
        };
        break;
      case 'ADD_CITIZEN_REPORT':
        this.currentState = {
          ...this.currentState,
          citizenReports: [msg.payload, ...this.currentState.citizenReports],
          lastUpdated: new Date().toLocaleTimeString('en-IN') + ' IST'
        };
        break;
      case 'SET_WATERLOGGING_VIEW':
        this.currentState = {
          ...this.currentState,
          waterloggingViewMode: msg.payload
        };
        break;
      case 'APPLY_SIMULATION':
        this.currentState = {
          ...this.currentState,
          activeFlashWarning: msg.payload.warning,
          selectedVillageId: msg.payload.updatedLocation.type === 'VILLAGE' ? msg.payload.updatedLocation.id : this.currentState.selectedVillageId,
          selectedWardId: msg.payload.updatedLocation.type === 'WARD' ? msg.payload.updatedLocation.id : this.currentState.selectedWardId,
          locations: this.currentState.locations.map(l =>
            l.id === msg.payload.updatedLocation.id ? msg.payload.updatedLocation : l
          ),
          lastUpdated: new Date().toLocaleTimeString('en-IN') + ' IST'
        };
        break;
      case 'RESET_SIMULATION':
        this.currentState = {
          ...this.currentState,
          activeFlashWarning: null,
          lastUpdated: new Date().toLocaleTimeString('en-IN') + ' IST'
        };
        break;
    }

    this.notifyListeners();
  }

  private broadcast(type: SyncActionType, payload: any) {
    const msg: SyncMessage = {
      type,
      payload,
      timestamp: Date.now(),
      sourceTabId: TAB_ID
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentState));
    } catch {
      // Storage quota or privacy mode
    }

    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch (err) {
        console.warn('Failed to broadcast sync message', err);
      }
    }
  }

  private notifyListeners() {
    this.listeners.forEach(fn => fn(this.currentState));
  }

  public subscribe(listener: (state: DataSyncState) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentState);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): DataSyncState {
    return this.currentState;
  }

  // --- ACTIONS WITH REAL-TIME MULTI-TAB BROADCAST ---

  public setSelectedVillageId(villageId: string) {
    this.currentState = {
      ...this.currentState,
      selectedVillageId: villageId,
      lastUpdated: new Date().toLocaleTimeString('en-IN') + ' IST'
    };
    this.notifyListeners();
    this.broadcast('SET_VILLAGE', villageId);
  }

  public setSelectedWardId(wardId: string) {
    this.currentState = {
      ...this.currentState,
      selectedWardId: wardId,
      lastUpdated: new Date().toLocaleTimeString('en-IN') + ' IST'
    };
    this.notifyListeners();
    this.broadcast('SET_WARD', wardId);
  }

  public setSelectedRoadId(roadId: string) {
    this.currentState = {
      ...this.currentState,
      selectedRoadId: roadId
    };
    this.notifyListeners();
    this.broadcast('SET_ROAD', roadId);
  }

  public setScenario(scenario: string, warning?: FlashFloodWarning | null) {
    this.currentState = {
      ...this.currentState,
      activeScenario: scenario,
      activeFlashWarning: warning !== undefined ? warning : this.currentState.activeFlashWarning,
      lastUpdated: new Date().toLocaleTimeString('en-IN') + ' IST'
    };
    this.notifyListeners();
    this.broadcast('SET_SCENARIO', { scenario, warning });
  }

  public setMode(isDemo: boolean) {
    this.currentState = {
      ...this.currentState,
      isDemoMode: isDemo,
      lastUpdated: new Date().toLocaleTimeString('en-IN') + ' IST'
    };
    this.notifyListeners();
    this.broadcast('SET_MODE', isDemo);
  }

  public updateLocation(updatedLoc: LocationData) {
    this.currentState = {
      ...this.currentState,
      locations: this.currentState.locations.map(l =>
        l.id === updatedLoc.id ? updatedLoc : l
      ),
      lastUpdated: new Date().toLocaleTimeString('en-IN') + ' IST'
    };
    this.notifyListeners();
    this.broadcast('UPDATE_LOCATION', updatedLoc);
  }

  public setLocations(locations: LocationData[]) {
    this.currentState = {
      ...this.currentState,
      locations,
      lastUpdated: new Date().toLocaleTimeString('en-IN') + ' IST'
    };
    this.notifyListeners();
    this.broadcast('SET_FULL_STATE', this.currentState);
  }

  public setActiveFlashWarning(warning: FlashFloodWarning | null) {
    this.currentState = {
      ...this.currentState,
      activeFlashWarning: warning,
      lastUpdated: new Date().toLocaleTimeString('en-IN') + ' IST'
    };
    this.notifyListeners();
    this.broadcast('UPDATE_FLASH_WARNING', warning);
  }

  public addCitizenReport(report: CitizenReport) {
    this.currentState = {
      ...this.currentState,
      citizenReports: [report, ...this.currentState.citizenReports],
      lastUpdated: new Date().toLocaleTimeString('en-IN') + ' IST'
    };
    this.notifyListeners();
    this.broadcast('ADD_CITIZEN_REPORT', report);
  }

  public setWaterloggingViewMode(mode: 'realtime' | 'predicted') {
    this.currentState = {
      ...this.currentState,
      waterloggingViewMode: mode
    };
    this.notifyListeners();
    this.broadcast('SET_WATERLOGGING_VIEW', mode);
  }

  public applySimulatorWarning(warning: FlashFloodWarning, updatedLoc: LocationData) {
    this.currentState = {
      ...this.currentState,
      activeFlashWarning: warning,
      selectedVillageId: updatedLoc.type === 'VILLAGE' ? updatedLoc.id : this.currentState.selectedVillageId,
      selectedWardId: updatedLoc.type === 'WARD' ? updatedLoc.id : this.currentState.selectedWardId,
      locations: this.currentState.locations.map(l =>
        l.id === updatedLoc.id ? updatedLoc : l
      ),
      lastUpdated: new Date().toLocaleTimeString('en-IN') + ' IST'
    };
    this.notifyListeners();
    this.broadcast('APPLY_SIMULATION', { warning, updatedLocation: updatedLoc });
  }

  public resetSimulation() {
    this.currentState = {
      ...this.currentState,
      activeFlashWarning: null,
      lastUpdated: new Date().toLocaleTimeString('en-IN') + ' IST'
    };
    this.notifyListeners();
    this.broadcast('RESET_SIMULATION', null);
  }
}

export const dataSyncService = new DataSyncService();
