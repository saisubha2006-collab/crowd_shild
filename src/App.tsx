import React, { useState, useEffect } from 'react';
import {
  INITIAL_USER,
  MOCK_EVENTS,
  MOCK_ZONES,
  MOCK_CCTV,
  MOCK_SOS_ALERTS,
  MOCK_INCIDENTS,
  MOCK_VOLUNTEERS,
  MOCK_NOTIFICATIONS,
  MOCK_SAFE_ROUTE,
} from './data/mockData';
import { EventItem, Zone, Gate, SOSAlert, IncidentReport, NotificationItem, UserProfile, SafeRoute } from './types';
import { Header } from './components/Header';
import { CitizenAppContainer } from './components/citizen/CitizenAppContainer';
import { AdminDashboardContainer } from './components/admin/AdminDashboardContainer';
import { AudioPlayerModal } from './components/shared/AudioPlayerModal';
import { SettingsModal } from './components/shared/SettingsModal';
import { OfflineVaultModal } from './components/shared/OfflineVaultModal';
import { DemoControlCenter } from './components/shared/DemoControlCenter';
import { DeviceProvider } from './components/os/DeviceContext';
import { ThemeProvider } from './context/ThemeContext';
import { OSWrapper } from './components/os/OSWrapper';
import { cacheSafetyPack } from './utils/offlineStorage';
import {
  getExactDeviceLocation,
  createDynamicDeviceEvent,
  saveDeviceLocation,
  ExactDeviceState,
} from './utils/deviceLocationManager';

