// Geolocation & Distance utilities

/**
 * Calculates Haversine distance between two coordinates in kilometers
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats distance in meters or kilometers nicely
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(2)} km`;
}

/**
 * Estimate walking time in minutes based on distance and crowd factor
 */
export function estimateWalkMinutes(distanceKm: number, crowdDensityPpm2: number = 3): number {
  // Base speed ~4.5 km/h -> 75 meters per min
  // Dense crowd slows speed down
  let speedKmH = 4.5;
  if (crowdDensityPpm2 > 5) speedKmH = 2.0;
  else if (crowdDensityPpm2 > 3) speedKmH = 3.2;

  const minutes = (distanceKm / speedKmH) * 60;
  return Math.max(1, Math.round(minutes));
}

/**
 * Generate intermediate route interpolation points between A and B
 */
export function generateRoutePoints(
  start: [number, number],
  end: [number, number],
  segments: number = 10
): [number, number][] {
  const points: [number, number][] = [start];
  
  // Add subtle curved realistic path points
  for (let i = 1; i < segments; i++) {
    const fraction = i / segments;
    // Add slight zig-zag curve offset for realistic map path
    const offsetLat = Math.sin(fraction * Math.PI) * 0.0003 * (i % 2 === 0 ? 1 : -1);
    const offsetLng = Math.cos(fraction * Math.PI) * 0.0003 * (i % 2 === 0 ? -1 : 1);
    
    const lat = start[0] + (end[0] - start[0]) * fraction + offsetLat;
    const lng = start[1] + (end[1] - start[1]) * fraction + offsetLng;
    points.push([lat, lng]);
  }
  
  points.push(end);
  return points;
}

export interface GeocodedAddress {
  displayName: string;
  city?: string;
  state?: string;
  country?: string;
  lat: number;
  lon: number;
}

/**
 * Reverse geocode coordinates to get actual Street, City, State and Country using OpenStreetMap Nominatim
 */
