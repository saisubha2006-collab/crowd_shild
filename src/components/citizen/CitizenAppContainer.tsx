import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home, MapPin, Navigation, AlertOctagon, Bell, User,
  Shield, Mic, Users, Camera, Radio, HeartPulse, Activity,
  Settings, Sparkles, Wifi, WifiOff, BatteryCharging, Battery, Compass
} from 'lucide-react';
import { EventItem, Zone, SOSAlert, IncidentReport, NotificationItem, SafeRoute, UserProfile } from '../../types';
import { reverseGeocode } from '../../utils/geoUtils';
import { useDevice } from '../os/DeviceContext';
import { ExactDeviceState } from '../../utils/deviceLocationManager';
import { CitizenHome } from './CitizenHome';
import { CitizenMap } from './CitizenMap';
import { CitizenAICamera } from './CitizenAICamera';
import { CitizenSafeRoute } from './CitizenSafeRoute';
import { CitizenSOS } from './CitizenSOS';
import { CitizenReport } from './CitizenReport';
import { CitizenEventInfo } from './CitizenEventInfo';
import { CitizenNotifications } from './CitizenNotifications';
import { CitizenPeopleTracker } from './CitizenPeopleTracker';
import { CitizenProfile } from './CitizenProfile';
import { CitizenVoiceControl } from './CitizenVoiceControl';
import { CitizenSettings } from './CitizenSettings';
import { OtpLoginModal } from '../auth/OtpLoginModal';

export type CitizenTab =
  | 'HOME'
  | 'MAP'
  | 'AICAMERA'
  | 'ROUTE'
  | 'SOS'
  | 'REPORT'
  | 'EVENT'
  | 'NOTIFICATIONS'
  | 'PEOPLE'
  | 'PROFILE'
  | 'VOICE'
  | 'SETTINGS';

interface Props {
  user: UserProfile;
  selectedEvent: EventItem;
  zones: Zone[];
  notifications: NotificationItem[];
  safeRoute: SafeRoute;
  onTriggerSOS: (type: SOSAlert['type'], customNote?: string) => void;
  onSubmitIncident: (report: Partial<IncidentReport>) => void;
  onOpenBroadcast: () => void;
  onOpenOfflineVault?: () => void;
  onOpenDemoControl?: () => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
  defaultTab?: CitizenTab;
  exactDeviceState?: ExactDeviceState | null;
  onRefreshGPS?: () => void;
  isRefreshingGPS?: boolean;
}

