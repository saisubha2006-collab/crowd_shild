import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { UserProfile, EventItem, Zone } from '../../types';
import { RiskScoreBadge } from '../shared/RiskScoreBadge';
import {
  MapPin, Shield, AlertOctagon, Navigation, PhoneCall, Volume2,
  Users, CheckCircle2, Radar, Activity, Zap, Mic, ArrowRight, Phone,
  Sparkles, HeartPulse, Fuel, Hotel, Wrench, Milestone, Bus, Compass,
  ExternalLink, LocateFixed, Camera, Eye, Radio, RefreshCw
} from 'lucide-react';
import { calculateDistanceKm, formatDistance } from '../../utils/geoUtils';
import { CitizenTab } from './CitizenAppContainer';
import { DeviceGPSCard } from '../shared/DeviceGPSCard';
import { NearTenMeterPhoneRadar } from '../shared/NearTenMeterPhoneRadar';
import { ExactDeviceState } from '../../utils/deviceLocationManager';

interface Props {
  user: UserProfile;
  event: EventItem;
  zones: Zone[];
  onNavigate: (tab: CitizenTab) => void;
  onOpenSOS: () => void;
  onOpenBroadcast: () => void;
  onOpenOtpModal: () => void;
  exactDeviceState?: ExactDeviceState | null;
  onRefreshGPS?: () => void;
  isRefreshingGPS?: boolean;
}