export async function reverseGeocode(lat: number, lon: number): Promise<GeocodedAddress> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`);
    if (!res.ok) throw new Error('Geocoding failed');
    const data = await res.json();
    const address = data.address || {};
    const city = address.city || address.town || address.village || address.suburb || address.county || 'Local Area';
    const state = address.state || '';
    const country = address.country || '';
    
    return {
      displayName: data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      city,
      state,
      country,
      lat,
      lon,
    };
  } catch (err) {
    return {
      displayName: `GPS: ${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E`,
      city: 'Local Area',
      country: '',
      lat,
      lon,
    };
  }
}

/**
 * Local Event & Landmark Presets for instant search matching
 */
const PRESET_LANDMARKS: GeocodedAddress[] = [
  {
    displayName: 'Emergency Relief Gate 4 (West Exit)',
    city: 'Prayagraj / Event Ground',
    state: 'Uttar Pradesh',
    country: 'India',
    lat: 25.4390,
    lon: 81.8435,
  },
  {
    displayName: 'Gate 1 North Main Entrance',
    city: 'Prayagraj / Event Ground',
    state: 'Uttar Pradesh',
    country: 'India',
    lat: 25.4385,
    lon: 81.8462,
  },
  {
    displayName: 'Gate 2 East Choke Passage',
    city: 'Prayagraj / Event Ground',
    state: 'Uttar Pradesh',
    country: 'India',
    lat: 25.4365,
    lon: 81.8495,
  },
  {
    displayName: 'Gate 3 Sangam Bathing Ghat Exit',
    city: 'Prayagraj / Event Ground',
    state: 'Uttar Pradesh',
    country: 'India',
    lat: 25.4348,
    lon: 81.8450,
  },
  {
    displayName: 'Medical & First Aid Camp 2',
    city: 'Prayagraj / Event Ground',
    state: 'Uttar Pradesh',
    country: 'India',
    lat: 25.4360,
    lon: 81.8445,
  },
  {
    displayName: 'East Pavilion Food Court & Refreshment',
    city: 'Prayagraj / Event Ground',
    state: 'Uttar Pradesh',
    country: 'India',
    lat: 25.4372,
    lon: 81.8490,
  },
  {
    displayName: 'Central Police Command & Lost Child Booth',
    city: 'Prayagraj / Event Ground',
    state: 'Uttar Pradesh',
    country: 'India',
    lat: 25.4368,
    lon: 81.8475,
  },
  {
    displayName: 'Main Bus Shuttle Stand & Parking Area A',
    city: 'Prayagraj / Event Ground',
    state: 'Uttar Pradesh',
    country: 'India',
    lat: 25.4410,
    lon: 81.8420,
  },
  {
    displayName: 'Prayagraj Junction Railway Station',
    city: 'Prayagraj',
    state: 'Uttar Pradesh',
    country: 'India',
    lat: 25.4484,
    lon: 81.8290,
  },
  {
    displayName: 'Prayagraj Civil Aerodrome Airport',
    city: 'Prayagraj',
    state: 'Uttar Pradesh',
    country: 'India',
    lat: 25.4401,
    lon: 81.7337,
  }
];

/**
 * High-Speed Multi-Provider Location Search
 * Uses Photon Komoot API + OpenStreetMap Nominatim + Local Preset Event Index
 */
export async function searchLocations(query: string): Promise<GeocodedAddress[]> {
  if (!query || query.trim().length < 1) return [];
  const cleanQuery = query.trim().toLowerCase();

  // 1. Check local preset matches first
  const presetMatches = PRESET_LANDMARKS.filter((item) =>
    item.displayName.toLowerCase().includes(cleanQuery) ||
    (item.city && item.city.toLowerCase().includes(cleanQuery))
  );

  const results: GeocodedAddress[] = [...presetMatches];

  // 2. Fetch from Photon Komoot API (Fastest global OSM search with CORS support)
  try {
    const photonRes = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8`
    );
    if (photonRes.ok) {
      const data = await photonRes.json();
      if (data && data.features && Array.isArray(data.features)) {
        data.features.forEach((feat: any) => {
          const props = feat.properties || {};
          const coords = feat.geometry?.coordinates || [];
          if (coords.length >= 2) {
            const nameParts = [props.name, props.street, props.district, props.city, props.state, props.country].filter(Boolean);
            const displayName = nameParts.length > 0 ? nameParts.join(', ') : 'Location Point';
            
            // Prevent duplicate entries
            const isDuplicate = results.some(
              (r) => Math.abs(r.lat - coords[1]) < 0.001 && Math.abs(r.lon - coords[0]) < 0.001
            );
            if (!isDuplicate) {
              results.push({
                displayName,
                city: props.city || props.town || props.district || props.country,
                state: props.state,
                country: props.country,
                lat: coords[1],
                lon: coords[0],
              });
            }
          }
        });
      }
    }
  } catch (err) {
    console.warn('Photon search error:', err);
  }

  // 3. Fallback to OpenStreetMap Nominatim if results are still sparse
  if (results.length < 3) {
    try {
      const nomRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1`
      );
      if (nomRes.ok) {
        const nomData = await nomRes.json();
        if (Array.isArray(nomData)) {
          nomData.forEach((item: any) => {
            const lat = parseFloat(item.lat);
            const lon = parseFloat(item.lon);
            const isDuplicate = results.some(
              (r) => Math.abs(r.lat - lat) < 0.001 && Math.abs(r.lon - lon) < 0.001
            );
            if (!isDuplicate && !isNaN(lat) && !isNaN(lon)) {
              results.push({
                displayName: item.display_name,
                city: item.address?.city || item.address?.town || item.address?.village || item.address?.suburb,
                state: item.address?.state,
                country: item.address?.country,
                lat,
                lon,
              });
            }
          });
        }
      }
    } catch (err) {
      console.warn('Nominatim search error:', err);
    }
  }

  return results.slice(0, 8);
}

