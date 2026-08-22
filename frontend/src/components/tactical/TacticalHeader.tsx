import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Clock, 
  Camera, 
  Zap, 
  CheckCircle2,
  BookOpen,
  PhoneCall
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
    <div className="flex flex-col z-30 shrink-0 select-none font-sans">
      {/* 1. Top Government of India Public-Service Ribbon (UX4G Standard) */}
      <div className="h-6 bg-[#EFEFEF] dark:bg-[#141414] border-b border-[#D6D6D6] dark:border-[#3A3A3A] px-4 flex items-center justify-between text-[11px] text-[#5F6368] dark:text-[#B8B8B8]">
        <div className="flex items-center gap-3">
          <span className="font-medium text-[#202124] dark:text-[#F2F2F2]">
            Government of India
          </span>
          <span className="hidden sm:inline text-[#9AA0A6]">|</span>
          <span className="hidden sm:inline">
            Ministry of Health & Family Welfare · Public Health Infrastructure
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="hidden md:inline">Helpline: <strong className="text-[#202124] dark:text-[#F2F2F2]">104 / 14555</strong></span>
          <span>District: <strong className="text-[#174A7C] dark:text-[#6EA8D8]">Pune (MH)</strong></span>
          <span>English</span>
        </div>
      </div>

      {/* 2. Main Portal Header */}
      <header className="h-13 bg-[#FFFFFF] dark:bg-[#242424] border-b border-[#D6D6D6] dark:border-[#3A3A3A] px-4 py-2 flex items-center justify-between text-[#202124] dark:text-[#F2F2F2]">
        {/* Left: KYZER System Branding & District Context */}
        <div className="flex items-center gap-3.5">
          <div className="w-7 h-7 rounded-[2px] bg-[#174A7C] flex items-center justify-center font-bold text-white text-sm">
            K
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-[#174A7C] dark:text-[#6EA8D8] leading-none">
                KYZER
              </span>
              <span className="text-xs text-[#5F6368] dark:text-[#B8B8B8] font-normal leading-none">
                Healthcare Supply Management System
              </span>
            </div>
            <span className="text-[11px] text-[#5F6368] dark:text-[#B8B8B8] leading-none mt-1">
              Pune District Health Administration · 18 Health Facilities
            </span>
          </div>
        </div>

        {/* Right: Operational Actions */}
        <div className="flex items-center gap-2.5 text-xs">
          <div className="hidden lg:flex items-center gap-1 text-[#5F6368] dark:text-[#B8B8B8] font-mono text-[11px] px-2.5 py-1 bg-[#F7F7F7] dark:bg-[#1B1B1B] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px]">
            <Clock className="w-3 h-3 text-[#70757A]" />
            <span>{timeStr || '19:58'} IST</span>
          </div>

          {/* Recording Guide */}
          {onOpenDemoGuide && (
            <button
              onClick={onOpenDemoGuide}
              className="flex items-center gap-1.5 px-3 py-1 text-xs text-[#202124] dark:text-[#F2F2F2] bg-[#F7F7F7] dark:bg-[#1B1B1B] hover:bg-[#EDEDED] dark:hover:bg-[#2D2D2D] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#174A7C] dark:text-[#6EA8D8]" />
              <span className="hidden sm:inline">Recording Guide</span>
            </button>
          )}

          {/* Scan Logbook CTA */}
          {onOpenOcrModal && (
            <button
              onClick={onOpenOcrModal}
              className="flex items-center gap-1.5 px-3.5 py-1 text-xs font-medium text-white bg-[#174A7C] hover:bg-[#123B63] rounded-[2px] transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan Paper Logbook</span>
            </button>
          )}

          {/* Test Shortage Simulation */}
          {isScenarioActive ? (
            <button
              onClick={onResetScenario}
              className="flex items-center gap-1 px-3 py-1 text-xs text-[#8A6418] bg-[#8A6418]/10 border border-[#8A6418]/40 rounded-[2px]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Reset Test</span>
            </button>
          ) : onOpenScenarioModal ? (
            <button
              onClick={onOpenScenarioModal}
              className="flex items-center gap-1 px-3 py-1 text-xs text-[#5F6368] dark:text-[#B8B8B8] hover:text-[#202124] dark:hover:text-white bg-[#F7F7F7] dark:bg-[#1B1B1B] hover:bg-[#EDEDED] dark:hover:bg-[#2D2D2D] border border-[#D6D6D6] dark:border-[#3A3A3A] rounded-[2px] transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-[#8A6418]" />
              <span className="hidden md:inline">Test Shortage</span>
            </button>
          ) : null}
        </div>
      </header>
    </div>
  );
};
