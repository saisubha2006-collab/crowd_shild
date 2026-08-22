import React, { useState } from 'react';
import { NotificationItem, EventItem } from '../../types';
import { Bell, AlertOctagon, Send, Sparkles, CheckCircle2, Radio, Volume2 } from 'lucide-react';

interface Props {
  event: EventItem;
  notifications: NotificationItem[];
  onDispatchPushNotification: (title: string, message: string, level: NotificationItem['level']) => void;
  onOpenBroadcast: () => void;
}

export const AdminAlerts: React.FC<Props> = ({
  event,
  notifications,
  onDispatchPushNotification,
  onOpenBroadcast,
}) => {
  const [customTitle, setCustomTitle] = useState('');
  const [customMsg, setCustomMsg] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSendCustomPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customMsg) return;
    onDispatchPushNotification(customTitle, customMsg, 'CRITICAL');
    setSentSuccess(true);
    setCustomTitle('');
    setCustomMsg('');
    setTimeout(() => setSentSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            Alert Management & Citizen Push Broadcast Console
          </h2>
          <p className="text-xs text-slate-400">
            Automated Early Warning Generation & Direct Mass Mobile Notification Dispatch
          </p>
        </div>

        <button
          onClick={onOpenBroadcast}
          className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg transition"
        >
          <Volume2 className="w-4 h-4" />
          <span>PA Voice Broadcast</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dispatch Push Notification Form */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-2">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" /> Dispatch Real-Time Mobile Push Alert
          </h3>

          <form onSubmit={handleSendCustomPush} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Alert Headline Title</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="E.g., ⚠️ HIGH CROWD DENSITY AT EAST GATE"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Push Alert Directive Message</label>
              <textarea
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                rows={3}
                placeholder="E.g., Please move towards Relief Gate 4 on West side for fast safe exit..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!customTitle || !customMsg}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Push Alert to All Event Mobile Users</span>
            </button>

            {sentSuccess && (
              <div className="p-2.5 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" /> Push Notification Dispatched to {event.liveCrowdCount.toLocaleString()} Users!
              </div>
            )}
          </form>
        </div>

        {/* Generated Active Alerts Log */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-2">
            <AlertOctagon className="w-5 h-5 text-amber-400" /> System Triggered Warnings Log
          </h3>

          <div className="space-y-3 max-h-[380px] overflow-y-auto custom-scrollbar">
            {notifications.map((n) => (
              <div key={n.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-red-400 flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4" /> {n.title}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{n.timestamp}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{n.message}</p>
                {n.actionRecommended && (
                  <div className="p-2 bg-blue-950/40 border border-blue-800/40 rounded-xl text-cyan-300 text-[11px] font-medium">
                    Recommended: {n.actionRecommended}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
