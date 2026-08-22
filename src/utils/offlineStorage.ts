// CrowdShield Offline Storage & Stampede Disaster Vault Engine
import { SafeRoute, SOSAlert, IncidentReport, EventItem, Zone } from '../types';
import { NearbyPlace, getNearbyPlacesForCoords } from './nearbyServices';

export interface EmergencyContact {
  id: string;
  name: string;
  category: 'NATIONAL' | 'DISASTER_FORCE' | 'MEDICAL' | 'POLICE' | 'FIRE' | 'EVENT_COMMAND' | 'FAMILY';
  number: string;
  role: string;
  available24x7: boolean;
  priority: number;
}

export interface OfflineSafetyPack {
  version: string;
  cachedAt: string;
  eventId: string;
  eventName: string;
  safeRoutes: SafeRoute[];
  emergencyContacts: EmergencyContact[];
  nearbyFacilities: NearbyPlace[];
  zones: Zone[];
  offlineInstructionGuides: {
    id: string;
    title: string;
    description: string;
    doList: string[];
    dontList: string[];
  }[];
  offlineSmsTemplates: {
    title: string;
    format: string;
    recipient: string;
  }[];
}

export interface QueuedOfflineSOS {
  id: string;
  timestamp: string;
  type: SOSAlert['type'];
  coords: [number, number];
  zoneName: string;
  userName: string;
  phone: string;
  batteryLevel?: number;
  smsBody: string;
  synced: boolean;
}

const STORAGE_KEYS = {
  SAFETY_PACK: 'crowdshield_offline_safety_pack_v2',
  QUEUED_SOS: 'crowdshield_queued_sos_alerts',
  CACHED_INCIDENTS: 'crowdshield_cached_incidents',
  SIMULATED_OFFLINE: 'crowdshield_simulated_offline',
  CACHE_META: 'crowdshield_cache_metadata',
};

export const DEFAULT_EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'cont-1',
    name: 'National Unified Emergency Helpline',
    category: 'NATIONAL',
    number: '112',
    role: 'All-in-One Police, Fire, Ambulance & Disaster Response',
    available24x7: true,
    priority: 1,
  },
  {
    id: 'cont-2',
    name: 'NDRF Disaster Management Helpline',
    category: 'DISASTER_FORCE',
    number: '1077',
    role: 'National Disaster Response Force (Stampede & Crush Relief)',
    available24x7: true,
    priority: 2,
  },
  {
    id: 'cont-3',
    name: 'Emergency Medical Trauma & Ambulance',
    category: 'MEDICAL',
    number: '108',
    role: 'Immediate Oxygen, Resuscitation & Critical Transport',
    available24x7: true,
    priority: 3,
  },
  {
    id: 'cont-4',
    name: 'Police Control Room (PCR Special Wing)',
    category: 'POLICE',
    number: '100',
    role: 'Rapid Anti-Crowd Deployment & Perimeter Security',
    available24x7: true,
    priority: 4,
  },
  {
    id: 'cont-5',
    name: 'Fire, Rescue & Hydraulic Cutting Services',
    category: 'FIRE',
    number: '101',
    role: 'Barricade Breaching & Emergency Zone Extraction',
    available24x7: true,
    priority: 5,
  },
  {
    id: 'cont-6',
    name: 'CrowdShield Unified Event Command Center',
    category: 'EVENT_COMMAND',
    number: '+91 9876543210',
    role: 'Direct Incident Commander & Sector Dispatchers',
    available24x7: true,
    priority: 6,
  },
  {
    id: 'cont-7',
    name: 'Hospital Emergency Triage Desk',
    category: 'MEDICAL',
    number: '+91 9988776655',
    role: 'Civil Hospital Emergency Ward & Blood Bank',
    available24x7: true,
    priority: 7,
  },
];

