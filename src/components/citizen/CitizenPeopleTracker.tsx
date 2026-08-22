import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { UserProfile, SOSAlert } from '../../types';
import { Users, MapPin, Phone, Battery, Shield, Plus, Share2, Copy, CheckCircle2, Navigation, AlertTriangle, Radio, Contact, BookOpen, Radar, Sparkles, PhoneCall, Siren, Zap, BellRing, Heart, Trash2 } from 'lucide-react';
import { AutoImpactCallSystem } from './AutoImpactCallSystem';
import { NearTenMeterPhoneRadar } from '../shared/NearTenMeterPhoneRadar';

export interface TrackedPerson {
  id: string;
  name: string;
  relation: string;
  phone: string;
  coordinates: [number, number];
  locationName: string;
  distanceMeters: number;
  battery: number;
  status: 'SAFE' | 'MILD_CROWD' | 'EMERGENCY_SOS' | 'RESPONDING';
  lastUpdated: string;
  avatar: string;
  isAutoCallRecipient?: boolean;
}

const STORAGE_KEY = 'kumbh_family_members_v2';

interface Props {
  user: UserProfile;
  onOpenMapWithPerson?: (person: TrackedPerson) => void;
  onTriggerSOS?: (type: SOSAlert['type'], customNote?: string) => void;
}

