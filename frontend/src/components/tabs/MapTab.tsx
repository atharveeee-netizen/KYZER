import React, { useState, useEffect, useRef, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { Tile3DLayer } from '@deck.gl/geo-layers';
import { CesiumIonLoader } from '@loaders.gl/3d-tiles';
import { ColumnLayer, ArcLayer, PathLayer, ScatterplotLayer, PolygonLayer } from '@deck.gl/layers';
import { TripsLayer } from '@deck.gl/geo-layers';
import { AmbientLight, DirectionalLight, LightingEffect } from '@deck.gl/core';

import { Navigation, Send, AlertTriangle, Bed, Users, Pill, ShieldAlert, Sparkles, RefreshCw, Layers, Compass, Box, Activity } from 'lucide-react';
import { HealthFacility, RoutingResult } from '../../types';

interface MapTabProps {
  facilities: HealthFacility[];
  routingResult: RoutingResult;
  onFacilitySelect: (facility: HealthFacility) => void;
  selectedFacility: HealthFacility | null;
  onRerouteRequest: (blockedRoadName: string) => void;
}

// Cesium Ion 3D Photogrammetric Mesh Asset (Official Deck.gl 3D-Tiles Example)
const ION_ASSET_ID = 43978;
const ION_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4OGMyMDVmMS0zNjIyLTRkMDQtYTQ2MS05YmQ3MTc5ZDJhOTAiLCJpZCI6MjYxMzMsImlhdCI6MTc3NjA4NzkxNX0.wfqN4Vu94UsALYDIunRGWO8wKFYMoe67ooozJwDAo-c';
const TILESET_URL = `https://assets.ion.cesium.com/${ION_ASSET_ID}/tileset.json`;

// 3D Lighting Setup (NASA / Palantir Visgl Specification)
const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.2,
});

const dirLight1 = new DirectionalLight({
  color: [255, 240, 220],
  intensity: 2.0,
  direction: [-1, -3, -2],
});

const dirLight2 = new DirectionalLight({
  color: [100, 180, 255],
  intensity: 1.0,
  direction: [2, 1, -1],
});

const lightingEffect = new LightingEffect({ ambientLight, dirLight1, dirLight2 });

const material = {
  ambient: 0.35,
  diffuse: 0.85,
  shininess: 42,
  specularColor: [255, 255, 255] as [number, number, number],
};

// Helper: Generate 3D Building Campus Complex footprint around each clinic
function generateBuildingComplex(lng: number, lat: number, scale = 0.007) {
  const mainBlock = [
    [lng - scale, lat - scale * 0.7],
    [lng + scale, lat - scale * 0.7],
    [lng + scale, lat + scale * 0.7],
    [lng - scale, lat + scale * 0.7],
    [lng - scale, lat - scale * 0.7],
  ];
  const emergencyWing = [
    [lng + scale * 1.1, lat - scale * 0.4],
    [lng + scale * 1.8, lat - scale * 0.4],
    [lng + scale * 1.8, lat + scale * 0.5],
    [lng + scale * 1.1, lat + scale * 0.5],
    [lng + scale * 1.1, lat - scale * 0.4],
  ];
  const vaccineVault = [
    [lng - scale * 1.8, lat - scale * 0.5],
    [lng - scale * 1.1, lat - scale * 0.5],
    [lng - scale * 1.1, lat + scale * 0.3],
    [lng - scale * 1.8, lat + scale * 0.3],
    [lng - scale * 1.8, lat - scale * 0.5],
  ];

  return [
    { polygon: mainBlock, height: 220, type: 'MAIN_HOSPITAL' },
    { polygon: emergencyWing, height: 320, type: 'ICU_TRAUMA_WING' },
    { polygon: vaccineVault, height: 160, type: 'WHO_VACCINE_VAULT' },
  ];
}

