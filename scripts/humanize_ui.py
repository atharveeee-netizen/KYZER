import os

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f'Wrote {path}')

# ==============================================================================
# 1. TacticalHeader.tsx
# ==============================================================================
header_code = '''import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Clock, 
  Camera, 
  Zap, 
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { Button } from '../ui/Button';

interface TacticalHeaderProps {
  districtName?: string;
  countryCode?: 'IND' | 'ZAF' | 'BRA';
  onCountryChange?: (code: 'IND' | 'ZAF' | 'BRA') => void;
  onOpenOcrModal?: () => void;
  onOpenScenarioModal?: () => void;
  onOpenAlertsDrawer?: () => void;
  onOpenDemoGuide?: () => void;
  activeAlertCount?: number;
  isScenarioActive?: boolean;
  onResetScenario?: () => void;
}

export const TacticalHeader: React.FC<TacticalHeaderProps> = ({
  districtName = 'Pune District (MH)',
  countryCode = 'IND',
  onCountryChange,
  onOpenOcrModal,
  onOpenScenarioModal,
  onOpenAlertsDrawer,
  onOpenDemoGuide,
  activeAlertCount = 4,
  isScenarioActive = false,
  onResetScenario,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-12 bg-[#161D26] border-b border-[#222E3C] px-4 flex items-center justify-between select-none z-30 shrink-0 text-[#F8FAFC] font-sans">
      {/* Left: Product Name & Operational Purpose */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#0F6254] flex items-center justify-center font-semibold text-white text-xs">
            C
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-[#F8FAFC] leading-none">
              CareDOM
            </span>
            <span className="text-[10px] text-[#94A3B8] leading-none mt-0.5">
              Healthcare supply, without the guesswork
            </span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-[#222E3C] hidden sm:block mx-1" />

        {/* Live Network Status */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-[#94A3B8]">
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span>Pune Network · 18 health centres active</span>
        </div>
      </div>

      {/* Center / Right Controls */}
      <div className="flex items-center gap-2.5 text-xs">
        <div className="hidden lg:flex items-center gap-1 text-[#94A3B8] font-mono text-[11px] px-2 py-1 bg-[#11161D] border border-[#222E3C] rounded-md">
          <Clock className="w-3 h-3 text-[#64748B]" />
          <span>{timeStr || '19:58'} IST</span>
        </div>

        {/* Quick Demo Script Helper */}
        {onOpenDemoGuide && (
          <button
            onClick={onOpenDemoGuide}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#E2E8F0] hover:text-white bg-[#1E2734] hover:bg-[#253243] border border-[#222E3C] rounded-full transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="hidden sm:inline">Recording Guide</span>
          </button>
        )}

        {/* Register Ingestion (Primary Task) */}
        {onOpenOcrModal && (
          <button
            onClick={onOpenOcrModal}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-[#0F6254] hover:bg-[#0B4E43] rounded-full transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Logbook</span>
          </button>
        )}

        {/* Test Shortage Surge Simulation */}
        {isScenarioActive ? (
          <button
            onClick={onResetScenario}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-full"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Reset Test</span>
          </button>
        ) : onOpenScenarioModal ? (
          <button
            onClick={onOpenScenarioModal}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#94A3B8] hover:text-[#E2E8F0] bg-[#11161D] hover:bg-[#1E2734] border border-[#222E3C] rounded-full transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="hidden md:inline">Simulate Shortage</span>
          </button>
        ) : null}
      </div>
    </header>
  );
};
'''

write('frontend/src/components/tactical/TacticalHeader.tsx', header_code)