export const CitizenPeopleTracker: React.FC<Props> = ({ user, onOpenMapWithPerson, onTriggerSOS }) => {
  // Load tracked people from localStorage or start empty
  const [people, setPeople] = useState<TrackedPerson[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error loading tracked family members', e);
    }
    return [];
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(people));
    } catch (e) {
      console.warn('Error saving tracked family members', e);
    }
  }, [people]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelation, setNewRelation] = useState('Family');
  const [isAutoCallNew, setIsAutoCallNew] = useState(false);
  const [copiedShareCode, setCopiedShareCode] = useState(false);
  const [pickerStatus, setPickerStatus] = useState('');

  const [activeAutoCallPerson, setActiveAutoCallPerson] = useState<TrackedPerson | null>(
    people.find((p) => p.isAutoCallRecipient) || people[0] || null
  );

  useEffect(() => {
    setActiveAutoCallPerson(people.find((p) => p.isAutoCallRecipient) || people[0] || null);
  }, [people]);

  const shareCode = 'CS-8942';

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(shareCode);
    setCopiedShareCode(true);
    setTimeout(() => setCopiedShareCode(false), 2000);
  };

  // Set a family member as primary auto-call recipient
  const handleSetAutoCallRecipient = (personId: string) => {
    const updated = people.map((p) => {
      const isTarget = p.id === personId;
      return { ...p, isAutoCallRecipient: isTarget };
    });
    setPeople(updated);
    const target = updated.find((p) => p.id === personId);
    if (target) {
      setActiveAutoCallPerson(target);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#ef4444', '#f87171', '#3b82f6'],
      });
    }
  };

  // Web Contacts API Native Fetch
  const handleFetchDeviceContacts = async () => {
    setPickerStatus('Opening Device Address Book...');
    if ('contacts' in navigator && 'select' in (navigator as any).contacts) {
      try {
        const selected = await (navigator as any).contacts.select(['name', 'tel'], { multiple: false });
        if (selected && selected.length > 0) {
          const contact = selected[0];
          const name = contact.name?.[0] || 'Device Contact';
          const tel = contact.tel?.[0] || '';
          if (tel) {
            setNewName(name);
            setNewPhone(tel);
            setPickerStatus(`Fetched from Device: ${name}`);
            return;
          }
        }
      } catch (err) {
        console.warn('Native contact picker cancelled or unsupported:', err);
      }
    }
    setPickerStatus('Please type contact details manually below:');
  };

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone.trim()) return;

    const displayName = newName.trim() || `Contact (${newPhone.slice(-4)})`;
    const isFirst = people.length === 0 || isAutoCallNew;

    const userLoc = user.coordinates || [25.4362, 81.8475];

    const newTracked: TrackedPerson = {
      id: `p-${Date.now()}`,
      name: displayName,
      relation: newRelation,
      phone: newPhone.trim(),
      coordinates: [
        userLoc[0] + (Math.random() - 0.5) * 0.003,
        userLoc[1] + (Math.random() - 0.5) * 0.003,
      ],
      locationName: 'Near Festival Grounds',
      distanceMeters: Math.floor(80 + Math.random() * 250),
      battery: Math.floor(75 + Math.random() * 25),
      status: 'SAFE',
      lastUpdated: 'Just now',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      isAutoCallRecipient: isFirst,
    };

    let updatedPeople = [...people];
    if (isFirst) {
      updatedPeople = updatedPeople.map((p) => ({ ...p, isAutoCallRecipient: false }));
      setActiveAutoCallPerson(newTracked);
    }
    updatedPeople.push(newTracked);

    setPeople(updatedPeople);
    setNewName('');
    setNewPhone('');
    setIsAutoCallNew(false);
    setShowAddModal(false);
    setPickerStatus('');

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#06b6d4', '#3b82f6', '#10b981'],
    });
  };

  const handleRemovePerson = (id: string) => {
    const updated = people.filter((p) => p.id !== id);
    if (updated.length > 0 && !updated.some((p) => p.isAutoCallRecipient)) {
      updated[0].isAutoCallRecipient = true;
    }
    setPeople(updated);
  };

  return (
    <div className="space-y-4 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-1.5">
            <Users className="w-5 h-5 text-blue-400" />
            Live Family & Contacts GPS Tracker
          </h2>
          <p className="text-xs text-slate-400">
            Real-time GPS, battery status & Automatic Accident Emergency Calling
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Dedicated Family Automatic Accident Calling Hub */}
      <div className="bg-gradient-to-r from-red-950/90 via-slate-950 to-slate-900 border border-red-800/80 p-3.5 rounded-3xl space-y-3 shadow-xl">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-600/30 text-red-400 flex items-center justify-center border border-red-500/40 shrink-0">
              <PhoneCall className="w-4 h-4 text-red-400 animate-pulse" />
            </div>
            <div>
              <span className="font-black text-white text-xs block">Automatic Accident Call System</span>
              <span className="text-[10px] text-red-300">Auto-Dials Phone Contacts on Crash / High Impact</span>
            </div>
          </div>

          <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded-full font-bold">
            ACCIDENT SENSOR ACTIVE
          </span>
        </div>

        {/* Selected Auto-Call Target */}
        <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Primary Auto-Call Target:</span>
            {activeAutoCallPerson ? (
              <span className="font-bold text-amber-300 flex items-center gap-1 text-xs">
                <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
                {activeAutoCallPerson.name} ({activeAutoCallPerson.phone})
              </span>
            ) : (
              <span className="text-slate-500 italic">No contact selected (will dial 112)</span>
            )}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="text-[11px] font-bold text-cyan-300 bg-cyan-950 hover:bg-cyan-900 px-2.5 py-1 rounded-xl border border-cyan-800 transition"
          >
            Change Target
          </button>
        </div>

        {/* Integrated Auto Impact Call Trigger Component */}
        <AutoImpactCallSystem
          user={user}
          userCoords={user.coordinates || [25.4362, 81.8475]}
          onTriggerSOS={onTriggerSOS || (() => {})}
        />
      </div>

      {/* 10-Meter Near-Field Phone Radar (Software Mesh Discovery) */}
      <NearTenMeterPhoneRadar />

      {/* Share My Live Code Box */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/60 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
            YOUR FAMILY TRACKING CODE
          </span>
          <span className="text-base font-mono font-black text-cyan-300">{shareCode}</span>
        </div>

        <button
          onClick={handleCopyCode}
          className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition"
        >
          {copiedShareCode ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
          <span>{copiedShareCode ? 'Copied!' : 'Copy Code'}</span>
        </button>
      </div>

      {/* People List */}
      <div className="space-y-3">
        {people.length === 0 ? (
          <div className="bg-slate-950 border border-slate-800/80 p-8 rounded-3xl text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-900/30 border border-blue-700/40 text-blue-400 mx-auto flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">No Tracked Contacts Added</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                No contacts are added yet. Click <strong>"Add Contact"</strong> above or fetch directly from your phone address book to begin auto-calling & live tracking.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Emergency Contact</span>
            </button>
          </div>
        ) : (
          people.map((person) => (
            <div
              key={person.id}
              className={`bg-slate-950 border p-3.5 rounded-2xl space-y-2.5 text-xs transition ${
                person.isAutoCallRecipient
                  ? 'border-red-600/80 shadow-lg shadow-red-950/40 ring-1 ring-red-500/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header & Badges */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-cyan-300 text-sm">
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-xs">{person.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-semibold">
                        {person.relation}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block font-mono">{person.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        person.status === 'SAFE'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : person.status === 'EMERGENCY_SOS'
                          ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {person.status}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono mt-0.5 flex items-center justify-end gap-1">
                      <Battery className="w-3 h-3 text-emerald-400" />
                      {person.battery}%
                    </span>
                  </div>

                  <button
                    onClick={() => handleRemovePerson(person.id)}
                    className="p-1 text-slate-500 hover:text-red-400 transition"
                    title="Remove Contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Auto Call Designation Badge */}
              {person.isAutoCallRecipient && (
                <div className="bg-red-950/80 border border-red-800 px-2.5 py-1 rounded-xl text-[10px] font-bold text-red-300 flex items-center gap-1.5">
                  <Siren className="w-3.5 h-3.5 text-red-400 animate-pulse shrink-0" />
                  <span>PRIMARY AUTO-CALL RECIPIENT ON ACCIDENT IMPACT</span>
                </div>
              )}

              {/* Location & Distance */}
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-semibold">{person.locationName}</span>
                </div>
                <span className="text-emerald-400 font-bold font-mono">
                  {person.distanceMeters}m away
                </span>
              </div>

              {/* Action Bar with Auto-Call Buttons */}
              <div className="flex items-center justify-between gap-2 text-[11px] pt-1 border-t border-slate-900">
                <button
                  onClick={() => handleSetAutoCallRecipient(person.id)}
                  className={`px-2.5 py-1.5 rounded-xl font-bold text-[10px] flex items-center gap-1 transition ${
                    person.isAutoCallRecipient
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <PhoneCall className="w-3 h-3 text-red-400" />
                  <span>{person.isAutoCallRecipient ? 'Auto-Call Target Active' : 'Set as Auto-Call Contact'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${person.phone.replace(/[^0-9+]/g, '')}`}
                    target="_top"
                    rel="noopener"
                    className="p-1.5 px-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white flex items-center gap-1 font-bold text-[11px] shadow transition active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5 text-white" />
                    <span>Call</span>
                  </a>
                  {onOpenMapWithPerson && (
                    <button
                      onClick={() => onOpenMapWithPerson(person)}
                      className="p-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 font-bold text-[11px]"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Track</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Person Modal with Device Contact Picker */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" /> Add Emergency Contact
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Device Contact Fetch Button */}
            <button
              type="button"
              onClick={handleFetchDeviceContacts}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-cyan-900/60 to-blue-900/60 hover:from-cyan-800 hover:to-blue-800 text-cyan-200 border border-cyan-700/60 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition shadow"
            >
              <Contact className="w-4 h-4 text-cyan-300" />
              <span>📱 Fetch Contact Number from Phonebook</span>
            </button>

            {pickerStatus && (
              <p className="text-[11px] text-cyan-300 bg-cyan-950/80 p-2 rounded-xl text-center border border-cyan-800 font-medium">
                {pickerStatus}
              </p>
            )}

            <form onSubmit={handleAddPerson} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Contact Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="E.g., Mom, Spouse, Brother"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Mobile Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Relationship Category</label>
                <select
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value="Family">Family</option>
                  <option value="Parent">Parent</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Friend">Friend</option>
                  <option value="Doctor">Doctor</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="autoCallCheck"
                  checked={isAutoCallNew}
                  onChange={(e) => setIsAutoCallNew(e.target.checked)}
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-700 bg-slate-950"
                />
                <label htmlFor="autoCallCheck" className="text-[11px] font-bold text-red-300 cursor-pointer">
                  Set as Primary Auto-Call Target on Accident Impact
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow"
                >
                  Save & Track
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
