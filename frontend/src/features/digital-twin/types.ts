import { RouteResult } from '../../services/roadRouter';
import { HealthFacility, RoutingResult } from '../../types';

export interface UrbanClinic {
  id: string;
  name: string;
  role: 'DEPOT' | 'DONOR' | 'STABLE' | 'STOCKOUT';
  stock: number;
  daysLeft: number;
  beds: { occupied: number; total: number };
  coordinates: [number, number]; // [lng, lat]
  riskTier: 'P0_CRITICAL' | 'P1_WARNING' | 'P2_SURPLUS' | 'NORMAL';
}

export interface MapViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
  minZoom?: number;
  maxZoom?: number;
}

export interface LayerVisibilityState {
  show3DBuildings: boolean;
  showRoadGlow: boolean;
  showVehicleTrips: boolean;
  showRadarBeacons: boolean;
}

export interface DigitalTwinProps {
  clinics?: UrbanClinic[];
  facilities?: HealthFacility[];
  routingResult?: RoutingResult;
  selectedFacility?: HealthFacility | UrbanClinic | null;
  onFacilitySelect?: (facility: UrbanClinic) => void;
  activeTransfer?: { from: UrbanClinic; to: UrbanClinic; units: number } | null;
  activeRouteResult?: RouteResult | null;
  onRouteComputed?: (result: RouteResult | null) => void;
  routingMode?: 'AI_AGENT' | 'MANUAL_SELECT';
  isSimulating?: boolean;
  simStep?: number;
  simMessage?: string | null;
  className?: string;
}
