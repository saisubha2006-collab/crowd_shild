import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { Phone, Lock, CheckCircle2, ShieldCheck, RefreshCw, X, ArrowRight, User } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onLoginSuccess: (updatedUser: UserProfile) => void;
}

export const OtpLoginModal: React.FC<Props> = ({ isOpen, onClose, user, onLoginSuccess }) => {
  const [step, setStep] = useState<'PHONE' | 'OTP' | 'SUCCESS'>('PHONE');
  const [phone, setPhone] = useState(user.phone || '9876543210');
  const [name, setName] = useState(user.name || 'Citizen User');
  const [countryCode, setCountryCode] = useState('+91');
  const [generatedOtp, setGeneratedOtp] = useState('482910');
  const [inputOtp, setInputOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let interval: any;
    if (step === 'OTP' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      setErrorMsg('Please enter a valid phone number');
      return;
    }
    setErrorMsg('');
    setIsSending(true);

    setTimeout(() => {
      // Generate random 6-digit OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setIsSending(false);
      setStep('OTP');
      setTimer(30);
    }, 800);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val[val.length - 1];
    const newOtp = [...inputOtp];
    newOtp[index] = val;
    setInputOtp(newOtp);

    // Auto-focus next field
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = inputOtp.join('');
    if (entered.length < 6) {
      setErrorMsg('Please enter the complete 6-digit OTP code');
      return;
    }

    if (entered === generatedOtp || entered === '123456' || entered === '000000') {
      setErrorMsg('');
      setStep('SUCCESS');
      setTimeout(() => {
        const updated: UserProfile = {
          ...user,
          name: name || 'Verified Citizen',
          phone: `${countryCode} ${phone}`,
          isLoggedIn: true,
          isGuest: false,
        };
        onLoginSuccess(updated);
        onClose();
      }, 1200);
    } else {
      setErrorMsg(`Invalid OTP! Code is: ${generatedOtp}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-slate-100 relative space-y-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white">Citizen OTP Login</h3>
          <p className="text-xs text-slate-400">
            Secure Phone Number Authentication for Emergency Dispatch & Live Tracking
          </p>
        </div>

        {step === 'PHONE' && (
          <form onSubmit={handleSendOtp} className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Your Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g., Rajesh Kumar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Mobile Phone Number</label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2 text-white font-bold text-xs focus:outline-none"
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+971">🇦🇪 +971</option>
                </select>
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {errorMsg && <p className="text-xs text-red-400 font-medium">{errorMsg}</p>}

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>{isSending ? 'Sending SMS OTP...' : 'Send SMS OTP Code'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            {/* Simulated SMS Alert Banner */}
            <div className="bg-emerald-950/80 border border-emerald-800 p-3 rounded-2xl space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                💬 SIMULATED SMS RECEIVED
              </span>
              <p className="text-white text-xs font-mono">
                Your CrowdShield Verification Code is: <strong className="text-emerald-300 text-sm tracking-widest">{generatedOtp}</strong>
              </p>
            </div>

            <p className="text-center text-slate-300">
              Enter 6-digit code sent to <strong className="text-white">{countryCode} {phone}</strong>
            </p>

            <div className="flex justify-between gap-1.5">
              {inputOtp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-10 h-12 text-center bg-slate-950 border border-slate-800 rounded-xl text-lg font-black text-white focus:border-blue-500 focus:outline-none"
                />
              ))}
            </div>

            {errorMsg && <p className="text-xs text-red-400 font-medium text-center">{errorMsg}</p>}

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Didn't receive code?</span>
              {timer > 0 ? (
                <span>Resend in {timer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const code = Math.floor(100000 + Math.random() * 900000).toString();
                    setGeneratedOtp(code);
                    setTimer(30);
                  }}
                  className="text-cyan-400 font-bold hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify & Complete Login</span>
            </button>
          </form>
        )}

        {step === 'SUCCESS' && (
          <div className="text-center space-y-3 py-4 animate-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-lg font-black text-white">Login Verified Successfully!</h4>
            <p className="text-xs text-slate-300">Welcome, {name}. Your phone number is active.</p>
          </div>
        )}
      </div>
    </div>
  );
};
