import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { Navigation, Send, AlertTriangle, CheckCircle2, Bed, Users, Pill, ShieldAlert, Sparkles, MapPin, Zap, RefreshCw, Layers, Compass, Eye, Truck } from 'lucide-react';
import { HealthFacility, RoutingResult } from '../../types';

interface MapTabProps {
  facilities: HealthFacility[];
  routingResult: RoutingResult;
  onFacilitySelect: (facility: HealthFacility) => void;
  selectedFacility: HealthFacility | null;
  onRerouteRequest: (blockedRoadName: string) => void;
}

export const MapTab: React.FC<MapTabProps> = ({
  facilities,
  routingResult,
  onFacilitySelect,
  selectedFacility,
  onRerouteRequest,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const truckMarkerRef = useRef<maplibregl.Marker | null>(null);
  const [showBlockerModal, setShowBlockerModal] = useState(false);
  const [roadNote, setRoadNote] = useState('Ghod River Bridge Submerged (Rainfall >45mm)');
  const [isSelfPlanning, setIsSelfPlanning] = useState(false);
  const [planningStep, setPlanningStep] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState<'3D' | '2D' | 'ORBIT'>('3D');
  const [activeClinicIndex, setActiveClinicIndex] = useState<number>(0);

  // 9 Pune District Clinics + 1 Central Depot Hub (10 Nodes)
  const puneClinics = facilities.filter(f => f.country === 'IND');

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const defaultLat = facilities[0]?.latitude || 18.8285;
    const defaultLng = facilities[0]?.longitude || 74.3755;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json', // High-Tech 3D Dark Matter Basemap
      center: [74.08, 18.78],
      zoom: 9.8,
      pitch: 62, // 3D Camera Tilt (62 degrees)
      bearing: -18, // 3D Perspective Rotation
      antialias: true,
    });

    mapRef.current = map;

    map.on('load', () => {
      // 1. Add 3D Extruded Building Layer
      map.addLayer({
        id: '3d-buildings',
        source: 'carto',
        'source-layer': 'building',
        type: 'fill-extrusion',
        minzoom: 12,
        paint: {
          'fill-extrusion-color': '#1f2937',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.75,
        },
      });

      // 2. Add 9-Clinic Quantum Route
      const coordinates = puneClinics.map(f => [f.longitude, f.latitude]);
      if (coordinates.length > 0) coordinates.push(coordinates[0]);

      map.addSource('quantum-route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates,
          },
        },
      });

      // 3D Neon Cyan Glow Line
      map.addLayer({
        id: 'quantum-route-glow',
        type: 'line',
        source: 'quantum-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#06b6d4',
          'line-width': 10,
          'line-opacity': 0.35,
        },
      });

      // 3D Cursor Orange Solid Vector Line
      map.addLayer({
        id: 'quantum-route-line',
        type: 'line',
        source: 'quantum-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#f54e00',
          'line-width': 3.5,
          'line-opacity': 0.95,
        },
      });

      // 3. Render 3D Holographic Pins with Numbered Stops
      puneClinics.forEach((fac, idx) => {
        const el = document.createElement('div');
        el.className = 'custom-3d-pin cursor-pointer transform hover:scale-125 transition-all duration-300';

        const isP0 = fac.risk_tier === 'P0_CRITICAL';
        const isP1 = fac.risk_tier === 'P1_WARNING';
        const badgeColor = isP0 ? 'bg-red-500 text-white animate-pulse' : isP1 ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white';

        el.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));">
            <div style="background: #ffffff; color: #111827; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-family: monospace; font-weight: 700; border: 1px solid #e5e7eb; display: flex; align-items: center; gap: 4px;">
              <span class="${badgeColor}" style="width: 8px; height: 8px; border-radius: 9999px; display: inline-block;"></span>
              <span>${idx + 1}. ${fac.name.replace(' Primary Health Centre', '').replace(' Sub-District Hospital', '').replace(' Health Centre', '').replace(' Rural Hospital', '')}</span>
            </div>
            <div style="width: 2px; height: 14px; background: #f54e00;"></div>
            <div style="width: 6px; height: 6px; border-radius: 50%; background: #f54e00;"></div>
          </div>
        `;

        el.addEventListener('click', () => {
          onFacilitySelect(fac);
          map.flyTo({ center: [fac.longitude, fac.latitude], zoom: 11.5, pitch: 65, duration: 1200 });
        });

        new maplibregl.Marker({ element: el })
          .setLngLat([fac.longitude, fac.latitude])
          .addTo(map);
      });

      // 4. Add Animated 3D Delivery Vehicle Marker
      if (puneClinics.length > 0) {
        const truckEl = document.createElement('div');
        truckEl.innerHTML = `
          <div style="background: #f54e00; color: white; padding: 6px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 12px #f54e00; display: flex; align-items: center; justify-content: center;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14v10Z"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
          </div>
        `;
        const truckMarker = new maplibregl.Marker({ element: truckEl })
          .setLngLat([puneClinics[0].longitude, puneClinics[0].latitude])
          .addTo(map);
        truckMarkerRef.current = truckMarker;
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [facilities]);

  // Camera Mode Switchers
  const setCamera3D = () => {
    setCameraMode('3D');
    mapRef.current?.flyTo({ pitch: 62, bearing: -18, zoom: 9.8, duration: 1000 });
  };

  const setCamera2D = () => {
    setCameraMode('2D');
    mapRef.current?.flyTo({ pitch: 0, bearing: 0, duration: 1000 });
  };

  const setCameraOrbit = () => {
    setCameraMode('ORBIT');
    if (!mapRef.current) return;
    const currentBearing = mapRef.current.getBearing();
    mapRef.current.easeTo({ bearing: currentBearing + 90, pitch: 68, duration: 2500 });
  };

  // Autonomous 9-Clinic Self-Planning Simulation with Truck Transit
  const handleTriggerSelfPlan = () => {
    setIsSelfPlanning(true);
    setPlanningStep('Step 1/4: ForecasterAgent scanning 9-clinic demand surges...');
    
    // Fly to first clinic
    if (mapRef.current && puneClinics.length > 0) {
      mapRef.current.flyTo({ center: [puneClinics[1].longitude, puneClinics[1].latitude], zoom: 11, pitch: 65, duration: 1000 });
      truckMarkerRef.current?.setLngLat([puneClinics[1].longitude, puneClinics[1].latitude]);
    }

    setTimeout(() => {
      setPlanningStep('Step 2/4: AllocatorAgent formulating 81-qubit Hamiltonian on IBM Quantum...');
      if (mapRef.current && puneClinics.length > 3) {
        mapRef.current.flyTo({ center: [puneClinics[3].longitude, puneClinics[3].latitude], zoom: 11.2, pitch: 65, duration: 1200 });
        truckMarkerRef.current?.setLngLat([puneClinics[3].longitude, puneClinics[3].latitude]);
      }
    }, 1200);

    setTimeout(() => {
      setPlanningStep('Step 3/4: SupervisorAgent auditing 1.5x buffer at Khed & Wagholi donor hubs...');
      if (mapRef.current && puneClinics.length > 7) {
        mapRef.current.flyTo({ center: [puneClinics[7].longitude, puneClinics[7].latitude], zoom: 11, pitch: 65, duration: 1200 });
        truckMarkerRef.current?.setLngLat([puneClinics[7].longitude, puneClinics[7].latitude]);
      }
    }, 2400);

    setTimeout(() => {
      setPlanningStep('Step 4/4: ExplainerAgent locked 159.15 km tour! 1-Click GPS navigation ready.');
      if (mapRef.current) {
        mapRef.current.flyTo({ center: [74.08, 18.78], zoom: 9.8, pitch: 62, bearing: -18, duration: 1500 });
      }
      setIsSelfPlanning(false);
      setTimeout(() => setPlanningStep(null), 4000);
    }, 3600);
  };

  return (
    <div className="relative h-[calc(100vh-140px)] w-full flex flex-col md:flex-row overflow-hidden border-b border-hairline bg-canvas">
      
      {/* 🗺️ Main 3D Deck/MapLibre Viewport */}
      <div className="flex-1 relative h-full">
        <div ref={mapContainer} className="w-full h-full" />

        {/* 🎮 3D Camera Controls Toolbar (Top Right) */}
        <div className="absolute top-4 right-4 z-10 flex items-center bg-surface-card/95 backdrop-blur-md border border-hairline rounded-lg p-1 shadow-md text-xs font-mono">
          <button
            onClick={setCamera3D}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${cameraMode === '3D' ? 'bg-primary text-white font-bold' : 'text-ink hover:bg-canvas-soft'}`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>3D Aerial (62°)</span>
          </button>
          <button
            onClick={setCamera2D}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${cameraMode === '2D' ? 'bg-primary text-white font-bold' : 'text-ink hover:bg-canvas-soft'}`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Top-Down (2D)</span>
          </button>
          <button
            onClick={setCameraOrbit}
            className="px-3 py-1.5 rounded-md flex items-center gap-1.5 text-ink hover:bg-canvas-soft transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-muted" />
            <span>360° Orbit</span>
          </button>
        </div>

        {/* 🛰️ 3D Floating HUD: 9 Clinics AI Telemetry (Top Left) */}
        <div className="absolute top-4 left-4 z-10 bg-surface-card/95 backdrop-blur-md border border-hairline rounded-lg p-4 shadow-md max-w-md">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-semantic-success animate-ping"></span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-semibold">
                3D Autonomous Fleet Navigator
              </span>
            </div>
            <span className="text-[10px] font-mono bg-surface-strong px-2 py-0.5 rounded-pill text-ink font-bold">
              9 Clinics + 1 Central Depot
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
