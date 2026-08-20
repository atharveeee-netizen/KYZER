import { MapViewState, UrbanClinic } from './types';
export type { UrbanClinic };

// Initial Street-Level ViewState
export const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 37.776,
  longitude: -122.408,
  zoom: 14.5,
  pitch: 45,
  bearing: 20,
  minZoom: 12,
  maxZoom: 20,
};

// 4 Strategic Healthcare Facilities positioned directly on Street Intersections
export const DEFAULT_CLINICS: UrbanClinic[] = [
  {
    id: 'DH-DEPOT-01',
    name: 'Central Regional Medical Depot',
    role: 'DEPOT',
    stock: 50000,
    daysLeft: 65.0,
    beds: { occupied: 142, total: 180 },
    coordinates: [-122.4012, 37.7885], // Market St & 3rd St
    riskTier: 'P2_SURPLUS',
  },
  {
    id: 'PHC-URB-02',
    name: 'Downtown Community Health Center',
    role: 'STABLE',
    stock: 1850,
    daysLeft: 14.5,
    beds: { occupied: 18, total: 24 },
    coordinates: [-122.4120, 37.7795], // Market St & 8th St
    riskTier: 'NORMAL',
  },
  {
    id: 'PHC-URB-03',
    name: 'Mission District Health Clinic',
    role: 'STOCKOUT',
    stock: 85,
    daysLeft: 0.8,
    beds: { occupied: 23, total: 24 },
    coordinates: [-122.4190, 37.7680], // Mission St & 16th St
    riskTier: 'P0_CRITICAL',
  },
  {
    id: 'PHC-URB-04',
    name: 'Waterfront Emergency Care Annex',
    role: 'DONOR',
    stock: 107,
    daysLeft: 24.0,
    beds: { occupied: 12, total: 20 },
    coordinates: [-122.3925, 37.7785], // 3rd St & King St
    riskTier: 'P2_SURPLUS',
  },
];
