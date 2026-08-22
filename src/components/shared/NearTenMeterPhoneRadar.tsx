import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radar, Smartphone, Apple, Radio, RefreshCw, Zap, Shield,
  CheckCircle2, AlertTriangle, Battery, Signal, Compass, Filter,
  Users, Search, ChevronRight, Info, Eye, Droplets, Send,
  Cpu, HardDrive, Lock, Activity, Wifi, Terminal, X, ArrowUpRight,
  MessageSquare, BellRing, PhoneCall, Sparkles, SlidersHorizontal
} from 'lucide-react';
import { useDevice } from '../os/DeviceContext';

export interface NearPhoneDevice {
  id: string;
  name: string;
  ownerName: string;
  os: 'ios' | 'android';
  model: string;
  chipset: string;
  osVersion: string;
  meshUuid: string;
  distanceMeters: number; // 0.5 to 9.9 m strictly within 10m
  angleDeg: number; // 0 to 360 deg
  rssi: number; // -35 to -85 dBm
  battery: number; // 15 to 100%
  isCharging: boolean;
  batteryTempC: number;
  linkSpeedMbps: number;
  packetsSynced: number;
  latencyMs: number;
  uwbSpatial: boolean;
  status: 'ACTIVE_MESH' | 'EMERGENCY_BEACON' | 'SAFE_PEER';
  lastPingMs: number;
  telemetryLogs: string[];
}

