import React from 'react';
import { EventItem, Zone } from '../../types';
import { TrendingUp, Clock, AlertTriangle, Activity, BarChart2, Zap } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props {
  event: EventItem;
  zones: Zone[];
}

const hourlyFlowData = [
  { hour: '04 AM', inflow: 12000, outflow: 4000, risk: 20 },
  { hour: '06 AM', inflow: 28000, outflow: 8000, risk: 35 },
  { hour: '08 AM', inflow: 42000, outflow: 15000, risk: 50 },
  { hour: '10 AM', inflow: 58000, outflow: 22000, risk: 68 },
  { hour: '12 PM', inflow: 64000, outflow: 31000, risk: 78 },
  { hour: '02 PM', inflow: 71000, outflow: 42000, risk: 84 },
  { hour: '04 PM (Peak)', inflow: 85000, outflow: 48000, risk: 92 },
  { hour: '06 PM', inflow: 62000, outflow: 65000, risk: 60 },
  { hour: '08 PM', inflow: 30000, outflow: 75000, risk: 30 },
];

export const AdminAnalytics: React.FC<Props> = ({ event, zones }) => {
  return (
    <div className="space-y-6 text-slate-100">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-400" />
            Crowd Flow Dynamics & Predictive Density Analytics
          </h2>
          <p className="text-xs text-slate-400">
            Real-time flow monitoring and historical telemetry for peak hours and bottleneck forecasting
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Inflow vs Outflow */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Hourly Inflow vs Outflow Rate
              </h3>
              <p className="text-xs text-slate-400">Net crowd accumulation per hour</p>
            </div>
            <span className="text-[10px] font-mono bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
              PEAK: 04:00 PM
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }} />
                <Bar dataKey="inflow" fill="#3B82F6" name="Inflow Rate" />
                <Bar dataKey="outflow" fill="#10B981" name="Outflow Rate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottleneck Probability Index */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Zap className="w-4 h-4 text-amber-400" /> Zone Bottleneck Probability Matrix
            </h3>

            <div className="space-y-3 pt-3">
              {zones.map((z) => (
                <div key={z.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{z.name}</span>
                    <span className="text-amber-300 font-bold">{z.riskScore}% Probability</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        z.riskScore >= 80 ? 'bg-red-500' : z.riskScore >= 60 ? 'bg-orange-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${z.riskScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">{z.statusReason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