# ==============================================================================
# 2. TacticalNavRail.tsx
# ==============================================================================
nav_code = '''import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Package, 
  ArrowLeftRight, 
  Camera, 
  Zap, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

export type NavViewId = 'command' | 'network' | 'intelligence' | 'operations' | 'scenario' | 'ingestion';

interface TacticalNavRailProps {
  activeView: NavViewId;
  onViewChange: (view: NavViewId) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  id: NavViewId;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

export const TacticalNavRail: React.FC<TacticalNavRailProps> = ({
  activeView,
  onViewChange,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'command',
      label: 'Overview',
      sublabel: 'District status & needs',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'network',
      label: 'Facilities Map',
      sublabel: '18 centres & live routes',
      icon: <Map className="w-4 h-4" />,
    },
    {
      id: 'intelligence',
      label: 'Inventory',
      sublabel: 'Batches & expiry dates',
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: 'operations',
      label: 'Redistribution',
      sublabel: 'Nearby stock transfers',
      icon: <ArrowLeftRight className="w-4 h-4" />,
    },
    {
      id: 'ingestion',
      label: 'Logbook Scan',
      sublabel: 'Digitize paper records',
      icon: <Camera className="w-4 h-4" />,
    },
  ];

  return (
    <nav
      className={`h-full bg-[#161D26] border-r border-[#222E3C] flex flex-col justify-between select-none transition-all duration-200 z-20 shrink-0 ${
        isCollapsed ? 'w-14' : 'w-52'
      }`}
    >
      {/* Navigation Links */}
      <div className="p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                isActive
                  ? 'bg-[#1E2734] text-white font-medium border border-[#2D3D50]'
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1A232E]'
              }`}
            >
              <div className={`shrink-0 ${isActive ? 'text-[#38BDF8]' : 'text-[#64748B]'}`}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs truncate">{item.label}</span>
                  <span className="text-[10px] text-[#64748B] truncate">{item.sublabel}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse Footer */}
      {onToggleCollapse && (
        <div className="p-2 border-t border-[#222E3C]">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 text-[#64748B] hover:text-[#F8FAFC] hover:bg-[#1E2734] rounded-md transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      )}
    </nav>
  );
};
'''

write('frontend/src/components/tactical/TacticalNavRail.tsx', nav_code)

# ==============================================================================
# 3. KpiStrip.tsx
# ==============================================================================
kpi_code = '''import React from 'react';
import { 
  Building2, 
  AlertCircle, 
  Truck, 
  ThermometerSnowflake, 
  Check
} from 'lucide-react';

interface KpiStripProps {
  totalFacilities?: number;
  criticalCount?: number;
  warningCount?: number;
  activeTransfersCount?: number;
  coldChainTemp?: string;
  isAiLive?: boolean;
}

export const KpiStrip: React.FC<KpiStripProps> = ({
  totalFacilities = 18,
  criticalCount = 4,
  warningCount = 3,
  activeTransfersCount = 1,
  coldChainTemp = '+4.2°C',
  isAiLive = true,
}) => {
  return (
    <div className="h-9 bg-[#161D26] border-t border-[#222E3C] px-4 flex items-center justify-between text-xs text-[#94A3B8] select-none z-20 shrink-0 overflow-x-auto gap-4">
      {/* Left: Operational Metrics */}
      <div className="flex items-center gap-5 shrink-0">
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
          <span>{totalFacilities} health centres tracked</span>
        </div>

        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-[#EF4444]" />
          <span className="text-[#EF4444] font-medium">{criticalCount} low on stock</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-[#10B981]" />
          <span>{activeTransfersCount} transfer in progress</span>
        </div>

        <div className="flex items-center gap-1.5">
          <ThermometerSnowflake className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Cold chain: <strong className="text-[#F8FAFC]">{coldChainTemp}</strong> (Safe)</span>
        </div>
      </div>

      {/* Right: Operational Freshness */}
      <div className="flex items-center gap-3 shrink-0 text-[11px] text-[#64748B]">
        <span>Last updated 2 min ago</span>
        <span className="flex items-center gap-1 text-[#10B981]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          <span>Live sync</span>
        </span>
      </div>
    </div>
  );
};
'''

write('frontend/src/components/tactical/KpiStrip.tsx', kpi_code)