const INITIAL_NEARBY_PHONES: NearPhoneDevice[] = [
  {
    id: 'phone-1',
    name: "Alex's iPhone 15 Pro",
    ownerName: 'Alex Morgan',
    os: 'ios',
    model: 'Apple iPhone 15 Pro',
    chipset: 'Apple A17 Pro (3nm) + U2 UWB',
    osVersion: 'iOS 18.2.1 (Build 22C161)',
    meshUuid: 'BLE-MESH-APPL-01948',
    distanceMeters: 1.8,
    angleDeg: 42,
    rssi: -42,
    battery: 92,
    isCharging: false,
    batteryTempC: 31.4,
    linkSpeedMbps: 48.5,
    packetsSynced: 3420,
    latencyMs: 3,
    uwbSpatial: true,
    status: 'ACTIVE_MESH',
    lastPingMs: Date.now() - 300,
    telemetryLogs: [
      'P2P Handshake verified via Wi-Fi Aware Direct',
      'Telemetry payload fetched: Battery 92%, Accelerometer: Stationary',
      'Ultra-Wideband spatial ranging: 1.82m @ 42° Azimuth',
      'AES-256 GCM mesh tunnel established',
    ],
  },
  {
    id: 'phone-2',
    name: "Sarah's Galaxy S24 Ultra",
    ownerName: 'Sarah Khan',
    os: 'android',
    model: 'Samsung Galaxy S24 Ultra',
    chipset: 'Snapdragon 8 Gen 3 for Galaxy + NXP UWB',
    osVersion: 'Android 15 (One UI 7.0)',
    meshUuid: 'BLE-MESH-SAMS-90214',
    distanceMeters: 3.2,
    angleDeg: 135,
    rssi: -52,
    battery: 84,
    isCharging: true,
    batteryTempC: 33.1,
    linkSpeedMbps: 42.0,
    packetsSynced: 2890,
    latencyMs: 4,
    uwbSpatial: true,
    status: 'SAFE_PEER',
    lastPingMs: Date.now() - 700,
    telemetryLogs: [
      'Fast-charging detected (45W Super Fast 2.0)',
      'Telemetry fetched: Battery 84%, Accelerometer: Walking steady',
      'Mesh relay enabled for crowd queue notifications',
      'GPS Precision parity: ±1.2m accurate',
    ],
  },
  {
    id: 'phone-3',
    name: "Liam's Google Pixel 9 Pro",
    ownerName: 'Liam Thomas',
    os: 'android',
    model: 'Google Pixel 9 Pro',
    chipset: 'Google Tensor G4 + Titan M2 Security',
    osVersion: 'Android 15 (Vanilla Ice Cream)',
    meshUuid: 'BLE-MESH-PIXL-77120',
    distanceMeters: 4.8,
    angleDeg: 210,
    rssi: -60,
    battery: 76,
    isCharging: false,
    batteryTempC: 29.8,
    linkSpeedMbps: 36.8,
    packetsSynced: 2150,
    latencyMs: 5,
    uwbSpatial: true,
    status: 'ACTIVE_MESH',
    lastPingMs: Date.now() - 1100,
    telemetryLogs: [
      'Direct BLE 5.4 advertising channel sync',
      'Security verified: Titan M2 hardware enclave pass',
      'Telemetry payload: Battery 76%, Ambient sound 68dB',
      'Relaying local safe-route topology packets',
    ],
  },
  {
    id: 'phone-4',
    name: "Elena's iPhone 16 Pro Max",
    ownerName: 'Elena Vance',
    os: 'ios',
    model: 'Apple iPhone 16 Pro Max',
    chipset: 'Apple A18 Pro (2nd Gen 3nm) + Gen 2 UWB',
    osVersion: 'iOS 18.3 Beta (Build 22D5034)',
    meshUuid: 'BLE-MESH-IP16-88290',
    distanceMeters: 6.1,
    angleDeg: 320,
    rssi: -68,
    battery: 95,
    isCharging: false,
    batteryTempC: 27.9,
    linkSpeedMbps: 62.0,
    packetsSynced: 1940,
    latencyMs: 4,
    uwbSpatial: true,
    status: 'SAFE_PEER',
    lastPingMs: Date.now() - 1400,
    telemetryLogs: [
      'Next-Gen A18 Pro Direct link active',
      'Spatial telemetry: 6.1m perimeter margin',
      'Battery optimal: 95%, Health 100%',
      'Encrypted crowd beacon heartbeat OK',
    ],
  },
  {
    id: 'phone-5',
    name: "Priya's OnePlus 12",
    ownerName: 'Priya Nair',
    os: 'android',
    model: 'OnePlus 12 5G',
    chipset: 'Snapdragon 8 Gen 3 + Adreno 750',
    osVersion: 'Android 15 (OxygenOS 15.0)',
    meshUuid: 'BLE-MESH-OP12-55421',
    distanceMeters: 7.4,
    angleDeg: 80,
    rssi: -73,
    battery: 65,
    isCharging: false,
    batteryTempC: 32.0,
    linkSpeedMbps: 28.4,
    packetsSynced: 1420,
    latencyMs: 7,
    uwbSpatial: false,
    status: 'ACTIVE_MESH',
    lastPingMs: Date.now() - 1900,
    telemetryLogs: [
      'Sub-10m mesh boundary lock',
      'Telemetry fetched: Battery 65%, Signal -73 dBm',
      'Active hop node relaying crowd flow metrics',
      'No distress beacons detected',
    ],
  },
  {
    id: 'phone-6',
    name: "Dev's iPad Air M2",
    ownerName: 'Dev Roy',
    os: 'ios',
    model: 'Apple iPad Air 11-inch (M2)',
    chipset: 'Apple M2 8-Core + Apple Neural Engine',
    osVersion: 'iPadOS 18.2 (Build 22C150)',
    meshUuid: 'BLE-MESH-IPAD-33109',
    distanceMeters: 8.3,
    angleDeg: 285,
    rssi: -78,
    battery: 88,
    isCharging: false,
    batteryTempC: 28.5,
    linkSpeedMbps: 54.0,
    packetsSynced: 1680,
    latencyMs: 6,
    uwbSpatial: false,
    status: 'SAFE_PEER',
    lastPingMs: Date.now() - 2300,
    telemetryLogs: [
      'High-bandwidth Wi-Fi Direct mesh node active',
      'Telemetry fetched: Battery 88%, Display 100% active',
      'Disaster offline vault map pack synced',
      'Safe check verified by device user',
    ],
  },
  {
    id: 'phone-7',
    name: "Marcus's Nothing Phone (2)",
    ownerName: 'Marcus Bennett',
    os: 'android',
    model: 'Nothing Phone (2)',
    chipset: 'Snapdragon 8+ Gen 1 5G',
    osVersion: 'Android 14 (Nothing OS 2.6)',
    meshUuid: 'BLE-MESH-NOTH-11048',
    distanceMeters: 9.1,
    angleDeg: 165,
    rssi: -82,
    battery: 58,
    isCharging: false,
    batteryTempC: 30.5,
    linkSpeedMbps: 22.0,
    packetsSynced: 1120,
    latencyMs: 8,
    uwbSpatial: false,
    status: 'ACTIVE_MESH',
    lastPingMs: Date.now() - 2700,
    telemetryLogs: [
      'Outer 10m perimeter node connected',
      'Telemetry fetched: Battery 58%, Signal -82 dBm',
      'Automatic packet routing confirmed',
      'Relaying evacuation gate telemetry',
    ],
  },
  {
    id: 'phone-8',
    name: "Ananya's Xiaomi 14 Ultra",
    ownerName: 'Ananya Sharma',
    os: 'android',
    model: 'Xiaomi 14 Ultra (Leica)',
    chipset: 'Snapdragon 8 Gen 3 + Surge P2/G1',
    osVersion: 'Xiaomi HyperOS 1.0.8',
    meshUuid: 'BLE-MESH-XIOM-94812',
    distanceMeters: 5.6,
    angleDeg: 25,
    rssi: -64,
    battery: 79,
    isCharging: false,
    batteryTempC: 31.0,
    linkSpeedMbps: 39.5,
    packetsSynced: 1810,
    latencyMs: 5,
    uwbSpatial: true,
    status: 'SAFE_PEER',
    lastPingMs: Date.now() - 950,
    telemetryLogs: [
      'HyperOS P2P mesh relay active',
      'Telemetry fetched: Battery 79%, Signal -64 dBm',
      'Low latency spatial ping: 5ms',
      'Emergency beacon listening OK',
    ],
  },
];