export const CitizenHome: React.FC<Props> = ({
  user,
  event,
  zones,
  onNavigate,
  onOpenSOS,
  onOpenBroadcast,
  onOpenOtpModal,
  exactDeviceState = null,
  onRefreshGPS = () => {},
  isRefreshingGPS = false,
}) => {
  const [isSafeChecked, setIsSafeChecked] = useState(false);
  const [liveCoords, setLiveCoords] = useState<[number, number]>(
    exactDeviceState?.coords || user.coordinates || [28.6139, 77.2090]
  );

  useEffect(() => {
    if (exactDeviceState?.coords) {
      setLiveCoords(exactDeviceState.coords);
    }
  }, [exactDeviceState]);

  // Acquire real browser geolocation
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLiveCoords([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Nearest zone calculation
  const nearestZoneWithDist = zones.map((z) => {
    const distKm = calculateDistanceKm(liveCoords[0], liveCoords[1], z.center[0], z.center[1]);
    return { ...z, distKm, distMeters: Math.round(distKm * 1000) };
  }).sort((a, b) => a.distKm - b.distKm);

  const nearestZone = nearestZoneWithDist[0] || zones[0];

  const handleMarkSafe = () => {
    setIsSafeChecked(true);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#10b981', '#06b6d4', '#3b82f6'],
    });
  };

  return (
    <div className="space-y-3.5 text-slate-100">
      {/* 1. EXACT DEVICE LIVE GPS & ADDRESS BANNER */}
      <DeviceGPSCard
        deviceState={exactDeviceState}
        onRefreshGPS={onRefreshGPS}
        isRefreshing={isRefreshingGPS}
        onNavigateToMap={() => onNavigate('MAP')}
      />

      {/* 2. 10-METER NEAR-FIELD PHONE RADAR & AUTOMATIC DEVICE DISCOVERY */}
      <NearTenMeterPhoneRadar
        onMarkSafe={handleMarkSafe}
        isSafeChecked={isSafeChecked}
      />

      {/* 4. MAIN FAST ACTION GRID (1-Tap SOS, Safe Evacuation, Nearby Services, Live Systems, AI Vision Camera) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* 1-Tap SOS Emergency */}
        <button
          onClick={onOpenSOS}
          className="p-4 bg-gradient-to-br from-red-600 via-rose-600 to-red-800 hover:from-red-500 hover:to-rose-500 rounded-3xl text-left text-white shadow-xl shadow-red-950/50 transition active:scale-95 flex flex-col justify-between h-32 border border-red-300/40 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition pointer-events-none" />
          <div className="flex items-center justify-between w-full relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <AlertOctagon className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="text-[9px] uppercase font-black tracking-wider bg-black/40 px-2.5 py-1 rounded-full border border-white/20 text-red-100">
              ⚡ 1-Tap SOS
            </span>
          </div>
          <div className="relative z-10">
            <span className="text-sm sm:text-base font-black block text-white drop-shadow-sm">SOS Emergency</span>
            <span className="text-[11px] text-red-100 font-medium">Auto impact call & police dispatch</span>
          </div>
        </button>

        {/* Safe Route Evacuation */}
        <button
          onClick={() => onNavigate('ROUTE')}
          className="p-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 hover:from-blue-500 hover:to-indigo-500 rounded-3xl text-left text-white shadow-xl shadow-blue-950/50 transition active:scale-95 flex flex-col justify-between h-32 border border-cyan-300/40 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/20 rounded-full blur-xl group-hover:scale-150 transition pointer-events-none" />
          <div className="flex items-center justify-between w-full relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <Navigation className="w-5 h-5 text-cyan-200" />
            </div>
            <span className="text-[9px] uppercase font-black tracking-wider bg-black/40 px-2.5 py-1 rounded-full border border-cyan-400/30 text-cyan-200">
              Evacuation
            </span>
          </div>
          <div className="relative z-10">
            <span className="text-sm sm:text-base font-black block text-white drop-shadow-sm">Safe Evacuation</span>
            <span className="text-[11px] text-blue-100 font-medium">Avoid choke points & crush zones</span>
          </div>
        </button>

        {/* AI Vision Camera & Face Analysis */}
        <button
          onClick={() => onNavigate('AICAMERA')}
          className="p-4 bg-gradient-to-br from-purple-600 via-indigo-700 to-slate-900 hover:from-purple-500 hover:to-indigo-600 border border-purple-400/40 rounded-3xl text-left text-white transition active:scale-95 flex flex-col justify-between h-32 shadow-xl shadow-purple-950/40 backdrop-blur-md relative overflow-hidden group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-400/40 flex items-center justify-center shadow-inner">
              <Camera className="w-5 h-5 text-purple-200" />
            </div>
            <span className="text-[9px] uppercase font-black text-purple-200 bg-purple-950/80 px-2.5 py-1 rounded-full border border-purple-500/40">
              👤 Face & Objects
            </span>
          </div>
          <div>
            <span className="text-xs sm:text-sm font-black block text-white">AI Vision Camera</span>
            <span className="text-[11px] text-purple-200 font-medium">Recognize face, electronics & room</span>
          </div>
        </button>

        {/* Nearby Essential Services (Hospital, Petrol Pump, Hotel, Police, Garage, Toll, Bus) */}
        <button
          onClick={() => onNavigate('EVENT')}
          className="p-4 bg-gradient-to-br from-slate-900/90 via-cyan-950/60 to-slate-900/90 hover:from-slate-850 hover:to-cyan-900 border border-cyan-400/40 rounded-3xl text-left text-white transition active:scale-95 flex flex-col justify-between h-32 shadow-xl shadow-cyan-950/30 backdrop-blur-md relative overflow-hidden group"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center justify-center shadow-inner">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-[9px] uppercase font-black text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-500/40">
              7 Services
            </span>
          </div>
          <div>
            <span className="text-xs sm:text-sm font-black block text-white">Nearby Services</span>
            <span className="text-[11px] text-cyan-200 font-medium">Hospital, Fuel, Police, Hotel, Transit</span>
          </div>
        </button>

        {/* Live Systems (Renamed from Live Hazard Map) */}
        <button
          onClick={() => onNavigate('MAP')}
          className="p-4 bg-gradient-to-br from-slate-900/90 via-blue-950/60 to-slate-900/90 hover:from-slate-850 hover:to-blue-900 border border-blue-400/40 rounded-3xl text-left text-white transition active:scale-95 flex flex-col justify-between h-32 shadow-xl shadow-blue-950/30 backdrop-blur-md relative overflow-hidden group"
        >
          <div className="flex items-center justify-between w-full">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-400/40 flex items-center justify-center shadow-inner">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-[9px] uppercase font-black text-blue-300 bg-blue-950/80 px-2.5 py-1 rounded-full border border-blue-500/40">
              Live Radar
            </span>
          </div>
          <div>
            <span className="text-xs sm:text-sm font-black block text-white">Live Systems</span>
            <span className="text-[11px] text-slate-200 font-medium">Real-time hazard pins & gate tracking</span>
          </div>
        </button>
      </div>

      {/* Emergency Hotlines Direct Dial */}
      <div className="clean-card p-4 space-y-2.5 border-slate-800 bg-slate-900/80 shadow-xl">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-red-400" />
            Emergency Speed Dial
          </span>
          <button
            onClick={onOpenBroadcast}
            className="text-blue-400 hover:text-blue-300 text-xs font-bold flex items-center gap-1"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>PA Broadcast</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <a
            href="tel:112"
            className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-red-500/40 rounded-xl text-center block transition active:scale-95"
          >
            <span className="text-sm font-black text-white block">112</span>
            <span className="text-[10px] text-slate-300 font-bold">Police / SOS</span>
          </a>
          <a
            href="tel:108"
            className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-center block transition active:scale-95"
          >
            <span className="text-sm font-black text-white block">108</span>
            <span className="text-[10px] text-slate-300 font-bold">Ambulance</span>
          </a>
          <a
            href="tel:1077"
            className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-xl text-center block transition active:scale-95"
          >
            <span className="text-sm font-black text-white block">1077</span>
            <span className="text-[10px] text-slate-300 font-bold">Disaster Control</span>
          </a>
        </div>
      </div>
    </div>
  );
};
