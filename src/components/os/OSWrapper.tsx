import React, { useEffect } from 'react';
import { useDevice } from './DeviceContext';

interface Props {
  children: React.ReactNode;
}

export const OSWrapper: React.FC<Props> = ({ children }) => {
  const { os, deviceInfo, windowState, isLiquidUI } = useDevice();

  // Register desktop keyboard shortcuts if on desktop OS (macOS / Windows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key === 'k') {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [os]);

  // Inbuilt OS-specific theme classes
  const getOSClasses = () => {
    switch (os) {
      case 'ios':
        return 'os-ios font-sans antialiased bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white';
      case 'android':
        return 'os-android font-sans antialiased bg-slate-950 text-slate-100';
      case 'macos':
        return 'os-macos font-sans antialiased bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white';
      case 'windows':
        return 'os-windows font-sans antialiased bg-[#0f141c] text-slate-100';
      default:
        return 'bg-slate-950 text-slate-100';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col relative overflow-x-hidden ${getOSClasses()}`}>
      {/* Dynamic Ambient Holographic Liquid Floating Mesh Glowing Orbs & Auroras */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Top-Right Neon Electric Cyan Flare */}
        <div className="absolute -top-40 -right-40 w-[350px] sm:w-[650px] h-[350px] sm:h-[650px] rounded-full bg-gradient-to-br from-cyan-500/25 via-sky-600/20 to-blue-700/10 blur-[130px] animate-orb-1" />
        
        {/* Mid-Left Vivid Violet / Magenta Cosmic Flare */}
        <div className="absolute top-1/3 -left-48 w-[380px] sm:w-[700px] h-[380px] sm:h-[700px] rounded-full bg-gradient-to-tr from-purple-600/25 via-fuchsia-600/20 to-pink-500/10 blur-[150px] animate-orb-2" />
        
        {/* Bottom-Right Radiant Emerald / Teal Flare */}
        <div className="absolute -bottom-40 right-1/4 w-[320px] sm:w-[600px] h-[320px] sm:h-[600px] rounded-full bg-gradient-to-t from-emerald-500/20 via-teal-600/15 to-cyan-500/10 blur-[140px] animate-orb-3" />

        {/* Center Golden Solar Pulse for Disaster Alert Atmosphere */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-amber-500/10 blur-[160px] pointer-events-none" />
      </div>

      {/* Main Application Content Container */}
      <div className={`flex-1 flex flex-col relative z-10 ${windowState === 'minimized' ? 'opacity-30 pointer-events-none scale-95 transition-all' : ''}`}>
        {children}
      </div>
    </div>
  );
};
