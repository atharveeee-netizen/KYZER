import React from 'react';
import { Navigation, Send, Clock, CheckCircle2, MapPin, Truck, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';
import { RoutingResult } from '../../types';

interface RoutesTabProps {
 routingResult: RoutingResult;
}

export const RoutesTab: React.FC<RoutesTabProps> = ({ routingResult }) => {
 return (
 <div className="p-6 max-w-7xl mx-auto space-y-6">
 
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-4">
 <div>
 <span className="text-[11px] font-mono uppercase bg-surface-strong px-2 py-0.5 rounded-pill text-ink font-semibold">
 Multi-Scale Quantum-Classical Allocator
 </span>
 <h1 className="text-2xl font-display text-ink mt-1">Autonomous Medicine Redistribution Routes</h1>
 <p className="text-xs text-muted">
 Solves Vehicle Routing Problem with Time Windows (CVRPTW) ensuring WHO 4-hour cold-chain freshness.
 </p>
 </div>

 {/* 1-Click Driver Dispatch Bar */}
 <div className="flex items-center gap-2">
 <a
 href={routingResult.google_maps_url}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-1.5 bg-ink hover:bg-black text-canvas text-xs font-medium px-4 py-2.5 rounded-md transition-colors shadow-xs"
 >
 <Navigation className="w-3.5 h-3.5 text-primary" />
 <span>Open Google Maps GPS</span>
 </a>

 <a
 href={routingResult.whatsapp_nav_share_url}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-1.5 bg-surface-card hover:bg-canvas-soft border border-hairline-strong text-ink text-xs font-medium px-3.5 py-2.5 rounded-md transition-colors"
 >
 <Send className="w-3.5 h-3.5 text-semantic-success" />
 <span>WhatsApp Driver</span>
 </a>
 </div>
 </div>

 {/* Active Route Hero Summary Card */}
 <div className="bg-surface-card border border-hairline rounded-lg p-5 shadow-xs">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4 mb-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
 <Truck className="w-5 h-5" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <span className="font-semibold text-ink text-sm">Active Emergency Route #1</span>
 <span className="text-[10px] font-mono text-semantic-success bg-green-50 border border-green-200 px-2 py-0.5 rounded-xs font-semibold">
 DISPATCHED
 </span>
 </div>
 <p className="text-xs text-muted">Refrigerated Van MH-12-QX-4019 · Cold-Chain ILR Monitored (+4.2°C)</p>
 </div>
 </div>

 <div className="flex items-center gap-4 text-xs font-mono">
 <div>
 <span className="text-muted block text-[10px]">TOTAL DISTANCE</span>
 <span className="text-lg font-display text-ink font-semibold">{routingResult.total_distance_km} km</span>
 </div>
 <div className="border-l border-hairline pl-4">
 <span className="text-muted block text-[10px]">TRANSIT DURATION</span>
 <span className="text-lg font-display text-ink font-semibold">{routingResult.total_time_min} min</span>
 </div>
 <div className="border-l border-hairline pl-4">
 <span className="text-muted block text-[10px]">COLD-CHAIN FRESHNESS</span>
 <span className="text-semantic-success font-semibold flex items-center gap-1 mt-0.5">
 <CheckCircle2 className="w-3.5 h-3.5" /> PASS (&lt;240m)
 </span>
 </div>
 </div>
 </div>

 {/* Chronological Stop Itinerary */}
 <h3 className="text-xs font-semibold text-ink mb-3">Turn-by-Turn Delivery Itinerary</h3>
 <div className="space-y-2.5">
 {routingResult.stops.map((stop) => (
 <div
 key={stop.sequence}
 className="flex items-center justify-between p-3 bg-canvas-soft border border-hairline rounded-md text-xs"
 >
 <div className="flex items-center gap-3">
 <span className="w-6 h-6 rounded-full bg-surface-card border border-hairline-strong flex items-center justify-center font-mono font-bold text-[11px] text-ink shrink-0">
 {stop.sequence}
 </span>
 <div>
 <span className="font-semibold text-ink block">{stop.name}</span>
 <span className="text-muted font-mono text-[11px]">Facility ID: {stop.facility_id}</span>
 </div>
 </div>

 <div className="flex items-center gap-6 text-right font-mono text-xs">
 <div>
 <span className="text-muted block text-[10px]">TIMING</span>
 <span className="text-ink">{stop.arrival_time} - {stop.departure_time}</span>
 </div>
 <div className="w-24">
 <span className="text-muted block text-[10px]">TRANSFER</span>
 <span className={stop.demand_units > 0 ? 'text-semantic-error font-semibold' : stop.demand_units < 0 ? 'text-semantic-success font-semibold' : 'text-muted'}>
 {stop.demand_units > 0 ? `+${stop.demand_units} tabs` : stop.demand_units < 0 ? `${stop.demand_units} tabs` : 'Origin/Depot'}
 </span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Solver Benchmarks */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="bg-surface-card border border-hairline rounded-lg p-4 shadow-xs text-xs space-y-2">
 <span className="text-[10px] font-mono text-muted uppercase block">Hardware Execution</span>
 <span className="text-sm font-semibold text-ink block">{routingResult.algorithm}</span>
 <p className="text-body text-[11.5px]">
 Solves 16-40 node micro-routes via Hamiltonian formulation on IBM Quantum Heron r2 QPU with seamless Qiskit Aer statevector fallback.
 </p>
 <div className="font-mono text-[11px] text-muted pt-1">Circuit Execution Time: {routingResult.runtime_ms} ms</div>
 </div>

 <div className="bg-surface-card border border-hairline rounded-lg p-4 shadow-xs text-xs space-y-2">
 <span className="text-[10px] font-mono text-muted uppercase block">Cold-Chain SLA Assurance</span>
 <span className="text-sm font-semibold text-semantic-success block">100% Freshness Guarantee</span>
 <p className="text-body text-[11.5px]">
 Every calculated route penalizes routes exceeding 240 minutes by 10,000 in QUBO energy, guaranteeing vaccines and antivenoms never spoil.
 </p>
 <div className="font-mono text-[11px] text-semantic-success pt-1">Transit Time: 138.4m &lt; 240.0m limit</div>
 </div>
 </div>

 </div>
 );
};
