import React from 'react';
import type { LocationData } from '../types';
import { Building2, Home, Users, School, Hospital, ShieldCheck, MapPin } from 'lucide-react';

interface ImpactAssessmentProps {
  location: LocationData;
}

export const ImpactAssessmentView: React.FC<ImpactAssessmentProps> = ({ location }) => {
  const impact = location.impact_summary || {
    properties: 37,
    residents: 128,
    roads: 2,
    schools: 1,
    hospitals: 1,
    bridges: 1
  };

  const prob = location.risk_probability || 50;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-widest bg-sky-100 px-2 py-0.5 rounded">
              Spatial Exposure Assessment
            </span>
            <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-semibold">
              SIMULATED GIS OVERLAYS
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Potential Infrastructure & Population Impact: {location.name}
          </h2>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-slate-400 uppercase block">Active Hazard Score</span>
          <span className="text-2xl font-black text-red-600">{prob}% Risk</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <Home className="w-5 h-5 text-sky-600 mx-auto mb-1" />
          <div className="text-2xl font-black text-slate-900">{impact.properties}</div>
          <div className="text-xs font-bold text-slate-500 uppercase mt-0.5">Properties</div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <Users className="w-5 h-5 text-red-600 mx-auto mb-1" />
          <div className="text-2xl font-black text-red-600">{impact.residents}</div>
          <div className="text-xs font-bold text-slate-500 uppercase mt-0.5">Residents</div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <Building2 className="w-5 h-5 text-amber-600 mx-auto mb-1" />
          <div className="text-2xl font-black text-slate-900">{impact.roads}</div>
          <div className="text-xs font-bold text-slate-500 uppercase mt-0.5">Roads</div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <School className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
          <div className="text-2xl font-black text-slate-900">{impact.schools}</div>
          <div className="text-xs font-bold text-slate-500 uppercase mt-0.5">Schools</div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <Hospital className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
          <div className="text-2xl font-black text-slate-900">{impact.hospitals}</div>
          <div className="text-xs font-bold text-slate-500 uppercase mt-0.5">Hospitals</div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <ShieldCheck className="w-5 h-5 text-purple-600 mx-auto mb-1" />
          <div className="text-2xl font-black text-slate-900">{impact.bridges}</div>
          <div className="text-xs font-bold text-slate-500 uppercase mt-0.5">Bridges</div>
        </div>
      </div>

      {/* Critical Facilities at Risk */}
      <div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Identified Critical Facilities within Risk Envelope
        </h3>
        <div className="space-y-2">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-900">Govt Girls Senior Secondary School</span>
              <span className="text-slate-500 ml-2">(Capacity: 350 Students)</span>
            </div>
            <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold uppercase text-[10px]">
              Evacuation Stage 1
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-900">Station Feeder 11kV Substation</span>
              <span className="text-slate-500 ml-2">(Substation Inundation Risk)</span>
            </div>
            <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded font-bold uppercase text-[10px]">
              Isolate Feeder #3
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-900">Station Nullah Culvert Bridge</span>
              <span className="text-slate-500 ml-2">(Surcharged / Choked Inlet)</span>
            </div>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold uppercase text-[10px]">
              Barricade Approach
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
