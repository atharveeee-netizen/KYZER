import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  Compass, 
  Box, 
  Layers, 
  Maximize2, 
  RotateCcw,
  Eye,
  Check
} from 'lucide-react';
import { LayerVisibilityState, MapViewState } from '../types';

interface MapControlsProps {
  viewState: MapViewState;
  onViewStateChange: (nextState: MapViewState) => void;
  initialViewState: MapViewState;
  layerVisibility: LayerVisibilityState;
  onLayerVisibilityChange: (nextVisibility: LayerVisibilityState) => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  viewState,
  onViewStateChange,
  initialViewState,
  layerVisibility,
  onLayerVisibilityChange,
}) => {
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);

  const handleZoomIn = () => {
    onViewStateChange({
      ...viewState,
      zoom: Math.min(20, (viewState.zoom || 14.5) + 0.75),
    });
  };

  const handleZoomOut = () => {
    onViewStateChange({
      ...viewState,
      zoom: Math.max(10, (viewState.zoom || 14.5) - 0.75),
    });
  };

  const handleResetNorth = () => {
    onViewStateChange({
      ...viewState,
      bearing: 0,
    });
  };

  const handleToggle2D3D = () => {
    const is3D = (viewState.pitch || 0) > 10;
    onViewStateChange({
      ...viewState,
      pitch: is3D ? 0 : 48,
      bearing: is3D ? 0 : 20,
    });
  };

  const handleResetView = () => {
    onViewStateChange(initialViewState);
  };

  const toggleLayer = (key: keyof LayerVisibilityState) => {
    onLayerVisibilityChange({
      ...layerVisibility,
      [key]: !layerVisibility[key],
    });
  };

  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2 font-mono">
      {/* Primary Floating Tactical Control Bar */}
      <div className="flex flex-col bg-[#182026]/90 backdrop-blur-md border border-[#293742] rounded-[3px] shadow-lg p-1 text-[#F5F8FA]">
        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2 hover:bg-[#202B33] text-[#F5F8FA] rounded-[2px] transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2 hover:bg-[#202B33] text-[#F5F8FA] rounded-[2px] transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="h-[1px] bg-[#293742] my-1 mx-1" />

        {/* Reset North */}
        <button
          onClick={handleResetNorth}
          title="Reset North (0° Bearing)"
          className="p-2 hover:bg-[#202B33] text-[#F5F8FA] rounded-[2px] transition-colors"
        >
          <Compass 
            className="w-4 h-4 transition-transform" 
            style={{ transform: `rotate(${-1 * (viewState.bearing || 0)}deg)` }}
          />
        </button>

        {/* 2D / 3D Toggle */}
        <button
          onClick={handleToggle2D3D}
          title={viewState.pitch > 10 ? "Switch to 2D Top-Down" : "Switch to 3D Perspective"}
          className={`p-2 rounded-[2px] transition-colors ${
            viewState.pitch > 10 ? 'bg-[#106BA3]/30 text-[#106BA3] font-bold' : 'hover:bg-[#202B33] text-[#A7B6C2]'
          }`}
        >
          <Box className="w-4 h-4" />
        </button>

        {/* Reset View */}
        <button
          onClick={handleResetView}
          title="Reset Corridor View"
          className="p-2 hover:bg-[#202B33] text-[#F5F8FA] rounded-[2px] transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="h-[1px] bg-[#293742] my-1 mx-1" />

        {/* Layers Dropdown Toggle */}
        <button
          onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
          title="Geospatial Layers"
          className={`p-2 rounded-[2px] transition-colors ${
            isLayerMenuOpen ? 'bg-[#106BA3] text-white' : 'hover:bg-[#202B33] text-[#F5F8FA]'
          }`}
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Layer Visibility Flyout Modal */}
      {isLayerMenuOpen && (
        <div className="bg-[#182026]/95 backdrop-blur-md border border-[#293742] rounded-[3px] shadow-xl p-3 w-56 text-xs text-[#F5F8FA] space-y-2">
          <div className="text-[10px] font-bold text-[#A7B6C2] uppercase tracking-wider border-b border-[#293742] pb-1">
            3D Geospatial Layers
          </div>

          <div className="space-y-1.5 pt-1">
            <button
              onClick={() => toggleLayer('show3DBuildings')}
              className="w-full flex items-center justify-between p-1.5 hover:bg-[#202B33] rounded-[2px] text-left transition-colors"
            >
              <span>ArcGIS I3S 3D Buildings</span>
              {layerVisibility.show3DBuildings && <Check className="w-3.5 h-3.5 text-[#0D8050]" />}
            </button>

            <button
              onClick={() => toggleLayer('showRoadGlow')}
              className="w-full flex items-center justify-between p-1.5 hover:bg-[#202B33] rounded-[2px] text-left transition-colors"
            >
              <span>OSRM Road Ribbons</span>
              {layerVisibility.showRoadGlow && <Check className="w-3.5 h-3.5 text-[#106BA3]" />}
            </button>

            <button
              onClick={() => toggleLayer('showVehicleTrips')}
              className="w-full flex items-center justify-between p-1.5 hover:bg-[#202B33] rounded-[2px] text-left transition-colors"
            >
              <span>60fps Live Vehicle Trips</span>
              {layerVisibility.showVehicleTrips && <Check className="w-3.5 h-3.5 text-[#D9822B]" />}
            </button>

            <button
              onClick={() => toggleLayer('showRadarBeacons')}
              className="w-full flex items-center justify-between p-1.5 hover:bg-[#202B33] rounded-[2px] text-left transition-colors"
            >
              <span>Pulsing Radar Beacons</span>
              {layerVisibility.showRadarBeacons && <Check className="w-3.5 h-3.5 text-[#0D8050]" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};;
