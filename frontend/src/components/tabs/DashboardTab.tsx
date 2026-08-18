import React from 'react';
import { ShieldAlert, Bed, Users, Pill, TrendingUp, AlertTriangle, ArrowRight, Zap, CheckCircle2, Activity, MapPin } from 'lucide-react';
import { HealthFacility, SystemAlert, ForecastDay } from '../../types';

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
 const surplusCount = facilities.filter(f => f.risk_tier === 'P2_SURPLUS').length;
 const totalBeds = facilities.reduce((sum, f) => sum + f.total_beds, 0);
 const occupiedBeds = facilities.reduce((sum, f) => sum + f.occupied_beds, 0);
 const bedOccupancyPct = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

 return (
 <div className="p-6 max-w-7xl mx-auto space-y-6">
 
 {/* Hero Welcome Banner */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-5">
 <div>
 <div className="flex items-center gap-2">
 <span className="text-[11px] font-mono uppercase bg-surface-strong px-2 py-0.5 rounded-pill text-ink font-semibold">
 District Health Command Overview
 </span>
 </div>
 <h1 className="text-3xl font-display text-ink mt-1">CareDOM Public Health Executive Dashboard</h1>
 <p className="text-xs text-body max-w-2xl mt-1">
 Autonomous multi-agent supply chain co-pilot monitoring 18 Primary Health Centres across Pune District. 
 Real-time LightGBM Tweedie forecasting and IBM Quantum QAOA redistribution.
 </p>
 </div>

 <button
 onClick={onSimulateOutbreak}
 className="flex items-center gap-2 bg-primary hover:bg-primary-active text-white text-xs font-medium px-4 py-2.5 rounded-md transition-colors shadow-xs shrink-0"
 >
 <Zap className="w-4 h-4" />
 <span>Simulate Outbreak Surge</span>
 </button>
 </div>

 {/* 4 Primary KPI Cards (White on Cream with Hairline Borders) */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 
 {/* KPI 1: Facilities Monitored */}
 <div className="bg-surface-card border border-hairline rounded-lg p-4 shadow-xs">
 <div className="flex items-center justify-between text-muted text-xs mb-1.5 font-mono">
 <span>TOTAL CLINICS</span>
 <MapPin className="w-4 h-4 text-muted" />
 </div>
 <div className="text-3xl font-display text-ink">{facilities.length}</div>
 <div className="mt-2 text-[11px] text-body flex items-center gap-1.5">
 <span className="w-2 h-2 rounded-full bg-semantic-success"></span>
 <span>10 IND · 5 ZAF · 3 BRA</span>
 </div>
 </div>

 {/* KPI 2: Critical P0 Stockout Risk */}
 <div className="bg-surface-card border border-hairline rounded-lg p-4 shadow-xs">
 <div className="flex items-center justify-between text-muted text-xs mb-1.5 font-mono">
 <span>P0 CRITICAL RISK</span>
 <ShieldAlert className="w-4 h-4 text-semantic-error" />
 </div>
 <div className="text-3xl font-display text-semantic-error font-semibold">{criticalCount}</div>
 <div className="mt-2 text-[11px] text-body flex items-center gap-1.5">
 <span className="text-semantic-error font-medium">{criticalCount} clinics &le; 48h supply</span>
 </div>
 </div>

 {/* KPI 3: Ward Bed Saturation */}
 <div className="bg-surface-card border border-hairline rounded-lg p-4 shadow-xs">
 <div className="flex items-center justify-between text-muted text-xs mb-1.5 font-mono">
 <span>BED OCCUPANCY</span>
 <Bed className="w-4 h-4 text-muted" />
 </div>
 <div className="text-3xl font-display text-ink">{bedOccupancyPct}%</div>
 <div className="mt-2 text-[11px] text-body flex items-center gap-1.5">
 <span className="text-muted">{occupiedBeds} / {totalBeds} beds occupied</span>
 </div>
 </div>

 {/* KPI 4: 7-Day Forecast Accuracy */}
 <div className="bg-surface-card border border-hairline rounded-lg p-4 shadow-xs">
 <div className="flex items-center justify-between text-muted text-xs mb-1.5 font-mono">
 <span>7-DAY FORECAST WAPE</span>
 <TrendingUp className="w-4 h-4 text-semantic-success" />
 </div>
 <div className="text-3xl font-display text-semantic-success font-semibold">17.48%</div>
 <div className="mt-2 text-[11px] text-body flex items-center gap-1.5">
 <span className="font-mono text-muted">LightGBM Tweedie (p=1.3)</span>
 </div>
 </div>

 </div>

 {/* Two Column Section: Live Alert Stream + Quick Navigation Cards */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 
 {/* Left Column: Live Emergency Alerts Feed (7 Cols) */}
 <div className="lg:col-span-7 bg-surface-card border border-hairline rounded-lg p-5 shadow-xs">
 <div className="flex items-center justify-between mb-4">
 <div>
 <h2 className="text-sm font-semibold text-ink">Active System Alerts & Autonomous Actions</h2>
 <p className="text-xs text-muted">Real-time alerts streamed via Server-Sent Events (SSE)</p>
 </div>
 <button
 onClick={() => onNavigateTab('alerts')}
 className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
 >
 <span>View All</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </button>
 </div>

 <div className="space-y-3">
 {alerts.slice(0, 3).map((alert) => (
 <div
 key={alert.id}
 className="p-3.5 bg-canvas-soft border border-hairline rounded-md text-xs space-y-1.5"
 >
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <span
 className={`text-[10px] font-mono px-2 py-0.5 rounded-pill font-bold ${
 alert.severity === 'P0'
 ? 'bg-red-100 text-semantic-error'
 : 'bg-amber-100 text-amber-800'
 }`}
 >
 {alert.severity} ALERT
 </span>
 <span className="font-semibold text-ink">{alert.facility_name}</span>
 </div>
 <span className="text-[11px] font-mono text-muted">{alert.timestamp}</span>
 </div>
 <p className="text-body leading-relaxed text-[11.5px]">{alert.description_en}</p>
 </div>
 ))}
 </div>
 </div>

 {/* Right Column: Module Fast-Navigation Panels (5 Cols) */}
 <div className="lg:col-span-5 space-y-3">
 
 {/* Quick Nav 1: GIS Map */}
 <div
 onClick={() => onNavigateTab('map')}
 className="p-4 bg-surface-card hover:bg-canvas-soft border border-hairline rounded-lg cursor-pointer transition-colors shadow-xs flex items-center justify-between"
 >
 <div>
 <h3 className="text-xs font-semibold text-ink mb-0.5">Interactive GIS & Quantum Routing</h3>
 <p className="text-[11px] text-muted">Explore clinic map, quantum paths, and Google Maps GPS navigation.</p>
 </div>
 <ArrowRight className="w-4 h-4 text-muted shrink-0 ml-3" />
 </div>

 {/* Quick Nav 2: FEFO Inventory */}
 <div
 onClick={() => onNavigateTab('inventory')}
 className="p-4 bg-surface-card hover:bg-canvas-soft border border-hairline rounded-lg cursor-pointer transition-colors shadow-xs flex items-center justify-between"
 >
 <div>
 <h3 className="text-xs font-semibold text-ink mb-0.5">FEFO Pharmaceutical Inventory</h3>
 <p className="text-[11px] text-muted">Audit batch expiries, current stock balances, and allocate transfers.</p>
 </div>
 <ArrowRight className="w-4 h-4 text-muted shrink-0 ml-3" />
 </div>

 {/* Quick Nav 3: Register OCR */}
 <div
 onClick={() => onNavigateTab('ocr')}
 className="p-4 bg-surface-card hover:bg-canvas-soft border border-hairline rounded-lg cursor-pointer transition-colors shadow-xs flex items-center justify-between"
 >
 <div>
 <h3 className="text-xs font-semibold text-ink mb-0.5">OpenCV & Gemini Register OCR</h3>
 <p className="text-[11px] text-muted">Digitize paper clinic registers with 0.0° Hough deskewing in 1.4s.</p>
 </div>
 <ArrowRight className="w-4 h-4 text-muted shrink-0 ml-3" />
 </div>

 </div>

 </div>

 </div>
 );
};
