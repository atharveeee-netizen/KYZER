import { useMemo } from 'react';
import { PathLayer, ScatterplotLayer } from '@deck.gl/layers';
import { TripsLayer, Tile3DLayer } from '@deck.gl/geo-layers';
import { I3SLoader } from '@loaders.gl/i3s';
import { AmbientLight, PointLight, LightingEffect } from '@deck.gl/core';
import { LayerVisibilityState, UrbanClinic } from '../types';
import { RouteResult } from '../../../services/roadRouter';

// Official ArcGIS I3S 3D Building Stream Layer URL
export const TILESET_URL =
  'https://tiles.arcgis.com/tiles/z2tnIkrLQ2BRzr6P/arcgis/rest/services/SanFrancisco_Bldgs/SceneServer/layers/0';

// 3D Lighting Setup (visgl/deck.gl Official Specification)
const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.1,
});

const pointLight = new PointLight({
  color: [255, 245, 230],
  intensity: 2.2,
  position: [-122.4, 37.78, 12000],
});

export const lightingEffect = new LightingEffect({ ambientLight, pointLight });

interface UseDigitalTwinLayersProps {
  clinics: UrbanClinic[];
  activeRouteResult: RouteResult | null;
  tripsData: Array<{ vendor: number; path: [number, number][]; timestamps: number[] }>;
  time: number;
  layerVisibility: LayerVisibilityState;
  manualOrigin: UrbanClinic | null;
  manualDestination: UrbanClinic | null;
  onClinicClick: (clinic: UrbanClinic) => void;
}

export function useDigitalTwinLayers({
  clinics,
  activeRouteResult,
  tripsData,
  time,
  layerVisibility,
  manualOrigin,
  manualDestination,
  onClinicClick,
}: UseDigitalTwinLayersProps) {
  return useMemo(() => {
    const layers = [];

    // 1. ArcGIS I3S 3D Building Meshes
    if (layerVisibility.show3DBuildings) {
      layers.push(
        new Tile3DLayer({
          id: 'tile-3d-buildings',
          data: TILESET_URL,
          loaders: [I3SLoader],
          loadOptions: {
            i3s: { useCompressedTextures: false },
          },
          opacity: 0.96,
        })
      );
    }

    // 2. Glowing OSRM Road Corridor Base Ribbon (Underlay)
    if (layerVisibility.showRoadGlow && activeRouteResult && activeRouteResult.denseCoordinates.length > 0) {
      layers.push(
        new PathLayer({
          id: 'street-route-base-glow',
          data: [{ path: activeRouteResult.denseCoordinates }],
          getPath: (d: any) => d.path,
          getColor: [6, 182, 212, 100],
          getWidth: 18,
          widthUnits: 'meters',
          capRounded: true,
          jointRounded: true,
        }),
        new PathLayer({
          id: 'street-route-centerline',
          data: [{ path: activeRouteResult.denseCoordinates }],
          getPath: (d: any) => d.path,
          getColor: [6, 182, 212, 240],
          getWidth: 6,
          widthUnits: 'meters',
          capRounded: true,
          jointRounded: true,
        })
      );
    }

    // 3. Uber-Style Tron Animated TripsLayer (Moving along OSRM street coordinates)
    if (layerVisibility.showVehicleTrips && tripsData.length > 0) {
      layers.push(
        new TripsLayer({
          id: 'uber-style-vehicle-trips',
          data: tripsData,
          getPath: (d: any) => d.path,
          getTimestamps: (d: any) => d.timestamps,
          getColor: (d: any) => (d.vendor === 0 ? [253, 128, 93] : [16, 185, 129]), // Orange Forward / Emerald Return
          opacity: 0.98,
          widthMinPixels: 6,
          rounded: true,
          trailLength: 240,
          currentTime: time,
          shadowEnabled: false,
        })
      );
    }

    // 4. Ground Level Clinic Radar Beacons (Pulsing Red for Stockout/Dest, Emerald for Donor/Origin)
    if (layerVisibility.showRadarBeacons) {
      layers.push(
        new ScatterplotLayer({
          id: 'clinic-ground-radar-rings',
          data: clinics,
          getPosition: (d: UrbanClinic) => [d.coordinates[0], d.coordinates[1], 2],
          getRadius: (d: UrbanClinic) => {
            if (manualOrigin?.id === d.id) return 130 + Math.sin(time * 0.1) * 30;
            if (manualDestination?.id === d.id) return 130 + Math.cos(time * 0.1) * 30;
            if (d.role === 'STOCKOUT') return 120 + Math.sin(time * 0.08) * 35;
            if (d.role === 'DONOR') return 100 + Math.cos(time * 0.08) * 25;
            return 80;
          },
          getFillColor: (d: UrbanClinic) => {
            if (manualOrigin?.id === d.id) return [16, 185, 129, 120];
            if (manualDestination?.id === d.id) return [239, 68, 68, 120];
            if (d.role === 'STOCKOUT') return [239, 68, 68, 85];
            if (d.role === 'DONOR') return [16, 185, 129, 85];
            return [59, 130, 246, 65];
          },
          getLineColor: (d: UrbanClinic) => {
            if (manualOrigin?.id === d.id) return [16, 185, 129, 255];
            if (manualDestination?.id === d.id) return [239, 68, 68, 255];
            if (d.role === 'STOCKOUT') return [239, 68, 68, 255];
            if (d.role === 'DONOR') return [16, 185, 129, 255];
            return [59, 130, 246, 220];
          },
          stroked: true,
          filled: true,
          lineWidthMinPixels: 3,
          radiusUnits: 'meters',
          pickable: true,
          onClick: (info: any) => {
            if (info.object) onClinicClick(info.object);
          },
        }),
        new ScatterplotLayer({
          id: 'clinic-core-pins',
          data: clinics,
          getPosition: (d: UrbanClinic) => [d.coordinates[0], d.coordinates[1], 10],
          getRadius: 35,
          getFillColor: (d: UrbanClinic) => {
            if (d.role === 'STOCKOUT') return [239, 68, 68, 255]; // Red
            if (d.role === 'DONOR') return [16, 185, 129, 255]; // Emerald
            if (d.role === 'DEPOT') return [168, 85, 247, 255]; // Purple
            return [59, 130, 246, 255]; // Blue
          },
          getLineColor: [255, 255, 255, 255],
          stroked: true,
          lineWidthMinPixels: 2,
          radiusUnits: 'meters',
          pickable: true,
          onClick: (info: any) => {
            if (info.object) onClinicClick(info.object);
          },
        })
      );
    }

    return layers;
  }, [
    clinics,
    activeRouteResult,
    tripsData,
    time,
    layerVisibility,
    manualOrigin,
    manualDestination,
    onClinicClick,
  ]);
}
