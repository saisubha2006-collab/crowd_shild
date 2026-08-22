import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic, Volume2, VolumeX, Sparkles, AlertOctagon, Navigation,
  MapPin, Users, Shield, Check, Plus, Trash2, Radio
} from 'lucide-react';
import { SOSAlert, SafeRoute, UserProfile } from '../../types';
import confetti from 'canvas-confetti';

interface CustomVoicePhrase {
  id: string;
  phrase: string;
  action: 'SOS' | 'ROUTE' | 'MAP' | 'FAMILY';
  sosType?: SOSAlert['type'];
  description: string;
}

interface Props {
  user: UserProfile;
  safeRoute: SafeRoute;
  onTriggerSOS: (type: SOSAlert['type'], customNote?: string) => void;
  onNavigateTab: (tab: 'HOME' | 'MAP' | 'ROUTE' | 'SOS' | 'NOTIFICATIONS' | 'PEOPLE' | 'PROFILE' | 'EVENT' | 'SETTINGS') => void;
  onClose?: () => void;
}

const DEFAULT_PHRASES: CustomVoicePhrase[] = [
  { id: '1', phrase: 'help me', action: 'SOS', sosType: 'STAMPEDE_RISK', description: 'Triggers Immediate SOS Alert' },
  { id: '2', phrase: 'emergency', action: 'SOS', sosType: 'MEDICAL_EMERGENCY', description: 'Triggers Medical Emergency' },
  { id: '3', phrase: 'safe route', action: 'ROUTE', description: 'Opens Safe Evacuation Navigation' },
  { id: '4', phrase: 'show map', action: 'MAP', description: 'Opens Live Crowd Heatmap' },
  { id: '5', phrase: 'where is my family', action: 'FAMILY', description: 'Opens Family Radar Tracker' },
];

