import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { MapControls } from './controls/MapControls';
import { useDigitalTwinLayers, lightingEffect } from './layers/useDigitalTwinLayers';
import { DigitalTwinProps, LayerVisibilityState, MapViewState, UrbanClinic } from './types';
import { fetchOSRMShortestRoute, RouteResult } from '../../services/roadRouter';

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
    stock: 3400,
    daysLeft: 24.0,
    beds: { occupied: 12, total: 20 },
    coordinates: [-122.3925, 37.7785], // 3rd St & King St
    riskTier: 'P2_SURPLUS',
  },
];

const DigitalTwinComponent: React.FC<DigitalTwinProps> = ({
  clinics = DEFAULT_CLINICS,
  selectedFacility,
  onFacilitySelect,
  activeTransfer: externalActiveTransfer,
  activeRouteResult: externalActiveRouteResult,
  onRouteComputed,
  routingMode = 'AI_AGENT',
  isSimulating = false,
  simStep = 0,
  simMessage = null,
  className = '',
}) => {
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW_STATE);
  const [internalActiveTransfer, setInternalActiveTransfer] = useState<{ from: UrbanClinic; to: UrbanClinic; units: number } | null>(null);
  const [internalRouteResult, setInternalRouteResult] = useState<RouteResult | null>(null);
  const [manualOrigin, setManualOrigin] = useState<UrbanClinic | null>(null);
  const [manualDestination, setManualDestination] = useState<UrbanClinic | null>(null);
  const [time, setTime] = useState(0);

  const [layerVisibility, setLayerVisibility] = useState<LayerVisibilityState>({
    show3DBuildings: true,
    showRoadGlow: true,
    showVehicleTrips: true,
    showRadarBeacons: true,
  });

  const activeTransfer = externalActiveTransfer !== undefined ? externalActiveTransfer : internalActiveTransfer;
  const activeRouteResult = externalActiveRouteResult !== undefined ? externalActiveRouteResult : internalRouteResult;

  // Smooth camera synchronization when selectedFacility changes
  useEffect(() => {
    if (selectedFacility) {
      const lng = 'coordinates' in selectedFacility 
        ? selectedFacility.coordinates[0] 
        : selectedFacility.longitude;
      const lat = 'coordinates' in selectedFacility 
        ? selectedFacility.coordinates[1] 
        : selectedFacility.latitude;

      if (lng !== undefined && lat !== undefined) {
        setViewState((prev) => ({
          ...prev,
          longitude: lng,
          latitude: lat,
          zoom: Math.max(14.8, prev.zoom || 14.5),
        }));
      }
    }
  }, [selectedFacility]);

  // Compute Shortest Road Route using live OSRM Driving Engine API
  useEffect(() => {
    let isMounted = true;
    if (activeTransfer) {
      fetchOSRMShortestRoute(
        activeTransfer.from.coordinates,
        activeTransfer.to.coordinates
      ).then((result) => {
        if (isMounted) {
          setInternalRouteResult(result);
          if (onRouteComputed) onRouteComputed(result);
        }
      });
    } else {
      setInternalRouteResult(null);
      if (onRouteComputed) onRouteComputed(null);
    }
    return () => {
      isMounted = false;
    };
  }, [activeTransfer]);

  const loopLength = activeRouteResult && activeRouteResult.pathWithTimestamps.length > 0
    ? activeRouteResult.pathWithTimestamps[activeRouteResult.pathWithTimestamps.length - 1][2]
    : 1600;

  // 60fps Clock for TripsLayer animation strictly along computed OSRM road network
  useEffect(() => {
    let curTime = 0;
    let animId: number;
    const animate = () => {
      curTime = (curTime + 2.0) % (loopLength || 1600);
      setTime(curTime);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [loopLength]);

  // Handle Clinic Pin Click
  const handleClinicClick = useCallback((clinic: UrbanClinic) => {
    if (onFacilitySelect) onFacilitySelect(clinic);

    if (routingMode === 'MANUAL_SELECT') {
      if (!manualOrigin || (manualOrigin && manualDestination)) {
        setManualOrigin(clinic);
        setManualDestination(null);
        setInternalActiveTransfer(null);
        setInternalRouteResult(null);
      } else if (manualOrigin && !manualDestination && manualOrigin.id !== clinic.id) {
        setManualDestination(clinic);
        setInternalActiveTransfer({ from: manualOrigin, to: clinic, units: 450 });
      }
    }
  }, [manualOrigin, manualDestination, routingMode, onFacilitySelect]);

  // 3D Trips Data for Street-Level Navigation
  const tripsData = useMemo(() => {
    if (!activeRouteResult || activeRouteResult.pathWithTimestamps.length === 0) return [];
    const path = activeRouteResult.pathWithTimestamps.map(p => [p[0], p[1]] as [number, number]);
    const timestamps = activeRouteResult.pathWithTimestamps.map(p => p[2]);

    return [
      { vendor: 0, path, timestamps },
      { vendor: 1, path: [...path].reverse(), timestamps },
    ];
  }, [activeRouteResult]);

  // Deck.gl Layer Pipeline
  const layers = useDigitalTwinLayers({
    clinics,
    activeRouteResult,
    tripsData,
    time,
    layerVisibility,
    manualOrigin,
    manualDestination,
    onClinicClick: handleClinicClick,
  });

  return (
    <div className={`relative w-full h-full min-h-[400px] overflow-hidden bg-[#111418] select-none ${className}`}>
      {/* Floating Tactical Map Controls */}
      <MapControls
        viewState={viewState}
        onViewStateChange={setViewState}
        initialViewState={INITIAL_VIEW_STATE}
        layerVisibility={layerVisibility}
        onLayerVisibilityChange={setLayerVisibility}
      />

      {/* Deck.gl Canvas Overlay with MapLibre Underlay */}
      <DeckGL
        viewState={viewState as any}
        onViewStateChange={(e: any) => setViewState(e.viewState)}
        controller={{
          doubleClickZoom: false,
          dragRotate: true,
          touchRotate: true,
          keyboard: true,
        }}
        effects={[lightingEffect]}
        layers={layers as any}
        getCursor={({ isHovering }) => (isHovering ? 'pointer' : 'default')}
        getTooltip={({ object }: any) => {
          if (!object) return null;
          if (object.name && object.role) {
            const c = object as UrbanClinic;
            const isOrigin = manualOrigin?.id === c.id;
            const isDest = manualDestination?.id === c.id;
            return {
              html: `
                <div style="background: rgba(24,32,38,0.95); border: 1px solid #293742; padding: 8px 12px; color: #F5F8FA; font-family: monospace; font-size: 11px; border-radius: 3px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                  <div style="font-weight: 700; font-size: 12px; color: ${isOrigin ? '#0D8050' : isDest ? '#C23030' : c.role === 'STOCKOUT' ? '#C23030' : c.role === 'DONOR' ? '#0D8050' : '#106BA3'}; margin-bottom: 2px; text-transform: uppercase;">
                    ${c.name} ${isOrigin ? '[ORIGIN]' : isDest ? '[DESTINATION]' : ''}
                  </div>
                  <div style="color: #A7B6C2; margin-bottom: 4px;">ROLE: <b>${c.role}</b> | ID: ${c.id}</div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; border-top: 1px solid #293742; padding-top: 4px;">
                    <div>STOCK: <b style="color:#F5F8FA;">${c.stock}</b></div>
                    <div>DAYS: <b style="color:${c.daysLeft <= 1.0 ? '#C23030' : '#0D8050'};">${c.daysLeft}d</b></div>
                    <div>BEDS: <b style="color:#F5F8FA;">${c.beds.occupied}/${c.beds.total}</b></div>
                    <div>TIER: <b style="color:${c.riskTier === 'P0_CRITICAL' ? '#C23030' : '#0D8050'};">${c.riskTier}</b></div>
                  </div>
                  <div style="margin-top: 4px; color: #106BA3; font-size: 9px; font-weight: bold;">[CLICK TO SELECT]</div>
                </div>
              `,
            };
          }
          return null;
        }}
      >
        <Map
          reuseMaps
          mapLib={maplibregl as any}
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        />
      </DeckGL>
    </div>
  );
};

export const DigitalTwin = React.memo(DigitalTwinComponent);

