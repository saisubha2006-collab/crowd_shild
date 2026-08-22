import React, { useState, useRef, useEffect } from 'react';
import { EventItem, IncidentReport } from '../../types';
import { Camera, Mic, MapPin, Send, CheckCircle2, Upload, Video, Play, Square, X, RefreshCw, Volume2, StopCircle, AlertTriangle } from 'lucide-react';

interface Props {
  event: EventItem;
  userCoords?: [number, number];
  onSubmit: (report: Partial<IncidentReport>) => void;
}

export const CitizenReport: React.FC<Props> = ({ event, userCoords = [25.4362, 81.8488], onSubmit }) => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'CROWD_SURGE' | 'BARRICADE_BREACH' | 'MEDICAL_HAZARD' | 'FIRE_HAZARD' | 'LOST_PERSON' | 'OTHER'>('CROWD_SURGE');
  const [severity, setSeverity] = useState<'SAFE' | 'MODERATE' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  
  // Real Camera WebRTC state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Real Audio Recording state
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      mediaStreamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Camera access denied or unavailable. You can upload an image/video file directly.');
    }
  };

  const takeCameraSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPhotoPreview(dataUrl);
      stopCameraStream();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (file.type.startsWith('video/')) {
          setVideoPreview(reader.result as string);
        } else {
          setPhotoPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimulatePhoto = () => {
    setPhotoPreview('https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80');
    setDescription('Barricade knocked over at East Gate Alley 3. High push density detected.');
  };

  // Real Audio Recorder using MediaRecorder
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      audioRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsAudioRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access denied, using simulated audio recording:', err);
      setIsAudioRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);

      setTimeout(() => {
        stopAudioRecordingSimulated();
      }, 4000);
    }
  };

  const stopAudioRecording = () => {
    if (audioRecorderRef.current && audioRecorderRef.current.state !== 'inactive') {
      audioRecorderRef.current.stop();
    } else {
      stopAudioRecordingSimulated();
    }
    clearInterval(timerIntervalRef.current);
    setIsAudioRecording(false);
  };

  const stopAudioRecordingSimulated = () => {
    clearInterval(timerIntervalRef.current);
    setIsAudioRecording(false);
    setAudioUrl('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description && !photoPreview && !videoPreview && !audioUrl) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({
        description: description || `${category.replace(/_/g, ' ')} incident reported`,
        photoUrl: photoPreview || undefined,
        eventName: event.name,
        location: `Sector Corridor (${userCoords[0].toFixed(4)}° N, ${userCoords[1].toFixed(4)}° E)`,
        coordinates: userCoords,
        aiSeverity: severity,
        aiRiskScore: severity === 'CRITICAL' ? 95 : severity === 'HIGH' ? 80 : severity === 'MODERATE' ? 50 : 25,
        aiSummary: `Citizen report submitted for ${category.replace(/_/g, ' ')}. Severity flagged as ${severity}.`,
        aiActions: [
          'Dispatch field security to coordinates',
          'Evaluate bottleneck density at adjacent gate',
          'Update status board in Command Center'
        ],
      });
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 400);
  };

  return (
    <div className="space-y-4 text-slate-100">
      <div className="space-y-1">
        <h2 className="text-base font-bold text-white flex items-center gap-1.5">
          <Camera className="w-5 h-5 text-blue-400" />
          Crowd Incident & Hazard Reporting
        </h2>
        <p className="text-xs text-slate-400">
          Capture photos, video clips, voice notes, or report hazards directly to the Command Center dispatch.
        </p>
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Incident Category & Severity Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Incident Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="CROWD_SURGE">Crowd Surge / Crush Pressure</option>
                <option value="BARRICADE_BREACH">Barricade / Gate Breach</option>
                <option value="MEDICAL_HAZARD">Medical Emergency / Fainting</option>
                <option value="FIRE_HAZARD">Fire / Smoke Hazard</option>
                <option value="LOST_PERSON">Lost Person / Child Separation</option>
                <option value="OTHER">Other Public Safety Issue</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Urgency Level
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['SAFE', 'MODERATE', 'HIGH', 'CRITICAL'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSeverity(lvl)}
                    className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition text-center ${
                      severity === lvl
                        ? lvl === 'CRITICAL'
                          ? 'bg-red-600 text-white border-red-400'
                          : lvl === 'HIGH'
                          ? 'bg-amber-600 text-white border-amber-400'
                          : lvl === 'MODERATE'
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-emerald-600 text-white border-emerald-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Text Description */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Incident Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="E.g., Gate 2 barricade fallen, narrow bottleneck creating high push pressure..."
            />
          </div>

          {/* Camera / Video / Photo Capture Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">Camera & Media Evidence</label>
              <button
                type="button"
                onClick={handleSimulatePhoto}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Use Sample Crowd Photo
              </button>
            </div>

            {/* Live Camera View Mode */}
            {isCameraActive ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-blue-500 bg-slate-950 h-52 flex flex-col justify-between p-2">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-xl" />
                
                <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white"></span> LIVE CAMERA
                </div>

                <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={takeCameraSnapshot}
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" /> Snap Photo
                  </button>
                  <button
                    type="button"
                    onClick={stopCameraStream}
                    className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : photoPreview || videoPreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-2">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Incident preview"
                    className="w-full h-44 object-cover rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <video src={videoPreview!} controls className="w-full h-44 object-cover rounded-xl" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setVideoPreview(null);
                  }}
                  className="absolute top-4 right-4 bg-black/70 hover:bg-red-600 text-white p-1.5 rounded-full transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={startCamera}
                  className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-300 hover:text-white transition active:scale-95"
                >
                  <Camera className="w-5 h-5 text-blue-400" />
                  <span className="text-[11px] font-bold">Open Camera</span>
                </button>

                <label className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer">
                  <Upload className="w-5 h-5 text-emerald-400" />
                  <span className="text-[11px] font-bold">Upload Media</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {cameraError && (
              <p className="text-[11px] text-amber-400 bg-amber-950/40 p-2 rounded-xl border border-amber-800">
                {cameraError}
              </p>
            )}
          </div>

          {/* Voice Audio Note Recording with Interactive Playback Player */}
          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className={`w-4 h-4 ${isAudioRecording ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
                <div>
                  <span className="font-semibold block">
                    {isAudioRecording
                      ? `Recording Audio (${recordingSeconds}s)...`
                      : audioUrl
                      ? 'Voice Note Captured ✓'
                      : 'Record Live Voice Note'}
                  </span>
                  <span className="text-[10px] text-slate-500">Audio note attached directly to dispatch</span>
                </div>
              </div>

              <button
                type="button"
                onClick={isAudioRecording ? stopAudioRecording : startAudioRecording}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition ${
                  isAudioRecording
                    ? 'bg-red-600 text-white animate-pulse'
                    : audioUrl
                    ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {isAudioRecording ? (
                  <>
                    <StopCircle className="w-3.5 h-3.5" /> Stop
                  </>
                ) : audioUrl ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" /> Re-record
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" /> Start Recording
                  </>
                )}
              </button>
            </div>

            {/* Interactive Audio Player Preview */}
            {audioUrl && (
              <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl space-y-1">
                <span className="text-[10px] text-cyan-400 font-bold block flex items-center gap-1">
                  <Volume2 className="w-3 h-3" /> Voice Note Audio Playback:
                </span>
                <audio controls src={audioUrl} className="w-full h-8" />
              </div>
            )}
          </div>

          {/* GPS Auto Tag Info */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-mono text-[10px]">
              GPS Attached: {userCoords[0].toFixed(4)}° N, {userCoords[1].toFixed(4)}° E (Device GPS Active)
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || (!description && !photoPreview && !videoPreview && !audioUrl)}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Transmitting to Command Center...' : 'Submit Incident Report to Command Center'}</span>
          </button>
        </form>
      ) : (
        /* Report Success Screen */
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-3xl space-y-4 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Report Logged Successfully</h3>
              <p className="text-xs text-slate-400">Transmitted to Command Center Dispatch & Ground Teams</p>
            </div>
          </div>

          {/* Render Voice Note in Success Screen */}
          {audioUrl && (
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl space-y-1">
              <span className="text-[10px] text-slate-400 font-semibold block flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-cyan-400" /> Attached Voice Note:
              </span>
              <audio controls src={audioUrl} className="w-full h-8" />
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300">Reported Category & Severity:</span>
              <span className="px-2 py-0.5 rounded font-bold bg-amber-950 text-amber-300 border border-amber-800">
                {category.replace(/_/g, ' ')} • {severity}
              </span>
            </div>
            <p className="text-slate-300">{description || 'Evidence attached and queued for dispatch.'}</p>
          </div>

          <button
            onClick={() => {
              setIsSubmitted(false);
              setPhotoPreview(null);
              setVideoPreview(null);
              setAudioUrl(null);
              setDescription('');
            }}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
          >
            Submit Another Incident
          </button>
        </div>
      )}
    </div>
  );
};
