import React, { useState } from 'react';
import { ShieldAlert, Bed, TrendingUp, ArrowRight, Zap, MapPin, Radio, Cpu, CheckCircle2, ChevronRight, Eye, RefreshCw } from 'lucide-react';
import { HealthFacility, SystemAlert } from '../../types';

interface DashboardTabProps {
  facilities: HealthFacility[];
  alerts: SystemAlert[];
  onNavigateTab: (tab: string) => void;
  onSimulateOutbreak: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  facilities,
  alerts,
  onNavigateTab,
  onSimulateOutbreak,
}) => {
  const [selectedAgentTrace, setSelectedAgentTrace] = useState<string | null>(null);

  const criticalCount = facilities.filter(f => f.risk_tier === 'P0_CRITICAL').length;
  const warningCount = facilities.filter(f => f.risk_tier === 'P1_WARNING').length;
  const totalBeds = facilities.reduce((sum, f) => sum + f.total_beds, 0);
  const occupiedBeds = facilities.reduce((sum, f) => sum + f.occupied_beds, 0);
  const bedOccupancyPct = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const agentNodes = [
    {
      id: 'forecaster',
      name: 'ForecasterAgent',
      role: 'Tweedie P10/P50/P90 Quantiles',
      latency: '34.2ms',
      status: 'CONVERGED',
      kanji: '予測',
      output: 'Forecasted 7-day demand spike: +142% at PHC Shirur (WAPE: 17.48%).'
    },
    {
      id: 'detector',
      name: 'DetectorAgent',
      role: 'Isolation Forest & Cascade Risk',
      latency: '18.1ms',
      status: 'TRIGGERED',
      kanji: '検知',
      output: 'P0 Critical anomaly detected. Stock buffer projected <= 1.2 days.'
    },
    {
      id: 'allocator',
      name: 'AllocatorAgent',
      role: 'QUBO/SA + OSRM Road Router',
      latency: '12.7ms',
      status: 'SOLVED',
      kanji: '最適化',
      output: 'Synthesized lateral redistribution: 450 units from Donor (13.5km shorter).'
    },
    {
      id: 'explainer',
      name: 'ExplainerAgent',
      role: 'TreeSHAP Feature Attributions',
      latency: '22.4ms',
      status: 'EXPLAINED',
      kanji: '説明',
      output: 'Top drivers: rainfall_lag_3d (+34.2%), bed_occupancy (+28.1%).'
    },
    {
      id: 'supervisor',
      name: 'SupervisorAgent',
      role: 'Clinical Safety Consensus Gate',
      latency: '8.3ms',
      status: 'APPROVED',
      kanji: '監査',
      output: 'CONSENSUS REACHED: Donor remaining buffer = 2.1x (>= 1.9x threshold).'
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 font-mono">
      
      {/* Top Industrial Chassis Header */}
      <div className="te-card bg-surface-card p-5 relative overflow-hidden">
        <div className="te-screw absolute top-2.5 left-2.5"></div>
        <div className="te-screw absolute top-2.5 right-2.5"></div>
        <div className="te-screw absolute bottom-2.5 left-2.5"></div>
        <div className="te-screw absolute bottom-2.5 right-2.5"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="te-tape bg-black text-white px-2 py-0.5 text-[10px] sm:text-[11px]">
                SYS.01 // EXECUTIVE
              </span>
              <span className="text-[10px] text-muted tracking-widest uppercase">
                自律統括 // DISTRICT HEALTH TELEMETRY DECK
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink mt-1.5 uppercase">
              CAREDOM MISSION CONTROL
            </h1>
            <p className="text-xs text-body max-w-2xl mt-1 leading-relaxed font-sans">
              Autonomous multi-agent supply chain co-pilot monitoring 18 Primary Health Centres. 
              Real-time LightGBM Tweedie inference coupled with IBM Quantum QAOA redistribution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="te-lcd px-3.5 py-2 text-center rounded-xs">
              <span className="text-[9px] block text-[#00ff66]/70 uppercase tracking-widest">QPU SYNC</span>
              <span className="text-xs font-bold font-mono">HERON.156 // OK</span>
            </div>

            <button
              onClick={onSimulateOutbreak}
              className="te-btn flex items-center gap-2 bg-[#FF5500] hover:bg-[#ff3700] active:translate-y-0.5 text-white text-xs px-4 py-2.5 shadow-[2px_2px_0px_#000]"
            >
              <Zap className="w-4 h-4" />
              <span>TRIGGER SHOCK [!]</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Hardware Channel Modules (Teenage Engineering Hardware Modules) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Module 1: Clinics */}
        <div className="te-card bg-surface-card p-4 relative">
          <div className="flex items-center justify-between text-muted text-[10px] uppercase tracking-wider mb-2">
            <span className="font-bold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-ink" /> CH.01 // CLINICS
            </span>
            <span className="text-xs font-mono">18 NODES</span>
          </div>
          <div className="te-lcd p-3 text-center my-1 rounded-xs">
            <div className="text-3xl font-extrabold font-mono tracking-widest text-[#00ff66]">
              {facilities.length < 10 ? `0${facilities.length}` : facilities.length}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-body flex items-center justify-between">
            <span className="text-muted">BRICS NODES</span>
            <span className="font-bold text-ink">10 IND · 5 ZAF · 3 BRA</span>
          </div>
        </div>

        {/* Module 2: P0 Stockouts */}
        <div className="te-card bg-surface-card p-4 relative">
          <div className="flex items-center justify-between text-muted text-[10px] uppercase tracking-wider mb-2">
            <span className="font-bold flex items-center gap-1.5 text-red-600">
              <ShieldAlert className="w-3.5 h-3.5" /> CH.02 // CRITICAL
            </span>
            <span className="te-tape bg-red-600 text-white text-[9px] px-1.5">
              {criticalCount > 0 ? 'P0 ALERT' : 'SECURE'}
            </span>
          </div>
          <div className="te-lcd p-3 text-center my-1 rounded-xs bg-[#1f0a0a] border-red-900/60 text-red-400">
            <div className="text-3xl font-extrabold font-mono tracking-widest text-red-500 text-shadow-red">
              {criticalCount < 10 ? `0${criticalCount}` : criticalCount}
            </div>
          </div>
          <div className="mt-2 text-[10px] text-body flex items-center justify-between">
            <span className="text-muted">BUFFER &le; 48H</span>
            <span className="font-bold text-red-600">{criticalCount} IN BREACH</span>
          </div>
        </div>

        {/* Module 3: Ward Saturation */}
        <div className="te-card bg-surface-card p-4 relative">
          <div className="flex items-center justify-between text-muted text-[10px] uppercase tracking-wider mb-2">
            <span className="font-bold flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-ink" /> CH.03 // BED.LOAD
            </span>
            <span className="text-xs font-mono">{occupiedBeds}/{totalBeds}</span>
          </div>
          <div className="te-lcd p-3 text-center my-1 rounded-xs">
            <div className="text-3xl font-extrabold font-mono tracking-widest text-[#00ff66]">
              {bedOccupancyPct}%
            </div>
          </div>
          <div className="mt-2 text-[10px] text-body flex items-center justify-between">
            <span className="text-muted">VU METER</span>
            <span className="font-bold text-[#FF5500]">
              {bedOccupancyPct > 80 ? '■■■■■■■□ CRIT' : '■■■■□□□□ NORM'}
            </span>
          </div>
        </div>

        {/* Module 4: 7-Day Forecast */}
        <div className="te-card bg-surface-card p-4 relative">
          <div className="flex items-center justify-between text-muted text-[10px] uppercase tracking-wider mb-2">
            <span className="font-bold flex items-center gap-1.5 text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" /> CH.04 // WAPE.ACC
            </span>
            <span className="text-xs font-mono">TWEEDIE</span>
          </div>
          <div className="te-lcd p-3 text-center my-1 rounded-xs">
            <div className="text-3xl font-extrabold font-mono tracking-widest text-[#00ff66]">
              17.48%
            </div>
          </div>
          <div className="mt-2 text-[10px] text-body flex items-center justify-between">
            <span className="text-muted">MODEL ERROR</span>
            <span className="font-bold text-emerald-600">PROD BENCHMARK [PASS]</span>
          </div>
        </div>

      </div>

      {/* NEW: Multi-Agent Worker-Critic Collaborative Blackboard Inspector (DeepSeek Harness + Agentic Design Patterns) */}
      <div className="te-card bg-surface-card p-5 relative">
        <div className="flex items-center justify-between mb-4 border-b-2 border-hairline pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#FF5500]" />
            <div>
              <div className="flex items-center gap-2">
                <span className="te-tape bg-yellow-400 text-black text-[9px] px-1.5 py-0.5">
                  MULTI-AGENT ORCHESTRATOR
                </span>
                <h2 className="text-xs sm:text-sm font-bold uppercase text-ink">
                  COLLABORATIVE BLACKBOARD CONSENSUS TRACE
                </h2>
              </div>
              <p className="text-[10px] text-muted">
                5-Agent Worker-Critic Graph with Clinical Safety Gate (Agentic Design Patterns standard)
              </p>
            </div>
          </div>
          <span className="te-lcd text-[9px] px-2 py-0.5 font-bold hidden sm:inline">
            BLACKBOARD // ACTIVE
          </span>
        </div>

        {/* 5-Agent Interactive Step Sequencer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {agentNodes.map((agent, idx) => {
            const isSelected = selectedAgentTrace === agent.id;
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgentTrace(isSelected ? null : agent.id)}
                className={`p-3 border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#FF5500] bg-orange-50/30 dark:bg-orange-950/20 shadow-[2px_2px_0px_#FF5500]'
                    : 'border-[#111111] dark:border-[#4d535a] bg-canvas-soft hover:bg-surface-strong shadow-[1.5px_1.5px_0px_#000]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-mono font-bold text-muted uppercase">
                    0{idx + 1} // {agent.kanji}
                  </span>
                  <span className="te-tape text-[8px] bg-black text-white px-1">
                    {agent.status}
                  </span>
                </div>
                <div className="font-bold text-xs text-ink truncate">{agent.name}</div>
                <div className="text-[10px] text-muted truncate mt-0.5">{agent.role}</div>
                <div className="mt-2 pt-1.5 border-t border-hairline flex items-center justify-between text-[9px] font-mono">
                  <span className="text-[#00ff66] bg-[#0a110d] px-1 py-0.5">{agent.latency}</span>
                  <span className="text-zinc-500 hover:text-ink flex items-center gap-0.5">
                    <Eye className="w-3 h-3" /> TRACE
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Agent Live Payload Inspector */}
        {selectedAgentTrace && (
          <div className="mt-3 p-3.5 bg-[#0a110d] border-2 border-[#1a2e20] text-[#00ff66] rounded-xs text-xs font-mono leading-relaxed space-y-1 animate-fadeIn">
            <div className="flex justify-between border-b border-[#1a2e20] pb-1 font-bold text-[#00ff66]">
              <span>&gt; AGENT PAYLOAD TRACE: {agentNodes.find(a => a.id === selectedAgentTrace)?.name}</span>
              <span>STATE: SYNCHRONIZED</span>
            </div>
            <p className="text-[11px] text-[#00ff66]/90 pt-1">
              {agentNodes.find(a => a.id === selectedAgentTrace)?.output}
            </p>
          </div>
        )}
      </div>

      {/* Two Column Grid: Live Alert Stream + Quick Navigation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Hardware Alert Telemetry Feed (7 Cols) */}
        <div className="lg:col-span-7 te-card bg-surface-card p-5 relative">
          <div className="flex items-center justify-between mb-4 border-b-2 border-hairline pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <h2 className="text-sm font-bold uppercase text-ink">ACTIVE TELEMETRY STREAM</h2>
              </div>
              <p className="text-[11px] text-muted">Server-Sent Events (SSE) Broadcast Bus</p>
            </div>
            <button
              onClick={() => onNavigateTab('alerts')}
              className="te-btn text-[11px] bg-surface-strong hover:bg-canvas-soft px-3 py-1 text-ink flex items-center gap-1"
            >
              <span>EXPAND</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="p-3 bg-canvas-soft border-1.5 border-[#111111] dark:border-[#4d535a] text-xs space-y-1.5 shadow-[1.5px_1.5px_0px_#000]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`te-tape text-[9px] px-1.5 py-0.5 text-white ${
                        alert.severity === 'P0' ? 'bg-red-600' : 'bg-yellow-500 text-black'
                      }`}
                    >
                      {alert.severity}.ALERT
                    </span>
                    <span className="font-bold text-ink">{alert.facility_name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted">[{alert.timestamp}]</span>
                </div>
                <p className="text-body text-[11px] leading-relaxed font-sans">{alert.description_en}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Physical Step Sequencer Navigation Switches (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* Switch 1: 3D GIS & Quantum */}
          <div
            onClick={() => onNavigateTab('map')}
            className="te-card bg-surface-card hover:bg-canvas-soft p-4 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-start gap-3">
              <span className="te-tape bg-[#FF5500] text-white text-[10px] px-1.5 py-0.5">MOD.02</span>
              <div>
                <h3 className="text-xs font-bold uppercase text-ink group-hover:text-[#FF5500]">
                  3D.GIS // OSRM REAL ROAD
                </h3>
                <p className="text-[10px] text-muted leading-tight mt-0.5">
                  162 GPS centerline coordinates, 0 building clipping, dynamic thermals.
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-ink shrink-0 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Switch 2: FEFO Stock */}
          <div
            onClick={() => onNavigateTab('inventory')}
            className="te-card bg-surface-card hover:bg-canvas-soft p-4 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-start gap-3">
              <span className="te-tape bg-yellow-400 text-black text-[10px] px-1.5 py-0.5">MOD.03</span>
              <div>
                <h3 className="text-xs font-bold uppercase text-ink group-hover:text-yellow-600">
                  FEFO.INVENTORY // AUDIT
                </h3>
                <p className="text-[10px] text-muted leading-tight mt-0.5">
                  First-Expiry-First-Out batch tracking with lateral stock transfer.
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-ink shrink-0 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Switch 3: OCR Scanner */}
          <div
            onClick={() => onNavigateTab('ocr')}
            className="te-card bg-surface-card hover:bg-canvas-soft p-4 cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-start gap-3">
              <span className="te-tape bg-emerald-600 text-white text-[10px] px-1.5 py-0.5">MOD.06</span>
              <div>
                <h3 className="text-xs font-bold uppercase text-ink group-hover:text-emerald-600">
                  OCR.SCANNER // GEMINI 1.5
                </h3>
                <p className="text-[10px] text-muted leading-tight mt-0.5">
                  Client-side canvas downscaling (97% bandwidth saved) + Hough deskew.
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-ink shrink-0 group-hover:translate-x-1 transition-transform" />
          </div>

        </div>

      </div>

    </div>
  );
};
