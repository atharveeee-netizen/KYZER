import React from 'react';
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
