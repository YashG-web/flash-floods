import React, { useState } from 'react';
import { apiClient } from '../api/client';
import type { ImageAnalysisResponse, LocationData } from '../types';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  X,
  FileImage,
  Sparkles,
  Cpu
} from 'lucide-react';

interface CitizenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations: LocationData[];
  onReportSubmitted: () => void;
}

export const CitizenReportModal: React.FC<CitizenReportModalProps> = ({
  isOpen,
  onClose,
  locations,
  onReportSubmitted
}) => {
  const [selectedLocationId, setSelectedLocationId] = useState('ward-12');
  const [severity, setSeverity] = useState<'CRITICAL' | 'HIGH' | 'MODERATE'>('HIGH');
  const [description, setDescription] = useState('Water entering shops on Station Road. Main culvert inlet clogged with plastic garbage.');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('/assets/sample_waterlog.jpg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allowDemoSimulation, setAllowDemoSimulation] = useState(true);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      runYoloAnalysis(file);
    }
  };

  const runYoloAnalysis = async (fileToAnalyze?: File) => {
    setIsAnalyzing(true);
    try {
      let file = fileToAnalyze || imageFile;
      if (!file) {
        // Fetch the default sample image blob
        const res = await fetch('/assets/sample_waterlog.jpg');
        const blob = await res.blob();
        file = new File([blob], 'sample_waterlog.jpg', { type: 'image/jpeg' });
      }

      const res = await apiClient.analyzeImage(file, allowDemoSimulation);
      setAnalysisResult(res);
    } catch (err) {
      console.error('YOLO Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const loc = locations.find(l => l.id === selectedLocationId);
      await apiClient.submitCitizenReport({
        location_id: selectedLocationId,
        location_name: loc ? loc.name : 'Station Road',
        description,
        severity,
        image_url: imagePreviewUrl,
        latitude: loc ? loc.coordinates[0] : 30.0920,
        longitude: loc ? loc.coordinates[1] : 78.2690
      });

      onReportSubmitted();
      onClose();
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Crowd-Sourced Waterlogging Report</h3>
              <p className="text-xs text-slate-400">Dispatch field report with YOLO Vision hazard verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Integration Interface Status Notice */}
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-medium">
            <Cpu className="w-3.5 h-3.5 text-sky-600" />
            <span>YOLO Vision: <b>Integration Interface Ready for best.pt</b></span>
          </div>
          <span className="text-slate-400 text-[11px]">models/yolo_model/best.pt</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Location & Severity */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Affected Ward / Location
              </label>
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Observed Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              >
                <option value="CRITICAL">CRITICAL (Water entering homes/shops)</option>
                <option value="HIGH">HIGH (Knee-deep road waterlogging)</option>
                <option value="MODERATE">MODERATE (Ankle-deep surface ponding)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Field Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              placeholder="Describe road conditions, culvert blockages, or rising water..."
            />
          </div>

          {/* Photo Upload & YOLO Inspection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Evidence Photograph & YOLO Vision Analysis
              </label>
              <button
                type="button"
                onClick={() => runYoloAnalysis()}
                disabled={isAnalyzing}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-sky-600" />
                <span>{isAnalyzing ? 'Analyzing with YOLO...' : 'Run YOLO Vision Inference'}</span>
              </button>
            </div>

            {/* Photo preview container with detection boxes overlay */}
            <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-950 h-56 flex items-center justify-center">
              <img
                src={imagePreviewUrl}
                alt="Waterlog sample"
                className="w-full h-full object-contain"
              />

              {/* Bounding boxes overlay */}
              {analysisResult && analysisResult.detections && analysisResult.detections.map((det, idx) => (
                <div
                  key={idx}
                  className="absolute border-2 border-amber-400 bg-amber-400/20 rounded-xs pointer-events-none transition"
                  style={{
                    left: `${det.box.xmin_pct}%`,
                    top: `${det.box.ymin_pct}%`,
                    width: `${det.box.width_pct}%`,
                    height: `${det.box.height_pct}%`
                  }}
                >
                  <span className="absolute -top-5 left-0 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-xs whitespace-nowrap shadow-xs">
                    {det.class_name} ({det.confidence}%)
                  </span>
                </div>
              ))}
            </div>

            {/* File selection and YOLO status */}
            <div className="mt-2 flex items-center justify-between gap-3 text-xs">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold border border-slate-300 transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Select New Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {analysisResult && (
                <div className="text-[11px] text-right">
                  <span className={`font-bold ${analysisResult.model_connected ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {analysisResult.status_message}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              {isSubmitting ? 'Logging Report...' : 'Submit to Command Center'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
