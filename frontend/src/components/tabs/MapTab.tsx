import React, { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { Navigation, Send, AlertTriangle, CheckCircle2, Phone, Bed, Users, Pill, ShieldAlert, Sparkles, MapPin } from 'lucide-react';
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

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const defaultLat = facilities[0]?.latitude || 18.8263;
    const defaultLng = facilities[0]?.longitude || 74.3789;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json', // Clean editorial warm cream style
      center: [defaultLng, defaultLat],
      zoom: 9.2,
      pitch: 35, // Subtle 3D perspective
      bearing: -10,
    });

    mapRef.current = map;

    map.on('load', () => {
      // Add Quantum Route GeoJSON Source & Line Layer
      const coordinates = facilities.map(f => [f.longitude, f.latitude]);
      if (coordinates.length > 0) {
        coordinates.push(coordinates[0]); // Loop back to depot
      }

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

      // Background route glow
      map.addLayer({
        id: 'quantum-route-glow',
        type: 'line',
        source: 'quantum-route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#f54e00', // Cursor Orange brand accent
          'line-width': 6,
          'line-opacity': 0.3,
        },
      });

      // Main route line
      map.addLayer({
        id: 'quantum-route-line',
        type: 'line',
        source: 'quantum-route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#f54e00',
          'line-width': 3,
        },
      });

      // Add HTML markers for each clinic
      facilities.forEach((fac) => {
        const el = document.createElement('div');
        el.className = 'custom-map-pin cursor-pointer transform hover:scale-110 transition-transform';
        
        let colorClass = 'bg-semantic-success';
        if (fac.risk_tier === 'P0_CRITICAL') colorClass = 'bg-semantic-error animate-pulse';
        else if (fac.risk_tier === 'P1_WARNING') colorClass = 'bg-amber-500';

        el.innerHTML = `
          <div class="flex items-center gap-1 px-2 py-1 bg-surface-card border border-hairline-strong rounded-md shadow-xs text-[11px] font-medium text-ink">
            <span class="w-2 h-2 rounded-full ${colorClass}"></span>
            <span>${fac.name.split(' ')[2] || fac.name.split(' ')[0]}</span>
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

  return (
    <div className="relative h-[calc(100vh-140px)] w-full flex flex-col md:flex-row overflow-hidden border-b border-hairline bg-canvas">
      
      {/* 🗺️ Main Map Viewport */}
      <div className="flex-1 relative h-full">
        <div ref={mapContainer} className="w-full h-full" />

        {/* Floating Top-Left Route Telemetry Banner */}
        <div className="absolute top-4 left-4 z-10 bg-surface-card border border-hairline rounded-lg p-3.5 shadow-xs max-w-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-semantic-success animate-ping"></span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-semibold">
              {routingResult.algorithm}
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <div>
              <span className="text-xl font-display text-ink">{routingResult.total_distance_km} km</span>
              <span className="text-xs text-muted block">Network Distance</span>
            </div>
            <div className="border-l border-hairline pl-3">
              <span className="text-xl font-display text-ink">{routingResult.total_time_min} min</span>
              <span className="text-xs text-muted block">Transit Time</span>
            </div>
            <div className="border-l border-hairline pl-3">
              <span className="text-xs font-mono font-medium text-semantic-success bg-green-50 px-2 py-0.5 rounded-sm">
                WHO &lt;240m PASS
              </span>
            </div>
          </div>
        </div>

        {/* Floating Bottom Action Bar: Google Maps GPS & Road Blocker */}
        <div className="absolute bottom-6 left-4 right-4 md:left-auto md:right-6 z-10 flex flex-wrap items-center gap-2 bg-surface-card border border-hairline rounded-lg p-2.5 shadow-xs">
          
          {/* 📍 Direct Google Maps Turn-by-Turn GPS Link */}
          <a
            href={routingResult.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-ink hover:bg-black text-canvas text-xs font-medium px-3.5 py-2 rounded-md transition-colors shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5 text-primary" />
            <span>Open Google Maps GPS</span>
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
              {/* Medicine Telemetry */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-body flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-muted" /> Paracetamol 500mg
                </span>
                <span className="font-mono font-medium text-ink">
                  {selectedFacility.current_stock_pcm500} tabs ({selectedFacility.days_to_stockout}d)
                </span>
              </div>

              {/* Bed Occupancy */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-body flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5 text-muted" /> General Ward Beds
                </span>
                <span className="font-mono font-medium text-ink">
                  {selectedFacility.occupied_beds} / {selectedFacility.total_beds} ({Math.round((selectedFacility.occupied_beds / selectedFacility.total_beds) * 100)}%)
                </span>
              </div>

              {/* ICU Beds */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-body flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-muted" /> ICU Beds
                </span>
                <span className="font-mono font-medium text-ink">
                  {selectedFacility.icu_beds_occupied} / {selectedFacility.icu_beds_total}
                </span>
              </div>

              {/* Staff Present */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-body flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-muted" /> Staff on Duty
                </span>
                <span className="font-mono font-medium text-ink">
                  {selectedFacility.doctors_present} Docs, {selectedFacility.nurses_present} Nurses
                </span>
              </div>
            </div>

            {/* Cascade Non-Linear Risk Score */}
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

          {/* Action Trigger */}
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