export const STAMPEDE_SAFETY_GUIDES = [
  {
    id: 'guide-1',
    title: 'Surviving Sudden Crowd Crush & Density Spikes',
    description: 'Vital physical techniques to maintain air supply and stay upright during heavy crowd compression (>6 people/m²).',
    doList: [
      'Assume the Boxer Stance: One foot forward, one foot back, knees slightly bent for balance.',
      'Protect Your Ribcage: Hold arms bent across your chest like a boxer to preserve lung expansion space.',
      'Move WITH the Flow: Never push against the crowd wave. Drift diagonally toward the edges or relief gates.',
      'Keep Eyes Open & Calm: Breathe slowly to conserve oxygen and scan for safe sturdy structures.',
    ],
    dontList: [
      'NEVER bend down to pick up dropped items (phone, bags, shoes).',
      'Do NOT scream constantly unless shouting for direct life assistance; conserve your oxygen.',
      'Avoid pressing flat against walls, barricades, or glass partitions.',
      'Never resist a crowd surge directly head-on.',
    ],
  },
  {
    id: 'guide-2',
    title: 'What To Do If You Fall in a Stampede',
    description: 'Immediate protective curl posture if knocked to the ground in a dense crowd.',
    doList: [
      'Curl into a tight Fetal Position on your left side to protect your heart, lungs, and vital organs.',
      'Cover your head, neck, and ears firmly with both hands.',
      'Attempt to grab onto solid pillars, railings, or get help from bystanders to stand back up instantly.',
      'Tuck in knees and elbows tightly to minimize exposed surface area.',
    ],
    dontList: [
      'Do NOT lie flat on your back or stomach.',
      'Do not flail limbs wildly, which increases risk of being stepped on.',
    ],
  },
];

/**
 * Initializes and persists the comprehensive Offline Safety Pack into local storage and cache
 */
export function cacheSafetyPack(
  event: EventItem,
  zones: Zone[],
  userCoords: [number, number]
): OfflineSafetyPack {
  const allFacilities = getNearbyPlacesForCoords(userCoords[0], userCoords[1], 'ALL');

  const defaultRoutes: SafeRoute[] = [
    {
      id: 'offline-safe-rt-1',
      fromName: 'East Gate Corridor',
      toGateName: 'West Relief Gate 4',
      distanceMeters: 280,
      estimatedMinutes: 4,
      safetyScore: 95,
      crowdDensityAlongPath: 'LOW',
      coordinates: [
        userCoords,
        [userCoords[0] + 0.0008, userCoords[1] - 0.0006],
        [userCoords[0] + 0.0016, userCoords[1] - 0.0012],
        [userCoords[0] + 0.0022, userCoords[1] - 0.0018],
      ],
      turnInstructions: [
        { instruction: 'Exit East Gate bottleneck area immediately.', distance: '50m' },
        { instruction: 'Follow green-lit perimeter corridor westward toward Gate 4.', distance: '120m' },
        { instruction: 'Bypass Main Plaza (High Congestion Zone).', distance: '60m' },
        { instruction: 'Arrive safely at Medical Camp & West Relief Gate 4.', distance: '50m' },
      ],
    },
    {
      id: 'offline-safe-rt-2',
      fromName: 'North-East Service Gate',
      toGateName: 'Civil Hospital Triage Gate',
      distanceMeters: 450,
      estimatedMinutes: 7,
      safetyScore: 92,
      crowdDensityAlongPath: 'LOW',
      coordinates: [
        userCoords,
        [userCoords[0] + 0.0012, userCoords[1] + 0.0009],
        [userCoords[0] + 0.0024, userCoords[1] + 0.0018],
      ],
      turnInstructions: [
        { instruction: 'Move toward North-East Service Gate.', distance: '100m' },
        { instruction: 'Proceed along dedicated emergency ambulance lane.', distance: '250m' },
        { instruction: 'Direct connection to Main Trauma Center & 24/7 Pharmacy.', distance: '100m' },
      ],
    },
  ];

  const safetyPack: OfflineSafetyPack = {
    version: '2.1',
    cachedAt: new Date().toISOString(),
    eventId: event.id,
    eventName: event.name,
    safeRoutes: defaultRoutes,
    emergencyContacts: DEFAULT_EMERGENCY_CONTACTS,
    nearbyFacilities: allFacilities,
    zones,
    offlineInstructionGuides: STAMPEDE_SAFETY_GUIDES,
    offlineSmsTemplates: [
      {
        title: 'Emergency SOS Broadcast (No Internet Fallback)',
        format: 'EMERGENCY SOS! I need immediate help. Location: {LAT},{LNG} ({ZONE}) at {EVENT}. Battery: {BAT}%. Call me at {PHONE}.',
        recipient: '112',
      },
      {
        title: 'Medical Assistance SMS',
        format: 'MEDICAL EMERGENCY: Immediate paramedic/ambulance needed at {ZONE} ({LAT},{LNG}). Person injured/suffocating.',
        recipient: '108',
      },
    ],
  };

  try {
    localStorage.setItem(STORAGE_KEYS.SAFETY_PACK, JSON.stringify(safetyPack));
    localStorage.setItem(
      STORAGE_KEYS.CACHE_META,
      JSON.stringify({
        lastSync: new Date().toISOString(),
        itemsCount: allFacilities.length + defaultRoutes.length + DEFAULT_EMERGENCY_CONTACTS.length,
        sizeBytes: JSON.stringify(safetyPack).length,
      })
    );
  } catch (e) {
    console.warn('[OfflineStorage] LocalStorage quota warning:', e);
  }

  return safetyPack;
}

