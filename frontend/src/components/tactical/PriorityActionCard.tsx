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
      className={`p-4 rounded-none border transition-all space-y-3 font-sans ${
        isSelected 
          ? 'bg-[#262626] border-[#0F62FE]' 
          : 'bg-[#161616] border-[#393939] hover:border-[#6F6F6F]'
      }`}
    >
      {/* Header: Facility & Shortage Level */}
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-none border ${
          isCritical 
            ? 'bg-[#DA1E28]/15 text-[#FA4D56] border-[#DA1E28]/40' 
            : 'bg-[#F1C21B]/15 text-[#F1C21B] border-[#F1C21B]/40'
        }`}>
          {isCritical ? 'Urgent Shortage' : 'Low Stock'}
        </span>
        <span className="text-[11px] text-[#8D8D8D] font-mono">
          {action.facilityId}
        </span>
      </div>

      <div>
        <h4 className="text-sm font-normal text-white truncate">
          {action.facilityName}
        </h4>
        <p className="text-xs text-[#C6C6C6] mt-0.5 font-light">
          Needs <strong className="text-white font-mono">{action.recommendedUnits} units</strong> {action.medicineName.split(' ')[0]} ({action.daysRemaining.toFixed(1)} days left)
        </p>
      </div>

      {/* Nearby Solution Finding */}
      <div className="p-3 bg-[#262626] border border-[#393939] rounded-none text-xs space-y-1">
        <div className="text-[11px] text-[#C6C6C6]">
          Nearby source: <strong className="text-white">{action.donorFacilityName}</strong>
        </div>
        <div className="text-[11px] text-[#24A148] font-mono">
          Available: {action.distanceKm} km away · {action.transitTimeMin} min transit
        </div>
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
};