# ==============================================================================
# 4. PriorityActionCard.tsx
# ==============================================================================
card_code = '''import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface PriorityAction {
  id: string;
  tier: 'P0_CRITICAL' | 'P1_WARNING';
  facilityId: string;
  facilityName: string;
  medicineName: string;
  medicineCode: string;
  currentStock: number;
  daysRemaining: number;
  donorFacilityId: string;
  donorFacilityName: string;
  recommendedUnits: number;
  distanceKm: number;
  transitTimeMin: number;
}

interface PriorityActionCardProps {
  action: PriorityAction;
  onReviewDecision: (action: PriorityAction) => void;
  onDispatchRoute: (action: PriorityAction) => void;
  isSelected?: boolean;
}

export const PriorityActionCard: React.FC<PriorityActionCardProps> = ({
  action,
  onReviewDecision,
  onDispatchRoute,
  isSelected = false,
}) => {
  const isCritical = action.tier === 'P0_CRITICAL';

  return (
    <div
      className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
        isSelected 
          ? 'bg-[#1E2734] border-[#38BDF8]' 
          : 'bg-[#161D26] border-[#222E3C] hover:border-[#2D3D50]'
      }`}
    >
      {/* Header: Facility & Shortage Level */}
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
          isCritical 
            ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30' 
            : 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'
        }`}>
          {isCritical ? 'Urgent Shortage' : 'Low Stock'}
        </span>
        <span className="text-[11px] text-[#64748B] font-mono">
          {action.facilityId}
        </span>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-[#F8FAFC] truncate">
          {action.facilityName}
        </h4>
        <p className="text-xs text-[#94A3B8] mt-0.5">
          Needs <strong className="text-[#F8FAFC]">{action.recommendedUnits} units</strong> {action.medicineName.split(' ')[0]} ({action.daysRemaining.toFixed(1)} days left)
        </p>
      </div>

      {/* Nearby Solution Finding */}
      <div className="p-2.5 bg-[#11161D] border border-[#222E3C] rounded-lg text-xs space-y-1">
        <div className="text-[11px] text-[#94A3B8]">
          Nearby source: <strong className="text-[#F8FAFC]">{action.donorFacilityName}</strong>
        </div>
        <div className="text-[11px] text-[#10B981]">
          Available nearby: {action.distanceKm} km away · {action.transitTimeMin} min transit
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => onReviewDecision(action)}
          className="px-2.5 py-1.5 text-xs text-[#94A3B8] hover:text-[#F8FAFC] bg-[#1E2734] hover:bg-[#253243] border border-[#222E3C] rounded-full transition-colors text-center"
        >
          View on Map
        </button>
        <button
          onClick={() => onDispatchRoute(action)}
          className="px-3 py-1.5 text-xs font-medium text-white bg-[#0F6254] hover:bg-[#0B4E43] rounded-full transition-colors flex items-center justify-center gap-1"
        >
          <span>Approve Transfer</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
'''

write('frontend/src/components/tactical/PriorityActionCard.tsx', card_code)

