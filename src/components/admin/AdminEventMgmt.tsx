import React, { useState } from 'react';
import { EventItem, Gate } from '../../types';
import { Calendar, Plus, MapPin, Users, DoorOpen as GateIcon, Edit, Save, CheckCircle2 } from 'lucide-react';

interface Props {
  events: EventItem[];
  selectedEvent: EventItem;
  onUpdateEvent: (updated: EventItem) => void;
  onCreateEvent: (newEvent: EventItem) => void;
}

export const AdminEventMgmt: React.FC<Props> = ({
  events,
  selectedEvent,
  onUpdateEvent,
  onCreateEvent,
}) => {
  const [eventName, setEventName] = useState(selectedEvent.name);
  const [venue, setVenue] = useState(selectedEvent.venue);
  const [expected, setExpected] = useState(selectedEvent.expectedCrowd.toString());
  const [capacity, setCapacity] = useState(selectedEvent.capacity.toString());
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateEvent({
      ...selectedEvent,
      name: eventName,
      venue,
      expectedCrowd: parseInt(expected) || 100000,
      capacity: parseInt(capacity) || 120000,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Event Configuration & Venue Floorplan Management
          </h2>
          <p className="text-xs text-slate-400">
            Setup Event Parameters, Expected Crowd Capacity, Entry/Exit Gates & Assigned Camera Feeds
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Edit Event Form */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-2">
            <Edit className="w-5 h-5 text-blue-400" /> Edit Active Event Parameters
          </h3>

          <form onSubmit={handleSave} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Event Name</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1">Venue Location</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Expected Attendees</label>
                <input
                  type="number"
                  value={expected}
                  onChange={(e) => setExpected(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Venue Maximum Capacity</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Event Changes</span>
            </button>

            {saved && (
              <div className="p-2.5 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" /> Event Details Updated Successfully!
              </div>
            )}
          </form>
        </div>

        {/* Venue Gates Summary */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-2">
            <GateIcon className="w-5 h-5 text-amber-400" /> Configured Gates & Access Corridors
          </h3>

          <div className="space-y-2.5">
            {selectedEvent.gates.map((g) => (
              <div key={g.id} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">{g.name}</span>
                  <span className="text-[10px] text-slate-400">
                    Type: {g.type} • Clearance Rate: {g.capacity} p/min
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {g.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
