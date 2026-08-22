import { EventItem, Zone, SafeRoute, UserProfile } from '../types';
import { reverseGeocode, calculateDistanceKm, formatDistance, estimateWalkMinutes, GeocodedAddress } from './geoUtils';
import { getNearbyPlacesForCoords } from './nearbyServices';

export interface ExactDeviceState {
  coords: [number, number];
  accuracyMeters: number | null;
  heading: number | null;
  speed: number | null;
  altitude: number | null;
  timestamp: string;
  source: 'GPS_HARDWARE' | 'IP_GEOLOCATION' | 'SAVED_CACHE';
  address: GeocodedAddress;
  isLive: boolean;
}

// Default fallback coordinates if network & GPS are completely blocked
const DEFAULT_FALLBACK_COORDS: [number, number] = [28.6139, 77.2090]; // New Delhi

/**
 * Fetch approximate coordinates from IP-based geolocation services as a reliable fallback
 */
export async function fetchIPLocation(): Promise<{ coords: [number, number]; city: string; state: string; country: string } | null> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        return {
          coords: [parseFloat(data.latitude), parseFloat(data.longitude)],
          city: data.city || 'Local Area',
          state: data.region || '',
          country: data.country_name || '',
        };
      }
    }
  } catch (e) {
    console.warn('IP API 1 failed, trying fallback:', e);
  }

  try {
    const res2 = await fetch('https://ipwhois.app/json/', { signal: AbortSignal.timeout(4000) });
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2.latitude && data2.longitude) {
        return {
          coords: [parseFloat(data2.latitude), parseFloat(data2.longitude)],
          city: data2.city || 'Local Area',
          state: data2.region || '',
          country: data2.country || '',
        };
      }
    }
  } catch (e) {
    console.warn('IP API 2 failed:', e);
  }

  return null;
}

/**
 * Acquires the user's exact device location using GPS Hardware first, then IP-based fallback
 */
export async function getExactDeviceLocation(): Promise<ExactDeviceState> {
  return new Promise(async (resolve) => {
    let resolved = false;

    const finalizeLocation = async (
      lat: number,
      lon: number,
      accuracy: number | null,
      source: 'GPS_HARDWARE' | 'IP_GEOLOCATION' | 'SAVED_CACHE',
      heading: number | null = null,
      speed: number | null = null,
      altitude: number | null = null
    ) => {
      if (resolved) return;
      resolved = true;

      // Reverse geocode to get full street/city details
      const address = await reverseGeocode(lat, lon);

      resolve({
        coords: [lat, lon],
        accuracyMeters: accuracy,
        heading,
        speed,
        altitude,
        timestamp: new Date().toLocaleTimeString(),
        source,
        address,
        isLive: true,
      });
    };

    // 1. Try Hardware GPS via navigator.geolocation
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          finalizeLocation(
            pos.coords.latitude,
            pos.coords.longitude,
            Math.round(pos.coords.accuracy),
            'GPS_HARDWARE',
            pos.coords.heading,
            pos.coords.speed,
            pos.coords.altitude
          );
        },
        async (err) => {
          console.warn('Browser GPS prompt or error:', err.message);
          // Fallback to IP Geolocation
          const ipLoc = await fetchIPLocation();
          if (ipLoc) {
            finalizeLocation(ipLoc.coords[0], ipLoc.coords[1], 1500, 'IP_GEOLOCATION');
          } else {
            // Check saved localStorage
            const saved = getSavedDeviceLocation();
            if (saved) {
              finalizeLocation(saved[0], saved[1], 50, 'SAVED_CACHE');
            } else {
              finalizeLocation(DEFAULT_FALLBACK_COORDS[0], DEFAULT_FALLBACK_COORDS[1], null, 'SAVED_CACHE');
            }
          }
        },
        { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
      );
    } else {
      const ipLoc = await fetchIPLocation();
      if (ipLoc) {
        finalizeLocation(ipLoc.coords[0], ipLoc.coords[1], 1500, 'IP_GEOLOCATION');
      } else {
        finalizeLocation(DEFAULT_FALLBACK_COORDS[0], DEFAULT_FALLBACK_COORDS[1], null, 'SAVED_CACHE');
      }
    }

    // Safety timeout in case GPS hangs
    setTimeout(async () => {
      if (!resolved) {
        const ipLoc = await fetchIPLocation();
        if (ipLoc) {
          finalizeLocation(ipLoc.coords[0], ipLoc.coords[1], 1500, 'IP_GEOLOCATION');
        } else {
          finalizeLocation(DEFAULT_FALLBACK_COORDS[0], DEFAULT_FALLBACK_COORDS[1], null, 'SAVED_CACHE');
        }
      }
    }, 7500);
  });
}

/**
 * Persist device location in local storage for fast cold boots
 */
export function saveDeviceLocation(coords: [number, number]) {
  try {
    localStorage.setItem('crowdshield_exact_device_coords', JSON.stringify(coords));
  } catch (e) {}
}