export default function App() {
  const [viewMode, setViewMode] = useState<'CITIZEN' | 'ADMIN'>('CITIZEN');
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER);
  const [events, setEvents] = useState<EventItem[]>(MOCK_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<EventItem>(MOCK_EVENTS[0]);
  const [zones, setZones] = useState<Zone[]>(MOCK_ZONES);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>(MOCK_SOS_ALERTS);
  const [incidents, setIncidents] = useState<IncidentReport[]>(MOCK_INCIDENTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [activeSafeRoute, setActiveSafeRoute] = useState<SafeRoute>(MOCK_SAFE_ROUTE);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOfflineVaultOpen, setIsOfflineVaultOpen] = useState(false);
  const [isDemoControlOpen, setIsDemoControlOpen] = useState(false);

  // Exact Device GPS State & Continuous Tracking
  const [exactDeviceState, setExactDeviceState] = useState<ExactDeviceState | null>(null);
  const [isRefreshingGPS, setIsRefreshingGPS] = useState(false);

  // Function to acquire real live device coordinates & build custom safety environment
  const syncExactDeviceLocation = async (showNotice: boolean = false) => {
    setIsRefreshingGPS(true);
    try {
      const devState = await getExactDeviceLocation();
      setExactDeviceState(devState);
      saveDeviceLocation(devState.coords);

      // Create dynamic event and safety zones around user's exact device location
      const { event: dynamicEvt, zones: dynamicZones, safeRoute: dynamicRoute } = createDynamicDeviceEvent(
        devState.coords,
        devState.address
      );

      // Update User Profile with exact coordinates and address
      setCurrentUser((prev) => ({
        ...prev,
        coordinates: devState.coords,
        currentLocationName: devState.address.displayName,
      }));

      // Set active event to user's exact live location
      setSelectedEvent(dynamicEvt);
      setEvents([dynamicEvt, ...MOCK_EVENTS]);
      setZones(dynamicZones);
      setActiveSafeRoute(dynamicRoute);

      // Cache safety pack for offline persistence
      cacheSafetyPack(dynamicEvt, dynamicZones, devState.coords);

      if (showNotice) {
        const syncNotif: NotificationItem = {
          id: `notif-sync-${Date.now()}`,
          title: '📍 EXACT DEVICE GPS LOCKED',
          message: `Centered on ${devState.address.displayName} (${devState.coords[0].toFixed(5)}° N, ${devState.coords[1].toFixed(5)}° E) with ${devState.accuracyMeters ? `±${devState.accuracyMeters}m` : 'high'} precision.`,
          level: 'INFO',
          timestamp: 'Just now',
          read: false,
        };
        setNotifications((prev) => [syncNotif, ...prev]);
      }
    } catch (err) {
      console.warn('Sync location err:', err);
    } finally {
      setIsRefreshingGPS(false);
    }
  };

  // On App Launch: Automatically acquire exact device location
  useEffect(() => {
    syncExactDeviceLocation(false);
  }, []);

  // Toggle Gate Status (e.g. Open Relief Gate 4)
  const handleToggleGateStatus = (gateId: string, status: Gate['status']) => {
    const updatedGates = selectedEvent.gates.map((g) => {
      if (g.id === gateId) return { ...g, status };
      return g;
    });

    const updatedEvt = { ...selectedEvent, gates: updatedGates };
    setSelectedEvent(updatedEvt);
    setEvents(events.map((e) => (e.id === updatedEvt.id ? updatedEvt : e)));

    // If gate opened, lower risk score in density zone!
    if (status === 'OPEN' && gateId === 'g4') {
      const updatedZones = zones.map((z) => {
        if (z.id === 'zn-1') {
          return {
            ...z,
            density: 4.1,
            riskScore: 58,
            riskLevel: 'MODERATE' as const,
            suggestedAction: 'Relief Gate 4 opened. Crowd diverting smoothly.',
          };
        }
        return z;
      });
      setZones(updatedZones);

      // Add notification
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: '✅ EMERGENCY GATE 4 OPENED',
        message: 'Gate 4 opened by Command Center. East Gate congestion reduced to 4.1 p/m².',
        level: 'INFO',
        timestamp: 'Just now',
        read: false,
      };
      setNotifications([newNotif, ...notifications]);
    }
  };

  // Trigger Citizen SOS
  const handleTriggerSOS = (type: SOSAlert['type'], customNote?: string) => {
    const newSos: SOSAlert = {
      id: `sos-${Date.now()}`,
      userName: currentUser.name,
      userPhone: currentUser.phone || '+91 9876543210',
      eventId: selectedEvent.id,
      eventName: selectedEvent.name,
      zoneName: 'East Gate Passage (Zone 1)',
      coordinates: currentUser.coordinates,
      timestamp: 'Just now',
      type,
      status: 'DISPATCHING',
      assignedResponders: ['PCR Van 04 (Dispatched)', 'Volunteer Group Delta'],
    };
    setSosAlerts([newSos, ...sosAlerts]);
  };

  // Submit Incident Report
  const handleSubmitIncident = (report: Partial<IncidentReport>) => {
    const newInc: IncidentReport = {
      id: `inc-${Date.now()}`,
      reporterName: currentUser.name,
      phone: currentUser.phone || '+91 9876543210',
      eventName: selectedEvent.name,
      location: report.location || 'East Gate Corridor',
      coordinates: currentUser.coordinates,
      description: report.description || 'Reported crowd hazard',
      photoUrl: report.photoUrl,
      timestamp: 'Just now',
      status: 'AI_VERIFIED',
      aiSeverity: report.aiSeverity || 'HIGH',
      aiRiskScore: report.aiRiskScore || 80,
      aiSummary: report.aiSummary,
      aiActions: report.aiActions,
    };
    setIncidents([newInc, ...incidents]);
  };

  // Dispatch Push Notification
  const handleDispatchPushNotification = (title: string, message: string, level: NotificationItem['level']) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      level,
      timestamp: 'Just now',
      read: false,
      actionRecommended: 'Please follow safety directions immediately.',
    };
    setNotifications([newNotif, ...notifications]);
  };

  // Simulation Scenario: Crowd Surge Stampede
  const handleTriggerStampedeSurge = () => {
    const surgeZones = zones.map((z) => {
      if (z.id === 'zn-1') {
        return {
          ...z,
          density: 7.8,
          riskScore: 96,
          riskLevel: 'CRITICAL' as const,
          suggestedAction: 'CRITICAL DANGER: Surge detected. Open Relief Gate 4 and dispatch quick-reaction squad.',
        };
      }
      return z;
    });
    setZones(surgeZones);

    const surgeNotif: NotificationItem = {
      id: `notif-surge-${Date.now()}`,
      title: '🚨 CRITICAL STAMPEDE SURGE ALERT',
      message: 'Sudden crowd surge at East Gate (7.8 p/m²). Do not push forward. Rerouting to West Relief Gate 4.',
      level: 'CRITICAL',
      timestamp: 'Just now',
      read: false,
      actionRecommended: 'Cross your arms in boxer defense pose to protect your ribcage and move diagonally.',
    };
    setNotifications([surgeNotif, ...notifications]);
  };

  // Simulation Scenario: Medical Crisis Dispatch
  const handleTriggerMedicalCrisis = () => {
    const medSos: SOSAlert = {
      id: `sos-med-${Date.now()}`,
      userName: 'Rohit Sharma (Citizen)',
      userPhone: '+91 9988776655',
      eventId: selectedEvent.id,
      eventName: selectedEvent.name,
      zoneName: 'Central Plaza Junction (Zone 2)',
      coordinates: [selectedEvent.coordinates[0] + 0.0004, selectedEvent.coordinates[1] + 0.0006],
      timestamp: 'Just now',
      type: 'MEDICAL_EMERGENCY',
      status: 'DISPATCHING',
      assignedResponders: ['Ambulance Unit 02', 'St. John First Aid Team'],
    };
    setSosAlerts([medSos, ...sosAlerts]);

    const medNotif: NotificationItem = {
      id: `notif-med-${Date.now()}`,
      title: '🚑 MEDICAL FIRST RESPONDER DISPATCHED',
      message: 'Paramedic team dispatched to Central Plaza for crush triage. Keep the green corridor clear.',
      level: 'HIGH',
      timestamp: 'Just now',
      read: false,
    };
    setNotifications([medNotif, ...notifications]);
  };

  // Simulation Scenario: Weather Alert
  const handleTriggerWeatherAlert = () => {
    const rainNotif: NotificationItem = {
      id: `notif-rain-${Date.now()}`,
      title: '🌧️ HEAVY FLASH RAIN EVACUATION DRILL',
      message: 'Slippery corridor warning near North Staircase. Proceed to covered Pavilion shelters A & B.',
      level: 'HIGH',
      timestamp: 'Just now',
      read: false,
      actionRecommended: 'Walk slowly, maintain arm-distance spacing, avoid marble stairs.',
    };
    setNotifications([rainNotif, ...notifications]);
  };

  // Reset Simulation State
  const handleResetSimulation = () => {
    setZones(MOCK_ZONES);
    setSosAlerts(MOCK_SOS_ALERTS);
    setIncidents(MOCK_INCIDENTS);
    setNotifications(MOCK_NOTIFICATIONS);
    setActiveSafeRoute(MOCK_SAFE_ROUTE);
    cacheSafetyPack(selectedEvent, MOCK_ZONES, currentUser.coordinates);
  };

  return (
    <ThemeProvider>
      <DeviceProvider>
        <OSWrapper>
          {/* Header Bar */}
          <Header
            viewMode={viewMode}
            onToggleViewMode={(mode) => setViewMode(mode)}
            selectedEvent={selectedEvent}
            events={events}
            onSelectEvent={(evt) => {
              setSelectedEvent(evt);
              cacheSafetyPack(evt, zones, currentUser.coordinates);
            }}
            activeSosCount={sosAlerts.filter((s) => s.status !== 'RESOLVED').length}
            onOpenBroadcast={() => setIsBroadcastOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenOfflineVault={() => setIsOfflineVaultOpen(true)}
            onOpenDemoControl={() => setIsDemoControlOpen(true)}
          />

          {/* View Mode Render */}
          <main className="flex-1">
            {viewMode === 'CITIZEN' ? (
              <CitizenAppContainer
                user={currentUser}
                selectedEvent={selectedEvent}
                zones={zones}
                notifications={notifications}
                safeRoute={activeSafeRoute}
                onTriggerSOS={handleTriggerSOS}
                onSubmitIncident={handleSubmitIncident}
                onOpenBroadcast={() => setIsBroadcastOpen(true)}
                onOpenOfflineVault={() => setIsOfflineVaultOpen(true)}
                onOpenDemoControl={() => setIsDemoControlOpen(true)}
                onUpdateUser={(updated) => setCurrentUser(updated)}
                exactDeviceState={exactDeviceState}
                onRefreshGPS={() => syncExactDeviceLocation(true)}
                isRefreshingGPS={isRefreshingGPS}
              />
            ) : (
              <AdminDashboardContainer
                events={events}
                selectedEvent={selectedEvent}
                zones={zones}
                cameras={MOCK_CCTV}
                sosAlerts={sosAlerts}
                incidents={incidents}
                volunteers={MOCK_VOLUNTEERS}
                notifications={notifications}
                onToggleGateStatus={handleToggleGateStatus}
                onDispatchPushNotification={handleDispatchPushNotification}
                onUpdateEvent={(updated) => {
                  setSelectedEvent(updated);
                  setEvents(events.map((e) => (e.id === updated.id ? updated : e)));
                }}
                onCreateEvent={(newEvent) => {
                  setEvents([...events, newEvent]);
                  setSelectedEvent(newEvent);
                }}
                onOpenBroadcast={() => setIsBroadcastOpen(true)}
                onOpenOfflineVault={() => setIsOfflineVaultOpen(true)}
                onOpenDemoControl={() => setIsDemoControlOpen(true)}
              />
            )}
          </main>

          {/* Offline Disaster Safety Vault Modal */}
          <OfflineVaultModal
            isOpen={isOfflineVaultOpen}
            onClose={() => setIsOfflineVaultOpen(false)}
            event={selectedEvent}
            zones={zones}
            userCoords={currentUser.coordinates}
            onSelectRoute={(rt) => setActiveSafeRoute(rt)}
          />

          {/* Interactive Demo & OS Mode Controller */}
          <DemoControlCenter
            isOpen={isDemoControlOpen}
            onClose={() => setIsDemoControlOpen(false)}
            onTriggerStampedeSurge={handleTriggerStampedeSurge}
            onResetSimulation={handleResetSimulation}
            onTriggerMedicalCrisis={handleTriggerMedicalCrisis}
            onTriggerWeatherAlert={handleTriggerWeatherAlert}
            viewMode={viewMode}
            onToggleViewMode={(mode) => setViewMode(mode)}
            onOpenOfflineVault={() => {
              setIsDemoControlOpen(false);
              setIsOfflineVaultOpen(true);
            }}
          />

          {/* Multilingual PA Audio Broadcast Modal */}
          <AudioPlayerModal
            isOpen={isBroadcastOpen}
            onClose={() => setIsBroadcastOpen(false)}
            defaultMessage="ATTENTION ATTENTION: East Gate Passage is heavily crowded. Please proceed towards Emergency Gate 4 on the West side."
          />

          {/* System Settings & UI Theme Modal */}
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        </OSWrapper>
      </DeviceProvider>
    </ThemeProvider>
  );
}
