import React from 'react';
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
