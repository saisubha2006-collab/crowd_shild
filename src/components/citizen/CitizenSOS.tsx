import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile, EventItem, SOSAlert } from '../../types';
import { AlertOctagon, CheckCircle2, Siren, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AutoImpactCallSystem } from './AutoImpactCallSystem';

interface Props {
  user: UserProfile;
  event: EventItem;
  onTriggerSOS: (type: SOSAlert['type'], customNote?: string) => void;
}

export const CitizenSOS: React.FC<Props> = ({ user, event, onTriggerSOS }) => {
  const [selectedType, setSelectedType] = useState<SOSAlert['type']>('STAMPEDE_RISK');
  const [note, setNote] = useState('');
  const [isTriggered, setIsTriggered] = useState(false);

  const handleSOSPress = () => {
    setIsTriggered(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ef4444', '#f87171', '#dc2626', '#ffffff'],
    });
    onTriggerSOS(selectedType, note);
  };

  return (
    <div className="space-y-4 text-slate-100 pb-8">
      {/* SOS Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-800 text-red-400 text-xs font-black uppercase tracking-wider">
          <Siren className="w-4 h-4 text-red-400 animate-pulse" />
          <span>Emergency SOS Dispatch</span>
        </div>
        <h2 className="text-lg font-black text-white">One-Tap Emergency Alert</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Transmits GPS coordinates & emergency type to Police (112) & Command Center.
        </p>
      </div>

      {!isTriggered ? (
        <div className="space-y-3.5">
          {/* Big Trigger SOS Button */}
          <div className="py-4 flex flex-col items-center justify-center relative">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleSOSPress}
              className="w-40 h-40 rounded-full bg-gradient-to-tr from-red-700 to-rose-600 text-white font-black text-xl shadow-xl shadow-red-950/80 ring-4 ring-red-950 flex flex-col items-center justify-center gap-1 cursor-pointer z-10 border border-red-400/40 active:scale-95"
            >
              <AlertOctagon className="w-10 h-10 animate-bounce text-amber-200" />
              <span className="tracking-wide">TAP FOR SOS</span>
              <span className="text-[9px] font-bold opacity-90 tracking-widest font-mono">
                INSTANT DISPATCH
              </span>
            </motion.button>
          </div>

          {/* Select Emergency Type */}
          <div className="clean-card p-4 space-y-2.5 border-slate-800">
            <label className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
              Select Emergency Category:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { type: 'STAMPEDE_RISK', label: '🚨 Stampede / Compression' },
                { type: 'OVERCROWDING', label: '👥 Dangerous Overcrowding' },
                { type: 'MEDICAL_EMERGENCY', label: '🚑 Medical / Fainting' },
                { type: 'GATE_BLOCKED', label: '🛑 Gate Barricaded' },
                { type: 'LOST_CHILD', label: '👶 Lost Child / Companion' },
              ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => setSelectedType(item.type as SOSAlert['type'])}
                  className={`p-2.5 rounded-xl border text-left font-bold text-[11px] transition active:scale-95 ${
                    selectedType === item.type
                      ? 'bg-red-600 text-white border-red-400 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Automatic Accident Impact & Crash Call System */}
          <AutoImpactCallSystem
            user={user}
            userCoords={user.coordinates || [25.4362, 81.8475]}
            onTriggerSOS={onTriggerSOS}
          />
        </div>
      ) : (
        /* Triggered Confirmation Box */
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="clean-card border-2 border-red-600 p-5 text-center space-y-3.5 shadow-2xl"
        >
          <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto shadow-lg ring-4 ring-red-950">
            <Zap className="w-7 h-7 animate-pulse text-amber-200" />
          </div>

          <div className="space-y-0.5">
            <h3 className="text-lg font-black text-white">SOS RESCUE DISPATCHED!</h3>
            <p className="text-xs text-red-300 font-bold">
              Signal Transmitted to Prayagraj Command Center
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-slate-300 text-left space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>PCR Police Van 04 En Route (300m away)</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Volunteer Response Squad Delta Alerted</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-300 font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Live Location Tracking Active</span>
            </div>
            <p className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-800">
              Please stay calm and move towards an open exit if possible. Keep your phone line clear.
            </p>
          </div>

          <button
            onClick={() => setIsTriggered(false)}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition active:scale-95"
          >
            Reset SOS Status
          </button>
        </motion.div>
      )}
    </div>
  );
};
