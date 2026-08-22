import React, { useState } from 'react';
import { Volunteer } from '../../types';
import { Users, ShieldCheck, PhoneCall, Radio, MapPin, CheckCircle2 } from 'lucide-react';

interface Props {
  volunteers: Volunteer[];
}

export const AdminVolunteers: React.FC<Props> = ({ volunteers }) => {
  const [activeCallVol, setActiveCallVol] = useState<Volunteer | null>(null);

  const handleSimulateRadioCall = (vol: Volunteer) => {
    setActiveCallVol(vol);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Calling ${vol.name} assigned to ${vol.zoneName}. Dispatching crowd clearance orders.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Volunteer & Security Personnel Deployment Operations
          </h2>
          <p className="text-xs text-slate-400">
            Real-Time Sector Tracking, Duty Zone Assignment & Radio Dispatch Communication
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {volunteers.map((vol) => (
          <div key={vol.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-3">
            <div className="flex items-center gap-3">
              <img src={vol.avatar} alt={vol.name} className="w-12 h-12 rounded-xl object-cover border border-slate-700" />
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-white truncate">{vol.name}</h4>
                <p className="text-[10px] text-slate-400 truncate">{vol.phone}</p>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold mt-1 ${
                    vol.status === 'RESPONDING'
                      ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {vol.status}
                </span>
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-bold">{vol.zoneName}</span>
              </div>
              <p className="text-[10px] text-slate-400">Assigned Gate: {vol.assignedGate || 'General Patrol'}</p>
            </div>

            <button
              onClick={() => handleSimulateRadioCall(vol)}
              className="w-full py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Radio Dispatch Call</span>
            </button>
          </div>
        ))}
      </div>

      {activeCallVol && (
        <div className="bg-blue-950 border border-blue-800 p-4 rounded-2xl flex items-center justify-between text-xs text-blue-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span>
              <strong>Walkie-Talkie Radio Connected to {activeCallVol.name}:</strong> Transmitting crowd diversion command...
            </span>
          </div>
          <button onClick={() => setActiveCallVol(null)} className="text-xs text-cyan-400 hover:underline">
            End Call
          </button>
        </div>
      )}
    </div>
  );
};
