import React, { useState, useRef } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { Tile3DLayer } from '@deck.gl/geo-layers';
import { I3SLoader } from '@loaders.gl/i3s';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';

import { RefreshCw, Layers, Compass, Satellite, Globe, Building } from 'lucide-react';
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
  intensity: 1.2,
});

const pointLight = new PointLight({
  color: [255, 245, 230],
  intensity: 2.0,
  position: [-122.4, 37.78, 12000],
});

const lightingEffect = new LightingEffect({ ambientLight, pointLight });

// Official ArcGIS I3S 3D Buildings SceneServer URL
const I3S_3D_BUILDINGS_URL =
  'https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/SanFrancisco_Bldgs/SceneServer/layers/0';

// Initial ViewState for LoD2 3D Buildings
const INITIAL_3D_VIEW_STATE = {
  latitude: 37.765,
  longitude: -122.44,
  zoom: 14.2,
  pitch: 58,
  bearing: 42,
  maxPitch: 85,
  minZoom: 10,
  maxZoom: 22,
};

export const MapTab: React.FC<MapTabProps> = () => {
  const [viewState, setViewState] = useState(INITIAL_3D_VIEW_STATE);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [basemapStyle, setBasemapStyle] = useState<'DARK' | 'VOYAGER'>('DARK');

  const orbitRef = useRef<any>(null);

  // Deck.gl Tile3DLayer with I3SLoader
  const layers = [
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

  // 360-Degree Continuous Camera Orbit
  const handleToggleOrbit = () => {
    if (isOrbiting) {
      if (orbitRef.current) clearInterval(orbitRef.current);
      setIsOrbiting(false);
    } else {
      setIsOrbiting(true);
      orbitRef.current = setInterval(() => {
        setViewState(prev => ({
          ...prev,
          bearing: (prev.bearing + 0.5) % 360,
        }));
      }, 30);
    }
  };

  const handleSnap3D = () => {
    setViewState(INITIAL_3D_VIEW_STATE);
  };

  const handleSnap2D = () => {
    setViewState(prev => ({ ...prev, pitch: 0, bearing: 0 }));
  };

  const mapStyleUrl = basemapStyle === 'DARK'
    ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
    : 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

  return (
    <div className="relative h-[calc(100vh-140px)] w-full flex flex-col md:flex-row overflow-hidden border-b border-hairline bg-canvas">
      
      {/* Deck.gl WebGL 3D Canvas */}
      <div className="flex-1 relative h-full bg-[#061714]">
        <DeckGL
          style={{ backgroundColor: '#061714' }}
          viewState={viewState as any}
          onViewStateChange={(e: any) => setViewState(e.viewState)}
          controller={true}
          layers={layers as any}
          effects={[lightingEffect]}
        >
          <Map
            reuseMaps
            mapLib={maplibregl as any}
            mapStyle={mapStyleUrl}
          />
        </DeckGL>

        {/* 3D Camera Controls Toolbar (Top Right) */}
        <div className="absolute top-4 right-4 z-10 flex items-center bg-surface-card/95 backdrop-blur-md border border-hairline rounded-lg p-1.5 shadow-md text-xs font-mono gap-1">
          
          <button
            onClick={handleSnap3D}
            className="px-3 py-1.5 rounded-md bg-primary text-white font-bold flex items-center gap-1.5 hover:bg-primary-active transition-colors shadow-xs"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>3D Perspective (58°)</span>
          </button>

          <button
            onClick={handleSnap2D}
            className="px-2.5 py-1.5 rounded-md text-ink hover:bg-canvas-soft transition-colors flex items-center gap-1 border-l border-hairline ml-1"
          >
            <Layers className="w-3.5 h-3.5 text-muted" />
            <span>2D Flat</span>
          </button>
          
          <button
            onClick={handleToggleOrbit}
            className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors border-l border-hairline ml-1 ${
              isOrbiting ? 'bg-amber-500 text-white font-bold animate-pulse' : 'text-ink hover:bg-canvas-soft'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isOrbiting ? 'animate-spin' : ''}`} />
            <span>{isOrbiting ? 'Stop Orbit' : '360° Orbit'}</span>
          </button>

          <button
            onClick={() => setBasemapStyle(prev => prev === 'DARK' ? 'VOYAGER' : 'DARK')}
            className="px-2.5 py-1.5 rounded-md text-ink hover:bg-canvas-soft transition-colors flex items-center gap-1 border-l border-hairline ml-1"
          >
            <Satellite className="w-3.5 h-3.5 text-primary" />
            <span>{basemapStyle === 'DARK' ? 'Voyager' : 'Dark Matter'}</span>
          </button>
        </div>

        {/* HUD Card: 3D Urban Health Infrastructure Digital Twin */}
        <div className="absolute top-4 left-4 z-10 bg-[#1c1d21]/95 backdrop-blur-md border border-white/20 rounded-xl p-5 shadow-2xl max-w-sm text-white font-sans">
          <h2 className="text-base font-bold text-sky-400 mb-1.5 tracking-tight flex items-center gap-2">
            <Building className="w-4 h-4 text-sky-400" />
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

      </div>

    </div>
  );
};
