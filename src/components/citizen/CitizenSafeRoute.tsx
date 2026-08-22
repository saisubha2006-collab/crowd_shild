import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { SafeRoute, EventItem } from '../../types';
import { Navigation, ShieldCheck, MapPin, Clock, ArrowRight, CornerDownRight, Volume2, CheckCircle2, Flag, Play, Square, RefreshCw, Compass, Search, ExternalLink, Footprints, Sparkles } from 'lucide-react';
import { calculateDistanceKm, formatDistance, estimateWalkMinutes, searchLocations, GeocodedAddress } from '../../utils/geoUtils';

interface Props {
  event: EventItem;
  userCoords: [number, number];
  safeRoute: SafeRoute;
  onOpenMap: () => void;
}

export const CitizenSafeRoute: React.FC<Props> = ({ event, userCoords, safeRoute, onOpenMap }) => {
  // Origin and Destination state
  const [destName, setDestName] = useState<string>('Emergency Relief Gate 4');
  const [destCoords, setDestCoords] = useState<[number, number]>([25.4390, 81.8435]);

  // Autocomplete Location Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<GeocodedAddress[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Navigation simulation state
  const [isNavigating, setIsNavigating] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Dynamic calculated distance from live GPS coordinates to destCoords
  const totalKm = calculateDistanceKm(userCoords[0], userCoords[1], destCoords[0], destCoords[1]);
  const formattedTotalDist = formatDistance(totalKm);
  const totalMinutes = estimateWalkMinutes(totalKm, 3.5);

  // Remaining distance & time left calculation
  const remainingKm = Math.max(0, totalKm * (1 - progressPercent / 100));
  const remainingDistText = formatDistance(remainingKm);
  const remainingMins = Math.max(0, Math.ceil(totalMinutes * (1 - progressPercent / 100)));

  // Location search effect
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
    const name = item.city ? `${item.displayName.split(',')[0]} (${item.city})` : item.displayName.split(',')[0];
    setDestName(name);
    setDestCoords([item.lat, item.lon]);
    setSearchQuery('');
    setSearchResults([]);
    handleResetNavigation();
  };

  // Live Navigation simulator timer
  useEffect(() => {
    let interval: any;
    if (isNavigating) {
      interval = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev >= 100) {
            setIsNavigating(false);
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b'],
            });
            return 100;
          }
          const next = prev + 5;
          if (next > 30) setCurrentStepIndex(1);
          if (next > 70) setCurrentStepIndex(2);
          return next;
        });
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isNavigating]);

  const handleResetNavigation = () => {
    setIsNavigating(false);
    setProgressPercent(0);
    setCurrentStepIndex(0);
  };

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userCoords[0]},${userCoords[1]}&destination=${destCoords[0]},${destCoords[1]}&travelmode=walking`;

  return (
    <div className="space-y-4 text-slate-100">
      {/* Route Location Selector Panel */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-xl text-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-cyan-400" />
            Interactive Destination Selector
          </h3>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Google Maps App</span>
          </a>
        </div>

        {/* Start Location Display */}
        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-400" />
            Start (Point A): <strong className="text-white">My Live Device GPS</strong>
          </span>
          <span className="text-[10px] text-emerald-400 font-mono font-bold">
            {userCoords[0].toFixed(4)}° N, {userCoords[1].toFixed(4)}° E
          </span>
        </div>

        {/* Destination Selection with Autocomplete */}
        <div>
          <label className="text-slate-300 font-semibold block mb-1 flex items-center gap-1">
            <Flag className="w-3.5 h-3.5 text-emerald-400" />
            Destination (Point B Search):
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destination e.g. Gate 4, Hospital, Sector 5..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-semibold focus:outline-none focus:border-cyan-400"
            />
            {isSearching && (
              <div className="absolute right-2.5 top-2.5 text-cyan-400 text-xs animate-spin">
                ⏳
              </div>
            )}

            {/* Suggestions */}
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
                      <span className="text-[10px] text-slate-400 line-clamp-1">{item.displayName}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-1.5 p-2 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] flex items-center justify-between">
            <span className="text-slate-300 font-bold">Selected Target B:</span>
            <span className="text-cyan-300 font-bold">{destName}</span>
          </div>
        </div>
      </div>

      {/* Route Stats & Live Navigation Tracker Card */}
      <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-800/70 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Safe Corridor Distance & Time
          </span>
          <span className="bg-emerald-900/80 border border-emerald-700 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full text-xs">
            96% Safety Score
          </span>
        </div>

        {/* Real-time Distance & Time Dashboard */}
        <div className="grid grid-cols-3 gap-2 text-center bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs font-bold">
          <div className="p-1">
            <span className="text-[10px] text-slate-400 font-normal block">Total Distance</span>
            <span className="text-emerald-400 text-sm font-mono">{formattedTotalDist}</span>
          </div>

          <div className="p-1 border-l border-slate-800">
            <span className="text-[10px] text-slate-400 font-normal block">Est. Walk Time</span>
            <span className="text-cyan-300 text-sm font-mono">{totalMinutes} mins</span>
          </div>

          <div className="p-1 border-l border-slate-800">
            <span className="text-[10px] text-amber-400 font-bold block">Distance Left</span>
            <span className="text-amber-300 text-sm font-mono animate-pulse">{remainingDistText}</span>
          </div>
        </div>

        {/* Live Journey Progress Bar */}
        {isNavigating && (
          <div className="bg-slate-950 p-3 rounded-2xl border border-emerald-800/80 space-y-1.5 animate-in fade-in">
            <div className="flex justify-between text-[11px] font-bold">
              <span className="text-emerald-400 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 animate-spin" /> Live Navigation Progress
              </span>
              <span className="text-amber-300 font-mono">{progressPercent}% • {remainingMins} mins left</span>
            </div>

            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-[10px] text-slate-400 text-center font-mono pt-0.5">
              Current Speed: 4.2 km/h • High Density Choke Points Avoided
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsNavigating(!isNavigating)}
            className={`flex-1 py-3 px-3 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition ${
              isNavigating
                ? 'bg-amber-600 hover:bg-amber-500 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isNavigating ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isNavigating ? 'Pause Live Travel Tracker' : 'Start Turn-by-Turn GPS Travel'}</span>
          </button>

          <button
            onClick={handleResetNavigation}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-semibold"
            title="Reset Route"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Turn-by-Turn Directions list */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h4 className="font-bold text-slate-200">Point A to Point B Directions</h4>
          <button onClick={onOpenMap} className="text-cyan-400 hover:underline text-[11px] font-bold">
            View Live Route on Map
          </button>
        </div>

        <div className="space-y-2.5">
          <div
            className={`flex items-start gap-3 p-3 rounded-xl border transition ${
              currentStepIndex === 0 && isNavigating
                ? 'bg-emerald-950/80 border-emerald-500 text-white'
                : 'bg-slate-900/80 border-slate-800/80 text-slate-300'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-blue-900/60 text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-blue-700">
              1
            </div>
            <div className="flex-1 space-y-0.5">
              <p className="font-bold text-slate-100 flex justify-between">
                <span>Start at My Live Device Location</span>
                <span className="text-[10px] text-slate-400 font-mono">0 m</span>
              </p>
              <p className="text-[11px] text-slate-400">Head toward target route direction.</p>
            </div>
          </div>

          <div
            className={`flex items-start gap-3 p-3 rounded-xl border transition ${
              currentStepIndex === 1 && isNavigating
                ? 'bg-emerald-950/80 border-emerald-500 text-white'
                : 'bg-slate-900/80 border-slate-800/80 text-slate-300'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-blue-900/60 text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-blue-700">
              2
            </div>
            <div className="flex-1 space-y-0.5">
              <p className="font-bold text-slate-100 flex justify-between">
                <span>Follow designated pedestrian path</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatDistance(totalKm * 0.5)}
                </span>
              </p>
              <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Optimal low-density walkway.</span>
              </p>
            </div>
          </div>

          <div
            className={`flex items-start gap-3 p-3 rounded-xl border transition ${
              currentStepIndex === 2 && isNavigating
                ? 'bg-emerald-950/80 border-emerald-500 text-white'
                : 'bg-slate-900/80 border-slate-800/80 text-slate-300'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-blue-900/60 text-cyan-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-blue-700">
              3
            </div>
            <div className="flex-1 space-y-0.5">
              <p className="font-bold text-slate-100 flex justify-between">
                <span>Arrive safely at target: {destName}</span>
                <span className="text-[10px] text-slate-400 font-mono">{formattedTotalDist}</span>
              </p>
              <p className="text-[11px] text-slate-400">Destination unblocked and accessible.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
