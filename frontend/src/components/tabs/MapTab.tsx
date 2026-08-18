import React, { useState, useEffect, useRef } from 'react';
import DeckGL from '@deck.gl/react';
import { ColumnLayer, ArcLayer, PathLayer, ScatterplotLayer } from '@deck.gl/layers';
import { Navigation, Send, AlertTriangle, CheckCircle2, Bed, Users, Pill, ShieldAlert, Sparkles, RefreshCw, Layers, Compass, Satellite, Mountain } from 'lucide-react';
import { HealthFacility, RoutingResult } from '../../types';

interface MapTabProps {
  facilities: HealthFacility[];
  routingResult: RoutingResult;
  onFacilitySelect: (facility: HealthFacility) => void;
  selectedFacility: HealthFacility | null;
  onRerouteRequest: (blockedRoadName: string) => void;
}

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
  maxPitch?: number;
  minZoom?: number;
  maxZoom?: number;
}

export const MapTab: React.FC<MapTabProps> = ({
  facilities,
  routingResult,
  onFacilitySelect,
  selectedFacility,
  onRerouteRequest,
}) => {
  const [viewState, setViewState] = useState<ViewState>({
    longitude: 74.08,
    latitude: 18.78,
    zoom: 9.8,
    pitch: 62, // 3D Camera Tilt (62 degrees)
    bearing: -20, // 3D Perspective Rotation
    maxPitch: 85,
    minZoom: 6,
    maxZoom: 18,
  });

  const [showBlockerModal, setShowBlockerModal] = useState(false);
  const [roadNote, setRoadNote] = useState('Ghod River Bridge Submerged (Rainfall >45mm)');
  const [isSelfPlanning, setIsSelfPlanning] = useState(false);
  const [planningStep, setPlanningStep] = useState<string | null>(null);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [vehicleProgress, setVehicleProgress] = useState(0);
  const [activeSegment, setActiveSegment] = useState(0);
  
  const orbitRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);

  // 9 Pune District Clinics + 1 Central Depot Hub (10 Nodes)
  const puneClinics = facilities.filter(f => f.country === 'IND');

  // Generate 3D Column Towers Data
  const columnData = puneClinics.map((fac, idx) => {
    const isP0 = fac.risk_tier === 'P0_CRITICAL';
    const isP1 = fac.risk_tier === 'P1_WARNING';
    const elevation = isP0 ? 12000 : isP1 ? 7000 : 16000;
    const color: [number, number, number, number] = isP0 
      ? [239, 68, 68, 225]   // Red
      : isP1 
      ? [245, 158, 11, 225]  // Amber
      : [16, 185, 129, 225]; // Emerald

    return {
      facility: fac,
      position: [fac.longitude, fac.latitude],
      elevation,
      color,
      name: `${idx + 1}. ${fac.name}`,
    };
  });

  // Generate 3D Parabolic Arcs from Surplus Donors (Shirur & Khed) to Deficit Recipients
  const donorShirur = puneClinics.find(f => f.facility_id === 'PHC-PUN-001') || puneClinics[0];
  const donorKhed = puneClinics.find(f => f.facility_id === 'PHC-PUN-008') || puneClinics[7];
  const recipients = puneClinics.filter(f => f.risk_tier === 'P0_CRITICAL');

  const arcData = recipients.map(rec => ({
    from: [donorKhed?.longitude || 73.9015, donorKhed?.latitude || 18.8471],
    to: [rec.longitude, rec.latitude],
    sourceColor: [16, 185, 129, 240] as [number, number, number, number],
    targetColor: [239, 68, 68, 240] as [number, number, number, number],
  }));

  // Route Path Coordinates
  const routeCoordinates = puneClinics.map(f => [f.longitude, f.latitude]);
  if (routeCoordinates.length > 0) routeCoordinates.push(routeCoordinates[0]);

  const pathData = [
    {
      path: routeCoordinates,
      color: [245, 78, 0, 240] as [number, number, number, number], // Cursor Orange
    },
  ];

  // Continuous 30fps vehicle transit animation loop
  useEffect(() => {
    if (routeCoordinates.length < 2) return;

    let segment = 0;
    let prog = 0;
    const speed = 0.008;

    const runLoop = () => {
      prog += speed;
      if (prog >= 1) {
        prog = 0;
        segment = (segment + 1) % (routeCoordinates.length - 1);
      }
      setVehicleProgress(prog);
      setActiveSegment(segment);
      animFrameRef.current = requestAnimationFrame(runLoop);
    };

    animFrameRef.current = requestAnimationFrame(runLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [facilities]);

  // Compute live vehicle coordinate
  const p1 = routeCoordinates[activeSegment] || routeCoordinates[0] || [74.08, 18.78];
  const p2 = routeCoordinates[activeSegment + 1] || routeCoordinates[0] || [74.08, 18.78];
  const vehicleLng = p1[0] + (p2[0] - p1[0]) * vehicleProgress;
  const vehicleLat = p1[1] + (p2[1] - p1[1]) * vehicleProgress;

  const vehicleScatterData = [
    {
      position: [vehicleLng, vehicleLat],
      radius: 1200,
      color: [245, 78, 0, 255] as [number, number, number, number],
    },
    {
      position: [vehicleLng, vehicleLat],
      radius: 2800,
      color: [245, 78, 0, 80] as [number, number, number, number],
    },
  ];

  // 3D Deck.gl Layers Definition
  const layers = [
    // 1. 3D Neon Route Path Ribbon
    new PathLayer({
      id: 'route-path-layer',
      data: pathData,
      getPath: (d: any) => d.path,
      getColor: (d: any) => d.color,
      getWidth: 800, // 800 meters wide glowing path
      widthUnits: 'meters',
      capRounded: true,
      jointRounded: true,
    }),

    // 2. 3D Parabolic Leaping Arcs in Space
    new ArcLayer({
      id: 'quantum-arcs-layer',
      data: arcData,
      getSourcePosition: (d: any) => d.from,
      getTargetPosition: (d: any) => d.to,
      getSourceColor: (d: any) => d.sourceColor,
      getTargetColor: (d: any) => d.targetColor,
      getWidth: 5,
      getHeight: 0.6, // High 3D parabolic trajectory
    }),

    // 3. True 3D Extruded Cylindrical Pillars at Each Clinic
    new ColumnLayer({
      id: 'clinic-3d-towers',
      data: columnData,
      diskResolution: 12,
      radius: 1500, // 1.5km radius 3D column
      extruded: true,
      pickable: true,
      elevationScale: 1,
      getPosition: (d: any) => d.position,
      getFillColor: (d: any) => d.color,
      getElevation: (d: any) => d.elevation,
      onClick: (info: any) => {
        if (info.object?.facility) {
          onFacilitySelect(info.object.facility);
          setViewState(prev => ({
            ...prev,
            longitude: info.object.facility.longitude,
            latitude: info.object.facility.latitude,
            zoom: 11.2,
            pitch: 68,
            duration: 1000,
          }));
        }
      },
    }),

    // 4. Animated 3D Vehicle Position Beacon
    new ScatterplotLayer({
      id: 'vehicle-beacon-layer',
      data: vehicleScatterData,
      getPosition: (d: any) => d.position,
      getRadius: (d: any) => d.radius,
      getFillColor: (d: any) => d.color,
      radiusUnits: 'meters',
    }),
  ];

  // Camera Orbit Handler
  const handleToggleOrbit = () => {
    if (isOrbiting) {
      if (orbitRef.current) clearInterval(orbitRef.current);
      setIsOrbiting(false);
    } else {
      setIsOrbiting(true);
      orbitRef.current = setInterval(() => {
        setViewState(prev => ({
          ...prev,
          bearing: (prev.bearing + 1) % 360,
        }));
      }, 40);
    }
  };

  const handleSnap3D = () => {
    setViewState(prev => ({ ...prev, pitch: 68, bearing: -20, zoom: 9.8 }));
  };

  const handleSnap2D = () => {
    setViewState(prev => ({ ...prev, pitch: 0, bearing: 0 }));
  };

  // AI Agent Self-Planning Simulation
  const handleTriggerSelfPlan = () => {
    setIsSelfPlanning(true);
    setPlanningStep('Step 1/4: ForecasterAgent evaluating 9-clinic demand surges...');
    
    if (puneClinics.length > 1) {
      setViewState(prev => ({
        ...prev,
        longitude: puneClinics[1].longitude,
        latitude: puneClinics[1].latitude,
        zoom: 11,
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
          zoom: 11.2,
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
          zoom: 11,
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
      
      {/* 🗺️ Deck.gl WebGL 3D Canvas Viewport */}
      <div className="flex-1 relative h-full bg-[#12110e]">
        <DeckGL
          viewState={viewState as any}
          onViewStateChange={(e: any) => setViewState(e.viewState)}
          controller={true}
          layers={layers as any}
          getCursor={() => 'crosshair'}
        />

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
                deck.gl 3D WebGL Engine
              </span>
            </div>
            <span className="text-[10px] font-mono bg-surface-strong px-2 py-0.5 rounded-pill text-ink font-bold">
              3D Column & Arc Layers
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
