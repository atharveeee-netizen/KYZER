import React, { useState } from 'react';
import { Zap, Sun, Moon, Search, Shield, Building2, Terminal, Activity, Layers } from 'lucide-react';
import { CommandPalette } from '../ui/CommandPalette';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSimulateOutbreak: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onSimulateOutbreak,
  theme,
  onToggleTheme,
}) => {
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', code: '01', label: 'Overview', sub: '統括' },
    { id: 'map', code: '02', label: '3D GIS Twin', sub: '空間' },
    { id: 'inventory', code: '03', label: 'FEFO Stock', sub: '在庫' },
    { id: 'forecast', code: '04', label: 'AI Forecaster', sub: '予測' },
    { id: 'routes', code: '05', label: 'Quantum VRP', sub: '最適化' },
    { id: 'ocr', code: '06', label: 'Register OCR', sub: '画像' },
  ];

  return (
    <>
      <header className="bg-surface-card/90 backdrop-blur-md border-b border-hairline sticky top-0 z-40 px-4 sm:px-6 py-2.5 transition-colors font-sans">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Sovereign B2G Agency Identity */}
          <div className="flex items-center gap-3.5">
            <div className="p-2 rounded-lg bg-blue-600/10 border border-blue-600/20 text-blue-600 dark:text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-ink text-sm sm:text-base">
                  CareDOM
                </span>
                <span className="sovereign-badge bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <Shield className="w-3 h-3" /> FEDRAMP HIGH READY
                </span>
              </div>
              <p className="text-[11px] text-muted font-mono tracking-tight hidden sm:block">
                NATIONAL HEALTH MISSION · PUNE DISTRICT HEALTH COMMAND
              </p>
            </div>
          </div>

          {/* Center: Apple-Grade Pill Tab Switcher */}
          <nav className="hidden lg:flex items-center bg-canvas-soft border border-hairline rounded-lg p-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-surface-card text-ink shadow-xs border border-hairline font-semibold'
                      : 'text-body hover:text-ink hover:bg-canvas'
                  }`}
                >
                  <span className={`text-[10px] font-mono ${isActive ? 'text-blue-600 font-bold' : 'text-muted'}`}>
                    {tab.code}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Universal Search, Theme & Sovereign Action CTA */}
          <div className="flex items-center gap-2.5">
            
            {/* Universal Command Palette Search Trigger */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-canvas-soft hover:bg-surface-strong border border-hairline text-muted hover:text-ink text-xs transition-colors font-mono"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search datasets...</span>
              <kbd className="px-1.5 py-0.5 bg-canvas border border-hairline rounded text-[10px] font-semibold text-muted">
                ⌘K
              </kbd>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              className="p-2 rounded-lg bg-canvas-soft hover:bg-surface-strong border border-hairline text-body hover:text-ink transition-colors flex items-center justify-center"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Outbreak Shock Trigger Button */}
            <button
              onClick={onSimulateOutbreak}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all shadow-xs shrink-0"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Simulate Outbreak</span>
              <span className="sm:hidden">Simulate</span>
            </button>

          </div>

        </div>

        {/* Mobile Tab Row with Gradient Scroll Mask */}
        <div className="flex lg:hidden items-center overflow-x-auto gap-1.5 pt-2 border-t border-hairline mt-2 scrollbar-none [mask-image:linear-gradient(to_right,black_85%,transparent_100%)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-canvas-soft text-body border border-hairline'
              }`}
            >
              <span className="text-[10px] font-mono mr-1.5 opacity-80">{tab.code}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Global Universal Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onNavigateTab={setActiveTab}
        onSimulateOutbreak={onSimulateOutbreak}
      />
    </>
  );
};
