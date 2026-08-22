import React, { useState } from 'react';
import { Volume2, VolumeX, X, Globe, Play, Square, Send } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultMessage?: string;
}

export const AudioPlayerModal: React.FC<Props> = ({ isOpen, onClose, defaultMessage }) => {
  const [message, setMessage] = useState(
    defaultMessage || 'ATTENTION: East Gate Passage is heavily crowded. Please proceed towards Emergency Gate 4 on the West side.'
  );
  
  const translations: Record<string, string> = {
    English: message,
    Hindi: 'ध्यान दें: ईस्ट गेट मार्ग में अत्यधिक भीड़ है। कृपया पश्चिम दिशा में आपातकालीन गेट 4 की ओर बढ़ें।',
    Tamil: 'கவனத்திற்கு: கிழக்கு கேட் வழி மிகவும் கூட்டமாக உள்ளது. தயவுசெய்து மேற்கு பகுதியில் உள்ள அவசர கேட் 4 நோக்கி செல்லவும்.',
    Bengali: 'দৃষ্টি আকর্ষণ: পূর্ব গেট সংলগ্ন এলাকায় প্রচুর ভিড়। অনুগ্রহ করে পশ্চিম দিকের জরুরি গেট ৪ দিয়ে প্রস্থান করুন।',
    Marathi: 'लक्ष द्या: पूर्व गेटवर प्रचंड गर्दी आहे. कृपया पश्चिम दिशेकडील आपत्कालीन गेट ४ कडे मार्गस्थ व्हा.',
    Telugu: 'గమనిక: తూర్పు గేట్ మార్గంలో విపరీతమైన రద్దీ ఉంది. దయచేసి పశ్చిమ వైపు ఉన్న ఎమర్జెన్సీ గేట్ 4 వైపు వెళ్లండి.',
  };

  const [selectedLang, setSelectedLang] = useState('English');
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen) return null;

  const handlePlayAudio = () => {
    const textToSpeak = selectedLang === 'English' ? message : (translations[selectedLang] || message);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      // Select appropriate voice if available
      const voices = window.speechSynthesis.getVoices();
      if (selectedLang === 'Hindi') {
        const hiVoice = voices.find(v => v.lang.includes('hi'));
        if (hiVoice) utterance.voice = hiVoice;
      } else if (selectedLang === 'Tamil') {
        const taVoice = voices.find(v => v.lang.includes('ta'));
        if (taVoice) utterance.voice = taVoice;
      } else if (selectedLang === 'Bengali') {
        const bnVoice = voices.find(v => v.lang.includes('bn'));
        if (bnVoice) utterance.voice = bnVoice;
      } else if (selectedLang === 'Marathi') {
        const mrVoice = voices.find(v => v.lang.includes('mr'));
        if (mrVoice) utterance.voice = mrVoice;
      } else if (selectedLang === 'Telugu') {
        const teVoice = voices.find(v => v.lang.includes('te'));
        if (teVoice) utterance.voice = teVoice;
      }
      
      utterance.rate = 0.9;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={() => {
            handleStopAudio();
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Multilingual PA Emergency Broadcast</h3>
            <p className="text-xs text-slate-400">CrowdShield Emergency Audio Dispatch System</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Broadcast Message Script
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Type announcement..."
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <Globe className="w-3.5 h-3.5" /> Select Language
              </span>
              <span>{Object.keys(translations).length} Languages Ready</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.keys(translations).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLang(lang)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    selectedLang === lang
                      ? 'bg-blue-600 border-blue-400 text-white shadow-sm'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl text-sm font-medium text-slate-200 min-h-[70px] leading-relaxed">
              {selectedLang === 'English' ? message : (translations[selectedLang] || message)}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            {!isPlaying ? (
              <button
                onClick={handlePlayAudio}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Play Live PA Announcement</span>
              </button>
            ) : (
              <button
                onClick={handleStopAudio}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition animate-pulse"
              >
                <Square className="w-5 h-5 fill-current" />
                <span>Stop Announcement Playback</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
