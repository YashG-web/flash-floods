import React from 'react';
import type { CitizenReport } from '../types';
import { useTranslation } from '../services/LanguageContext';
import { Camera, MapPin, Clock, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

interface CitizenReportFeedProps {
  reports: CitizenReport[];
  onOpenReportModal: () => void;
}

export const CitizenReportFeed: React.FC<CitizenReportFeedProps> = ({
  reports,
  onOpenReportModal
}) => {
  const { tr } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-sky-600" />
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
              {tr('Citizen Waterlogging Intelligence Feed')}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {tr('Crowd-verified photo reports powering drainage choke and localized inundation diagnostics')}
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{tr('+ Submit Field Report')}</span>
        </button>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 hover:border-slate-300 transition flex flex-col sm:flex-row gap-3"
          >
            {/* Thumbnail */}
            <div className="w-full sm:w-28 h-24 rounded-lg overflow-hidden shrink-0 bg-slate-200 border border-slate-300 relative">
              <img
                src={report.image_url}
                alt={report.description}
                className="w-full h-full object-cover"
              />
              <span className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase text-white ${
                report.severity === 'CRITICAL' ? 'bg-red-600' : 'bg-amber-600'
              }`}>
                {tr(report.severity)}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-600 shrink-0" />
                  {tr(report.location_name)}
                </span>
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3" />
                  {report.timestamp}
                </span>
              </div>

              <p className="text-slate-700 mb-2 leading-relaxed">
                "{tr(report.description)}"
              </p>

              {/* Vision tags */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">{tr('Vision Detections:')}</span>
                {report.yolo_detections && report.yolo_detections.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-mono text-[10px] font-semibold"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    {tr(tag.label.replace(/_/g, ' '))} ({tag.conf}%)
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
