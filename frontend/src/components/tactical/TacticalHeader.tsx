import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Clock, 
  Camera, 
  Zap, 
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { Button } from '../ui/Button';

interface TacticalHeaderProps {
  districtName?: string;
  countryCode?: 'IND' | 'ZAF' | 'BRA';
  onCountryChange?: (code: 'IND' | 'ZAF' | 'BRA') => void;
  onOpenOcrModal?: () => void;
  onOpenScenarioModal?: () => void;
  onOpenAlertsDrawer?: () => void;
  onOpenDemoGuide?: () => void;
  activeAlertCount?: number;
  isScenarioActive?: boolean;
  onResetScenario?: () => void;
}

export const TacticalHeader: React.FC<TacticalHeaderProps> = ({
  districtName = 'Pune District (MH)',
  countryCode = 'IND',
  onCountryChange,
  onOpenOcrModal,
  onOpenScenarioModal,
  onOpenAlertsDrawer,
  onOpenDemoGuide,
  activeAlertCount = 4,
  isScenarioActive = false,
  onResetScenario,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-12 bg-[#161D26] border-b border-[#222E3C] px-4 flex items-center justify-between select-none z-30 shrink-0 text-[#F8FAFC] font-sans">
      {/* Left: Product Name & Operational Purpose */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#0F6254] flex items-center justify-center font-semibold text-white text-xs">
            C
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-[#F8FAFC] leading-none">
              CareDOM
            </span>
            <span className="text-[10px] text-[#94A3B8] leading-none mt-0.5">
              Healthcare supply, without the guesswork
            </span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-[#222E3C] hidden sm:block mx-1" />

        {/* Live Network Status */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-[#94A3B8]">
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span>Pune Network · 18 health centres active</span>
        </div>
      </div>

      {/* Center / Right Controls */}
      <div className="flex items-center gap-2.5 text-xs">
        <div className="hidden lg:flex items-center gap-1 text-[#94A3B8] font-mono text-[11px] px-2 py-1 bg-[#11161D] border border-[#222E3C] rounded-md">
          <Clock className="w-3 h-3 text-[#64748B]" />
          <span>{timeStr || '19:58'} IST</span>
        </div>

        {/* Quick Demo Script Helper */}
        {onOpenDemoGuide && (
          <button
            onClick={onOpenDemoGuide}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#E2E8F0] hover:text-white bg-[#1E2734] hover:bg-[#253243] border border-[#222E3C] rounded-full transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span className="hidden sm:inline">Recording Guide</span>
          </button>
        )}

        {/* Register Ingestion (Primary Task) */}
        {onOpenOcrModal && (
          <button
            onClick={onOpenOcrModal}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-[#0F6254] hover:bg-[#0B4E43] rounded-full transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Logbook</span>
          </button>
        )}

        {/* Test Shortage Surge Simulation */}
        {isScenarioActive ? (
          <button
            onClick={onResetScenario}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-full"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Reset Test</span>
          </button>
        ) : onOpenScenarioModal ? (
          <button
            onClick={onOpenScenarioModal}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#94A3B8] hover:text-[#E2E8F0] bg-[#11161D] hover:bg-[#1E2734] border border-[#222E3C] rounded-full transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="hidden md:inline">Simulate Shortage</span>
          </button>
        ) : null}
      </div>
    </header>
  );
};
