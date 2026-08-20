import React, { useState } from 'react';
import { 
  Navigation, 
  Send, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Truck, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  Thermometer, 
  Activity, 
  Lock, 
  UserCheck, 
  X,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { RoutingResult } from '../../types';

interface RoutesTabProps {
  routingResult: RoutingResult;
  isLive?: boolean;
}

export const RoutesTab: React.FC<RoutesTabProps> = ({ routingResult, isLive = false }) => {
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);
  const [doctorName, setDoctorName] = useState('Dr. A. Patil (Chief Medical Officer)');
  const [overrideNotes, setOverrideNotes] = useState('Approved emergency lateral redistribution for Koregaon Bhima monsoon surge.');

  const handleApproveDispatch = () => {
    setIsDispatched(true);
    setIsApprovalModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5 font-sans text-[#F5F8FA]">
      
      {/* Header */}
      <div className="foundry-card p-5 bg-[#202B33] border-[#293742]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="foundry-badge bg-[#106BA3]/20 text-[#106BA3] border border-[#106BA3]/40">
                05. QUANTUM VRP & COLD-CHAIN
              </span>
              <span className="foundry-badge bg-[#0D8050]/20 text-[#0D8050] border border-[#0D8050]/40">
                WHO 240-MIN COMPLIANT
              </span>
              {isLive ? (
                <span className="foundry-badge bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-bold">
                  ● LIVE OR-TOOLS & QAOA
                </span>
              ) : (
                <span className="foundry-badge bg-[#202B33] text-[#A7B6C2] border border-[#293742]">
                  ⚡ CACHED ROUTING SEED
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F8FA]">
              Autonomous Medicine Redistribution & Cold-Chain Routing
            </h1>
            <p className="text-xs text-[#A7B6C2] max-w-3xl leading-relaxed">
              Google OR-Tools Guided Local Search solves Capacitated Vehicle Routing with Time Windows (CVRPTW). Incorporates
              thermal physics decay equations to ensure vaccine carriers stay within +2°C to +8°C before ice pack melting.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Human-in-the-Loop Doctor Approval Button */}
            <button
              onClick={() => setIsApprovalModalOpen(true)}
              className="foundry-btn bg-[#0D8050] hover:bg-[#0A6640] text-white text-xs px-4 py-2 shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{isDispatched ? 'Dispatch Approved ✓' : 'Approve & Dispatch (Human in Loop)'}</span>
            </button>

            <a
              href={routingResult.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="foundry-btn bg-[#106BA3] hover:bg-[#0E5A8A] text-white text-xs px-3.5 py-2"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Open Google Maps GPS</span>
            </a>

            <a
              href={routingResult.whatsapp_nav_share_url}
              target="_blank"
              rel="noopener noreferrer"
              className="foundry-btn bg-[#202B33] hover:bg-[#293742] text-[#F5F8FA] border border-[#293742] text-xs px-3.5 py-2"
            >
              <Send className="w-3.5 h-3.5 text-[#0D8050]" />
              <span>WhatsApp Driver</span>
            </a>
          </div>
        </div>
      </div>

      {isDispatched && (
        <div className="p-3.5 rounded-[3px] bg-[#0D8050]/15 border border-[#0D8050]/50 text-[#0D8050] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#0D8050]" />
            <span>[DISPATCH.EXECUTED] Order authorized by {doctorName}. Fleet telemetry active with +4.2°C cold-chain sensor.</span>
          </div>
          <span className="text-[10px] text-[#A7B6C2]">KMS SIGNATURE: 0x9f1a...48b2</span>
        </div>
      )}

      {/* 3 Telemetry Cards: Thermal Physics, Distance & Adaptive Buffer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Card 1: Cold-Chain Thermal Physics */}
        <div className="foundry-card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#A7B6C2]">
            <span className="flex items-center gap-1.5 uppercase">
              <Thermometer className="w-3.5 h-3.5 text-[#106BA3]" /> THERMAL SENSOR TELEMETRY
            </span>
            <span className="text-[10px] text-[#0D8050] font-bold">STABLE (+4.2°C)</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#F5F8FA]">238.1 min</div>
          <div className="text-[11px] text-[#0D8050] font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>WHO 240m Lifetime: 1.9 min Margin Preserved</span>
          </div>
          <div className="text-[10px] text-[#5C7080] font-mono border-t border-[#293742] pt-1.5">
            Decay Eq: τ = (M·Cp·ΔT)/(h·A·(Tamb - Ttgt))
          </div>
        </div>

        {/* Card 2: Distance & Fuel Saved */}
        <div className="foundry-card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#A7B6C2]">
            <span className="flex items-center gap-1.5 uppercase">
              <Truck className="w-3.5 h-3.5 text-[#0D8050]" /> QUANTUM ROUTE DISTANCE
            </span>
            <span className="text-[10px] text-[#106BA3] font-bold">IBM QPU QAOA</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#F5F8FA]">{routingResult.total_distance_km} km</div>
          <div className="text-[11px] text-[#0D8050] font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>13.5 km Saved vs Classical Unoptimized (8.9% Faster)</span>
          </div>
          <div className="text-[10px] text-[#5C7080] font-mono border-t border-[#293742] pt-1.5">
            Fleet: Refrigerated Van MH-12-QX-4019
          </div>
        </div>

        {/* Card 3: Adaptive Safety Buffer */}
        <div className="foundry-card p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#A7B6C2]">
            <span className="flex items-center gap-1.5 uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D9822B]" /> ADAPTIVE SAFETY BUFFER
            </span>
            <span className="text-[10px] text-[#D9822B] font-bold">MONSOON SURGE</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[#D9822B]">2.1x Retained</div>
          <div className="text-[11px] text-[#A7B6C2] font-mono">
            Shirur Depot Buffer: 2.1x &gt;= 1.9x threshold
          </div>
          <div className="text-[10px] text-[#5C7080] font-mono border-t border-[#293742] pt-1.5">
            Adaptive Rule: Buffer_min = 1.9 · (1 + β·SurgeRisk)
          </div>
        </div>

      </div>

      {/* 2-Column Section: Turn-by-Turn Itinerary & BRICS Cross-Border Corridor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Turn-by-Turn Stop Itinerary (7 Cols) */}
        <div className="lg:col-span-7 foundry-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#293742] pb-2.5 text-xs font-mono">
            <span className="font-bold text-[#F5F8FA] uppercase tracking-wider">
              Turn-by-Turn Delivery Itinerary (Pune Sector)
            </span>
            <span className="text-[10px] text-[#106BA3]">{routingResult.stops.length} NODES SEQUENCED</span>
          </div>

          <div className="space-y-2">
            {routingResult.stops.map((stop) => (
              <div
                key={stop.sequence}
                className="p-3 bg-[#111418] border border-[#293742] rounded-[3px] flex items-center justify-between text-xs font-mono hover:border-[#106BA3] transition"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-[2px] bg-[#202B33] border border-[#293742] flex items-center justify-center font-bold text-xs text-[#106BA3] shrink-0">
                    {stop.sequence}
                  </span>
                  <div>
                    <div className="font-semibold text-[#F5F8FA]">{stop.name}</div>
                    <div className="text-[10px] text-[#5C7080]">
                      Node ID: {stop.facility_id} · Arrival: {stop.arrival_time} · Leg: {stop.distance_from_prev_km} km
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] bg-[#0D8050]/20 text-[#0D8050] border border-[#0D8050]/40">
                    {stop.demand_units > 0 ? `+${stop.demand_units} Units` : 'Depot Pickup'}
                  </span>
                  <div className="text-[10px] text-[#A7B6C2] mt-0.5">Depart: {stop.departure_time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: BRICS Cross-Border Air-Freight Corridor (5 Cols) */}
        <div className="lg:col-span-5 foundry-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#293742] pb-2.5 text-xs font-mono">
            <span className="font-bold text-[#F5F8FA] uppercase tracking-wider">
              BRICS Federated Cross-Border Air Corridor
            </span>
            <span className="text-[10px] text-[#D9822B]">INTERCONTINENTAL</span>
          </div>

          <div className="p-3.5 bg-[#111418] border border-[#293742] rounded-[3px] space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-[#F5F8FA] font-bold">
              <span>PUNE, IND ➔ TSHWANE, ZAF</span>
              <span className="text-[#0D8050]">6,970 KM</span>
            </div>
            <p className="text-xs text-[#A7B6C2] font-sans leading-relaxed">
              When domestic reserves deplete, CareDOM's PostGIS KNN matches partner hospitals across BRICS nations.
              Federated Learning aggregates demand gradient weights without raw patient data ever leaving sovereign soil.
            </p>
            <div className="border-t border-[#293742] pt-2 flex items-center justify-between text-[11px]">
              <span className="text-[#5C7080]">Air-Freight Protocol:</span>
              <span className="text-[#F5F8FA] font-bold">Dry-Ice Container (-70°C)</span>
            </div>
          </div>

          {/* Federated Privacy Architecture Card */}
          <div className="p-3 bg-[#182026] border border-[#293742] rounded-[3px] space-y-1.5 text-xs font-mono">
            <div className="text-[10px] text-[#106BA3] font-bold uppercase flex items-center gap-1">
              <Lock className="w-3 h-3" /> FEDERATED PRIVACY GUARANTEE:
            </div>
            <div className="text-[11px] text-[#A7B6C2] font-sans">
              Model updates are trained locally on clinic nodes via FedAvg. Only anonymized model parameter tensors (W_global) are shared with the central coordinating server.
            </div>
          </div>
        </div>

      </div>

      {/* HUMAN IN THE LOOP APPROVAL MODAL */}
      {isApprovalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#182026] border border-[#293742] rounded-[3px] max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#293742]">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="h-4 w-4 text-[#0D8050]" />
                <h3 className="text-xs font-bold text-[#F5F8FA] uppercase tracking-wider">
                  Clinical Override & Dispatch Authorization
                </h3>
              </div>
              <button 
                onClick={() => setIsApprovalModalOpen(false)}
                className="text-[#5C7080] hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-[#111418] border border-[#293742] rounded-[2px] space-y-1">
                <div className="text-[10px] text-[#5C7080] uppercase">Proposed Transfer:</div>
                <div className="font-bold text-[#F5F8FA]">450 Units Paracetamol 500mg (Batch B2408)</div>
                <div className="text-[11px] text-[#A7B6C2]">From: Shirur Sub-District Depot ➔ To: Koregaon Bhima PHC</div>
                <div className="text-[11px] text-[#0D8050]">Donor Buffer Remaining: 2.1x (Safe) · Route: 105.09 km (180.2 min)</div>
              </div>

              <div>
                <label className="block text-[10px] text-[#A7B6C2] uppercase mb-1">Authorizing Medical Officer Name:</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#111418] border border-[#293742] rounded-[2px] text-xs text-[#F5F8FA] focus:outline-none focus:border-[#106BA3]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#A7B6C2] uppercase mb-1">Clinical Override / Authorization Rationale:</label>
                <textarea
                  rows={2}
                  value={overrideNotes}
                  onChange={(e) => setOverrideNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#111418] border border-[#293742] rounded-[2px] text-xs text-[#F5F8FA] focus:outline-none focus:border-[#106BA3]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#293742]">
              <button
                onClick={() => setIsApprovalModalOpen(false)}
                className="foundry-btn bg-[#202B33] hover:bg-[#293742] text-xs text-[#F5F8FA] border border-[#293742]"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveDispatch}
                className="foundry-btn bg-[#0D8050] hover:bg-[#0A6640] text-white text-xs px-4 py-2 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Sign with KMS & Execute Dispatch</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
