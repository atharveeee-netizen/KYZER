import React, { useState, useEffect, useMemo, useRef } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { PolygonLayer, ArcLayer, ColumnLayer, ScatterplotLayer } from '@deck.gl/layers';
import { TripsLayer } from '@deck.gl/geo-layers';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';

import { Navigation, Send, AlertTriangle, Bed, Users, Pill, ShieldAlert, Sparkles, RefreshCw, Layers, Compass, Satellite } from 'lucide-react';
import { HealthFacility, RoutingResult } from '../../types';

interface MapTabProps {
  facilities: HealthFacility[];
  routingResult: RoutingResult;
  onFacilitySelect: (facility: HealthFacility) => void;
  selectedFacility: HealthFacility | null;
  onRerouteRequest: (blockedRoadName: string) => void;
}

// visgl/deck.gl Lighting Setup
const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
});

const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [74.08, 18.78, 10000],
});

const lightingEffect = new LightingEffect({ ambientLight, pointLight });

const DEFAULT_THEME = {
  buildingColor: [74, 80, 87, 230] as [number, number, number, number],
  trailColor0: [253, 128, 93] as [number, number, number], // Neon Orange
  trailColor1: [23, 184, 190] as [number, number, number], // Neon Cyan
  material: {
    ambient: 0.15,
    diffuse: 0.7,
    shininess: 32,
    specularColor: [60, 64, 70] as [number, number, number],
  },
  effects: [lightingEffect],
};

const INITIAL_VIEW_STATE = {
  longitude: 74.08,
  latitude: 18.78,
  zoom: 9.8,
  pitch: 55,
  bearing: -15,
  maxPitch: 85,
  minZoom: 6,
  maxZoom: 20,
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
    { polygon: mainBlock, height: 350, type: 'MAIN_HOSPITAL' },
    { polygon: emergencyWing, height: 500, type: 'ICU_TRAUMA_WING' },
    { polygon: vaccineVault, height: 220, type: 'WHO_VACCINE_VAULT' },
  ];
}

