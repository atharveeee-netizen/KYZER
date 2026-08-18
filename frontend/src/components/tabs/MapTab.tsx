import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { Navigation, Send, AlertTriangle, CheckCircle2, Bed, Users, Pill, ShieldAlert, Sparkles, MapPin, Zap, RefreshCw, Layers, Compass, Eye, Truck, Satellite } from 'lucide-react';
import { HealthFacility, RoutingResult } from '../../types';

interface MapTabProps {
  facilities: HealthFacility[];
  routingResult: RoutingResult;
  onFacilitySelect: (facility: HealthFacility) => void;
  selectedFacility: HealthFacility | null;
  onRerouteRequest: (blockedRoadName: string) => void;
}

// Helper to generate 3D hexagonal footprint for extruded spatial pillars
function createHexagonPolygon(lng: number, lat: number, radius = 0.022): [number, number][] {
  const coords: [number, number][] = [];
  for (let i = 0; i <= 6; i++) {
    const angle = (i * 60 * Math.PI) / 180;
    const dx = radius * Math.cos(angle);
    const dy = radius * Math.sin(angle);
    coords.push([lng + dx, lat + dy]);
  }
  return coords;
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
  const [basemapStyle, setBasemapStyle] = useState<'DARK' | 'SATELLITE'>('DARK');
  const [isOrbiting, setIsOrbiting] = useState(false);
  const orbitIntervalRef = useRef<any>(null);

  // 9 Pune District Clinics + 1 Central Depot Hub
  const puneClinics = facilities.filter(f => f.country === 'IND');

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Basemap style URL
    const mapStyle = basemapStyle === 'DARK'
      ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
      : {
          version: 8,
          sources: {
            'esri-satellite': {
              type: 'raster',
              tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
              tileSize: 256,
              attribution: 'Esri Satellite'
            }
          },
          layers: [
            {
              id: 'satellite-layer',
              type: 'raster',
              source: 'esri-satellite',
              minzoom: 0,
              maxzoom: 19
            }
          ]
        };

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle as any,
      center: [74.08, 18.78],
      zoom: 9.7,
      pitch: 65, // 3D Camera Tilt (65 degrees)
      bearing: -22, // 3D Perspective Rotation
      antialias: true,
      maxPitch: 85,
    });

    mapRef.current = map;

    map.on('load', () => {
      // 1. ADD MASSIVE 3D EXTRUDED PILLARS (COLUMNS) AT EACH CLINIC
      const pillarFeatures = puneClinics.map((fac) => {
        const isP0 = fac.risk_tier === 'P0_CRITICAL';
        const isP1 = fac.risk_tier === 'P1_WARNING';
        // Height proportional to stock / risk (up to 18,000 meters virtual height in 3D)
        const heightMeters = isP0 ? 14000 : isP1 ? 9000 : 18000;
        const colorHex = isP0 ? '#ef4444' : isP1 ? '#f59e0b' : '#10b981';

        return {
          type: 'Feature' as const,
          properties: {
            name: fac.name,
            facility_id: fac.facility_id,
            height: heightMeters,
            base: 0,
            color: colorHex,
          },
          geometry: {
            type: 'Polygon' as const,
            coordinates: [createHexagonPolygon(fac.longitude, fac.latitude, 0.02)],
          },
        };
      });

      map.addSource('3d-clinic-pillars', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: pillarFeatures,
        },
      });

      // Render 3D Extruded Glass Towers
      map.addLayer({
        id: '3d-clinic-pillars-extrusion',
        type: 'fill-extrusion',
        source: '3d-clinic-pillars',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'base'],
          'fill-extrusion-opacity': 0.88,
        },
      });

      // 2. ADD 3D GLOWING QUANTUM ROUTE LINESTRING
      const coordinates = puneClinics.map(f => [f.longitude, f.latitude]);
      if (coordinates.length > 0) coordinates.push(coordinates[0]);

      map.addSource('quantum-route-3d', {
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
        source: 'quantum-route-3d',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#06b6d4',
          'line-width': 12,
          'line-opacity': 0.45,
        },
      });

      // 3D Cursor Orange Solid Vector Ribbon
      map.addLayer({
        id: 'quantum-route-line',
        type: 'line',
        source: 'quantum-route-3d',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#f54e00',
          'line-width': 4.5,
          'line-opacity': 0.95,
        },
      });

      // 3. Render 3D Floating Top Badges at Each Clinic Pillar
      puneClinics.forEach((fac, idx) => {
        const el = document.createElement('div');
        el.className = 'custom-3d-hud-pin cursor-pointer transform hover:scale-125 transition-all duration-300';

        const isP0 = fac.risk_tier === 'P0_CRITICAL';
        const isP1 = fac.risk_tier === 'P1_WARNING';
        const badgeColor = isP0 ? 'bg-red-500 text-white animate-pulse' : isP1 ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white';

        el.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.8));">
            <div style="background: rgba(28,27,23,0.92); color: #ffffff; padding: 4px 9px; border-radius: 6px; font-size: 11px; font-family: monospace; font-weight: 700; border: 1px solid rgba(255,255,255,0.25); display: flex; align-items: center; gap: 5px; backdrop-filter: blur(4px);">
              <span class="${badgeColor}" style="width: 8px; height: 8px; border-radius: 9999px; display: inline-block;"></span>
              <span>${idx + 1}. ${fac.name.replace(' Primary Health Centre', '').replace(' Sub-District Hospital', '').replace(' Health Centre', '').replace(' Rural Hospital', '')}</span>
            </div>
            <div style="width: 2px; height: 18px; background: #f54e00; box-shadow: 0 0 8px #f54e00;"></div>
          </div>
        `;

        el.addEventListener('click', () => {
          onFacilitySelect(fac);
          map.flyTo({ center: [fac.longitude, fac.latitude], zoom: 11.5, pitch: 70, duration: 1200 });
        });

        new maplibregl.Marker({ element: el })
          .setLngLat([fac.longitude, fac.latitude])
          .addTo(map);
      });

      // 4. Add Animated 3D Vehicle Marker
      if (puneClinics.length > 0) {
        const truckEl = document.createElement('div');
        truckEl.innerHTML = `
          <div style="background: #f54e00; color: white; padding: 7px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 16px #f54e00; display: flex; align-items: center; justify-content: center; transform: scale(1.2);">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14v10Z"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
          </div>
        `;
        const truckMarker = new maplibregl.Marker({ element: truckEl })
          .setLngLat([puneClinics[0].longitude, puneClinics[0].latitude])
          .addTo(map);
        truckMarkerRef.current = truckMarker;
      }
    });

    return () => {
      if (orbitIntervalRef.current) clearInterval(orbitIntervalRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, [facilities, basemapStyle]);

  // 3D Camera Controls
  const handleSnap3D = () => {
    mapRef.current?.flyTo({ pitch: 68, bearing: -22, zoom: 9.8, duration: 1200 });
  };

  const handleSnap2D = () => {
    mapRef.current?.flyTo({ pitch: 0, bearing: 0, duration: 1000 });
  };

  const handleToggleOrbit = () => {
    if (isOrbiting) {
      if (orbitIntervalRef.current) clearInterval(orbitIntervalRef.current);
      setIsOrbiting(false);
    } else {
      setIsOrbiting(true);
      let angle = mapRef.current?.getBearing() || 0;
      orbitIntervalRef.current = setInterval(() => {
        angle = (angle + 1) % 360;
        mapRef.current?.setBearing(angle);
      }, 50);
    }
  };

  // Autonomous 9-Clinic Self-Planning Simulation with 3D Flight
  const handleTriggerSelfPlan = () => {
    setIsSelfPlanning(true);
    setPlanningStep('Step 1/4: ForecasterAgent scanning 9-clinic demand surges...');
    
    if (mapRef.current && puneClinics.length > 1) {
      mapRef.current.flyTo({ center: [puneClinics[1].longitude, puneClinics[1].latitude], zoom: 11, pitch: 70, duration: 1200 });
      truckMarkerRef.current?.setLngLat([puneClinics[1].longitude, puneClinics[1].latitude]);
    }

    setTimeout(() => {
      setPlanningStep('Step 2/4: AllocatorAgent formulating 81-qubit Hamiltonian on IBM Quantum QAOA...');
      if (mapRef.current && puneClinics.length > 4) {
        mapRef.current.flyTo({ center: [puneClinics[4].longitude, puneClinics[4].latitude], zoom: 11.2, pitch: 72, bearing: 45, duration: 1200 });
        truckMarkerRef.current?.setLngLat([puneClinics[4].longitude, puneClinics[4].latitude]);
      }
    }, 1300);

    setTimeout(() => {
      setPlanningStep('Step 3/4: SupervisorAgent auditing 1.5x buffer at Khed & Wagholi donor hubs...');
      if (mapRef.current && puneClinics.length > 7) {
        mapRef.current.flyTo({ center: [puneClinics[7].longitude, puneClinics[7].latitude], zoom: 11, pitch: 68, bearing: -90, duration: 1200 });
        truckMarkerRef.current?.setLngLat([puneClinics[7].longitude, puneClinics[7].latitude]);
      }
    }, 2600);

    setTimeout(() => {
      setPlanningStep('Step 4/4: ExplainerAgent locked 159.15 km tour! 1-Click GPS navigation ready.');
      if (mapRef.current) {
        mapRef.current.flyTo({ center: [74.08, 18.78], zoom: 9.7, pitch: 65, bearing: -22, duration: 1500 });
      }
      setIsSelfPlanning(false);
      setTimeout(() => setPlanningStep(null), 4000);
    }, 3900);
  };

  return (
    <div className="relative h-[calc(100vh-140px)] w-full flex flex-col md:flex-row overflow-hidden border-b border-hairline bg-canvas">
      
      {/* 🗺️ Main 3D Deck/MapLibre Viewport */}
      <div className="flex-1 relative h-full">
        <div ref={mapContainer} className="w-full h-full" />

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
            className="px-2.5 py-1.5 rounded-md text-ink hover:bg-canvas-soft transition-colors flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5 text-muted" />
            <span>2D Flat</span>
          </button>

          <button
            onClick={() => setBasemapStyle(prev => prev === 'DARK' ? 'SATELLITE' : 'DARK')}
            className="px-2.5 py-1.5 rounded-md text-ink hover:bg-canvas-soft transition-colors flex items-center gap-1 border-l border-hairline ml-1"
          >
            <Satellite className="w-3.5 h-3.5 text-primary" />
            <span>{basemapStyle === 'DARK' ? 'Satellite' : 'Dark Vector'}</span>
          </button>
        </div>

        {/* 🛰️ 3D Floating HUD: 9 Clinics AI Telemetry (Top Left) */}
        <div className="absolute top-4 left-4 z-10 bg-surface-card/95 backdrop-blur-md border border-hairline rounded-lg p-4 shadow-md max-w-md">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-semantic-success animate-ping"></span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-semibold">
                3D Spatial Fleet Twin
              </span>
            </div>
            <span className="text-[10px] font-mono bg-surface-strong px-2 py-0.5 rounded-pill text-ink font-bold">
              3D Pillars Active (14,000m)
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
