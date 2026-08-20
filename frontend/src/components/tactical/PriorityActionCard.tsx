import React from 'react';
import { ArrowRight } from 'lucide-react';
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
      className={`foundry-card p-3.5 space-y-2.5 transition-all ${
        isSelected ? 'border-[#106BA3] bg-[#202B33]' : 'hover:border-[#394B59]'
      }`}
    >
      {/* Top Tag & Facility Name */}
      <div className="flex items-center justify-between gap-2">
        <Badge variant={isCritical ? 'danger' : 'warning'} dot pulse size="xs">
          {isCritical ? 'P0 CRITICAL STOCKOUT' : 'P1 BUFFER WARNING'}
        </Badge>
        <span className="font-mono text-[10px] text-[#A7B6C2]">
          {action.facilityId}
        </span>
      </div>

      <div>
        <h4 className="text-xs font-bold text-[#F5F8FA] truncate font-sans">
          {action.facilityName}
        </h4>
        <div className="text-[11px] font-mono text-[#D9822B] mt-0.5">
          {action.medicineName} ({action.medicineCode})
        </div>
      </div>

      {/* Metric Breakdown Strip */}
      <div className="grid grid-cols-2 gap-2 p-2 bg-[#111418] border border-[#293742] rounded-[2px] font-mono text-xs">
        <div>
          <div className="text-[9px] text-[#A7B6C2]">STOCK LEVEL</div>
          <div className="font-bold text-[#C23030]">
            {action.currentStock} units ({action.daysRemaining.toFixed(1)}d)
          </div>
        </div>
        <div>
          <div className="text-[9px] text-[#A7B6C2]">DONOR CANDIDATE</div>
          <div className="font-bold text-[#0D8050] truncate">
            {action.donorFacilityId} ({action.distanceKm} km)
          </div>
        </div>
      </div>

      {/* Proposed Transfer Action */}
      <div className="flex items-center justify-between text-xs font-mono text-[#A7B6C2] pt-0.5">
        <span>PROPOSED TRANSFER:</span>
        <span className="font-bold text-[#F5F8FA]">
          {action.recommendedUnits} units ({action.transitTimeMin}m ETA)
        </span>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#293742]">
        <Button
          variant="secondary"
          size="xs"
          onClick={() => onReviewDecision(action)}
        >
          REVIEW AI
        </Button>
        <Button
          variant="primary"
          size="xs"
          onClick={() => onDispatchRoute(action)}
          rightIcon={<ArrowRight className="w-3 h-3" />}
        >
          DISPATCH
        </Button>
      </div>
    </div>
  );
};
