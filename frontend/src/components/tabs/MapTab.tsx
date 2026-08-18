import React, { useState, useEffect, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { PolygonLayer, ArcLayer, PathLayer, ScatterplotLayer } from '@deck.gl/layers';
import { TripsLayer, Tile3DLayer } from '@deck.gl/geo-layers';
import { I3SLoader } from '@loaders.gl/i3s';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';

import { Navigation, Send, AlertTriangle, Bed, Users, Pill, ShieldAlert, Sparkles, Building2, Box, Globe } from 'lucide-react';
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

// Official ArcGIS I3S 3D Building Stream Layer URL
const I3S_3D_BUILDINGS_URL =
  'https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/SanFrancisco_Bldgs/SceneServer/layers/0';

// Initial ViewState for Pune Healthcare 3D Fleet Twin (Default)
const PUNE_INITIAL_VIEW_STATE = {
  longitude: 74.08,
  latitude: 18.78,
  zoom: 9.8,
  pitch: 60,
  bearing: -18,
  maxPitch: 85,
  minZoom: 5,
  maxZoom: 22,
};

// Initial ViewState for 3D Urban Mesh
const URBAN_MESH_VIEW_STATE = {
  latitude: 37.765,
  longitude: -122.44,
  zoom: 14.2,
  pitch: 58,
  bearing: 42,
  maxPitch: 85,
  minZoom: 10,
  maxZoom: 22,
};

// 3D Architectural Hospital Campus Footprint Generator
function generateCampusComplex(lng: number, lat: number, isP0: boolean, isP1: boolean) {
  const scale = 0.007;
  const baseColor: [number, number, number, number] = isP0 
    ? [239, 68, 68, 235] 
    : isP1 
    ? [245, 158, 11, 235] 
    : [16, 185, 129, 235];

  const mainWard = [
    [lng - scale, lat - scale * 0.7],
    [lng + scale, lat - scale * 0.7],
    [lng + scale, lat + scale * 0.7],
    [lng - scale, lat + scale * 0.7],
    [lng - scale, lat - scale * 0.7],
  ];

  const emergencyICU = [
    [lng + scale * 1.1, lat - scale * 0.4],
    [lng + scale * 1.85, lat - scale * 0.4],
    [lng + scale * 1.85, lat + scale * 0.55],
    [lng + scale * 1.1, lat + scale * 0.55],
    [lng + scale * 1.1, lat - scale * 0.4],
  ];

  const vaccineVault = [
    [lng - scale * 1.85, lat - scale * 0.5],
    [lng - scale * 1.1, lat - scale * 0.5],
    [lng - scale * 1.1, lat + scale * 0.35],
    [lng - scale * 1.85, lat + scale * 0.35],
    [lng - scale * 1.85, lat - scale * 0.5],
  ];

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
  facilities = [],
  routingResult,
  onFacilitySelect,
  selectedFacility,
  onRerouteRequest,
}) => {
  const [activeMode, setActiveMode] = useState<'PUNE_FLEET' | 'URBAN_MESH'>('PUNE_FLEET');
  const [viewState, setViewState] = useState(PUNE_INITIAL_VIEW_STATE);

  const [time, setTime] = useState(0);
  const [isSelfPlanning, setIsSelfPlanning] = useState(false);
  const [planningStep, setPlanningStep] = useState<string | null>(null);
  const [showBlockerModal, setShowBlockerModal] = useState(false);
  const [roadNote, setRoadNote] = useState('Ghod River Bridge Submerged (Rainfall >45mm)');

  // Pune District Clinics
  const puneClinics = (facilities || []).filter(f => f.country === 'IND');

  // Generate 800+ Point Dense Winding Highway Spline
  const splineData = useMemo(() => {
    if (puneClinics.length === 0) return { pathWithTimestamps: [], denseLineCoordinates: [] };
    const rawWaypoints = puneClinics.map(f => [f.longitude, f.latitude] as [number, number]);
    return generateDenseHighwaySpline(rawWaypoints, 75);
  }, [puneClinics]);

  const loopLength = splineData.pathWithTimestamps.length > 0 
    ? splineData.pathWithTimestamps[splineData.pathWithTimestamps.length - 1][2] 
    : 1800;

  // 60fps Continuous Clock for TripsLayer
  useEffect(() => {
    let curTime = 0;
    let animId: number;
    const animate = () => {
      curTime = (curTime + 3.0) % (loopLength || 1800);
      setTime(curTime);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
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

  // 2. 3D Trips Data with Dense Road Timestamps
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
  const layers = useMemo(() => {
    if (activeMode === 'URBAN_MESH') {
      return [
        new Tile3DLayer({
          id: 'tile-3d-i3s-layer',
          data: I3S_3D_BUILDINGS_URL,
          loaders: [I3SLoader],
          loadOptions: {
            i3s: { useCompressedTextures: false },
          },
          opacity: 0.96,
          pickable: true,
        }),
      ];
    }

    // Default: Pune Healthcare 3D Fleet Twin
    return [
      // Layer 1: Dense Highway Route Glow Ribbon
      new PathLayer({
        id: 'dense-highway-glow',
        data: [{ path: splineData.denseLineCoordinates }],
        getPath: (d: any) => d.path,
        getColor: [6, 182, 212, 120],
        getWidth: 700,
        widthUnits: 'meters',
        capRounded: true,
        jointRounded: true,
      }),

      // Layer 2: Animated TripsLayer (visgl/deck.gl Tron-Style Trails)
      new TripsLayer({
        id: 'quantum-trips-layer',
        data: trips,
        getPath: (d: any) => d.path,
        getTimestamps: (d: any) => d.timestamps,
        getColor: (d: any) => (d.vendor === 0 ? [253, 128, 93] : [23, 184, 190]),
        opacity: 0.95,
        widthMinPixels: 4,
        rounded: true,
        trailLength: 260,
        currentTime: time,
        shadowEnabled: false,
      }),

      // Layer 3: 3D Architectural Hospital Buildings
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
          if (info.object?.facility && onFacilitySelect) {
            onFacilitySelect(info.object.facility);
            setViewState(prev => ({
              ...prev,
              longitude: info.object.facility.longitude,
              latitude: info.object.facility.latitude,
              zoom: 13.5,
              pitch: 75,
            }));
          }
        },
      }),

      // Layer 4: 3D Parabolic Transfer Arcs
      new ArcLayer({
        id: '3d-transfer-arcs',
        data: arcs,
        getSourcePosition: (d: any) => d.from,
        getTargetPosition: (d: any) => d.to,
        getSourceColor: [23, 184, 190, 240],
        getTargetColor: [253, 128, 93, 240],
        getWidth: 4.5,
        getHeight: 0.65,
        pickable: true,
      }),

      // Layer 5: Ground Pulsing Radar Rings
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
  }, [activeMode, splineData, trips, buildings, arcs, puneClinics, time, onFacilitySelect]);

  // Mode Switchers
  const handleSwitchToPuneFleet = () => {
    setActiveMode('PUNE_FLEET');
    setViewState(PUNE_INITIAL_VIEW_STATE);
  };

  const handleSwitchToUrbanMesh = () => {
    setActiveMode('URBAN_MESH');
    setViewState(URBAN_MESH_VIEW_STATE);
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

  return (
    <div className="relative h-[calc(100vh-140px)] w-full flex flex-col md:flex-row overflow-hidden border-b border-hairline bg-canvas">
      
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
            mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          />
        </DeckGL>

        {/* 🎮 Mode Switcher Toolbar (Top Right) */}
        <div className="absolute top-4 right-4 z-10 flex items-center bg-surface-card/95 backdrop-blur-md border border-hairline rounded-lg p-1.5 shadow-md text-xs font-mono gap-1">
          
          <button
            onClick={handleSwitchToPuneFleet}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors font-bold ${
              activeMode === 'PUNE_FLEET'
                ? 'bg-primary text-white shadow-xs'
                : 'text-ink hover:bg-canvas-soft'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Pune Healthcare Fleet Twin (3D)</span>
          </button>

          <button
            onClick={handleSwitchToUrbanMesh}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors font-bold ${
              activeMode === 'URBAN_MESH'
                ? 'bg-primary text-white shadow-xs'
                : 'text-ink hover:bg-canvas-soft'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>3D Urban Mesh</span>
          </button>
        </div>

        {/* 🏢 Mode Telemetry HUD (Top Left) */}
        {activeMode === 'URBAN_MESH' ? (
          <div className="absolute top-4 left-4 z-10 bg-[#1c1d21]/95 backdrop-blur-md border border-white/20 rounded-xl p-5 shadow-2xl max-w-sm text-white font-sans">
            <h2 className="text-base font-bold text-sky-400 mb-1.5 tracking-tight flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-400" />
              <span>3D Urban Infrastructure Digital Twin</span>
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed mb-4">
              Highly detailed LoD2 textured 3D buildings in I3S format, visualized with deck.gl's <b>Tile3DLayer</b>. Real-time spatial mesh streaming for urban healthcare facility intelligence.
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[11px] text-zinc-400 font-mono">
              <span className="flex items-center gap-1 text-zinc-300">
                <Globe className="w-3.5 h-3.5 text-sky-400" /> ESRI ArcGIS SceneServer
              </span>
              <span className="text-sky-400 font-semibold">LoD2 Mesh Active</span>
            </div>
          </div>
        ) : (
          /* 🛰️ Pune Healthcare Fleet Telemetry HUD (Default View) */
          <div className="absolute top-4 left-4 z-10 bg-surface-card/95 backdrop-blur-md border border-hairline rounded-lg p-4 shadow-md max-w-md">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-semantic-success animate-ping"></span>
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-semibold">
                  Deck.gl 3D Fleet Twin
                </span>
              </div>
              <span className="text-[10px] font-mono bg-surface-strong px-2 py-0.5 rounded-pill text-ink font-bold">
                Spline & 3D Campus
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

            <button
              onClick={handleTriggerSelfPlan}
              disabled={isSelfPlanning}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-active text-white text-xs font-medium py-2.5 rounded-md transition-colors shadow-xs"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isSelfPlanning ? 'animate-spin' : ''}`} />
              <span>{isSelfPlanning ? 'AI Agents Self-Planning in 3D...' : 'AI Agent Self-Plan 9-Clinic Route'}</span>
            </button>

            {planningStep && (
              <div className="mt-2.5 p-2.5 bg-canvas-soft border border-hairline rounded-md text-[11.5px] font-mono text-ink animate-pulse">
                <code>&gt; {planningStep}</code>
              </div>
            )}
          </div>
        )}

        {/* 🚗 Floating Bottom Action Bar: Google Maps GPS & WhatsApp (For Pune Fleet) */}
        {activeMode === 'PUNE_FLEET' && routingResult && (
          <div className="absolute bottom-6 left-4 right-4 md:left-auto md:right-6 z-10 flex flex-wrap items-center gap-2 bg-surface-card/95 backdrop-blur-md border border-hairline rounded-lg p-2.5 shadow-md">
            
            <a
              href={routingResult.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-ink hover:bg-black text-canvas text-xs font-medium px-4 py-2 rounded-md transition-colors shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5 text-primary" />
              <span>Open Google Maps GPS (9 Stops)</span>
            </a>

            <a
              href={routingResult.whatsapp_nav_share_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-surface-card hover:bg-canvas-soft border border-hairline-strong text-ink text-xs font-medium px-3.5 py-2 rounded-md transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-semantic-success" />
              <span>WhatsApp Route</span>
            </a>

            <button
              onClick={() => setShowBlockerModal(true)}
              className="flex items-center gap-1.5 bg-surface-card hover:bg-canvas-soft border border-hairline text-body hover:text-ink text-xs font-medium px-3 py-2 rounded-md transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Flag Road Blocked</span>
            </button>
          </div>
        )}
      </div>

      {/* 📋 Right Slide-Over Clinic Inspector */}
      {selectedFacility && activeMode === 'PUNE_FLEET' && (
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
                  if (onRerouteRequest) onRerouteRequest(roadNote);
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
