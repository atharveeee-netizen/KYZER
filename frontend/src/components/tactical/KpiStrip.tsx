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
    <div className="h-9 bg-[#161616] border-t border-[#393939] px-4 flex items-center justify-between text-xs text-[#C6C6C6] select-none z-20 shrink-0 overflow-x-auto gap-4 font-sans">
      {/* Left: Operational Metrics */}
      <div className="flex items-center gap-6 shrink-0">
        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-[#8D8D8D]" />
          <span>{totalFacilities} health centres tracked</span>
        </div>

        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-[#DA1E28]" />
          <span className="text-[#DA1E28] font-normal">{criticalCount} low on stock</span>
        </div>

        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-[#24A148]" />
          <span>{activeTransfersCount} transfer in progress</span>
        </div>

        <div className="flex items-center gap-2">
          <ThermometerSnowflake className="w-3.5 h-3.5 text-[#0F62FE]" />
          <span>Cold chain: <strong className="text-white font-mono">{coldChainTemp}</strong> (Safe)</span>
        </div>
      </div>

      {/* Right: Operational Freshness */}
      <div className="flex items-center gap-4 shrink-0 text-[11px] text-[#8D8D8D]">
        <span>Last updated 2 min ago</span>
        <span className="flex items-center gap-1.5 text-[#24A148]">
          <span className="w-1.5 h-1.5 rounded-none bg-[#24A148]" />
          <span>Live sync</span>
        </span>
      </div>
    </div>
  );
};
