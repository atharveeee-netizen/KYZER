import React from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { Tile3DLayer } from '@deck.gl/geo-layers';
import { I3SLoader } from '@loaders.gl/i3s';
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
      {/* 🗺️ Pure Fullscreen Deck.gl WebGL 3D Canvas */}
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
      </div>
    </div>
  );
};
