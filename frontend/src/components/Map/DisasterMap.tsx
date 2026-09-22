import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { LocationData, IoTSensor, CitizenReport, HistoricalEvent, FlashFloodWarning, Hospital } from '../../types';
import { Layers, X, Clock, AlertTriangle, Plus, Minus, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Compass } from 'lucide-react';

interface DisasterMapProps {
  locations: LocationData[];
  selectedLocation: LocationData | null;
  onSelectLocation: (loc: LocationData) => void;
  riverNetworks: any[];
  drainageLines: any[];
  sensors: IoTSensor[];
  citizenReports: CitizenReport[];
  infrastructure?: any[];
  historicalEvents?: HistoricalEvent[];
  activeFlashWarning?: FlashFloodWarning | null;
  hospitals?: Hospital[];
  isDemoMode?: boolean;
  activeLayers: {
    floodRisk: boolean;
    landslideRisk?: boolean;
    rainfall: boolean;
    soilMoisture?: boolean;
    drainage: boolean;
    iotSensors: boolean;
    citizenReports?: boolean;
    infrastructure?: boolean;
    historicalEvents: boolean;
    hospitals?: boolean;
  };
  onToggleLayer: (layerKey: string) => void;
}

// 100% Free, High-Speed Map Tile Providers (Zero Watermarks, No API Key, No Billing, No Sign-up Required)
export const BASE_MAP_PROVIDERS = {
  osm: {
    id: 'osm',
    name: 'Real Map of India (OpenStreetMap)',
    shortName: 'India Streets',
    icon: '🇮🇳',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors | JALRAKSHAK INDIA'
    }
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite View (ESRI World Imagery)',
    shortName: 'Satellite',
    icon: '🛰️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri &mdash; Earthstar Geographics'
    }
  },
  topo: {
    id: 'topo',
    name: 'Topographic & Contours (OpenTopoMap)',
    shortName: 'Terrain',
    icon: '⛰️',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 17,
      subdomains: 'abc',
      attribution: 'Map data: &copy; OpenStreetMap, SRTM | Style: OpenTopoMap'
    }
  },
  esriStreet: {
    id: 'esriStreet',
    name: 'ESRI World Street Map',
    shortName: 'Clean Street',
    icon: '🗺️',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri'
    }
  }
} as const;

export type BaseMapKey = keyof typeof BASE_MAP_PROVIDERS;

