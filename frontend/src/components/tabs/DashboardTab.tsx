import React from 'react';
import { ShieldAlert, Bed, TrendingUp, ArrowRight, Zap, MapPin, Radio, Cpu, HardDrive } from 'lucide-react';
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
  const criticalCount = facilities.filter(f => f.risk_tier === 'P0_CRITICAL').length;
  const warningCount = facilities.filter(f => f.risk_tier === 'P1_WARNING').length;
  const totalBeds = facilities.reduce((sum, f) => sum + f.total_beds, 0);
  const occupiedBeds = facilities.reduce((sum, f) => sum + f.occupied_beds, 0);
  const bedOccupancyPct = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

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
              <span className="te-tape bg-black text-white px-2 py-0.5 text-[11px]">
                SYS.01 // EXECUTIVE
              </span>
              <span className="text-[10px] text-muted tracking-widest uppercase">
                DISTRICT HEALTH TELEMETRY DECK
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink mt-1.5 uppercase">
              CAREDOM MISSION CONTROL
            </h1>
            <p className="text-xs text-body max-w-2xl mt-1 leading-relaxed">
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
            <span className="font-bold text-red-600">{criticalCount} FACILITY IN BREACH</span>
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

      {/* Two Column Grid: Hardware Alert Feed + Physical Routing Switches */}
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
            {alerts.slice(0, 3).map((alert, idx) => (
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