export const CitizenAppContainer: React.FC<Props> = ({
  user,
  selectedEvent,
  zones,
  notifications,
  safeRoute,
  onTriggerSOS,
  onSubmitIncident,
  onOpenBroadcast,
  onOpenOfflineVault,
  onOpenDemoControl,
  onUpdateUser,
  defaultTab = 'HOME',
  exactDeviceState = null,
  onRefreshGPS = () => {},
  isRefreshingGPS = false,
}) => {
  const { os, isMobile, isLiquidUI, isFluentUI, isSimulatedOffline } = useDevice();
  const [activeTab, setActiveTab] = useState<CitizenTab>(defaultTab);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  // Real GPS Coordinates State & Accuracy
  const [deviceCoords, setDeviceCoords] = useState<[number, number]>(user.coordinates);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [locationDetails, setLocationDetails] = useState<{ city?: string; country?: string }>({});

  // Real Device Network & Battery Status (ON / OFF)
  const [isDeviceOnline, setIsDeviceOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [batteryPercent, setBatteryPercent] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Online / Offline Detection
  useEffect(() => {
    const handleOnline = () => setIsDeviceOnline(true);
    const handleOffline = () => setIsDeviceOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Battery API if supported
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryPercent(Math.round(battery.level * 100));
        setIsCharging(battery.charging);

        battery.addEventListener('levelchange', () => {
          setBatteryPercent(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Automatic Device Geolocation Acquisition on Startup & High-Precision Watch
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDeviceCoords([pos.coords.latitude, pos.coords.longitude]);
          setGpsAccuracy(Math.round(pos.coords.accuracy));
          setIsGpsActive(true);
        },
        (err) => {
          console.warn('Geolocation initial fetch:', err);
          setIsGpsActive(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );

      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setDeviceCoords([pos.coords.latitude, pos.coords.longitude]);
          setGpsAccuracy(Math.round(pos.coords.accuracy));
          setIsGpsActive(true);
        },
        (err) => {
          console.warn('Geolocation continuous watch err:', err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 2000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Reverse Geocode
  useEffect(() => {
    if (deviceCoords) {
      reverseGeocode(deviceCoords[0], deviceCoords[1]).then((geo) => {
        setLocationDetails({ city: geo.city, country: geo.country });
      });
    }
  }, [deviceCoords]);

  // Desktop keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === '1') setActiveTab('HOME');
      if (e.key === '2') setActiveTab('MAP');
      if (e.key === '3') setActiveTab('AICAMERA');
      if (e.key === '4') setActiveTab('ROUTE');
      if (e.key === '5' || e.key.toLowerCase() === 's') setActiveTab('SOS');
      if (e.key.toLowerCase() === ',') setActiveTab('SETTINGS');
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const containerMaxWidth = os === 'macos' || os === 'windows' ? 'max-w-4xl' : 'max-w-2xl';

  return (
    <div className={`w-full ${containerMaxWidth} mx-auto px-2 sm:px-4 py-3 min-h-[calc(100vh-80px)] flex flex-col font-sans transition-all text-slate-100`}>
      {/* Clean Top Navigation & Status Bar with Real Device Status */}
      <div className={`clean-card p-3 mb-3 flex items-center justify-between gap-2 shadow-lg ${
        os === 'ios' ? 'rounded-2xl border-white/10 bg-slate-900/80 backdrop-blur-md' :
        os === 'windows' ? 'rounded-xl border-[#2a3449] bg-[#141a24]' :
        os === 'macos' ? 'rounded-xl border-slate-800 bg-slate-900/90' :
        'rounded-2xl border-slate-800 bg-slate-900/90'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-white truncate">
                {selectedEvent.name}
              </h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold shrink-0 ${
                selectedEvent.riskLevel === 'CRITICAL'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {selectedEvent.riskLevel} RISK
              </span>
            </div>

            {/* Device Online/Offline & GPS Status Bar */}
            <div className="text-[11px] text-slate-300 flex items-center gap-1.5 truncate mt-0.5">
              {/* Device ON/OFF Indicator */}
              <span className={`flex items-center gap-1 font-bold text-[10px] px-1.5 py-0.2 rounded ${
                isDeviceOnline
                  ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-500/30'
                  : 'text-red-300 bg-red-950/80 border border-red-500/30 animate-pulse'
              }`}>
                {isDeviceOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-red-400" />}
                <span>{isDeviceOnline ? 'DEVICE ON' : 'DEVICE OFF'}</span>
              </span>

              <span className="text-slate-500">•</span>

              <span className={`w-1.5 h-1.5 rounded-full ${isGpsActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="truncate text-slate-200">{locationDetails.city || 'Prayagraj Sangam'}</span>

              {batteryPercent !== null && (
                <>
                  <span className="text-slate-500">•</span>
                  <span className="flex items-center gap-0.5 text-[10px] text-slate-300 font-mono">
                    {isCharging ? <BatteryCharging className="w-3 h-3 text-emerald-400" /> : <Battery className="w-3 h-3 text-slate-300" />}
                    <span>{batteryPercent}%</span>
                  </span>
                </>
              )}

              <span className="text-slate-500">•</span>
              <span className="font-mono text-cyan-300 font-bold">{currentTime}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions (Nearby Services, AI Camera, Notifications, Settings, Profile) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('EVENT')}
            title="Nearby Essential Services (7 Facilities)"
            className={`p-2 rounded-xl border transition active:scale-95 flex items-center gap-1 text-xs font-bold ${
              activeTab === 'EVENT'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-black'
                : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-slate-700'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">Nearby Services</span>
          </button>

          <button
            onClick={() => setActiveTab('AICAMERA')}
            title="AI Vision Camera"
            className={`p-2 rounded-xl border transition active:scale-95 flex items-center gap-1 text-xs font-bold ${
              activeTab === 'AICAMERA'
                ? 'bg-purple-600 text-white border-purple-400 shadow-md font-black'
                : 'bg-slate-900 hover:bg-slate-800 text-purple-300 border-slate-700'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span className="hidden md:inline">AI Camera</span>
          </button>

          <button
            onClick={() => setActiveTab('NOTIFICATIONS')}
            title="Safety Notifications"
            className={`p-2 rounded-xl border transition relative active:scale-95 ${
              activeTab === 'NOTIFICATIONS'
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('SETTINGS')}
            title="Application Settings"
            className={`p-2 rounded-xl border transition active:scale-95 text-xs font-bold flex items-center gap-1 ${
              activeTab === 'SETTINGS'
                ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('PROFILE')}
            title="Citizen Profile"
            className={`p-2 rounded-xl border transition active:scale-95 text-xs font-bold flex items-center gap-1 ${
              activeTab === 'PROFILE'
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <User className="w-4 h-4 text-slate-200" />
            <span className="hidden sm:inline">{user.name ? user.name.split(' ')[0] : 'Profile'}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content Canvas */}
      <div className="flex-1 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {activeTab === 'HOME' && (
              <CitizenHome
                user={{ ...user, coordinates: deviceCoords }}
                event={selectedEvent}
                zones={zones}
                onNavigate={(tab) => setActiveTab(tab as any)}
                onOpenSOS={() => setActiveTab('SOS')}
                onOpenBroadcast={onOpenBroadcast}
                onOpenOtpModal={() => setIsOtpModalOpen(true)}
                exactDeviceState={exactDeviceState}
                onRefreshGPS={onRefreshGPS}
                isRefreshingGPS={isRefreshingGPS}
              />
            )}

            {activeTab === 'MAP' && (
              <CitizenMap
                event={selectedEvent}
                zones={zones}
                userCoords={deviceCoords}
                onSelectRoute={() => setActiveTab('ROUTE')}
                onOpenAICamera={() => setActiveTab('AICAMERA')}
              />
            )}

            {activeTab === 'AICAMERA' && (
              <CitizenAICamera
                userCoords={deviceCoords}
                onNavigateToLiveSystems={() => setActiveTab('MAP')}
              />
            )}

            {activeTab === 'ROUTE' && (
              <CitizenSafeRoute
                event={selectedEvent}
                userCoords={deviceCoords}
                safeRoute={safeRoute}
                onOpenMap={() => setActiveTab('MAP')}
              />
            )}

            {activeTab === 'SOS' && (
              <CitizenSOS
                user={{ ...user, coordinates: deviceCoords }}
                event={selectedEvent}
                onTriggerSOS={onTriggerSOS}
              />
            )}

            {activeTab === 'VOICE' && (
              <CitizenVoiceControl
                user={{ ...user, coordinates: deviceCoords }}
                safeRoute={safeRoute}
                onTriggerSOS={onTriggerSOS}
                onNavigateTab={(tab) => setActiveTab(tab as any)}
              />
            )}

            {activeTab === 'PEOPLE' && (
              <CitizenPeopleTracker
                user={{ ...user, coordinates: deviceCoords }}
                onOpenMapWithPerson={() => setActiveTab('MAP')}
                onTriggerSOS={onTriggerSOS}
              />
            )}

            {activeTab === 'REPORT' && (
              <CitizenReport
                event={selectedEvent}
                userCoords={deviceCoords}
                onSubmit={onSubmitIncident}
              />
            )}

            {activeTab === 'EVENT' && (
              <CitizenEventInfo
                event={selectedEvent}
                userCoords={deviceCoords}
                onNavigateToMap={() => setActiveTab('MAP')}
              />
            )}

            {activeTab === 'NOTIFICATIONS' && (
              <CitizenNotifications
                notifications={notifications}
                userLocation={locationDetails}
                userCoords={deviceCoords}
                onOpenBroadcast={onOpenBroadcast}
              />
            )}

            {activeTab === 'PROFILE' && (
              <CitizenProfile
                user={{ ...user, coordinates: deviceCoords }}
                onUpdateUser={onUpdateUser}
                onOpenOtpModal={() => setIsOtpModalOpen(true)}
                onOpenSOS={() => setActiveTab('SOS')}
                onOpenSettings={() => setActiveTab('SETTINGS')}
              />
            )}

            {activeTab === 'SETTINGS' && (
              <CitizenSettings
                onOpenSOS={() => setActiveTab('SOS')}
                onNavigateTab={(tab) => setActiveTab(tab as any)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* OS-Adapted Navigation Dock */}
      <nav aria-label="Main Navigation" className={`fixed bottom-3 left-3 right-3 ${containerMaxWidth} mx-auto z-40`}>
        <div className={`p-1.5 shadow-2xl flex items-center justify-between text-xs transition-all ${
          os === 'ios' || os === 'macos'
            ? 'liquid-dock border-white/20'
            : os === 'windows'
            ? 'bg-[#0e1420]/95 backdrop-blur-2xl border border-[#2b3952] rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.7)]'
            : 'bg-slate-950/95 border border-slate-800 rounded-3xl'
        }`}>
          <button
            onClick={() => setActiveTab('HOME')}
            className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center transition active:scale-95 ${
              activeTab === 'HOME'
                ? isLiquidUI
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : isFluentUI
                  ? 'bg-blue-600/40 text-blue-100 border border-blue-400/50 font-black shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                  : 'bg-emerald-600 text-white font-black shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 flex items-center gap-0.5">
              <span>Home</span>
              {!isMobile && <span className="text-[8px] opacity-60 font-mono hidden sm:inline">[1]</span>}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('MAP')}
            className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center transition active:scale-95 ${
              activeTab === 'MAP'
                ? isLiquidUI
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : isFluentUI
                  ? 'bg-blue-600/40 text-blue-100 border border-blue-400/50 font-black shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                  : 'bg-emerald-600 text-white font-black shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 flex items-center gap-0.5">
              <span>Live Systems</span>
              {!isMobile && <span className="text-[8px] opacity-60 font-mono hidden sm:inline">[2]</span>}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('AICAMERA')}
            className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center transition active:scale-95 ${
              activeTab === 'AICAMERA'
                ? 'bg-purple-600 text-white font-black shadow-lg shadow-purple-950/80 border border-purple-400/40'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 flex items-center gap-0.5">
              <span>AI Vision</span>
              {!isMobile && <span className="text-[8px] opacity-60 font-mono hidden sm:inline">[3]</span>}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ROUTE')}
            className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center transition active:scale-95 ${
              activeTab === 'ROUTE'
                ? isLiquidUI
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : isFluentUI
                  ? 'bg-blue-600/40 text-blue-100 border border-blue-400/50 font-black shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                  : 'bg-emerald-600 text-white font-black shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 flex items-center gap-0.5">
              <span>Route</span>
              {!isMobile && <span className="text-[8px] opacity-60 font-mono hidden sm:inline">[4]</span>}
            </span>
          </button>

          {/* Prominent High-Contrast 1-Tap SOS Button */}
          <button
            onClick={() => setActiveTab('SOS')}
            className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center transition active:scale-95 ${
              activeTab === 'SOS'
                ? 'bg-red-600 text-white font-black shadow-lg shadow-red-950/80'
                : 'bg-red-600/20 text-red-300 hover:bg-red-600/30'
            }`}
          >
            <AlertOctagon className="w-4 h-4 animate-pulse" />
            <span className="text-[10px] font-black mt-0.5 flex items-center gap-0.5">
              <span>SOS</span>
              {!isMobile && <span className="text-[8px] opacity-60 font-mono hidden sm:inline">[S]</span>}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center transition active:scale-95 ${
              activeTab === 'SETTINGS'
                ? isLiquidUI
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : isFluentUI
                  ? 'bg-blue-600/40 text-blue-100 border border-blue-400/50 font-black shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                  : 'bg-emerald-600 text-white font-black shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 flex items-center gap-0.5">
              <span>Settings</span>
            </span>
          </button>
        </div>
      </nav>

      {/* OTP Login Modal */}
      <OtpLoginModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        user={user}
        onLoginSuccess={(updated) => onUpdateUser(updated)}
      />
    </div>
  );
};
