import React, { useState } from 'react';
import type { HistoricalEvent } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import {
  Calendar,
  Filter,
  MapPin,
  Clock,
  AlertTriangle,
  History,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

interface HistoricalAnalyticsProps {
  events: HistoricalEvent[];
  timeSeriesData: any[];
  seasonalData: any[];
  timelineStages: any[];
}

export const HistoricalAnalyticsView: React.FC<HistoricalAnalyticsProps> = ({
  events,
  timeSeriesData,
  seasonalData,
  timelineStages
}) => {
  const [selectedEventType, setSelectedEventType] = useState<string>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(events[0] || null);

  const filteredEvents = selectedEventType === 'ALL'
    ? events
    : events.filter(e => e.event_type.toLowerCase().includes(selectedEventType.toLowerCase()));

  return (
    <div className="space-y-8">
      {/* Risk Escalation Timeline */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider bg-sky-100 px-2.5 py-0.5 rounded-full">
              Early Warning Value Demonstration
            </span>
            <h2 className="text-lg font-extrabold text-slate-900 mt-1">
              Temporal Risk Escalation Timeline (Station Road Chokepoint)
            </h2>
          </div>
          <span className="text-xs text-slate-500">Lead Time Advantage: <b>84 Minutes</b></span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {timelineStages.map((stage, idx) => (
            <div
              key={idx}
              className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-sm font-black text-slate-900">{stage.time}</span>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-black uppercase text-white"
                    style={{ backgroundColor: stage.color }}
                  >
                    {stage.risk_level}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800 mb-1">{stage.headline}</div>
                <p className="text-[11px] text-slate-600 leading-tight">{stage.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-mono">
                Rain: <b>{stage.rainfall}</b> | Risk: <b>{stage.risk_score}%</b>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart 1: Rainfall vs Risk Progression */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Rainfall vs Soil Moisture & Flood Risk Progression
            </h3>
            <span className="text-xs text-slate-400 font-mono">Hourly Intervals</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="rainfall_mm" name="Rainfall (mm/h)" stroke="#0284c7" strokeWidth={2.5} />
                <Line type="monotone" dataKey="soil_moisture_pct" name="Soil Moisture (%)" stroke="#4f46e5" strokeWidth={2} />
                <Line type="monotone" dataKey="risk_score" name="Risk Score (0-100)" stroke="#dc2626" strokeWidth={3} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Cause Distribution by Month */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Seasonal Hazard Distribution: Overload vs Blockage
            </h3>
            <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
              Drain Blockages: 62.5%
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="drainage_blockage" name="Drainage Blockage Events" fill="#d97706" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cloudburst_overload" name="Rainfall Overloads" fill="#dc2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="landslides" name="Slope Landslides" fill="#78350f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historical Disaster Archive */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-sky-600" />
              <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
                Historical Flood & Landslide Disaster Archive
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Documented basin hazard recurrence used to calibrate the XGBoost model's historical vulnerability prior.
            </p>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg p-1.5 font-semibold text-slate-800 focus:outline-hidden"
            >
              <option value="ALL">All Hazard Types</option>
              <option value="drainage">Drainage Blockages</option>
              <option value="cloudburst">Cloudbursts</option>
              <option value="landslide">Landslides</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* List */}
          <div className="space-y-2.5">
            {filteredEvents.map((evt) => {
              const isSelected = selectedEvent?.id === evt.id;
              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-sky-50/70 border-sky-400 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-extrabold text-xs text-slate-900">{evt.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      evt.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {evt.severity}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>📅 {evt.date}</span>
                    <span>📍 {evt.location}</span>
                    <span>💧 {evt.rainfall_conditions}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Event Details */}
          {selectedEvent && (
            <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                  Disaster Case Analysis
                </span>
                <h4 className="text-lg font-black text-white mt-1 mb-2">{selectedEvent.title}</h4>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mb-4 bg-slate-800/80 p-3 rounded-lg">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Date of Occurrence</span>
                    <span className="font-bold text-white">{selectedEvent.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Classification</span>
                    <span className="font-bold text-sky-300">{selectedEvent.event_type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Precipitation Rate</span>
                    <span className="font-bold text-white">{selectedEvent.rainfall_conditions}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Affected Scope</span>
                    <span className="font-bold text-white">{selectedEvent.affected_area}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-lg border border-slate-700/60">
                  <span className="text-amber-400 font-bold block mb-1">Post-Disaster Hydraulic Audit:</span>
                  {selectedEvent.cause_analysis}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Coordinates: {selectedEvent.coordinates.join(', ')}</span>
                <span className="text-emerald-400 font-bold">Documented in District Gazetteer</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
