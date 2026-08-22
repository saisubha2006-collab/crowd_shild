import React, { useState, useEffect, useRef } from 'react';
import { EventItem, Zone, Gate } from '../../types';
import { Layers, DoorOpen, ShieldCheck, Sliders, AlertOctagon, CheckCircle2, Lock, Unlock } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Props {
  event: EventItem;
  zones: Zone[];
  onToggleGateStatus: (gateId: string, status: Gate['status']) => void;
}

export const AdminHeatmap: React.FC<Props> = ({ event, zones, onToggleGateStatus }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: event.coordinates,
        zoom: 16,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.Polygon || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    zones.forEach((z) => {
      let color = '#10B981';
      if (z.riskLevel === 'CRITICAL') color = '#EF4444';
      else if (z.riskLevel === 'HIGH') color = '#F97316';
      else if (z.riskLevel === 'MODERATE') color = '#F59E0B';

      L.polygon(z.coordinates as [number, number][], {
        color: color,
        fillColor: color,
        fillOpacity: 0.45,
        weight: 3,
      }).addTo(map);
    });

    event.gates.forEach((g) => {
      const color = g.status === 'OPEN' ? '#10B981' : g.status === 'RESTRICTED' ? '#F59E0B' : '#EF4444';
      const gateMarker = L.divIcon({
        className: 'admin-gate-marker',
        html: `
          <div style="border-color: ${color};" className="bg-slate-900 text-white px-2 py-1 rounded-lg border-2 text-[10px] font-bold shadow-xl">
            🚪 ${g.name} (${g.status})
          </div>
        `,
        iconSize: [110, 24],
        iconAnchor: [55, 12],
      });
      L.marker(g.position, { icon: gateMarker }).addTo(map);
    });
  }, [event, zones]);

  return (
    <div className="space-y-6 text-slate-100">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            Live Crowd Density Heatmap & Gate Remote Control
          </h2>
          <p className="text-xs text-slate-400">
            Real-Time Heatmap Encoding (Green / Yellow / Orange / Red) & Gate Clearance Automation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap Map Frame */}
        <div className="lg:col-span-2 bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 h-[460px] relative shadow-2xl">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          <div className="absolute top-3 left-3 z-20 bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
            <span className="font-bold text-slate-200 block">Density Thresholds:</span>
            <div className="flex items-center gap-2 text-[11px]"><span className="w-3 h-3 rounded bg-emerald-500"></span> &lt;3.0 p/m² Safe</div>
            <div className="flex items-center gap-2 text-[11px]"><span className="w-3 h-3 rounded bg-amber-500"></span> 3.0 - 5.0 p/m² Moderate</div>
            <div className="flex items-center gap-2 text-[11px]"><span className="w-3 h-3 rounded bg-orange-500"></span> 5.0 - 6.0 p/m² High</div>
            <div className="flex items-center gap-2 text-[11px]"><span className="w-3 h-3 rounded bg-red-500 animate-pulse"></span> &gt;6.0 p/m² Critical</div>
          </div>
        </div>

        {/* Gate Remote Control Center */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-2">
            <DoorOpen className="w-5 h-5 text-blue-400" /> Remote Gate Controls
          </h3>

          <div className="space-y-3">
            {event.gates.map((gate) => (
              <div key={gate.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{gate.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      gate.status === 'OPEN'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : gate.status === 'RESTRICTED'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-red-950 text-red-300 border border-red-800'
                    }`}
                  >
                    {gate.status}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>Type: {gate.type}</span>
                  <span>Cap: {gate.capacity} p/min</span>
                </div>

                <div className="flex gap-1.5 pt-1">
                  <button
                    onClick={() => onToggleGateStatus(gate.id, 'OPEN')}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                      gate.status === 'OPEN'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-emerald-600'
                    }`}
                  >
                    Open Gate
                  </button>
                  <button
                    onClick={() => onToggleGateStatus(gate.id, 'RESTRICTED')}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                      gate.status === 'RESTRICTED'
                        ? 'bg-amber-600 text-white border-amber-500'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-600'
                    }`}
                  >
                    Restrict
                  </button>
                  <button
                    onClick={() => onToggleGateStatus(gate.id, 'CLOSED')}
                    className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                      gate.status === 'CLOSED'
                        ? 'bg-red-600 text-white border-red-500'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-red-600'
                    }`}
                  >
                    Lock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
