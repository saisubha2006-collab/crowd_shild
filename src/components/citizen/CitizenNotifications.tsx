import React, { useState, useEffect } from 'react';
import { NotificationItem } from '../../types';
import { Bell, AlertOctagon, Volume2, Info, CheckCircle2, Newspaper, Radio, RefreshCw, ShieldAlert, Car, Megaphone, MapPin } from 'lucide-react';

interface Props {
  notifications: NotificationItem[];
  userLocation?: { city?: string; country?: string };
  userCoords?: [number, number];
  onOpenBroadcast: () => void;
}

export const CitizenNotifications: React.FC<Props> = ({ notifications, userLocation, userCoords, onOpenBroadcast }) => {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'NEWS' | 'TRAFFIC' | 'DIRECTIVES'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [liveNews, setLiveNews] = useState<any[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);

  const locationLabel = userLocation?.city && userLocation?.country 
    ? `${userLocation.city}, ${userLocation.country}` 
    : userLocation?.country || 'Local Area';

  const fetchRealLiveNews = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: userLocation?.city,
          country: userLocation?.country,
          lat: userCoords?.[0],
          lng: userCoords?.[1],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.news && Array.isArray(data.news)) {
          setLiveNews(data.news);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch live news:', err);
    } finally {
      setIsRefreshing(false);
      setIsLoadingNews(false);
    }
  };

  useEffect(() => {
    fetchRealLiveNews();
  }, [userLocation?.city, userLocation?.country]);

  const filteredNews = liveNews.filter((n) => {
    if (activeCategory === 'NEWS') return n.category === 'BREAKING' || n.category === 'PUBLIC_ANNOUNCEMENT';
    if (activeCategory === 'TRAFFIC') return n.category === 'TRAFFIC';
    if (activeCategory === 'DIRECTIVES') return n.category === 'CROWD' || n.level === 'CRITICAL';
    return true;
  });

  return (
    <div className="space-y-4 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-1.5">
            <Bell className="w-5 h-5 text-blue-400" />
            Live News & Location Advisories
          </h2>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>Actual live news for <strong className="text-emerald-300">{locationLabel}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchRealLiveNews}
            className={`p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh Live News Feed"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          <button
            onClick={onOpenBroadcast}
            className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-1 transition"
          >
            <Volume2 className="w-4 h-4 text-blue-400" />
            <span>PA Audio</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
            activeCategory === 'ALL'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          All News & Directives
        </button>

        <button
          onClick={() => setActiveCategory('NEWS')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap flex items-center gap-1 transition ${
            activeCategory === 'NEWS'
              ? 'bg-cyan-600 text-white shadow'
              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          <Newspaper className="w-3.5 h-3.5" /> Breaking News
        </button>

        <button
          onClick={() => setActiveCategory('TRAFFIC')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap flex items-center gap-1 transition ${
            activeCategory === 'TRAFFIC'
              ? 'bg-amber-600 text-white shadow'
              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          <Car className="w-3.5 h-3.5" /> Traffic & Gates
        </button>

        <button
          onClick={() => setActiveCategory('DIRECTIVES')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap flex items-center gap-1 transition ${
            activeCategory === 'DIRECTIVES'
              ? 'bg-red-600 text-white shadow'
              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" /> Crowd Advisories
        </button>
      </div>

      {/* Official System Notifications List */}
      {isLoadingNews ? (
        <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
          <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
          <span>Fetching live location news for {locationLabel}...</span>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 bg-slate-950 rounded-2xl border border-slate-800">
          No active alerts reported for {locationLabel} at this moment.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredNews.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition shadow-lg ${
                n.level === 'CRITICAL'
                  ? 'bg-red-950/60 border-red-800 text-red-100'
                  : n.level === 'HIGH'
                  ? 'bg-amber-950/50 border-amber-800 text-amber-100'
                  : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-white text-xs">
                  {n.level === 'CRITICAL' ? (
                    <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
                  ) : (
                    <Megaphone className="w-4 h-4 text-cyan-400 shrink-0" />
                  )}
                  {n.title}
                </span>
                <span className="text-[10px] opacity-75 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {n.timestamp}
                </span>
              </div>

              <p className="leading-relaxed text-[11px] text-slate-300">{n.message}</p>

              <div className="flex items-center justify-between text-[10px] opacity-80 pt-1 border-t border-slate-800/80">
                <span className="font-semibold text-cyan-400">Source: {n.source}</span>
                <span className="text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  VERIFIED LIVE NEWS
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
