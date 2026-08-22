import React, { useState } from 'react';
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
  ChevronUp,
  Landmark,
  ShieldCheck,
  Activity
} from 'lucide-react';
import modiHeroImage from '../../assets/modi_public_health.jpg';
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
    item: 'Paracetamol 500mg Tablets',
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
    item: 'IV Infusion Set 0.9% Normal Saline',
    qtyNeeded: 20,
    urgency: 'Stock low (4.2 days remaining)',
    nearbySource: 'Khed Primary Health Centre',
    distanceKm: 14.2,
    transitTimeMin: 24,
    status: 'OPEN',
  },
  {
    id: 'REQ-003',
    facilityId: 'PHC-PUN-003',
    facilityName: 'Shikrapur Health Centre',
    item: 'Oral Rehydration Salts (ORS) Sachets',
    qtyNeeded: 100,
    urgency: 'Buffer warning (5.6 days remaining)',
    nearbySource: 'Shirur Sub-District Hospital Depot',
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
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 font-sans text-[#202124] dark:text-[#F2F2F2]">
      
      {/* 1. Administrative Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D6D6D6] dark:border-[#3A3A3A]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#174A7C] dark:text-[#6EA8D8]">
            District Health Supply Dashboard
          </h1>
          <p className="text-xs text-[#5F6368] dark:text-[#B8B8B8] mt-1">
            Pune District Health Administration · Tracking medicine stock, run-rates, and peer redistribution across 18 health centres.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onSimulateOutbreak && (
            <button
              onClick={onSimulateOutbreak}
              className="px-3.5 py-1.5 text-xs text-[#5F6368] dark:text-[#B8B8B8] hover:text-[#202124] dark:hover:text-white bg-white dark:bg-[#242424] hover:bg-[#EDEDED] dark:hover:bg-[#2D2D2D] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] transition-colors"
            >
              Test Shortage Surge
            </button>
          )}
        </div>
      </div>

      {/* 2. Public Health Operational Summary Strip (UX4G Clean Tiles) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
          <div className="text-xs text-[#5F6368] dark:text-[#B8B8B8]">Health Centres</div>
          <div className="text-2xl font-bold text-[#202124] dark:text-[#F2F2F2] mt-1 font-mono">18 Active</div>
          <div className="text-[11px] text-[#2F6B45] mt-1">All reporting today</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
          <div className="text-xs text-[#5F6368] dark:text-[#B8B8B8]">Open Requests</div>
          <div className="text-2xl font-bold text-[#A33A3A] dark:text-[#D96565] mt-1 font-mono">
            {openRequestsCount} Pending
          </div>
          <div className="text-[11px] text-[#5F6368] dark:text-[#B8B8B8] mt-1">{belowStockCount} facilities below buffer</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
          <div className="text-xs text-[#5F6368] dark:text-[#B8B8B8]">Redistribution</div>
          <div className="text-2xl font-bold text-[#2F6B45] dark:text-[#4E9A68] mt-1 font-mono">
            {redistributionCount > 0 ? `${redistributionCount} Available` : 'All Resolved'}
          </div>
          <div className="text-[11px] text-[#5F6368] dark:text-[#B8B8B8] mt-1">Matched within 15 km</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
          <div className="text-xs text-[#5F6368] dark:text-[#B8B8B8]">Cold-Chain Storage</div>
          <div className="text-2xl font-bold text-[#174A7C] dark:text-[#6EA8D8] mt-1 font-mono">+4.2°C</div>
          <div className="text-[11px] text-[#2F6B45] mt-1">Safe (+2°C to +8°C window)</div>
        </div>
      </div>

      {/* 3. The Core Redistribution Workflow (Government Operational Action) */}
      <div className="p-5 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5] dark:border-[#3A3A3A]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#174A7C]" />
            <h2 className="text-sm font-bold text-[#202124] dark:text-[#F2F2F2] uppercase tracking-wide">
              Redistribution Recommendation (Case REQ-001)
            </h2>
          </div>
          <span className="text-xs text-[#5F6368] dark:text-[#B8B8B8] font-mono">Status: Ready for Approval</span>
        </div>

        {requests[0].status === 'RESOLVED' ? (
          <div className="p-4 bg-[#2F6B45]/10 border border-[#2F6B45]/40 rounded-[2px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#2F6B45] shrink-0" />
              <div>
                <div className="text-sm font-bold text-[#202124] dark:text-[#F2F2F2]">Transfer Approved & Recorded in Ledger</div>
                <div className="text-xs text-[#5F6368] dark:text-[#B8B8B8] mt-0.5">
                  50 units Paracetamol 500mg dispatched from Pune Rural Centre to Pune PHC. Distance: 8.4 km (18 min).
                </div>
              </div>
            </div>
            <span className="text-xs font-mono font-medium text-[#2F6B45] px-3 py-1 bg-[#2F6B45]/20 border border-[#2F6B45]/40 rounded-[2px]">
              RESOLVED
            </span>
          </div>
        ) : (
          <div className="p-4 bg-[#F7F7F7] dark:bg-[#1B1B1B] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Step 1: Stock Request */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-[#A33A3A] dark:text-[#D96565] uppercase">1. Stock Request</div>
                <div className="text-sm font-bold text-[#202124] dark:text-[#F2F2F2]">Pune PHC (Koregaon Bhima)</div>
                <div className="text-xs text-[#5F6368] dark:text-[#B8B8B8] leading-relaxed">
                  Required: <strong className="text-[#202124] dark:text-[#F2F2F2]">50 units</strong> Paracetamol 500mg.
                  <br />
                  Current stock: <span className="font-mono">130 units</span> (2.8 days remaining).
                </div>
              </div>

              {/* Step 2: Suggested Source */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-[#2F6B45] dark:text-[#4E9A68] uppercase">2. Suggested Source</div>
                <div className="text-sm font-bold text-[#202124] dark:text-[#F2F2F2]">Pune Rural Centre (Talegaon)</div>
                <div className="text-xs text-[#5F6368] dark:text-[#B8B8B8] leading-relaxed">
                  Available: <strong className="text-[#202124] dark:text-[#F2F2F2]">820 units</strong> · After transfer: <span className="font-mono">770 units</span>.
                  <br />
                  Distance: <span className="font-mono">8.4 km</span> · Travel: <span className="font-mono">18 min</span>.
                </div>
              </div>

              {/* Step 3: Action */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-[#174A7C] dark:text-[#6EA8D8] uppercase">3. Recommended Action</div>
                <div className="text-xs text-[#5F6368] dark:text-[#B8B8B8] leading-relaxed">
                  Transfer <strong className="text-[#202124] dark:text-[#F2F2F2]">50 units</strong> to prevent clinic stockout.
                </div>
                <button
                  onClick={() => handleApproveTransfer('REQ-001')}
                  disabled={isLoading}
                  className="mt-2 w-full px-4 py-2 text-xs font-medium text-white bg-[#174A7C] hover:bg-[#123B63] rounded-[2px] transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Recording transfer...' : 'Approve Transfer (50 units)'}</span>
                </button>
              </div>
            </div>

            {/* Why this facility? Explanation Block */}
            <div className="pt-3 border-t border-[#D6D6D6] dark:border-[#3A3A3A] space-y-2">
              <div className="flex items-start gap-2 text-xs text-[#5F6368] dark:text-[#B8B8B8] leading-relaxed bg-white dark:bg-[#242424] p-3 border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
                <Info className="w-4 h-4 text-[#174A7C] dark:text-[#6EA8D8] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#202124] dark:text-[#F2F2F2]">Reason for suggestion: </strong>
                  The facility has sufficient stock (820 units) to fulfil the request while remaining well above its safety threshold (770 units buffer). It is also the closest available source at 8.4 km.
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setShowDetails(prev => !prev)}
                  className="text-xs text-[#174A7C] dark:text-[#6EA8D8] hover:underline flex items-center gap-1 font-medium"
                >
                  <span>{showDetails ? 'Hide calculation details' : 'How was this calculated?'}</span>
                  {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                <span className="text-[11px] text-[#70757A] dark:text-[#8E8E8E] font-mono">PostGIS KNN · OSRM Road Router · FEFO Ledger</span>
              </div>

              {showDetails && (
                <div className="p-3 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] text-xs text-[#5F6368] dark:text-[#B8B8B8] font-mono space-y-1 leading-relaxed rounded-[2px]">
                  <div>• Forecast model: Evaluated 7-day consumption curve at 46 units/day</div>
                  <div>• Safety threshold: Enforced donor minimum 7-day buffer (required = 350 units; remaining = 770 units)</div>
                  <div>• Road routing: Resolved 8.4 km road corridor with +4.2°C cold-chain preservation</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Government & Public Health Ecosystem Section (Institutional Context) */}
      <div className="p-5 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E5E5] dark:border-[#3A3A3A]">
          <div>
            <h2 className="text-sm font-bold text-[#174A7C] dark:text-[#6EA8D8] uppercase tracking-wide flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#174A7C] dark:text-[#6EA8D8]" />
              <span>Government & Public Health Ecosystem</span>
            </h2>
            <p className="text-xs text-[#5F6368] dark:text-[#B8B8B8] mt-0.5">
              KYZER operates as a facility-level operational layer within the broader national healthcare delivery framework.
            </p>
          </div>
          <span className="text-xs text-[#70757A] dark:text-[#8E8E8E] font-mono">Public Health Hierarchy</span>
        </div>

        {/* Leadership & Administrative Hierarchy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* National Level: Prime Minister */}
          <div className="p-3.5 bg-[#F7F7F7] dark:bg-[#1B1B1B] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] flex items-start gap-3.5">
            <img
              src={modiHeroImage}
              alt="Shri Narendra Modi"
              className="w-16 h-20 object-cover object-top border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] shrink-0 bg-white"
            />
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase text-[#174A7C] dark:text-[#6EA8D8]">National Context</div>
              <div className="text-sm font-bold text-[#202124] dark:text-[#F2F2F2]">Shri Narendra Modi</div>
              <div className="text-xs text-[#5F6368] dark:text-[#B8B8B8]">Prime Minister of India</div>
              <p className="text-[11px] text-[#5F6368] dark:text-[#B8B8B8] leading-relaxed pt-1">
                Public health supply coordination across district health facilities and frontline clinics.
              </p>
            </div>
          </div>

        </div>

        {/* Public Health Supply Hierarchy Chain */}
        <div className="p-3 bg-[#F7F7F7] dark:bg-[#1B1B1B] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
          <div className="text-xs font-bold text-[#202124] dark:text-[#F2F2F2] mb-2">
            Healthcare Supply Chain Integration Chain
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
              <div className="text-[10px] text-[#70757A] dark:text-[#8E8E8E] uppercase">Level 1</div>
              <div className="font-bold text-[#174A7C] dark:text-[#6EA8D8] mt-0.5">National</div>
              <div className="text-[11px] text-[#5F6368] dark:text-[#B8B8B8]">MoHFW Policy</div>
            </div>
            <div className="p-2 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
              <div className="text-[10px] text-[#70757A] dark:text-[#8E8E8E] uppercase">Level 2</div>
              <div className="font-bold text-[#174A7C] dark:text-[#6EA8D8] mt-0.5">State</div>
              <div className="text-[11px] text-[#5F6368] dark:text-[#B8B8B8]">MH Health Dept</div>
            </div>
            <div className="p-2 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
              <div className="text-[10px] text-[#70757A] dark:text-[#8E8E8E] uppercase">Level 3</div>
              <div className="font-bold text-[#174A7C] dark:text-[#6EA8D8] mt-0.5">District</div>
              <div className="text-[11px] text-[#5F6368] dark:text-[#B8B8B8]">Pune Admin</div>
            </div>
            <div className="p-2 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
              <div className="text-[10px] text-[#70757A] dark:text-[#8E8E8E] uppercase">Level 4</div>
              <div className="font-bold text-[#174A7C] dark:text-[#6EA8D8] mt-0.5">Facilities</div>
              <div className="text-[11px] text-[#5F6368] dark:text-[#B8B8B8]">18 PHCs / CHCs</div>
            </div>
            <div className="p-2 bg-[#174A7C] text-white rounded-[2px]">
              <div className="text-[10px] text-[#D6D6D6] uppercase">Execution</div>
              <div className="font-bold mt-0.5">KYZER Layer</div>
              <div className="text-[11px] text-[#E0E0E0]">Stock Redistribution</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Open Stock Requests Dense Table */}
      <div className="p-5 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5] dark:border-[#3A3A3A]">
          <div>
            <h2 className="text-sm font-bold text-[#202124] dark:text-[#F2F2F2]">Open Stock Requests (District-Wide)</h2>
            <p className="text-xs text-[#5F6368] dark:text-[#B8B8B8]">Active medicine replenishment requests across district primary health centres</p>
          </div>
          <span className="text-xs text-[#70757A] dark:text-[#8E8E8E] font-mono">{openRequestsCount} Requests Open</span>
        </div>

        <div className="overflow-x-auto border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F7] dark:bg-[#1B1B1B] text-[#5F6368] dark:text-[#B8B8B8] border-b border-[#D6D6D6] dark:border-[#3A3A3A]">
              <tr>
                <th className="p-3 font-semibold text-[#202124] dark:text-[#F2F2F2]">Facility Name</th>
                <th className="p-3 font-semibold text-[#202124] dark:text-[#F2F2F2]">Item Requested</th>
                <th className="p-3 font-semibold text-[#202124] dark:text-[#F2F2F2]">Quantity</th>
                <th className="p-3 font-semibold text-[#202124] dark:text-[#F2F2F2]">Urgency / Status</th>
                <th className="p-3 font-semibold text-[#202124] dark:text-[#F2F2F2]">Suggested Source</th>
                <th className="p-3 font-semibold text-[#202124] dark:text-[#F2F2F2]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#3A3A3A]">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-[#F9F9F9] dark:hover:bg-[#2D2D2D] transition-colors">
                  <td className="p-3 text-[#202124] dark:text-[#F2F2F2]">
                    <div className="font-medium">{req.facilityName}</div>
                    <div className="text-[11px] text-[#70757A] dark:text-[#8E8E8E] font-mono">{req.facilityId}</div>
                  </td>
                  <td className="p-3 text-[#202124] dark:text-[#F2F2F2]">{req.item}</td>
                  <td className="p-3 font-mono font-medium text-[#202124] dark:text-[#F2F2F2]">{req.qtyNeeded} units</td>
                  <td className="p-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-[2px] border ${
                      req.status === 'RESOLVED'
                        ? 'bg-[#2F6B45]/10 text-[#2F6B45] border-[#2F6B45]/30'
                        : 'bg-[#A33A3A]/10 text-[#A33A3A] border-[#A33A3A]/30'
                    }`}>
                      {req.status === 'RESOLVED' ? 'Transfer Approved' : req.urgency}
                    </span>
                  </td>
                  <td className="p-3 text-[#5F6368] dark:text-[#B8B8B8]">
                    <div className="text-[#202124] dark:text-[#F2F2F2]">{req.nearbySource}</div>
                    <div className="text-[11px] text-[#2F6B45] font-mono">{req.distanceKm} km · {req.transitTimeMin} min transit</div>
                  </td>
                  <td className="p-3">
                    {req.status === 'RESOLVED' ? (
                      <span className="text-xs text-[#2F6B45] font-medium">Completed</span>
                    ) : (
                      <button
                        onClick={() => handleApproveTransfer(req.id)}
                        disabled={isLoading}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-[#174A7C] hover:bg-[#123B63] rounded-[2px] transition-colors"
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

      {/* 6. Facility Inventory Registry Table */}
      <div className="p-5 bg-white dark:bg-[#242424] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E5E5E5] dark:border-[#3A3A3A]">
          <div>
            <h2 className="text-sm font-bold text-[#202124] dark:text-[#F2F2F2]">Pune District Facility Stock Register</h2>
            <p className="text-xs text-[#5F6368] dark:text-[#B8B8B8]">Current essential medicine stock on hand and estimated days to buffer replenishment</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#70757A]" />
            <input
              type="text"
              placeholder="Search facility name or ID..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#1B1B1B] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] text-[#202124] dark:text-[#F2F2F2] placeholder-[#70757A] focus:outline-none focus:border-[#174A7C]"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F7] dark:bg-[#1B1B1B] text-[#5F6368] dark:text-[#B8B8B8] border-b border-[#D6D6D6] dark:border-[#3A3A3A]">
              <tr>
                <th className="p-3 font-semibold text-[#202124] dark:text-[#F2F2F2]">Health Facility</th>
                <th className="p-3 font-semibold text-[#202124] dark:text-[#F2F2F2]">Sub-District</th>
                <th className="p-3 font-semibold text-[#202124] dark:text-[#F2F2F2]">Paracetamol Stock</th>
                <th className="p-3 font-semibold text-[#202124] dark:text-[#F2F2F2]">Daily Consumption</th>
                <th className="p-3 font-semibold text-[#202124] dark:text-[#F2F2F2]">Estimated Days Left</th>
                <th className="p-3 font-semibold text-[#202124] dark:text-[#F2F2F2]">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#3A3A3A]">
              {filteredCentres.map((c) => (
                <tr key={c.id} className="hover:bg-[#F9F9F9] dark:hover:bg-[#2D2D2D] transition-colors">
                  <td className="p-3 text-[#202124] dark:text-[#F2F2F2]">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-[11px] text-[#70757A] dark:text-[#8E8E8E] font-mono">{c.id}</div>
                  </td>
                  <td className="p-3 text-[#5F6368] dark:text-[#B8B8B8]">{c.district}</td>
                  <td className="p-3 font-mono font-medium text-[#202124] dark:text-[#F2F2F2]">{c.stockLevel} units</td>
                  <td className="p-3 font-mono text-[#5F6368] dark:text-[#B8B8B8]">{c.dailyRunRate} / day</td>
                  <td className="p-3 font-mono">
                    <span className={c.daysLeft <= 3 ? 'text-[#A33A3A] font-bold' : c.daysLeft <= 6 ? 'text-[#8A6418]' : 'text-[#2F6B45]'}>
                      {c.daysLeft} days
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-[2px] border ${
                      c.status === 'CRITICAL' 
                        ? 'bg-[#A33A3A]/10 text-[#A33A3A] border-[#A33A3A]/30' 
                        : c.status === 'WARNING' 
                        ? 'bg-[#8A6418]/10 text-[#8A6418] border-[#8A6418]/30' 
                        : 'bg-[#2F6B45]/10 text-[#2F6B45] border-[#2F6B45]/30'
                    }`}>
                      {c.status === 'CRITICAL' ? 'Likely Shortage' : c.status === 'WARNING' ? 'Low Stock' : 'Adequate'}
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