export const CitizenVoiceControl: React.FC<Props> = ({
  user,
  safeRoute,
  onTriggerSOS,
  onNavigateTab,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastActionStatus, setLastActionStatus] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'VOICE' | 'PHRASES'>('VOICE');

  const [phrases, setPhrases] = useState<CustomVoicePhrase[]>(() => {
    try {
      const saved = localStorage.getItem('kumbh_custom_voice_phrases_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_PHRASES;
  });

  const [newPhraseText, setNewPhraseText] = useState('');
  const [newPhraseAction, setNewPhraseAction] = useState<'SOS' | 'ROUTE' | 'MAP' | 'FAMILY'>('SOS');

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        const lower = currentTranscript.trim().toLowerCase();
        setTranscript(lower);
        processVoiceCommand(lower);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [phrases]);

  // Save phrases
  useEffect(() => {
    try {
      localStorage.setItem('kumbh_custom_voice_phrases_v2', JSON.stringify(phrases));
    } catch (e) {}
  }, [phrases]);

  // Voice feedback
  const speakFeedback = (text: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  const processVoiceCommand = (commandText: string) => {
    if (!commandText) return;
    const matched = phrases.find((p) => commandText.includes(p.phrase.toLowerCase()));
    if (matched) {
      executeAction(matched);
      return;
    }

    if (commandText.includes('sos') || commandText.includes('help') || commandText.includes('emergency')) {
      executeAction({ id: 'auto_sos', phrase: 'help', action: 'SOS', description: 'Emergency SOS' });
    } else if (
      commandText.includes('hospital') ||
      commandText.includes('doctor') ||
      commandText.includes('petrol') ||
      commandText.includes('fuel') ||
      commandText.includes('hotel') ||
      commandText.includes('police') ||
      commandText.includes('garage') ||
      commandText.includes('mechanic') ||
      commandText.includes('toll') ||
      commandText.includes('bus')
    ) {
      onNavigateTab('EVENT');
      const msg = 'Opening nearby essential services and facilities.';
      setLastActionStatus(msg);
      speakFeedback(msg);
    } else if (commandText.includes('route') || commandText.includes('exit') || commandText.includes('navigate')) {
      executeAction({ id: 'auto_route', phrase: 'route', action: 'ROUTE', description: 'Safe Route' });
    } else if (commandText.includes('map')) {
      executeAction({ id: 'auto_map', phrase: 'map', action: 'MAP', description: 'Map' });
    } else if (commandText.includes('family')) {
      executeAction({ id: 'auto_fam', phrase: 'family', action: 'FAMILY', description: 'Family' });
    }
  };

  const executeAction = (phraseObj: CustomVoicePhrase) => {
    if (phraseObj.action === 'SOS') {
      onTriggerSOS(phraseObj.sosType || 'STAMPEDE_RISK', `Voice Command: "${phraseObj.phrase}"`);
      onNavigateTab('SOS');
      confetti({ particleCount: 60, spread: 60 });
      const msg = 'Emergency SOS dispatched to Command Center!';
      setLastActionStatus(msg);
      speakFeedback(msg);
    } else if (phraseObj.action === 'ROUTE') {
      onNavigateTab('ROUTE');
      const msg = 'Opening safe evacuation route.';
      setLastActionStatus(msg);
      speakFeedback(msg);
    } else if (phraseObj.action === 'MAP') {
      onNavigateTab('MAP');
      const msg = 'Loading crowd density map.';
      setLastActionStatus(msg);
      speakFeedback(msg);
    } else if (phraseObj.action === 'FAMILY') {
      onNavigateTab('PEOPLE');
      const msg = 'Opening family radar tracker.';
      setLastActionStatus(msg);
      speakFeedback(msg);
    }

    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
    } else {
      setTranscript('');
      setLastActionStatus(null);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          setIsListening(true);
        }
      } else {
        setIsListening(true);
      }
    }
  };

  const handleAddPhrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhraseText.trim()) return;

    const newPhrase: CustomVoicePhrase = {
      id: `phrase-${Date.now()}`,
      phrase: newPhraseText.trim().toLowerCase(),
      action: newPhraseAction,
      description: `Custom Trigger for ${newPhraseAction}`,
    };

    setPhrases([newPhrase, ...phrases]);
    setNewPhraseText('');
  };

  const handleDeletePhrase = (id: string) => {
    setPhrases(phrases.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-3.5 text-slate-100 pb-8">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Hands-Free Voice Assistant</span>
        </div>
        <h2 className="text-lg font-black text-white">Voice Safety Controls</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Say "Help Me", "Safe Route", or "Where is my family" to trigger actions hands-free.
        </p>
      </div>

      {/* View Switcher */}
      <div className="clean-card p-1 flex items-center justify-between text-xs border-slate-800">
        <button
          onClick={() => setActiveTab('VOICE')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition ${
            activeTab === 'VOICE' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Voice Mic
        </button>
        <button
          onClick={() => setActiveTab('PHRASES')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition ${
            activeTab === 'PHRASES' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Custom Phrases ({phrases.length})
        </button>
      </div>

      {activeTab === 'VOICE' ? (
        <div className="space-y-3.5">
          {/* Main Voice Mic Box */}
          <div className="clean-card p-5 border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-full flex justify-between items-center text-xs text-slate-400">
              <span className="flex items-center gap-1 font-bold text-slate-300">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Vocal Recognition</span>
              </span>
              <button
                onClick={() => setTtsEnabled(!ttsEnabled)}
                className="p-1 rounded-lg border border-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1"
              >
                {ttsEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                <span>{ttsEnabled ? 'Voice ON' : 'Muted'}</span>
              </button>
            </div>

            {/* Mic Button */}
            <div className="py-3 flex items-center justify-center">
              <button
                onClick={toggleListening}
                className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all shadow-lg active:scale-95 border-2 ${
                  isListening
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-cyan-500/30'
                    : 'bg-slate-900 text-cyan-400 border-slate-700 hover:border-cyan-400'
                }`}
              >
                <Mic className={`w-8 h-8 mb-1 ${isListening ? 'animate-bounce' : ''}`} />
                <span className="font-black text-[11px] uppercase tracking-wider">
                  {isListening ? 'LISTENING' : 'TAP TO SPEAK'}
                </span>
              </button>
            </div>

            {/* Transcript */}
            <div className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-left text-xs space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>TRANSCRIPT:</span>
                <span className={isListening ? 'text-cyan-400' : 'text-slate-500'}>
                  {isListening ? 'Listening live...' : 'Idle'}
                </span>
              </div>
              <p className="text-xs font-bold text-white min-h-[20px]">
                {transcript ? `"${transcript}"` : isListening ? 'Speak now...' : 'Tap the mic and speak'}
              </p>
            </div>

            {/* Last Action */}
            {lastActionStatus && (
              <div className="w-full p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-bold flex items-center gap-2 text-left">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{lastActionStatus}</span>
              </div>
            )}
          </div>

          {/* Quick Voice Triggers for Testing */}
          <div className="clean-card p-4 space-y-2.5 border-slate-800">
            <span className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
              Quick Test Triggers (Tap to simulate):
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {phrases.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  onClick={() => executeAction(p)}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-left transition active:scale-95 flex items-center gap-2"
                >
                  <div className={`p-1.5 rounded-lg shrink-0 ${
                    p.action === 'SOS' ? 'bg-red-500/20 text-red-400' : 'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {p.action === 'SOS' ? <AlertOctagon className="w-3.5 h-3.5" /> : <Navigation className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-white block truncate capitalize">"{p.phrase}"</span>
                    <span className="text-[10px] text-slate-400 block truncate">{p.action}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Custom Phrases Editor */
        <div className="clean-card p-4 space-y-3.5 border-slate-800">
          <form onSubmit={handleAddPhrase} className="space-y-2">
            <span className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
              Add New Custom Voice Command
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder='e.g. "bachao" or "exit"'
                value={newPhraseText}
                onChange={(e) => setNewPhraseText(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <select
                value={newPhraseAction}
                onChange={(e) => setNewPhraseAction(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none"
              >
                <option value="SOS">Emergency SOS</option>
                <option value="ROUTE">Safe Route</option>
                <option value="MAP">Live Map</option>
                <option value="FAMILY">Family Tracker</option>
              </select>
              <button
                type="submit"
                className="px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </form>

          <div className="space-y-1.5 pt-1">
            {phrases.map((phrase) => (
              <div
                key={phrase.id}
                className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white capitalize">"{phrase.phrase}"</span>
                  <span className="text-[10px] text-slate-400 block">{phrase.description}</span>
                </div>
                <button
                  onClick={() => handleDeletePhrase(phrase.id)}
                  className="p-1 text-slate-500 hover:text-red-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
