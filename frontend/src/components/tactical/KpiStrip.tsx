import React from 'react';
import { 
  Building2, 
  AlertTriangle, 
  Truck, 
  ThermometerSnowflake, 
  Cpu, 
  Activity,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '../ui/Badge';

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
    <div className="h-10 bg-[#182026] border-t border-[#293742] px-4 flex items-center justify-between text-xs font-mono text-[#F5F8FA] select-none z-20 shrink-0 overflow-x-auto gap-4">
      {/* Left: 4 Tactical Telemetry Pillars */}
      <div className="flex items-center gap-6 shrink-0">
        {/* Total Network Nodes */}
        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-[#106BA3]" />
          <span className="text-[#A7B6C2]">NETWORK:</span>
          <span className="font-bold text-[#F5F8FA]">{totalFacilities} NODES</span>
        </div>

        {/* Critical & Warning Stockouts */}
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-[#C23030]" />
          <span className="text-[#A7B6C2]">AT RISK:</span>
          <span className="font-bold text-[#C23030]">{criticalCount} P0 CRITICAL</span>
          <span className="text-[#A7B6C2]">/</span>
          <span className="font-bold text-[#D9822B]">{warningCount} P1</span>
        </div>

        {/* Active Logistics Transfers */}
        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-[#0D8050]" />
          <span className="text-[#A7B6C2]">MISSIONS:</span>
          <span className="font-bold text-[#0D8050]">{activeTransfersCount} DISPATCHED</span>
        </div>

        {/* Active Cold Chain Integrity */}
        <div className="flex items-center gap-2">
          <ThermometerSnowflake className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span className="text-[#A7B6C2]">COLD-CHAIN:</span>
          <span className="font-bold text-[#38BDF8]">{coldChainTemp} (WHO COMPLIANT)</span>
        </div>
      </div>

      {/* Right: Engine Status & Quantum Solvers */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] text-[#A7B6C2]">
          <Cpu className="w-3.5 h-3.5 text-[#8F3985]" />
          <span>SOLVER:</span>
          <span className="font-bold text-[#C678DD]">OR-TOOLS + QAOA</span>
        </div>

        <Badge variant={isAiLive ? "success" : "warning"} dot pulse size="xs">
          {isAiLive ? "SERVICE B CONNECTED" : "OFFLINE CACHE"}
        </Badge>
      </div>
    </div>
  );
};
