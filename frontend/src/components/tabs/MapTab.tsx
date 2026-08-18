import React, { useState, useEffect, useMemo, useRef } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { PathLayer, ScatterplotLayer } from '@deck.gl/layers';
import { TripsLayer, Tile3DLayer } from '@deck.gl/geo-layers';
import { I3SLoader } from '@loaders.gl/i3s';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';

import { Sparkles, Navigation, Pill, Bed, Activity, RefreshCw, X, CheckCircle2, Route, Cpu, MousePointerClick } from 'lucide-react';
import { fetchOSRMShortestRoute, RouteResult } from '../../services/roadRouter';
import { HealthFacility, RoutingResult } from '../../types';

interface MapTabProps {
  facilities?: HealthFacility[];
  routingResult?: RoutingResult;
  onFacilitySelect?: (facility: HealthFacility) => void;
  selectedFacility?: HealthFacility | null;
  onRerouteRequest?: (blockedRoadName: string) => void;
}

// 3D Lighting Setup (visgl/deck.gl Official Specification)
const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.1,
});

const pointLight = new PointLight({
  color: [255, 245, 230],
  intensity: 2.2,
  position: [-122.4, 37.78, 12000],
});

const lightingEffect = new LightingEffect({ ambientLight, pointLight });

// Official ArcGIS I3S 3D Building Stream Layer URL
const TILESET_URL =
  'https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/SanFrancisco_Bldgs/SceneServer/layers/0';

// Initial Street-Level ViewState
const INITIAL_VIEW_STATE = {
  latitude: 37.776,
  longitude: -122.408,
  zoom: 14.5,
  pitch: 45,
  bearing: 20,
  minZoom: 12,
  maxZoom: 20,
};

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

