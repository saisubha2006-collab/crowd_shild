import React, { useState } from 'react';
import {
  MapPin, Compass, LocateFixed, RefreshCw, Radio, CheckCircle2,
  Navigation, Shield, ArrowUpRight, Zap, ExternalLink, Activity, Sparkles
} from 'lucide-react';
import { ExactDeviceState } from '../../utils/deviceLocationManager';
import { useDevice } from '../os/DeviceContext';

interface Props {
  deviceState: ExactDeviceState | null;
  onRefreshGPS: () => void;
  isRefreshing?: boolean;
  onNavigateToMap?: () => void;
}

export const DeviceGPSCard: React.FC<Props> = ({
  deviceState,
  onRefreshGPS,
  isRefreshing = false,
  onNavigateToMap,
}) => {
  const { isLiquidUI, isFluentUI } = useDevice();
  const [copied, setCopied] = useState(false);

  if (!deviceState) {
    return (
      <div className="clean-card p-4 border border-cyan-400/50 bg-slate-900/90 flex items-center justify-between text-xs text-slate-200 animate-pulse shadow-[0_0_30px_rgba(6,182,212,0.25)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-400/40 shadow-inner">
            <Radio className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <span className="font-extrabold text-white block text-sm">Acquiring Exact Device GPS Location...</span>
            <span className="text-[11px] text-cyan-300">Locking onto hardware satellites & cell triangulation</span>
          </div>
        </div>
        <button
          onClick={onRefreshGPS}
          className="btn-glow-cyan px-3.5 py-1.5 rounded-xl text-xs font-black shadow-lg"
        >
          Locate Now
        </button>
      </div>
    );
  }

  const lat = deviceState.coords[0];
  const lon = deviceState.coords[1];
  const coordsFormatted = `${lat.toFixed(5)}° N, ${lon.toFixed(5)}° E`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${lat}, ${lon}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-4 sm:p-5 rounded-3xl border shadow-2xl transition-all relative overflow-hidden ${
      isLiquidUI
        ? 'liquid-glass border-cyan-300/40 shadow-[0_20px_50px_rgba(6,182,212,0.2)]'
        : isFluentUI
        ? 'fluent-acrylic border-[#334668] bg-[#0e1626]'
        : 'clean-card border-cyan-500/40 shadow-[0_15px_40px_rgba(6,182,212,0.15)]'
    }`}>
      {/* Ambient glowing holographic corner flares */}
      <div className="absolute -top-14 -right-14 w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-14 -left-14 w-40 h-40 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between gap-2.5 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-sky-500 to-blue-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-cyan-500/30 shrink-0 ring-2 ring-white/30">
            <LocateFixed className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <span>Exact Device Location</span>
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              </h3>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase shadow-sm ${
                deviceState.source === 'GPS_HARDWARE'
                  ? 'badge-neon-emerald'
                  : 'badge-neon-cyan'
              }`}>
                {deviceState.source === 'GPS_HARDWARE' ? '🛰️ Live Satellite Lock' : '📡 Network Triangulated'}
              </span>
            </div>
            <span className="text-[10px] text-slate-300 flex items-center gap-1.5 font-mono mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-ping" />
              <span>Real-time GPS • Synced {deviceState.timestamp}</span>
            </span>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onRefreshGPS}
            disabled={isRefreshing}
            className={`px-3 py-1.5 rounded-xl border text-xs font-black transition flex items-center gap-1.5 active:scale-95 shadow-md ${
              isRefreshing
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'btn-glow-cyan'
            }`}
            title="Recenter & Re-query Exact GPS Location"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden xs:inline text-[11px]">{isRefreshing ? 'Locating...' : 'Recenter GPS'}</span>
          </button>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition shadow-lg active:scale-95 border border-white/20"
            title="Open in Google Maps"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Location Details Grid */}
      <div className="pt-3.5 space-y-3 text-xs">
        {/* Full Street / Area Address */}
        <div className="p-3 rounded-2xl bg-slate-950/70 backdrop-blur-xl border border-white/15 flex items-start gap-3 shadow-inner">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <MapPin className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[9px] text-cyan-300 font-extrabold block uppercase tracking-wider">
              Exact Address & Neighborhood:
            </span>
            <p className="text-white font-bold text-xs sm:text-sm leading-snug break-words mt-0.5">
              {deviceState.address.displayName}
            </p>
            {(deviceState.address.city || deviceState.address.state) && (
              <span className="text-[11px] text-cyan-200 font-semibold block mt-1">
                {[deviceState.address.city, deviceState.address.state, deviceState.address.country].filter(Boolean).join(', ')}
              </span>
            )}
          </div>
        </div>

        {/* Coordinates & Accuracy Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {/* Latitude / Longitude */}
          <div className="bg-slate-950/70 backdrop-blur-xl p-2.5 rounded-2xl border border-white/10 shadow-inner">
            <span className="text-[9px] text-slate-400 font-bold block uppercase">Coordinates</span>
            <button
              onClick={handleCopyCoords}
              className="text-[11px] font-mono font-black text-cyan-300 hover:text-white transition flex items-center gap-1.5 truncate w-full text-left mt-0.5"
              title="Click to copy exact coordinates"
            >
              <span className="truncate">{coordsFormatted}</span>
              {copied ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <span className="text-[8px] bg-white/10 px-1 py-0.2 rounded text-slate-300 shrink-0">COPY</span>
              )}
            </button>
          </div>

          {/* GPS Accuracy */}
          <div className="bg-slate-950/70 backdrop-blur-xl p-2.5 rounded-2xl border border-white/10 shadow-inner">
            <span className="text-[9px] text-slate-400 font-bold block uppercase">Accuracy Radius</span>
            <span className="text-[11px] font-mono font-black text-emerald-400 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,1)]" />
              <span>{deviceState.accuracyMeters !== null ? `± ${deviceState.accuracyMeters} meters` : 'Precision High'}</span>
            </span>
          </div>

          {/* Speed / Heading */}
          <div className="bg-slate-950/70 backdrop-blur-xl p-2.5 rounded-2xl border border-white/10 shadow-inner col-span-2 sm:col-span-1">
            <span className="text-[9px] text-slate-400 font-bold block uppercase">Motion & Hardware</span>
            <span className="text-[11px] font-mono font-black text-slate-200 mt-0.5 block">
              {deviceState.speed !== null && deviceState.speed > 0
                ? `⚡ ${(deviceState.speed * 3.6).toFixed(1)} km/h`
                : 'Stationary • Online'}
            </span>
          </div>
        </div>

        {/* Quick Map Action */}
        {onNavigateToMap && (
          <button
            onClick={onNavigateToMap}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-slate-900/90 to-blue-950/80 hover:from-cyan-900 hover:to-blue-900 border border-cyan-400/40 text-cyan-200 font-black text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-cyan-950/40"
          >
            <Navigation className="w-4 h-4 text-cyan-300" />
            <span>View Surrounding Hospitals, Fuel, Hotels, Police & Bus Stops on Map</span>
          </button>
        )}
      </div>
    </div>
  );
};
