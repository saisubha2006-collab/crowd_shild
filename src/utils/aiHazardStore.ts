import { AIDetectedHazard } from '../types';

// Default mock initial AI hazards detected across event corridors
const INITIAL_AI_HAZARDS: AIDetectedHazard[] = [
  {
    id: 'ai-hazard-1',
    label: 'Exit Gate 3 Surge Obstruction',
    category: 'EXIT_BLOCKAGE',
    confidence: 96,
    riskLevel: 'CRITICAL',
    timestamp: '2 mins ago',
    coordinates: [28.6142, 77.2095],
    locationName: 'North Exit Gate 3 Corridor',
    description: 'Baggage pileup & narrow funnel creating 4.2 ppl/m² bottleneck.',
    detectedCount: 42,
    bbox: { x: 25, y: 30, w: 50, h: 45 },
  },
  {
    id: 'ai-hazard-2',
    label: 'Barricade Overpressure Wave',
    category: 'BARRICADE_BREACH',
    confidence: 91,
    riskLevel: 'HIGH',
    timestamp: '5 mins ago',
    coordinates: [28.6135, 77.2082],
    locationName: 'Main Pavilion Sector B',
    description: 'Crowd leaning against perimeter barricade with turbulent vector velocity.',
    detectedCount: 28,
    bbox: { x: 15, y: 40, w: 40, h: 35 },
  },
  {
    id: 'ai-hazard-3',
    label: 'Unattended Travel Bag',
    category: 'SUSPICIOUS_OBJECT',
    confidence: 88,
    riskLevel: 'MODERATE',
    timestamp: '12 mins ago',
    coordinates: [28.6148, 77.2104],
    locationName: 'Water Distribution Point #2',
    description: 'Unattended black backpack stationery for > 15 minutes near queue barrier.',
    bbox: { x: 55, y: 60, w: 20, h: 25 },
  },
  {
    id: 'ai-hazard-4',
    label: 'Clear Evacuation Escape Channel',
    category: 'SAFE_CORRIDOR',
    confidence: 98,
    riskLevel: 'SAFE',
    timestamp: 'Just now',
    coordinates: [28.6128, 77.2078],
    locationName: 'South River Promenade Gate 4',
    description: 'Broad 12m wide escape avenue with 0.4 ppl/m² density and zero barriers.',
    detectedCount: 6,
    bbox: { x: 30, y: 20, w: 40, h: 60 },
  },
];

let memoryHazards: AIDetectedHazard[] = [...INITIAL_AI_HAZARDS];
const listeners: Array<(hazards: AIDetectedHazard[]) => void> = [];

export const getAIHazards = (): AIDetectedHazard[] => {
  return [...memoryHazards];
};

export const addAIHazard = (hazard: AIDetectedHazard) => {
  memoryHazards = [hazard, ...memoryHazards];
  listeners.forEach((fn) => fn(memoryHazards));
};

export const subscribeAIHazards = (fn: (hazards: AIDetectedHazard[]) => void) => {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx !== -1) listeners.splice(idx, 1);
  };
};