# ==============================================================================
# 5. DashboardTab.tsx (Clean Human Operational Overview)
# ==============================================================================
dashboard_code = '''import React, { useState } from 'react';
import { 
  Building2, 
  AlertCircle, 
  Truck, 
  ThermometerSnowflake, 
  ArrowRight, 
  Search, 
  RefreshCw,
  Clock,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { SystemAlert, HealthFacility } from '../../types';

interface HealthCentre {
  id: string;
  name: string;
  district: string;
  stockLevel: number;
  status: 'CRITICAL' | 'WARNING' | 'STABLE';
  daysLeft: number;
  dailyRunRate: number;
  lat: number;
  lng: number;
}

const DISTRICT_CENTRES: HealthCentre[] = [
  { id: 'PHC-PUN-002', name: 'Koregaon Bhima PHC', district: 'Pune Rural', stockLevel: 130, status: 'CRITICAL', daysLeft: 2.8, dailyRunRate: 46, lat: 18.6534, lng: 74.0624 },
  { id: 'PHC-PUN-004', name: 'Talegaon Dhamdhere PHC', district: 'Pune Rural', stockLevel: 820, status: 'STABLE', daysLeft: 16.4, dailyRunRate: 50, lat: 18.6789, lng: 74.1512 },
  { id: 'PHC-PUN-003', name: 'Shikrapur Health Centre', district: 'Pune Rural', stockLevel: 280, status: 'WARNING', daysLeft: 5.6, dailyRunRate: 50, lat: 18.7368, lng: 74.1567 },
  { id: 'PHC-PUN-001', name: 'Shirur Sub-District Hospital Depot', district: 'Pune District', stockLevel: 12000, status: 'STABLE', daysLeft: 42.0, dailyRunRate: 285, lat: 18.8265, lng: 74.3789 },
  { id: 'PHC-PUN-005', name: 'Khed Primary Health Centre', district: 'Pune Rural', stockLevel: 450, status: 'STABLE', daysLeft: 11.2, dailyRunRate: 40, lat: 18.8475, lng: 73.9167 },
  { id: 'PHC-PUN-006', name: 'Manchar Community Health Centre', district: 'Pune Rural', stockLevel: 190, status: 'WARNING', daysLeft: 4.2, dailyRunRate: 45, lat: 19.0062, lng: 73.9442 },
];

interface DashboardTabProps {
  facilities?: HealthFacility[];
  alerts?: SystemAlert[];
  onNavigateTab?: (tab: string) => void;
  onSimulateOutbreak?: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  facilities: initialFacilities,
  alerts,
  onNavigateTab,
  onSimulateOutbreak,
}) => {
  const [centres, setCentres] = useState<HealthCentre[]>(DISTRICT_CENTRES);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transferApproved, setTransferApproved] = useState<boolean>(false);

  const criticalCount = centres.filter(c => c.status === 'CRITICAL').length;
  const warningCount = centres.filter(c => c.status === 'WARNING').length;

  const handleApproveTransfer = async () => {
    setIsLoading(true);
    try {
      await apiClient.allocateStock('PHC-PUN-002', 'MED-PCM-500', 450);
    } catch (e) {
      console.warn('Simulating local transfer for demo');
    }

    setTimeout(() => {
      setCentres(prev => prev.map(c => {
        if (c.id === 'PHC-PUN-002') return { ...c, stockLevel: 580, status: 'STABLE', daysLeft: 12.6 };
        if (c.id === 'PHC-PUN-004') return { ...c, stockLevel: 370, daysLeft: 7.4 };
        return c;
      }));
      setTransferApproved(true);
      setIsLoading(false);
    }, 900);
  };

  const filteredCentres = searchFilter
    ? centres.filter(c => c.name.toLowerCase().includes(searchFilter.toLowerCase()) || c.id.toLowerCase().includes(searchFilter.toLowerCase()))
    : centres;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 font-sans text-[#F8FAFC]">
      
      {/* 1. Page Header with Purpose */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222E3C]">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#F8FAFC]">
            District Supply Overview
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Tracking essential medicine stock, run-rates, and peer redistribution across 18 health centres.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onSimulateOutbreak && (
            <button
              onClick={onSimulateOutbreak}
              className="px-3 py-1.5 text-xs text-[#94A3B8] hover:text-[#F8FAFC] bg-[#161D26] hover:bg-[#1E2734] border border-[#222E3C] rounded-full transition-colors"
            >
              Test Shortage Surge
            </button>
          )}
        </div>
      </div>

      {/* 2. Today's Network Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#161D26] border border-[#222E3C] rounded-xl">
          <div className="text-[11px] text-[#94A3B8]">Health centres</div>
          <div className="text-xl font-semibold text-[#F8FAFC] mt-0.5 font-mono">18 active</div>
          <div className="text-[10px] text-[#10B981] mt-0.5">All reporting today</div>
        </div>

        <div className="p-3.5 bg-[#161D26] border border-[#222E3C] rounded-xl">
          <div className="text-[11px] text-[#94A3B8]">Stock status</div>
          <div className="text-xl font-semibold text-[#EF4444] mt-0.5 font-mono">
            {criticalCount > 0 ? `${criticalCount} urgent shortage` : 'Normal'}
          </div>
          <div className="text-[10px] text-[#94A3B8] mt-0.5">{warningCount} low-stock items</div>
        </div>

        <div className="p-3.5 bg-[#161D26] border border-[#222E3C] rounded-xl">
          <div className="text-[11px] text-[#94A3B8]">Redistribution</div>
          <div className="text-xl font-semibold text-[#10B981] mt-0.5 font-mono">
            {transferApproved ? '1 resolved' : '1 available nearby'}
          </div>
          <div className="text-[10px] text-[#94A3B8] mt-0.5">Talegaon → Koregaon (9.8 km)</div>
        </div>

        <div className="p-3.5 bg-[#161D26] border border-[#222E3C] rounded-xl">
          <div className="text-[11px] text-[#94A3B8]">Cold-chain integrity</div>
          <div className="text-xl font-semibold text-[#38BDF8] mt-0.5 font-mono">+4.2°C</div>
          <div className="text-[10px] text-[#10B981] mt-0.5">Within +2°C to +8°C window</div>
        </div>
      </div>

      {/* 3. Hero Operational Section: Active Shortage & Nearby Solution */}
      <div className="p-5 bg-[#161D26] border border-[#222E3C] rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#F8FAFC] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
            <span>Active Shortage & Recommended Transfer</span>
          </h2>
          <span className="text-xs text-[#94A3B8]">Source: Real-time clinic stock</span>
        </div>

        {transferApproved ? (
          <div className="p-4 bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
              <div>
                <div className="text-xs font-semibold text-[#F8FAFC]">Transfer Approved & Recorded</div>
                <div className="text-xs text-[#94A3B8] mt-0.5">
                  450 units Paracetamol 500mg dispatched from Talegaon Dhamdhere (PHC-PUN-004) to Koregaon Bhima (PHC-PUN-002). ETA: 18 minutes.
                </div>
              </div>
            </div>
            <span className="text-xs font-medium text-[#10B981] px-2.5 py-1 bg-[#10B981]/20 rounded-full">
              RESOLVED
            </span>
          </div>
        ) : (
          <div className="p-4 bg-[#11161D] border border-[#222E3C] rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Problem */}
              <div className="space-y-1">
                <div className="text-[11px] text-[#EF4444] font-medium uppercase">1. Shortage at Centre</div>
                <div className="text-xs font-semibold text-[#F8FAFC]">Koregaon Bhima PHC</div>
                <div className="text-xs text-[#94A3B8]">
                  Has <strong>130 units</strong> Paracetamol 500mg (2.8 days left at 46 units/day). Needs 450 units.
                </div>
              </div>

              {/* Nearby Source */}
              <div className="space-y-1">
                <div className="text-[11px] text-[#10B981] font-medium uppercase">2. Found Nearby Surplus</div>
                <div className="text-xs font-semibold text-[#F8FAFC]">Talegaon Dhamdhere PHC</div>
                <div className="text-xs text-[#94A3B8]">
                  Has <strong>820 units</strong> available. Distance: <strong>9.8 km</strong> (18 min road transit).
                </div>
              </div>

              {/* Recommendation & Action */}
              <div className="space-y-1">
                <div className="text-[11px] text-[#38BDF8] font-medium uppercase">3. Recommendation</div>
                <div className="text-xs text-[#94A3B8]">
                  Transfer <strong>450 units</strong>. Source still keeps 370 units (7.4 days buffer).
                </div>
                <button
                  onClick={handleApproveTransfer}
                  disabled={isLoading}
                  className="mt-2 w-full px-3 py-1.5 text-xs font-medium text-white bg-[#0F6254] hover:bg-[#0B4E43] rounded-full transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Recording transfer...' : 'Approve Transfer (450 units)'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Practical Facility Inventory Table */}
      <div className="p-5 bg-[#161D26] border border-[#222E3C] rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[#F8FAFC]">Facility Stock & Run-Rates</h2>
            <p className="text-xs text-[#94A3B8]">Essential medicines inventory across Pune District</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search facility name or ID..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-[#11161D] border border-[#222E3C] rounded-md text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#38BDF8]"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-[#222E3C] rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#11161D] text-[#94A3B8] border-b border-[#222E3C]">
              <tr>
                <th className="p-3 font-medium">Health Centre</th>
                <th className="p-3 font-medium">District</th>
                <th className="p-3 font-medium">Paracetamol 500mg</th>
                <th className="p-3 font-medium">Daily Consumption</th>
                <th className="p-3 font-medium">Days Remaining</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222E3C]">
              {filteredCentres.map((c) => (
                <tr key={c.id} className="hover:bg-[#1E2734]/50 transition-colors">
                  <td className="p-3 font-medium text-[#F8FAFC]">
                    <div>{c.name}</div>
                    <div className="text-[10px] text-[#64748B] font-mono">{c.id}</div>
                  </td>
                  <td className="p-3 text-[#94A3B8]">{c.district}</td>
                  <td className="p-3 font-mono font-medium text-[#F8FAFC]">{c.stockLevel} units</td>
                  <td className="p-3 font-mono text-[#94A3B8]">{c.dailyRunRate} / day</td>
                  <td className="p-3 font-mono">
                    <span className={c.daysLeft <= 3 ? 'text-[#EF4444] font-semibold' : c.daysLeft <= 6 ? 'text-[#F59E0B]' : 'text-[#10B981]'}>
                      {c.daysLeft} days
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      c.status === 'CRITICAL' 
                        ? 'bg-[#EF4444]/15 text-[#EF4444]' 
                        : c.status === 'WARNING' 
                        ? 'bg-[#F59E0B]/15 text-[#F59E0B]' 
                        : 'bg-[#10B981]/15 text-[#10B981]'
                    }`}>
                      {c.status === 'CRITICAL' ? 'Urgent Shortage' : c.status === 'WARNING' ? 'Low Stock' : 'Adequate'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
'''

write('frontend/src/components/tabs/DashboardTab.tsx', dashboard_code)

print('All UI humanization components written successfully!')