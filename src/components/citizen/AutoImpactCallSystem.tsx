import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PhoneCall, AlertTriangle, ShieldAlert, Zap, CheckCircle2,
  Plus, Trash2, Shield, Phone, BellRing, Radio, X, UserPlus, HeartPulse
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, SOSAlert } from '../../types';

export interface EmergencyContactItem {
  id: string;
  name: string;
  phone: string;
  relation: string;
  isPrimary: boolean;
}

const STORAGE_KEY = 'kumbh_emergency_contacts_v3';

const DEFAULT_CONTACTS: EmergencyContactItem[] = [
  { id: 'police-112', name: 'National Emergency / Police', phone: '112', relation: 'Official Emergency', isPrimary: true },
  { id: 'medical-108', name: 'Ambulance / Medical Desk', phone: '108', relation: 'Medical', isPrimary: false },
  { id: 'disaster-1077', name: 'Kumbh Disaster Control', phone: '1077', relation: 'Disaster Relief', isPrimary: false },
];

interface Props {
  user: UserProfile;
  userCoords: [number, number];
  onTriggerSOS: (type: SOSAlert['type'], customNote?: string) => void;
  onOpenSOS?: () => void;
}

export const AutoImpactCallSystem: React.FC<Props> = ({
  user,
  userCoords,
  onTriggerSOS,
  onOpenSOS,
}) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [sensitivity, setSensitivity] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  
  // Emergency Contacts
  const [contacts, setContacts] = useState<EmergencyContactItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading contacts', e);
    }
    // Add user's phone if provided
    if (user.phone) {
      return [
        { id: 'user-fam', name: `${user.name || 'Family Member'}`, phone: user.phone, relation: 'Family Contact', isPrimary: false },
        ...DEFAULT_CONTACTS,
      ];
    }
    return DEFAULT_CONTACTS;
  });

  // Save contacts
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    } catch (e) {
      console.warn('Error storing contacts', e);
    }
  }, [contacts]);

  // Impact Trigger State
  const [isImpactActive, setIsImpactActive] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(10);
  const [showAddContact, setShowAddContact] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newRelation, setNewRelation] = useState<string>('Family');
  const [lastDispatchedNote, setLastDispatchedNote] = useState<string | null>(null);

  const countdownTimerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play alarm sound safely via Web Audio API
  const playBeep = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // 880Hz beep
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Audio autoplay blocked or unsupported
    }
  };

  // Device Motion Sensor Listener for Fall/Impact detection
  useEffect(() => {
    if (!isEnabled || typeof window === 'undefined') return;

    let threshold = 25; // m/s^2
    if (sensitivity === 'HIGH') threshold = 18;
    if (sensitivity === 'LOW') threshold = 35;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;
      const totalAcc = Math.sqrt(x * x + y * y + z * z);

      if (totalAcc > threshold && !isImpactActive) {
        triggerImpactSequence('Hardware Accelerometer Impact Detected');
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isEnabled, sensitivity, isImpactActive]);

  // Impact Trigger Sequence
  const triggerImpactSequence = (source: string) => {
    setIsImpactActive(true);
    setCountdown(10);
    setLastDispatchedNote(null);

    // Vibration on mobile if supported
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([300, 150, 300, 150, 500]);
      } catch (e) {}
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (isImpactActive) {
      playBeep();
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownTimerRef.current);
            dispatchAutoEmergencyCall();
            return 0;
          }
          playBeep();
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    }

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [isImpactActive]);

  // Execute Auto Emergency Dispatch
  const dispatchAutoEmergencyCall = () => {
    setIsImpactActive(false);
    const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0];
    const phoneToCall = primaryContact ? primaryContact.phone : '112';

    onTriggerSOS(
      'MEDICAL_EMERGENCY',
      `🚨 Auto-Impact Crash Detection Triggered at coordinates [${userCoords[0].toFixed(5)}, ${userCoords[1].toFixed(5)}]. Automated emergency call initiated.`
    );

    setLastDispatchedNote(`Emergency Alert & SOS dispatched to Command Center. Calling ${primaryContact?.name || 'Emergency Services'} (${phoneToCall})...`);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ef4444', '#dc2626', '#f87171'],
    });

    // Auto-dial primary emergency number
    try {
      window.location.href = `tel:${phoneToCall}`;
    } catch (e) {}
  };

  // Cancel Emergency Trigger
  const cancelImpactAlert = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setIsImpactActive(false);
    setCountdown(10);
  };

  // Add Contact Handler
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const newContact: EmergencyContactItem = {
      id: `contact-${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      relation: newRelation,
      isPrimary: contacts.length === 0,
    };

    setContacts([newContact, ...contacts]);
    setNewName('');
    setNewPhone('');
    setShowAddContact(false);
  };

  // Delete Contact
  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  // Set Primary
  const handleSetPrimary = (id: string) => {
    setContacts(
      contacts.map((c) => ({
        ...c,
        isPrimary: c.id === id,
      }))
    );
  };

  const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0];

  return (
    <div className="space-y-3.5 text-slate-100">
      {/* Active Impact Countdown Modal Overlay */}
      <AnimatePresence>
        {isImpactActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border-2 border-red-500 rounded-3xl p-6 max-w-sm w-full text-center space-y-5 shadow-2xl shadow-red-950/80"
            >
              <div className="w-16 h-16 bg-red-600/20 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto text-red-400">
                <AlertTriangle className="w-9 h-9 animate-bounce" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">Impact / Fall Detected!</h3>
                <p className="text-xs text-slate-300">
                  Automated SOS & direct emergency call will trigger in:
                </p>
              </div>

              {/* Countdown Number */}
              <div className="text-6xl font-black text-red-400 font-mono tracking-wider">
                {countdown}s
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs text-left text-slate-300">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Auto-Dial Destination:</span>
                <span className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  {primaryContact?.name || 'Emergency Services'} ({primaryContact?.phone || '112'})
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={cancelImpactAlert}
                  className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-sm rounded-2xl border border-slate-600 transition active:scale-95 shadow-md"
                >
                  I AM SAFE - CANCEL ALERT
                </button>
                <button
                  onClick={dispatchAutoEmergencyCall}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition active:scale-95"
                >
                  DISPATCH SOS IMMEDIATELY
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Status Card */}
      <div className="clean-card p-4 space-y-3.5 border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Auto Impact & Fall Call System</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isEnabled ? 'ACTIVE' : 'PAUSED'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Detects sudden falls or crowd compression and dials emergency help.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              isEnabled ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full transition-transform transform ${
                isEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Sensitivity & Test Trigger Bar */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-[10px] text-slate-400 block font-bold mb-1">SENSOR SENSITIVITY</span>
            <div className="flex gap-1">
              {(['LOW', 'MEDIUM', 'HIGH'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSensitivity(s)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition ${
                    sensitivity === s
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => triggerImpactSequence('Manual Test Trigger')}
            className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-red-500/40 p-2.5 rounded-xl text-left transition flex flex-col justify-between group active:scale-95"
          >
            <span className="text-[10px] text-slate-400 font-bold">SIMULATION</span>
            <span className="text-xs font-bold text-red-400 group-hover:text-red-300 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              Test Impact Trigger
            </span>
          </button>
        </div>

        {/* Last Dispatched Note */}
        {lastDispatchedNote && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{lastDispatchedNote}</span>
          </div>
        )}
      </div>

      {/* Emergency Contacts List */}
      <div className="clean-card p-4 space-y-3 border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-red-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Emergency Speed Dial Contacts ({contacts.length})
            </h4>
          </div>
          <button
            onClick={() => setShowAddContact(!showAddContact)}
            className="text-xs bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </button>
        </div>

        {/* Add Contact Form Drawer */}
        <AnimatePresence>
          {showAddContact && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddContact}
              className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Contact Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone Number"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <select
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none"
                >
                  <option value="Family">Family Member</option>
                  <option value="Friend">Friend / Group</option>
                  <option value="Medical">Doctor / Caregiver</option>
                  <option value="Local Guide">Local Guide</option>
                </select>

                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowAddContact(false)}
                    className="px-2.5 py-1 bg-slate-800 text-slate-400 rounded-lg hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Contacts Grid */}
        <div className="space-y-1.5">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                  contact.isPrimary ? 'bg-red-600/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-300'
                }`}>
                  {contact.isPrimary ? '★' : contact.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{contact.name}</span>
                    {contact.isPrimary && (
                      <span className="text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.2 rounded border border-red-500/30">
                        Primary Auto-Call
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {contact.phone} • {contact.relation}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href={`tel:${contact.phone}`}
                  className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 rounded-lg font-bold flex items-center gap-1 transition active:scale-95"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call</span>
                </a>
                {!contact.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(contact.id)}
                    className="p-1 text-slate-500 hover:text-amber-400 transition"
                    title="Set as Primary Auto-Dial"
                  >
                    ☆
                  </button>
                )}
                {contact.id !== 'police-112' && contact.id !== 'medical-108' && (
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="p-1 text-slate-500 hover:text-red-400 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