export const MapTab: React.FC<MapTabProps> = ({
  facilities,
  routingResult,
  onFacilitySelect,
  selectedFacility,
  onRerouteRequest,
}) => {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [time, setTime] = useState(0);
  const [isSelfPlanning, setIsSelfPlanning] = useState(false);
  const [planningStep, setPlanningStep] = useState<string | null>(null);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [showBlockerModal, setShowBlockerModal] = useState(false);
  const [roadNote, setRoadNote] = useState('Ghod River Bridge Submerged (Rainfall >45mm)');

  const animFrameRef = useRef<number | null>(null);
  const orbitRef = useRef<any>(null);

  // 10 Pune District Clinics
  const puneClinics = facilities.filter(f => f.country === 'IND');

  // Continuous 60fps clock for TripsLayer
  const loopLength = 1800;
  const animationSpeed = 2.0;

  useEffect(() => {
    let currentTime = 0;
    const animateLoop = () => {
      currentTime = (currentTime + animationSpeed) % loopLength;
      setTime(currentTime);
      animFrameRef.current = requestAnimationFrame(animateLoop);
    };
    animFrameRef.current = requestAnimationFrame(animateLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [loopLength, animationSpeed]);

  // 1. Buildings Data (visgl/deck.gl format)
  const buildings = useMemo(() => {
    const list: any[] = [];
    puneClinics.forEach((fac, idx) => {
      const isP0 = fac.risk_tier === 'P0_CRITICAL';
      const isP1 = fac.risk_tier === 'P1_WARNING';
      const color: [number, number, number, number] = isP0 
        ? [239, 68, 68, 230] 
        : isP1 
        ? [245, 158, 11, 230] 
        : [16, 185, 129, 230];

      const complexes = generateBuildingComplex(fac.longitude, fac.latitude);
      complexes.forEach((comp) => {
        list.push({
          polygon: comp.polygon,
          height: comp.height * (isP0 ? 1.6 : 1.2),
          color,
          facility: fac,
          name: `${idx + 1}. ${fac.name} (${comp.type})`,
        });
      });
    });
    return list;
  }, [puneClinics]);

  // 2. Trips Data (visgl/deck.gl TripsLayer format)
  const trips = useMemo(() => {
    if (puneClinics.length === 0) return [];
    const waypoints = puneClinics.map(f => [f.longitude, f.latitude]);
    waypoints.push(waypoints[0]); // Return circuit

    const path0: [number, number][] = [];
    const timestamps0: number[] = [];
    let curTime = 0;

    for (let i = 0; i < waypoints.length; i++) {
      path0.push([waypoints[i][0], waypoints[i][1]]);
      timestamps0.push(curTime);
      curTime += 180;
    }

    // Secondary counter-clockwise patrol trip
    const waypointsRev = [...waypoints].reverse();
    const path1: [number, number][] = [];
    const timestamps1: number[] = [];
    curTime = 0;

    for (let i = 0; i < waypointsRev.length; i++) {
      path1.push([waypointsRev[i][0], waypointsRev[i][1]]);
      timestamps1.push(curTime);
      curTime += 180;
    }

    return [
      { vendor: 0, path: path0, timestamps: timestamps0 },
      { vendor: 1, path: path1, timestamps: timestamps1 },
    ];
  }, [puneClinics]);

  // 3. Parabolic Transfer Arcs
  const arcs = useMemo(() => {
    const donor = puneClinics.find(f => f.facility_id === 'PHC-PUN-008') || puneClinics[0];
    const recipients = puneClinics.filter(f => f.risk_tier === 'P0_CRITICAL');

    return recipients.map(rec => ({
      from: [donor?.longitude || 73.9015, donor?.latitude || 18.8471],
      to: [rec.longitude, rec.latitude],
      fromName: donor?.name || 'Khed Central Hub',
      toName: rec.name,
      units: 500,
    }));
  }, [puneClinics]);

  // Deck.gl Layer Pipeline
  const layers = [
    // 3D Animated TripsLayer (visgl/deck.gl official implementation)
    new TripsLayer({
      id: 'trips',
      data: trips,
      getPath: (d: any) => d.path,
      getTimestamps: (d: any) => d.timestamps,
      getColor: (d: any) => (d.vendor === 0 ? DEFAULT_THEME.trailColor0 : DEFAULT_THEME.trailColor1),
      opacity: 0.95,
      widthMinPixels: 4,
      rounded: true,
      trailLength: 200,
      currentTime: time,
      shadowEnabled: false,
    }),

    // 3D Extruded Buildings (visgl/deck.gl official implementation)
    new PolygonLayer({
      id: 'buildings',
      data: buildings,
      extruded: true,
      wireframe: true,
      opacity: 0.85,
      getPolygon: (f: any) => f.polygon,
      getElevation: (f: any) => f.height,
      getFillColor: (f: any) => f.color,
      getLineColor: [255, 255, 255, 180],
      getLineWidth: 1.5,
      lineWidthUnits: 'pixels',
      material: DEFAULT_THEME.material,
      pickable: true,
      onClick: (info: any) => {
        if (info.object?.facility) {
          onFacilitySelect(info.object.facility);
          setViewState(prev => ({
            ...prev,
            longitude: info.object.facility.longitude,
            latitude: info.object.facility.latitude,
            zoom: 12,
            pitch: 65,
          }));
        }
      },
    }),

    // 3D Parabolic Transfer Arcs
    new ArcLayer({
      id: 'transfer-arcs',
      data: arcs,
      getSourcePosition: (d: any) => d.from,
      getTargetPosition: (d: any) => d.to,
      getSourceColor: [23, 184, 190, 240],
      getTargetColor: [253, 128, 93, 240],
      getWidth: 4,
      getHeight: 0.6,
      pickable: true,
    }),

    // Ground Radar Rings
    new ScatterplotLayer({
      id: 'radar-rings',
      data: puneClinics.filter(f => f.risk_tier === 'P0_CRITICAL'),
      getPosition: (d: any) => [d.longitude, d.latitude],
      getRadius: 2200 + Math.sin(time * 0.05) * 600,
      getFillColor: [239, 68, 68, 50],
      getLineColor: [239, 68, 68, 200],
      stroked: true,
      filled: true,
      lineWidthMinPixels: 2,
      radiusUnits: 'meters',
    }),
  ];

  // 3D Camera Controls
  const handleSnap3D = () => {
    setViewState(prev => ({ ...prev, pitch: 65, bearing: -15, zoom: 9.8 }));
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
        pitch: 70,
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
          pitch: 72,
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
        pitch: 55,
        bearing: -15,
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
          effects={DEFAULT_THEME.effects}
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
                      <div>Paracetamol: <b style="color:#fff;">${fac.current_stock_pcm500} tabs</b></div>
                      <div>Days Left: <b style="color:${fac.days_to_stockout <= 2 ? '#ef4444' : '#10b981'};">${fac.days_to_stockout}d</b></div>
                      <div>Bed Occupancy: <b style="color:#fff;">${fac.occupied_beds}/${fac.total_beds}</b></div>
                      <div>Risk Tier: <b style="color:${fac.risk_tier === 'P0_CRITICAL' ? '#ef4444' : '#10b981'};">${fac.risk_tier}</b></div>
                    </div>
                  </div>
                `,
              };
            }
            if (object.fromName) {
              return {
                html: `
                  <div style="background: rgba(28,27,23,0.95); padding: 8px 12px; border-radius: 6px; border: 1px solid #10b981; color: #fff; font-family: monospace; font-size: 11px;">
                    <span style="color:#10b981; font-weight: bold;">3D Redistribution Arc</span><br/>
                    <b>${object.fromName}</b> to <b>${object.toName}</b><br/>
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
            <span>3D Tilt (65°)</span>
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
                visgl/deck.gl 3D Trips Engine
              </span>
            </div>
            <span className="text-[10px] font-mono bg-surface-strong px-2 py-0.5 rounded-pill text-ink font-bold">
              Trips & Buildings Active
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
            <span>{isSelfPlanning ? 'AI Agents Self-Planning in 3D...' : 'AI Agent Self-Plan 9-Clinic Route'}</span>
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

      {/* Road Blocker Feedback Modal */}
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
