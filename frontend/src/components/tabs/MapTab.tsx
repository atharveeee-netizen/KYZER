import React, { useState } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { Tile3DLayer } from '@deck.gl/geo-layers';
import { I3SLoader } from '@loaders.gl/i3s';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';
import { Building2, Globe } from 'lucide-react';
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

// Official ArcGIS I3S 3D Building Stream Layer URL
const I3S_3D_BUILDINGS_URL =
  'https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/SanFrancisco_Bldgs/SceneServer/layers/0';

// Initial ViewState for LoD2 3D Buildings
const INITIAL_VIEW_STATE = {
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
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

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
        >
          <Map
            reuseMaps
            mapLib={maplibregl as any}
            mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          />
        </DeckGL>

        {/* 🏢 Clean HUD Card (Sanitized: Zero San Francisco references) */}
        <div className="absolute top-4 left-4 z-10 bg-[#1c1d21]/95 backdrop-blur-md border border-white/20 rounded-xl p-5 shadow-2xl max-w-sm text-white font-sans">
          <h2 className="text-base font-bold text-sky-400 mb-1.5 tracking-tight flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-400" />
            <span>3D Urban Infrastructure Digital Twin</span>
          </h2>
          <p className="text-xs text-zinc-300 leading-relaxed mb-4">
            Highly detailed LoD2 textured 3D buildings in I3S format, visualized with deck.gl's <b>Tile3DLayer</b>. Real-time spatial mesh streaming for urban healthcare infrastructure.
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
