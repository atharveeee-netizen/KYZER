import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Globe2, 
  UploadCloud, 
  Zap, 
  Bell, 
  Clock, 
  Radio,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { Badge } from '../ui/Badge';
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
  districtName = 'Pune District (MH, India)',
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
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-12 bg-[#182026] border-b border-[#293742] px-4 flex items-center justify-between select-none z-30 shrink-0 text-[#F5F8FA] font-sans">
      {/* Left: Brand + Telemetry Status */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[2px] bg-[#106BA3] flex items-center justify-center font-mono font-black text-white text-xs tracking-tighter shadow-sm">
            K
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-black text-sm tracking-wider text-[#F5F8FA] leading-none">
              KYZER
            </span>
            <span className="text-[9px] text-[#A7B6C2] font-mono tracking-tight leading-none mt-0.5">
              HEALTH LOGISTICS OS
            </span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-[#293742] hidden sm:block" />

        {/* Live Pulse Indicator */}
        <div className="hidden md:flex items-center gap-2">
          <Badge variant="success" dot pulse size="xs">
            SYSTEM ONLINE
          </Badge>
          <Badge variant="primary" size="xs">
            AI SERVICE B (LIVE)
          </Badge>
        </div>
      </div>

      {/* Center: District Switcher & Clock */}
      <div className="flex items-center gap-3 font-mono text-xs">
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[#111418] border border-[#293742] rounded-[2px] text-[#A7B6C2]">
          <Clock className="w-3.5 h-3.5 text-[#106BA3]" />
          <span>{timeStr || '19:58:00 IST'}</span>
        </div>

        {/* BRICS Sovereign Switcher */}
        <div className="flex items-center gap-1 bg-[#111418] border border-[#293742] rounded-[2px] p-0.5">
          <button
            onClick={() => onCountryChange && onCountryChange('IND')}
            className={`px-2 py-0.5 text-[11px] rounded-[1px] transition-colors ${
              countryCode === 'IND' ? 'bg-[#106BA3] text-white font-bold' : 'text-[#A7B6C2] hover:text-[#F5F8FA]'
            }`}
          >
            IND (Pune)
          </button>
          <button
            onClick={() => onCountryChange && onCountryChange('ZAF')}
            className={`px-2 py-0.5 text-[11px] rounded-[1px] transition-colors ${
              countryCode === 'ZAF' ? 'bg-[#106BA3] text-white font-bold' : 'text-[#A7B6C2] hover:text-[#F5F8FA]'
            }`}
          >
            ZAF (Tshwane)
          </button>
          <button
            onClick={() => onCountryChange && onCountryChange('BRA')}
            className={`px-2 py-0.5 text-[11px] rounded-[1px] transition-colors ${
              countryCode === 'BRA' ? 'bg-[#106BA3] text-white font-bold' : 'text-[#A7B6C2] hover:text-[#F5F8FA]'
            }`}
          >
            BRA (Amazonas)
          </button>
        </div>
      </div>

      {/* Right: Quick Action Triggers */}
      <div className="flex items-center gap-2">
        {/* Guided Demo Pitch Guide */}
        {onOpenDemoGuide && (
          <Button
            variant="secondary"
            size="xs"
            onClick={onOpenDemoGuide}
            leftIcon={<Sparkles className="w-3 h-3 text-[#38BDF8]" />}
            className="hidden sm:inline-flex bg-[#106BA3]/10 border-[#106BA3]/40 text-[#38BDF8] hover:bg-[#106BA3]/20"
          >
            DEMO GUIDE 🎓
          </Button>
        )}

        {/* Scenario Lab Status */}
        {isScenarioActive ? (
          <Button
            variant="danger"
            size="xs"
            onClick={onResetScenario}
            leftIcon={<Zap className="w-3 h-3 animate-pulse" />}
          >
            RESET SCENARIO
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="xs"
            onClick={onOpenScenarioModal}
            leftIcon={<Zap className="w-3 h-3 text-[#D9822B]" />}
            className="hidden sm:inline-flex"
          >
            SCENARIO LAB
          </Button>
        )}

        {/* OCR Register Import Trigger */}
        <Button
          variant="primary"
          size="xs"
          onClick={onOpenOcrModal}
          leftIcon={<UploadCloud className="w-3 h-3" />}
        >
          <span className="hidden sm:inline">IMPORT REGISTER</span>
          <span className="sm:hidden">OCR</span>
        </Button>

        {/* Alerts Badge Trigger */}
        <button
          onClick={onOpenAlertsDrawer}
          className="relative p-1.5 text-[#A7B6C2] hover:text-[#F5F8FA] hover:bg-[#202B33] border border-[#293742] rounded-[2px] transition-colors"
          title="Actionable Triage Alerts"
        >
          <Bell className="w-4 h-4" />
          {activeAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C23030] text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-xs">
              {activeAlertCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
