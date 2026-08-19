import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Truck, 
  AlertTriangle, 
  Cpu, 
  Terminal, 
  Lock, 
  RefreshCw,
  Search,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  MapPin,
  Building2,
  Layers,
  Zap,
  ArrowRight
} from 'lucide-react';
import { HealthFacility, SystemAlert } from '../../types';

interface HealthCentre {
  id: string;
  name: string;
  district: string;
  stockLevel: number; // percentage
  status: 'STABLE' | 'WARNING' | 'CRITICAL';
  icuBedsFree: number;
  icuBedsTotal: number;
  lat: number;
  lng: number;
}

interface AgentTrace {
  id: string;
  timestamp: string;
  agent: 'Planner' | 'SupplyRouter' | 'ComplianceVerifier' | 'Explainer' | 'Supervisor';
  action: string;
  status: 'EXECUTED' | 'VERIFYING' | 'ALERT';
}

interface DashboardTabProps {
  facilities: HealthFacility[];
  alerts: SystemAlert[];
  onNavigateTab: (tab: string) => void;
  onSimulateOutbreak: () => void;
}

const SOVEREIGN_FACILITIES: HealthCentre[] = [
  { id: 'PHC-PUN-001', name: 'Shirur Sub-District Hospital', district: 'Pune District', stockLevel: 14, status: 'CRITICAL', icuBedsFree: 1, icuBedsTotal: 6, lat: 18.8288, lng: 74.3789 },
  { id: 'PHC-PUN-002', name: 'Khed Primary Health Centre', district: 'Pune District', stockLevel: 88, status: 'STABLE', icuBedsFree: 4, icuBedsTotal: 5, lat: 18.8500, lng: 73.9167 },
  { id: 'PHC-PUN-003', name: 'Junnar Rural Hospital', district: 'Pune District', stockLevel: 42, status: 'WARNING', icuBedsFree: 2, icuBedsTotal: 8, lat: 19.2083, lng: 73.8750 },
  { id: 'DH-DEPOT-001', name: 'Aundh Central Vaccine Depot', district: 'Pune District', stockLevel: 95, status: 'STABLE', icuBedsFree: 8, icuBedsTotal: 12, lat: 18.5583, lng: 73.8083 },
];

const INITIAL_AGENT_TRACES: AgentTrace[] = [
  { id: 'tr-101', timestamp: '21:49:02', agent: 'Planner', action: 'Monsoon surge vector detected in Shirur sector (52mm rainfall). Projecting demand spike +142%.', status: 'EXECUTED' },
  { id: 'tr-102', timestamp: '21:49:05', agent: 'SupplyRouter', action: 'IBM Heron r2 QAOA Hamiltonian solved: Optimal lateral transfer PHC Khed -> Shirur SDH (138.89km).', status: 'EXECUTED' },
  { id: 'tr-103', timestamp: '21:49:08', agent: 'ComplianceVerifier', action: 'Strix Pen-Test Pass: Signed dispatch payload with Government KMS Key. Clinical Buffer: 2.1x >= 1.9x.', status: 'EXECUTED' },
];

