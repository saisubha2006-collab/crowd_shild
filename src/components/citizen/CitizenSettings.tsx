import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sun,
  Moon,
  Laptop,
  Smartphone,
  Apple,
  Monitor,
  Volume2,
  VolumeX,
  Vibrate,
  Shield,
  Clock,
  RotateCcw,
  Check,
  Sparkles,
  SlidersHorizontal,
  Cpu,
  CheckCircle2,
  Terminal,
  RefreshCw
} from 'lucide-react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import { useDevice } from '../os/DeviceContext';
import confetti from 'canvas-confetti';

interface Props {
  onOpenSOS?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const CitizenSettings: React.FC<Props> = ({ onOpenSOS, onNavigateTab }) => {
  const { themeMode, resolvedTheme, systemPrefersDark, setThemeMode } = useTheme();
  const { os, deviceInfo, refreshHardwareInfo } = useDevice();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Additional settings stored in localStorage
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem('cs_haptics_enabled');
      return v !== null ? JSON.parse(v) : true;
    } catch {
      return true;
    }
  });

  const [ttsEnabled, setTtsEnabled] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem('cs_tts_enabled');
      return v !== null ? JSON.parse(v) : true;
    } catch {
      return true;
    }
  });

  const [sosCountdown, setSosCountdown] = useState<number>(() => {
    try {
      const v = localStorage.getItem('kumbh_call_timeout_sec');
      return v ? parseInt(v, 10) : 10;
    } catch {
      return 10;
    }
  });

  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  const handleRefreshDiagnostics = async () => {
    setIsRefreshing(true);
    await refreshHardwareInfo();
    setTimeout(() => {
      setIsRefreshing(false);
      setSavedSuccessMsg('Device OS & version re-scanned successfully.');
      setTimeout(() => setSavedSuccessMsg(null), 3000);
    }, 500);
  };

  const handleSelectTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.6 },
    });
    setSavedSuccessMsg(`Theme updated to ${mode.toUpperCase()} mode.`);
    setTimeout(() => setSavedSuccessMsg(null), 3000);
  };

  const handleToggleHaptics = () => {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    localStorage.setItem('cs_haptics_enabled', JSON.stringify(next));
    if (next && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleToggleTts = () => {
    const next = !ttsEnabled;
    setTtsEnabled(next);
    localStorage.setItem('cs_tts_enabled', JSON.stringify(next));
  };

  const handleSaveSosCountdown = (val: number) => {
    setSosCountdown(val);
    localStorage.setItem('kumbh_call_timeout_sec', val.toString());
  };

  const handleResetSettings = () => {
    if (window.confirm('Reset all display and theme preferences to system defaults?')) {
      setThemeMode('system');
      setHapticsEnabled(true);
      setTtsEnabled(true);
      setSavedSuccessMsg('All preferences reset to system defaults.');
      setTimeout(() => setSavedSuccessMsg(null), 3000);
    }
  };

  // Icon for detected native OS
  const getOSIcon = () => {
    switch (os) {
      case 'android':
        return <Smartphone className="w-6 h-6 text-emerald-400" />;
      case 'ios':
        return <Apple className="w-6 h-6 text-slate-200" />;
      case 'macos':
        return <Laptop className="w-6 h-6 text-blue-400" />;
      case 'windows':
        return <Monitor className="w-6 h-6 text-cyan-400" />;
      default:
        return <Cpu className="w-6 h-6 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-4 text-slate-100 pb-12">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-blue-300 text-xs font-bold uppercase tracking-wider">
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
          <span>System & Preferences</span>
        </div>
        <h2 className="text-lg font-black text-white">System Settings</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Inbuilt device OS detection, visual appearance, audio guidance, and safety parameters.
        </p>
      </div>

      {savedSuccessMsg && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{savedSuccessMsg}</span>
        </motion.div>
      )}

      {/* 1. INBUILT DEVICE & HARDWARE ENGINE (OS & VERSION DETAILS ONLY) */}
      <div className="clean-card p-5 space-y-4 border-slate-800 shadow-xl bg-slate-900/90">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-950/40">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>INBUILT DEVICE & HARDWARE ENGINE</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono font-bold">
                  AUTO-DETECTED
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Automatically fetches and synchronizes with your device's operating system
              </p>
            </div>
          </div>

          <button
            onClick={handleRefreshDiagnostics}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white border border-slate-700 transition active:scale-95"
            title="Re-Scan Device OS"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Scanning...' : 'Re-Scan OS'}</span>
          </button>
        </div>

        {/* Focused OS & Version Details Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Operating System Card */}
          <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800/80 space-y-2 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
              {getOSIcon()}
            </div>
            <div className="space-y-0.5 flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Operating System
              </span>
              <p className="text-sm font-black text-white truncate">
                {deviceInfo.osName}
              </p>
              <div className="flex items-center gap-1.5 pt-1">
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Native OS Active</span>
                </span>
                <span className="text-[10px] text-slate-400 capitalize">
                  {deviceInfo.deviceType} UI
                </span>
              </div>
            </div>
          </div>

          {/* OS Version & Build Card */}
          <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800/80 space-y-2 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
              <Terminal className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="space-y-0.5 flex-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                OS Version & Build
              </span>
              <p className="text-sm font-black text-cyan-300 font-mono truncate">
                {deviceInfo.osVersion}
              </p>
              <p className="text-[10px] text-slate-400 pt-1 truncate">
                Kernel: <span className="text-slate-300 font-mono">{deviceInfo.kernelOrBuild}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Automatic Synchronization Notice */}
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center gap-2.5 text-[11px] text-slate-300">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            CrowdShield automatically detects your device's operating system and version upon launch to deliver the native layout, system controls, and navigation style automatically.
          </span>
        </div>
      </div>

      {/* 2. Theme & Appearance Settings */}
      <div className="clean-card p-5 space-y-4 border-slate-800 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-bold">
              {resolvedTheme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <span>UI Theme & Appearance</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  {resolvedTheme.toUpperCase()} ACTIVE
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Auto-adapts to your device's daylight / dark mode appearance
              </p>
            </div>
          </div>
        </div>

        {/* Live System Detection Banner */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Device System Appearance:</span>
              <p className="text-[10px] text-slate-400">
                OS currently requests: <strong className="text-cyan-300 capitalize">{systemPrefersDark ? 'Dark Mode' : 'Light Mode'}</strong>
              </p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
            systemPrefersDark
              ? 'bg-slate-900 text-slate-300 border-slate-700'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}>
            {systemPrefersDark ? '🌙 System Dark' : '☀️ System Light'}
          </span>
        </div>

        {/* Theme Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Option A: Auto (System Sync) */}
          <button
            onClick={() => handleSelectTheme('system')}
            className={`p-3 rounded-2xl border text-left transition active:scale-95 flex flex-col justify-between ${
              themeMode === 'system'
                ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/30 text-white'
                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                <Sparkles className="w-4 h-4" />
              </div>
              {themeMode === 'system' && (
                <span className="w-2 h-2 rounded-full bg-blue-400 ring-4 ring-blue-500/20" />
              )}
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Auto (System)</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Automatically matches device OS light/dark switch.
              </p>
            </div>
          </button>

          {/* Option B: Light Theme */}
          <button
            onClick={() => handleSelectTheme('light')}
            className={`p-3 rounded-2xl border text-left transition active:scale-95 flex flex-col justify-between ${
              themeMode === 'light'
                ? 'bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/30 text-white'
                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Sun className="w-4 h-4" />
              </div>
              {themeMode === 'light' && (
                <span className="w-2 h-2 rounded-full bg-amber-400 ring-4 ring-amber-500/20" />
              )}
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Light Theme</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Daylight safe, high contrast, clean paper layout.
              </p>
            </div>
          </button>

          {/* Option C: Dark Theme */}
          <button
            onClick={() => handleSelectTheme('dark')}
            className={`p-3 rounded-2xl border text-left transition active:scale-95 flex flex-col justify-between ${
              themeMode === 'dark'
                ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/30 text-white'
                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Moon className="w-4 h-4" />
              </div>
              {themeMode === 'dark' && (
                <span className="w-2 h-2 rounded-full bg-indigo-400 ring-4 ring-indigo-500/20" />
              )}
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Dark Theme</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                OLED battery saver, low glare night monitoring.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Voice, Audio & Haptic Alerts */}
      <div className="clean-card p-5 space-y-3.5 border-slate-800 shadow-xl">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Audio & Speech Guidance</h3>
            <p className="text-[11px] text-slate-400">Emergency evacuation audio prompts and physical vibrations</p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          {/* TTS Voice guidance */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {ttsEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <div>
                <span className="font-bold text-white block">Voice Navigation Prompts:</span>
                <p className="text-[10px] text-slate-400">Speaks safe route exit instructions aloud</p>
              </div>
            </div>
            <button
              onClick={handleToggleTts}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                ttsEnabled ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {ttsEnabled ? 'ON' : 'Muted'}
            </button>
          </div>

          {/* Haptic vibration */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Vibrate className="w-4 h-4 text-purple-400" />
              <div>
                <span className="font-bold text-white block">Haptic Vibrations:</span>
                <p className="text-[10px] text-slate-400">Tactile pulses when entering stampede risk zones</p>
              </div>
            </div>
            <button
              onClick={handleToggleHaptics}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                hapticsEnabled ? 'bg-purple-600 text-white border-purple-500' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {hapticsEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Emergency SOS Countdown Ringing Timeout */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-bold text-white block">Auto-Call Ringing Timeout:</span>
                <p className="text-[10px] text-slate-400">Seconds before rotating to next emergency contact</p>
              </div>
            </div>
            <select
              value={sosCountdown}
              onChange={(e) => handleSaveSosCountdown(parseInt(e.target.value, 10))}
              className="bg-slate-900 border border-slate-700 text-amber-300 font-bold rounded-xl px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value={8}>8s</option>
              <option value={10}>10s</option>
              <option value={15}>15s</option>
              <option value={20}>20s</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Reset Preferences */}
      <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-slate-300 block">Reset Preferences:</span>
          <p className="text-[10px] text-slate-400">Restore default system appearance and audio alerts</p>
        </div>
        <button
          onClick={handleResetSettings}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold flex items-center gap-1 transition active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
