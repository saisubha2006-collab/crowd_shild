import React, { useState } from 'react';
import {
  Sparkles, Play, ShieldAlert, WifiOff, Wifi, HeartPulse,
  CloudRain, CheckCircle2, RotateCcw, Monitor, Smartphone,
  Apple, Laptop, Radio, Layers, Zap, AlertTriangle, HardDrive
} from 'lucide-react';
import { useDevice } from '../os/DeviceContext';
import { SupportedOS } from '../../utils/deviceDetector';
import { setSimulatedOffline } from '../../utils/offlineStorage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTriggerStampedeSurge: () => void;
  onResetSimulation: () => void;
  onTriggerMedicalCrisis: () => void;
  onTriggerWeatherAlert: () => void;
  viewMode: 'CITIZEN' | 'ADMIN';
  onToggleViewMode: (mode: 'CITIZEN' | 'ADMIN') => void;
  onOpenOfflineVault: () => void;
}

export const DemoControlCenter: React.FC<Props> = ({
  isOpen,
  onClose,
  onTriggerStampedeSurge,
  onResetSimulation,
  onTriggerMedicalCrisis,
  onTriggerWeatherAlert,
  viewMode,
  onToggleViewMode,
  onOpenOfflineVault,
}) => {
  const {
    os,
    deviceInfo,
    customOSOverride,
    setCustomOSOverride,
    isLiquidUI,
    isFluentUI,
    isSimulatedOffline,
    setIsSimulatedOffline,
  } = useDevice();

  const [activeScenarioMsg, setActiveScenarioMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunScenario = (name: string, action: () => void) => {
    action();
    setActiveScenarioMsg(`Scenario Activated: ${name}`);
    setTimeout(() => setActiveScenarioMsg(null), 3500);
  };

  const handleToggleOffline = (val: boolean) => {
    setIsSimulatedOffline(val);
    setSimulatedOffline(val);
    setActiveScenarioMsg(val ? 'Network Disconnected: Offline Disaster Cache Active' : 'Network Restored: 5G Online');
    setTimeout(() => setActiveScenarioMsg(null), 3500);
  };

  const osOptions: { id: SupportedOS | 'auto'; name: string; icon: any; desc: string; badge: string }[] = [
    {
      id: 'auto',
      name: 'Auto-Detect Device OS',
      icon: Monitor,
      desc: `Detected: ${deviceInfo.osName}`,
      badge: 'NATIVE SENSORS',
    },
    {
      id: 'macos',
      name: 'Apple macOS Liquid UI',
      icon: Apple,
      desc: 'Liquid glassmorphism, Apple titlebar, SF Pro spacing & specular sheen',
      badge: 'LIQUID GLASS',
    },
    {
      id: 'ios',
      name: 'Apple iOS Liquid Touch',
      icon: Smartphone,
      desc: 'Liquid pill navigation, dynamic capsule, touch physics & home indicator',
      badge: 'LIQUID TOUCH',
    },
    {
      id: 'windows',
      name: 'Windows 11 Fluent Acrylic',
      icon: Laptop,
      desc: 'Mica acrylic translucency, Windows 11 title controls & Segoe taskbar',
      badge: 'FLUENT MICA',
    },
    {
      id: 'android',
      name: 'Android Material 3',
      icon: Smartphone,
      desc: 'Material You dynamic tonal palette, gesture bar & density chips',
      badge: 'MATERIAL YOU',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-slate-100 shadow-2xl ${
          isLiquidUI
            ? 'liquid-card border-white/20'
            : isFluentUI
            ? 'fluent-acrylic border-[#33425b]'
            : 'bg-slate-950 border border-slate-800 rounded-3xl'
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isLiquidUI ? 'bg-white/5 border-white/10' : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-wide">
                  Interactive Demo & OS UI Engine Controller
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700 uppercase">
                  Live Sandbox
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Test disaster scenarios, offline caching resilience, and toggle between macOS/iOS Liquid UI and Windows 11 Fluent UI.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition active:scale-95 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {activeScenarioMsg && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 text-xs flex items-center gap-2 animate-in fade-in shadow-lg">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0 animate-bounce" />
            <span className="font-bold">{activeScenarioMsg}</span>
          </div>
        )}

        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-5">
          {/* SECTION 1: OS & LIQUID UI ENGINE SWITCHER */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                1. OS Detection & Adaptive UI Mode (macOS / iOS Liquid vs Windows 11 Fluent)
              </span>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                Current: {os.toUpperCase()} ({isLiquidUI ? 'Liquid UI' : isFluentUI ? 'Fluent UI' : 'Material UI'})
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {osOptions.map((opt) => {
                const isSelected =
                  opt.id === 'auto'
                    ? customOSOverride === null
                    : customOSOverride === opt.id;
                const IconComponent = opt.icon;

                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (opt.id === 'auto') {
                        setCustomOSOverride(null);
                      } else {
                        setCustomOSOverride(opt.id as SupportedOS);
                      }
                      setActiveScenarioMsg(`UI Mode Switched: ${opt.name}`);
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex items-start justify-between gap-3 text-xs ${
                      isSelected
                        ? 'bg-cyan-950/90 border-cyan-400 shadow-xl ring-2 ring-cyan-500/50'
                        : 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white block text-[13px]">{opt.name}</span>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-950 text-cyan-300 border border-slate-800">
                            {opt.badge}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 mt-0.5 block leading-tight">{opt.desc}</span>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: DISASTER SCENARIOS */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              2. Interactive Disaster & Stampede Simulations
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Scenario 1: Crowd Surge Stampede */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-500/60 space-y-2.5 text-xs transition">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white text-sm">Zone 1 Stampede Surge</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Simulates sudden bottleneck compression at East Gate (density &gt; 7.6 p/m²). Triggers AI warning sirens, safe corridor bypass, and automatic relief gate recommendation.
                </p>
                <button
                  onClick={() => handleRunScenario('East Gate Stampede Surge', onTriggerStampedeSurge)}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30 transition active:scale-95"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Trigger Stampede Surge</span>
                </button>
              </div>

              {/* Scenario 2: Network Blackout / Cell Jam */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/60 space-y-2.5 text-xs transition">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <WifiOff className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white text-sm">Cellular Jam & Network Cut</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Simulates complete mobile data blackout. Tests Service Worker cache fallback, offline maps, and zero-internet SMS SOS beacons.
                </p>
                <button
                  onClick={() => handleToggleOffline(!isSimulatedOffline)}
                  className={`w-full font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition active:scale-95 ${
                    isSimulatedOffline
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-amber-600 hover:bg-amber-500 text-white'
                  }`}
                >
                  {isSimulatedOffline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                  <span>{isSimulatedOffline ? 'Restore 5G Connection' : 'Cut Cellular Network (Go Offline)'}</span>
                </button>
              </div>

              {/* Scenario 3: Medical Emergency Dispatch */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 space-y-2.5 text-xs transition">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white text-sm">Crush Victim Triage Alert</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Simulates a citizen raising a medical asphyxiation SOS. Dispatches nearest PCR ambulance & volunteer stretcher squad.
                </p>
                <button
                  onClick={() => handleRunScenario('Medical Crush Triage', onTriggerMedicalCrisis)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition active:scale-95"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Dispatch Medical Emergency</span>
                </button>
              </div>

              {/* Scenario 4: Flash Rain Drill */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/60 space-y-2.5 text-xs transition">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                    <CloudRain className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white text-sm">Flash Weather Evacuation</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Broadcasts sudden rain/slippery hazard alert and opens covered shelters with multilingual announcements.
                </p>
                <button
                  onClick={() => handleRunScenario('Weather Evacuation Protocol', onTriggerWeatherAlert)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition active:scale-95"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Run Weather Protocol</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 3: QUICK VIEW TOGGLE & RESET */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">Active View Role:</span>
              <button
                onClick={() => onToggleViewMode(viewMode === 'CITIZEN' ? 'ADMIN' : 'CITIZEN')}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-3 py-1.5 rounded-xl transition active:scale-95 shadow"
              >
                Switch to {viewMode === 'CITIZEN' ? 'Admin Command HQ' : 'Citizen App'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenOfflineVault}
                className="bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition active:scale-95 flex items-center gap-1"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Open Offline Vault</span>
              </button>

              <button
                onClick={() => {
                  onResetSimulation();
                  setActiveScenarioMsg('Simulation state reset to default');
                  setTimeout(() => setActiveScenarioMsg(null), 3000);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-1.5 rounded-xl border border-slate-700 transition active:scale-95 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Simulation</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-3 border-t flex items-center justify-between text-xs ${
          isLiquidUI ? 'bg-white/5 border-white/10' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <span className="text-[11px] text-slate-400 font-mono">
            CrowdShield Disaster Sandbox Engine v2.1
          </span>
          <button
            onClick={onClose}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-1.5 rounded-xl font-black text-xs transition"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
