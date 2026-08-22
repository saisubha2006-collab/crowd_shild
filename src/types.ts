export type RiskLevel = 'SAFE' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface Gate {
  id: string;
  name: string;
  type: 'ENTRY' | 'EXIT' | 'EMERGENCY' | 'BI_DIRECTIONAL';
  status: 'OPEN' | 'RESTRICTED' | 'CLOSED';
  currentInflow: number; // people per min
  capacity: number; // max people per min
  position: [number, number]; // lat, lng
}

export interface EventItem {
  id: string;
  name: string;
  venue: string;
  city: string;
  coordinates: [number, number];
  date: string;
  time: string;
  expectedCrowd: number;
  liveCrowdCount: number;
  capacity: number;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  gates: Gate[];
  parkingInfo: {
    totalSpots: number;
    occupiedSpots: number;
    status: 'AVAILABLE' | 'FILLING_FAST' | 'FULL';
  };
  description: string;
  imageUrl: string;
}

export interface Zone {
  id: string;
  name: string;
  eventId: string;
  density: number; // people / m^2
  peopleCount: number;
  maxCapacity: number;
  riskScore: number;
  riskLevel: RiskLevel;
  coordinates: [number, number][]; // Polygon points for heatmap overlay
  center: [number, number];
  statusReason: string;
  suggestedAction: string;
}

export interface BoundingBox {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  w: number;
  h: number;
  label: string; // 'Person', 'Luggage', 'Stroller', 'Obstacle'
  confidence: number;
}

export interface CCTVCamera {
  id: string;
  name: string;
  location: string;
  zoneId: string;
  status: 'ONLINE' | 'WARNING' | 'CRITICAL_ALERT' | 'OFFLINE';
  liveCount: number;
  density: number; // per sq meter
  flowDirection: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'CONVERGING' | 'TURBULENT';
  flowSpeedMps: number;
  streamPoster: string;
  boundingBoxes: BoundingBox[];
}

export interface SOSAlert {
  id: string;
  userName: string;
  userPhone: string;
  eventId: string;
  eventName: string;
  zoneName: string;
  coordinates: [number, number];
  timestamp: string;
  type: 'STAMPEDE_RISK' | 'OVERCROWDING' | 'MEDICAL_EMERGENCY' | 'GATE_BLOCKED' | 'LOST_CHILD';
  status: 'DISPATCHING' | 'RESPONDERS_EN_ROUTE' | 'ON_SCENE' | 'RESOLVED';
  assignedResponders: string[];
}

export interface IncidentReport {
  id: string;
  reporterName: string;
  phone?: string;
  eventName: string;
  location: string;
  coordinates: [number, number];
  description: string;
  photoUrl?: string;
  audioUrl?: string;
  timestamp: string;
  status: 'UNDER_REVIEW' | 'AI_VERIFIED' | 'DISPATCHED' | 'RESOLVED';
  aiSeverity: RiskLevel;
  aiRiskScore: number;
  aiSummary?: string;
  aiActions?: string[];
}

export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  zoneId: string;
  zoneName: string;
  assignedGate?: string;
  status: 'ACTIVE' | 'ON_CALL' | 'RESPONDING' | 'OFFLINE';
  coordinates: [number, number];
  avatar: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  level: RiskLevel | 'INFO';
  timestamp: string;
  read: boolean;
  targetZone?: string;
  actionRecommended?: string;
}

export interface SafeRoute {
  id: string;
  fromName: string;
  toGateName: string;
  distanceMeters: number;
  estimatedMinutes: number;
  safetyScore: number; // 0 - 100
  crowdDensityAlongPath: 'LOW' | 'MODERATE' | 'HIGH';
  coordinates: [number, number][];
  turnInstructions: {
    instruction: string;
    distance: string;
    riskNote?: string;
  }[];
}

export interface AIDetectedHazard {
  id: string;
  label: string;
  category:
    | 'CROWD_SURGE'
    | 'EXIT_BLOCKAGE'
    | 'FIRE_SMOKE'
    | 'SUSPICIOUS_OBJECT'
    | 'BARRICADE_BREACH'
    | 'FALLEN_PERSON'
    | 'SAFE_CORRIDOR';
  confidence: number; // 0 - 100%
  riskLevel: RiskLevel;
  timestamp: string;
  coordinates: [number, number];
  locationName: string;
  description: string;
  snapshotUrl?: string;
  detectedCount?: number;
  bbox?: { x: number; y: number; w: number; h: number };
}

export interface ProximityDevice {
  id: string;
  distanceMeters: number;
  headingAngle: number; // degrees 0-360
  signalStrengthDbm: number;
  type: 'SMARTPHONE' | 'BEACON' | 'SMARTWATCH' | 'RFID_BAND';
  relativeSpeedMps: number;
  detectedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  isLoggedIn: boolean;
  isGuest: boolean;
  currentLocationName: string;
  coordinates: [number, number];
}
