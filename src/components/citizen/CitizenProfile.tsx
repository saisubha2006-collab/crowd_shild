import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Phone,
  Shield,
  Heart,
  Plus,
  Trash2,
  Edit2,
  Check,
  Star,
  AlertTriangle,
  RotateCw,
  Send,
  PhoneCall,
  Volume2,
  Sliders,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Clock,
  Activity,
  FileText,
  Sun,
  Moon,
  Settings
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../../types';
import { useTheme } from '../../context/ThemeContext';

export interface ProfileEmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  isPrimary: boolean;
  priorityOrder: number; // 1, 2, 3...
  autoCallEnabled: boolean;
}

interface Props {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onOpenOtpModal: () => void;
  onOpenSOS?: () => void;
  onOpenSettings?: () => void;
}

const PROFILE_CONTACTS_KEY = 'kumbh_emergency_contacts_v2';
const PROFILE_DATA_KEY = 'kumbh_user_profile_v2';

export const CitizenProfile: React.FC<Props> = ({
  user,
  onUpdateUser,
  onOpenOtpModal,
  onOpenSOS,
  onOpenSettings,
}) => {
  const { themeMode, resolvedTheme, setThemeMode, systemPrefersDark } = useTheme();
  // Medical & Personal Info state
  const [bloodGroup, setBloodGroup] = useState<string>(() => {
    return localStorage.getItem('kumbh_user_blood_group') || 'O+';
  });
  const [allergies, setAllergies] = useState<string>(() => {
    return localStorage.getItem('kumbh_user_allergies') || 'None / Penicillin Allergy';
  });
  const [medicalNotes, setMedicalNotes] = useState<string>(() => {
    return localStorage.getItem('kumbh_user_medical_notes') || 'Diabetic, Asthmatic - Carries Inhaler';
  });
  const [homeAddress, setHomeAddress] = useState<string>(() => {
    return localStorage.getItem('kumbh_user_address') || 'Sector 4, Prayagraj, UP, India';
  });
  const [editingPersonal, setEditingPersonal] = useState(false);

  // Editable user name and phone
  const [userName, setUserName] = useState(user.name);
  const [userPhone, setUserPhone] = useState(user.phone);

  // Emergency Contacts state
  const [contacts, setContacts] = useState<ProfileEmergencyContact[]>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_CONTACTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading stored contacts:', e);
    }
    // Default initial emergency contacts
    return [
      {
        id: 'ec-1',
        name: 'Sunita Sharma (Spouse)',
        phone: '+91 9876543210',
        relation: 'Spouse',
        isPrimary: true,
        priorityOrder: 1,
        autoCallEnabled: true,
      },
      {
        id: 'ec-2',
        name: 'Dr. Ramesh Kumar (Family Doctor)',
        phone: '+91 9123456789',
        relation: 'Doctor',
        isPrimary: false,
        priorityOrder: 2,
        autoCallEnabled: true,
      },
      {
        id: 'ec-3',
        name: 'Amit Sharma (Brother)',
        phone: '+91 9988776655',
        relation: 'Brother',
        isPrimary: false,
        priorityOrder: 3,
        autoCallEnabled: true,
      },
    ];
  });

  // Auto-call iteration configuration state
  const [callTimeoutSec, setCallTimeoutSec] = useState<number>(() => {
    const saved = localStorage.getItem('kumbh_call_timeout_sec');
    return saved ? parseInt(saved, 10) : 10;
  });
  const [autoSmsBroadcast, setAutoSmsBroadcast] = useState<boolean>(true);

  // Contact Form Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRelation, setFormRelation] = useState('Family');

  // Test Call Iteration Simulator State
  const [testSimActive, setTestSimActive] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [testCountdown, setTestCountdown] = useState(callTimeoutSec);
  const [testLogs, setTestLogs] = useState<string[]>([]);

  // Sync contacts to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_CONTACTS_KEY, JSON.stringify(contacts));
      // Sync family members too for compatibility
      localStorage.setItem('kumbh_family_members_v2', JSON.stringify(contacts));
    } catch (e) {
      console.warn('Error saving contacts:', e);
    }
  }, [contacts]);

  // Sync settings
  useEffect(() => {
    localStorage.setItem('kumbh_call_timeout_sec', callTimeoutSec.toString());
  }, [callTimeoutSec]);

  // Save personal health details
  const handleSavePersonal = () => {
    localStorage.setItem('kumbh_user_blood_group', bloodGroup);
    localStorage.setItem('kumbh_user_allergies', allergies);
    localStorage.setItem('kumbh_user_medical_notes', medicalNotes);
    localStorage.setItem('kumbh_user_address', homeAddress);
    
    onUpdateUser({
      ...user,
      name: userName,
      phone: userPhone,
    });
    setEditingPersonal(false);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#3b82f6', '#f59e0b'],
    });
  };

  // Add or Edit Contact
  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPhone) return;

    if (editingContactId) {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === editingContactId
            ? { ...c, name: formName, phone: formPhone, relation: formRelation }
            : c
        )
      );
    } else {
      const newContact: ProfileEmergencyContact = {
        id: `ec-${Date.now()}`,
        name: formName,
        phone: formPhone,
        relation: formRelation,
        isPrimary: contacts.length === 0,
        priorityOrder: contacts.length + 1,
        autoCallEnabled: true,
      };
      setContacts([...contacts, newContact]);
    }

    setFormName('');
    setFormPhone('');
    setFormRelation('Family');
    setEditingContactId(null);
    setShowAddModal(false);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
    });
  };

  // Delete contact
  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    // Re-index priority orders
    const reindexed = updated.map((c, idx) => ({
      ...c,
      priorityOrder: idx + 1,
      isPrimary: idx === 0,
    }));
    setContacts(reindexed);
  };

  // Set primary responder
  const handleSetPrimary = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => ({
        ...c,
        isPrimary: c.id === id,
      }))
    );
  };

  // Toggle auto call enabled for contact
  const handleToggleAutoCall = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, autoCallEnabled: !c.autoCallEnabled } : c))
    );
  };

  // Move contact priority up
  const handleMovePriority = (index: number, direction: 'UP' | 'DOWN') => {
    if (direction === 'UP' && index === 0) return;
    if (direction === 'DOWN' && index === contacts.length - 1) return;

    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    const newArr = [...contacts];
    const temp = newArr[index];
    newArr[index] = newArr[targetIdx];
    newArr[targetIdx] = temp;

    const reindexed = newArr.map((c, idx) => ({
      ...c,
      priorityOrder: idx + 1,
      isPrimary: idx === 0,
    }));
    setContacts(reindexed);
  };

  // Open edit modal
  const handleStartEdit = (contact: ProfileEmergencyContact) => {
    setEditingContactId(contact.id);
    setFormName(contact.name);
    setFormPhone(contact.phone);
    setFormRelation(contact.relation);
    setShowAddModal(true);
  };

  // Test Auto-Call Iteration Simulator
  const handleStartTestSimulator = () => {
    const enabledContacts = contacts.filter((c) => c.autoCallEnabled);
    if (enabledContacts.length === 0) {
      alert('Please enable auto-call for at least one emergency contact.');
      return;
    }
    setTestSimActive(true);
    setCurrentTestIndex(0);
    setTestCountdown(callTimeoutSec);
    setTestLogs([
      `⚡ Test Auto-Call Sequence initiated. Total responders in queue: ${enabledContacts.length}`,
      `📞 Auto-Dialing Responder 1: ${enabledContacts[0].name} (${enabledContacts[0].phone})...`,
    ]);

    // Audio & voice alert
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(
        `Testing automated call sequence. Dialing ${enabledContacts[0].name}.`
      );
      window.speechSynthesis.speak(utt);
    }
  };

  // Test simulator countdown timer
  useEffect(() => {
    let timer: any = null;
    if (testSimActive) {
      const enabledContacts = contacts.filter((c) => c.autoCallEnabled);

      if (testCountdown > 0) {
        timer = setInterval(() => {
          setTestCountdown((prev) => prev - 1);
        }, 1000);
      } else {
        // Countdown reached 0 -> move to next contact in iteration!
        if (currentTestIndex + 1 < enabledContacts.length) {
          const nextIdx = currentTestIndex + 1;
          const nextContact = enabledContacts[nextIdx];
          setCurrentTestIndex(nextIdx);
          setTestCountdown(callTimeoutSec);
          setTestLogs((prev) => [
            ...prev,
            `⏱️ No response from Responder ${currentTestIndex + 1} after ${callTimeoutSec}s.`,
            `📞 Auto-Dialing Responder ${nextIdx + 1}: ${nextContact.name} (${nextContact.phone})...`,
          ]);

          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utt = new SpeechSynthesisUtterance(
              `Responder ${currentTestIndex + 1} unavailable. Dialing ${nextContact.name}.`
            );
            window.speechSynthesis.speak(utt);
          }
        } else {
          // Reached end of list -> Dial National Emergency 112
          setTestLogs((prev) => [
            ...prev,
            `⏱️ All saved contacts cycled without answer.`,
            `🚨 Auto-escalating to National Emergency Helpline (112)...`,
          ]);
          setTestCountdown(0);
        }
      }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [testSimActive, testCountdown, currentTestIndex, contacts, callTimeoutSec]);

  const enabledContactsList = contacts.filter((c) => c.autoCallEnabled);

  return (
    <div className="space-y-4 text-slate-100 pb-12">
      {/* Profile Header Banner */}
      <div className="glass-card bg-gradient-to-r from-slate-900/80 via-blue-950/80 to-slate-900/80 border border-white/15 p-5 rounded-[32px] shadow-2xl relative overflow-hidden backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-52 h-52 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white flex items-center justify-center font-black text-2xl shadow-xl border-2 border-cyan-300/60 backdrop-blur-md">
              {user.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-tight">{user.name || 'Citizen Profile'}</h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2.5 py-0.5 rounded-full font-bold backdrop-blur-md">
                  VERIFIED
                </span>
              </div>
              <p className="text-xs text-cyan-200 font-mono mt-0.5">{user.phone || '+91 9876543210'}</p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-300 font-medium">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate max-w-[200px]">{user.currentLocationName || 'Prayagraj Kumbh Mela'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-lg transition active:scale-95 backdrop-blur-md"
                title="System Settings"
              >
                <Settings className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            )}
            <button
              onClick={onOpenOtpModal}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-cyan-200 text-xs font-bold flex items-center gap-1.5 shadow-lg transition active:scale-95 backdrop-blur-md"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">OTP Login</span>
            </button>
          </div>
        </div>
      </div>

      {/* Theme & Display Quick Settings Card */}
      <div className="glass-card p-4 rounded-[28px] shadow-xl space-y-3 border border-white/15 backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              {resolvedTheme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <span>Display Appearance</span>
                <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-2 py-0.2 rounded-full font-mono">
                  {themeMode === 'system' ? `Auto (OS: ${systemPrefersDark ? 'Dark' : 'Light'})` : themeMode.toUpperCase()}
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">
                System detection auto-switches light/dark UI based on your device
              </p>
            </div>
          </div>

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="text-[11px] font-bold text-cyan-300 hover:text-cyan-200 flex items-center gap-1"
            >
              <span>Full Settings</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 3-Way Mode Pill Switcher */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setThemeMode('system')}
            className={`py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1 text-[11px] ${
              themeMode === 'system'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Auto (OS)</span>
          </button>
          <button
            onClick={() => setThemeMode('light')}
            className={`py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1 text-[11px] ${
              themeMode === 'light'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className="w-3 h-3" />
            <span>Light</span>
          </button>
          <button
            onClick={() => setThemeMode('dark')}
            className={`py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1 text-[11px] ${
              themeMode === 'dark'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="w-3 h-3" />
            <span>Dark</span>
          </button>
        </div>
      </div>

      {/* Emergency Contacts Management Card */}
      <div className="glass-card p-5 rounded-[32px] shadow-2xl space-y-4 relative overflow-hidden backdrop-blur-2xl border border-white/15">
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center backdrop-blur-md">
              <PhoneCall className="w-5 h-5 animate-pulse text-red-300" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2 tracking-tight">
                <span>Emergency Call Iteration Contacts</span>
                <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/40 px-2.5 py-0.5 rounded-full font-mono">
                  {contacts.length} Saved
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Automated calling system sequentially dials these contacts when an incident occurs
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingContactId(null);
              setFormName('');
              setFormPhone('');
              setFormRelation('Family');
              setShowAddModal(true);
            }}
            className="px-3.5 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-500 hover:to-rose-500 text-white rounded-2xl text-xs font-black shadow-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-red-300/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </button>
        </div>

        {/* Call Iteration Settings */}
        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-slate-200">Ringing Timeout per Contact:</span>
              <p className="text-[10px] text-slate-400">If unanswered, auto-dials next responder</p>
            </div>
          </div>
          <select
            value={callTimeoutSec}
            onChange={(e) => setCallTimeoutSec(parseInt(e.target.value, 10))}
            className="bg-slate-900 border border-slate-700 text-amber-300 font-bold rounded-xl px-2.5 py-1 text-xs focus:outline-none"
          >
            <option value={8}>8 Seconds</option>
            <option value={10}>10 Seconds</option>
            <option value={15}>15 Seconds</option>
            <option value={20}>20 Seconds</option>
          </select>
        </div>

        {/* Contacts List */}
        <div className="space-y-2">
          {contacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-2 ${
                contact.isPrimary
                  ? 'bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border-red-500/60 ring-1 ring-red-500/30'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center w-7 text-xs font-black text-slate-400">
                  <button
                    disabled={index === 0}
                    onClick={() => handleMovePriority(index, 'UP')}
                    className="hover:text-white disabled:opacity-20 text-[10px]"
                  >
                    ▲
                  </button>
                  <span className="text-red-400 font-mono text-xs">#{contact.priorityOrder}</span>
                  <button
                    disabled={index === contacts.length - 1}
                    onClick={() => handleMovePriority(index, 'DOWN')}
                    className="hover:text-white disabled:opacity-20 text-[10px]"
                  >
                    ▼
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-white">{contact.name}</h4>
                    {contact.isPrimary && (
                      <span className="text-[9px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        1st Priority
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                      {contact.relation}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">{contact.phone}</p>
                </div>
              </div>

              {/* Contact Control Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Auto Call Toggle */}
                <button
                  onClick={() => handleToggleAutoCall(contact.id)}
                  title={contact.autoCallEnabled ? 'Auto-call enabled' : 'Auto-call disabled'}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                    contact.autoCallEnabled
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {contact.autoCallEnabled ? 'Auto-Call ON' : 'OFF'}
                </button>

                {/* Set Primary Button */}
                {!contact.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(contact.id)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg text-[11px]"
                    title="Set as 1st Priority"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Edit */}
                <button
                  onClick={() => handleStartEdit(contact)}
                  className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg"
                  title="Edit Contact"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                {/* Direct Dial Button */}
                <a
                  href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                  target="_top"
                  className="p-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg transition active:scale-95"
                  title="Direct Phone Call"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>

                {/* Delete */}
                {contacts.length > 1 && (
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Test Emergency Call Iteration Simulator */}
        <div className="pt-2 border-t border-slate-800">
          {!testSimActive ? (
            <button
              onClick={handleStartTestSimulator}
              className="w-full py-3 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white rounded-2xl font-black text-xs shadow-lg flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer border border-amber-400/50"
            >
              <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
              <span>TEST EMERGENCY CALL ITERATION SEQUENCE NOW</span>
            </button>
          ) : (
            /* Active Simulator Box */
            <div className="bg-slate-950 border-2 border-amber-500/80 p-3.5 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-amber-400 animate-bounce" />
                  <div>
                    <h4 className="text-xs font-black text-amber-300">TESTING AUTO-CALL ITERATION</h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Simulating sequential dialing through enabled responders
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setTestSimActive(false);
                    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg"
                >
                  Stop Test
                </button>
              </div>

              {/* Current Active Contact Dialing Card */}
              {enabledContactsList[currentTestIndex] && (
                <div className="bg-amber-950/60 border border-amber-700/80 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-amber-300 font-black uppercase tracking-wider block">
                      CURRENTLY DIALING (RESPONDER #{currentTestIndex + 1})
                    </span>
                    <h5 className="text-sm font-black text-white">
                      {enabledContactsList[currentTestIndex].name}
                    </h5>
                    <p className="text-xs text-amber-200 font-mono">
                      {enabledContactsList[currentTestIndex].phone}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-black text-amber-400 font-mono">{testCountdown}s</span>
                    <p className="text-[9px] text-slate-400">Timeout switch</p>
                  </div>
                </div>
              )}

              {/* Activity Logs */}
              <div className="bg-slate-900 p-2.5 rounded-xl space-y-1 font-mono text-[10px] max-h-28 overflow-y-auto">
                {testLogs.map((log, i) => (
                  <div key={i} className="text-amber-200 flex items-start gap-1">
                    <span>›</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Health & Personal Medical ID Card */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-3xl shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Emergency Medical ID & Health Info</h3>
              <p className="text-[11px] text-slate-400">Transmitted to paramedic responders during SOS calls</p>
            </div>
          </div>

          <button
            onClick={() => setEditingPersonal(!editingPersonal)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{editingPersonal ? 'Cancel' : 'Edit Info'}</span>
          </button>
        </div>

        {editingPersonal ? (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 font-bold"
                >
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg}>
                      🩸 {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Phone Number</label>
              <input
                type="text"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Known Allergies / Sensitivities</label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="E.g. Penicillin, Peanuts"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Medical Conditions / Inhaler Notes</label>
              <textarea
                rows={2}
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                placeholder="E.g. Diabetic, Asthmatic"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleSavePersonal}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Medical Profile</span>
            </button>
          </div>
        ) : (
          /* View mode */
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Blood Group</span>
              <p className="text-base font-black text-rose-400 mt-0.5">🩸 {bloodGroup}</p>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Known Allergies</span>
              <p className="text-xs font-bold text-amber-300 truncate mt-1">{allergies}</p>
            </div>

            <div className="col-span-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Medical Conditions</span>
              <p className="text-xs text-slate-200 mt-0.5">{medicalNotes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Contact Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-sm shadow-2xl text-slate-100 space-y-4"
            >
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <User className="w-5 h-5 text-red-400" />
                <span>{editingContactId ? 'Edit Emergency Contact' : 'Add Emergency Contact'}</span>
              </h3>

              <form onSubmit={handleSaveContact} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Contact Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="E.g., Ramesh Kumar (Father)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Mobile Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Relationship</label>
                  <select
                    value={formRelation}
                    onChange={(e) => setFormRelation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-red-500"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Child">Child</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Doctor">Doctor / Hospital</option>
                    <option value="Friend">Friend / Guardian</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg"
                  >
                    Save Contact
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
