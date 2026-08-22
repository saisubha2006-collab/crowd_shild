import React from 'react';
import { EventItem, Zone, SOSAlert, IncidentReport, CCTVCamera } from '../../types';
import { Users, AlertTriangle, AlertOctagon, ShieldAlert, Radio, Flame, ArrowUpRight, CheckCircle2, TrendingUp, Sparkles, Volume2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { RiskScoreBadge } from '../shared/RiskScoreBadge';

interface Props {
  event: EventItem;
  zones: Zone[];
  sosAlerts: SOSAlert[];
  incidents: IncidentReport[];
  cameras: CCTVCamera[];
  onNavigateTab: (tab: 'CCTV' | 'HEATMAP' | 'ANALYTICS' | 'ALERTS' | 'EVENTS' | 'VOLUNTEERS' | 'REPORTS') => void;
  onOpenBroadcast: () => void;
}

const mockTrendData = [
  { time: '04:00 AM', crowd: 24000, risk: 20 },
  { time: '06:00 AM', crowd: 48000, risk: 35 },
  { time: '08:00 AM', crowd: 72000, risk: 48 },
  { time: '10:00 AM', crowd: 98000, risk: 65 },
  { time: '12:00 PM', crowd: 115000, risk: 78 },
  { time: '02:00 PM', crowd: 128450, risk: 84 },
  { time: '04:00 PM (Pred)', crowd: 142000, risk: 91 },
];

export const AdminOverview: React.FC<Props> = ({
  event,
  zones,
  sosAlerts,
  incidents,
  cameras,
  onNavigateTab,
  onOpenBroadcast,
}) => {
  const criticalZones = zones.filter(z => z.riskLevel === 'CRITICAL' || z.riskLevel === 'HIGH').length;
  const activeSos = sosAlerts.filter(s => s.status !== 'RESOLVED').length;

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Headline Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
              COMMAND & CONTROL ENGINE ACTIVE
            </span>
          </div>
          <h2 className="text-2xl font-black text-white">{event.name} Dashboard</h2>
          <p className="text-xs text-slate-400">
            Real-Time AI Person Counting, Flow Dynamics & Stampede Risk Prediction
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenBroadcast}
            className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg transition"
          >
            <Volume2 className="w-4 h-4" />
            <span>PA Audio Broadcast</span>
          </button>
          <button
            onClick={() => onNavigateTab('REPORTS')}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 transition"
          >
            <span>Export Official PDF Report</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total People */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Live Crowd Count</span>
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-white">{event.liveCrowdCount.toLocaleString()}</span>
            <span className="text-xs text-amber-400 font-semibold block mt-0.5">
              Cap: {event.capacity.toLocaleString()} (91% density)
            </span>
          </div>
        </div>

        {/* AI Stampede Risk Score */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">AI Risk Prediction</span>
            <RiskScoreBadge score={event.riskScore} size="sm" showLabel={false} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-red-400">{event.riskScore}</span>
            <span className="text-xs text-red-300 font-bold">/100 CRITICAL</span>
          </div>
        </div>

        {/* High Risk Zones */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Critical Heat Zones</span>
            <div className="w-8 h-8 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-orange-400">{criticalZones} Zones</span>
            <span className="text-xs text-slate-400 block mt-0.5">East Gate 2 & Sangam Deck 3</span>
          </div>
        </div>

        {/* Active SOS Alerts */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active SOS Rescues</span>
            <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-red-500">{activeSos} Dispatches</span>
            <span className="text-xs text-emerald-400 font-medium block mt-0.5">Responders en route</span>
          </div>
        </div>
      </div>

      {/* Main Graph & AI Decision Support */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Crowd Trend Graph */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Crowd Growth vs Stampede Risk Trend
              </h3>
              <p className="text-xs text-slate-400">30-Minute LSTM Predictive Forecast Model</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-800">
              LIVE SENSOR STREAM
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrendData}>
                <defs>
                  <linearGradient id="colorCrowd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="crowd" stroke="#3B82F6" fillOpacity={1} fill="url(#colorCrowd)" name="People Count" />
                <Area type="monotone" dataKey="risk" stroke="#EF4444" fillOpacity={1} fill="url(#colorRisk)" name="Risk Score (/100)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Decision Support Panel */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-3">
              <Sparkles className="w-5 h-5" />
              <span>AI Autonomous Decision Recommendations</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-2xl text-xs space-y-1">
                <span className="font-bold text-red-300 block">⚠️ CRITICAL BOTTLENECK DETECTED</span>
                <p className="text-slate-300">
                  Location: East Gate 2 Alley Junction (Density 6.8 p/m²).
                </p>
                <div className="pt-1 text-[11px] font-bold text-white">
                  Recommended Action: Open Backup Gate 4 & Broadcast Re-routing Audio.
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-1.5">
                <span className="font-bold text-slate-200">Recommended Directives:</span>
                <ul className="space-y-1 text-slate-400 text-[11px]">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Divert 40% incoming crowd to West Corridor (Gate 5)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Deploy Volunteer Team Delta to clear stairs at Ghat 3</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('ALERTS')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <span>Open Alert Dispatch Console</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
