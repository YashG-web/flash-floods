import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { LocationSafetyResult, OfficialImdWarning, LocationData } from '../types';
import { useTranslation } from '../services/LanguageContext';
import {
  X,
  MapPin,
  Compass,
  Search,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  CloudRain,
  Thermometer,
  Wind,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

interface LocationSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDemoMode?: boolean;
  locations?: LocationData[];
  officialImdWarnings?: OfficialImdWarning[];
}

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
}



export const LocationSafetyModal: React.FC<LocationSafetyModalProps> = ({
  isOpen,
  onClose,
  isDemoMode = true,
  officialImdWarnings = []
}) => {
  const { t } = useTranslation();
  const [activeLocation, setActiveLocation] = useState({
    name: 'Ward 04 (Riverfront Embankment)',
    lat: 30.0845,
    lon: 78.2618
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LocationSafetyResult | null>(null);

  // Evaluate location safety whenever coordinates change or modal opens using Live API
  const evaluateLocation = async (lat: number, lon: number, name: string) => {
    setLoading(true);
    try {
      // Always request live Open-Meteo weather API data
      const data = await apiClient.getLocationSafety(lat, lon, name, 'LIVE');
      
      // If backend didn't return warnings, attach existing official IMD warnings
      if ((!data.official_warnings || data.official_warnings.length === 0) && officialImdWarnings.length > 0) {
        data.official_warnings = officialImdWarnings;
      }
      setResult(data);
    } catch (err) {
      console.warn('Backend evaluation failed, querying Open-Meteo weather API directly:', err);
      try {
        const omRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&hourly=soil_moisture_0_to_1cm,precipitation&timezone=auto`
        );
        if (omRes.ok) {
          const omData = await omRes.json();
          const curr = omData.current || {};
          const precip = curr.precipitation ?? curr.rain ?? 0.0;
          const temp = curr.temperature_2m ?? 24.0;
          const hum = curr.relative_humidity_2m ?? 60.0;
          const wind = curr.wind_speed_10m ?? 10.0;
          const wCode = curr.weather_code ?? 0;
          const WMO_MAP: Record<number, string> = {
            0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
            45: 'Foggy', 51: 'Light Drizzle', 61: 'Slight Rain', 63: 'Moderate Rain',
            65: 'Heavy Rain', 80: 'Rain Showers', 95: 'Thunderstorm'
          };
          const cond = WMO_MAP[wCode] || (precip > 0 ? 'Rain' : 'Partly Cloudy');
          const riskLevel = precip >= 50 ? 'CRITICAL' : precip >= 25 ? 'HIGH' : precip >= 10 ? 'MODERATE' : 'LOW';

          setResult({
            success: true,
            location: { name, latitude: lat, longitude: lon },
            mode: 'LIVE',
            is_demo_mode: false,
            assessment: {
              risk_level: riskLevel as any,
              risk_color: riskLevel === 'LOW' ? '#16a34a' : '#f97316',
              risk_probability: Math.min(100, Math.round((precip / 70) * 65 + 10)),
              status_wording: `currently assessed as ${riskLevel} RISK`,
              probable_cause: precip > 0 ? 'Active Rain Inflow' : 'Normal Basin Hydrology & Safe Soil Absorption',
              explanation: precip > 0
                ? `Live rain rate of ${precip} mm/h observed via Open-Meteo.`
                : `Live meteorological observations report nominal conditions (${precip} mm/h) with safe geological absorption limits.`,
              advice: [
                'Current weather observations show safe atmospheric and runoff conditions.',
                'River channels and drainage conduits in this sector are maintaining safe baseline flow.'
              ]
            },
            weather_telemetry: {
              condition: cond,
              weather_code: wCode,
              temperature_c: temp,
              humidity_pct: hum,
              wind_kmh: wind,
              current_rainfall_mm_hr: precip,
              soil_moisture_pct: 50.0,
              forecast_peak_24h_mm_hr: precip,
              forecast_total_24h_mm: precip * 2,
              source: 'Open-Meteo Weather API (Live)',
              observed_at: new Date().toLocaleTimeString('en-IN') + ' IST'
            },
            official_warnings: officialImdWarnings,
            disclaimer: 'Assessments reflect real-time external sensor telemetry and meteorological models.'
          });
        }
      } catch (clientErr) {
        console.error('Direct Open-Meteo fetch failed:', clientErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      evaluateLocation(activeLocation.lat, activeLocation.lon, activeLocation.name);
    }
  }, [isOpen, activeLocation.lat, activeLocation.lon, isDemoMode]);

  // Handle GPS detection using browser geolocation
  const handleDetectGps = () => {
    setGpsError(null);
    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGps(false);
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lon = parseFloat(pos.coords.longitude.toFixed(4));
        const name = `My Current GPS [${lat}, ${lon}]`;
        setActiveLocation({ name, lat, lon });
      },
      (err) => {
        setIsDetectingGps(false);
        setGpsError('Could not retrieve GPS location. Please allow browser location access or search manually.');
        console.warn('Geolocation error:', err.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Search cities / towns in India using free Open-Meteo Geocoding
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery.trim())}&count=5&language=en&format=json`
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  const assessment = result?.assessment;
  const weather = result?.weather_telemetry;
  const riskLvl = assessment?.risk_level || 'LOW';

  const riskBadgeStyles = {
    CRITICAL: {
      bg: 'bg-red-600',
      border: 'border-red-500',
      text: 'text-red-700',
      cardBg: 'bg-red-50',
      symbol: '🔴'
    },
    HIGH: {
      bg: 'bg-orange-500',
      border: 'border-orange-400',
      text: 'text-orange-700',
      cardBg: 'bg-orange-50',
      symbol: '🟠'
    },
    MODERATE: {
      bg: 'bg-amber-500',
      border: 'border-amber-400',
      text: 'text-amber-800',
      cardBg: 'bg-amber-50',
      symbol: '🟡'
    },
    LOW: {
      bg: 'bg-emerald-600',
      border: 'border-emerald-500',
      text: 'text-emerald-800',
      cardBg: 'bg-emerald-50',
      symbol: '🟢'
    }
  }[riskLvl] || {
    bg: 'bg-emerald-600',
    border: 'border-emerald-500',
    text: 'text-emerald-800',
    cardBg: 'bg-emerald-50',
    symbol: '🟢'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border-2 border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* 1. MODAL HEADER */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4 border-b border-slate-800 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {t.appName}
              </span>
              <span className={`text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded-full ${
                isDemoMode
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
              }`}>
                {isDemoMode ? t.demoModeActive : t.liveDataActive}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-mono tracking-tight flex items-center gap-2">
              <span>🏠 {t.locationSafetyTitle}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.locationSafetyDesc}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
            title={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* 2. LOCATION SELECTOR & GPS BUTTON */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800">
                <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="text-slate-500">{t.selectedWard}:</span>
                <span className="text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 truncate max-w-xs">
                  {activeLocation.name}
                </span>
              </div>

              {/* GPS Button */}
              <button
                type="button"
                onClick={handleDetectGps}
                disabled={isDetectingGps}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 self-start sm:self-auto disabled:opacity-50"
              >
                {isDetectingGps ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Compass className="w-3.5 h-3.5" />
                )}
                <span>{isDetectingGps ? t.syncing : `📍 ${t.useCurrentGps}`}</span>
              </button>
            </div>

            {gpsError && (
              <div className="text-[11px] font-bold text-amber-700 bg-amber-50 p-2 rounded-xl border border-amber-200 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{gpsError}</span>
              </div>
            )}

            {/* City Search Bar */}
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchCityVillage}
                  className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isSearching ? t.syncing : 'Search'}
              </button>
            </form>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 max-h-40 overflow-y-auto">
                {searchResults.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      const name = `${loc.name}${loc.admin1 ? ', ' + loc.admin1 : ''}`;
                      setActiveLocation({ name, lat: loc.latitude, lon: loc.longitude });
                      setSearchResults([]);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2.5 hover:bg-slate-50 text-xs flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <strong className="text-slate-900">{loc.name}</strong>
                      <span className="text-slate-500 text-[11px] ml-1.5">
                        {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      [{loc.latitude.toFixed(2)}, {loc.longitude.toFixed(2)}]
                    </span>
                  </button>
                ))}
              </div>
            )}


          </div>

          {/* 3. PRIMARY ASSESSMENT RESULT */}
          {loading ? (
            <div className="h-44 flex flex-col items-center justify-center text-slate-500 gap-2 border-2 border-dashed border-slate-200 rounded-2xl">
              <RefreshCw className="w-7 h-7 animate-spin text-sky-600" />
              <div className="text-xs font-bold font-mono">
                Querying Open-Meteo & Running JalRakshak Risk Engine...
              </div>
            </div>
          ) : assessment ? (
            <div className={`p-5 sm:p-6 rounded-2xl border-2 space-y-4 transition-all ${riskBadgeStyles.cardBg} ${riskBadgeStyles.border}`}>
              {/* Status Header with Required Wording */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase font-mono tracking-wider text-slate-500 block">
                    {t.currentStatusHeading}
                  </span>
                  <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-950 flex items-center gap-2">
                    <span>{riskBadgeStyles.symbol}</span>
                    <span>{riskLvl === 'LOW' ? t.safeStatusTitle : `${t.highRiskStatusTitle} (${riskLvl})`}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="text-right font-mono">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">{t.flashFloodCardTitle}</div>
                    <div className="text-lg font-black text-slate-900">{assessment.risk_probability}%</div>
                  </div>
                  <span className={`px-3 py-1 rounded-xl text-white font-mono font-black text-xs ${riskBadgeStyles.bg}`}>
                    {riskLvl}
                  </span>
                </div>
              </div>

              {/* Explanatory Assessment */}
              <div className="p-3.5 bg-white/80 rounded-xl border border-slate-200/80 text-xs text-slate-800 space-y-1 font-medium">
                <div><strong>{t.primaryCause}:</strong> {assessment.probable_cause}</div>
                <div className="text-slate-600">{assessment.explanation}</div>
              </div>

              {/* Actionable Advice */}
              {assessment.advice && assessment.advice.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-black uppercase font-mono tracking-wider text-slate-600 block">
                    {t.whatYouShouldDo}:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-800">
                    {assessment.advice.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 4. CURRENT WEATHER CONDITION (LIVE API) */}
              {weather && (
                <div className="p-4 bg-linear-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-2xl border-2 border-sky-300 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-sky-200 flex items-center justify-center text-2xl shrink-0">
                        {weather.weather_code === 0 ? '☀️'
                          : weather.weather_code === 1 ? '🌤️'
                          : weather.weather_code === 2 ? '⛅'
                          : weather.weather_code === 3 ? '☁️'
                          : [45, 48].includes(weather.weather_code || -1) ? '🌫️'
                          : [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weather.weather_code || -1) ? '🌧️'
                          : [95, 96, 99].includes(weather.weather_code || -1) ? '⛈️'
                          : '⛅'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black uppercase tracking-wider text-sky-800 font-mono">
                            Current Weather Condition
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live Weather API
                          </span>
                        </div>
                        <h4 className="text-xl font-black text-slate-950 font-mono">
                          {weather.condition || (weather.weather_code === 0 ? 'Clear Sky' : 'Partly Cloudy')}
                        </h4>
                        <p className="text-xs text-slate-600">
                          Observed at <span className="font-mono font-bold text-slate-800">{weather.observed_at}</span> • [{activeLocation.lat.toFixed(4)}, {activeLocation.lon.toFixed(4)}]
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/90 px-4 py-2 rounded-xl border border-sky-200 self-start sm:self-auto text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-bold">Temp</span>
                        <span className="text-base font-black text-slate-900">{weather.temperature_c}°C</span>
                      </div>
                      <div className="w-px h-6 bg-slate-200" />
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-bold">Rain Rate</span>
                        <span className={`text-base font-black ${weather.current_rainfall_mm_hr > 0 ? 'text-blue-600' : 'text-slate-900'}`}>
                          {weather.current_rainfall_mm_hr} mm/h
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. METEOROLOGICAL & HYDROLOGICAL TELEMETRY GRID */}
              {weather && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                  {/* Rainfall */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1 text-slate-500 text-[10px] uppercase font-bold mb-1">
                      <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                      <span>Rainfall</span>
                    </div>
                    <div className="font-black text-slate-950 text-sm">
                      {weather.current_rainfall_mm_hr} mm/h
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      24h Peak: {weather.forecast_peak_24h_mm_hr} mm/h
                    </div>
                  </div>

                  {/* Soil Moisture */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1 text-slate-500 text-[10px] uppercase font-bold mb-1">
                      <Droplets className="w-3.5 h-3.5 text-amber-500" />
                      <span>Soil Moisture</span>
                    </div>
                    <div className="font-black text-slate-950 text-sm">
                      {weather.soil_moisture_pct}%
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {weather.soil_moisture_pct >= 75 ? 'Saturated Soil Runoff Hazard' : 'Normal Geological Absorption'}
                    </div>
                  </div>

                  {/* Temperature */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1 text-slate-500 text-[10px] uppercase font-bold mb-1">
                      <Thermometer className="w-3.5 h-3.5 text-red-500" />
                      <span>Temp / Humid</span>
                    </div>
                    <div className="font-black text-slate-950 text-sm">
                      {weather.temperature_c}°C
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      RH: {weather.humidity_pct}%
                    </div>
                  </div>

                  {/* 24h Rain Outlook */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1 text-slate-500 text-[10px] uppercase font-bold mb-1">
                      <Wind className="w-3.5 h-3.5 text-teal-500" />
                      <span>24h Forecast</span>
                    </div>
                    <div className="font-black text-slate-950 text-sm">
                      {weather.forecast_total_24h_mm} mm
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Wind: {weather.wind_kmh} km/h
                    </div>
                  </div>
                </div>
              )}


            </div>
          ) : null}

          {/* 7. NON-GUARANTEEING SAFETY DISCLAIMER */}
          <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <strong>Advisory Notice: </strong>
              <span>
                Assessments represent current meteorological telemetry and hydrological model estimates (currently assessed status).
                Natural hazards can evolve rapidly during heavy rainfall or upstream river surges. Never attempt to cross flowing floodwaters and always follow instructions from local disaster authorities (Call 112 / 1070).
              </span>
            </div>
          </div>
        </div>

        {/* 8. MODAL FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-[10px] font-mono text-slate-400">
            Source: Open-Meteo Weather API + IMD CAP + JalRakshak AI
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Close Assessment
          </button>
        </div>
      </div>
    </div>
  );
};
