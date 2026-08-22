import React, { useState, useEffect, useRef } from 'react';
import { CCTVCamera } from '../../types';
import { Video, Camera, Eye, ShieldAlert, AlertOctagon, Activity, RefreshCw } from 'lucide-react';

interface Props {
  cameras: CCTVCamera[];
}

export const AdminCCTV: React.FC<Props> = ({ cameras }) => {
  const [selectedCam, setSelectedCam] = useState<CCTVCamera>(cameras[0] || cameras[0]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw person detection bounding boxes on canvas over selected camera feed
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = selectedCam.streamPoster;
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width || 800;
      canvas.height = img.height || 450;

      // Draw poster frame
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw bounding boxes
      selectedCam.boundingBoxes.forEach((box) => {
        const bx = (box.x / 100) * canvas.width;
        const by = (box.y / 100) * canvas.height;
        const bw = (box.w / 100) * canvas.width;
        const bh = (box.h / 100) * canvas.height;

        // Draw Box
        ctx.strokeStyle = selectedCam.status === 'CRITICAL_ALERT' ? '#EF4444' : '#3B82F6';
        ctx.lineWidth = 3;
        ctx.strokeRect(bx, by, bw, bh);

        // Label Background
        ctx.fillStyle = selectedCam.status === 'CRITICAL_ALERT' ? '#EF4444' : '#3B82F6';
        ctx.fillRect(bx, by - 22, bw, 22);

        // Text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`${box.label} (${Math.round(box.confidence * 100)}%)`, bx + 5, by - 6);
      });

      // Flow Vector Overlay
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height / 2);
      ctx.lineTo(canvas.width / 2 + 60, canvas.height / 2 + 40);
      ctx.stroke();
    };
  }, [selectedCam]);

  return (
    <div className="space-y-6 text-slate-100">
      {/* CCTV Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-3xl">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-400" />
            Live Security CCTV Surveillance Feeds
          </h2>
          <p className="text-xs text-slate-400">
            Real-time optical crowd detection, person tracking & corridor flow dynamics
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{cameras.length} Active Video Channels</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Stream Canvas Frame */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
            <canvas ref={canvasRef} className="w-full h-[400px] object-cover block" />

            {/* Live Camera Badge Overlay */}
            <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-2 text-white">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>{selectedCam.name}</span>
            </div>

            <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold text-amber-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Flow: {selectedCam.flowDirection} ({selectedCam.flowSpeedMps} m/s)</span>
            </div>

            <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-mono text-cyan-300">
              Live Count: {selectedCam.liveCount} Persons Tracked • Density: {selectedCam.density} p/m²
            </div>
          </div>
        </div>

        {/* Camera Selector Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Security Feeds ({cameras.length})
          </h3>

          <div className="space-y-2">
            {cameras.map((cam) => (
              <button
                key={cam.id}
                onClick={() => setSelectedCam(cam)}
                className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 transition ${
                  selectedCam.id === cam.id
                    ? 'bg-blue-950/80 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-16 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-slate-950">
                  <img src={cam.streamPoster} alt={cam.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="font-bold text-xs text-white truncate block">{cam.name}</span>
                  <span className="text-[10px] text-slate-400 block">{cam.location}</span>
                  <span className="text-[10px] text-amber-300 font-mono">
                    {cam.liveCount} people • {cam.density} p/m²
                  </span>
                </div>

                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    cam.status === 'CRITICAL_ALERT' ? 'bg-red-500 animate-ping' : 'bg-emerald-500'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
