import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { LocationData, IoTSensor, CitizenReport, HistoricalEvent } from '../../types';
import { Layers, Eye, EyeOff } from 'lucide-react';

interface DisasterMapProps {
  locations: LocationData[];
  selectedLocation: LocationData | null;
  onSelectLocation: (loc: LocationData) => void;
  riverNetworks: any[];
  drainageLines: any[];
  sensors: IoTSensor[];
  citizenReports: CitizenReport[];
  infrastructure: any[];
  historicalEvents?: HistoricalEvent[];
  activeLayers: {
    floodRisk: boolean;
    landslideRisk: boolean;
    rainfall: boolean;
    soilMoisture: boolean;
    drainage: boolean;
    iotSensors: boolean;
    citizenReports: boolean;
    infrastructure: boolean;
    historicalEvents: boolean;
  };
  onToggleLayer: (layerKey: string) => void;
}

export const DisasterMap: React.FC<DisasterMapProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  riverNetworks,
  drainageLines,
  sensors,
  citizenReports,
  infrastructure,
  historicalEvents = [],
  activeLayers,
  onToggleLayer
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupsRef = useRef<{ [key: string]: L.LayerGroup }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center on the valley basin
      const map = L.map(mapContainerRef.current, {
        center: [30.0920, 78.2676],
        zoom: 13,
        zoomControl: true,
        attributionControl: false
      });

      // High quality CartoDB Positron clean map tiles for emergency command center
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomright' })
        .addAttribution('&copy; OpenStreetMap &copy; CARTO | JALRAKSHAK GIS Engine')
        .addTo(map);

      mapInstanceRef.current = map;

      // Initialize layer groups
      layerGroupsRef.current = {
        zones: L.layerGroup().addTo(map),
        rivers: L.layerGroup().addTo(map),
        drainage: L.layerGroup().addTo(map),
        sensors: L.layerGroup().addTo(map),
        reports: L.layerGroup().addTo(map),
        infrastructure: L.layerGroup().addTo(map),
        historical: L.layerGroup().addTo(map)
      };
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous dynamic layers
    Object.values(layerGroupsRef.current).forEach(lg => lg.clearLayers());

    // 1. ZONES LAYER (Wards, Villages, Landslide zones)
    if (activeLayers.floodRisk || activeLayers.landslideRisk) {
      locations.forEach(loc => {
        if (loc.type === 'LANDSLIDE_ZONE' && !activeLayers.landslideRisk) return;
        if (loc.type !== 'LANDSLIDE_ZONE' && !activeLayers.floodRisk) return;

        const isSelected = selectedLocation?.id === loc.id;
        const color = loc.risk_color || (loc.risk_level === 'CRITICAL' ? '#dc2626' : loc.risk_level === 'HIGH' ? '#f97316' : loc.risk_level === 'MODERATE' ? '#eab308' : '#16a34a');

        const polygon = L.polygon(loc.polygon, {
          color: isSelected ? '#0284c7' : color,
          weight: isSelected ? 3.5 : 2,
          fillColor: color,
          fillOpacity: isSelected ? 0.45 : 0.25,
          dashArray: loc.type === 'LANDSLIDE_ZONE' ? '5, 5' : undefined
        });

        polygon.on('click', () => {
          onSelectLocation(loc);
        });

        // Tooltip
        polygon.bindTooltip(`
          <div style="font-family: system-ui; font-size: 11px; padding: 2px;">
            <div style="font-weight: 700; color: #0f172a;">${loc.name}</div>
            <div style="display: flex; gap: 6px; margin-top: 2px;">
              <span style="color: ${color}; font-weight: 800;">${loc.risk_level || 'EVALUATING'} (${loc.risk_probability || 0}%)</span>
              <span style="color: #64748b;">${loc.expected_window}</span>
            </div>
            ${loc.cause_intelligence ? `<div style="font-size: 10px; color: #b45309; font-weight: 600; margin-top: 2px;">Cause: ${loc.cause_intelligence.probable_cause}</div>` : ''}
          </div>
        `, { sticky: true });

        layerGroupsRef.current.zones.addLayer(polygon);

        // Center Label Marker
        const labelIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="
              background: rgba(15, 23, 42, 0.85);
              color: #ffffff;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: 700;
              white-space: nowrap;
              border: 1px solid ${color};
              box-shadow: 0 2px 4px rgba(0,0,0,0.25);
              transform: translate(-50%, -50%);
              cursor: pointer;
            ">
              ${loc.name.split(' ')[0]} ${loc.name.split(' ')[1] || ''}: <span style="color: ${color}; font-weight: 900;">${loc.risk_probability || 0}%</span>
            </div>
          `
        });

        const labelMarker = L.marker(loc.coordinates, { icon: labelIcon });
        labelMarker.on('click', () => onSelectLocation(loc));
        layerGroupsRef.current.zones.addLayer(labelMarker);
      });
    }

    // 2. RIVERS LAYER
    riverNetworks.forEach(riv => {
      const riverLine = L.polyline(riv.coordinates, {
        color: '#0284c7',
        weight: 6,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round'
      });
      riverLine.bindTooltip(`<b>${riv.name}</b><br/>Level: ${riv.current_level_m}m (Danger: ${riv.danger_mark_m}m)`, { sticky: true });
      layerGroupsRef.current.rivers.addLayer(riverLine);
    });

    // 3. DRAINAGE LAYER
    if (activeLayers.drainage) {
      drainageLines.forEach(drn => {
        const isChoked = drn.status === 'CHOKED';
        const color = isChoked ? '#dc2626' : drn.status === 'RESTRICTED' ? '#d97706' : '#059669';
        
        const drainLine = L.polyline(drn.coordinates, {
          color: color,
          weight: isChoked ? 5 : 3.5,
          dashArray: isChoked ? '6, 6' : undefined,
          opacity: 0.95
        });

        drainLine.bindTooltip(`
          <div style="font-size: 11px;">
            <strong style="color: ${color};">${drn.name}</strong><br/>
            Status: <b>${drn.status}</b> (${drn.efficiency_pct}% flow efficiency)<br/>
            <span style="font-size: 10px; color: #64748b;">${drn.cause_factor}</span>
          </div>
        `, { sticky: true });

        layerGroupsRef.current.drainage.addLayer(drainLine);
      });
    }

    // 4. IOT SENSORS LAYER
    if (activeLayers.iotSensors) {
      sensors.forEach(sensor => {
        const isCritical = sensor.status === 'CRITICAL';
        const sensorIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="
              width: 26px;
              height: 26px;
              border-radius: 50%;
              background: #0f172a;
              border: 2px solid ${sensor.status_color};
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              box-shadow: 0 0 ${isCritical ? '10px' : '4px'} ${sensor.status_color};
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
            <b>${sensor.name}</b> (${sensor.type})<br/>
            Current Value: <strong style="color: ${sensor.status_color};">${sensor.current_value}</strong><br/>
            Normal Range: ${sensor.normal_range}<br/>
            Trend: <b>${sensor.trend}</b> | Updated: ${sensor.last_update}
          </div>
        `, { sticky: true });
        layerGroupsRef.current.sensors.addLayer(marker);
      });
    }

    // 5. CITIZEN REPORTS LAYER
    if (activeLayers.citizenReports) {
      citizenReports.forEach(rep => {
        const reportIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="
              background: #991b1b;
              color: #ffffff;
              padding: 3px 6px;
              border-radius: 9999px;
              border: 2px solid #ffffff;
              font-size: 10px;
              font-weight: 800;
              box-shadow: 0 3px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              gap: 4px;
              transform: translate(-50%, -50%);
              cursor: pointer;
            ">
              <span>⚠️</span>
              <span>WATERLOG REPORT</span>
            </div>
          `
        });

        const marker = L.marker(rep.coordinates, { icon: reportIcon });
        marker.bindPopup(`
          <div style="font-family: system-ui; max-width: 240px;">
            <div style="font-weight: 800; color: #dc2626; font-size: 12px; margin-bottom: 4px;">
              CITIZEN WATERLOGGING ALERT
            </div>
            <img src="${rep.image_url}" alt="Crowd report" style="width: 100%; height: 110px; object-fit: cover; border-radius: 6px; margin-bottom: 6px;" />
            <div style="font-size: 11px; color: #1e293b; margin-bottom: 4px;"><b>Location:</b> ${rep.location_name}</div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">"${rep.description}"</div>
            <div style="font-size: 10px; color: #64748b;">Status: <b>${rep.status}</b> | ${rep.timestamp}</div>
          </div>
        `);
        layerGroupsRef.current.reports.addLayer(marker);
      });
    }

    // 6. CRITICAL INFRASTRUCTURE LAYER
    if (activeLayers.infrastructure) {
      infrastructure.forEach(infra => {
        const infraIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="
              background: #ffffff;
              border: 1.5px solid #0f172a;
              border-radius: 4px;
              padding: 1px 4px;
              font-size: 9px;
              font-weight: 700;
              color: #0f172a;
              box-shadow: 0 1px 3px rgba(0,0,0,0.2);
              transform: translate(-50%, -50%);
              white-space: nowrap;
            ">
              🏛️ ${infra.name.split(' ')[0]}
            </div>
          `
        });
        const marker = L.marker(infra.coordinates, { icon: infraIcon });
        marker.bindTooltip(`<b>${infra.name}</b><br/>Type: ${infra.type}<br/>Elevation: ${infra.elevation}m<br/>Status: ${infra.status}`, { sticky: true });
        layerGroupsRef.current.infrastructure.addLayer(marker);
      });
    }

    // 7. HISTORICAL EVENTS LAYER
    if (activeLayers.historicalEvents && historicalEvents.length > 0) {
      historicalEvents.forEach(hist => {
        const histIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="
              width: 22px;
              height: 22px;
              background: #475569;
              border: 2px solid #f8fafc;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 10px;
              font-weight: 800;
              box-shadow: 0 2px 4px rgba(0,0,0,0.25);
              transform: translate(-50%, -50%);
            ">
              H
            </div>
          `
        });
        const marker = L.marker(hist.coordinates, { icon: histIcon });
        marker.bindPopup(`
          <div style="font-size: 11px;">
            <strong style="color: #0f172a;">${hist.title} (${hist.date})</strong><br/>
            Event: <b>${hist.event_type}</b><br/>
            Rainfall: ${hist.rainfall_conditions}<br/>
            Analysis: ${hist.cause_analysis}
          </div>
        `);
        layerGroupsRef.current.historical.addLayer(marker);
      });
    }

  }, [locations, selectedLocation, activeLayers, riverNetworks, drainageLines, sensors, citizenReports, infrastructure, historicalEvents]);

  return (
    <div className="relative w-full h-[580px] lg:h-[680px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Layer Toggles Floating Control */}
      <div className="absolute top-3 right-3 z-40 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-200 shadow-lg text-xs max-w-[210px]">
        <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-2.5 pb-1.5 border-b border-slate-200">
          <Layers className="w-3.5 h-3.5 text-sky-600" />
          <span>GIS Layer Controls</span>
        </div>

        <div className="space-y-1.5 text-slate-700">
          <label className="flex items-center justify-between cursor-pointer hover:text-slate-900">
            <span className="flex items-center gap-1.5">
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

          <label className="flex items-center justify-between cursor-pointer hover:text-slate-900">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-700" />
              <span>Landslide Risk</span>
            </span>
            <input
              type="checkbox"
              checked={activeLayers.landslideRisk}
              onChange={() => onToggleLayer('landslideRisk')}
              className="rounded text-sky-600 focus:ring-0 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer hover:text-slate-900">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 border border-red-800" />
              <span>Drainage Network</span>
            </span>
            <input
              type="checkbox"
              checked={activeLayers.drainage}
              onChange={() => onToggleLayer('drainage')}
              className="rounded text-sky-600 focus:ring-0 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer hover:text-slate-900">
            <span className="flex items-center gap-1.5">
              <span className="text-[10px]">📡</span>
              <span>IoT Telemetry</span>
            </span>
            <input
              type="checkbox"
              checked={activeLayers.iotSensors}
              onChange={() => onToggleLayer('iotSensors')}
              className="rounded text-sky-600 focus:ring-0 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer hover:text-slate-900">
            <span className="flex items-center gap-1.5">
              <span className="text-[10px]">⚠️</span>
              <span>Citizen Reports</span>
            </span>
            <input
              type="checkbox"
              checked={activeLayers.citizenReports}
              onChange={() => onToggleLayer('citizenReports')}
              className="rounded text-sky-600 focus:ring-0 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer hover:text-slate-900">
            <span className="flex items-center gap-1.5">
              <span className="text-[10px]">🏛️</span>
              <span>Critical Infra</span>
            </span>
            <input
              type="checkbox"
              checked={activeLayers.infrastructure}
              onChange={() => onToggleLayer('infrastructure')}
              className="rounded text-sky-600 focus:ring-0 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer hover:text-slate-900">
            <span className="flex items-center gap-1.5">
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
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-40 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-200 shadow-md text-xs flex flex-wrap items-center gap-3">
        <span className="font-bold text-slate-800">Risk Color Codes:</span>
        <span className="flex items-center gap-1 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> 0-30% LOW
        </span>
        <span className="flex items-center gap-1 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> 31-60% MODERATE
        </span>
        <span className="flex items-center gap-1 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> 61-80% HIGH
        </span>
        <span className="flex items-center gap-1 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> 81-100% CRITICAL
        </span>
      </div>
    </div>
  );
};
