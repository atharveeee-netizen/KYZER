import os

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f'Wrote {path}')

# ==============================================================================
# 1. frontend/src/components/tactical/TacticalHeader.tsx
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
    <header className="h-12 bg-[#161616] border-b border-[#393939] px-4 flex items-center justify-between select-none z-30 shrink-0 text-[#F4F4F4] font-sans">
      {/* Left: Product Name & Human Purpose */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-none bg-[#0F62FE] flex items-center justify-center font-mono font-bold text-white text-xs">
            K
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-white leading-none">
              KYZER
            </span>
            <span className="text-[11px] text-[#C6C6C6] font-light leading-none mt-0.5">
              Healthcare supply, where it matters.
            </span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-[#393939] hidden sm:block mx-1" />

        {/* Live Network Status */}
        <div className="hidden md:flex items-center gap-2 text-xs text-[#C6C6C6]">
          <span className="w-2 h-2 rounded-none bg-[#24A148]" />
          <span>Pune District · 18 health centres online</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 text-xs">
        <div className="hidden lg:flex items-center gap-1.5 text-[#C6C6C6] font-mono text-[11px] px-2.5 py-1 bg-[#262626] border border-[#393939] rounded-none">
          <Clock className="w-3 h-3 text-[#8D8D8D]" />
          <span>{timeStr || '19:58'} IST</span>
        </div>

        {/* Demo Recording Guide */}
        {onOpenDemoGuide && (
          <button
            onClick={onOpenDemoGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-[#262626] hover:bg-[#393939] border border-[#393939] rounded-none transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#0F62FE]" />
            <span className="hidden sm:inline">Recording Guide</span>
          </button>
        )}

        {/* Register Ingestion CTA */}
        {onOpenOcrModal && (
          <button
            onClick={onOpenOcrModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-normal text-white bg-[#0F62FE] hover:bg-[#0043CE] rounded-none transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Logbook</span>
          </button>
        )}

        {/* Test Shortage Simulation */}
        {isScenarioActive ? (
          <button
            onClick={onResetScenario}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#F1C21B] bg-[#F1C21B]/10 border border-[#F1C21B]/40 rounded-none"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Reset Test</span>
          </button>
        ) : onOpenScenarioModal ? (
          <button
            onClick={onOpenScenarioModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#C6C6C6] hover:text-white bg-[#262626] hover:bg-[#393939] border border-[#393939] rounded-none transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-[#F1C21B]" />
            <span className="hidden md:inline">Simulate Shortage</span>
          </button>
        ) : null}
      </div>
    </header>
  );
};'''

write('frontend/src/components/tactical/TacticalHeader.tsx', header_code)

# ==============================================================================
# 2. frontend/src/components/tactical/PriorityActionCard.tsx
# ==============================================================================
card_code = '''import React, { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, Info } from 'lucide-react';
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
  const [showExplanation, setShowExplanation] = useState(false);
  const isCritical = action.tier === 'P0_CRITICAL';

  return (
    <div
      className={`p-4 rounded-none border transition-all space-y-3 font-sans ${
        isSelected 
          ? 'bg-[#262626] border-[#0F62FE]' 
          : 'bg-[#161616] border-[#393939] hover:border-[#6F6F6F]'
      }`}
    >
      {/* 1. Something is wrong */}
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-none border ${
          isCritical 
            ? 'bg-[#DA1E28]/15 text-[#FA4D56] border-[#DA1E28]/40' 
            : 'bg-[#F1C21B]/15 text-[#F1C21B] border-[#F1C21B]/40'
        }`}>
          {isCritical ? 'Likely shortage in 3 days' : 'Buffer Warning'}
        </span>
        <span className="text-[11px] text-[#8D8D8D] font-mono">
          {action.facilityId}
        </span>
      </div>

      <div>
        <h4 className="text-sm font-normal text-white truncate">
          {action.facilityName}
        </h4>
        <p className="text-xs text-[#C6C6C6] mt-0.5 font-light leading-relaxed">
          Needs <strong className="text-white font-mono">{action.recommendedUnits} units</strong> {action.medicineName.split(' ')[0]} ({action.currentStock} on hand, {action.daysRemaining.toFixed(1)} days left)
        </p>
      </div>

      {/* 2. Investigation & 3. Best Match */}
      <div className="p-3 bg-[#262626] border border-[#393939] rounded-none text-xs space-y-1.5">
        <div className="text-[11px] text-[#8D8D8D]">
          Found 3 possible sources nearby · Best match:
        </div>
        <div className="text-xs font-normal text-white">
          {action.donorFacilityName}
        </div>
        <div className="text-[11px] text-[#24A148] font-mono">
          Available: 820 units · Distance: {action.distanceKm} km · Travel: {action.transitTimeMin} min
        </div>
      </div>

      {/* 4. Why this facility? (Progressive Disclosure) */}
      <div className="border border-[#393939] bg-[#161616] p-2.5 rounded-none space-y-2">
        <div className="flex items-start gap-2 text-xs text-[#C6C6C6] font-light leading-relaxed">
          <Info className="w-3.5 h-3.5 text-[#0F62FE] shrink-0 mt-0.5" />
          <div>
            <strong className="text-white font-normal">Why this facility? </strong>
            It has enough stock to fulfill the request while remaining well above its safety threshold, and it is the closest available source.
          </div>
        </div>

        <button
          onClick={() => setShowExplanation(prev => !prev)}
          className="text-[11px] text-[#0F62FE] hover:underline flex items-center gap-1 font-mono pt-1"
        >
          <span>{showExplanation ? 'Hide calculation details' : 'How was this calculated?'}</span>
          {showExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showExplanation && (
          <div className="pt-2 border-t border-[#393939] text-[11px] text-[#8D8D8D] space-y-1 font-mono leading-relaxed">
            <div>• Consumption run-rate: 46 units/day (forecast model)</div>
            <div>• Safety constraint: Donor keeps &gt;7-day reserve ({action.recommendedUnits === 50 ? '770 units' : '370 units'} buffer)</div>
            <div>• Real-road routing: OSRM corridor + WHO cold-chain temperature limit (+4.2°C)</div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={() => onReviewDecision(action)}
          className="px-3 py-2 text-xs text-[#C6C6C6] hover:text-white bg-[#262626] hover:bg-[#393939] border border-[#393939] rounded-none transition-colors text-center"
        >
          View on Map
        </button>
        <button
          onClick={() => onDispatchRoute(action)}
          className="px-3 py-2 text-xs font-normal text-white bg-[#0F62FE] hover:bg-[#0043CE] rounded-none transition-colors flex items-center justify-center gap-1.5"
        >
          <span>Approve Transfer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};'''

write('frontend/src/components/tactical/PriorityActionCard.tsx', card_code)

# ==============================================================================
# 3. frontend/src/components/tabs/DashboardTab.tsx (Human Information Architecture)
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
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp
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

interface OpenRequest {
  id: string;
  facilityId: string;
  facilityName: string;
  item: string;
  qtyNeeded: number;
  urgency: string;
  nearbySource: string;
  distanceKm: number;
  transitTimeMin: number;
  status: 'OPEN' | 'RESOLVED';
}

const INITIAL_REQUESTS: OpenRequest[] = [
  {
    id: 'REQ-001',
    facilityId: 'PHC-PUN-002',
    facilityName: 'Pune PHC (Koregaon Bhima)',
    item: 'Paracetamol 500mg',
    qtyNeeded: 50,
    urgency: 'Likely shortage in 3 days',
    nearbySource: 'Pune Rural Centre (Talegaon Dhamdhere)',
    distanceKm: 8.4,
    transitTimeMin: 18,
    status: 'OPEN',
  },
  {
    id: 'REQ-002',
    facilityId: 'PHC-PUN-006',
    facilityName: 'Manchar Community Health Centre',
    item: 'IV Infusion Set 0.9% Saline',
    qtyNeeded: 20,
    urgency: 'Stock low (4.2 days left)',
    nearbySource: 'Khed Primary Health Centre',
    distanceKm: 14.2,
    transitTimeMin: 24,
    status: 'OPEN',
  },
  {
    id: 'REQ-003',
    facilityId: 'PHC-PUN-003',
    facilityName: 'Shikrapur Health Centre',
    item: 'Oral Rehydration Salts (ORS)',
    qtyNeeded: 100,
    urgency: 'Buffer warning (5.6 days left)',
    nearbySource: 'Shirur Hospital Depot',
    distanceKm: 22.0,
    transitTimeMin: 32,
    status: 'OPEN',
  },
];

const DISTRICT_CENTRES: HealthCentre[] = [
  { id: 'PHC-PUN-002', name: 'Pune PHC (Koregaon Bhima)', district: 'Pune Rural', stockLevel: 130, status: 'CRITICAL', daysLeft: 2.8, dailyRunRate: 46, lat: 18.6534, lng: 74.0624 },
  { id: 'PHC-PUN-004', name: 'Pune Rural Centre (Talegaon Dhamdhere)', district: 'Pune Rural', stockLevel: 820, status: 'STABLE', daysLeft: 16.4, dailyRunRate: 50, lat: 18.6789, lng: 74.1512 },
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
  const [requests, setRequests] = useState<OpenRequest[]>(INITIAL_REQUESTS);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const openRequestsCount = requests.filter(r => r.status === 'OPEN').length;
  const belowStockCount = centres.filter(c => c.daysLeft < 5).length;
  const redistributionCount = requests.filter(r => r.status === 'OPEN').length;

  const handleApproveTransfer = async (reqId: string) => {
    setIsLoading(true);
    try {
      await apiClient.allocateStock('PHC-PUN-002', 'MED-PCM-500', 50);
    } catch (e) {
      console.warn('Simulating local transfer for demo');
    }

    setTimeout(() => {
      setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'RESOLVED' } : r));
      setCentres(prev => prev.map(c => {
        if (c.id === 'PHC-PUN-002') return { ...c, stockLevel: 180, status: 'STABLE', daysLeft: 3.9 };
        if (c.id === 'PHC-PUN-004') return { ...c, stockLevel: 770, daysLeft: 15.4 };
        return c;
      }));
      setIsLoading(false);
    }, 800);
  };

  const filteredCentres = searchFilter
    ? centres.filter(c => c.name.toLowerCase().includes(searchFilter.toLowerCase()) || c.id.toLowerCase().includes(searchFilter.toLowerCase()))
    : centres;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 font-sans text-[#F4F4F4]">
      
      {/* 1. Human Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#393939]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
            Good afternoon. Here's what needs attention.
          </h1>
          <p className="text-xs text-[#C6C6C6] mt-1 font-light">
            Pune District Health Supply Network · Tracking stock and peer redistribution across 18 health centres.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onSimulateOutbreak && (
            <button
              onClick={onSimulateOutbreak}
              className="px-3.5 py-2 text-xs text-[#C6C6C6] hover:text-white bg-[#262626] hover:bg-[#393939] border border-[#393939] rounded-none transition-colors"
            >
              Test Shortage Surge
            </button>
          )}
        </div>
      </div>

      {/* 2. Calm Operational Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-[#161616] border border-[#393939] rounded-none">
          <div className="text-[11px] text-[#8D8D8D]">Open requests</div>
          <div className="text-2xl font-light text-white mt-1 font-mono">{openRequestsCount} pending</div>
          <div className="text-[11px] text-[#C6C6C6] mt-1">Across 3 facilities</div>
        </div>

        <div className="p-4 bg-[#161616] border border-[#393939] rounded-none">
          <div className="text-[11px] text-[#8D8D8D]">Stock alerts</div>
          <div className="text-2xl font-light text-[#FA4D56] mt-1 font-mono">
            {belowStockCount} below stock
          </div>
          <div className="text-[11px] text-[#C6C6C6] mt-1">Buffer &lt; 5.0 days</div>
        </div>

        <div className="p-4 bg-[#161616] border border-[#393939] rounded-none">
          <div className="text-[11px] text-[#8D8D8D]">Redistribution</div>
          <div className="text-2xl font-light text-[#24A148] mt-1 font-mono">
            {redistributionCount > 0 ? `${redistributionCount} opportunities` : 'All resolved'}
          </div>
          <div className="text-[11px] text-[#C6C6C6] mt-1">Matched nearby</div>
        </div>

        <div className="p-4 bg-[#161616] border border-[#393939] rounded-none">
          <div className="text-[11px] text-[#8D8D8D]">Cold chain</div>
          <div className="text-2xl font-light text-[#0F62FE] mt-1 font-mono">+4.2°C</div>
          <div className="text-[11px] text-[#24A148] mt-1">Within safe limits</div>
        </div>
      </div>

      {/* 3. The Core Story: Featured Redistribution Recommendation */}
      <div className="p-5 bg-[#161616] border border-[#393939] rounded-none space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-[#0F62FE]" />
            <h2 className="text-base font-normal text-white">Redistribution Recommendation</h2>
          </div>
          <span className="text-xs text-[#8D8D8D] font-mono">Priority Case 1 of {openRequestsCount}</span>
        </div>

        {requests[0].status === 'RESOLVED' ? (
          <div className="p-4 bg-[#24A148]/10 border border-[#24A148]/40 rounded-none flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#24A148] shrink-0" />
              <div>
                <div className="text-sm font-medium text-white">Transfer Approved & Inventory Updated</div>
                <div className="text-xs text-[#C6C6C6] mt-0.5 font-light">
                  50 units Paracetamol 500mg dispatched from Pune Rural Centre to Pune PHC. Travel: 18 min.
                </div>
              </div>
            </div>
            <span className="text-xs font-mono text-[#24A148] px-3 py-1 bg-[#24A148]/20 border border-[#24A148]/40 rounded-none">
              RESOLVED
            </span>
          </div>
        ) : (
          <div className="p-4 bg-[#262626] border border-[#393939] rounded-none space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Step 1: Something is wrong */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-[#FA4D56] font-mono uppercase">1. Needs Attention</div>
                <div className="text-sm font-normal text-white">Pune PHC (Koregaon Bhima)</div>
                <div className="text-xs text-[#C6C6C6] font-light leading-relaxed">
                  Needs <strong className="text-white font-mono">50 units</strong> Paracetamol 500mg.
                  <br />
                  Current stock: <span className="text-white font-mono">130 units</span> (2.8 days remaining).
                </div>
              </div>

              {/* Step 2 & 3: CareDOM investigates & finds source */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-[#24A148] font-mono uppercase">2. Found Nearby Source</div>
                <div className="text-sm font-normal text-white">Pune Rural Centre</div>
                <div className="text-xs text-[#C6C6C6] font-light leading-relaxed">
                  Available: <strong className="text-white font-mono">820 units</strong> · After transfer: <span className="text-white font-mono">770 units</span>.
                  <br />
                  Distance: <span className="text-white font-mono">8.4 km</span> · Travel: <span className="text-white font-mono">18 min</span>.
                </div>
              </div>

              {/* Step 4: Action */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-[#0F62FE] font-mono uppercase">3. Recommended Action</div>
                <div className="text-xs text-[#C6C6C6] font-light leading-relaxed">
                  Transfer <strong className="text-white font-mono">50 units</strong> to prevent stockout.
                </div>
                <button
                  onClick={() => handleApproveTransfer('REQ-001')}
                  disabled={isLoading}
                  className="mt-2 w-full px-4 py-2.5 text-xs font-normal text-white bg-[#0F62FE] hover:bg-[#0043CE] rounded-none transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Recording transfer...' : 'Approve Transfer (50 units)'}</span>
                </button>
              </div>
            </div>

            {/* Why this facility? Explanation Block */}
            <div className="pt-3 border-t border-[#393939] space-y-2">
              <div className="flex items-start gap-2 text-xs text-[#C6C6C6] font-light leading-relaxed bg-[#161616] p-3 border border-[#393939]">
                <Info className="w-4 h-4 text-[#0F62FE] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white font-normal">Why this facility? </strong>
                  Pune Rural Centre has enough stock (820 units) to fulfill the request while remaining well above its safety threshold (770 units buffer), and it is the closest available source at 8.4 km.
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setShowDetails(prev => !prev)}
                  className="text-[11px] text-[#0F62FE] hover:underline flex items-center gap-1 font-mono"
                >
                  <span>{showDetails ? 'Hide calculation details' : 'How was this calculated?'}</span>
                  {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                <span className="text-[11px] text-[#8D8D8D] font-mono">Status: Ready to review</span>
              </div>

              {showDetails && (
                <div className="p-3 bg-[#161616] border border-[#393939] text-[11px] text-[#8D8D8D] font-mono space-y-1 leading-relaxed">
                  <div>• Forecast model: Evaluated 7-day consumption curve at 46 units/day</div>
                  <div>• Safety constraint: Enforced donor minimum 7-day buffer (threshold = 350 units; remaining = 770 units)</div>
                  <div>• Road routing: Resolved 8.4 km road corridor with +4.2°C cold-chain preservation</div>
                  <div className="text-[#C6C6C6] pt-1">Technical pipeline: PostGIS KNN spatial index → Google OR-Tools thermal CVRPTW → FEFO cryptographic ledger</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Open Requests Dense Carbon Table */}
      <div className="p-5 bg-[#161616] border border-[#393939] rounded-none space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-normal text-white">Open Stock Requests</h2>
            <p className="text-xs text-[#C6C6C6] font-light">Active medicine requests across district health centres</p>
          </div>
          <span className="text-xs text-[#8D8D8D] font-mono">{openRequestsCount} open</span>
        </div>

        <div className="overflow-x-auto border border-[#393939] rounded-none">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#262626] text-[#C6C6C6] border-b border-[#393939]">
              <tr>
                <th className="p-3 font-normal">Facility</th>
                <th className="p-3 font-normal">Item</th>
                <th className="p-3 font-normal">Qty Needed</th>
                <th className="p-3 font-normal">Urgency</th>
                <th className="p-3 font-normal">Recommended Source</th>
                <th className="p-3 font-normal">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#393939]">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-[#262626]/50 transition-colors">
                  <td className="p-3 text-white">
                    <div className="font-normal">{req.facilityName}</div>
                    <div className="text-[10px] text-[#8D8D8D] font-mono">{req.facilityId}</div>
                  </td>
                  <td className="p-3 text-white font-mono">{req.item}</td>
                  <td className="p-3 font-mono text-white">{req.qtyNeeded} units</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-none border ${
                      req.status === 'RESOLVED'
                        ? 'bg-[#24A148]/15 text-[#24A148] border-[#24A148]/40'
                        : 'bg-[#DA1E28]/15 text-[#FA4D56] border-[#DA1E28]/40'
                    }`}>
                      {req.status === 'RESOLVED' ? 'Resolved' : req.urgency}
                    </span>
                  </td>
                  <td className="p-3 text-[#C6C6C6] font-light">
                    <div>{req.nearbySource}</div>
                    <div className="text-[10px] text-[#24A148] font-mono">{req.distanceKm} km · {req.transitTimeMin} min</div>
                  </td>
                  <td className="p-3">
                    {req.status === 'RESOLVED' ? (
                      <span className="text-[11px] text-[#24A148] font-mono">Approved</span>
                    ) : (
                      <button
                        onClick={() => handleApproveTransfer(req.id)}
                        disabled={isLoading}
                        className="px-3 py-1.5 text-xs text-white bg-[#0F62FE] hover:bg-[#0043CE] rounded-none transition-colors"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Health Centre Inventory & Run-Rates */}
      <div className="p-5 bg-[#161616] border border-[#393939] rounded-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-normal text-white">Facility Inventory & Run-Rates</h2>
            <p className="text-xs text-[#C6C6C6] font-light">Stock on hand and estimated days remaining across Pune District</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#8D8D8D]" />
            <input
              type="text"
              placeholder="Search facility name or ID..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 pr-4 py-2 text-xs bg-[#262626] border-b border-[#6F6F6F] focus:border-[#0F62FE] rounded-none text-white placeholder-[#8D8D8D] focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-[#393939] rounded-none">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#262626] text-[#C6C6C6] border-b border-[#393939]">
              <tr>
                <th className="p-3 font-normal">Health Centre</th>
                <th className="p-3 font-normal">District</th>
                <th className="p-3 font-normal">Paracetamol 500mg</th>
                <th className="p-3 font-normal">Daily Consumption</th>
                <th className="p-3 font-normal">Days Remaining</th>
                <th className="p-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#393939]">
              {filteredCentres.map((c) => (
                <tr key={c.id} className="hover:bg-[#262626]/50 transition-colors">
                  <td className="p-3 text-white">
                    <div className="font-normal">{c.name}</div>
                    <div className="text-[10px] text-[#8D8D8D] font-mono">{c.id}</div>
                  </td>
                  <td className="p-3 text-[#C6C6C6] font-light">{c.district}</td>
                  <td className="p-3 font-mono text-white">{c.stockLevel} units</td>
                  <td className="p-3 font-mono text-[#C6C6C6]">{c.dailyRunRate} / day</td>
                  <td className="p-3 font-mono">
                    <span className={c.daysLeft <= 3 ? 'text-[#FA4D56]' : c.daysLeft <= 6 ? 'text-[#F1C21B]' : 'text-[#24A148]'}>
                      {c.daysLeft} days
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-none border ${
                      c.status === 'CRITICAL' 
                        ? 'bg-[#DA1E28]/15 text-[#FA4D56] border-[#DA1E28]/40' 
                        : c.status === 'WARNING' 
                        ? 'bg-[#F1C21B]/15 text-[#F1C21B] border-[#F1C21B]/40' 
                        : 'bg-[#24A148]/15 text-[#24A148] border-[#24A148]/40'
                    }`}>
                      {c.status === 'CRITICAL' ? 'Likely shortage' : c.status === 'WARNING' ? 'Low stock' : 'Adequate'}
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
};'''

write('frontend/src/components/tabs/DashboardTab.tsx', dashboard_code)

print('Human information architecture applied successfully!')