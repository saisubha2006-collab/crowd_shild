import React, { useState, useEffect } from 'react';
import { EventItem } from '../../types';
import {
  HeartPulse,
  Fuel,
  Hotel,
  Shield,
  Wrench,
  Milestone,
  Bus,
  MapPin,
  Navigation,
  Phone,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  Compass,
  Layers,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  ServiceCategory,
  NearbyPlace,
  CATEGORY_META,
  getNearbyPlacesForCoords,
} from '../../utils/nearbyServices';

interface Props {
  event: EventItem;
  userCoords?: [number, number];
  onNavigateToMap: () => void;
  onSelectRouteToPlace?: (place: NearbyPlace) => void;
}

export const CitizenEventInfo: React.FC<Props> = ({
  event,
  userCoords = [25.4362, 81.8488],
  onNavigateToMap,
  onSelectRouteToPlace,
}) => {
  const [deviceCoords, setDeviceCoords] = useState<[number, number]>(userCoords);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);

  // Auto get real device location from browser
  const refreshLocation = () => {
    if ('geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDeviceCoords([pos.coords.latitude, pos.coords.longitude]);
          setIsLocating(false);
        },
        (err) => {
          console.warn('Geolocation lookup notice:', err);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  useEffect(() => {
    if (userCoords && userCoords[0] && userCoords[1]) {
      setDeviceCoords(userCoords);
    }
  }, [userCoords]);

  useEffect(() => {
    refreshLocation();
  }, []);

  const allNearbyPlaces = getNearbyPlacesForCoords(deviceCoords[0], deviceCoords[1], selectedCategory);

  const filteredPlaces = allNearbyPlaces.filter((place) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      place.name.toLowerCase().includes(q) ||
      place.address.toLowerCase().includes(q) ||
      place.categoryLabel.toLowerCase().includes(q) ||
      place.notes?.toLowerCase().includes(q)
    );
  });

  const categoryCounts = {
    HOSPITAL: getNearbyPlacesForCoords(deviceCoords[0], deviceCoords[1], 'HOSPITAL').length,
    PETROL_PUMP: getNearbyPlacesForCoords(deviceCoords[0], deviceCoords[1], 'PETROL_PUMP').length,
    HOTEL: getNearbyPlacesForCoords(deviceCoords[0], deviceCoords[1], 'HOTEL').length,
    POLICE_STATION: getNearbyPlacesForCoords(deviceCoords[0], deviceCoords[1], 'POLICE_STATION').length,
    GARAGE: getNearbyPlacesForCoords(deviceCoords[0], deviceCoords[1], 'GARAGE').length,
    TOLL_GATE: getNearbyPlacesForCoords(deviceCoords[0], deviceCoords[1], 'TOLL_GATE').length,
    BUS_STOP: getNearbyPlacesForCoords(deviceCoords[0], deviceCoords[1], 'BUS_STOP').length,
  };

  const getCategoryIcon = (category: ServiceCategory) => {
    switch (category) {
      case 'HOSPITAL':
        return <HeartPulse className="w-4 h-4 text-red-400" />;
      case 'PETROL_PUMP':
        return <Fuel className="w-4 h-4 text-amber-400" />;
      case 'HOTEL':
        return <Hotel className="w-4 h-4 text-indigo-400" />;
      case 'POLICE_STATION':
        return <Shield className="w-4 h-4 text-blue-400" />;
      case 'GARAGE':
        return <Wrench className="w-4 h-4 text-emerald-400" />;
      case 'TOLL_GATE':
        return <Milestone className="w-4 h-4 text-purple-400" />;
      case 'BUS_STOP':
        return <Bus className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-4 text-slate-100">
      {/* Header & Live Device Location GPS Pill */}
      <div className="clean-card liquid-card p-4 sm:p-5 space-y-3.5 border-cyan-500/30 bg-slate-900/85 shadow-[0_15px_40px_rgba(6,182,212,0.12)] relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2.5 relative z-10">
          <div>
            <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full badge-neon-cyan inline-block">
              REAL-TIME CIVIC SERVICES
            </span>
            <h2 className="text-base sm:text-lg font-black text-white mt-1.5 flex items-center gap-2">
              <span>Nearby Essential Services & POIs</span>
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </h2>
            <p className="text-xs text-slate-300 font-medium">
              Live verified distances and turns calculated from your exact device hardware GPS
            </p>
          </div>

          <button
            onClick={refreshLocation}
            disabled={isLocating}
            className="p-2 px-3.5 btn-glow-cyan text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-md"
            title="Refresh GPS Coordinates"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'Refresh GPS'}</span>
          </button>
        </div>

        {/* Device GPS Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-950/70 backdrop-blur-xl p-3 rounded-2xl border border-white/10 text-xs shadow-inner">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)] animate-ping"></span>
            <span className="text-slate-200 font-bold">Your Exact Coordinates:</span>
            <span className="font-mono text-cyan-300 text-xs font-black">
              {deviceCoords[0].toFixed(5)}° N, {deviceCoords[1].toFixed(5)}° E
            </span>
          </div>
          <span className="text-[10px] text-emerald-300 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
            {filteredPlaces.length} Locations Ready
          </span>
        </div>
      </div>

      {/* 7 Fast Category Selector Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-300 px-1">
          <span className="font-black uppercase tracking-wider text-[10px] text-cyan-300">
            Filter by Essential Category
          </span>
          <span className="font-bold text-[11px]">7 Real-Time Services</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* ALL */}
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition active:scale-95 backdrop-blur-md shadow-md ${
              selectedCategory === 'ALL'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-cyan-300 text-white font-black shadow-blue-500/30 ring-2 ring-blue-400/40'
                : 'bg-slate-950/80 border-white/10 text-slate-300 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-cyan-300" />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-black block truncate">All Facilities</span>
              <span className="text-[10px] text-slate-400">{allNearbyPlaces.length} Places</span>
            </div>
          </button>

          {/* 1. HOSPITAL */}
          <button
            onClick={() => setSelectedCategory('HOSPITAL')}
            className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition active:scale-95 backdrop-blur-md shadow-md ${
              selectedCategory === 'HOSPITAL'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 border-red-300 text-white font-black shadow-red-500/30 ring-2 ring-red-400/40'
                : 'bg-slate-950/80 border-red-500/30 text-red-200 hover:bg-slate-900'
            }`}
          >
            <HeartPulse className="w-4 h-4 text-red-400" />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-black block truncate">Hospital</span>
              <span className="text-[10px] opacity-80">{categoryCounts.HOSPITAL} Nearby</span>
            </div>
          </button>

          {/* 2. PETROL PUMP */}
          <button
            onClick={() => setSelectedCategory('PETROL_PUMP')}
            className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition active:scale-95 backdrop-blur-md shadow-md ${
              selectedCategory === 'PETROL_PUMP'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 border-amber-300 text-white font-black shadow-amber-500/30 ring-2 ring-amber-400/40'
                : 'bg-slate-950/80 border-amber-500/30 text-amber-200 hover:bg-slate-900'
            }`}
          >
            <Fuel className="w-4 h-4 text-amber-400" />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-black block truncate">Petrol Pump</span>
              <span className="text-[10px] opacity-80">{categoryCounts.PETROL_PUMP} Nearby</span>
            </div>
          </button>

          {/* 3. HOTEL */}
          <button
            onClick={() => setSelectedCategory('HOTEL')}
            className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition active:scale-95 backdrop-blur-md shadow-md ${
              selectedCategory === 'HOTEL'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-300 text-white font-black shadow-indigo-500/30 ring-2 ring-indigo-400/40'
                : 'bg-slate-950/80 border-indigo-500/30 text-indigo-200 hover:bg-slate-900'
            }`}
          >
            <Hotel className="w-4 h-4 text-indigo-400" />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-black block truncate">Hotel / Lodge</span>
              <span className="text-[10px] opacity-80">{categoryCounts.HOTEL} Nearby</span>
            </div>
          </button>

          {/* 4. POLICE STATION */}
          <button
            onClick={() => setSelectedCategory('POLICE_STATION')}
            className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition active:scale-95 backdrop-blur-md shadow-md ${
              selectedCategory === 'POLICE_STATION'
                ? 'bg-gradient-to-r from-blue-600 to-sky-600 border-blue-300 text-white font-black shadow-blue-500/30 ring-2 ring-blue-400/40'
                : 'bg-slate-950/80 border-blue-500/30 text-blue-200 hover:bg-slate-900'
            }`}
          >
            <Shield className="w-4 h-4 text-blue-400" />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-black block truncate">Police Station</span>
              <span className="text-[10px] opacity-80">{categoryCounts.POLICE_STATION} Nearby</span>
            </div>
          </button>

          {/* 5. GARAGE */}
          <button
            onClick={() => setSelectedCategory('GARAGE')}
            className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition active:scale-95 backdrop-blur-md shadow-md ${
              selectedCategory === 'GARAGE'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-300 text-white font-black shadow-emerald-500/30 ring-2 ring-emerald-400/40'
                : 'bg-slate-950/80 border-emerald-500/30 text-emerald-200 hover:bg-slate-900'
            }`}
          >
            <Wrench className="w-4 h-4 text-emerald-400" />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-black block truncate">Garage / Towing</span>
              <span className="text-[10px] opacity-80">{categoryCounts.GARAGE} Nearby</span>
            </div>
          </button>

          {/* 6. TOLL GATE */}
          <button
            onClick={() => setSelectedCategory('TOLL_GATE')}
            className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition active:scale-95 backdrop-blur-md shadow-md ${
              selectedCategory === 'TOLL_GATE'
                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 border-purple-300 text-white font-black shadow-purple-500/30 ring-2 ring-purple-400/40'
                : 'bg-slate-950/80 border-purple-500/30 text-purple-200 hover:bg-slate-900'
            }`}
          >
            <Milestone className="w-4 h-4 text-purple-400" />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-black block truncate">Toll Plaza</span>
              <span className="text-[10px] opacity-80">{categoryCounts.TOLL_GATE} Nearby</span>
            </div>
          </button>

          {/* 7. BUS STOP */}
          <button
            onClick={() => setSelectedCategory('BUS_STOP')}
            className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition active:scale-95 backdrop-blur-md shadow-md ${
              selectedCategory === 'BUS_STOP'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 border-cyan-300 text-white font-black shadow-cyan-500/30 ring-2 ring-cyan-400/40'
                : 'bg-slate-950/80 border-cyan-500/30 text-cyan-200 hover:bg-slate-900'
            }`}
          >
            <Bus className="w-4 h-4 text-cyan-400" />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-black block truncate">Bus Stop</span>
              <span className="text-[10px] opacity-80">{categoryCounts.BUS_STOP} Nearby</span>
            </div>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by facility name, service, or landmark..."
          className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3 text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Main List of Nearby Places with Live Distance */}
      <div className="space-y-3">
        {filteredPlaces.length === 0 ? (
          <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-xs font-semibold">No matching facilities found.</p>
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-cyan-400 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredPlaces.map((place) => {
            const meta = CATEGORY_META[place.category];
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${deviceCoords[0]},${deviceCoords[1]}&destination=${place.coords[0]},${place.coords[1]}`;

            return (
              <div
                key={place.id}
                className="clean-card p-4 space-y-3 border-slate-800 bg-slate-900/95 hover:border-slate-700 transition shadow-lg rounded-2xl"
              >
                {/* Top Row: Name, Category Badge, and Live Distance Pill */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${meta.bg} ${meta.color} ${meta.border}`}
                      >
                        {getCategoryIcon(place.category)}
                        <span>{place.categoryLabel}</span>
                      </span>

                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800">
                        {place.statusText}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white leading-snug">{place.name}</h3>
                  </div>

                  {/* High Visibility Distance Badge */}
                  <div className="bg-slate-950 border border-cyan-500/40 px-3 py-1.5 rounded-xl text-right shrink-0 shadow-sm">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                      DISTANCE
                    </span>
                    <span className="text-sm font-black text-cyan-300 font-mono">
                      {place.formattedDistance}
                    </span>
                  </div>
                </div>

                {/* Address and Exact GPS Coordinates */}
                <div className="space-y-1 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                  <p className="text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{place.address}</span>
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/50 text-[11px] text-slate-400 font-mono">
                    <span>
                      Exact GPS: {place.coords[0].toFixed(5)}° N, {place.coords[1].toFixed(5)}° E
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-300">🚶 {place.walkTimeMinutes} min walk</span>
                      <span className="text-cyan-300">🚗 {place.driveTimeMinutes} min drive</span>
                    </div>
                  </div>
                </div>

                {/* Notes or Facilities description */}
                {place.notes && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                    💡 {place.notes}
                  </p>
                )}

                {/* Action Buttons: Navigate on Map, Google Maps Directions, Call */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => {
                      if (onSelectRouteToPlace) {
                        onSelectRouteToPlace(place);
                      } else {
                        onNavigateToMap();
                      }
                    }}
                    className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Safe Route</span>
                  </button>

                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Google Maps</span>
                  </a>

                  {place.phone ? (
                    <a
                      href={`tel:${place.phone.replace(/[^0-9+]/g, '')}`}
                      className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-emerald-400 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                  ) : (
                    <button
                      onClick={onNavigateToMap}
                      className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>View Map</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
