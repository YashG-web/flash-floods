import React from 'react';
import type { IoTSensor } from '../types';
import { Cpu, Radio, Droplets, TrendingUp, AlertCircle, Waves, Gauge } from 'lucide-react';

interface LiveSensorDashboardProps {
  sensors: IoTSensor[];
  dataOrigin?: string;
  onRefresh?: () => void;
}

export const LiveSensorDashboard: React.FC<LiveSensorDashboardProps> = ({
  sensors,
  dataOrigin = 'DEMO / SIMULATED SENSOR TELEMETRY',
  onRefresh
}) => {
  const getIconForType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'rain gauge':
        return <Droplets className="w-5 h-5 text-sky-600" />;
      case 'soil moisture':
        return <Gauge className="w-5 h-5 text-indigo-600" />;
      case 'water level':
        return <Waves className="w-5 h-5 text-blue-600" />;
      case 'drainage sensor':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'slope sensor':
        return <TrendingUp className="w-5 h-5 text-red-600" />;
      default:
        return <Radio className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-600" />
            <h2 className="font-extrabold text-base text-slate-900 uppercase tracking-wider">
              IoT Sensor Telemetry Grid
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time field telemetry across river gauges, rainfall buckets, soil TDR sensors, and drainage ultrasonic Doppler meters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-300">
            ● {dataOrigin}
          </span>
        </div>
      </div>

      {/* Sensor Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map((sensor) => {
          const isCritical = sensor.status === 'CRITICAL';
          const isHigh = sensor.status === 'HIGH';
          const isModerate = sensor.status === 'MODERATE';

          return (
            <div
              key={sensor.id}
              className={`bg-white rounded-2xl p-5 border-2 shadow-xs transition hover:shadow-md flex flex-col justify-between ${
                isCritical
                  ? 'border-red-400 bg-red-50/15'
                  : isHigh
                  ? 'border-orange-300 bg-orange-50/15'
                  : isModerate
                  ? 'border-amber-300 bg-amber-50/15'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      {getIconForType(sensor.type)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {sensor.type}
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                        {sensor.name}
                      </h3>
                    </div>
                  </div>

                  <span
                    className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase text-white shadow-xs"
                    style={{ backgroundColor: sensor.status_color }}
                  >
                    {sensor.status}
                  </span>
                </div>

                {/* Main telemetry reading */}
                <div className="my-4">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Current Value</span>
                  <div
                    className="text-2xl font-black font-mono tracking-tight"
                    style={{ color: sensor.status_color }}
                  >
                    {sensor.current_value}
                  </div>
                </div>

                {/* Details grid */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Normal Range:</span>
                    <span className="font-semibold text-slate-900">{sensor.normal_range}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trend:</span>
                    <span className="font-bold text-slate-900">{sensor.trend}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Synced:</span>
                    <span className="text-slate-500 font-mono">{sensor.last_update}</span>
                  </div>
                </div>
              </div>

              {/* Simulation transparency badge */}
              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Node ID: {sensor.id}</span>
                <span className="font-semibold text-amber-700">Simulated Telemetry Probe</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
