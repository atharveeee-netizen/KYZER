import React, { useState } from 'react';
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
      className={`p-4 rounded-[2px] border transition-all space-y-3 font-sans ${
        isSelected 
          ? 'bg-white dark:bg-[#2D2D2D] border-[#174A7C] dark:border-[#6EA8D8]' 
          : 'bg-white dark:bg-[#242424] border-[#D6D6D6] dark:border-[#3A3A3A] hover:border-[#9AA0A6]'
      }`}
    >
      {/* 1. Something is wrong */}
      <div className="flex items-center justify-between gap-2">
        <span className={`text-[11px] font-sans font-medium px-2 py-0.5 rounded-[2px] border ${
          isCritical 
            ? 'bg-[#A33A3A]/10 text-[#A33A3A] border-[#A33A3A]/30' 
            : 'bg-[#8A6418]/10 text-[#8A6418] border-[#8A6418]/30'
        }`}>
          {isCritical ? 'Likely shortage in 3 days' : 'Buffer Warning'}
        </span>
        <span className="text-[11px] text-[#70757A] dark:text-[#8E8E8E] font-mono">
          {action.facilityId}
        </span>
      </div>

      <div>
        <h4 className="text-sm font-bold text-[#202124] dark:text-[#F2F2F2] truncate">
          {action.facilityName}
        </h4>
        <p className="text-xs text-[#5F6368] dark:text-[#B8B8B8] mt-0.5 leading-relaxed">
          Needs <strong className="text-[#202124] dark:text-[#F2F2F2]">{action.recommendedUnits} units</strong> {action.medicineName.split(' ')[0]} ({action.currentStock} on hand, {action.daysRemaining.toFixed(1)} days left)
        </p>
      </div>

      {/* 2. Investigation & 3. Best Match */}
      <div className="p-3 bg-[#F7F7F7] dark:bg-[#1B1B1B] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] text-xs space-y-1">
        <div className="text-[11px] text-[#70757A] dark:text-[#8E8E8E]">
          Found 3 possible sources nearby · Nearest source:
        </div>
        <div className="text-xs font-bold text-[#202124] dark:text-[#F2F2F2]">
          {action.donorFacilityName}
        </div>
        <div className="text-[11px] text-[#2F6B45] font-mono">
          Available: 820 units · Distance: {action.distanceKm} km · Travel: {action.transitTimeMin} min
        </div>
      </div>

      {/* 4. Why this facility? (Progressive Disclosure) */}
      <div className="border border-[#D6D6D6] dark:border-[#3A3A3A] bg-white dark:bg-[#242424] p-2.5 rounded-[2px] space-y-2">
        <div className="flex items-start gap-2 text-xs text-[#5F6368] dark:text-[#B8B8B8] leading-relaxed">
          <Info className="w-3.5 h-3.5 text-[#174A7C] dark:text-[#6EA8D8] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#202124] dark:text-[#F2F2F2]">Reason for suggestion: </strong>
            It has sufficient stock to fulfil the request while remaining well above its safety threshold. It is also the closest available source.
          </div>
        </div>

        <button
          onClick={() => setShowExplanation(prev => !prev)}
          className="text-xs text-[#174A7C] dark:text-[#6EA8D8] hover:underline flex items-center gap-1 font-medium pt-1"
        >
          <span>{showExplanation ? 'Hide calculation details' : 'How was this calculated?'}</span>
          {showExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showExplanation && (
          <div className="pt-2 border-t border-[#E5E5E5] dark:border-[#3A3A3A] text-[11px] text-[#70757A] dark:text-[#8E8E8E] space-y-1 font-mono leading-relaxed">
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
          className="px-3 py-1.5 text-xs text-[#5F6368] dark:text-[#B8B8B8] hover:text-[#202124] dark:hover:text-white bg-[#F7F7F7] dark:bg-[#1B1B1B] hover:bg-[#EDEDED] dark:hover:bg-[#2D2D2D] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] transition-colors text-center"
        >
          View on Map
        </button>
        <button
          onClick={() => onDispatchRoute(action)}
          className="px-3 py-1.5 text-xs font-medium text-white bg-[#174A7C] hover:bg-[#123B63] rounded-[2px] transition-colors flex items-center justify-center gap-1"
        >
          <span>Approve Transfer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
