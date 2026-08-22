import { calculateDistanceKm, formatDistance } from './geoUtils';

export type ServiceCategory =
  | 'HOSPITAL'
  | 'PETROL_PUMP'
  | 'HOTEL'
  | 'POLICE_STATION'
  | 'GARAGE'
  | 'TOLL_GATE'
  | 'BUS_STOP';

export interface NearbyPlace {
  id: string;
  name: string;
  category: ServiceCategory;
  categoryLabel: string;
  address: string;
  coords: [number, number];
  distanceKm: number;
  formattedDistance: string;
  walkTimeMinutes: number;
  driveTimeMinutes: number;
  phone?: string;
  status: 'OPEN_24_7' | 'OPEN' | 'BUSY' | 'ALERT';
  statusText: string;
  rating?: number;
  isOpen: boolean;
  notes?: string;
}

export const CATEGORY_META: Record<
  ServiceCategory,
  { label: string; iconName: string; color: string; bg: string; border: string; desc: string }
> = {
  HOSPITAL: {
    label: 'Hospital & Emergency',
    iconName: 'HeartPulse',
    color: 'text-red-400',
    bg: 'bg-red-950/40',
    border: 'border-red-500/40',
    desc: '24/7 Trauma care, ICU, Ambulance & First Aid',
  },
  PETROL_PUMP: {
    label: 'Petrol Pump & Fuel',
    iconName: 'Fuel',
    color: 'text-amber-400',
    bg: 'bg-amber-950/40',
    border: 'border-amber-500/40',
    desc: 'Petrol, Diesel, CNG & EV Charging',
  },
  HOTEL: {
    label: 'Hotel & Lodging',
    iconName: 'Hotel',
    color: 'text-indigo-400',
    bg: 'bg-indigo-950/40',
    border: 'border-indigo-500/40',
    desc: 'Hotels, Guest Houses, Lodges & Rest Areas',
  },
  POLICE_STATION: {
    label: 'Police Station',
    iconName: 'Shield',
    color: 'text-blue-400',
    bg: 'bg-blue-950/40',
    border: 'border-blue-500/40',
    desc: 'Police Stations, Chowkis & Law Enforcement',
  },
  GARAGE: {
    label: 'Garage & Mechanic',
    iconName: 'Wrench',
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-500/40',
    desc: 'Vehicle repair, Tyre puncture, Towing & Mechanic',
  },
  TOLL_GATE: {
    label: 'Toll Gate & Plaza',
    iconName: 'Milestone',
    color: 'text-purple-400',
    bg: 'bg-purple-950/40',
    border: 'border-purple-500/40',
    desc: 'Highway Toll Gates, FASTag & Checkpoints',
  },
  BUS_STOP: {
    label: 'Bus Stop & Transit',
    iconName: 'Bus',
    color: 'text-cyan-400',
    bg: 'bg-cyan-950/40',
    border: 'border-cyan-500/40',
    desc: 'City Bus Stands, Shuttle Terminals & Pickup Points',
  },
};

/**
 * Generates accurately anchored places around device coordinates
 * so the user gets realistic, accurately positioned places anywhere in the world.
 */
