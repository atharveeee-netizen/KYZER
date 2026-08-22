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
    <header className="h-12 bg-[#161616] border-b border-[#393939] px-4 flex items-center justify-between select-none z-30 shrink-0 text-[#F4F4F4] font-sans">
      {/* Left: Product Name & Human Purpose */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-none bg-[#0F62FE] flex items-center justify-center font-mono font-bold text-white text-xs">
            K
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-tight text-white leading-none">
              KYZER
            </span>
            <span className="text-[11px] text-[#C6C6C6] font-light leading-none mt-0.5">
              Healthcare supply, where it matters.
            </span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-[#393939] hidden sm:block mx-1" />

        {/* Live Network Status */}
        <div className="hidden md:flex items-center gap-2 text-xs text-[#C6C6C6]">
          <span className="w-2 h-2 rounded-none bg-[#24A148]" />
          <span>Pune District · 18 health centres online</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 text-xs">
        <div className="hidden lg:flex items-center gap-1.5 text-[#C6C6C6] font-mono text-[11px] px-2.5 py-1 bg-[#262626] border border-[#393939] rounded-none">
          <Clock className="w-3 h-3 text-[#8D8D8D]" />
          <span>{timeStr || '19:58'} IST</span>
        </div>

        {/* Demo Recording Guide */}
        {onOpenDemoGuide && (
          <button
            onClick={onOpenDemoGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-[#262626] hover:bg-[#393939] border border-[#393939] rounded-none transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#0F62FE]" />
            <span className="hidden sm:inline">Recording Guide</span>
          </button>
        )}

        {/* Register Ingestion CTA */}
        {onOpenOcrModal && (
          <button
            onClick={onOpenOcrModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-normal text-white bg-[#0F62FE] hover:bg-[#0043CE] rounded-none transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Logbook</span>
          </button>
        )}

        {/* Test Shortage Simulation */}
        {isScenarioActive ? (
          <button
            onClick={onResetScenario}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#F1C21B] bg-[#F1C21B]/10 border border-[#F1C21B]/40 rounded-none"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Reset Test</span>
          </button>
        ) : onOpenScenarioModal ? (
          <button
            onClick={onOpenScenarioModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#C6C6C6] hover:text-white bg-[#262626] hover:bg-[#393939] border border-[#393939] rounded-none transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-[#F1C21B]" />
            <span className="hidden md:inline">Simulate Shortage</span>
          </button>
        ) : null}
      </div>
    </header>
  );
};