/**
 * Retrieves the cached Offline Safety Pack
 */
export function getCachedSafetyPack(): OfflineSafetyPack | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAFETY_PACK);
    if (!raw) return null;
    return JSON.parse(raw) as OfflineSafetyPack;
  } catch {
    return null;
  }
}

/**
 * Queue an SOS Alert locally when device has no network during crowd congestion / jamming
 */
export function queueOfflineSOS(alert: {
  type: SOSAlert['type'];
  coords: [number, number];
  zoneName: string;
  userName: string;
  phone: string;
  batteryLevel?: number;
}): QueuedOfflineSOS {
  const smsBody = `EMERGENCY SOS: User ${alert.userName} (${alert.phone}) needs immediate assistance at ${alert.zoneName}. GPS: ${alert.coords[0].toFixed(5)},${alert.coords[1].toFixed(5)}. Type: ${alert.type}. Battery: ${alert.batteryLevel || 85}%.`;

  const queuedItem: QueuedOfflineSOS = {
    id: `offline-sos-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: alert.type,
    coords: alert.coords,
    zoneName: alert.zoneName,
    userName: alert.userName,
    phone: alert.phone,
    batteryLevel: alert.batteryLevel,
    smsBody,
    synced: false,
  };

  try {
    const existingRaw = localStorage.getItem(STORAGE_KEYS.QUEUED_SOS);
    const list: QueuedOfflineSOS[] = existingRaw ? JSON.parse(existingRaw) : [];
    list.unshift(queuedItem);
    localStorage.setItem(STORAGE_KEYS.QUEUED_SOS, JSON.stringify(list));
  } catch (e) {
    console.error('Error queuing offline SOS:', e);
  }

  return queuedItem;
}

/**
 * Get all queued offline SOS alerts
 */
export function getQueuedOfflineSOSList(): QueuedOfflineSOS[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUEUED_SOS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Mark queued SOS items as synced once network is restored
 */
export function markQueuedSOSAsSynced(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUEUED_SOS);
    if (raw) {
      const list: QueuedOfflineSOS[] = JSON.parse(raw);
      const updated = list.map((item) => ({ ...item, synced: true }));
      localStorage.setItem(STORAGE_KEYS.QUEUED_SOS, JSON.stringify(updated));
    }
  } catch (e) {
    console.error('Error marking SOS as synced:', e);
  }
}

/**
 * Generates direct tel: or sms: URI for immediate zero-data communication
 */
export function generateOfflineSmsUri(recipient: string, message: string): string {
  const encoded = encodeURIComponent(message);
  // Universal SMS link format
  return `sms:${recipient}?body=${encoded}`;
}

/**
 * Manages simulated offline mode for live testing & presentations
 */
export function getSimulatedOffline(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.SIMULATED_OFFLINE) === 'true';
  } catch {
    return false;
  }
}

export function setSimulatedOffline(val: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SIMULATED_OFFLINE, val ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('crowdshield_connectivity_change', { detail: { isSimulatedOffline: val } }));
  } catch (e) {
    console.error('Error setting simulated offline:', e);
  }
}
