import React from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { Tile3DLayer } from '@deck.gl/geo-layers';
import { I3SLoader } from '@loaders.gl/i3s';
import { Building2, Globe } from 'lucide-react';
import { HealthFacility, RoutingResult } from '../../types';

interface MapTabProps {
  facilities?: HealthFacility[];
  routingResult?: RoutingResult;
  onFacilitySelect?: (facility: HealthFacility) => void;
  selectedFacility?: HealthFacility | null;
  onRerouteRequest?: (blockedRoadName: string) => void;
}

// Official ArcGIS I3S 3D Building Stream Layer URL (visgl/deck.gl)
const TILESET_URL =
  'https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/SanFrancisco_Bldgs/SceneServer/layers/0';

// Official Exact Initial ViewState from visgl/deck.gl I3S Example (Downtown Street Level)
const INITIAL_VIEW_STATE = {
  latitude: 37.78,
  longitude: -122.4,
  zoom: 15.5,
  pitch: 30,
  bearing: 0,
  minZoom: 14,
  maxZoom: 20,
};

export const MapTab: React.FC<MapTabProps> = () => {
  // Official visgl/deck.gl Tile3DLayer architecture
  const layers = [
    new Tile3DLayer({
      id: 'tile-3d-layer',
      data: TILESET_URL,
      loaders: [I3SLoader],
      loadOptions: {
        i3s: { useCompressedTextures: false },
      },
    }),
  ];

  return (
    <div className="relative h-[calc(100vh-140px)] w-full flex flex-col md:flex-row overflow-hidden border-b border-hairline bg-canvas">
      
      {/* 🗺️ Deck.gl WebGL 3D Canvas */}
      <div className="flex-1 relative h-full bg-[#061714]">
        <DeckGL
          style={{ backgroundColor: '#061714' }}
          initialViewState={INITIAL_VIEW_STATE as any}
          controller={true}
          layers={layers as any}
        >
          <Map
            reuseMaps
            mapLib={maplibregl as any}
            mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          />
        </DeckGL>

        {/* 🏢 Clean HUD Card (Sanitized) */}
        <div className="absolute top-4 left-4 z-10 bg-[#1c1d21]/95 backdrop-blur-md border border-white/20 rounded-xl p-5 shadow-2xl max-w-sm text-white font-sans pointer-events-auto">
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