export const DashboardTab: React.FC<DashboardTabProps> = ({
  facilities: initialFacilities,
  alerts,
  onNavigateTab,
  onSimulateOutbreak,
}) => {
  const [facilities, setFacilities] = useState<HealthCentre[]>(SOVEREIGN_FACILITIES);
  const [agentTraces, setAgentTraces] = useState<AgentTrace[]>(INITIAL_AGENT_TRACES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedFacility, setSelectedFacility] = useState<HealthCentre>(SOVEREIGN_FACILITIES[0]);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const criticalCount = facilities.filter(f => f.status === 'CRITICAL').length;
  const totalIcuBeds = facilities.reduce((sum, f) => sum + f.icuBedsTotal, 0);
  const freeIcuBeds = facilities.reduce((sum, f) => sum + f.icuBedsFree, 0);

  const triggerAgentRebalance = () => {
    setIsLoading(true);
    setTimeout(() => {
      setFacilities((prev) =>
        prev.map((f) =>
          f.id === 'PHC-PUN-001'
            ? { ...f, stockLevel: 65, status: 'STABLE' }
            : f.id === 'PHC-PUN-002'
            ? { ...f, stockLevel: 62 }
            : f
        )
      );
      setAgentTraces((prev) => [
        {
          id: `tr-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          agent: 'SupplyRouter',
          action: 'Autonomous Lateral Dispatch Executed: 450 Units PCM-500 transferred via cold-chain carrier (238.1 min transit).',
          status: 'EXECUTED',
        },
        ...prev,
      ]);
      setIsLoading(false);
    }, 1100);
  };

  const filteredFacilities = searchFilter
    ? facilities.filter(f => f.name.toLowerCase().includes(searchFilter.toLowerCase()) || f.id.toLowerCase().includes(searchFilter.toLowerCase()))
    : facilities;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 font-sans text-zinc-900 dark:text-zinc-100 antialiased">
      
      {/* 1. Executive B2G Command Bar */}
      <div className="bento-card p-6 bg-gradient-to-r from-surface-card via-surface-card to-blue-950/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="sovereign-badge bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20">
                <Building2 className="w-3 h-3" /> MINISTRY OF HEALTH & FAMILY WELFARE
              </span>
              <span className="sovereign-badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" /> STRIX SECURED • SOC2 TYPE II
              </span>
              <span className="text-[11px] text-muted font-mono">
                NODE: PUNE DISTRICT COMMAND [18 PHC]
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
              Public Health Supply Chain & Epidemic Intelligence Tower
            </h1>
            <p className="text-xs text-body max-w-3xl leading-relaxed">
              Multi-agent autonomous co-pilot governing pharmaceutical inventory, cold-chain compliance,
              and emergency lateral redistribution across primary health centres in Maharashtra.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Live IBM QPU Telemetry Badge */}
            <div className="px-4 py-2.5 rounded-xl bg-canvas-soft border border-hairline text-left">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>IBM Quantum QPU</span>
              </div>
              <div className="text-sm font-bold font-mono text-ink mt-0.5">
                ibm_fez (156-Qubit Heron)
              </div>
            </div>

            <button
              onClick={onSimulateOutbreak}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs"
            >
              <Zap className="w-4 h-4" />
              <span>Simulate Epidemic Shock</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. Executive Metrics Overview Bar (4 Bento Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Health Facilities Monitored */}
        <div className="bento-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted font-mono uppercase">
            <span>ACTIVE PHC CLINICS</span>
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-ink font-mono tracking-tight">18 Facilities</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
            100% Connectivity • Pune Sector
          </div>
        </div>

        {/* Metric 2: Stockout Risk */}
        <div className="bento-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted font-mono uppercase">
            <span>STOCKOUT RISK INDEX</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-500 font-mono tracking-tight">
            {criticalCount > 0 ? 'P0 CRITICAL' : 'NOMINAL'}
          </div>
          <div className="text-[11px] text-muted font-mono">
            {criticalCount > 0 ? `${criticalCount} Facility Outbreak Vector` : 'All buffers >= 1.9x threshold'}
          </div>
        </div>

        {/* Metric 3: Multi-Agent Engine Status */}
        <div className="bento-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted font-mono uppercase">
            <span>MULTI-AGENT STATUS</span>
            <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-ink font-mono tracking-tight">5 Subagents Active</div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">
            DeepSeek Harness Engine
          </div>
        </div>

        {/* Metric 4: Automated Redistribution */}
        <div className="bento-card p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted font-mono uppercase">
            <span>AUTONOMOUS REDISTRIBUTION</span>
            <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
            Route Ready (13.5km Saved)
          </div>
          <button
            onClick={triggerAgentRebalance}
            disabled={isLoading}
            className="w-full mt-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Executing Multi-Agent Loop...' : 'Deploy Autonomous Dispatch'}</span>
          </button>
        </div>

      </div>

      {/* 3. Bento Grid: Left High-Density Table & Right Multi-Agent Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Table: High Density Data Grid (Japanese Grid aesthetics) */}
        <div className="lg:col-span-7 bento-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
            <div>
              <h2 className="text-sm font-bold text-ink tracking-tight">Primary Health Centres — Live Telemetry</h2>
              <p className="text-xs text-muted">Real-time inventory and ICU bed telemetry from district nodes</p>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter PHC node..."
                className="pl-8 pr-3 py-1.5 bg-canvas-soft border border-hairline rounded-lg text-xs text-ink focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          {/* boneyard Shimmer Skeleton State */}
          {isLoading ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 w-full bg-canvas-soft rounded-xl skeleton-shimmer" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFacilities.map((fac) => (
                <div
                  key={fac.id}
                  onClick={() => setSelectedFacility(fac)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedFacility.id === fac.id
                      ? 'bg-blue-600/5 border-blue-500/50 shadow-xs ring-1 ring-blue-500/20'
                      : 'bg-canvas-soft/60 border-hairline hover:border-hairline-strong'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-ink">{fac.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-strong text-body font-semibold">
                        {fac.id}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted flex items-center space-x-3 font-mono">
                      <span>District: {fac.district}</span>
                      <span>•</span>
                      <span>ICU Beds: {fac.icuBedsFree}/{fac.icuBedsTotal} Free</span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="w-24 bg-surface-strong h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            fac.stockLevel < 20
                              ? 'bg-red-500'
                              : fac.stockLevel < 50
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${fac.stockLevel}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-ink">{fac.stockLevel}%</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                        fac.status === 'CRITICAL'
                          ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/60'
                          : fac.status === 'WARNING'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                      }`}
                    >
                      {fac.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel: DeepSeek Harness Multi-Agent Telemetry Stream */}
        <div className="lg:col-span-5 bento-card p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-ink tracking-tight">Agentic Loop Audit Feed</h2>
              </div>
              <span className="sovereign-badge bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20 text-[9px]">
                CORDIS ENGINE LIVE
              </span>
            </div>

            {/* Monospace Execution Trace List */}
            <div className="mt-3 space-y-2 font-mono text-xs max-h-80 overflow-y-auto pr-1">
              {agentTraces.map((trace) => (
                <div key={trace.id} className="p-3 rounded-xl bg-canvas-soft border border-hairline space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-muted">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">@{trace.agent}</span>
                    <span>{trace.timestamp}</span>
                  </div>
                  <p className="text-body font-sans text-xs leading-relaxed">{trace.action}</p>
                  <div className="flex items-center justify-end space-x-1 text-[10px] text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{trace.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Sovereign Verification Footer */}
          <div className="p-3 rounded-xl bg-blue-600/5 border border-blue-600/20 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Government KMS Signed Payload
            </span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

      </div>

    </div>
  );
};
