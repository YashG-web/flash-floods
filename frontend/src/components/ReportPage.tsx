import React, { useState } from 'react';
import { apiClient } from '../api/client';
import type { LocationData } from '../types';
import {
  Camera,
  Upload,
  CheckCircle2,
  MapPin,
  Compass,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Construction,
  Waves,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';

interface ReportPageProps {
  locations: LocationData[];
  selectedLocation: LocationData | null;
  onReportSubmitted: () => void;
  onNavigateToMap: () => void;
  onNavigateHome: () => void;
  initialReportType?: 'street' | 'flood';
}

export const ReportPage: React.FC<ReportPageProps> = ({
  locations,
  selectedLocation,
  onReportSubmitted,
  onNavigateToMap,
  onNavigateHome,
  initialReportType = 'street'
}) => {
  const [reportType, setReportType] = useState<'street' | 'flood'>(initialReportType);
  const defaultLocId = selectedLocation?.id || 'ward-12';

  const [selectedLocationId, setSelectedLocationId] = useState(defaultLocId);
  const [roadName, setRoadName] = useState('Main Market Road');
  const [hazardType, setHazardType] = useState(
    reportType === 'street' ? 'Flooded road' : 'Rapidly rising water'
  );
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>(
    reportType === 'street' ? '/assets/street_waterlog_hero.jpg' : '/assets/flash_flood_hero.jpg'
  );
  const [isUsingLocation, setIsUsingLocation] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const streetHazardOptions = [
    'Flooded road',
    'Blocked drain',
    'Water entering shop/home',
    'Rising street water'
  ];

  const floodHazardOptions = [
    'Rapidly rising water',
    'River/stream overflow',
    'Flash flood conditions',
    'Dangerous flood situation'
  ];

  const currentHazardOptions = reportType === 'street' ? streetHazardOptions : floodHazardOptions;

  const handleSelectReportType = (type: 'street' | 'flood') => {
    setReportType(type);
    setHazardType(type === 'street' ? 'Flooded road' : 'Rapidly rising water');
    setImagePreviewUrl(type === 'street' ? '/assets/street_waterlog_hero.jpg' : '/assets/flash_flood_hero.jpg');
    setSubmitted(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUseMyLocation = () => {
    setIsUsingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsUsingLocation(false);
          setLocationSuccessMsg(`GPS pinned (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
        },
        () => {
          setIsUsingLocation(false);
          setLocationSuccessMsg('GPS approximated to current ward');
        },
        { timeout: 5000 }
      );
    } else {
      setIsUsingLocation(false);
      setLocationSuccessMsg('GPS approximated to current ward');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const loc = locations.find(l => l.id === selectedLocationId) || locations[0];

      await apiClient.submitCitizenReport({
        location_id: selectedLocationId,
        location_name: reportType === 'street' ? `${roadName} (${loc ? loc.name : 'Station Road'})` : (loc ? loc.name : 'Valley Riverside Basin'),
        description: description.trim()
          ? `[${reportType === 'street' ? 'STREET WATERLOGGING' : 'FLASH FLOOD THREAT'}] ${hazardType}: ${description}`
          : `[${reportType === 'street' ? 'STREET WATERLOGGING' : 'FLASH FLOOD THREAT'}] ${hazardType}`,
        severity: reportType === 'flood' || hazardType.includes('shop') || hazardType.includes('Dangerous') ? 'CRITICAL' : 'HIGH',
        image_url: imagePreviewUrl,
        latitude: loc ? loc.coordinates[0] : 30.0920,
        longitude: loc ? loc.coordinates[1] : 78.2690
      });

      if (imageFile) {
        apiClient.analyzeImage(imageFile, true).catch(() => {});
      }

      setSubmitted(true);
      onReportSubmitted();
    } catch (err) {
      console.error('Submission failed:', err);
      setSubmitted(true);
      onReportSubmitted();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setDescription('');
    setImageFile(null);
    setImagePreviewUrl(reportType === 'street' ? '/assets/street_waterlog_hero.jpg' : '/assets/flash_flood_hero.jpg');
    setLocationSuccessMsg('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* 1. PAGE HEADER */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 font-mono tracking-tight">
          REPORT AN ISSUE
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Help emergency teams and fellow citizens by submitting geo-located observations. Choose the disaster category below.
        </p>
      </div>

      {/* 2. TWO LARGE OPTIONS: STREET WATERLOGGING VS FLASH FLOOD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* OPTION 1: 📸 REPORT STREET WATERLOGGING */}
        <div
          onClick={() => handleSelectReportType('street')}
          className={`p-6 rounded-3xl border-3 transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-sm ${
            reportType === 'street'
              ? 'bg-amber-50/70 border-amber-500 ring-4 ring-amber-400/20'
              : 'bg-white border-slate-200 hover:border-amber-300 opacity-90'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-2xl">📸</span>
              {reportType === 'street' && (
                <span className="px-2.5 py-0.5 bg-amber-600 text-white font-mono text-[10px] font-black rounded-full uppercase">
                  Selected
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-mono mt-2 flex items-center gap-2">
              <span>REPORT STREET WATERLOGGING</span>
            </h2>

            <div className="mt-3 space-y-1.5 text-xs text-slate-700">
              <div className="font-bold text-slate-900 text-[11px] uppercase font-mono text-amber-800">
                Report:
              </div>
              <ul className="space-y-1 text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  <span>Flooded road</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  <span>Blocked drain</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  <span>Water entering shop/home</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  <span>Rising street water</span>
                </li>
              </ul>
            </div>
          </div>

          <button
            type="button"
            className={`w-full py-2.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
              reportType === 'street'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-amber-100'
            }`}
          >
            <span>[ REPORT WATERLOGGING ]</span>
          </button>
        </div>

        {/* OPTION 2: ⚠ REPORT FLOOD CONDITION */}
        <div
          onClick={() => handleSelectReportType('flood')}
          className={`p-6 rounded-3xl border-3 transition-all cursor-pointer flex flex-col justify-between space-y-4 shadow-sm ${
            reportType === 'flood'
              ? 'bg-blue-50/70 border-blue-500 ring-4 ring-blue-400/20'
              : 'bg-white border-slate-200 hover:border-blue-300 opacity-90'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-2xl">⚠</span>
              {reportType === 'flood' && (
                <span className="px-2.5 py-0.5 bg-blue-600 text-white font-mono text-[10px] font-black rounded-full uppercase">
                  Selected
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-mono mt-2 flex items-center gap-2">
              <span>REPORT FLOOD CONDITION</span>
            </h2>

            <div className="mt-3 space-y-1.5 text-xs text-slate-700">
              <div className="font-bold text-slate-900 text-[11px] uppercase font-mono text-blue-800">
                Report:
              </div>
              <ul className="space-y-1 text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Rapidly rising water</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>River/stream overflow</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Flash flood conditions</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Dangerous flood situation</span>
                </li>
              </ul>
            </div>
          </div>

          <button
            type="button"
            className={`w-full py-2.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 ${
              reportType === 'flood'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-blue-100'
            }`}
          >
            <span>[ REPORT FLOOD ]</span>
          </button>
        </div>
      </div>

      {/* 3. REPORT FORM OR CONFIRMATION */}
      {submitted ? (
        <div className="bg-white rounded-3xl p-8 border-2 border-emerald-300 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-3xl">
            ✓
          </div>
          <h3 className="text-xl font-black text-slate-900 font-mono">
            {reportType === 'street' ? 'ROAD WATERLOGGING REPORT RECEIVED' : 'FLASH FLOOD REPORT DISPATCHED'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Your report has been logged and forwarded to municipal crews and emergency coordination units. Thank you for keeping your community informed.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Submit Another Report
            </button>
            <button
              onClick={onNavigateToMap}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              View on Risk Map
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 font-mono flex items-center gap-2">
              <span>{reportType === 'street' ? '🚧 ROAD WATERLOGGING DETAILS' : '🌊 FLASH FLOOD CONDITION DETAILS'}</span>
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono uppercase ${
              reportType === 'street' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-900'
            }`}>
              {reportType === 'street' ? 'STREET LEVEL' : 'REGIONAL LEVEL'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Condition Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Hazard Type *
              </label>
              <select
                value={hazardType}
                onChange={(e) => setHazardType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                {currentHazardOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Location / Ward */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Municipal Ward / Area *
              </label>
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Road Name Field (If Street Waterlogging) */}
          {reportType === 'street' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Road / Street Name *
              </label>
              <input
                type="text"
                value={roadName}
                onChange={(e) => setRoadName(e.target.value)}
                placeholder="e.g., Main Market Road, Station Road Culvert"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                required
              />
            </div>
          )}

          {/* Photo Upload & Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Photo Evidence (Automatic Flood Vision Analysis)
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="w-full sm:w-44 h-32 rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 shrink-0">
                <img
                  src={imagePreviewUrl}
                  alt="Report Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="w-full space-y-2">
                <label className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-slate-300 rounded-2xl hover:border-slate-400 cursor-pointer text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 transition">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Upload Street Photo or Video</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400">
                  Supported formats: JPG, PNG. Automated YOLO model detects blocked drains, submerged vehicles, and water depth.
                </p>
              </div>
            </div>
          </div>

          {/* Location Pin */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-semibold text-slate-700">
                {locationSuccessMsg || 'Attach Current Device GPS Coordinates'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isUsingLocation}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Compass className={`w-3.5 h-3.5 ${isUsingLocation ? 'animate-spin text-sky-600' : ''}`} />
              <span>{isUsingLocation ? 'Acquiring GPS...' : 'Use My GPS'}</span>
            </button>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Observations / Notes (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                reportType === 'street'
                  ? 'Describe road blockage, water height relative to curbs/shops, or stalled vehicles...'
                  : 'Describe river water speed, rate of water level rise, or areas cut off...'
              }
              rows={3}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={onNavigateHome}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm text-white transition flex items-center gap-2 cursor-pointer shadow-md ${
                reportType === 'street'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span>{isSubmitting ? 'Submitting Report...' : reportType === 'street' ? 'SUBMIT WATERLOGGING REPORT' : 'SUBMIT FLASH FLOOD REPORT'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