export const DisasterMap: React.FC<DisasterMapProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  riverNetworks,
  drainageLines,
  sensors,
  citizenReports,
  historicalEvents = [],
  activeFlashWarning,
  hospitals = [],
  isDemoMode = true,
  activeLayers,
  onToggleLayer
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const layerGroupsRef = useRef<{ [key: string]: L.LayerGroup }>({});
  const [layersMenuOpen, setLayersMenuOpen] = useState(false);
  const [showLocationPanel, setShowLocationPanel] = useState(true);
  const [selectedBaseMap, setSelectedBaseMap] = useState<BaseMapKey>('osm');

  // Handle Base Map tile layer switching
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const config = BASE_MAP_PROVIDERS[selectedBaseMap];

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }

    const newBaseLayer = L.tileLayer(config.url, config.options);
    newBaseLayer.addTo(map);
    newBaseLayer.bringToBack();
    baseTileLayerRef.current = newBaseLayer;
  }, [selectedBaseMap]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center on the valley basin in Uttarakhand, India
      const map = L.map(mapContainerRef.current, {
        center: [30.0920, 78.2676],
        zoom: 13,
        minZoom: 3,
        maxZoom: 19,
        zoomControl: false, // Replaced with dedicated unobstructed custom floating navigation controls
        attributionControl: false,
        scrollWheelZoom: false, // Default off to prevent scrolling page from zooming map
        doubleClickZoom: true,
        touchZoom: true,
        dragging: true, // Smooth drag to pan enabled
        inertia: true,
        inertiaDeceleration: 2500,
        inertiaMaxSpeed: 1500,
        easeLinearity: 0.2,
        keyboard: true,
        keyboardPanDelta: 80
      });

      // Explicitly ensure panning/dragging handlers are active
      map.dragging.enable();
      if (map.touchZoom) map.touchZoom.enable();

      // Smart zoom: user clicking or focusing on the map activates scroll zoom; leaving map disables it
      map.on('click', () => {
        map.scrollWheelZoom.enable();
      });
      map.on('focus', () => {
        map.scrollWheelZoom.enable();
      });
      mapContainerRef.current.addEventListener('mouseleave', () => {
        map.scrollWheelZoom.disable();
      });

      // Free, high-speed, zero-watermark base tiles (Default: Real OpenStreetMap of India)
      const config = BASE_MAP_PROVIDERS[selectedBaseMap];
      const initialBase = L.tileLayer(config.url, config.options);
      initialBase.addTo(map);
      initialBase.bringToBack();
      baseTileLayerRef.current = initialBase;

      // Attribution
      L.control.attribution({ position: 'bottomright' })
        .addAttribution('&copy; OpenStreetMap contributors | JALRAKSHAK INDIA')
        .addTo(map);

      mapInstanceRef.current = map;

      // Initialize layer groups
      layerGroupsRef.current = {
        zones: L.layerGroup().addTo(map),
        rivers: L.layerGroup().addTo(map),
        drainage: L.layerGroup().addTo(map),
        sensors: L.layerGroup().addTo(map),
        reports: L.layerGroup().addTo(map),
        historical: L.layerGroup().addTo(map),
        hospitals: L.layerGroup().addTo(map)
      };
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous dynamic layers
    Object.values(layerGroupsRef.current).forEach(lg => lg.clearLayers());

    // 1. FLOOD RISK ZONES (Wards & Locations)
    if (activeLayers.floodRisk) {
      locations.forEach(loc => {
        const isSelected = selectedLocation?.id === loc.id;
        const isWarnedZone = activeFlashWarning && activeFlashWarning.status !== 'NONE' && activeFlashWarning.locationId === loc.id;

        const color = isWarnedZone
          ? '#dc2626'
          : loc.risk_color || (
            loc.risk_level === 'CRITICAL' ? '#dc2626' :
            loc.risk_level === 'HIGH' ? '#f97316' :
            loc.risk_level === 'MODERATE' ? '#eab308' :
            '#16a34a'
          );

        const polygon = L.polygon(loc.polygon, {
          color: isWarnedZone ? '#991b1b' : isSelected ? '#1e1b4b' : color,
          weight: isWarnedZone ? 4.5 : isSelected ? 3.5 : 2,
          fillColor: color,
          fillOpacity: isWarnedZone ? 0.55 : isSelected ? 0.45 : 0.25
        });

        polygon.on('click', () => {
          onSelectLocation(loc);
          setShowLocationPanel(true);
        });

        // Simple tooltip
        polygon.bindTooltip(`
          <div style="font-family: system-ui; font-size: 11px; padding: 2px;">
            <div style="font-weight: 800; color: #0f172a;">${loc.name}</div>
            <div style="color: ${color}; font-weight: 800; margin-top: 2px;">
              ${isWarnedZone ? '🚨 FLASH FLOOD WARNING ZONE' : `${loc.risk_level || 'EVALUATING'} RISK`}
            </div>
          </div>
        `, { sticky: true });

        layerGroupsRef.current.zones.addLayer(polygon);

        // Center Label Marker
        const labelIcon = L.divIcon({
          className: 'custom-div-icon',
          html: isWarnedZone ? `
            <div style="
              background: #dc2626;
              color: #ffffff;
              padding: 3px 8px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 900;
              white-space: nowrap;
              border: 2px solid #ffffff;
              box-shadow: 0 0 12px rgba(220, 38, 38, 0.8);
              transform: translate(-50%, -50%);
              cursor: pointer;
            ">
              🚨 WARNING ZONE: ${loc.name.split(' ')[0]} ${loc.name.split(' ')[1] || ''}
            </div>
          ` : `
            <div style="
              background: rgba(15, 23, 42, 0.9);
              color: #ffffff;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: 700;
              white-space: nowrap;
              border: 1px solid ${color};
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              transform: translate(-50%, -50%);
              cursor: pointer;
            ">
              ${loc.name.split(' ')[0]} ${loc.name.split(' ')[1] || ''}: <span style="color: ${color}; font-weight: 900;">${loc.risk_level}</span>
            </div>
          `
        });

        const labelMarker = L.marker(loc.coordinates, { icon: labelIcon });
        labelMarker.on('click', () => {
          onSelectLocation(loc);
          setShowLocationPanel(true);
        });
        layerGroupsRef.current.zones.addLayer(labelMarker);
      });
    }

    // 2. RIVERS & WATER BODIES (Always visible as base geographic feature)
    riverNetworks.forEach(riv => {
      const riverLine = L.polyline(riv.coordinates, {
        color: '#0284c7',
        weight: 5,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round'
      });
      riverLine.bindTooltip(`<b>${riv.name}</b><br/>Water Level: ${riv.current_level_m}m`, { sticky: true });
      layerGroupsRef.current.rivers.addLayer(riverLine);
    });

    // 3. DRAINAGE LAYER (Optional on-demand)
    if (activeLayers.drainage) {
      drainageLines.forEach(drn => {
        const isChoked = drn.status === 'CHOKED';
        const color = isChoked ? '#dc2626' : drn.status === 'RESTRICTED' ? '#d97706' : '#059669';
        
        const drainLine = L.polyline(drn.coordinates, {
          color: color,
          weight: isChoked ? 4.5 : 3,
          dashArray: isChoked ? '6, 6' : undefined,
          opacity: 0.9
        });

        drainLine.bindTooltip(`
          <div style="font-size: 11px;">
            <strong style="color: ${color};">${drn.name}</strong><br/>
            Status: <b>${drn.status}</b> (${drn.efficiency_pct}% flow)
          </div>
        `, { sticky: true });

        layerGroupsRef.current.drainage.addLayer(drainLine);
      });
    }

    // 4. IOT SENSORS LAYER (Optional on-demand)
    if (activeLayers.iotSensors) {
      sensors.forEach(sensor => {
        const sensorIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background: #0f172a;
              border: 2px solid ${sensor.status_color};
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              box-shadow: 0 0 6px ${sensor.status_color};
              transform: translate(-50%, -50%);
              cursor: pointer;
            ">
              📡
            </div>
          `
        });

        const marker = L.marker(sensor.coordinates, { icon: sensorIcon });
        marker.bindTooltip(`
          <div style="font-size: 11px;">
            <b>${sensor.name}</b><br/>
            Reading: <strong style="color: ${sensor.status_color};">${sensor.current_value}</strong>
          </div>
        `, { sticky: true });
        layerGroupsRef.current.sensors.addLayer(marker);
      });
    }

    // 5. CITIZEN REPORTS (Important reported waterlogging locations)
    citizenReports.forEach(rep => {
      const reportIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            background: #dc2626;
            color: #ffffff;
            padding: 2px 6px;
            border-radius: 9999px;
            border: 2px solid #ffffff;
            font-size: 9px;
            font-weight: 800;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 3px;
            transform: translate(-50%, -50%);
            cursor: pointer;
          ">
            <span>⚠️</span>
            <span>FLOOD REPORT</span>
          </div>
        `
      });

      const marker = L.marker(rep.coordinates, { icon: reportIcon });
      marker.bindTooltip(`
        <div style="font-size: 11px; max-width: 200px;">
          <b>${rep.location_name}</b><br/>
          <span>${rep.description}</span>
        </div>
      `, { sticky: true });
      layerGroupsRef.current.reports.addLayer(marker);
    });

    // 6. HISTORICAL EVENTS LAYER (Optional on-demand)
    if (activeLayers.historicalEvents && historicalEvents.length > 0) {
      historicalEvents.forEach(hist => {
        const histIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="
              width: 20px;
              height: 20px;
              background: #475569;
              border: 2px solid #ffffff;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 9px;
              font-weight: 800;
              transform: translate(-50%, -50%);
            ">
              H
            </div>
          `
        });
        const marker = L.marker(hist.coordinates, { icon: histIcon });
        marker.bindTooltip(`<b>${hist.title}</b> (${hist.date})<br/>${hist.event_type}`, { sticky: true });
        layerGroupsRef.current.historical.addLayer(marker);
      });
    }

    // 7. HOSPITALS LAYER (Nearby Emergency Healthcare Facilities)
    if (activeLayers.hospitals && hospitals.length > 0) {
      hospitals.forEach(hosp => {
        const isGood = hosp.accessibilityStatus === 'GOOD';
        const isLimited = hosp.accessibilityStatus === 'LIMITED';
        const statusBorderColor = isLimited ? '#dc2626' : isGood ? '#16a34a' : '#d97706';

        const hospIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="
              width: 28px;
              height: 28px;
              background: #ffffff;
              border: 2.5px solid ${statusBorderColor};
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 8px rgba(0,0,0,0.25);
              font-size: 14px;
              transform: translate(-50%, -50%);
              cursor: pointer;
            ">
              🏥
            </div>
          `
        });

        const marker = L.marker(hosp.coordinates, { icon: hospIcon });

        const capacityHtml = hosp.dataMode === 'DEMO' && hosp.availableEmergencyBeds !== null
          ? `<div style="margin-top: 4px; font-weight: 700; color: #0f172a;">
               Capacity: <span style="color: #0284c7;">${hosp.availableEmergencyBeds} / ${hosp.totalEmergencyBeds} available</span>
               <span style="background: #fbbf24; color: #0f172a; padding: 1px 4px; border-radius: 3px; font-size: 9px; margin-left: 4px;">DEMO</span>
             </div>`
          : `<div style="margin-top: 4px; font-weight: 700; color: #64748b; font-size: 11px;">
               Capacity: <i>Capacity not reported</i>
             </div>`;

        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; min-width: 210px; padding: 4px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <span style="font-size: 16px;">🏥</span>
              <strong style="font-size: 13px; color: #0f172a;">${hosp.name}</strong>
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">${hosp.emergencyCapability}</div>
            <div style="font-size: 11px; font-family: monospace; background: #f1f5f9; padding: 4px 6px; border-radius: 6px; margin-bottom: 6px;">
              <div>📍 <strong>${hosp.distanceKm} km</strong> from selected area</div>
              <div>⏱️ ~${hosp.estimatedTravelMinutes} min travel time</div>
            </div>
            ${capacityHtml}
            <div style="margin-top: 4px; font-size: 11px; font-weight: 700; color: ${statusBorderColor};">
              Route Access: ${hosp.accessibilityStatus} (${hosp.floodAccessibilityStatus || 'Normal'})
            </div>
            <div style="margin-top: 6px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 4px;">
              ${hosp.dataMode === 'DEMO' ? '⚠️ Simulated demonstration data' : 'Verified statutory health metadata'}
            </div>
          </div>
        `);

        marker.bindTooltip(`<b>🏥 ${hosp.name}</b><br/>${hosp.distanceKm} km away • ${hosp.accessibilityStatus} access`, { sticky: true });
        layerGroupsRef.current.hospitals.addLayer(marker);
      });
    }

  }, [locations, selectedLocation, activeLayers, riverNetworks, drainageLines, sensors, citizenReports, historicalEvents, activeFlashWarning, hospitals, isDemoMode]);

  // Selected Location Quick Stats
  const activeLoc = selectedLocation || locations[0];
  const isWarnedZone = activeFlashWarning && activeFlashWarning.status !== 'NONE' && activeFlashWarning.locationId === activeLoc?.id;
  const activeRiskLevel = isWarnedZone ? activeFlashWarning.riskLevel : (activeLoc?.risk_level || 'LOW');

  const getRiskColor = (lvl: string) => {
    switch (lvl) {
      case 'CRITICAL': return { text: 'text-red-700', bg: 'bg-red-600', symbol: '🔴' };
      case 'HIGH': return { text: 'text-orange-700', bg: 'bg-orange-500', symbol: '🟠' };
      case 'MODERATE': return { text: 'text-amber-700', bg: 'bg-amber-500', symbol: '🟡' };
      default: return { text: 'text-emerald-700', bg: 'bg-emerald-600', symbol: '🟢' };
    }
  };

  const riskBadge = getRiskColor(activeRiskLevel);

  // Section 4 Exact Requirements: Risk, Cause, Warning Window, Action
  const warningWindow = isWarnedZone ? activeFlashWarning.estimatedWindow : (activeLoc?.expected_window || 'Next 1–3 Hours');
  const actionAdvice = isWarnedZone 
    ? (activeFlashWarning.actions[0] || 'Avoid affected road')
    : (activeRiskLevel === 'CRITICAL' || activeRiskLevel === 'HIGH' 
      ? 'Avoid Main Market Road and move away from low-lying areas.'
      : 'Roads are clear. Continue monitoring weather updates.');

  const conciseReason = isWarnedZone
    ? activeFlashWarning.reason
    : (activeLoc?.cause_intelligence?.probable_cause || (
        activeRiskLevel === 'HIGH' || activeRiskLevel === 'CRITICAL'
          ? (activeLoc?.rainfall > 60 ? 'Heavy rainfall exceeding drainage capacity' : 'Heavy rainfall + drainage stress')
          : 'Normal precipitation and open drainage flow'
      ));

  return (
    <div className="relative w-full h-[580px] lg:h-[680px] rounded-3xl overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-100">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Active Warning Zone Banner on Map (Section 4 Requirement) */}
      {activeFlashWarning && activeFlashWarning.status !== 'NONE' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-red-600 text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-black animate-pulse border-2 border-white max-w-sm sm:max-w-md w-full justify-between">
          <div className="flex items-center gap-2 truncate">
            <span>🚨 WARNING ZONE:</span>
            <span className="truncate">{activeFlashWarning.locationName.split(' ')[0]} ({activeFlashWarning.roadName})</span>
          </div>
          <span className="bg-black/30 px-2 py-0.5 rounded text-[10px] font-mono shrink-0">
            {activeFlashWarning.estimatedWindow}
          </span>
        </div>
      )}

      {/* Top Controls: Quick Navigation & LAYERS */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => mapInstanceRef.current?.setView([30.0920, 78.2676], 13)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-md rounded-xl border border-slate-300 shadow-md text-xs font-bold text-slate-800 hover:bg-white hover:text-sky-600 transition cursor-pointer"
          title="Reset View to Rishikesh Basin"
        >
          <span>🎯</span>
          <span>Basin</span>
        </button>

        <button
          type="button"
          onClick={() => mapInstanceRef.current?.setView([22.5937, 78.9629], 5)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-md rounded-xl border border-slate-300 shadow-md text-xs font-bold text-slate-800 hover:bg-white hover:text-sky-600 transition cursor-pointer"
          title="View Entire Map of India"
        >
          <span>🇮🇳</span>
          <span>India View</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setLayersMenuOpen(!layersMenuOpen)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white/95 backdrop-blur-md rounded-xl border border-slate-300 shadow-md text-xs font-bold text-slate-800 hover:bg-white hover:text-slate-900 transition cursor-pointer"
          >
            <Layers className="w-4 h-4 text-sky-600" />
            <span>LAYERS</span>
          </button>

        {layersMenuOpen && (
          <div className="mt-2 bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xl text-xs w-60 space-y-3">
            {/* Free Base Map Selector (No API / No Sign-up) */}
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[10px]">
                  Base Map
                </span>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                  FREE / NO KEY
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {(Object.keys(BASE_MAP_PROVIDERS) as BaseMapKey[]).map((key) => {
                  const provider = BASE_MAP_PROVIDERS[key];
                  const isActive = selectedBaseMap === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedBaseMap(key)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-left transition cursor-pointer ${
                        isActive
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60'
                      }`}
                      title={provider.name}
                    >
                      <span className="text-xs">{provider.icon}</span>
                      <span className="truncate">{provider.shortName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="font-extrabold text-slate-900 pb-1 border-b border-slate-100 uppercase tracking-wider text-[10px]">
              Display Layers
            </div>

            <label className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
              <span className="flex items-center gap-2 text-slate-800 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Flood Risk</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.floodRisk}
                onChange={() => onToggleLayer('floodRisk')}
                className="rounded text-sky-600 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
              <span className="flex items-center gap-2 text-slate-800 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Rainfall</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.rainfall}
                onChange={() => onToggleLayer('rainfall')}
                className="rounded text-sky-600 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
              <span className="flex items-center gap-2 text-slate-800 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                <span>Drainage</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.drainage}
                onChange={() => onToggleLayer('drainage')}
                className="rounded text-sky-600 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
              <span className="flex items-center gap-2 text-slate-800 font-semibold">
                <span className="text-xs">📡</span>
                <span>Sensors</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.iotSensors}
                onChange={() => onToggleLayer('iotSensors')}
                className="rounded text-sky-600 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
              <span className="flex items-center gap-2 text-slate-800 font-semibold">
                <span className="w-2 h-2 rounded-xs bg-slate-600" />
                <span>Historical Events</span>
              </span>
              <input
                type="checkbox"
                checked={activeLayers.historicalEvents}
                onChange={() => onToggleLayer('historicalEvents')}
                className="rounded text-sky-600 focus:ring-0 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
              <span className="flex items-center gap-2 text-slate-800 font-semibold">
                <span className="text-xs">🏥</span>
                <span>Hospitals & Trauma</span>
              </span>
              <input
                type="checkbox"
                checked={!!activeLayers.hospitals}
                onChange={() => onToggleLayer('hospitals')}
                className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
              />
            </label>
          </div>
        )}
        </div>
      </div>

      {/* Selected Location / Warning Zone Concise Panel (Section 4 & 6 Requirement) */}
      {activeLoc && showLocationPanel && (
        <div className="absolute top-4 left-4 z-40 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xl max-w-xs sm:max-w-sm w-full">
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                {isWarnedZone ? '🔴 ACTIVE WARNING ZONE' : 'SELECTED AREA'}
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {activeLoc.name.toUpperCase()}
              </h3>
            </div>
            <button
              onClick={() => setShowLocationPanel(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 space-y-2.5 text-xs">
            <div>
              <span className="text-slate-500 font-semibold block text-[11px]">RISK:</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm">{riskBadge.symbol}</span>
                <span className="text-sm font-black text-slate-900 uppercase font-mono">
                  {activeRiskLevel}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block text-[11px]">CAUSE:</span>
              <p className="text-slate-800 font-medium leading-snug mt-0.5">
                {conciseReason}
              </p>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block text-[11px]">WARNING WINDOW:</span>
              <div className="flex items-center gap-1 text-slate-800 font-bold mt-0.5">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>{warningWindow}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                ACTION:
              </span>
              <p className="text-amber-950 font-bold mt-0.5">
                {actionAdvice}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Clean 4-Color Map Legend */}
      <div className="absolute bottom-4 left-4 z-40 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-slate-200 shadow-md text-xs flex flex-wrap items-center gap-3">
        <span className="font-bold text-slate-800">Risk:</span>
        <span className="flex items-center gap-1 text-slate-700 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Low
        </span>
        <span className="flex items-center gap-1 text-slate-700 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Moderate
        </span>
        <span className="flex items-center gap-1 text-slate-700 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High
        </span>
        <span className="flex items-center gap-1 text-slate-700 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Critical
        </span>
      </div>

      {/* Dedicated Floating Map Navigation Toolbar (Pan & Zoom) */}
      <div className="absolute bottom-5 right-4 z-40 flex flex-col items-center gap-2">
        {/* Directional Pan Controls */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-300 shadow-lg p-1 flex flex-col items-center">
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.panBy([0, -120], { animate: true, duration: 0.3 })}
            className="p-1 text-slate-700 hover:bg-sky-50 hover:text-sky-600 rounded-lg transition cursor-pointer"
            title="Pan North (Up)"
            aria-label="Pan North"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.panBy([-120, 0], { animate: true, duration: 0.3 })}
              className="p-1 text-slate-700 hover:bg-sky-50 hover:text-sky-600 rounded-lg transition cursor-pointer"
              title="Pan West (Left)"
              aria-label="Pan West"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.setView([30.0920, 78.2676], 13)}
              className="p-1 text-slate-400 hover:text-sky-600 rounded-lg transition cursor-pointer"
              title="Center Basin"
              aria-label="Center Basin"
            >
              <Compass className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.panBy([120, 0], { animate: true, duration: 0.3 })}
              className="p-1 text-slate-700 hover:bg-sky-50 hover:text-sky-600 rounded-lg transition cursor-pointer"
              title="Pan East (Right)"
              aria-label="Pan East"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.panBy([0, 120], { animate: true, duration: 0.3 })}
            className="p-1 text-slate-700 hover:bg-sky-50 hover:text-sky-600 rounded-lg transition cursor-pointer"
            title="Pan South (Down)"
            aria-label="Pan South"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom In & Out (+ / -) */}
        <div className="flex flex-col bg-white/95 backdrop-blur-md rounded-2xl border border-slate-300 shadow-lg overflow-hidden w-full">
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-2 text-slate-800 hover:bg-sky-50 hover:text-sky-600 transition cursor-pointer flex items-center justify-center"
            title="Zoom In (+)"
            aria-label="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="h-[1px] bg-slate-200" />
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-2 text-slate-800 hover:bg-sky-50 hover:text-sky-600 transition cursor-pointer flex items-center justify-center"
            title="Zoom Out (-)"
            aria-label="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
