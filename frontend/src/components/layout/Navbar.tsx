import React from 'react';
import { Activity, ShieldCheck, MapPin, Zap, Sun, Moon } from 'lucide-react';
import { CountryCode } from '../../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCountry: CountryCode;
  setSelectedCountry: (country: CountryCode) => void;
  onSimulateOutbreak: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedCountry,
  setSelectedCountry,
  onSimulateOutbreak,
  theme,
  onToggleTheme,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'map', label: 'GIS Map' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'forecast', label: 'Forecast' },
    { id: 'routes', label: 'Routes' },
    { id: 'ocr', label: 'OCR' },
  ];

  return (
    <header className="bg-canvas border-b border-hairline sticky top-0 z-50 px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-ink text-base">CareDOM</span>
              <span className="text-[10px] font-mono uppercase bg-surface-strong px-2 py-0.5 rounded-pill text-ink tracking-wider font-semibold">
                AI + Quantum
              </span>
            </div>
            <p className="text-[11px] text-muted">BRICS Smart Health Center Supply Co-Pilot</p>
          </div>
        </div>

        {/* Center: 6 Tabs Switcher */}
        <nav className="hidden md:flex items-center bg-canvas-soft border border-hairline rounded-md p-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-surface-card text-ink shadow-xs border border-hairline font-semibold'
                    : 'text-body hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right: BRICS Switcher, Theme Toggle & Primary CTA */}
        <div className="flex items-center gap-2.5">
          
          {/* 🌓 Dark / Light Mode Toggle Button */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            className="p-2 rounded-md bg-canvas-soft hover:bg-surface-strong border border-hairline text-ink transition-colors flex items-center justify-center"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-body hover:text-ink" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300" />
            )}
          </button>

          {/* BRICS Flag Switcher */}
          <div className="flex items-center bg-canvas-soft border border-hairline rounded-md p-0.5 text-xs font-mono">
            <button
              onClick={() => setSelectedCountry('IND')}
              className={`px-2.5 py-1 rounded-xs transition-colors ${
                selectedCountry === 'IND' ? 'bg-surface-card text-ink font-semibold border border-hairline' : 'text-body'
              }`}
            >
              🇮🇳 IND (10)
            </button>
            <button
              onClick={() => setSelectedCountry('ZAF')}
              className={`px-2.5 py-1 rounded-xs transition-colors ${
                selectedCountry === 'ZAF' ? 'bg-surface-card text-ink font-semibold border border-hairline' : 'text-body'
              }`}
            >
              🇿🇦 ZAF (5)
            </button>
            <button
              onClick={() => setSelectedCountry('BRA')}
              className={`px-2.5 py-1 rounded-xs transition-colors ${
                selectedCountry === 'BRA' ? 'bg-surface-card text-ink font-semibold border border-hairline' : 'text-body'
              }`}
            >
              🇧🇷 BRA (3)
            </button>
          </div>

          {/* Primary Action Button (Cursor Orange #f54e00) */}
          <button
            onClick={onSimulateOutbreak}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-active text-white text-xs font-medium px-3.5 py-2 rounded-md transition-colors shadow-xs shrink-0"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simulate Outbreak</span>
          </button>
        </div>

      </div>

      {/* Mobile Tab Row */}
      <div className="flex md:hidden items-center justify-between overflow-x-auto gap-2 pt-2 border-t border-hairline-soft mt-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-2.5 py-1 rounded-sm text-xs ${
              activeTab === tab.id ? 'bg-surface-strong text-ink font-semibold' : 'text-body'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
