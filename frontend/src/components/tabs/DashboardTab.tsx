import React, { useState } from 'react';
import { 
  Building2, 
  AlertCircle, 
  Truck, 
  ThermometerSnowflake, 
  ArrowRight, 
  Search, 
  RefreshCw,
  CheckCircle2
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
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 font-sans text-[#F4F4F4]">
      
      {/* 1. Page Header with Carbon Light Display Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#393939]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-white">
            District Supply Overview
          </h1>
          <p className="text-xs text-[#C6C6C6] mt-1 font-light">
            Tracking essential medicine stock, run-rates, and peer redistribution across 18 health centres.
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

      {/* 2. Today's Network Summary Strip (Carbon 0px Tiles) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-[#161616] border border-[#393939] rounded-none">
          <div className="text-[11px] text-[#8D8D8D]">Health centres</div>
          <div className="text-2xl font-light text-white mt-1 font-mono">18 active</div>
          <div className="text-[11px] text-[#24A148] mt-1">All reporting today</div>
        </div>

        <div className="p-4 bg-[#161616] border border-[#393939] rounded-none">
          <div className="text-[11px] text-[#8D8D8D]">Stock status</div>
          <div className="text-2xl font-light text-[#DA1E28] mt-1 font-mono">
            {criticalCount > 0 ? `${criticalCount} urgent shortage` : 'Normal'}
          </div>
          <div className="text-[11px] text-[#C6C6C6] mt-1">{warningCount} low-stock items</div>
        </div>

        <div className="p-4 bg-[#161616] border border-[#393939] rounded-none">
          <div className="text-[11px] text-[#8D8D8D]">Redistribution</div>
          <div className="text-2xl font-light text-[#24A148] mt-1 font-mono">
            {transferApproved ? '1 resolved' : '1 available nearby'}
          </div>
          <div className="text-[11px] text-[#C6C6C6] mt-1">Talegaon → Koregaon (9.8 km)</div>
        </div>

        <div className="p-4 bg-[#161616] border border-[#393939] rounded-none">
          <div className="text-[11px] text-[#8D8D8D]">Cold-chain integrity</div>
          <div className="text-2xl font-light text-[#0F62FE] mt-1 font-mono">+4.2°C</div>
          <div className="text-[11px] text-[#24A148] mt-1">Within +2°C to +8°C window</div>
        </div>
      </div>

      {/* 3. Hero Operational Section: Active Shortage & Recommended Transfer */}
      <div className="p-5 bg-[#161616] border border-[#393939] rounded-none space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-normal text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-[#DA1E28]" />
            <span>Active Shortage & Recommended Transfer</span>
          </h2>
          <span className="text-xs text-[#8D8D8D] font-mono">Source: Real-time clinic stock</span>
        </div>

        {transferApproved ? (
          <div className="p-4 bg-[#24A148]/10 border border-[#24A148]/40 rounded-none flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#24A148] shrink-0" />
              <div>
                <div className="text-sm font-medium text-white">Transfer Approved & Recorded</div>
                <div className="text-xs text-[#C6C6C6] mt-0.5 font-light">
                  450 units Paracetamol 500mg dispatched from Talegaon Dhamdhere (PHC-PUN-004) to Koregaon Bhima (PHC-PUN-002). ETA: 18 minutes.
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
              {/* Problem */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-[#FA4D56] font-mono uppercase">1. Shortage at Centre</div>
                <div className="text-sm font-normal text-white">Koregaon Bhima PHC</div>
                <div className="text-xs text-[#C6C6C6] font-light leading-relaxed">
                  Has <strong className="text-white font-mono">130 units</strong> Paracetamol 500mg (2.8 days left at 46 units/day). Needs 450 units.
                </div>
              </div>

              {/* Nearby Source */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-[#24A148] font-mono uppercase">2. Found Nearby Surplus</div>
                <div className="text-sm font-normal text-white">Talegaon Dhamdhere PHC</div>
                <div className="text-xs text-[#C6C6C6] font-light leading-relaxed">
                  Has <strong className="text-white font-mono">820 units</strong> available. Distance: <strong className="text-white font-mono">9.8 km</strong> (18 min road transit).
                </div>
              </div>

              {/* Recommendation & Action */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-[#0F62FE] font-mono uppercase">3. Recommendation</div>
                <div className="text-xs text-[#C6C6C6] font-light leading-relaxed">
                  Transfer <strong className="text-white font-mono">450 units</strong>. Source still keeps 370 units (7.4 days buffer).
                </div>
                <button
                  onClick={handleApproveTransfer}
                  disabled={isLoading}
                  className="mt-2 w-full px-4 py-2.5 text-xs font-normal text-white bg-[#0F62FE] hover:bg-[#0043CE] rounded-none transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Recording transfer...' : 'Approve Transfer (450 units)'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Practical Facility Inventory Table (Carbon 1px Hairline Table) */}
      <div className="p-5 bg-[#161616] border border-[#393939] rounded-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-normal text-white">Facility Stock & Run-Rates</h2>
            <p className="text-xs text-[#C6C6C6] font-light">Essential medicines inventory across Pune District</p>
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
