import React, { useState } from 'react';
import { LayoutDashboard, Video, Layers, BarChart2, Bell, Calendar, Users, FileText, Settings } from 'lucide-react';
import { EventItem, Zone, CCTVCamera, SOSAlert, IncidentReport, Volunteer, NotificationItem, Gate } from '../../types';
import { AdminOverview } from './AdminOverview';
import { AdminCCTV } from './AdminCCTV';
import { AdminHeatmap } from './AdminHeatmap';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminAlerts } from './AdminAlerts';
import { AdminEventMgmt } from './AdminEventMgmt';
import { AdminVolunteers } from './AdminVolunteers';
import { AdminReports } from './AdminReports';
import { CitizenSettings } from '../citizen/CitizenSettings';

interface Props {
  events: EventItem[];
  selectedEvent: EventItem;
  zones: Zone[];
  cameras: CCTVCamera[];
  sosAlerts: SOSAlert[];
  incidents: IncidentReport[];
  volunteers: Volunteer[];
  notifications: NotificationItem[];
  onToggleGateStatus: (gateId: string, status: Gate['status']) => void;
  onDispatchPushNotification: (title: string, message: string, level: NotificationItem['level']) => void;
  onUpdateEvent: (updated: EventItem) => void;
  onCreateEvent: (newEvent: EventItem) => void;
  onOpenBroadcast: () => void;
  onOpenOfflineVault?: () => void;
  onOpenDemoControl?: () => void;
}

export const AdminDashboardContainer: React.FC<Props> = ({
  events,
  selectedEvent,
  zones,
  cameras,
  sosAlerts,
  incidents,
  volunteers,
  notifications,
  onToggleGateStatus,
  onDispatchPushNotification,
  onUpdateEvent,
  onCreateEvent,
  onOpenBroadcast,
  onOpenOfflineVault,
  onOpenDemoControl,
}) => {
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'CCTV' | 'HEATMAP' | 'ANALYTICS' | 'ALERTS' | 'EVENTS' | 'VOLUNTEERS' | 'REPORTS' | 'SETTINGS'
  >('OVERVIEW');

  const navItems = [
    { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
    { id: 'CCTV', label: 'CCTV Feeds', icon: Video },
    { id: 'HEATMAP', label: 'Heatmap & Gates', icon: Layers },
    { id: 'ANALYTICS', label: 'Flow & Analytics', icon: BarChart2 },
    { id: 'ALERTS', label: 'Alert Console', icon: Bell },
    { id: 'EVENTS', label: 'Event Mgmt', icon: Calendar },
    { id: 'VOLUNTEERS', label: 'Volunteers', icon: Users },
    { id: 'REPORTS', label: 'PDF Reports', icon: FileText },
    { id: 'SETTINGS', label: 'System & Theme', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Navigation Sub-Header Bar */}
      <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex items-center justify-between overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content Render */}
      <div className="min-h-[600px]">
        {activeTab === 'OVERVIEW' && (
          <AdminOverview
            event={selectedEvent}
            zones={zones}
            sosAlerts={sosAlerts}
            incidents={incidents}
            cameras={cameras}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenBroadcast={onOpenBroadcast}
          />
        )}

        {activeTab === 'CCTV' && <AdminCCTV cameras={cameras} />}

        {activeTab === 'HEATMAP' && (
          <AdminHeatmap
            event={selectedEvent}
            zones={zones}
            onToggleGateStatus={onToggleGateStatus}
          />
        )}

        {activeTab === 'ANALYTICS' && (
          <AdminAnalytics event={selectedEvent} zones={zones} />
        )}

        {activeTab === 'ALERTS' && (
          <AdminAlerts
            event={selectedEvent}
            notifications={notifications}
            onDispatchPushNotification={onDispatchPushNotification}
            onOpenBroadcast={onOpenBroadcast}
          />
        )}

        {activeTab === 'EVENTS' && (
          <AdminEventMgmt
            events={events}
            selectedEvent={selectedEvent}
            onUpdateEvent={onUpdateEvent}
            onCreateEvent={onCreateEvent}
          />
        )}

        {activeTab === 'VOLUNTEERS' && (
          <AdminVolunteers volunteers={volunteers} />
        )}

        {activeTab === 'REPORTS' && (
          <AdminReports
            event={selectedEvent}
            zones={zones}
            incidents={incidents}
            sosAlerts={sosAlerts}
          />
        )}

        {activeTab === 'SETTINGS' && (
          <div className="max-w-2xl mx-auto">
            <CitizenSettings />
          </div>
        )}
      </div>
    </div>
  );
};
