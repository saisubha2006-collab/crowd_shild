import React, { useState, useEffect } from 'react';
import { useDevice } from './DeviceContext';
import {
  Wifi, Battery, Sparkles, Volume2, Search, Bell, Monitor,
  Smartphone, Apple, Command, Radio, Shield, Minimize2, Maximize2, X,
  ChevronDown, LocateFixed, AlertTriangle, Activity, Zap
} from 'lucide-react';

export const OSSystemTopBar: React.FC = () => {
  const { os, windowState, setWindowState, isLiquidUI } = useDevice();
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [isDynamicIslandExpanded, setIsDynamicIslandExpanded] = useState(false);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    update();
    const timer = setInterval(update, 10000);
    return () => clearInterval(timer);
  }, []);

  // 1. macOS Liquid Glass Menu Bar & Frosted Window Header
  if (os === 'macos') {
    return (
      <div className="w-full text-[11px] text-slate-200 select-none sticky top-0 z-50">
        {/* Apple Top System Bar with Ultra Blur Liquid Glass */}
        <div className="px-3.5 py-1 flex items-center justify-between bg-slate-950/40 backdrop-blur-2xl border-b border-white/10 shadow-sm">
          <div className="flex items-center gap-3.5 font-medium">
            <span className="text-white text-xs hover:text-cyan-300 transition cursor-default font-semibold"></span>
            <span className="font-bold text-white tracking-wide">CrowdShield</span>
            <span className="hover:text-white cursor-pointer transition text-slate-300 hidden sm:inline">File</span>
            <span className="hover:text-white cursor-pointer transition text-slate-300 hidden sm:inline">Radar</span>
            <span className="hover:text-white cursor-pointer transition text-slate-300 hidden md:inline">Safety</span>
            <span className="hover:text-white cursor-pointer transition text-slate-300 hidden md:inline">Window</span>
            <span className="hover:text-white cursor-pointer transition text-slate-300 hidden lg:inline">Help</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[10px] text-slate-300">
            <div className="flex items-center gap-1.5 bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-100 font-bold">Live GPS Lock</span>
            </div>
            <span className="flex items-center gap-1">
              <span>99%</span>
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
            </span>
            <Wifi className="w-3.5 h-3.5 text-slate-200" />
            <Search className="w-3.5 h-3.5 text-slate-200 hover:text-white transition cursor-pointer" />
            <span className="hover:text-white transition cursor-pointer font-sans font-medium">{dateStr} {timeStr}</span>
          </div>
        </div>

        {/* macOS Window Controls Header with Specular Glass */}
        <div className="px-3.5 py-1.5 bg-slate-900/45 backdrop-blur-3xl flex items-center justify-between border-b border-white/10 shadow-inner">
          <div className="flex items-center gap-2 group">
            <button
              onClick={() => alert('macOS: Window close action')}
              className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 border border-red-600/80 flex items-center justify-center text-[8px] text-red-950 font-black shadow-sm transition active:scale-90"
              title="Close (Cmd+W)"
            >
              <span className="hidden group-hover:inline">×</span>
            </button>
            <button
              onClick={() => setWindowState(windowState === 'minimized' ? 'normal' : 'minimized')}
              className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600 border border-amber-600/80 flex items-center justify-center text-[8px] text-amber-950 font-black shadow-sm transition active:scale-90"
              title="Minimize (Cmd+M)"
            >
              <span className="hidden group-hover:inline">−</span>
            </button>
            <button
              onClick={() => setWindowState(windowState === 'maximized' ? 'normal' : 'maximized')}
              className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 border border-emerald-600/80 flex items-center justify-center text-[7px] text-emerald-950 font-black shadow-sm transition active:scale-90"
              title="Zoom / Full Screen"
            >
              <span className="hidden group-hover:inline">⤢</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span className="tracking-wide">CrowdShield AI — macOS Liquid Glass Edition</span>
          </div>

          <div className="w-14 text-right">
            <span className="text-[10px] text-slate-300 font-mono bg-white/10 px-1.5 py-0.5 rounded border border-white/15">⌘K</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Windows 11 Fluent Title Bar
  if (os === 'windows') {
    return (
      <div className="w-full bg-[#181d28] border-b border-[#2b3548] text-xs text-slate-300 select-none flex items-center justify-between px-3 py-1">
        <div className="flex items-center gap-2">
          {/* Windows 11 App Icon */}
          <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold">
            ⊞
          </div>
          <span className="text-xs font-semibold text-slate-200 tracking-wide font-sans">
            CrowdShield AI — Windows 11 Disaster Management
          </span>
        </div>

        {/* Windows 11 Window Controls */}
        <div className="flex items-center">
          <button
            onClick={() => setWindowState(windowState === 'minimized' ? 'normal' : 'minimized')}
            className="px-3 py-1 hover:bg-slate-700/60 text-slate-300 text-xs transition"
            title="Minimize"
          >
            —
          </button>
          <button
            onClick={() => setWindowState(windowState === 'maximized' ? 'normal' : 'maximized')}
            className="px-3 py-1 hover:bg-slate-700/60 text-slate-300 text-xs transition"
            title={windowState === 'maximized' ? 'Restore' : 'Maximize'}
          >
            {windowState === 'maximized' ? '❐' : '□'}
          </button>
          <button
            onClick={() => alert('Windows: Application close action simulated')}
            className="px-3 py-1 hover:bg-red-600 hover:text-white text-slate-300 text-xs transition"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // 3. iOS Status Bar with Interactive Liquid Dynamic Island
  if (os === 'ios') {
    return (
      <div className="w-full bg-slate-950/40 backdrop-blur-3xl px-4 pt-2 pb-1.5 text-slate-100 flex flex-col items-center select-none border-b border-white/10 sticky top-0 z-50">
        <div className="w-full flex items-center justify-between text-xs font-semibold">
          <span className="font-bold text-[13px] tracking-tight text-white pl-1">{timeStr || '9:41'}</span>

          {/* Interactive iOS Dynamic Island Capsule */}
          <div
            onClick={() => setIsDynamicIslandExpanded(!isDynamicIslandExpanded)}
            className={`transition-all duration-300 cursor-pointer shadow-2xl flex items-center justify-center ${
              isDynamicIslandExpanded
                ? 'w-64 py-2 px-3 bg-black/90 border border-white/25 rounded-2xl'
                : 'w-24 h-5 bg-black rounded-full border border-slate-700/80 hover:border-cyan-400/60 px-2'
            }`}
            title="Click to expand / collapse Dynamic Island"
          >
            {!isDynamicIslandExpanded ? (
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[9px] text-cyan-300 font-mono font-bold">5G GPS</span>
              </div>
            ) : (
              <div className="w-full flex items-center justify-between text-[11px] animate-fadeIn">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <LocateFixed className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="font-black text-white block text-[10px]">RADAR ACTIVE</span>
                    <span className="text-[8px] text-emerald-400 font-mono">Real-time GPS Tracking</span>
                  </div>
                </div>
                <span className="text-[9px] bg-red-600/30 text-red-300 border border-red-500/50 px-1.5 py-0.5 rounded-full font-bold">
                  SOS READY
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-slate-200 text-xs pr-1">
            <span className="text-[10px] font-bold">5G</span>
            <Wifi className="w-3.5 h-3.5 text-slate-100" />
            <div className="w-5 h-2.5 border border-slate-200 rounded-sm p-0.5 flex items-center">
              <div className="h-full w-full bg-emerald-400 rounded-2xs" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Android Status Bar (Material 3)
  return (
    <div className="w-full bg-slate-950 px-4 py-1.5 text-slate-300 flex items-center justify-between text-[11px] font-medium select-none border-b border-slate-900">
      <div className="flex items-center gap-2">
        <span className="font-bold text-slate-200">{timeStr || '09:40'}</span>
        <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800">
          <Shield className="w-2.5 h-2.5" />
          <span>Material You</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-slate-300">
        <span className="text-[9px] font-mono text-slate-400">VoLTE 5G</span>
        <Wifi className="w-3 h-3 text-slate-300" />
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono">100%</span>
          <Battery className="w-3 h-3 text-emerald-400" />
        </div>
      </div>
    </div>
  );
};

export const OSSystemBottomBar: React.FC = () => {
  const { os, isLiquidUI } = useDevice();
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' }));
    };
    update();
    const timer = setInterval(update, 10000);
    return () => clearInterval(timer);
  }, []);

  // 1. iOS Bottom Liquid Glass Home Indicator Bar
  if (os === 'ios') {
    return (
      <div className="w-full py-2 bg-transparent flex items-center justify-center pointer-events-none sticky bottom-0 z-50">
        <div className="w-36 h-1.2 bg-white/80 backdrop-blur-md rounded-full shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
      </div>
    );
  }

  // 2. Android 3-Button / Gesture Bar
  if (os === 'android') {
    return (
      <div className="w-full py-1.5 bg-slate-950/80 flex items-center justify-center gap-12 text-slate-500 text-xs">
        <button className="hover:text-slate-200 transition active:scale-90" title="Back">
          ◀
        </button>
        <button className="hover:text-slate-200 transition active:scale-90" title="Home">
          ●
        </button>
        <button className="hover:text-slate-200 transition active:scale-90" title="Recent Apps">
          ■
        </button>
      </div>
    );
  }

  // 3. Windows 11 Bottom Taskbar
  if (os === 'windows') {
    return (
      <div className="w-full bg-[#131722] border-t border-[#232a3b] px-4 py-1.5 flex items-center justify-between text-xs text-slate-300 select-none shadow-lg">
        <div className="flex items-center gap-2">
          {/* Windows Start Button */}
          <button
            onClick={() => alert('Windows 11 Start Menu: CrowdShield AI running active background monitoring.')}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-blue-400 transition flex items-center gap-1"
            title="Start"
          >
            <span className="text-sm font-bold">⊞</span>
          </button>
          <div className="hidden sm:flex items-center gap-1 bg-[#1c2233] border border-[#2c3750] rounded-full px-2.5 py-1 text-[11px] text-slate-400">
            <Search className="w-3 h-3 text-slate-400" />
            <span>Search apps, settings, emergency gates...</span>
          </div>
        </div>

        {/* Windows System Tray */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-sans">
          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
            ENG IN
          </span>
          <Wifi className="w-3.5 h-3.5 text-slate-300" />
          <Volume2 className="w-3.5 h-3.5 text-slate-300" />
          <div className="text-right leading-tight">
            <span className="block text-slate-200 font-medium text-[10px]">{timeStr}</span>
            <span className="block text-slate-500 text-[9px]">{dateStr}</span>
          </div>
          <Bell className="w-3.5 h-3.5 text-slate-300 hover:text-white cursor-pointer" />
        </div>
      </div>
    );
  }

  // macOS Bottom Minimal Dock Indicator
  return null;
};

