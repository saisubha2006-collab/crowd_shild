import React, { useState, useEffect } from 'react';
import { EventItem, Zone, AIDetectedHazard } from '../../types';
import {
  MapPin, Navigation, LocateFixed, Flag, Compass, Search,
  ExternalLink, ShieldCheck, Sparkles, HeartPulse, HelpCircle,
  Droplets, Shield, Wifi, WifiOff, Layers, CheckCircle2,
  AlertOctagon, Camera, Eye, Radio, Activity, Zap, DoorOpen
} from 'lucide-react';
import { TrackedPerson } from './CitizenPeopleTracker';
import { calculateDistanceKm, formatDistance, estimateWalkMinutes, searchLocations, GeocodedAddress } from '../../utils/geoUtils';
import { getAIHazards, subscribeAIHazards } from '../../utils/aiHazardStore';

interface Props {
  event: EventItem;
  zones: Zone[];
  userCoords: [number, number];
  onSelectRoute: () => void;
  onOpenAICamera?: () => void;
  trackedPeople?: TrackedPerson[];
}

export const CitizenMap: React.FC<Props> = ({
  event,
  zones,
  userCoords,
  onSelectRoute,
  onOpenAICamera,
  trackedPeople = [],
}) => {
  const [liveUserCoords, setLiveUserCoords] = useState<[number, number]>(userCoords);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [isDeviceOnline, setIsDeviceOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // AI Camera Detected Hazards state
  const [aiHazards, setAiHazards] = useState<AIDetectedHazard[]>(getAIHazards());
  const [selectedHazard, setSelectedHazard] = useState<AIDetectedHazard | null>(null);

  // Destination Search & Autocomplete State
  const [destName, setDestName] = useState<string | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<GeocodedAddress[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Subscribe to live AI camera hazard broadcasts
  useEffect(() => {
    return subscribeAIHazards((hazards) => setAiHazards(hazards));
  }, []);

  // Synchronize liveUserCoords if parent userCoords prop updates
  useEffect(() => {
    if (userCoords && userCoords[0] && userCoords[1]) {
      setLiveUserCoords(userCoords);
    }
  }, [userCoords]);

  // Online / Offline tracking
  useEffect(() => {
    const onOnline = () => setIsDeviceOnline(true);
    const onOffline = () => setIsDeviceOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Automatic Device Geolocation Acquisition & Continuous High Accuracy Tracking
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setLiveUserCoords(coords);
          setGpsAccuracy(Math.round(pos.coords.accuracy));
          setIsGpsActive(true);
        },
        (err) => {
          console.warn('Geolocation access issue:', err);
          setIsGpsActive(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );

      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setLiveUserCoords([pos.coords.latitude, pos.coords.longitude]);
          setGpsAccuracy(Math.round(pos.coords.accuracy));
          setIsGpsActive(true);
        },
        (err) => console.warn('Geo watch err:', err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Handle Autocomplete Location Search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 1) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchLocations(searchQuery);
      setSearchResults(res);
      setIsSearching(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchResult = (item: GeocodedAddress) => {
    const coords: [number, number] = [item.lat, item.lon];
    const name = item.city ? `${item.displayName.split(',')[0]} (${item.city})` : item.displayName.split(',')[0];
    setDestName(name);
    setDestCoords(coords);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSelectHazard = (hazard: AIDetectedHazard) => {
    setSelectedHazard(hazard);
    setDestName(hazard.label);
    setDestCoords(hazard.coordinates);
  };

  // Selected Destination calculations
  const distKm = destCoords
    ? calculateDistanceKm(liveUserCoords[0], liveUserCoords[1], destCoords[0], destCoords[1])
    : 0;
  const formattedDist = destCoords ? formatDistance(distKm) : '';
  const walkMins = destCoords ? estimateWalkMinutes(distKm, 3.5) : 0;
  const driveMins = destCoords ? Math.max(1, Math.round((distKm / 35) * 60)) : 0;

  const googleMapsUrl = destCoords
    ? `https://www.google.com/maps/dir/?api=1&origin=${liveUserCoords[0]},${liveUserCoords[1]}&destination=${destCoords[0]},${destCoords[1]}&travelmode=walking`
    : `https://www.google.com/maps?q=${liveUserCoords[0]},${liveUserCoords[1]}`;

  const handleClearRoute = () => {
    setDestName(null);
    setDestCoords(null);
    setSelectedHazard(null);
    setSearchQuery('');
  };

  const handleRecenterToUser = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLiveUserCoords([pos.coords.latitude, pos.coords.longitude]);
        setGpsAccuracy(Math.round(pos.coords.accuracy));
        setIsGpsActive(true);
      });
    }
  };

  // Google Maps Embed Query String
  const mapCenterQuery = destCoords
    ? `${destCoords[0]},${destCoords[1]}`
    : `${liveUserCoords[0]},${liveUserCoords[1]}`;

  return (
    <div className="space-y-3.5 text-slate-100">
      {/* Top Header Bar */}
      <div className="clean-card liquid-card p-4 sm:p-5 border-cyan-500/30 bg-slate-900/85 shadow-[0_15px_40px_rgba(6,182,212,0.12)] relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-cyan-500/30 shrink-0">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full badge-neon-cyan inline-block">
                  LIVE SYSTEMS RADAR
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 ${
                  isDeviceOnline
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-950/80 text-red-300 border border-red-500/30 animate-pulse'
                }`}>
                  {isDeviceOnline ? <Wifi className="w-2.5 h-2.5 text-emerald-400" /> : <WifiOff className="w-2.5 h-2.5 text-red-400" />}
                  <span>{isDeviceOnline ? 'GPS ONLINE' : 'GPS OFFLINE'}</span>
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-1 flex items-center gap-2">
                <span>Live Systems & AI Hazard Map</span>
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </h2>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {onOpenAICamera && (
              <button
                onClick={onOpenAICamera}
                className="p-2 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-cyan-500/20"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>AI Camera</span>
              </button>
            )}

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 px-3 bg-slate-950 hover:bg-slate-800 border border-white/15 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-md"
            >
              <ExternalLink className="w-3.5 h-3.5 text-cyan-300" />
              <span className="hidden sm:inline">Google Maps</span>
            </a>
          </div>
        </div>

        {/* GPS Sensor status bar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5 bg-slate-950/70 backdrop-blur-xl p-3 rounded-2xl border border-white/10 text-xs shadow-inner">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)] animate-ping"></span>
            <span className="text-slate-200 font-bold">Exact Device Hardware GPS:</span>
            <span className="font-mono text-cyan-300 text-xs font-black">
              {liveUserCoords[0].toFixed(5)}° N, {liveUserCoords[1].toFixed(5)}° E
            </span>
          </div>
          <span className="text-[10px] text-emerald-300 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
            {aiHazards.length} AI Objects Synced
          </span>
        </div>
      </div>

      {/* Search Location Bar */}
      <div className="bg-slate-950/80 border border-cyan-800/80 p-3 rounded-2xl space-y-2 text-xs text-slate-100 relative z-30 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="font-bold text-cyan-300 flex items-center gap-1">
            <Search className="w-3.5 h-3.5" /> Search Event Gates, Relief Hubs & Hazards:
          </span>
          {destName && (
            <button
              onClick={handleClearRoute}
              className="text-[11px] text-red-400 hover:text-red-300 font-bold underline"
            >
              Clear Selected
            </button>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search e.g. Gate 1, Relief Camp, North Exit, Medical Post..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 pr-8 text-white font-semibold text-xs focus:outline-none focus:border-cyan-400"
          />
          {isSearching && (
            <div className="absolute right-2.5 top-2.5 text-cyan-400 text-xs animate-spin">
              ⏳
            </div>
          )}

          {/* Autocomplete Suggestions Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-52 overflow-y-auto z-50 divide-y divide-slate-800">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSearchResult(item)}
                  className="w-full text-left p-2.5 hover:bg-slate-800 flex items-start gap-2 text-xs text-slate-200 transition"
                >
                  <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">{item.displayName.split(',')[0]}</span>
                    <span className="text-[10px] text-slate-300 line-clamp-1">{item.displayName}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Destination Banner */}
        {destName && (
          <div className="bg-emerald-950/80 border border-emerald-600 p-2.5 rounded-xl flex items-center justify-between text-xs text-emerald-200 shadow">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-black text-white block">{destName}</span>
                <span className="text-[10px] text-emerald-200 font-mono">
                  Distance: {formattedDist} • ~{walkMins}m walk
                </span>
              </div>
            </div>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[11px] font-black flex items-center gap-1 shadow shrink-0"
            >
              <Navigation className="w-3.5 h-3.5" /> Start Navigation
            </a>
          </div>
        )}
      </div>

      {/* Direct Google Maps Live Systems Viewport */}
      <div className="relative w-full h-[380px] sm:h-[420px] rounded-3xl overflow-hidden border border-cyan-500/30 shadow-2xl bg-slate-950">
        <iframe
          title="Live Systems Radar Map"
          src={`https://maps.google.com/maps?q=${mapCenterQuery}&z=16&output=embed`}
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
        />

        {/* Live GPS Status Chip */}
        <div className="absolute top-3 left-3 z-20 bg-slate-950/85 backdrop-blur-md p-2.5 rounded-2xl border border-white/15 text-[10px] space-y-1 text-slate-200 shadow-xl">
          <div className="flex items-center gap-1.5 font-black text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>LIVE SYSTEMS TRACKING ACTIVE</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-[9px] text-slate-300 font-mono">
            <span>Lat: {liveUserCoords[0].toFixed(4)}°, Lng: {liveUserCoords[1].toFixed(4)}°</span>
            {gpsAccuracy && <span className="text-emerald-400 font-bold">±{gpsAccuracy}m</span>}
          </div>
        </div>

        {/* Recenter Button */}
        <button
          onClick={handleRecenterToUser}
          className="absolute bottom-3 right-3 z-20 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl shadow-xl border border-blue-400/40 flex items-center gap-1.5 text-xs font-black transition active:scale-95"
        >
          <LocateFixed className="w-4 h-4 text-white" />
          <span>Sync GPS</span>
        </button>
      </div>

      {/* Real-time AI Camera Detected Objects & Hazards Stream */}
      <div className="clean-card liquid-card p-4 sm:p-5 space-y-3.5 border-cyan-500/30 bg-slate-900/85 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center justify-center shadow-inner">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                Live AI Camera Objects & Hazard Pins ({aiHazards.length})
              </h3>
              <span className="text-[10px] text-cyan-300 font-mono font-medium">
                Real-time computer vision detections broadcasted by event cameras & citizens
              </span>
            </div>
          </div>

          {onOpenAICamera && (
            <button
              onClick={onOpenAICamera}
              className="bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-500/40 text-xs font-black px-3 py-1.5 rounded-xl transition active:scale-95 flex items-center gap-1 shadow-sm"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-300" />
              <span>Detect New Object</span>
            </button>
          )}
        </div>

        {/* Hazard List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto custom-scrollbar pt-1">
          {aiHazards.map((hazard) => {
            const isSelected = selectedHazard?.id === hazard.id;
            const dist = calculateDistanceKm(liveUserCoords[0], liveUserCoords[1], hazard.coordinates[0], hazard.coordinates[1]);

            return (
              <div
                key={hazard.id}
                onClick={() => handleSelectHazard(hazard)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between gap-2 text-xs shadow-md ${
                  isSelected
                    ? 'bg-cyan-950/90 border-cyan-400 ring-2 ring-cyan-500/50'
                    : 'bg-slate-950/80 hover:bg-slate-900/90 border-white/10'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded-md font-black ${
                      hazard.riskLevel === 'CRITICAL' ? 'bg-red-600 text-white' :
                      hazard.riskLevel === 'HIGH' ? 'bg-amber-600 text-white' :
                      hazard.riskLevel === 'MODERATE' ? 'bg-yellow-600 text-white' :
                      'bg-emerald-600 text-white'
                    }`}>
                      {hazard.riskLevel} RISK
                    </span>
                    <span className="text-[10px] text-cyan-300 font-mono font-bold">
                      {hazard.confidence}% Conf • {hazard.timestamp}
                    </span>
                  </div>

                  <h4 className="font-black text-white text-xs block">
                    {hazard.label}
                  </h4>
                  <p className="text-[11px] text-slate-200 font-medium line-clamp-2">
                    {hazard.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                  <span className="text-slate-300 font-mono">
                    📍 {formatDistance(dist)} from your device
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectHazard(hazard);
                    }}
                    className="text-cyan-300 hover:text-white font-black flex items-center gap-1"
                  >
                    <span>Locate on Map</span>
                    <Navigation className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
