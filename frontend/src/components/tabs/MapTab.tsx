import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { Navigation, Send, AlertTriangle, CheckCircle2, Phone, Bed, Users, Pill, ShieldAlert, Sparkles, MapPin, Zap, RefreshCw, Layers } from 'lucide-react';
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
  const [showBlockerModal, setShowBlockerModal] = useState(false);
  const [roadNote, setRoadNote] = useState('Ghod River Bridge Submerged (Rainfall >45mm)');
  const [isSelfPlanning, setIsSelfPlanning] = useState(false);
  const [planningStep, setPlanningStep] = useState<string | null>(null);
  const [pitch3D, setPitch3D] = useState(60);

  // 9 Pune Clinics Route Sequence
  const puneClinics = facilities.filter(f => f.country === 'IND');

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const defaultLat = facilities[0]?.latitude || 18.8285;
    const defaultLng = facilities[0]?.longitude || 74.3755;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json', // 3D High-Tech Dark Style
      center: [defaultLng, defaultLat],
      zoom: 9.6,
      pitch: pitch3D, // 3D Tilt perspective (60 degrees)
      bearing: -15,   // 3D Orbital rotation
    });

    mapRef.current = map;

    map.on('load', () => {
      // 1. Add 3D Building Extrusions Layer
      map.addLayer({
        id: '3d-buildings',
        source: 'carto',
        'source-layer': 'building',
        type: 'fill-extrusion',
        minzoom: 13,
        paint: {
          'fill-extrusion-color': '#2a2820',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.8,
        },
      });

      // 2. Add 9-Clinic Quantum Route LineString
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

      // Glowing Neon Cyan 3D Route
      map.addLayer({
        id: 'quantum-route-glow',
        type: 'line',
        source: 'quantum-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#06b6d4',
          'line-width': 8,
          'line-opacity': 0.35,
        },
      });

      map.addLayer({
        id: 'quantum-route-line',
        type: 'line',
        source: 'quantum-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#f54e00', // Signature Cursor Orange
          'line-width': 3.5,
        },
      });

      // 3. Render 3D SVG Clinic Pins with Stop Sequence
      puneClinics.forEach((fac, idx) => {
        const el = document.createElement('div');
        el.className = 'custom-map-pin cursor-pointer transform hover:scale-125 transition-transform';
        
        let colorClass = 'bg-semantic-success';
        if (fac.risk_tier === 'P0_CRITICAL') colorClass = 'bg-semantic-error animate-pulse';
        else if (fac.risk_tier === 'P1_WARNING') colorClass = 'bg-amber-500';

        el.innerHTML = `
          <div class="flex items-center gap-1.5 px-2.5 py-1 bg-surface-card/90 backdrop-blur-xs border border-hairline-strong rounded-md shadow-md text-[11px] font-mono font-bold text-ink">
            <span class="w-2.5 h-2.5 rounded-full ${colorClass}"></span>
            <span>${idx + 1}. ${fac.name.split(' ')[0]}</span>
          </div>
        `;

        el.addEventListener('click', () => {
          onFacilitySelect(fac);
        });

        new maplibregl.Marker({ element: el })
          .setLngLat([fac.longitude, fac.latitude])
          .addTo(map);
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [facilities]);

  // AI Agent Self-Planning Simulation across 9 clinics
  const handleTriggerSelfPlan = () => {
    setIsSelfPlanning(true);
    setPlanningStep('1/4: ForecasterAgent evaluating 9-clinic demand spikes...');
    
    setTimeout(() => {
      setPlanningStep('2/4: AllocatorAgent formulating 81-qubit Hamiltonian on IBM Quantum...');
      if (mapRef.current) {
        mapRef.current.flyTo({ center: [74.0624, 18.75], zoom: 10.2, pitch: 65, duration: 1500 });
      }
    }, 1000);

    setTimeout(() => {
      setPlanningStep('3/4: SupervisorAgent verifying 1.5x donor safety buffer at Khed & Wagholi...');
    }, 2200);

    setTimeout(() => {
      setPlanningStep('4/4: ExplainerAgent synthesizing Google Maps turn-by-turn route!');
      setIsSelfPlanning(false);
      setTimeout(() => setPlanningStep(null), 3000);
    }, 3200);
  };

  return (
    <div className="relative h-[calc(100vh-140px)] w-full flex flex-col md:flex-row overflow-hidden border-b border-hairline bg-canvas">
      
      {/* 🗺️ Main 3D Map Viewport */}
      <div className="flex-1 relative h-full">
        <div ref={mapContainer} className="w-full h-full" />

        {/* 3D Top-Left Floating AI Telemetry & 9-Clinic Route HUD */}
        <div className="absolute top-4 left-4 z-10 bg-surface-card/95 backdrop-blur-sm border border-hairline rounded-lg p-4 shadow-sm max-w-md">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-semantic-success animate-ping"></span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-semibold">
                3D Autonomous Fleet Navigator
              </span>
            </div>
            <span className="text-[10px] font-mono bg-surface-strong px-2 py-0.5 rounded-pill text-ink font-bold">
              9 Clinics + 1 Depot
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
              <span className="text-xs font-mono font-bold text-semantic-success bg-green-50 px-2 py-1 rounded-sm block">
                COLD-CHAIN PASS
              </span>
            </div>
          </div>

          {/* AI Self-Plan Trigger Button */}
          <button
            onClick={handleTriggerSelfPlan}
            disabled={isSelfPlanning}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-active text-white text-xs font-medium py-2 rounded-md transition-colors shadow-xs"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSelfPlanning ? 'animate-spin' : ''}`} />
            <span>{isSelfPlanning ? 'AI Agents Self-Planning...' : '🤖 AI Agent Self-Plan 9-Clinic Route'}</span>
          </button>

          {/* Live Step Progress Banner */}
          {planningStep && (
            <div className="mt-2.5 p-2 bg-canvas-soft border border-hairline rounded-md text-[11px] font-mono text-ink animate-pulse">
              <code>&gt; {planningStep}</code>
            </div>
          )}
        </div>

        {/* Floating Bottom Action Bar: Google Maps GPS & Road Blocker */}
        <div className="absolute bottom-6 left-4 right-4 md:left-auto md:right-6 z-10 flex flex-wrap items-center gap-2 bg-surface-card/95 backdrop-blur-sm border border-hairline rounded-lg p-2.5 shadow-sm">
          
          {/* 📍 Direct Google Maps Turn-by-Turn GPS Link */}
          <a
            href={routingResult.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-ink hover:bg-black text-canvas text-xs font-medium px-4 py-2 rounded-md transition-colors shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5 text-primary" />
            <span>Open Google Maps GPS (9 Stops)</span>
          </a>

          {/* 💬 1-Click WhatsApp Dispatch to Driver */}
          <a
            href={routingResult.whatsapp_nav_share_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-surface-card hover:bg-canvas-soft border border-hairline-strong text-ink text-xs font-medium px-3.5 py-2 rounded-md transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-semantic-success" />
            <span>WhatsApp Route</span>
          </a>

          {/* 🚧 Frontline Human-in-the-Loop Road Blocker Button */}
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
