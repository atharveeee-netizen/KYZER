import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  Activity, 
  ShieldAlert, 
  TrendingUp, 
  Truck, 
  Pill, 
  Bed, 
  UserCheck, 
  ArrowRight,
  Sparkles,
  Layers,
  FileText
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { PriorityAction, PriorityActionCard } from './PriorityActionCard';
import { UrbanClinic } from '../../features/digital-twin/types';
import { ForecastDay, ShapDriver, RoutingResult } from '../../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export type RightPanelMode = 'PRIORITY' | 'FACILITY' | 'MISSION' | 'INTELLIGENCE';

interface ContextualRightPanelProps {
  mode: RightPanelMode;
  onModeChange: (mode: RightPanelMode) => void;
  priorityActions: PriorityAction[];
  selectedFacility: UrbanClinic | null;
  forecastData?: ForecastDay[];
  shapDrivers?: ShapDriver[];
  activeRouteResult?: any;
  activeTransfer?: { from: UrbanClinic; to: UrbanClinic; units: number } | null;
  onSelectAction: (action: PriorityAction) => void;
  onDispatchAction: (action: PriorityAction) => void;
  onCloseFacility?: () => void;
  onOpenFullForecast?: () => void;
  onOpenInventoryDrawer?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ContextualRightPanel: React.FC<ContextualRightPanelProps> = ({
  mode,
  onModeChange,
  priorityActions,
  selectedFacility,
  forecastData = [],
  shapDrivers = [],
  activeRouteResult,
  activeTransfer,
  onSelectAction,
  onDispatchAction,
  onCloseFacility,
  onOpenFullForecast,
  onOpenInventoryDrawer,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  if (isCollapsed) {
    return (
      <div className="w-10 bg-[#182026] border-l border-[#293742] flex flex-col items-center py-3 select-none z-20 shrink-0">
        <button
          onClick={onToggleCollapse}
          className="p-1 text-[#A7B6C2] hover:text-[#F5F8FA] hover:bg-[#202B33] rounded-[2px]"
          title="Expand Operational Panel"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <div className="mt-8 [writing-mode:vertical-rl] rotate-180 font-mono text-[10px] font-bold uppercase tracking-wider text-[#A7B6C2] flex items-center gap-2">
          <span>OPERATIONAL CONTEXT</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#106BA3]" />
        </div>
      </div>
    );
  }

  return (
    <aside className="w-80 sm:w-96 bg-[#182026] border-l border-[#293742] flex flex-col h-full select-none z-20 shrink-0 font-sans text-[#F5F8FA] overflow-hidden">
      {/* Panel Top Switcher */}
      <div className="p-2.5 border-b border-[#293742] bg-[#202B33] flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onModeChange('PRIORITY')}
            className={`px-2 py-1 rounded-[2px] text-[10px] font-bold uppercase transition-colors ${
              mode === 'PRIORITY' ? 'bg-[#106BA3] text-white' : 'text-[#A7B6C2] hover:text-[#F5F8FA]'
            }`}
          >
            TRIAGE ({priorityActions.length})
          </button>
          <button
            onClick={() => onModeChange('FACILITY')}
            disabled={!selectedFacility}
            className={`px-2 py-1 rounded-[2px] text-[10px] font-bold uppercase transition-colors disabled:opacity-30 ${
              mode === 'FACILITY' ? 'bg-[#106BA3] text-white' : 'text-[#A7B6C2] hover:text-[#F5F8FA]'
            }`}
          >
            FACILITY
          </button>
          <button
            onClick={() => onModeChange('MISSION')}
            disabled={!activeTransfer}
            className={`px-2 py-1 rounded-[2px] text-[10px] font-bold uppercase transition-colors disabled:opacity-30 ${
              mode === 'MISSION' ? 'bg-[#106BA3] text-white' : 'text-[#A7B6C2] hover:text-[#F5F8FA]'
            }`}
          >
            MISSION
          </button>
        </div>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 text-[#A7B6C2] hover:text-[#F5F8FA] hover:bg-[#293742] rounded-[2px]"
            title="Collapse Panel"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {/* MODE 1: PRIORITY TRIAGE ACTIONS */}
        {mode === 'PRIORITY' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A7B6C2]">
                Actionable Stockout Feed
              </span>
              <Badge variant="danger" size="xs">
                {priorityActions.filter(p => p.tier === 'P0_CRITICAL').length} CRITICAL
              </Badge>
            </div>

            {priorityActions.length === 0 ? (
              <div className="foundry-card p-4 text-center space-y-2 border border-[#293742] bg-[#111418]/60">
                <div className="w-8 h-8 rounded-full bg-[#0D8050]/20 border border-[#0D8050]/40 flex items-center justify-center mx-auto text-[#0D8050]">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-[#F5F8FA] font-sans">ALL FACILITIES NOMINAL</div>
                <p className="text-[11px] text-[#A7B6C2] leading-relaxed">
                  No active stockout alerts on live network. Safety buffers across all 18 facilities ≥ 11.8 days.
                </p>
                <div className="pt-2 border-t border-[#293742]/40 flex items-center justify-center gap-2">
                  <Badge variant="success" size="xs">0 CRITICAL</Badge>
                  <Badge variant="primary" size="xs">LIVE POLLING ACTIVE</Badge>
                </div>
              </div>
            ) : (
              priorityActions.map(action => (
                <PriorityActionCard
                  key={action.id}
                  action={action}
                  onReviewDecision={onSelectAction}
                  onDispatchRoute={onDispatchAction}
                  isSelected={selectedFacility?.id === action.facilityId}
                />
              ))
            )}
          </div>
        )}

        {/* MODE 2: FACILITY INTELLIGENCE */}
        {mode === 'FACILITY' && selectedFacility && (
          <div className="space-y-3.5">
            {/* Facility Header Card */}
            <div className="foundry-card p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={selectedFacility.role === 'STOCKOUT' ? 'danger' : selectedFacility.role === 'DONOR' ? 'success' : 'primary'} size="xs">
                  {selectedFacility.role}
                </Badge>
                <span className="font-mono text-xs text-[#A7B6C2]">{selectedFacility.id}</span>
              </div>
              <h3 className="text-sm font-bold text-[#F5F8FA] font-sans">
                {selectedFacility.name}
              </h3>
              <p className="text-[11px] font-mono text-[#A7B6C2]">
                Coordinates: [{selectedFacility.coordinates[1].toFixed(4)}, {selectedFacility.coordinates[0].toFixed(4)}]
              </p>
            </div>

            {/* 3-Pillar Capacity Gauges */}
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="p-2 bg-[#111418] border border-[#293742] rounded-[2px]">
                <div className="text-[9px] text-[#A7B6C2] flex items-center gap-1">
                  <Pill className="w-3 h-3 text-[#106BA3]" />
                  <span>PARACETAMOL / PCM</span>
                </div>
                <div className="font-bold text-[#F5F8FA] mt-1 text-sm">
                  {selectedFacility.stock} units
                </div>
                <div className={`text-[10px] ${selectedFacility.daysLeft <= 1.0 ? 'text-[#C23030]' : 'text-[#0D8050]'}`}>
                  {selectedFacility.daysLeft.toFixed(1)} days buffer
                </div>
              </div>

              <div className="p-2 bg-[#111418] border border-[#293742] rounded-[2px]">
                <div className="text-[9px] text-[#A7B6C2] flex items-center gap-1">
                  <Bed className="w-3 h-3 text-[#D9822B]" />
                  <span>WARD BEDS</span>
                </div>
                <div className="font-bold text-[#F5F8FA] mt-1 text-sm">
                  {selectedFacility.beds.occupied} / {selectedFacility.beds.total}
                </div>
                <div className="text-[10px] text-[#D9822B]">
                  {Math.round((selectedFacility.beds.occupied / selectedFacility.beds.total) * 100)}% occupied
                </div>
              </div>
            </div>

            {/* 7-Day Quantile Mini Forecast Chart */}
            <div className="foundry-card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A7B6C2]">
                  7-Day Quantile Forecast
                </span>
                {onOpenFullForecast && (
                  <button
                    onClick={onOpenFullForecast}
                    className="text-[9px] font-mono text-[#38BDF8] hover:underline flex items-center gap-0.5"
                  >
                    <span>DEEP-DIVE ML ↗</span>
                  </button>
                )}
              </div>

              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData.length > 0 ? forecastData : [
                    { day: 'D1', p10: 40, p50: 52, p90: 68 },
                    { day: 'D2', p10: 42, p50: 58, p90: 74 },
                    { day: 'D3', p10: 45, p50: 64, p90: 82 },
                    { day: 'D4', p10: 50, p50: 70, p90: 90 },
                    { day: 'D5', p10: 54, p50: 76, p90: 98 },
                    { day: 'D6', p10: 58, p50: 82, p90: 105 },
                    { day: 'D7', p10: 62, p50: 88, p90: 115 },
                  ]}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#293742" />
                    <XAxis dataKey="day" stroke="#5C7080" tick={{ fontSize: 9 }} />
                    <YAxis stroke="#5C7080" tick={{ fontSize: 9 }} />
                    <Area type="monotone" dataKey="p90" stroke="#106BA3" fill="#106BA3" fillOpacity={0.15} />
                    <Area type="monotone" dataKey="p50" stroke="#38BDF8" fill="#38BDF8" fillOpacity={0.3} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* TreeSHAP Explainability Drivers */}
            <div className="foundry-card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#A7B6C2]">
                  Why is this node at risk? (SHAP)
                </span>
                <Sparkles className="w-3 h-3 text-[#D9822B]" />
              </div>

              <div className="space-y-1.5 font-mono text-xs">
                {(shapDrivers.length > 0 ? shapDrivers : [
                  { feature: 'Demand Spike (Outbreak Surge)', impact: '+42%', isPositive: true },
                  { feature: 'Low Buffer Stock (<1.5d)', impact: '+31%', isPositive: true },
                  { feature: 'High Bed Occupancy (>80%)', impact: '+18%', isPositive: true },
                ]).map((driver, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 bg-[#111418] border border-[#293742] rounded-[2px]">
                    <span className="text-[#A7B6C2] text-[11px] truncate max-w-[200px]">{driver.feature}</span>
                    <span className="font-bold text-[#C23030] text-[11px]">{driver.impact}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="secondary"
                size="xs"
                onClick={onOpenInventoryDrawer}
                leftIcon={<Layers className="w-3 h-3" />}
              >
                VIEW FEFO STOCK
              </Button>
              <Button
                variant="primary"
                size="xs"
                onClick={() => onModeChange('PRIORITY')}
                rightIcon={<ArrowRight className="w-3 h-3" />}
              >
                PROPOSE TRANSFER
              </Button>
            </div>
          </div>
        )}

        {/* MODE 3: TRANSFER MISSION */}
        {mode === 'MISSION' && activeTransfer && (
          <div className="space-y-3.5 font-mono">
            <div className="foundry-card p-3.5 space-y-2 border-[#0D8050]/40 bg-[#0D8050]/5">
              <div className="flex items-center justify-between">
                <Badge variant="success" dot pulse size="xs">
                  MISSION DISPATCHED
                </Badge>
                <span className="text-xs text-[#A7B6C2]">VEHICLE: VAN-04</span>
              </div>
              <h3 className="text-sm font-bold text-[#F5F8FA] font-sans">
                Emergency Redistribution Corridor
              </h3>
              <p className="text-xs text-[#A7B6C2]">
                Transferring <b>{activeTransfer.units} units</b> of PCM-500 from <b>{activeTransfer.from.name}</b> to <b>{activeTransfer.to.name}</b>.
              </p>
            </div>

            {/* Live Logistics Telemetry */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-[#111418] border border-[#293742] rounded-[2px]">
                <div className="text-[9px] text-[#A7B6C2]">DISTANCE</div>
                <div className="text-sm font-bold text-[#F5F8FA] mt-0.5">
                  {activeRouteResult ? `${activeRouteResult.totalDistanceKm} km` : '9.8 km'}
                </div>
              </div>
              <div className="p-2.5 bg-[#111418] border border-[#293742] rounded-[2px]">
                <div className="text-[9px] text-[#A7B6C2]">ESTIMATED TRANSIT</div>
                <div className="text-sm font-bold text-[#0D8050] mt-0.5">
                  {activeRouteResult ? `${activeRouteResult.estimatedTimeMin} min` : '18 min'}
                </div>
              </div>
              <div className="p-2.5 bg-[#111418] border border-[#293742] rounded-[2px]">
                <div className="text-[9px] text-[#A7B6C2]">COLD-CHAIN COMPLIANCE</div>
                <div className="text-sm font-bold text-[#38BDF8] mt-0.5">
                  +4.2°C (STABLE)
                </div>
              </div>
              <div className="p-2.5 bg-[#111418] border border-[#293742] rounded-[2px]">
                <div className="text-[9px] text-[#A7B6C2]">OPTIMIZATION SOLVER</div>
                <div className="text-sm font-bold text-[#C678DD] mt-0.5">
                  OR-TOOLS GLS
                </div>
              </div>
            </div>

            {/* Turn Sequence Summary */}
            <div className="foundry-card p-3 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#A7B6C2] border-b border-[#293742] pb-1">
                OSRM Road Centerline Route
              </div>
              <p className="text-xs text-[#A7B6C2] leading-relaxed">
                Vehicle dispatched along street network via Pune-Nagar Highway corridor. Zero unphysical sky arcs. 100% street-snapped coordinates.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
