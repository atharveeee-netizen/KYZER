import React, { useState, useEffect, useMemo, useRef } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { PolygonLayer, ArcLayer, PathLayer, ScatterplotLayer, ColumnLayer } from '@deck.gl/layers';
import { TripsLayer } from '@deck.gl/geo-layers';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';

import { Navigation, Send, AlertTriangle, Bed, Users, Pill, ShieldAlert, Sparkles, RefreshCw, Layers, Compass, Satellite, Eye, ZoomIn, Building } from 'lucide-react';
import { HealthFacility, RoutingResult } from '../../types';
import { generateDenseHighwaySpline } from '../../data/denseRouteSpline';

interface MapTabProps {
  facilities: HealthFacility[];
  routingResult: RoutingResult;
  onFacilitySelect: (facility: HealthFacility) => void;
  selectedFacility: HealthFacility | null;
  onRerouteRequest: (blockedRoadName: string) => void;
}

// 3D Lighting Setup (visgl/deck.gl Official Specification)
const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.1,
});

const pointLight = new PointLight({
  color: [255, 245, 230],
  intensity: 2.2,
  position: [74.08, 18.78, 12000],
});

const lightingEffect = new LightingEffect({ ambientLight, pointLight });

const material = {
  ambient: 0.2,
  diffuse: 0.75,
  shininess: 38,
  specularColor: [80, 85, 95] as [number, number, number],
};