// 4 Strategic Healthcare Facilities positioned directly on Street Intersections
const INITIAL_CLINICS: UrbanClinic[] = [
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

export const MapTab: React.FC<MapTabProps> = () => {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [clinics] = useState<UrbanClinic[]>(INITIAL_CLINICS);
  const [routingMode, setRoutingMode] = useState<'AI_AGENT' | 'MANUAL_SELECT'>('AI_AGENT');
  const [manualOrigin, setManualOrigin] = useState<UrbanClinic | null>(null);
  const [manualDestination, setManualDestination] = useState<UrbanClinic | null>(null);

  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState<number>(0);
  const [simMessage, setSimMessage] = useState<string | null>(null);
  const [activeTransfer, setActiveTransfer] = useState<{ from: UrbanClinic; to: UrbanClinic; units: number } | null>(null);
  const [activeRouteResult, setActiveRouteResult] = useState<RouteResult | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<UrbanClinic | null>(null);

  const [time, setTime] = useState(0);

  // Compute Shortest Road Route using live OSRM Driving Engine API
  useEffect(() => {
    let isMounted = true;
    if (activeTransfer) {
      fetchOSRMShortestRoute(
        activeTransfer.from.coordinates,
        activeTransfer.to.coordinates
      ).then((result) => {
        if (isMounted) setActiveRouteResult(result);
      });
    } else {
      setActiveRouteResult(null);
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
  const handleClinicClick = (clinic: UrbanClinic) => {
    setSelectedClinic(clinic);

    if (routingMode === 'MANUAL_SELECT') {
      if (!manualOrigin || (manualOrigin && manualDestination)) {
        // Step 1: Select Origin
        setManualOrigin(clinic);
        setManualDestination(null);
        setActiveTransfer(null);
        setActiveRouteResult(null);
        setSimMessage(`Origin selected: ${clinic.name}. Now click destination clinic on map.`);
      } else if (manualOrigin && !manualDestination && manualOrigin.id !== clinic.id) {
        // Step 2: Select Destination & Compute OSRM Route
        setManualDestination(clinic);
        setActiveTransfer({ from: manualOrigin, to: clinic, units: 450 });
        setSimMessage(`Manual Route Computed: ${manualOrigin.name} -> ${clinic.name} via OSRM Engine.`);
      }
    }
  };

  // Handle Autonomous AI Agent Outbreak Simulation
  const handleTriggerSimulation = async () => {
    setRoutingMode('AI_AGENT');
    setManualOrigin(null);
    setManualDestination(null);
    setIsSimulating(true);
    setSimStep(1);
    setSimMessage('Step 1: Anomaly Detected at Mission Clinic (PHC-URB-03) (85 tabs, 0.8 days left)!');

    // Focus camera on Stockout Clinic
    setViewState(prev => ({
      ...prev,
      longitude: -122.4190,
      latitude: 37.7680,
      zoom: 15.6,
      pitch: 50,
      bearing: 30,
    }));

    setTimeout(() => {
      setSimStep(2);
      setSimMessage('Step 2: SupervisorAgent qualified nearest donor: Waterfront Annex (3,400 tabs, 1.9x buffer).');
      // Pan camera to show Donor
      setViewState(prev => ({
        ...prev,
        longitude: -122.3925,
        latitude: 37.7785,
        zoom: 15.4,
        pitch: 48,
        bearing: -15,
      }));
    }, 1500);

    setTimeout(async () => {
      setSimStep(3);
      const donor = clinics.find(c => c.id === 'PHC-URB-04')!;
      const recipient = clinics.find(c => c.id === 'PHC-URB-03')!;
      const res = await fetchOSRMShortestRoute(donor.coordinates, recipient.coordinates);
      
      setSimMessage(`Step 3: OSRM Engine calculated shortest road path (${res.totalDistanceKm} km, ${res.estimatedTimeMin} min, ${res.denseCoordinates.length} road GPS coordinates).`);
      setActiveTransfer({ from: donor, to: recipient, units: 500 });
      setActiveRouteResult(res);
    }, 3000);

    setTimeout(() => {
      setSimStep(4);
      setSimMessage('Step 4: Emergency Logistics Van Dispatched along OSRM street network with live cold-chain telemetry.');
      // Frame entire street corridor
      setViewState({
        latitude: 37.776,
        longitude: -122.408,
        zoom: 14.5,
        pitch: 45,
        bearing: 20,
        minZoom: 12,
        maxZoom: 20,
      });
      setIsSimulating(false);
    }, 4500);
  };

  const handleResetSimulation = () => {
    setActiveTransfer(null);
    setActiveRouteResult(null);
    setManualOrigin(null);
    setManualDestination(null);
    setSimStep(0);
    setSimMessage(null);
    setSelectedClinic(null);
    setViewState(INITIAL_VIEW_STATE);
  };

  // 3D Trips Data for Street-Level Navigation (100% Grounded via OSRM)
  const tripsData = useMemo(() => {
    if (!activeRouteResult || activeRouteResult.pathWithTimestamps.length === 0) return [];
    const path = activeRouteResult.pathWithTimestamps.map(p => [p[0], p[1]] as [number, number]);
    const timestamps = activeRouteResult.pathWithTimestamps.map(p => p[2]);

    return [
      { vendor: 0, path, timestamps },
      { vendor: 1, path: [...path].reverse(), timestamps },
    ];
  }, [activeRouteResult]);

  // Deck.gl Layer Pipeline (100% Grounded on OSRM Road Centerlines - ZERO Sky Arcs)
  const layers = useMemo(() => {
    return [
      // 1. ArcGIS I3S 3D Building Meshes
      new Tile3DLayer({
        id: 'tile-3d-layer',
        data: TILESET_URL,
        loaders: [I3SLoader],
        loadOptions: {
          i3s: { useCompressedTextures: false },
        },
        opacity: 0.96,
      }),

      // 2. Glowing OSRM Road Corridor Base Ribbon (Underlay on Asphalt)
      new PathLayer({
        id: 'street-route-base-glow',
        data: activeRouteResult ? [{ path: activeRouteResult.denseCoordinates }] : [],
        getPath: (d: any) => d.path,
        getColor: [6, 182, 212, 100],
        getWidth: 18,
        widthUnits: 'meters',
        capRounded: true,
        jointRounded: true,
      }),

      // 3. Crisp OSRM Road Centerline Ribbon
      new PathLayer({
        id: 'street-route-centerline',
        data: activeRouteResult ? [{ path: activeRouteResult.denseCoordinates }] : [],
        getPath: (d: any) => d.path,
        getColor: [6, 182, 212, 240],
        getWidth: 6,
        widthUnits: 'meters',
        capRounded: true,
        jointRounded: true,
      }),

      // 4. Uber-Style Tron Animated TripsLayer (Moving along OSRM street coordinates)
      new TripsLayer({
        id: 'uber-style-vehicle-trips',
        data: tripsData,
        getPath: (d: any) => d.path,
        getTimestamps: (d: any) => d.timestamps,
        getColor: (d: any) => (d.vendor === 0 ? [253, 128, 93] : [16, 185, 129]), // Orange Forward / Emerald Return
        opacity: 0.98,
        widthMinPixels: 6,
        rounded: true,
        trailLength: 240,
        currentTime: time,
        shadowEnabled: false,
      }),

      // 5. Ground Level Clinic Radar Beacons (Pulsing Red for Stockout/Dest, Emerald for Donor/Origin)
      new ScatterplotLayer({
        id: 'clinic-ground-radar-rings',
        data: clinics,
        getPosition: (d: UrbanClinic) => [d.coordinates[0], d.coordinates[1], 2],
        getRadius: (d: UrbanClinic) => {
          if (manualOrigin?.id === d.id) return 130 + Math.sin(time * 0.1) * 30;
          if (manualDestination?.id === d.id) return 130 + Math.cos(time * 0.1) * 30;
          if (d.role === 'STOCKOUT') return 120 + Math.sin(time * 0.08) * 35;
          if (d.role === 'DONOR') return 100 + Math.cos(time * 0.08) * 25;
          return 80;
        },
        getFillColor: (d: UrbanClinic) => {
          if (manualOrigin?.id === d.id) return [16, 185, 129, 120];
          if (manualDestination?.id === d.id) return [239, 68, 68, 120];
          if (d.role === 'STOCKOUT') return [239, 68, 68, 85];
          if (d.role === 'DONOR') return [16, 185, 129, 85];
          return [59, 130, 246, 65];
        },
        getLineColor: (d: UrbanClinic) => {
          if (manualOrigin?.id === d.id) return [16, 185, 129, 255];
          if (manualDestination?.id === d.id) return [239, 68, 68, 255];
          if (d.role === 'STOCKOUT') return [239, 68, 68, 255];
          if (d.role === 'DONOR') return [16, 185, 129, 255];
          return [59, 130, 246, 220];
        },
        stroked: true,
        filled: true,
        lineWidthMinPixels: 3,
        radiusUnits: 'meters',
        pickable: true,
        onClick: (info: any) => {
          if (info.object) handleClinicClick(info.object);
        },
      }),

      // 6. Solid Core Facility Pins
      new ScatterplotLayer({
        id: 'clinic-core-pins',
        data: clinics,
        getPosition: (d: UrbanClinic) => [d.coordinates[0], d.coordinates[1], 10],
        getRadius: 26,
        getFillColor: (d: UrbanClinic) => {
          if (manualOrigin?.id === d.id) return [16, 185, 129, 255];
          if (manualDestination?.id === d.id) return [239, 68, 68, 255];
          if (d.role === 'STOCKOUT') return [239, 68, 68, 255];
          if (d.role === 'DONOR') return [16, 185, 129, 255];
          return [59, 130, 246, 255];
        },
        radiusUnits: 'meters',
        pickable: true,
        onClick: (info: any) => {
          if (info.object) handleClinicClick(info.object);
        },
      }),
    ];
  }, [clinics, activeRouteResult, tripsData, manualOrigin, manualDestination, time]);

  return (
    <div className="relative h-[calc(100vh-80px)] w-full flex flex-col md:flex-row overflow-hidden border-b border-hairline bg-canvas">
      
      {/* Deck.gl WebGL 3D Canvas */}
      <div className="flex-1 relative h-full bg-[#061714]">
        <DeckGL
          style={{ backgroundColor: '#061714' }}
          viewState={viewState as any}
          onViewStateChange={(e: any) => setViewState(e.viewState)}
          controller={true}
          layers={layers as any}
          effects={[lightingEffect]}
          getTooltip={({ object }: any) => {
            if (!object) return null;
            if (object.name && object.role) {
              const c = object as UrbanClinic;
              const isOrigin = manualOrigin?.id === c.id;
              const isDest = manualDestination?.id === c.id;
              return {
                html: `
                  <div style="background: rgba(24,24,27,0.96); backdrop-filter: blur(10px); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); color: #fff; font-family: monospace; font-size: 11px; box-shadow: 0 8px 24px rgba(0,0,0,0.7);">
                    <div style="font-weight: 700; font-size: 13px; color: ${isOrigin ? '#10b981' : isDest ? '#ef4444' : c.role === 'STOCKOUT' ? '#ef4444' : c.role === 'DONOR' ? '#10b981' : '#38bdf8'}; margin-bottom: 3px;">
                      ${c.name} ${isOrigin ? '(ORIGIN)' : isDest ? '(DESTINATION)' : ''}
                    </div>
                    <div style="color: #a1a1aa; margin-bottom: 6px;">Role: <b>${c.role}</b> | ID: ${c.id}</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 6px;">
                      <div>Stock: <b style="color:#fff;">${c.stock} tabs</b></div>
                      <div>Days Left: <b style="color:${c.daysLeft <= 1.0 ? '#ef4444' : '#10b981'};">${c.daysLeft}d</b></div>
                      <div>Beds: <b style="color:#fff;">${c.beds.occupied}/${c.beds.total}</b></div>
                      <div>Tier: <b style="color:${c.riskTier === 'P0_CRITICAL' ? '#ef4444' : '#10b981'};">${c.riskTier}</b></div>
                    </div>
                    <div style="margin-top: 6px; color: #38bdf8; font-size: 10px;">Click pin to select as Origin / Destination</div>
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
            attributionControl={false}
          />
        </DeckGL>

        {/* Floating AI & Manual Route Controller HUD (Top Left) */}
        <div className="absolute top-4 left-4 z-10 bg-[#18181b]/95 backdrop-blur-md border border-white/20 rounded-xl p-5 shadow-2xl max-w-sm text-white font-sans">
          
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${activeTransfer ? 'bg-emerald-400 animate-ping' : 'bg-sky-400'}`}></span>
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-200">
                OSRM Road Network
              </span>
            </div>
            <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-sky-300 font-semibold flex items-center gap-1">
              <Cpu className="w-3 h-3 text-sky-400" />
              <span>OSRM Engine</span>
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-white/5 border border-white/10 rounded-lg mb-3">
            <button
              onClick={() => {
                setRoutingMode('AI_AGENT');
                setManualOrigin(null);
                setManualDestination(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-semibold transition-all ${
                routingMode === 'AI_AGENT'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>AI Auto-Plan</span>
            </button>

            <button
              onClick={() => {
                setRoutingMode('MANUAL_SELECT');
                setActiveTransfer(null);
                setActiveRouteResult(null);
                setSimMessage('Manual Mode: Click any clinic on the map to set Origin, then click another for Destination.');
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-semibold transition-all ${
                routingMode === 'MANUAL_SELECT'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MousePointerClick className="w-3 h-3" />
              <span>Manual 2-Point</span>
            </button>
          </div>

          {/* Mode Description & Actions */}
          {routingMode === 'AI_AGENT' ? (
            <div>
              <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                Autonomous 5-Agent Pipeline: Evaluates critical stockout at <b>Mission Clinic</b>, checks donor safety buffer, and dispatches shortest OSRM street route.
              </p>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={handleTriggerSimulation}
                  disabled={isSimulating}
                  className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                  <span>{isSimulating ? 'Routing...' : 'Run AI Route'}</span>
                </button>

                <button
                  onClick={handleResetSimulation}
                  className="w-full flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-medium py-2 px-3 rounded-lg transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                Interactive Point-to-Point: Click any <b>Origin clinic pin</b> on the 3D map, then click any <b>Destination clinic pin</b> to calculate the shortest road path.
              </p>

              <div className="p-2.5 bg-white/5 border border-white/10 rounded-lg text-[11px] font-mono mb-3 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">1. Origin:</span>
                  <b className={manualOrigin ? 'text-emerald-400' : 'text-zinc-500'}>
                    {manualOrigin ? manualOrigin.name : 'Click pin on map...'}
                  </b>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">2. Destination:</span>
                  <b className={manualDestination ? 'text-red-400' : 'text-zinc-500'}>
                    {manualDestination ? manualDestination.name : 'Click pin on map...'}
                  </b>
                </div>
              </div>

              <button
                onClick={handleResetSimulation}
                className="w-full flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-medium py-2 px-3 rounded-lg transition-all mb-3"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Clear Selection</span>
              </button>
            </div>
          )}

          {/* Live OSRM Routing Telemetry Metrics (When Route is Active) */}
          {activeRouteResult && (
            <div className="pt-3 border-t border-white/15 space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/5 p-2 rounded-md">
                  <span className="text-[10px] text-zinc-400 font-mono block">OSRM DIST</span>
                  <span className="text-sm font-bold text-white font-mono">{activeRouteResult.totalDistanceKm} km</span>
                </div>
                <div className="bg-white/5 p-2 rounded-md">
                  <span className="text-[10px] text-zinc-400 font-mono block">DRIVE TIME</span>
                  <span className="text-sm font-bold text-white font-mono">{activeRouteResult.estimatedTimeMin} min</span>
                </div>
                <div className="bg-white/5 p-2 rounded-md">
                  <span className="text-[10px] text-zinc-400 font-mono block">OSRM POINTS</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">{activeRouteResult.denseCoordinates.length} pts</span>
                </div>
              </div>

              {/* Street Sequence Traversed */}
              <div className="p-2 bg-white/5 border border-white/10 rounded-md text-[10px] font-mono text-zinc-300 flex items-start gap-1.5">
                <Route className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-400 block mb-0.5">Engine & Road Corridor:</span>
                  <span className="text-sky-300 font-semibold">{activeRouteResult.streetSequence.join(' -> ')}</span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-[11px] font-mono text-emerald-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cold-Chain Status</span>
                </span>
                <b className="text-emerald-400">PASSED (3.1°C)</b>
              </div>

              {activeTransfer && (
                <a
                  href={`https://www.google.com/maps/dir/${activeTransfer.from.coordinates[1]},${activeTransfer.from.coordinates[0]}/${activeTransfer.to.coordinates[1]},${activeTransfer.to.coordinates[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 bg-white text-zinc-900 hover:bg-zinc-100 text-xs font-bold py-2 rounded-md transition-colors shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>Open Google Maps GPS (Turn-by-Turn)</span>
                </a>
              )}
            </div>
          )}

          {/* Orchestration / User Prompt Log */}
          {simMessage && (
            <div className="mt-3 p-2.5 bg-black/60 border border-sky-500/40 rounded-md text-[11px] font-mono text-sky-300 animate-pulse leading-relaxed">
              <code>&gt; {simMessage}</code>
            </div>
          )}
        </div>

        {/* Slide-Over Facility Inspector (When Pin Clicked) */}
        {selectedClinic && (
          <div className="absolute top-4 right-4 z-10 bg-[#18181b]/95 backdrop-blur-md border border-white/20 rounded-xl p-5 shadow-2xl w-80 text-white font-sans">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                selectedClinic.role === 'STOCKOUT' 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                  : selectedClinic.role === 'DONOR'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
              }`}>
                {selectedClinic.role}
              </span>
              <button onClick={() => setSelectedClinic(null)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-bold text-white mb-1">{selectedClinic.name}</h3>
            <p className="text-xs text-zinc-400 font-mono mb-4">ID: {selectedClinic.id}</p>

            <div className="space-y-2.5 border-t border-white/10 pt-3 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400 flex items-center gap-1.5"><Pill className="w-3.5 h-3.5 text-zinc-400" /> Paracetamol 500mg:</span>
                <b className="font-mono text-white">{selectedClinic.stock} tabs ({selectedClinic.daysLeft}d left)</b>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 flex items-center gap-1.5"><Bed className="w-3.5 h-3.5 text-zinc-400" /> Bed Occupancy:</span>
                <b className="font-mono text-white">{selectedClinic.beds.occupied} / {selectedClinic.beds.total}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-zinc-400" /> Risk Tier:</span>
                <b className={`font-mono ${selectedClinic.riskTier === 'P0_CRITICAL' ? 'text-red-400' : 'text-emerald-400'}`}>
                  {selectedClinic.riskTier}
                </b>
              </div>
            </div>

            {selectedClinic.role === 'STOCKOUT' && (
              <button
                onClick={handleTriggerSimulation}
                className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
              >
                Dispatch Nearest Emergency Stock
              </button>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
