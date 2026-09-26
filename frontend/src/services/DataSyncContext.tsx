import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { dataSyncService, type DataSyncState } from './dataSyncService';
import type { LocationData, FlashFloodWarning, CitizenReport } from '../types';

interface DataSyncContextType extends DataSyncState {
  selectedVillage: LocationData | null;
  selectedWard: LocationData | null;
  villages: LocationData[];
  wards: LocationData[];
  setSelectedVillageId: (id: string) => void;
  setSelectedWardId: (id: string) => void;
  setSelectedRoadId: (id: string) => void;
  setScenario: (scenario: string, warning?: FlashFloodWarning | null) => void;
  setMode: (isDemo: boolean) => void;
  updateLocation: (loc: LocationData) => void;
  setLocations: (locs: LocationData[]) => void;
  setActiveFlashWarning: (warning: FlashFloodWarning | null) => void;
  addCitizenReport: (report: CitizenReport) => void;
  setWaterloggingViewMode: (mode: 'realtime' | 'predicted') => void;
  applySimulatorWarning: (warning: FlashFloodWarning, updatedLoc: LocationData) => void;
  resetSimulation: () => void;
}

const DataSyncContext = createContext<DataSyncContextType | null>(null);

export const DataSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [syncState, setSyncState] = useState<DataSyncState>(() => dataSyncService.getState());

  useEffect(() => {
    const unsubscribe = dataSyncService.subscribe((newState) => {
      setSyncState(newState);
    });
    return unsubscribe;
  }, []);

  const villages = useMemo(() => {
    return syncState.locations.filter(l => l.type === 'VILLAGE');
  }, [syncState.locations]);

  const wards = useMemo(() => {
    return syncState.locations.filter(l => l.type === 'WARD');
  }, [syncState.locations]);

  const selectedVillage = useMemo(() => {
    return villages.find(v => v.id === syncState.selectedVillageId) || villages[0] || null;
  }, [villages, syncState.selectedVillageId]);

  const selectedWard = useMemo(() => {
    return wards.find(w => w.id === syncState.selectedWardId) || wards[0] || null;
  }, [wards, syncState.selectedWardId]);

  const value = useMemo<DataSyncContextType>(() => ({
    ...syncState,
    selectedVillage,
    selectedWard,
    villages,
    wards,
    setSelectedVillageId: (id: string) => dataSyncService.setSelectedVillageId(id),
    setSelectedWardId: (id: string) => dataSyncService.setSelectedWardId(id),
    setSelectedRoadId: (id: string) => dataSyncService.setSelectedRoadId(id),
    setScenario: (scenario: string, warning?: FlashFloodWarning | null) => dataSyncService.setScenario(scenario, warning),
    setMode: (isDemo: boolean) => dataSyncService.setMode(isDemo),
    updateLocation: (loc: LocationData) => dataSyncService.updateLocation(loc),
    setLocations: (locs: LocationData[]) => dataSyncService.setLocations(locs),
    setActiveFlashWarning: (warning: FlashFloodWarning | null) => dataSyncService.setActiveFlashWarning(warning),
    addCitizenReport: (report: CitizenReport) => dataSyncService.addCitizenReport(report),
    setWaterloggingViewMode: (mode: 'realtime' | 'predicted') => dataSyncService.setWaterloggingViewMode(mode),
    applySimulatorWarning: (warning: FlashFloodWarning, updatedLoc: LocationData) => dataSyncService.applySimulatorWarning(warning, updatedLoc),
    resetSimulation: () => dataSyncService.resetSimulation()
  }), [syncState, selectedVillage, selectedWard, villages, wards]);

  return (
    <DataSyncContext.Provider value={value}>
      {children}
    </DataSyncContext.Provider>
  );
};

export const useDataSync = (): DataSyncContextType => {
  const ctx = useContext(DataSyncContext);
  if (!ctx) {
    throw new Error('useDataSync must be used within a DataSyncProvider');
  }
  return ctx;
};
