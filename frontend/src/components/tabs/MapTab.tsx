import React, { useState, useEffect, useMemo, useRef } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { PathLayer, ScatterplotLayer } from '@deck.gl/layers';
import { TripsLayer, Tile3DLayer } from '@deck.gl/geo-layers';
import { I3SLoader } from '@loaders.gl/i3s';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';

import { Sparkles, Navigation, Pill, Bed, Activity, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { generateDenseHighwaySpline } from '../../data/denseRouteSpline';
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

// Initial ViewState at Street Level
const INITIAL_VIEW_STATE = {
  latitude: 37.778,
  longitude: -122.408,
  zoom: 14.8,
  pitch: 45,
  bearing: 15,
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

// 4 Strategic Healthcare Facilities across the City Street Grid
const INITIAL_CLINICS: UrbanClinic[] = [
  {
    id: 'DH-DEPOT-01',
    name: 'Central Regional Medical Depot',
    role: 'DEPOT',
    stock: 50000,
    daysLeft: 65.0,
    beds: { occupied: 142, total: 180 },
    coordinates: [-122.4012, 37.7885],
    riskTier: 'P2_SURPLUS',
  },
  {
    id: 'PHC-URB-02',
    name: 'Downtown Community Health Center',
    role: 'STABLE',
    stock: 1850,
    daysLeft: 14.5,
    beds: { occupied: 18, total: 24 },
    coordinates: [-122.4150, 37.7820],
    riskTier: 'NORMAL',
  },
  {
    id: 'PHC-URB-03',
    name: 'Mission District Health Clinic',
    role: 'STOCKOUT',
    stock: 85,
    daysLeft: 0.8,
    beds: { occupied: 23, total: 24 },
    coordinates: [-122.4190, 37.7680],
    riskTier: 'P0_CRITICAL',
  },
  {
    id: 'PHC-URB-04',
    name: 'Waterfront Emergency Care Annex',
    role: 'DONOR',
    stock: 3400,
    daysLeft: 24.0,
    beds: { occupied: 12, total: 20 },
    coordinates: [-122.3940, 37.7780],
    riskTier: 'P2_SURPLUS',
  },
];

export const MapTab: React.FC<MapTabProps> = () => {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [clinics] = useState<UrbanClinic[]>(INITIAL_CLINICS);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState<number>(0);
  const [simMessage, setSimMessage] = useState<string | null>(null);
  const [activeTransfer, setActiveTransfer] = useState<{ from: UrbanClinic; to: UrbanClinic; units: number } | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<UrbanClinic | null>(null);

  const [time, setTime] = useState(0);
  const animFrameRef = useRef<number | null>(null);

  // Exact Street Grid Waypoints: King St -> Townsend St -> Division St -> Mission St -> Market St
  const streetWaypoints: [number, number][] = useMemo(() => [
    [-122.3940, 37.7780], // Waterfront Donor Annex (King & 3rd)
    [-122.3985, 37.7755], // Along King St to 4th
    [-122.4015, 37.7735], // 4th & Townsend St
    [-122.4060, 37.7710], // Along Townsend St to 6th
    [-122.4105, 37.7685], // Townsend & 8th St
    [-122.4150, 37.7675], // Division & 11th St
    [-122.4190, 37.7680], // Mission District Clinic (PHC-URB-03 Delivery Stop)
    [-122.4175, 37.7725], // Turn onto South Van Ness Ave
    [-122.4140, 37.7760], // Market & 10th St
    [-122.4070, 37.7830], // Along Market St past 4th St
    [-122.4012, 37.7885], // Central Medical Depot (Return)
  ], []);

  // Dense Catmull-Rom road-following spline
  const splineData = useMemo(() => {
    return generateDenseHighwaySpline(streetWaypoints, 55);
  }, [streetWaypoints]);

  const loopLength = splineData.pathWithTimestamps.length > 0 
    ? splineData.pathWithTimestamps[splineData.pathWithTimestamps.length - 1][2] 
    : 1600;

  // 60fps Clock for TripsLayer animation along streets
  useEffect(() => {
    let curTime = 0;
    let animId: number;
    const animate = () => {
      curTime = (curTime + 2.5) % (loopLength || 1600);
      setTime(curTime);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [loopLength]);

  // Handle On-Spot Uber-style AI Road Route Simulation
  const handleTriggerSimulation = () => {
    setIsSimulating(true);
    setSimStep(1);
    setSimMessage('Anomaly Detected: Mission Clinic (PHC-URB-03) paracetamol critical (85 tabs, 0.8d left)!');

    // Focus camera on Stockout Clinic
    setViewState(prev => ({
      ...prev,
      longitude: -122.4190,
      latitude: 37.7680,
      zoom: 15.6,
      pitch: 55,
      bearing: 30,
    }));

    setTimeout(() => {
      setSimStep(2);
      setSimMessage('SupervisorAgent evaluating nearest road donor: Waterfront Annex has 3,400 tabs (1.9x buffer).');
      // Pan camera to show Donor
      setViewState(prev => ({
        ...prev,
        longitude: -122.3940,
        latitude: 37.7780,
        zoom: 15.4,
        pitch: 50,
        bearing: -20,
      }));
    }, 1500);

    setTimeout(() => {
      setSimStep(3);
      setSimMessage('Uber-Grade Shortest Road Route Computed: 3.82 km / 7.4 min via King St & Townsend St.');
      
      const donor = clinics.find(c => c.id === 'PHC-URB-04')!;
      const recipient = clinics.find(c => c.id === 'PHC-URB-03')!;
      setActiveTransfer({ from: donor, to: recipient, units: 500 });
    }, 3000);

    setTimeout(() => {
      setSimStep(4);
      setSimMessage('Emergency Logistics Van Dispatched: Active street navigation with live cold-chain telemetry.');
      // Frame entire street corridor
      setViewState({
        latitude: 37.776,
        longitude: -122.408,
        zoom: 14.4,
        pitch: 48,
        bearing: 25,
        minZoom: 12,
        maxZoom: 20,
      });
      setIsSimulating(false);
    }, 4500);
  };

  const handleResetSimulation = () => {
    setActiveTransfer(null);
    setSimStep(0);
    setSimMessage(null);
    setSelectedClinic(null);
    setViewState(INITIAL_VIEW_STATE);
  };

  // 3D Trips Data for Street-Level Navigation
  const tripsData = useMemo(() => {
    if (!activeTransfer || splineData.pathWithTimestamps.length === 0) return [];
    const path = splineData.pathWithTimestamps.map(p => [p[0], p[1]] as [number, number]);
    const timestamps = splineData.pathWithTimestamps.map(p => p[2]);

    return [
      { vendor: 0, path, timestamps },
      { vendor: 1, path: [...path].reverse(), timestamps },
    ];
  }, [activeTransfer, splineData]);

  // Deck.gl Layer Pipeline (100% Grounded Road Navigation)
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

      // 2. Glowing Road Corridor Base Ribbon (Underlay)
      new PathLayer({
        id: 'street-route-base-glow',
        data: activeTransfer ? [{ path: splineData.denseLineCoordinates }] : [],
        getPath: (d: any) => d.path,
        getColor: [6, 182, 212, 80],
        getWidth: 24,
        widthUnits: 'meters',
        capRounded: true,
        jointRounded: true,
      }),

      // 3. Crisp Road Centerline Ribbon
      new PathLayer({
        id: 'street-route-centerline',
        data: activeTransfer ? [{ path: splineData.denseLineCoordinates }] : [],
        getPath: (d: any) => d.path,
        getColor: [6, 182, 212, 220],
        getWidth: 7,
        widthUnits: 'meters',
        capRounded: true,
        jointRounded: true,
      }),

      // 4. Uber-style Tron Animated TripsLayer (Moving along the actual streets)
      new TripsLayer({
        id: 'uber-style-vehicle-trips',
        data: tripsData,
        getPath: (d: any) => d.path,
        getTimestamps: (d: any) => d.timestamps,
        getColor: (d: any) => (d.vendor === 0 ? [253, 128, 93] : [16, 185, 129]), // Orange Forward / Emerald Return
        opacity: 0.98,
        widthMinPixels: 6,
        rounded: true,
        trailLength: 260,
        currentTime: time,
        shadowEnabled: false,
      }),

      // 5. Ground Level Clinic Radar Beacons (Pulsing Red for Stockout, Emerald for Donor/Depot)
      new ScatterplotLayer({
        id: 'clinic-ground-radar-rings',
        data: clinics,
        getPosition: (d: UrbanClinic) => [d.coordinates[0], d.coordinates[1], 5],
        getRadius: (d: UrbanClinic) => {
          if (d.role === 'STOCKOUT') return 130 + Math.sin(time * 0.08) * 40;
          if (d.role === 'DONOR') return 110 + Math.cos(time * 0.08) * 25;
          return 85;
        },
        getFillColor: (d: UrbanClinic) => {
          if (d.role === 'STOCKOUT') return [239, 68, 68, 90];
          if (d.role === 'DONOR') return [16, 185, 129, 90];
          return [59, 130, 246, 70];
        },
        getLineColor: (d: UrbanClinic) => {
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
          if (info.object) setSelectedClinic(info.object);
        },
      }),

      // 6. Solid Core Facility Pins
      new ScatterplotLayer({
        id: 'clinic-core-pins',
        data: clinics,
        getPosition: (d: UrbanClinic) => [d.coordinates[0], d.coordinates[1], 15],
        getRadius: 28,
        getFillColor: (d: UrbanClinic) => {
          if (d.role === 'STOCKOUT') return [239, 68, 68, 255];
          if (d.role === 'DONOR') return [16, 185, 129, 255];
          return [59, 130, 246, 255];
        },
        radiusUnits: 'meters',
        pickable: true,
        onClick: (info: any) => {
          if (info.object) setSelectedClinic(info.object);
        },
      }),
    ];
  }, [clinics, activeTransfer, tripsData, splineData, time]);

  return (
    <div className="relative h-[calc(100vh-80px)] w-full flex flex-col md:flex-row overflow-hidden border-b border-hairline bg-canvas">
      
      {/* 🗺️ Deck.gl WebGL 3D Canvas */}
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
              return {
                html: `
                  <div style="background: rgba(24,24,27,0.96); backdrop-filter: blur(10px); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); color: #fff; font-family: monospace; font-size: 11px; box-shadow: 0 8px 24px rgba(0,0,0,0.7);">
                    <div style="font-weight: 700; font-size: 13px; color: ${c.role === 'STOCKOUT' ? '#ef4444' : c.role === 'DONOR' ? '#10b981' : '#38bdf8'}; margin-bottom: 3px;">${c.name}</div>
                    <div style="color: #a1a1aa; margin-bottom: 6px;">Role: <b>${c.role}</b> | ID: ${c.id}</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 6px;">
                      <div>Stock: <b style="color:#fff;">${c.stock} tabs</b></div>
                      <div>Days Left: <b style="color:${c.daysLeft <= 1.0 ? '#ef4444' : '#10b981'};">${c.daysLeft}d</b></div>
                      <div>Beds: <b style="color:#fff;">${c.beds.occupied}/${c.beds.total}</b></div>
                      <div>Tier: <b style="color:${c.riskTier === 'P0_CRITICAL' ? '#ef4444' : '#10b981'};">${c.riskTier}</b></div>
                    </div>
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

        {/* ⚡ Floating AI Road Route Controller & Telemetry HUD (Top Left) */}
        <div className="absolute top-4 left-4 z-10 bg-[#18181b]/95 backdrop-blur-md border border-white/20 rounded-xl p-5 shadow-2xl max-w-sm text-white font-sans">
          
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${activeTransfer ? 'bg-emerald-400 animate-ping' : 'bg-sky-400'}`}></span>
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-200">
                Uber-Style Road Routing
              </span>
            </div>
            <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-sky-300 font-semibold">
              Ground-Level Network
            </span>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed mb-4">
            Simulate real-time drug depletion at <b>Mission Clinic</b> and optimize ground delivery transit through city streets in real time.
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={handleTriggerSimulation}
              disabled={isSimulating}
              className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-xs font-semibold py-2.5 px-3 rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Routing...' : '⚡ Optimize Road Route'}</span>
            </button>

            <button
              onClick={handleResetSimulation}
              className="w-full flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-medium py-2.5 px-3 rounded-lg transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>

          {/* Live Road Telemetry Metrics (When Route is Active) */}
          {activeTransfer && (
            <div className="pt-3 border-t border-white/15 space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/5 p-2 rounded-md">
                  <span className="text-[10px] text-zinc-400 font-mono block">STREET DIST</span>
                  <span className="text-sm font-bold text-white font-mono">3.82 km</span>
                </div>
                <div className="bg-white/5 p-2 rounded-md">
                  <span className="text-[10px] text-zinc-400 font-mono block">DRIVE TIME</span>
                  <span className="text-sm font-bold text-white font-mono">7.4 min</span>
                </div>
                <div className="bg-white/5 p-2 rounded-md">
                  <span className="text-[10px] text-zinc-400 font-mono block">TRANSFER</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">500 tabs</span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-[11px] font-mono text-emerald-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cold-Chain Status</span>
                </span>
                <b className="text-emerald-400">PASSED (3.1°C)</b>
              </div>

              <a
                href="https://www.google.com/maps/dir/37.7780,-122.3940/37.7680,-122.4190"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 bg-white text-zinc-900 hover:bg-zinc-100 text-xs font-bold py-2 rounded-md transition-colors shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-600" />
                <span>Open Google Maps GPS (Turn-by-Turn)</span>
              </a>
            </div>
          )}

          {/* AI Orchestration Step Log */}
          {simMessage && (
            <div className="mt-3 p-2.5 bg-black/60 border border-orange-500/40 rounded-md text-[11px] font-mono text-orange-300 animate-pulse leading-relaxed">
              <code>&gt; Step {simStep}/4: {simMessage}</code>
            </div>
          )}
        </div>

        {/* 📋 Slide-Over Facility Inspector (When Pin Clicked) */}
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