interface Props {
  onMarkSafe?: () => void;
  isSafeChecked?: boolean;
}

export const NearTenMeterPhoneRadar: React.FC<Props> = ({
  onMarkSafe,
  isSafeChecked = false,
}) => {
  const { os, isLiquidUI, isFluentUI } = useDevice();
  const [nearbyPhones, setNearbyPhones] = useState<NearPhoneDevice[]>(INITIAL_NEARBY_PHONES);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'IOS' | 'ANDROID' | 'CLOSE'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectingDevice, setInspectingDevice] = useState<NearPhoneDevice | null>(null);
  const [radarSweepAngle, setRadarSweepAngle] = useState<number>(0);
  const [isFetchingAll, setIsFetchingAll] = useState<boolean>(false);
  const [pingAlert, setPingAlert] = useState<string | null>(null);
  const [customMeshMsg, setCustomMeshMsg] = useState<string>('');
  const [msgSentNotice, setMsgSentNotice] = useState<string | null>(null);

  // Smooth rotating 360-degree radar sweep line
  useEffect(() => {
    let animId: number;
    let angle = 0;
    const animate = () => {
      angle = (angle + 2) % 360;
      setRadarSweepAngle(angle);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Real-time automatic background telemetry fetching
  useEffect(() => {
    const interval = setInterval(() => {
      setNearbyPhones((prev) => {
        return prev.map((phone) => {
          // Dynamic micro-movement in distance strictly staying within 0.8m - 9.8m
          const deltaDist = (Math.random() - 0.5) * 0.2;
          const newDist = Math.max(0.8, Math.min(9.8, parseFloat((phone.distanceMeters + deltaDist).toFixed(1))));
          
          // Realistic RSSI derived from distance
          const newRssi = Math.round(-38 - 18 * Math.log10(newDist) + (Math.random() * 2 - 1));
          
          // Slight angle drift
          const deltaAngle = (Math.random() - 0.5) * 1.5;
          const newAngle = (phone.angleDeg + deltaAngle + 360) % 360;

          // Increment packet counters
          const newPkts = phone.packetsSynced + Math.floor(Math.random() * 6 + 2);

          return {
            ...phone,
            distanceMeters: newDist,
            angleDeg: newAngle,
            rssi: newRssi,
            packetsSynced: newPkts,
            lastPingMs: Date.now(),
          };
        });
      });
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  // Fetch All Devices Trigger (Instant P2P Wave Scan)
  const handleFetchAllDevices = () => {
    setIsFetchingAll(true);
    setPingAlert('📡 Broadcasting 10m BLE & Wi-Fi Direct Wave... Handshaking with all nearby smartphones!');
    
    setTimeout(() => {
      setNearbyPhones((prev) =>
        prev.map((phone) => ({
          ...phone,
          packetsSynced: phone.packetsSynced + Math.floor(Math.random() * 40 + 20),
          lastPingMs: Date.now(),
        }))
      );
      setIsFetchingAll(false);
      setPingAlert(`✅ Telemetry fetched from all ${nearbyPhones.length} devices in 10m range! (100% Sync)`);
      setTimeout(() => setPingAlert(null), 4000);
    }, 1200);
  };

  // Filtered devices
  const filteredPhones = useMemo(() => {
    let list = [...nearbyPhones];
    if (selectedFilter === 'IOS') {
      list = list.filter((p) => p.os === 'ios');
    } else if (selectedFilter === 'ANDROID') {
      list = list.filter((p) => p.os === 'android');
    } else if (selectedFilter === 'CLOSE') {
      list = list.filter((p) => p.distanceMeters <= 3.5);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.ownerName.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.chipset.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [nearbyPhones, selectedFilter, searchQuery]);

  const totalNearCount = nearbyPhones.length;
  const iosCount = nearbyPhones.filter((p) => p.os === 'ios').length;
  const androidCount = nearbyPhones.filter((p) => p.os === 'android').length;
  const immediateCount = nearbyPhones.filter((p) => p.distanceMeters <= 3.0).length;

  // 10m Density Calculation
  let densityCategory: 'SAFE' | 'MODERATE' | 'CONGESTED' = 'SAFE';
  let densityLabel = 'Safe Perimeter Flow';
  let densityColor = 'text-emerald-400';
  let densityAdvice = 'Comfortable personal space within 10m. Move with normal queue pace.';

  if (totalNearCount >= 10 || immediateCount >= 4) {
    densityCategory = 'CONGESTED';
    densityLabel = 'Tight 10m Density Surge';
    densityColor = 'text-red-400';
    densityAdvice = 'High density detected within 3m! Protect your chest space and follow safe diversion lanes.';
  } else if (totalNearCount >= 6 || immediateCount >= 2) {
    densityCategory = 'MODERATE';
    densityLabel = 'Moderate 10m Queue';
    densityColor = 'text-amber-400';
    densityAdvice = 'Multiple active phones within 3-5m radius. Keep moving forward smoothly without sudden stops.';
  }

  // Interactive Ping Action
  const handleTestPing = (device: NearPhoneDevice) => {
    setPingAlert(`⚡ Ping sent to ${device.name}! Acknowledged in ${device.latencyMs}ms (Round-trip OK).`);
    setTimeout(() => setPingAlert(null), 3500);
  };

  // Interactive Mesh Message Broadcast
  const handleSendMeshMessage = (device: NearPhoneDevice) => {
    if (!customMeshMsg.trim()) return;
    setMsgSentNotice(`💬 Sent "${customMeshMsg}" to ${device.name} via AES-256 Mesh Tunnel!`);
    setCustomMeshMsg('');
    setTimeout(() => setMsgSentNotice(null), 4000);
  };

  // OS Theme styling
  const cardClasses = isLiquidUI
    ? 'liquid-card border-cyan-400/30 bg-slate-900/80 shadow-[0_20px_50px_rgba(6,182,212,0.18)]'
    : isFluentUI
    ? 'bg-[#0f1522] border border-[#2b3952] shadow-2xl rounded-2xl'
    : 'clean-card border-slate-800 bg-slate-900/90 shadow-xl';

  return (
    <div className={`p-4 sm:p-5 space-y-4 relative overflow-hidden ${cardClasses}`}>
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-cyan-500/30 shrink-0 ring-2 ring-cyan-400/40">
            <Radar className={`w-6 h-6 text-white ${isFetchingAll ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <span>10-Meter Near-Field Phone Radar</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-black flex items-center gap-1">
                <Wifi className="w-2.5 h-2.5" />
                <span>AUTO-CONNECTED ({totalNearCount}/{totalNearCount})</span>
              </span>
            </div>
            <p className="text-[11px] text-cyan-300 font-mono font-medium">
              Real-time 10m perimeter detection • Automatic P2P handshake & telemetry fetch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Fetch All Devices Button */}
          <button
            onClick={handleFetchAllDevices}
            disabled={isFetchingAll}
            className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shadow-sm"
            title="Force refresh & fetch live telemetry from all devices within 10m"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetchingAll ? 'animate-spin' : ''}`} />
            <span>{isFetchingAll ? 'Fetching...' : 'Fetch All Devices'}</span>
          </button>

          {onMarkSafe && (
            <button
              onClick={onMarkSafe}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 active:scale-95 shadow-md ${
                isSafeChecked
                  ? 'badge-neon-emerald'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-900/40 border border-emerald-400/40'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSafeChecked ? 'Marked Safe ✓' : "I'm Safe"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Ping/Message Notice Banner */}
      <AnimatePresence>
        {(pingAlert || msgSentNotice) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 bg-cyan-950/90 border border-cyan-400/60 rounded-2xl text-xs text-cyan-200 font-mono font-bold flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{pingAlert || msgSentNotice}</span>
            </div>
            <button
              onClick={() => { setPingAlert(null); setMsgSentNotice(null); }}
              className="text-cyan-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive 10-Meter Radar Scope with Concentric Distance Markers */}
      <div className="relative w-full h-64 sm:h-72 rounded-3xl bg-slate-950/95 border border-cyan-500/35 overflow-hidden shadow-inner">
        {/* Subtle coordinate grid */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Range Concentric Circles: 2.5m, 5.0m, 7.5m, 10.0m */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] sm:w-[250px] h-[220px] sm:h-[250px] rounded-full border border-cyan-500/35 pointer-events-none flex items-center justify-center">
          <span className="absolute top-1 text-[8px] font-mono text-cyan-400/70 font-bold">10.0m (Perimeter Limit)</span>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[165px] sm:w-[190px] h-[165px] sm:h-[190px] rounded-full border border-cyan-500/25 pointer-events-none flex items-center justify-center">
          <span className="absolute top-1 text-[8px] font-mono text-cyan-400/50 font-bold">7.5m</span>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[110px] sm:w-[130px] h-[110px] sm:h-[130px] rounded-full border border-cyan-500/30 pointer-events-none flex items-center justify-center">
          <span className="absolute top-1 text-[8px] font-mono text-cyan-400/60 font-bold">5.0m</span>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[55px] sm:w-[65px] h-[55px] sm:h-[65px] rounded-full border border-emerald-500/50 pointer-events-none flex items-center justify-center">
          <span className="absolute top-0.5 text-[7px] font-mono text-emerald-400 font-bold">2.5m Touch</span>
        </div>

        {/* Crosshair Axes */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-cyan-500/20 pointer-events-none" />
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-cyan-500/20 pointer-events-none" />

        {/* 360-Degree Continuous Rotating Sweep */}
        <div
          style={{
            transform: `rotate(${radarSweepAngle}deg)`,
            transformOrigin: 'center center',
          }}
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
        >
          <div className="w-full h-full bg-[conic-gradient(from_0deg,rgba(6,182,212,0.35)_0deg,transparent_60deg,transparent_360deg)] rounded-full" />
        </div>

        {/* Center Host Dot (YOU) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none">
          <div className="w-5 h-5 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,1)] flex items-center justify-center ring-4 ring-cyan-500/30">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          </div>
          <span className="mt-1 text-[8px] font-mono font-black text-cyan-300 bg-slate-950/90 px-1.5 py-0.2 rounded whitespace-nowrap border border-cyan-500/30 shadow">
            YOU (Host)
          </span>
        </div>

        {/* Detected Devices within 10m (Anchored strictly with CSS left & top so cursor interactions NEVER pull them to center) */}
        {nearbyPhones.map((phone) => {
          // Scale distance (0 to 10m) to radar radius (0 to ~110px)
          const maxRadiusPx = 110;
          const radiusPx = (phone.distanceMeters / 10) * maxRadiusPx;
          const rad = (phone.angleDeg * Math.PI) / 180;
          const x = Math.cos(rad) * radiusPx;
          const y = Math.sin(rad) * radiusPx;

          const isIos = phone.os === 'ios';
          const isInspecting = inspectingDevice?.id === phone.id;

          return (
            <div
              key={phone.id}
              onClick={() => setInspectingDevice(phone)}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group select-none transition-transform duration-200 hover:scale-125 ${
                isInspecting ? 'scale-125 z-40 ring-4 ring-cyan-400/80 rounded-full' : ''
              }`}
              title={`Click to inspect ${phone.name} • ${phone.distanceMeters}m away`}
            >
              {/* Device Icon Orb */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-xl transition-all ${
                  isIos
                    ? 'bg-gradient-to-tr from-sky-400 to-blue-500 text-white shadow-[0_0_12px_rgba(56,189,248,0.9)] ring-2 ring-sky-300/80'
                    : 'bg-gradient-to-tr from-emerald-400 to-teal-500 text-slate-950 shadow-[0_0_12px_rgba(52,211,153,0.9)] ring-2 ring-emerald-300/80'
                }`}
              >
                {isIos ? '' : '🤖'}
              </div>

              {/* Floating Distance Badge above node */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-950/95 px-1.5 py-0.2 rounded border border-white/20 text-[8px] font-mono font-bold text-white whitespace-nowrap shadow-md group-hover:border-cyan-400 transition-colors">
                {phone.distanceMeters}m
              </div>
            </div>
          );
        })}

        {/* Top-Left Live Phone Count Badge */}
        <div className="absolute top-2.5 left-2.5 bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-cyan-500/40 text-xs font-mono z-30 shadow-xl flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,1)]" />
          <span className="text-white font-black text-xs">{totalNearCount} Devices Connected</span>
          <span className="text-[10px] text-cyan-300 font-bold">(&le; 10.0m)</span>
        </div>

        {/* Top-Right OS Breakdown */}
        <div className="absolute top-2.5 right-2.5 bg-slate-900/95 backdrop-blur-md px-2.5 py-1 rounded-2xl border border-white/10 text-[10px] font-mono z-30 shadow-xl flex items-center gap-2 text-slate-300">
          <span className="text-sky-300 flex items-center gap-1 font-bold">
            <span> {iosCount} iOS</span>
          </span>
          <span>•</span>
          <span className="text-emerald-300 flex items-center gap-1 font-bold">
            <span>🤖 {androidCount} Android</span>
          </span>
        </div>

        {/* Bottom Radius Tag */}
        <div className="absolute bottom-2 inset-x-0 flex justify-center z-30 pointer-events-none">
          <span className="text-[9px] font-mono text-cyan-300 bg-slate-950/90 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
            Strict 10-Meter Near-Field Scope • Live Telemetry Stream
          </span>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-3 gap-2.5 relative z-10">
        <div className="bg-slate-950/80 backdrop-blur-xl p-3 rounded-2xl border border-cyan-500/30 text-center shadow-inner">
          <span className="text-[9px] text-cyan-300 block font-extrabold uppercase tracking-wider">
            DEVICES IN 10M
          </span>
          <span className="text-base sm:text-lg font-black text-white font-mono mt-0.5 block">
            {totalNearCount} Active Nodes
          </span>
        </div>

        <div className="bg-slate-950/80 backdrop-blur-xl p-3 rounded-2xl border border-emerald-500/30 text-center shadow-inner">
          <span className="text-[9px] text-emerald-300 block font-extrabold uppercase tracking-wider">
            CLOSEST PHONE
          </span>
          <span className="text-base sm:text-lg font-black text-emerald-300 font-mono mt-0.5 block">
            {nearbyPhones[0] ? `${nearbyPhones[0].distanceMeters}m` : '0m'}
          </span>
        </div>

        <div className="bg-slate-950/80 backdrop-blur-xl p-3 rounded-2xl border border-blue-500/30 text-center shadow-inner">
          <span className="text-[9px] text-blue-300 block font-extrabold uppercase tracking-wider">
            10M DENSITY
          </span>
          <span className={`text-xs sm:text-sm font-black font-mono mt-1 block truncate ${densityColor}`}>
            {densityLabel}
          </span>
        </div>
      </div>

      {/* Live Crowd Safety Guidance based on 10m Density */}
      <div className="p-3 bg-slate-950/90 backdrop-blur-md rounded-2xl border border-amber-500/40 text-xs space-y-1 shadow-inner">
        <div className="flex items-center gap-2 text-amber-300 font-extrabold">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
          <span className="text-[11px] uppercase tracking-wider">10m Physical Queue Advisory</span>
        </div>
        <p className="text-white text-xs leading-relaxed font-bold">
          {densityAdvice}
        </p>
      </div>

      {/* Search & Filter Tabs */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3 h-3 text-cyan-400" />
              <span>Filter:</span>
            </span>

            <button
              onClick={() => setSelectedFilter('ALL')}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition active:scale-95 ${
                selectedFilter === 'ALL'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow'
                  : 'bg-slate-950 text-slate-300 border border-slate-800'
              }`}
            >
              All ({totalNearCount})
            </button>

            <button
              onClick={() => setSelectedFilter('IOS')}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition active:scale-95 flex items-center gap-1 ${
                selectedFilter === 'IOS'
                  ? 'bg-sky-500 text-white font-black shadow'
                  : 'bg-slate-950 text-slate-300 border border-slate-800'
              }`}
            >
              <span> iOS ({iosCount})</span>
            </button>

            <button
              onClick={() => setSelectedFilter('ANDROID')}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition active:scale-95 flex items-center gap-1 ${
                selectedFilter === 'ANDROID'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow'
                  : 'bg-slate-950 text-slate-300 border border-slate-800'
              }`}
            >
              <span>🤖 Android ({androidCount})</span>
            </button>

            <button
              onClick={() => setSelectedFilter('CLOSE')}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition active:scale-95 ${
                selectedFilter === 'CLOSE'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'bg-slate-950 text-slate-300 border border-slate-800'
              }`}
            >
              &le; 3.5m ({immediateCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phone or owner..."
              className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1 text-[11px] text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Connected Phones List with Fetched Payloads */}
        <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
          {filteredPhones.map((phone) => {
            const isIos = phone.os === 'ios';
            const isImmediate = phone.distanceMeters <= 3.0;

            return (
              <div
                key={phone.id}
                onClick={() => setInspectingDevice(phone)}
                className="p-3 rounded-2xl border transition-all cursor-pointer bg-slate-950/85 hover:bg-slate-900 border-white/10 hover:border-cyan-400 shadow-md group"
              >
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* OS Icon Badge */}
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base font-black shrink-0 ${
                        isIos
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-inner'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-inner'
                      }`}
                    >
                      {isIos ? '' : '🤖'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs truncate group-hover:text-cyan-300 transition">
                          {phone.name}
                        </span>
                        <span
                          className={`text-[8px] font-black px-1.5 py-0.2 rounded uppercase font-mono ${
                            isIos
                              ? 'bg-sky-950 text-sky-300 border border-sky-600/40'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                          }`}
                        >
                          {phone.os.toUpperCase()}
                        </span>
                        <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
                          FETCHED
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 truncate mt-0.5">
                        {phone.model} • {phone.ownerName}
                      </p>
                      <p className="text-[9px] text-cyan-400/80 font-mono truncate">
                        {phone.chipset}
                      </p>
                    </div>
                  </div>

                  {/* Distance & Telemetry Pill */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      <span
                        className={`text-xs font-black font-mono px-2 py-0.5 rounded-lg border ${
                          isImmediate
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 animate-pulse'
                            : 'bg-slate-900 text-cyan-300 border-cyan-500/30'
                        }`}
                      >
                        {phone.distanceMeters} m
                      </span>
                    </div>
                    <div className="flex items-center gap-2 justify-end text-[9px] text-slate-400 font-mono mt-1">
                      <span className="flex items-center gap-0.5 text-cyan-300">
                        <Signal className="w-2.5 h-2.5" />
                        <span>{phone.rssi} dBm</span>
                      </span>
                      <span className="flex items-center gap-0.5 text-emerald-400">
                        <Battery className="w-2.5 h-2.5" />
                        <span>{phone.battery}%</span>
                      </span>
                    </div>
                    <span className="text-[8px] text-slate-400 font-mono block mt-0.5">
                      {phone.packetsSynced.toLocaleString()} pkts synced
                    </span>
                  </div>
                </div>

                {/* Quick Action Strip on Hover */}
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="text-cyan-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>{phone.linkSpeedMbps} Mbps Direct Link</span>
                  </span>
                  <span className="text-slate-300 group-hover:text-white flex items-center gap-1 font-bold">
                    <span>Inspect Hardware & Telemetry</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deep Device Telemetry & Hardware Inspector Modal */}
      <AnimatePresence>
        {inspectingDevice && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-950 border border-cyan-500/40 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 font-sans"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-white/10 bg-slate-900/90 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 ${
                      inspectingDevice.os === 'ios'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-400/50'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                    }`}
                  >
                    {inspectingDevice.os === 'ios' ? '' : '🤖'}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>{inspectingDevice.name}</span>
                      <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono font-bold">
                        CONNECTED
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {inspectingDevice.model} • {inspectingDevice.ownerName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectingDevice(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar text-xs">
                {/* Distance & Spatial Lock */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                  <div className="p-2.5 bg-slate-900/90 rounded-2xl border border-cyan-500/30">
                    <span className="text-[9px] text-cyan-300 block uppercase font-bold">Exact Distance</span>
                    <span className="text-base font-black text-white mt-0.5 block">{inspectingDevice.distanceMeters} m</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/90 rounded-2xl border border-emerald-500/30">
                    <span className="text-[9px] text-emerald-300 block uppercase font-bold">Battery State</span>
                    <span className="text-base font-black text-emerald-400 mt-0.5 block">{inspectingDevice.battery}% {inspectingDevice.isCharging ? '⚡' : ''}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/90 rounded-2xl border border-blue-500/30">
                    <span className="text-[9px] text-blue-300 block uppercase font-bold">Signal (RSSI)</span>
                    <span className="text-base font-black text-cyan-300 mt-0.5 block">{inspectingDevice.rssi} dBm</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/90 rounded-2xl border border-purple-500/30">
                    <span className="text-[9px] text-purple-300 block uppercase font-bold">Azimuth Bearing</span>
                    <span className="text-base font-black text-purple-300 mt-0.5 block">{Math.round(inspectingDevice.angleDeg)}°</span>
                  </div>
                </div>

                {/* Hardware Specifications Fetched */}
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-white/10 space-y-2 font-mono">
                  <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider block flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Fetched Hardware & Architecture Telemetry</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div className="p-2 bg-slate-950 rounded-xl border border-white/5">
                      <span className="text-[9px] text-slate-400 block">Silicon / SoC</span>
                      <span className="font-bold text-white">{inspectingDevice.chipset}</span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-white/5">
                      <span className="text-[9px] text-slate-400 block">Operating System Build</span>
                      <span className="font-bold text-white">{inspectingDevice.osVersion}</span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-white/5">
                      <span className="text-[9px] text-slate-400 block">P2P Mesh Node UUID</span>
                      <span className="font-bold text-cyan-300">{inspectingDevice.meshUuid}</span>
                    </div>
                    <div className="p-2 bg-slate-950 rounded-xl border border-white/5">
                      <span className="text-[9px] text-slate-400 block">UWB Spatial Radar Ranging</span>
                      <span className={`font-bold ${inspectingDevice.uwbSpatial ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {inspectingDevice.uwbSpatial ? 'Active (Centimeter Precision)' : 'BLE RSSI Estimated'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Telemetry Stream Terminal */}
                <div className="p-3.5 bg-black/90 rounded-2xl border border-cyan-500/30 space-y-2 font-mono">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-cyan-400 font-bold flex items-center gap-1">
                      <Terminal className="w-3 h-3" />
                      <span>Live Telemetry Packet Log</span>
                    </span>
                    <span className="text-emerald-400">{inspectingDevice.packetsSynced} pkts</span>
                  </div>

                  <div className="space-y-1 text-[10px] text-slate-300 max-h-28 overflow-y-auto custom-scrollbar">
                    {inspectingDevice.telemetryLogs.map((log, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-cyan-200">
                        <span className="text-cyan-500 select-none">&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))}
                    <div className="flex items-start gap-1.5 text-emerald-300 animate-pulse">
                      <span className="text-emerald-500 select-none">&gt;</span>
                      <span>[Continuous Stream] Latency {inspectingDevice.latencyMs}ms • AES-256 Verified</span>
                    </div>
                  </div>
                </div>

                {/* Interactive Mesh Actions */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider block">
                    Interactive Mesh Actions
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleTestPing(inspectingDevice)}
                      className="p-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Test Ping ({inspectingDevice.latencyMs}ms)</span>
                    </button>

                    <button
                      onClick={() => {
                        setPingAlert(`🚨 SOS Safety Beacon Synced with ${inspectingDevice.name}!`);
                        setTimeout(() => setPingAlert(null), 3500);
                      }}
                      className="p-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Sync SOS Beacon</span>
                    </button>
                  </div>

                  {/* Send Quick Offline Mesh Text */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={customMeshMsg}
                      onChange={(e) => setCustomMeshMsg(e.target.value)}
                      placeholder={`Send offline mesh message to ${inspectingDevice.ownerName}...`}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      onClick={() => handleSendMeshMessage(inspectingDevice)}
                      disabled={!customMeshMsg.trim()}
                      className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold rounded-xl flex items-center gap-1 transition active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-3 border-t border-white/10 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span>AES-256 GCM P2P Mesh Tunnel</span>
                </span>
                <button
                  onClick={() => setInspectingDevice(null)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
