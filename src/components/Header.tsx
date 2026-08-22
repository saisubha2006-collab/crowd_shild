import React from 'react';
import {
  Shield, Smartphone, LayoutDashboard, Volume2, AlertOctagon,
  ChevronDown, MapPin, Activity, Sun, Moon, Sparkles, Settings,
  Wifi, WifiOff, HardDrive, Play, Layers, Monitor, Apple, Droplets
} from 'lucide-react';
import { EventItem } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useDevice } from './os/DeviceContext';
import { SupportedOS } from '../utils/deviceDetector';

interface Props {
  viewMode: 'CITIZEN' | 'ADMIN';
  onToggleViewMode: (mode: 'CITIZEN' | 'ADMIN') => void;
  selectedEvent: EventItem;
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
  activeSosCount: number;
  onOpenBroadcast: () => void;
  onOpenSettings?: () => void;
  onOpenOfflineVault?: () => void;
  onOpenDemoControl?: () => void;
}

export const Header: React.FC<Props> = ({
  viewMode,
  onToggleViewMode,
  selectedEvent,
  events,
  onSelectEvent,
  activeSosCount,
  onOpenBroadcast,
  onOpenSettings,
  onOpenOfflineVault,
  onOpenDemoControl,
}) => {
  const { themeMode, resolvedTheme, setThemeMode, toggleTheme } = useTheme();
  const { isLiquidUI, isFluentUI, os, deviceInfo, isSimulatedOffline, setCustomOSOverride, customOSOverride } = useDevice();
  const isActuallyOnline = deviceInfo.isOnline && !isSimulatedOffline;

  return (
    <header className={`sticky top-0 z-40 transition-all ${
      isLiquidUI
        ? 'liquid-glass border-b border-white/20 shadow-2xl'
        : isFluentUI
        ? 'fluent-acrylic border-b border-[#2a364c]'
        : 'bg-slate-950/90 border-b border-slate-800 backdrop-blur-md shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
        {/* Brand & OS Engine Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-lg shrink-0 ring-1 ring-white/30">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                <span>CrowdShield</span>
                {isLiquidUI && (
                  <span className="text-[11px] font-extrabold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-400/40 shadow-inner flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-cyan-300 animate-pulse" />
                    <span>LIQUID UI</span>
                  </span>
                )}
              </h1>
            </div>
            <p className="text-[10px] text-slate-300 font-medium flex items-center gap-1">
              <Activity className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              <span>Real-Time Stampede Prevention & Disaster Safety</span>
            </p>
          </div>
        </div>

        {/* Automatic OS UI Indicator Badge (Pure Auto-Detection) */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <div
            className={`px-3 py-1.5 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-sm ${
              isLiquidUI
                ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                : isFluentUI
                ? 'bg-[#0f1b2d] text-blue-200 border-[#2b4c7e] shadow-[0_0_15px_rgba(59,130,246,0.25)]'
                : 'bg-slate-900 text-emerald-300 border-emerald-500/40'
            }`}
            title={`Automatically detected: ${deviceInfo.osName} (${deviceInfo.osVersion})`}
          >
            {os === 'macos' && <Apple className="w-3.5 h-3.5 text-white" />}
            {os === 'ios' && <Smartphone className="w-3.5 h-3.5 text-cyan-300" />}
            {os === 'windows' && <Monitor className="w-3.5 h-3.5 text-blue-400" />}
            {os === 'android' && <Smartphone className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="font-extrabold uppercase text-[10px] tracking-wide">
              {os === 'macos' ? 'macOS Liquid' : os === 'ios' ? 'iOS Liquid' : os === 'windows' ? 'Windows 11 Fluent' : 'Android Material'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* 1. Offline Vault & Disaster Status Button */}
          {onOpenOfflineVault && (
            <button
              onClick={onOpenOfflineVault}
              className={`px-2.5 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm ${
                isActuallyOnline
                  ? isLiquidUI
                    ? 'liquid-btn text-emerald-300 border-emerald-400/40'
                    : 'bg-slate-900 hover:bg-slate-850 text-emerald-300 border-emerald-500/40'
                  : 'bg-red-950 text-red-300 border-red-500 animate-pulse ring-1 ring-red-400'
              }`}
              title="Open Offline Disaster Vault"
            >
              {isActuallyOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-red-400" />}
              <span className="hidden xs:inline">{isActuallyOnline ? 'Offline Vault' : 'Disaster Offline'}</span>
            </button>
          )}

          {/* 2. Interactive Demo & OS Mode Controller */}
          {onOpenDemoControl && (
            <button
              onClick={onOpenDemoControl}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-md"
              title="Open Interactive Demo Scenarios"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span className="hidden sm:inline">Scenarios</span>
            </button>
          )}

          {/* Quick Theme Toggle Button */}
          <div className="relative group">
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-xl border transition flex items-center gap-1 text-xs font-bold ${
                resolvedTheme === 'light'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300'
              }`}
              title={`Active Theme: ${themeMode.toUpperCase()} (${resolvedTheme}). Click to toggle Light/Dark`}
            >
              {resolvedTheme === 'light' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-300" />
              )}
            </button>

            {/* Theme Dropdown Menu */}
            <div className="absolute right-0 top-full mt-1 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-1 hidden group-hover:block z-50 text-xs">
              <div className="px-3 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Appearance Theme
              </div>
              <button
                onClick={() => setThemeMode('system')}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-800 transition ${
                  themeMode === 'system' ? 'text-cyan-400 font-bold bg-slate-800/60' : 'text-slate-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto (System)</span>
                </span>
                {themeMode === 'system' && <span className="text-[10px]">✓</span>}
              </button>
              <button
                onClick={() => setThemeMode('light')}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-800 transition ${
                  themeMode === 'light' ? 'text-amber-400 font-bold bg-slate-800/60' : 'text-slate-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light Theme</span>
                </span>
                {themeMode === 'light' && <span className="text-[10px]">✓</span>}
              </button>
              <button
                onClick={() => setThemeMode('dark')}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-800 transition ${
                  themeMode === 'dark' ? 'text-indigo-400 font-bold bg-slate-800/60' : 'text-slate-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Dark Theme</span>
                </span>
                {themeMode === 'dark' && <span className="text-[10px]">✓</span>}
              </button>
            </div>
          </div>

          {/* Quick Settings Icon Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-300 hover:text-white transition active:scale-95"
              title="Open Application Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}

          {/* PA Broadcast Quick Action */}
          <button
            onClick={onOpenBroadcast}
            className="hidden md:flex items-center gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-blue-400 px-2.5 py-1.5 rounded-xl text-xs font-bold transition active:scale-95"
            title="Public Address Broadcast"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>PA</span>
          </button>

          {/* SOS Indicator */}
          {activeSosCount > 0 && (
            <div className="flex items-center gap-1 bg-red-600 border border-red-500 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold animate-pulse">
              <AlertOctagon className="w-3.5 h-3.5 text-white" />
              <span>{activeSosCount} SOS</span>
            </div>
          )}

          {/* View Toggle */}
          <div className="bg-slate-900 p-0.5 rounded-xl border border-slate-700/80 flex items-center gap-0.5">
            <button
              onClick={() => onToggleViewMode('CITIZEN')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                viewMode === 'CITIZEN'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Citizen</span>
            </button>
            <button
              onClick={() => onToggleViewMode('ADMIN')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                viewMode === 'ADMIN'
                  ? 'bg-blue-600 text-white font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>HQ</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