// 3D Architectural Hospital Campus Footprint Generator (Multi-Wing CAD Model)
function generateCampusComplex(lng: number, lat: number, isP0: boolean, isP1: boolean) {
  const scale = 0.007;
  const baseColor: [number, number, number, number] = isP0 
    ? [239, 68, 68, 235] 
    : isP1 
    ? [245, 158, 11, 235] 
    : [16, 185, 129, 235];

  // 1. Central Multi-Storey Inpatient Ward Block
  const mainWard = [
    [lng - scale, lat - scale * 0.7],
    [lng + scale, lat - scale * 0.7],
    [lng + scale, lat + scale * 0.7],
    [lng - scale, lat + scale * 0.7],
    [lng - scale, lat - scale * 0.7],
  ];

  // 2. Emergency Trauma & ICU Block
  const emergencyICU = [
    [lng + scale * 1.1, lat - scale * 0.4],
    [lng + scale * 1.85, lat - scale * 0.4],
    [lng + scale * 1.85, lat + scale * 0.55],
    [lng + scale * 1.1, lat + scale * 0.55],
    [lng + scale * 1.1, lat - scale * 0.4],
  ];

  // 3. WHO Cold-Chain Vaccine & Medicine Vault
  const vaccineVault = [
    [lng - scale * 1.85, lat - scale * 0.5],
    [lng - scale * 1.1, lat - scale * 0.5],
    [lng - scale * 1.1, lat + scale * 0.35],
    [lng - scale * 1.85, lat + scale * 0.35],
    [lng - scale * 1.85, lat - scale * 0.5],
  ];

  // 4. Ambulance & Delivery Bay Logistics Hub
  const deliveryBay = [
    [lng - scale * 0.7, lat - scale * 1.4],
    [lng + scale * 0.7, lat - scale * 1.4],
    [lng + scale * 0.7, lat - scale * 0.8],
    [lng - scale * 0.7, lat - scale * 0.8],
    [lng - scale * 0.7, lat - scale * 1.4],
  ];

  return [
    { polygon: mainWard, height: isP0 ? 420 : 300, color: baseColor, wing: 'Main Hospital Ward' },
    { polygon: emergencyICU, height: isP0 ? 580 : 400, color: [245, 78, 0, 240] as [number, number, number, number], wing: 'Emergency Trauma & ICU' },
    { polygon: vaccineVault, height: 220, color: [6, 182, 212, 240] as [number, number, number, number], wing: 'WHO Cold-Chain Vault' },
    { polygon: deliveryBay, height: 140, color: [74, 80, 87, 230] as [number, number, number, number], wing: 'Ambulance & Logistics Bay' },
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
    pitch: 60, // 3D Camera Tilt (60 degrees)
    bearing: -18,
    maxPitch: 85,
    minZoom: 5,
    maxZoom: 20,
  });

  const [time, setTime] = useState(0);
  const [isSelfPlanning, setIsSelfPlanning] = useState(false);
  const [planningStep, setPlanningStep] = useState<string | null>(null);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [basemapStyle, setBasemapStyle] = useState<'DARK' | 'SATELLITE'>('DARK');
  const [showBlockerModal, setShowBlockerModal] = useState(false);
  const [roadNote, setRoadNote] = useState('Ghod River Bridge Submerged (Rainfall >45mm)');

  const animFrameRef = useRef<number | null>(null);
  const orbitRef = useRef<any>(null);

  // 10 Pune District Clinics
  const puneClinics = facilities.filter(f => f.country === 'IND');

  // Generate 800+ Point Dense Winding Highway Spline
  const splineData = useMemo(() => {
    const rawWaypoints = puneClinics.map(f => [f.longitude, f.latitude] as [number, number]);
    return generateDenseHighwaySpline(rawWaypoints, 75);
  }, [puneClinics]);

  const loopLength = splineData.pathWithTimestamps.length > 0 
    ? splineData.pathWithTimestamps[splineData.pathWithTimestamps.length - 1][2] 
    : 1800;

  // 60fps Continuous Clock for TripsLayer Animated Neon Flow
  useEffect(() => {
    let curTime = 0;
    const animate = () => {
      curTime = (curTime + 3.0) % (loopLength || 1800);
      setTime(curTime);
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [loopLength]);

  // 1. 3D Architectural Hospital Buildings Data
  const buildings = useMemo(() => {
    const list: any[] = [];
    puneClinics.forEach((fac, idx) => {
      const isP0 = fac.risk_tier === 'P0_CRITICAL';
      const isP1 = fac.risk_tier === 'P1_WARNING';
      const wings = generateCampusComplex(fac.longitude, fac.latitude, isP0, isP1);
      
      wings.forEach(w => {
        list.push({
          polygon: w.polygon,
          height: w.height,
          color: w.color,
          facility: fac,
          name: `${idx + 1}. ${fac.name} (${w.wing})`,
        });
      });
    });
    return list;
  }, [puneClinics]);

  // 2. 3D Trips Data with Dense Road Timestamps (Dual Neon Trails)
  const trips = useMemo(() => {
    if (splineData.pathWithTimestamps.length === 0) return [];
    
    const path = splineData.pathWithTimestamps.map(p => [p[0], p[1]] as [number, number]);
    const timestamps = splineData.pathWithTimestamps.map(p => p[2]);

    return [
      { vendor: 0, path, timestamps },
      { vendor: 1, path: [...path].reverse(), timestamps },
    ];
  }, [splineData]);

  // 3. 3D Parabolic Transfer Arcs
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

  // 4. Deck.gl Layers Configuration
  const layers = [
    // Layer 1: Dense Highway Route Glow Ribbon (Underglow)
    new PathLayer({
      id: 'dense-highway-glow',
      data: [{ path: splineData.denseLineCoordinates }],
      getPath: (d: any) => d.path,
      getColor: [6, 182, 212, 120], // Neon Cyan Glow
      getWidth: 700,
      widthUnits: 'meters',
      capRounded: true,
      jointRounded: true,
    }),

    // Layer 2: visgl/deck.gl Animated TripsLayer (Tron-Style High-Speed Light Trail)
    new TripsLayer({
      id: 'quantum-trips-layer',
      data: trips,
      getPath: (d: any) => d.path,
      getTimestamps: (d: any) => d.timestamps,
      getColor: (d: any) => (d.vendor === 0 ? [253, 128, 93] : [23, 184, 190]), // Neon Orange / Cyan
      opacity: 0.95,
      widthMinPixels: 4,
      rounded: true,
      trailLength: 260,
      currentTime: time,
      shadowEnabled: false,
    }),

    // Layer 3: 3D Architectural Hospital Buildings with Real-Time Lighting
    new PolygonLayer({
      id: '3d-hospital-buildings',
      data: buildings,
      extruded: true,
      wireframe: true,
      filled: true,
      opacity: 0.88,
      getPolygon: (f: any) => f.polygon,
      getElevation: (f: any) => f.height,
      getFillColor: (f: any) => f.color,
      getLineColor: [255, 255, 255, 180],
      getLineWidth: 1.5,
      lineWidthUnits: 'pixels',
      material,
      pickable: true,
      onClick: (info: any) => {
        if (info.object?.facility) {
          onFacilitySelect(info.object.facility);
          // Micro Campus Drone Zoom (75° pitch, close range)
          setViewState(prev => ({
            ...prev,
            longitude: info.object.facility.longitude,
            latitude: info.object.facility.latitude,
            zoom: 13.5,
            pitch: 75,
            duration: 1400,
          }));
        }
      },
    }),

    // Layer 4: 3D Parabolic Transfer Arcs in Space
    new ArcLayer({
      id: '3d-transfer-arcs',
      data: arcs,
      getSourcePosition: (d: any) => d.from,
      getTargetPosition: (d: any) => d.to,
      getSourceColor: [23, 184, 190, 240],
      getTargetColor: [253, 128, 93, 240],
      getWidth: 4.5,
      getHeight: 0.65, // High 3D arch
      pickable: true,
    }),

    // Layer 5: Ground Pulsing Radar Rings at Critical Clinics
    new ScatterplotLayer({
      id: 'radar-rings',
      data: puneClinics.filter(f => f.risk_tier === 'P0_CRITICAL'),
      getPosition: (d: any) => [d.longitude, d.latitude],
      getRadius: 2400 + Math.sin(time * 0.05) * 800,
      getFillColor: [239, 68, 68, 45],
      getLineColor: [239, 68, 68, 220],
      stroked: true,
      filled: true,
      lineWidthMinPixels: 2,
      radiusUnits: 'meters',
    }),
  ];

  // Camera Controls
  const handleSnapMacro = () => {
    setViewState(prev => ({ ...prev, longitude: 74.08, latitude: 18.78, zoom: 9.8, pitch: 60, bearing: -18 }));
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

  // AI 9-Clinic Self-Planning Simulation (Sequential 3D Drone Flight)
  const handleTriggerSelfPlan = () => {
    setIsSelfPlanning(true);
    setPlanningStep('Step 1/4: ForecasterAgent evaluating 9-clinic demand surges...');
    
    if (puneClinics.length > 1) {
      setViewState(prev => ({
        ...prev,
        longitude: puneClinics[1].longitude,
        latitude: puneClinics[1].latitude,
        zoom: 12.5,
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
          zoom: 12.8,
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
          zoom: 12.5,
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
        pitch: 60,
        bearing: -18,
      }));
      setIsSelfPlanning(false);
      setTimeout(() => setPlanningStep(null), 4000);
    }, 3900);
  };

  const mapStyleUrl = basemapStyle === 'DARK'
    ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

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
                  <div style="background: rgba(24,24,27,0.96); backdrop-filter: blur(10px); padding: 10px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); color: #fff; font-family: monospace; font-size: 11px; box-shadow: 0 8px 24px rgba(0,0,0,0.7);">
                    <div style="font-weight: 700; font-size: 13px; color: #f54e00; margin-bottom: 3px;">${fac.name}</div>
                    <div style="color: #a1a1aa; margin-bottom: 6px;">ID: ${fac.facility_id} | ${fac.district} District</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 6px;">
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
                  <div style="background: rgba(24,24,27,0.96); padding: 8px 12px; border-radius: 6px; border: 1px solid #10b981; color: #fff; font-family: monospace; font-size: 11px;">
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
            mapStyle={mapStyleUrl}
          />
        </DeckGL>

        {/* 🎮 3D Camera Controls Toolbar (Top Right) */}
        <div className="absolute top-4 right-4 z-10 flex items-center bg-surface-card/95 backdrop-blur-md border border-hairline rounded-lg p-1.5 shadow-md text-xs font-mono gap-1">
          <button
            onClick={handleSnapMacro}
            className="px-3 py-1.5 rounded-md bg-primary text-white font-bold flex items-center gap-1.5 hover:bg-primary-active transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>District 3D (60°)</span>
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

          <button
            onClick={() => setBasemapStyle(prev => prev === 'DARK' ? 'SATELLITE' : 'DARK')}
            className="px-2.5 py-1.5 rounded-md text-ink hover:bg-canvas-soft transition-colors flex items-center gap-1 border-l border-hairline ml-1"
          >
            <Satellite className="w-3.5 h-3.5 text-primary" />
            <span>{basemapStyle === 'DARK' ? 'Voyager' : 'Dark Matter'}</span>
          </button>
        </div>

        {/* 🛰️ 3D Floating HUD: 9 Clinics AI Telemetry (Top Left) */}
        <div className="absolute top-4 left-4 z-10 bg-surface-card/95 backdrop-blur-md border border-hairline rounded-lg p-4 shadow-md max-w-md">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-semantic-success animate-ping"></span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-semibold">
                visgl/deck.gl 3D Fleet Twin
              </span>
            </div>
            <span className="text-[10px] font-mono bg-surface-strong px-2 py-0.5 rounded-pill text-ink font-bold">
              Dense Spline & 3D Campus
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