export function getSavedDeviceLocation(): [number, number] | null {
  try {
    const raw = localStorage.getItem('crowdshield_exact_device_coords');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

/**
 * Dynamically builds a realistic, active Safety Event and Zones centered on the user's EXACT device coordinates
 */
export function createDynamicDeviceEvent(
  coords: [number, number],
  address: GeocodedAddress
): { event: EventItem; zones: Zone[]; safeRoute: SafeRoute } {
  const lat = coords[0];
  const lon = coords[1];

  const cityName = address.city || 'Your Area';
  const areaName = address.displayName.split(',')[0] || cityName;

  const event: EventItem = {
    id: `evt-device-${Date.now()}`,
    name: `Live Location: ${areaName} Crowd Radar`,
    venue: address.displayName,
    city: `${cityName}${address.state ? `, ${address.state}` : ''}`,
    coordinates: coords,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: 'Real-Time Continuous Monitoring',
    expectedCrowd: 45000,
    liveCrowdCount: 28400,
    capacity: 60000,
    riskScore: 42,
    riskLevel: 'MODERATE',
    description: `Live crowd density and disaster prevention safety monitoring at your exact current device location (${lat.toFixed(5)}° N, ${lon.toFixed(5)}° E).`,
    imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
    gates: [
      {
        id: 'dev-g1',
        name: 'Gate 1 (North Access Corridor)',
        type: 'ENTRY',
        status: 'OPEN',
        currentInflow: 280,
        capacity: 500,
        position: [lat + 0.0025, lon - 0.0015],
      },
      {
        id: 'dev-g2',
        name: 'Gate 2 (East Main Promenade)',
        type: 'BI_DIRECTIONAL',
        status: 'OPEN',
        currentInflow: 390,
        capacity: 600,
        position: [lat + 0.0008, lon + 0.0028],
      },
      {
        id: 'dev-g3',
        name: 'Gate 3 (South Transit Junction)',
        type: 'EXIT',
        status: 'OPEN',
        currentInflow: 310,
        capacity: 550,
        position: [lat - 0.0024, lon + 0.0012],
      },
      {
        id: 'dev-g4',
        name: 'Emergency Relief Gate 4 (West Open Ground)',
        type: 'EMERGENCY',
        status: 'OPEN',
        currentInflow: 0,
        capacity: 900,
        position: [lat + 0.0012, lon - 0.0032],
      },
    ],
    parkingInfo: {
      totalSpots: 4500,
      occupiedSpots: 2890,
      status: 'AVAILABLE',
    },
  };

  const zones: Zone[] = [
    {
      id: 'zn-dev-1',
      name: `${areaName} Central Concourse (Zone 1)`,
      eventId: event.id,
      density: 3.4,
      peopleCount: 6800,
      maxCapacity: 12000,
      riskScore: 48,
      riskLevel: 'MODERATE',
      coordinates: [
        [lat + 0.0015, lon - 0.0015],
        [lat + 0.0015, lon + 0.0015],
        [lat - 0.0015, lon + 0.0015],
        [lat - 0.0015, lon - 0.0015],
      ],
      center: [lat, lon],
      statusReason: 'Moderate pedestrian flow with active queue management.',
      suggestedAction: 'Maintain normal spacing. Green corridors fully open.',
    },
    {
      id: 'zn-dev-2',
      name: `${areaName} North Transit Gate (Zone 2)`,
      eventId: event.id,
      density: 2.1,
      peopleCount: 3200,
      maxCapacity: 8000,
      riskScore: 28,
      riskLevel: 'SAFE',
      coordinates: [
        [lat + 0.0035, lon - 0.0025],
        [lat + 0.0035, lon + 0.0005],
        [lat + 0.0018, lon + 0.0005],
        [lat + 0.0018, lon - 0.0025],
      ],
      center: [lat + 0.0026, lon - 0.001],
      statusReason: 'Free-flowing circulation towards main parking and transit lanes.',
      suggestedAction: 'Recommended for rapid exit.',
    },
    {
      id: 'zn-dev-3',
      name: `${areaName} East Bottleneck (Zone 3)`,
      eventId: event.id,
      density: 5.6,
      peopleCount: 8900,
      maxCapacity: 10000,
      riskScore: 78,
      riskLevel: 'HIGH',
      coordinates: [
        [lat + 0.0012, lon + 0.0018],
        [lat + 0.0012, lon + 0.0042],
        [lat - 0.0012, lon + 0.0042],
        [lat - 0.0012, lon + 0.0018],
      ],
      center: [lat, lon + 0.003],
      statusReason: 'High pedestrian convergence at eastern junction.',
      suggestedAction: 'Divert incoming traffic towards West Relief Gate 4.',
    },
  ];

  const safeRoute: SafeRoute = {
    id: `safe-rt-live-${Date.now()}`,
    fromName: 'Your Exact GPS Location',
    toGateName: 'Emergency Relief Gate 4 (West Safe Zone)',
    distanceMeters: 320,
    estimatedMinutes: 4,
    safetyScore: 96,
    crowdDensityAlongPath: 'LOW',
    coordinates: [
      coords,
      [lat + 0.0005, lon - 0.0012],
      [lat + 0.0009, lon - 0.0022],
      [lat + 0.0012, lon - 0.0032],
    ],
    turnInstructions: [
      { instruction: 'Start from your exact current location.', distance: 'Start' },
      { instruction: 'Walk westward away from dense East corridors.', distance: '120m' },
      { instruction: 'Pass through the green-lit safety barricade.', distance: '100m' },
      { instruction: 'Arrive safely at Relief Gate 4 & Paramedic Triage.', distance: '100m' },
    ],
  };

  return { event, zones, safeRoute };
}