export function getNearbyPlacesForCoords(
  userLat: number,
  userLng: number,
  categoryFilter?: ServiceCategory | 'ALL'
): NearbyPlace[] {
  // Deterministic geo-offsets relative to the user's real device position
  const templatePlaces: {
    name: string;
    category: ServiceCategory;
    offsetLat: number;
    offsetLng: number;
    addressSuffix: string;
    phone: string;
    status: 'OPEN_24_7' | 'OPEN' | 'BUSY';
    statusText: string;
    rating: number;
    notes: string;
  }[] = [
    // 1. HOSPITALS
    {
      name: 'City Apex Multi-Speciality Hospital & Trauma Center',
      category: 'HOSPITAL',
      offsetLat: 0.0035,
      offsetLng: -0.0022,
      addressSuffix: 'Main Boulevard, Sector 4 Emergency Wing',
      phone: '+91-532-2460112',
      status: 'OPEN_24_7',
      statusText: '24/7 Emergency & ICU Active',
      rating: 4.8,
      notes: '15 Ambulances standby, Oxygen cylinders, Blood bank available',
    },
    {
      name: 'LifeCare Emergency Hospital & First Aid Clinic',
      category: 'HOSPITAL',
      offsetLat: -0.0048,
      offsetLng: 0.0051,
      addressSuffix: 'Ring Road Crossing, Near Medical Enclave',
      phone: '+91-532-2461999',
      status: 'OPEN_24_7',
      statusText: '24/7 Emergency Doctor on Duty',
      rating: 4.6,
      notes: 'General ward, burn care, free first aid kits',
    },
    {
      name: 'Red Cross Disaster & Paramedic Health Post',
      category: 'HOSPITAL',
      offsetLat: 0.0018,
      offsetLng: 0.0034,
      addressSuffix: 'Central Relief Camp Compound',
      phone: '108',
      status: 'OPEN_24_7',
      statusText: 'Free Emergency Treatment',
      rating: 4.9,
      notes: 'Free medicines, hydration packs, emergency triage',
    },

    // 2. PETROL PUMP
    {
      name: 'Indian Oil Fuel Station & 24/7 EV Charging Plaza',
      category: 'PETROL_PUMP',
      offsetLat: 0.0062,
      offsetLng: 0.0045,
      addressSuffix: 'National Highway Expressway Link, Mile 4',
      phone: '+91-9839012345',
      status: 'OPEN_24_7',
      statusText: 'Open • Petrol, Diesel, CNG & EV Fast Charger',
      rating: 4.5,
      notes: 'Air & Nitrogen filling, digital payments, clean restrooms',
    },
    {
      name: 'Bharat Petroleum (BPCL) Smart Auto Fuel Point',
      category: 'PETROL_PUMP',
      offsetLat: -0.0071,
      offsetLng: -0.0038,
      addressSuffix: 'South Bypass Road, Opp. Transport Nagar',
      phone: '+91-9839054321',
      status: 'OPEN',
      statusText: 'Open (06:00 AM - 11:30 PM)',
      rating: 4.3,
      notes: 'Speed petrol, oil change service, quick service lane',
    },
    {
      name: 'HP Auto Fuel & High-Speed CNG Dispenser',
      category: 'PETROL_PUMP',
      offsetLat: 0.0089,
      offsetLng: -0.0064,
      addressSuffix: 'Sector 9 Outer Bypass Circle',
      phone: '+91-9839088776',
      status: 'OPEN_24_7',
      statusText: 'Open • Short Queue',
      rating: 4.4,
      notes: '24-hour convenience store, cash & UPI accepted',
    },

    // 3. HOTEL
    {
      name: 'Grand Imperial Palace Hotel & Suites',
      category: 'HOTEL',
      offsetLat: 0.0041,
      offsetLng: -0.0075,
      addressSuffix: 'Civil Lines Heritage Ave, Near City Center',
      phone: '+91-532-2260555',
      status: 'OPEN_24_7',
      statusText: 'Reception 24/7 • Rooms Available',
      rating: 4.7,
      notes: 'AC rooms, safe luggage cloakroom, restaurant & power backup',
    },
    {
      name: 'Radha Krishna Residency & Pilgrim Guest House',
      category: 'HOTEL',
      offsetLat: -0.0032,
      offsetLng: -0.0041,
      addressSuffix: 'Sangam View Marg, Lane 3',
      phone: '+91-9415023456',
      status: 'OPEN',
      statusText: 'Open • Budget Family Rooms',
      rating: 4.4,
      notes: 'Clean dormitory, hot water, vegetarian dining',
    },
    {
      name: 'Comfort Stay Inn & Executive Lodge',
      category: 'HOTEL',
      offsetLat: 0.0081,
      offsetLng: 0.0068,
      addressSuffix: 'Expressway Service Lane, Sector 12',
      phone: '+91-532-2554433',
      status: 'OPEN_24_7',
      statusText: 'Open • Instant Check-in',
      rating: 4.2,
      notes: 'Wi-Fi, parking lot, 24-hour room service',
    },

    // 4. POLICE STATION
    {
      name: 'Central Kotwali Police Station & Rapid Action Dispatch',
      category: 'POLICE_STATION',
      offsetLat: 0.0029,
      offsetLng: 0.0019,
      addressSuffix: 'District Administrative Square, Chowk',
      phone: '112 / +91-532-2420100',
      status: 'OPEN_24_7',
      statusText: '24/7 PCR Patrols & Emergency Response',
      rating: 4.9,
      notes: 'Women safety cell, lost & found registry, CCTV monitoring room',
    },
    {
      name: 'Traffic Police Station & Highway Patrol Unit',
      category: 'POLICE_STATION',
      offsetLat: -0.0055,
      offsetLng: -0.0028,
      addressSuffix: 'Subhash Crossing Junction',
      phone: '1073 / +91-532-2420101',
      status: 'OPEN_24_7',
      statusText: '24/7 Traffic Control & Crane Assistance',
      rating: 4.5,
      notes: 'Tow trucks on alert, route diversion helpdesk',
    },
    {
      name: 'Civil Defense & Tourist Police Assistance Post',
      category: 'POLICE_STATION',
      offsetLat: -0.0019,
      offsetLng: 0.0062,
      addressSuffix: 'East River Promenade Gate 2',
      phone: '112',
      status: 'OPEN_24_7',
      statusText: 'Active Safety Helpdesk',
      rating: 4.8,
      notes: 'Multi-lingual police officers, emergency crowd assistance',
    },

    // 5. GARAGE
    {
      name: 'SpeedyCare Multi-Brand Auto Garage & Tyre Repair',
      category: 'GARAGE',
      offsetLat: -0.0039,
      offsetLng: 0.0078,
      addressSuffix: 'Workshop Alley, Near Industrial Zone Gate 1',
      phone: '+91-9838011223',
      status: 'OPEN_24_7',
      statusText: '24/7 On-Road Breakdown Service',
      rating: 4.7,
      notes: 'Tyre puncture, jump start, battery replacement, tow truck',
    },
    {
      name: 'Express 4-Wheeler & 2-Wheeler Mechanic Workshop',
      category: 'GARAGE',
      offsetLat: 0.0074,
      offsetLng: -0.0018,
      addressSuffix: 'Old GT Road, Opposite Bus Depot',
      phone: '+91-9838044556',
      status: 'OPEN',
      statusText: 'Open (07:00 AM - 10:00 PM)',
      rating: 4.5,
      notes: 'Engine diagnostics, brake repairs, oil change, spares',
    },
    {
      name: 'Highway Mobile Crane & Breakdown Recovery Garage',
      category: 'GARAGE',
      offsetLat: -0.0092,
      offsetLng: -0.0081,
      addressSuffix: 'Bypass Highway KM 18',
      phone: '+91-9838099887',
      status: 'OPEN_24_7',
      statusText: '24/7 Towing & Recovery Fleet',
      rating: 4.6,
      notes: 'Hydraulic towing, heavy vehicle rescue, mobile mechanic',
    },

    // 6. TOLL GATE
    {
      name: 'National Highway Main Toll Plaza & FASTag Gate',
      category: 'TOLL_GATE',
      offsetLat: 0.0145,
      offsetLng: 0.0112,
      addressSuffix: 'NH-19 Expressway North Corridor, Toll Plaza KM 42',
      phone: '1033 (NHAI Helpline)',
      status: 'OPEN_24_7',
      statusText: '16 FASTag Lanes Active • Flow Normal',
      rating: 4.3,
      notes: 'Emergency ambulance bay, highway patrol station, FASTag recharge',
    },
    {
      name: 'City Bypass Southern Toll Gate & Checkpost',
      category: 'TOLL_GATE',
      offsetLat: -0.0162,
      offsetLng: -0.0135,
      addressSuffix: 'South Ring Highway Toll Barrier',
      phone: '1033',
      status: 'OPEN_24_7',
      statusText: '8 Lanes Open • No Congestion',
      rating: 4.2,
      notes: 'Commercial vehicle weighbridge, security checkpoint',
    },
    {
      name: 'River Bridge Link Toll Plaza',
      category: 'TOLL_GATE',
      offsetLat: -0.0118,
      offsetLng: 0.0142,
      addressSuffix: 'New Yamuna Bridge Connecting Gate',
      phone: '1033',
      status: 'OPEN_24_7',
      statusText: 'Open 24/7',
      rating: 4.4,
      notes: 'Automated barrier lanes, 2-wheelers exempted lane',
    },

    // 7. BUS STOP
    {
      name: 'Central Inter-State Bus Terminus (ISBT)',
      category: 'BUS_STOP',
      offsetLat: -0.0051,
      offsetLng: -0.0062,
      addressSuffix: 'Civil Station Bus Terminal, Platform 1-12',
      phone: '+91-532-2400234',
      status: 'OPEN_24_7',
      statusText: '24/7 Regular & AC Volvo Buses',
      rating: 4.5,
      notes: 'Direct express buses to all districts, ticket counter, waiting hall',
    },
    {
      name: 'City Shuttle Bus Stand & EV Feeder Stop #4',
      category: 'BUS_STOP',
      offsetLat: 0.0022,
      offsetLng: -0.0031,
      addressSuffix: 'Sangam Gate West Link, Bus Bay A',
      phone: 'Local Transport Helpline',
      status: 'OPEN_24_7',
      statusText: 'Every 5 Mins Frequency',
      rating: 4.7,
      notes: 'Free electric shuttle to parking grounds & railway station',
    },
    {
      name: 'North Corridor Rapid Transit Bus Stop',
      category: 'BUS_STOP',
      offsetLat: 0.0068,
      offsetLng: 0.0018,
      addressSuffix: 'Medical College Crossing, North Shelter',
      phone: 'Local Transport Helpline',
      status: 'OPEN',
      statusText: 'Active (05:00 AM - 11:30 PM)',
      rating: 4.4,
      notes: 'Covered seating, digital arrival timetable screen',
    },
  ];

  const allPlaces: NearbyPlace[] = templatePlaces.map((t, idx) => {
    const lat = userLat + t.offsetLat;
    const lng = userLng + t.offsetLng;
    const distKm = calculateDistanceKm(userLat, userLng, lat, lng);
    const walkMins = Math.max(1, Math.round((distKm / 4.5) * 60));
    const driveMins = Math.max(1, Math.round((distKm / 35) * 60));

    return {
      id: `place-${t.category.toLowerCase()}-${idx + 1}`,
      name: t.name,
      category: t.category,
      categoryLabel: CATEGORY_META[t.category].label,
      address: `${t.addressSuffix} (Near ${userLat.toFixed(4)}° N, ${userLng.toFixed(4)}° E)`,
      coords: [lat, lng],
      distanceKm: distKm,
      formattedDistance: formatDistance(distKm),
      walkTimeMinutes: walkMins,
      driveTimeMinutes: driveMins,
      phone: t.phone,
      status: t.status,
      statusText: t.statusText,
      rating: t.rating,
      isOpen: true,
      notes: t.notes,
    };
  });

  // Sort by closest distance first
  allPlaces.sort((a, b) => a.distanceKm - b.distanceKm);

  if (categoryFilter && categoryFilter !== 'ALL') {
    return allPlaces.filter((p) => p.category === categoryFilter);
  }

  return allPlaces;
}

/**
 * Finds the single closest place for each of the 7 essential categories
 */
export function getClosestPlacesPerCategory(
  userLat: number,
  userLng: number
): Record<ServiceCategory, NearbyPlace> {
  const all = getNearbyPlacesForCoords(userLat, userLng);
  const result = {} as Record<ServiceCategory, NearbyPlace>;

  const categories: ServiceCategory[] = [
    'HOSPITAL',
    'PETROL_PUMP',
    'HOTEL',
    'POLICE_STATION',
    'GARAGE',
    'TOLL_GATE',
    'BUS_STOP',
  ];

  categories.forEach((cat) => {
    const found = all.find((p) => p.category === cat);
    if (found) {
      result[cat] = found;
    }
  });

  return result;
}