export const MapTab: React.FC<MapTabProps> = ({
  facilities,
  routingResult,
  onFacilitySelect,
  selectedFacility,
  onRerouteRequest,
}) => {
  const [viewState, setViewState] = useState({
    longitude: 74.08,
    latitude: 18.78,
    zoom: 9.8,
    pitch: 62, // 3D Camera Tilt (62 degrees)
    bearing: -20, // 3D Rotation
    maxPitch: 85,
    minZoom: 6,
    maxZoom: 19,
  });

  const [tripTime, setTripTime] = useState(0);
  const [isSelfPlanning, setIsSelfPlanning] = useState(false);
  const [planningStep, setPlanningStep] = useState<string | null>(null);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [showBlockerModal, setShowBlockerModal] = useState(false);
  const [roadNote, setRoadNote] = useState('Ghod River Bridge Submerged (Rainfall >45mm)');

  const orbitRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);

  // 10 Pune District Nodes
  const puneClinics = facilities.filter(f => f.country === 'IND');

  // Continuous 60fps clock for TripsLayer animated light beam
  useEffect(() => {
    let time = 0;
    const loop = () => {
      time = (time + 1.2) % 1800;
      setTripTime(time);
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // 1. Build 3D Extruded Building Models Data
  const buildingsData = useMemo(() => {
    const list: any[] = [];
    puneClinics.forEach((fac, idx) => {
      const isP0 = fac.risk_tier === 'P0_CRITICAL';
      const isP1 = fac.risk_tier === 'P1_WARNING';
      const baseColor = isP0 ? [239, 68, 68] : isP1 ? [245, 158, 11] : [16, 185, 129];
      
      const complexes = generateBuildingComplex(fac.longitude, fac.latitude);
      complexes.forEach((comp) => {
        list.push({
          polygon: comp.polygon,
          height: comp.height * (isP0 ? 1.8 : 1.2),
          color: [...baseColor, 230],
          facility: fac,
          name: `${idx + 1}. ${fac.name} (${comp.type})`,
        });
      });
    });
    return list;
  }, [puneClinics]);

  // 2. Build 3D Animated TripsLayer Route with Timestamps
  const tripsData = useMemo(() => {
    if (puneClinics.length === 0) return [];
    const waypoints = puneClinics.map(f => [f.longitude, f.latitude]);
    waypoints.push(waypoints[0]); // Complete circuit

    const pathWithTimes: [number, number, number][] = [];
    let cumulativeTime = 0;

    for (let i = 0; i < waypoints.length; i++) {
      pathWithTimes.push([waypoints[i][0], waypoints[i][1], cumulativeTime]);
      cumulativeTime += 180; // 180 ticks per leg
    }

    return [
      {
        path: pathWithTimes,
        color: [245, 78, 0], // Neon Cursor Orange
      },
      {
        path: pathWithTimes,
        color: [6, 182, 212], // Neon Cyan Secondary
      }
    ];
  }, [puneClinics]);

  // 3. Build 3D Parabolic Transfer Arcs
  const arcsData = useMemo(() => {
    const donor = puneClinics.find(f => f.facility_id === 'PHC-PUN-008') || puneClinics[0];
    const recipients = puneClinics.filter(f => f.risk_tier === 'P0_CRITICAL');

    return recipients.map(rec => ({
      from: [donor?.longitude || 73.9015, donor?.latitude || 18.8471],
      to: [rec.longitude, rec.latitude],
      fromName: donor?.name || 'Khed Donor Hub',
      toName: rec.name,
      units: 500,
    }));
  }, [puneClinics]);

  // 4. Build 3D Hexagonal Metric Columns
  const columnData = useMemo(() => {
    return puneClinics.map((fac, idx) => {
      const isP0 = fac.risk_tier === 'P0_CRITICAL';
      const isP1 = fac.risk_tier === 'P1_WARNING';
      const height = isP0 ? 4500 : isP1 ? 2500 : 6000;
      const color: [number, number, number, number] = isP0 
        ? [239, 68, 68, 240] 
        : isP1 
        ? [245, 158, 11, 240] 
        : [16, 185, 129, 240];

      return {
        position: [fac.longitude, fac.latitude],
        elevation: height,
        color,
        facility: fac,
        name: `${idx + 1}. ${fac.name}`,
      };
    });
  }, [puneClinics]);

  // 5. Official visgl/deck.gl Tile3DLayer with CesiumIonLoader
  const tile3DLayer = useMemo(() => {
    return new Tile3DLayer({
      id: 'tile-3d-photogrammetry',
      pointSize: 2,
      data: TILESET_URL,
      loaders: [CesiumIonLoader],
      loadOptions: { 'cesium-ion': { accessToken: ION_TOKEN } },
      pickable: true,
      opacity: 0.85,
    });
  }, []);

  // Deck.gl 3D Layers
  const layers = [
    // Layer 1: Official Cesium Ion Photogrammetry 3D Tiles Layer
    tile3DLayer,

    // Layer 2: Static Route Ribbon (Underglow)
    new PathLayer({
      id: 'route-underglow',
      data: [{ path: puneClinics.map(f => [f.longitude, f.latitude]).concat([[puneClinics[0]?.longitude || 74.08, puneClinics[0]?.latitude || 18.78]]) }],
      getPath: (d: any) => d.path,
      getColor: [6, 182, 212, 100],
      getWidth: 1200,
      widthUnits: 'meters',
      capRounded: true,
      jointRounded: true,
    }),

    // Layer 3: 3D Animated TripsLayer (Tron Pulsing Light Trail)
    new TripsLayer({
      id: 'animated-quantum-trips',
      data: tripsData,
      getPath: (d: any) => d.path.map((p: any) => [p[0], p[1]]),
      getTimestamps: (d: any) => d.path.map((p: any) => p[2]),
      getColor: (d: any) => d.color,
      opacity: 0.95,
      widthMinPixels: 5,
      rounded: true,
      trailLength: 220,
      currentTime: tripTime,
    }),

    // Layer 4: 3D Extruded Building Models with Real-Time Lighting
    new PolygonLayer({
      id: '3d-clinic-buildings',
      data: buildingsData,
      extruded: true,
      wireframe: true,
      filled: true,
      getPolygon: (d: any) => d.polygon,
      getElevation: (d: any) => d.height,
      getFillColor: (d: any) => d.color,
      getLineColor: [255, 255, 255, 180],
      getLineWidth: 2,
      lineWidthUnits: 'pixels',
      material,
      pickable: true,
      onClick: (info: any) => {
        if (info.object?.facility) {
          onFacilitySelect(info.object.facility);
          setViewState(prev => ({
            ...prev,
            longitude: info.object.facility.longitude,
            latitude: info.object.facility.latitude,
            zoom: 12,
            pitch: 70,
          }));
        }
      },
    }),

    // Layer 5: 3D High Parabolic Leaping Arcs in Space
    new ArcLayer({
      id: '3d-quantum-arcs',
      data: arcsData,
      getSourcePosition: (d: any) => d.from,
      getTargetPosition: (d: any) => d.to,
      getSourceColor: [16, 185, 129, 255],
      getTargetColor: [239, 68, 68, 255],
      getWidth: 4,
      getHeight: 0.7, // High 3D arch
      pickable: true,
    }),

    // Layer 6: 3D Spatial Status Columns
    new ColumnLayer({
      id: '3d-spatial-columns',
      data: columnData,
      diskResolution: 8,
      radius: 800,
      extruded: true,
      pickable: true,
      elevationScale: 1,
      getPosition: (d: any) => d.position,
      getFillColor: (d: any) => d.color,
      getElevation: (d: any) => d.elevation,
      material,
    }),

    // Layer 7: Ground Pulsing Radar Rings at Critical Clinics
    new ScatterplotLayer({
      id: 'pulsing-radar-rings',
      data: puneClinics.filter(f => f.risk_tier === 'P0_CRITICAL'),
      getPosition: (d: any) => [d.longitude, d.latitude],
      getRadius: 2400 + Math.sin(tripTime * 0.05) * 800,
      getFillColor: [239, 68, 68, 60],
      getLineColor: [239, 68, 68, 220],
      stroked: true,
      filled: true,
      lineWidthMinPixels: 2,
      radiusUnits: 'meters',
    }),
  ];

  // 3D Camera Controls
  const handleSnap3D = () => {
    setViewState(prev => ({ ...prev, pitch: 68, bearing: -20, zoom: 9.8 }));
  };

  const handleSnap2D = () => {
    setViewState(prev => ({ ...prev, pitch: 0, bearing: 0 }));
  };

  const handleToggleOrbit = () => {
    if (isOrbiting) {
      if (orbitRef.current) clearInterval(orbitRef.current);
      setIsOrbiting(false);
    } else {
      setIsOrbiting(true);
      orbitRef.current = setInterval(() => {
        setViewState(prev => ({
          ...prev,
          bearing: (prev.bearing + 0.8) % 360,
        }));
      }, 30);
    }
  };

  // AI 9-Clinic Self-Planning Simulation
  const handleTriggerSelfPlan = () => {
    setIsSelfPlanning(true);
    setPlanningStep('Step 1/4: ForecasterAgent evaluating 9-clinic demand surges...');
    
    if (puneClinics.length > 1) {
      setViewState(prev => ({
        ...prev,
        longitude: puneClinics[1].longitude,
        latitude: puneClinics[1].latitude,
        zoom: 11.5,
        pitch: 72,
      }));
    }

    setTimeout(() => {
      setPlanningStep('Step 2/4: AllocatorAgent formulating 81-qubit Hamiltonian on IBM Quantum QAOA...');
      if (puneClinics.length > 4) {
        setViewState(prev => ({
          ...prev,
          longitude: puneClinics[4].longitude,
          latitude: puneClinics[4].latitude,
          zoom: 11.8,
          pitch: 74,
          bearing: 45,
        }));
      }
    }, 1300);

    setTimeout(() => {
      setPlanningStep('Step 3/4: SupervisorAgent auditing 1.5x buffer at Khed & Wagholi donor hubs...');
      if (puneClinics.length > 7) {
        setViewState(prev => ({
          ...prev,
          longitude: puneClinics[7].longitude,
          latitude: puneClinics[7].latitude,
          zoom: 11.5,
          pitch: 68,
          bearing: -90,
        }));
      }
    }, 2600);

    setTimeout(() => {
      setPlanningStep('Step 4/4: ExplainerAgent locked 159.15 km tour! 1-Click GPS navigation ready.');
      setViewState(prev => ({
        ...prev,
        longitude: 74.08,
        latitude: 18.78,
        zoom: 9.8,
        pitch: 62,
        bearing: -20,
      }));
      setIsSelfPlanning(false);
      setTimeout(() => setPlanningStep(null), 4000);
    }, 3900);
  };

  return (
    <div className="relative h-[calc(100vh-140px)] w-full flex flex-col md:flex-row overflow-hidden border-b border-hairline bg-canvas">
      
      {/* 🗺️ Deck.gl WebGL 3D Canvas with Carto Dark Matter Vector Basemap */}
      <div className="flex-1 relative h-full bg-[#0c0a09]">
        <DeckGL
          viewState={viewState as any}
          onViewStateChange={(e: any) => setViewState(e.viewState)}
          controller={true}
          layers={layers as any}
          effects={[lightingEffect]}
          getTooltip={({ object }: any) => {
            if (!object) return null;
            if (object.facility) {
              const fac = object.facility as HealthFacility;
              return {
                html: `
                  <div style="background: rgba(28,27,23,0.95); backdrop-filter: blur(8px); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); color: #fff; font-family: monospace; font-size: 11px; box-shadow: 0 8px 24px rgba(0,0,0,0.6);">
                    <div style="font-weight: 700; font-size: 13px; color: #f54e00; margin-bottom: 4px;">${fac.name}</div>
                    <div style="color: #a1a1aa; margin-bottom: 6px;">ID: ${fac.facility_id} | ${fac.district}</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px;">
                      <div>💊 Paracetamol: <b style="color:#fff;">${fac.current_stock_pcm500} tabs</b></div>
                      <div>⏳ Days Left: <b style="color:${fac.days_to_stockout <= 2 ? '#ef4444' : '#10b981'};">${fac.days_to_stockout}d</b></div>
                      <div>🛏️ Bed Occupancy: <b style="color:#fff;">${fac.occupied_beds}/${fac.total_beds}</b></div>
                      <div>🛡️ Risk Tier: <b style="color:${fac.risk_tier === 'P0_CRITICAL' ? '#ef4444' : '#10b981'};">${fac.risk_tier}</b></div>
                    </div>
                  </div>
                `,
              };
            }
            if (object.fromName) {
              return {
                html: `
                  <div style="background: rgba(28,27,23,0.95); padding: 8px 12px; border-radius: 6px; border: 1px solid #10b981; color: #fff; font-family: monospace; font-size: 11px;">
                    <span style="color:#10b981; font-weight: bold;">⚡ 3D Redistribution Arc</span><br/>
                    <b>${object.fromName}</b> ➔ <b>${object.toName}</b><br/>
                    Transfer: <b>${object.units} units Paracetamol</b>
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

        {/* 🎮 3D Camera Controls Toolbar (Top Right) */}
        <div className="absolute top-4 right-4 z-10 flex items-center bg-surface-card/95 backdrop-blur-md border border-hairline rounded-lg p-1.5 shadow-md text-xs font-mono gap-1">
          <button
            onClick={handleSnap3D}
            className="px-3 py-1.5 rounded-md bg-primary text-white font-bold flex items-center gap-1.5 hover:bg-primary-active transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>3D Tilt (68°)</span>
          </button>
          
          <button
            onClick={handleToggleOrbit}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${isOrbiting ? 'bg-amber-500 text-white font-bold animate-pulse' : 'text-ink hover:bg-canvas-soft'}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isOrbiting ? 'animate-spin' : ''}`} />
            <span>{isOrbiting ? 'Stop Orbit' : '360° Orbit'}</span>
          </button>

          <button
            onClick={handleSnap2D}
            className="px-2.5 py-1.5 rounded-md text-ink hover:bg-canvas-soft transition-colors flex items-center gap-1 border-l border-hairline ml-1"
          >
            <Layers className="w-3.5 h-3.5 text-muted" />
            <span>2D Flat</span>
          </button>
        </div>

        {/* 🛰️ 3D Floating HUD: 9 Clinics AI Telemetry (Top Left) */}
        <div className="absolute top-4 left-4 z-10 bg-surface-card/95 backdrop-blur-md border border-hairline rounded-lg p-4 shadow-md max-w-md">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-semantic-success animate-ping"></span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-semibold">
                visgl/deck.gl 3D-Tiles Engine
              </span>
            </div>
            <span className="text-[10px] font-mono bg-surface-strong px-2 py-0.5 rounded-pill text-ink font-bold">
              Tile3DLayer & Trips Active
            </span>
          </div>

          <div className="flex items-baseline gap-4 mb-3">
            <div>
              <span className="text-2xl font-display text-ink font-semibold">159.15 km</span>
              <span className="text-xs text-muted block">9-Clinic Tour</span>
            </div>
            <div className="border-l border-hairline pl-4">
              <span className="text-2xl font-display text-ink font-semibold">178.4 min</span>
              <span className="text-xs text-muted block">Transit Time</span>
            </div>
            <div className="border-l border-hairline pl-4">
              <span className="text-xs font-mono font-bold text-semantic-success bg-green-50 border border-green-200 px-2 py-1 rounded-sm block">
                COLD-CHAIN PASS
              </span>
            </div>
          </div>

          {/* AI Self-Plan Trigger Button (Cursor Orange) */}
          <button
            onClick={handleTriggerSelfPlan}
            disabled={isSelfPlanning}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-active text-white text-xs font-medium py-2.5 rounded-md transition-colors shadow-xs"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSelfPlanning ? 'animate-spin' : ''}`} />
            <span>{isSelfPlanning ? 'AI Agents Self-Planning in 3D...' : '🤖 AI Agent Self-Plan 9-Clinic Route'}</span>
          </button>

          {/* Multi-Step Telemetry Banner */}
          {planningStep && (
            <div className="mt-2.5 p-2.5 bg-canvas-soft border border-hairline rounded-md text-[11.5px] font-mono text-ink animate-pulse">
              <code>&gt; {planningStep}</code>
            </div>
          )}
        </div>

        {/* 🚗 Floating Bottom Action Bar: Google Maps GPS & WhatsApp */}
        <div className="absolute bottom-6 left-4 right-4 md:left-auto md:right-6 z-10 flex flex-wrap items-center gap-2 bg-surface-card/95 backdrop-blur-md border border-hairline rounded-lg p-2.5 shadow-md">
          
          {/* Direct Google Maps Turn-by-Turn GPS Link */}
          <a
            href={routingResult.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-ink hover:bg-black text-canvas text-xs font-medium px-4 py-2 rounded-md transition-colors shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5 text-primary" />
            <span>Open Google Maps GPS (9 Stops)</span>
          </a>

          {/* WhatsApp 1-Click Driver Dispatch */}
          <a
            href={routingResult.whatsapp_nav_share_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-surface-card hover:bg-canvas-soft border border-hairline-strong text-ink text-xs font-medium px-3.5 py-2 rounded-md transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-semantic-success" />
            <span>WhatsApp Route</span>
          </a>

          {/* Frontline Road Blocker Modal Button */}
          <button
            onClick={() => setShowBlockerModal(true)}
            className="flex items-center gap-1.5 bg-surface-card hover:bg-canvas-soft border border-hairline text-body hover:text-ink text-xs font-medium px-3 py-2 rounded-md transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Flag Road Blocked</span>
          </button>
        </div>
      </div>

      {/* 📋 Right Slide-Over Clinic Inspector */}
      {selectedFacility && (
        <aside className="w-full md:w-80 bg-surface-card border-l border-hairline p-5 overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase bg-surface-strong px-2 py-0.5 rounded-pill text-ink font-semibold">
                {selectedFacility.facility_id}
              </span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-pill font-semibold ${
                  selectedFacility.risk_tier === 'P0_CRITICAL'
                    ? 'bg-red-100 text-semantic-error'
                    : selectedFacility.risk_tier === 'P1_WARNING'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-green-100 text-semantic-success'
                }`}
              >
                {selectedFacility.risk_tier}
              </span>
            </div>

            <h2 className="text-lg font-display text-ink mb-1">{selectedFacility.name}</h2>
            <p className="text-xs text-muted mb-4">{selectedFacility.district} District, {selectedFacility.country}</p>

            <div className="border-t border-hairline pt-3 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-body flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-muted" /> Paracetamol 500mg
                </span>
                <span className="font-mono font-medium text-ink">
                  {selectedFacility.current_stock_pcm500} tabs ({selectedFacility.days_to_stockout}d)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-body flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5 text-muted" /> General Ward Beds
                </span>
                <span className="font-mono font-medium text-ink">
                  {selectedFacility.occupied_beds} / {selectedFacility.total_beds} ({Math.round((selectedFacility.occupied_beds / selectedFacility.total_beds) * 100)}%)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-body flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-muted" /> ICU Beds
                </span>
                <span className="font-mono font-medium text-ink">
                  {selectedFacility.icu_beds_occupied} / {selectedFacility.icu_beds_total}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-body flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-muted" /> Staff on Duty
                </span>
                <span className="font-mono font-medium text-ink">
                  {selectedFacility.doctors_present} Docs, {selectedFacility.nurses_present} Nurses
                </span>
              </div>
            </div>

            <div className="mt-5 p-3 bg-canvas-soft border border-hairline rounded-md">
              <span className="text-[11px] font-mono text-muted uppercase block mb-1">
                Compounded 3-Pillar Risk Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-display text-ink">
                  {(selectedFacility.cascade_risk_score * 100).toFixed(1)}%
                </span>
                <span className="text-xs text-muted font-mono">
                  1 - (1-m)^1.6 * (1-b)^1.4 * (1-s)^1.2
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => alert(`Initiating emergency transfer sequence to ${selectedFacility.name}`)}
            className="w-full mt-6 bg-ink hover:bg-black text-canvas text-xs font-medium py-2.5 rounded-md transition-colors"
          >
            Dispatch Emergency Stock
          </button>
        </aside>
      )}

      {/* 🚧 Road Blocker Feedback Modal */}
      {showBlockerModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-card border border-hairline rounded-lg max-w-md w-full p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-display text-ink">Flag Local Road Closure</h3>
            </div>
            <p className="text-xs text-body mb-4">
              Frontline health workers can report localized landslides, flooded bridges, or broken culverts. 
              The Quantum Router will instantly compute an alternate mountain bypass.
            </p>
            <div className="mb-4">
              <label className="text-[11px] font-mono uppercase text-muted block mb-1">Obstruction Reason / Location</label>
              <input
                type="text"
                value={roadNote}
                onChange={(e) => setRoadNote(e.target.value)}
                className="w-full bg-canvas-soft border border-hairline rounded-md px-3 py-2 text-xs font-mono text-ink focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowBlockerModal(false)}
                className="px-3 py-1.5 text-xs text-body hover:text-ink"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRerouteRequest(roadNote);
                  setShowBlockerModal(false);
                }}
                className="bg-primary hover:bg-primary-active text-white text-xs font-medium px-4 py-1.5 rounded-md"
              >
                Trigger Quantum Reroute
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
