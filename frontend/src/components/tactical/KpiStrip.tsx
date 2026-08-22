import React from 'react';
import { 
  Building2, 
  AlertCircle, 
  Truck, 
  ThermometerSnowflake 
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
    <div className="h-8 bg-[#FFFFFF] dark:bg-[#242424] border-t border-[#D6D6D6] dark:border-[#3A3A3A] px-4 flex items-center justify-between text-xs text-[#5F6368] dark:text-[#B8B8B8] select-none z-20 shrink-0 overflow-x-auto gap-4 font-sans">
      {/* Left: Operational Metrics */}
      <div className="flex items-center gap-6 shrink-0">
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-[#70757A]" />
          <span>Pune District: <strong>{totalFacilities} Health Facilities</strong></span>
        </div>

        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-[#A33A3A]" />
          <span className="text-[#A33A3A] dark:text-[#D96565]"><strong>{criticalCount}</strong> below minimum stock</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-[#2F6B45]" />
          <span><strong>{activeTransfersCount}</strong> transfer in transit</span>
        </div>

        <div className="flex items-center gap-1.5">
          <ThermometerSnowflake className="w-3.5 h-3.5 text-[#174A7C] dark:text-[#6EA8D8]" />
          <span>Cold-chain storage: <strong className="text-[#202124] dark:text-[#F2F2F2] font-mono">{coldChainTemp}</strong> (Safe)</span>
        </div>
      </div>

      {/* Right: Operational Freshness */}
      <div className="flex items-center gap-3 shrink-0 text-[11px] text-[#70757A] dark:text-[#8E8E8E]">
        <span>Last updated 2 min ago</span>
        <span className="flex items-center gap-1 text-[#2F6B45]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2F6B45]" />
          <span>National Health Portal Sync</span>
        </span>
      </div>
    </div>
  );
};
