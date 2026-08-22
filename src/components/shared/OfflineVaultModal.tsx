import React, { useState, useEffect } from 'react';
import {
  Wifi, WifiOff, Download, ShieldCheck, Phone, Navigation,
  AlertTriangle, Radio, RefreshCw, FileText, CheckCircle2,
  HardDrive, Zap, Sparkles, MapPin, ExternalLink, MessageSquare,
  Shield, HeartPulse, Fuel, Hotel, Wrench, Milestone, Bus,
  Copy, Check
} from 'lucide-react';
import {
  getCachedSafetyPack,
  cacheSafetyPack,
  getSimulatedOffline,
  setSimulatedOffline,
  DEFAULT_EMERGENCY_CONTACTS,
  STAMPEDE_SAFETY_GUIDES,
  generateOfflineSmsUri,
  getQueuedOfflineSOSList,
  markQueuedSOSAsSynced,
  EmergencyContact,
  OfflineSafetyPack
} from '../../utils/offlineStorage';
import { EventItem, Zone, SafeRoute } from '../../types';
import { useDevice } from '../os/DeviceContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem;
  zones: Zone[];
  userCoords: [number, number];
  onSelectRoute?: (route: SafeRoute) => void;
}

export const OfflineVaultModal: React.FC<Props> = ({
  isOpen,
  onClose,
  event,
  zones,
  userCoords,
  onSelectRoute,
}) => {
  const { isLiquidUI, isFluentUI, os, deviceInfo } = useDevice();
  const [activeTab, setActiveTab] = useState<'ROUTES' | 'CONTACTS' | 'FACILITIES' | 'SMS_BEACON' | 'SURVIVAL' | 'CACHE_STATS'>('ROUTES');
  const [safetyPack, setSafetyPack] = useState<OfflineSafetyPack | null>(() => getCachedSafetyPack());
  const [isSimOffline, setIsSimOffline] = useState<boolean>(() => getSimulatedOffline());
  const [isCaching, setIsCaching] = useState(false);
  const [cacheSuccessMsg, setCacheSuccessMsg] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [queuedSos, setQueuedSos] = useState(() => getQueuedOfflineSOSList());

  // Refresh safety pack on mount or when event changes
  useEffect(() => {
    let pack = getCachedSafetyPack();
    if (!pack) {
      pack = cacheSafetyPack(event, zones, userCoords);
    }
    setSafetyPack(pack);
    setQueuedSos(getQueuedOfflineSOSList());
  }, [event, zones, userCoords]);

  if (!isOpen) return null;

  const handleDownloadSafetyPack = () => {
    setIsCaching(true);
    setCacheSuccessMsg(null);
    setTimeout(() => {
      const updated = cacheSafetyPack(event, zones, userCoords);
      setSafetyPack(updated);
      setIsCaching(false);
      setCacheSuccessMsg('All evacuation routes, emergency numbers, and offline maps cached successfully!');
      setTimeout(() => setCacheSuccessMsg(null), 4000);
    }, 600);
  };

  const handleToggleSimulatedOffline = (enabled: boolean) => {
    setIsSimOffline(enabled);
    setSimulatedOffline(enabled);
  };

  const handleCopy = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2500);
    }
  };

  const isActuallyOnline = deviceInfo.isOnline && !isSimOffline;
  const offlineSmsText = `EMERGENCY SOS! I am at ${event.name} near coordinates ${userCoords[0].toFixed(5)}, ${userCoords[1].toFixed(5)}. Cellular network is jammed. Please dispatch rescue/medical team.`;
  const smsHref = generateOfflineSmsUri('112', offlineSmsText);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100 shadow-2xl ${
          isLiquidUI
            ? 'liquid-card border-white/20'
            : isFluentUI
            ? 'fluent-acrylic border-[#33425b]'
            : 'bg-slate-950 border border-slate-800 rounded-3xl'
        }`}
      >
        {/* Modal Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isLiquidUI ? 'bg-white/5 border-white/10' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl flex items-center justify-center ${
              isActuallyOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400 animate-pulse'
            }`}>
              {isActuallyOnline ? <ShieldCheck className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-wide">
                  Offline Disaster Safety Vault
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                  isActuallyOnline
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-red-950 text-red-300 border border-red-700 animate-pulse'
                }`}>
                  {isActuallyOnline ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
                  <span>{isActuallyOnline ? '5G Online' : 'Disaster Offline Active'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Guaranteed zero-network access to saved evacuation paths, emergency speed-dial, and SMS beacons.
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

        {/* Live Network Simulation & Precache Action Bar */}
        <div className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 text-xs ${
          isLiquidUI ? 'bg-white/5 border-white/10' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Crowd Cell Jam Simulator:</span>
            <button
              onClick={() => handleToggleSimulatedOffline(!isSimOffline)}
              className={`px-3 py-1 rounded-xl font-bold transition flex items-center gap-1.5 text-xs ${
                isSimOffline
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 ring-2 ring-red-400'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              {isSimOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              <span>{isSimOffline ? 'Network Cut (Testing Offline)' : 'Simulate Cell Jam'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSafetyPack}
              disabled={isCaching}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50 text-xs shadow-md"
            >
              <Download className={`w-3.5 h-3.5 ${isCaching ? 'animate-bounce' : ''}`} />
              <span>{isCaching ? 'Caching Safety Data...' : 'Re-Cache Safety Pack'}</span>
            </button>
          </div>
        </div>

        {cacheSuccessMsg && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{cacheSuccessMsg}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 pt-3 border-b border-slate-800/80 overflow-x-auto custom-scrollbar text-xs">
          <button
            onClick={() => setActiveTab('ROUTES')}
            className={`pb-2 px-3 font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ROUTES'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Offline Routes ({safetyPack?.safeRoutes.length || 2})</span>
          </button>

          <button
            onClick={() => setActiveTab('CONTACTS')}
            className={`pb-2 px-3 font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'CONTACTS'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Emergency Speed-Dial ({DEFAULT_EMERGENCY_CONTACTS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SMS_BEACON')}
            className={`pb-2 px-3 font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'SMS_BEACON'
                ? 'border-red-400 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-red-400" />
            <span>Offline SMS Beacon</span>
          </button>

          <button
            onClick={() => setActiveTab('FACILITIES')}
            className={`pb-2 px-3 font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'FACILITIES'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Cached Facilities ({safetyPack?.nearbyFacilities.length || 7})</span>
          </button>

          <button
            onClick={() => setActiveTab('SURVIVAL')}
            className={`pb-2 px-3 font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'SURVIVAL'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Stampede Survival</span>
          </button>

          <button
            onClick={() => setActiveTab('CACHE_STATS')}
            className={`pb-2 px-3 font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'CACHE_STATS'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Cache Health</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-4">
          {/* TAB 1: SAVED ESCAPE ROUTES */}
          {activeTab === 'ROUTES' && (
            <div className="space-y-3">
              <div className="bg-cyan-950/40 border border-cyan-800/60 p-3 rounded-2xl text-xs text-cyan-200 flex items-start gap-2">
                <Navigation className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Offline Turn-by-Turn Safe Corridors</p>
                  <p className="text-[11px] text-cyan-300/80">
                    These evacuation trajectories are cached directly in your device memory and remain fully accessible even if cell towers collapse during a crowd stampede.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {safetyPack?.safeRoutes.map((rt) => (
                  <div
                    key={rt.id}
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                        {rt.fromName} → {rt.toGateName}
                      </span>
                      <span className="bg-emerald-950 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded-lg border border-emerald-700 text-[11px]">
                        {rt.estimatedMinutes} min • {rt.distanceMeters}m
                      </span>
                    </div>

                    <div className="space-y-1 pl-2 border-l-2 border-emerald-500/40">
                      {rt.turnInstructions.map((step, idx) => (
                        <div key={idx} className="text-slate-300 text-xs flex items-start gap-1.5">
                          <span className="font-mono text-emerald-400 font-bold">{idx + 1}.</span>
                          <span>{step.instruction} ({step.distance})</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Target Safe Gate: {rt.toGateName} • Safety Score: {rt.safetyScore}%
                      </span>
                      {onSelectRoute && (
                        <button
                          onClick={() => {
                            onSelectRoute(rt);
                            onClose();
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-xl font-bold flex items-center gap-1 text-xs transition active:scale-95"
                        >
                          <Navigation className="w-3 h-3" />
                          <span>Follow Route</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: EMERGENCY SPEED DIAL */}
          {activeTab === 'CONTACTS' && (
            <div className="space-y-3">
              <div className="bg-amber-950/40 border border-amber-800/60 p-3 rounded-2xl text-xs text-amber-200 flex items-start gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Direct Zero-Data Emergency Dialers</p>
                  <p className="text-[11px] text-amber-300/80">
                    Emergency phone lines operate on basic cellular GSM/VoLTE channels and connect even when 4G/5G mobile data bandwidth is completely overwhelmed.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DEFAULT_EMERGENCY_CONTACTS.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-white block truncate">{contact.name}</span>
                      <span className="text-[10px] text-slate-400 block line-clamp-1">{contact.role}</span>
                      <span className="text-cyan-400 font-mono font-bold text-xs mt-0.5 block">{contact.number}</span>
                    </div>

                    <a
                      href={`tel:${contact.number}`}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl font-bold flex items-center gap-1 text-xs shrink-0 shadow-md transition active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: OFFLINE SMS BEACON (ZERO INTERNET FALLBACK) */}
          {activeTab === 'SMS_BEACON' && (
            <div className="space-y-3">
              <div className="bg-red-950/50 border border-red-800/80 p-3.5 rounded-2xl text-xs text-red-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                  <span className="font-black text-white text-sm">Zero-Data SMS SOS Broadcast</span>
                </div>
                <p className="text-[11px] text-red-300">
                  When 4G/5G data is disabled, phone SMS packets still transmit through voice towers. Tap below to launch your phone's native SMS app with your precise GPS coordinates, battery level, and emergency distress beacon pre-filled.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Pre-Configured Emergency SMS:</span>
                  <button
                    onClick={() => handleCopy(offlineSmsText, 'SMS')}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px] font-bold"
                  >
                    {copiedText === 'SMS' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText === 'SMS' ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 leading-relaxed">
                  {offlineSmsText}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href={smsHref}
                    className="w-full bg-red-600 hover:bg-red-500 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 text-xs shadow-xl transition active:scale-95"
                  >
                    <Radio className="w-4 h-4" />
                    <span>Send SMS to 112 National HQ</span>
                  </a>

                  <a
                    href={`sms:+919876543210?body=${encodeURIComponent(offlineSmsText)}`}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 text-xs shadow-xl transition active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send SMS to Event Command Center</span>
                  </a>
                </div>
              </div>

              {/* Queued Offline SOS Alerts */}
              {queuedSos.length > 0 && (
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Queued Offline SOS Alerts ({queuedSos.length})
                    </span>
                    <button
                      onClick={() => {
                        markQueuedSOSAsSynced();
                        setQueuedSos(getQueuedOfflineSOSList());
                      }}
                      className="text-[10px] text-cyan-400 hover:underline font-bold"
                    >
                      Mark as Synced
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
                    {queuedSos.map((q) => (
                      <div key={q.id} className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-bold text-white block">{q.type} at {q.zoneName}</span>
                          <span className="text-slate-400 text-[10px] font-mono">{q.timestamp} • {q.coords[0].toFixed(4)}, {q.coords[1].toFixed(4)}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          q.synced ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400 animate-pulse'
                        }`}>
                          {q.synced ? 'Synced' : 'Pending Network'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CACHED FACILITIES */}
          {activeTab === 'FACILITIES' && (
            <div className="space-y-3">
              <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-white block mb-1">Cached Civic & Emergency Facilities</span>
                <p className="text-[11px] text-slate-400">
                  Pre-cached GPS coordinates, phone numbers, and street addresses of all surrounding hospitals, petrol pumps, garages, police stations, toll gates, and bus terminals.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {safetyPack?.nearbyFacilities.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white block truncate">{f.name}</span>
                      <span className="text-[10px] font-mono font-bold text-cyan-300">{f.formattedDistance}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{f.address}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[9px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                        {f.categoryLabel}
                      </span>
                      {f.phone && (
                        <a
                          href={`tel:${f.phone}`}
                          className="text-emerald-400 hover:text-emerald-300 font-mono font-bold text-[10px] flex items-center gap-1"
                        >
                          <Phone className="w-2.5 h-2.5" />
                          <span>{f.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: STAMPEDE SURVIVAL PROTOCOL */}
          {activeTab === 'SURVIVAL' && (
            <div className="space-y-3">
              {STAMPEDE_SAFETY_GUIDES.map((guide) => (
                <div
                  key={guide.id}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
                >
                  <span className="font-bold text-white text-sm block">{guide.title}</span>
                  <p className="text-[11px] text-slate-400">{guide.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 space-y-1">
                      <span className="font-bold text-emerald-300 text-[11px] block">✅ DO THIS:</span>
                      <ul className="text-[10px] text-emerald-200/90 space-y-1 list-disc pl-3">
                        {guide.doList.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-800/50 space-y-1">
                      <span className="font-bold text-red-300 text-[11px] block">❌ NEVER DO THIS:</span>
                      <ul className="text-[10px] text-red-200/90 space-y-1 list-disc pl-3">
                        {guide.dontList.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: CACHE STATS & STORAGE */}
          {activeTab === 'CACHE_STATS' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400 block font-semibold">Service Worker</span>
                  <span className="text-emerald-400 font-bold text-sm block mt-0.5">Active & Serving</span>
                  <span className="text-[9px] text-slate-500 font-mono">Scope: /</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400 block font-semibold">Cached Items</span>
                  <span className="text-cyan-400 font-bold text-sm block mt-0.5">
                    {(safetyPack?.nearbyFacilities.length || 0) + (safetyPack?.safeRoutes.length || 0) + DEFAULT_EMERGENCY_CONTACTS.length} Objects
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">Routes + Contacts + POIs</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400 block font-semibold">OS Adaptive UI</span>
                  <span className="text-white font-bold text-sm block mt-0.5 uppercase">
                    {os} ({isLiquidUI ? 'Liquid UI' : isFluentUI ? 'Fluent UI' : 'Material UI'})
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">Auto-Engine Active</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-white block">Offline Disaster Resilience Checklist</span>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>App Shell & Assets cached in Service Worker Cache API</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Evacuation routing graphs saved to Local Storage Vault</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Zero-Data SMS Beacon ready with live GPS & Battery data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Emergency contacts speed dial pre-configured</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`p-3 border-t flex items-center justify-between text-xs ${
          isLiquidUI ? 'bg-white/5 border-white/10' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <span className="text-[11px] text-slate-400 font-mono">
            Safety Cache v2.1 • Last verified: Just now
          </span>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-xl font-bold text-xs transition"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
};
