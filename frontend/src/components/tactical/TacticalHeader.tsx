import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Clock, 
  Camera, 
  Sliders, 
  CheckCircle2,
  BookOpen,
  LogOut,
  Home
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
  onExitToPublic?: () => void;
  onLogout?: () => void;
  activeAlertCount?: number;
  isScenarioActive?: boolean;
  onResetScenario?: () => void;
}

export const TacticalHeader: React.FC<TacticalHeaderProps> = ({
  districtName = 'Pune District',
  countryCode = 'IND',
  onCountryChange,
  onOpenOcrModal,
  onOpenScenarioModal,
  onOpenAlertsDrawer,
  onOpenDemoGuide,
  onExitToPublic,
  onLogout,
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
      {/* Left: KYZER Branding & District Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-tight text-white leading-none">
            KYZER
          </span>
        </div>

        <div className="h-4 w-[1px] bg-[#393939] hidden sm:block mx-1" />

        {/* Live Network Status */}
        <div className="hidden md:flex items-center gap-2 text-xs text-[#C6C6C6]">
          <span>Pune District • 18 Health Facilities Online</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 text-xs">
        {/* Demo Recording Guide */}
        {onOpenDemoGuide && (
          <button
            onClick={onOpenDemoGuide}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#C6C6C6] hover:text-white bg-[#262626] hover:bg-[#393939] border border-[#393939] rounded-[2px] transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#8D8D8D]" />
            <span className="hidden sm:inline">Recording Guide</span>
          </button>
        )}

        {/* Register Ingestion CTA */}
        {onOpenOcrModal && (
          <button
            onClick={onOpenOcrModal}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#C6C6C6] hover:text-white bg-[#262626] hover:bg-[#393939] border border-[#393939] rounded-[2px] transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-[#8D8D8D]" />
            <span>Scan Logbook</span>
          </button>
        )}

        {/* Test Shortage Simulation (GREY ICON AND BORDER) */}
        {isScenarioActive ? (
          <button
            onClick={onResetScenario}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#C6C6C6] bg-[#262626] border border-[#393939] rounded-[2px]"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#8D8D8D]" />
            <span>Reset Test</span>
          </button>
        ) : onOpenScenarioModal ? (
          <button
            onClick={onOpenScenarioModal}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#C6C6C6] hover:text-white bg-[#262626] hover:bg-[#393939] border border-[#393939] rounded-[2px] transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-[#8D8D8D]" />
            <span className="hidden md:inline">Test Shortage</span>
          </button>
        ) : null}

        {/* Return to Public Portal */}
        {onExitToPublic && (
          <button
            onClick={onExitToPublic}
            title="Return to Public Portal"
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#A7B6C2] hover:text-white bg-[#262626] hover:bg-[#393939] border border-[#393939] rounded-[2px] transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-[#8D8D8D]" />
            <span className="hidden xl:inline">Portal</span>
          </button>
        )}

        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Logout from KYZER"
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#C6C6C6] hover:text-white bg-[#262626] hover:bg-[#393939] border border-[#393939] rounded-[2px] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-[#8D8D8D]" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};
