import React, { useState } from 'react';
import { ShieldCheck, Search, Moon, Sun, Lock, Building2, Terminal, Activity, Layers, Zap } from 'lucide-react';
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
    { id: 'dashboard', code: '01', label: 'Control Tower' },
    { id: 'map', code: '02', label: '3D GIS Ontology' },
    { id: 'inventory', code: '03', label: 'FEFO Inventory' },
    { id: 'forecast', code: '04', label: 'Tweedie Forecaster' },
    { id: 'routes', code: '05', label: 'Quantum VRP' },
    { id: 'ocr', code: '06', label: 'Perception OCR' },
  ];

  return (
    <>
      <header className="bg-[#182026] border-b border-[#293742] sticky top-0 z-40 px-4 sm:px-6 py-2 transition-colors font-sans text-[#F5F8FA]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Left: Palantir Foundry Agency & Classification */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-[3px] bg-[#106BA3]/20 border border-[#106BA3]/40 text-[#106BA3]">
              <Building2 className="w-4 h-4 text-[#106BA3]" />
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-sm text-[#F5F8FA]">
                  CareDOM <span className="text-[10px] font-mono text-[#A7B6C2] font-normal">SOVEREIGN OS</span>
                </span>
                <span className="foundry-badge bg-[#111418] text-[#A7B6C2] border border-[#293742]">
                  CONFIDENTIAL // FEDRAMP HIGH
                </span>
              </div>
              <p className="text-[10px] text-[#5C7080] font-mono tracking-tight hidden sm:block">
                MINISTRY OF HEALTH & FAMILY WELFARE • PUNE SECTOR NODE
              </p>
            </div>
          </div>

          {/* Center: Palantir Blueprint.js Navigation Tabs */}
          <nav className="hidden lg:flex items-center bg-[#111418] border border-[#293742] rounded-[3px] p-0.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 text-xs font-medium transition-all duration-150 rounded-[2px] flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#106BA3] text-[#F5F8FA] font-semibold shadow-xs'
                      : 'text-[#A7B6C2] hover:text-[#F5F8FA] hover:bg-[#202B33]'
                  }`}
                >
                  <span className={`text-[10px] font-mono ${isActive ? 'text-white/80' : 'text-[#5C7080]'}`}>
                    {tab.code}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Strix Security Status, Officer Clearance & Actions */}
          <div className="flex items-center gap-2.5">
            
            {/* Universal Command Palette Trigger */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-[3px] bg-[#111418] hover:bg-[#202B33] border border-[#293742] text-[#A7B6C2] hover:text-[#F5F8FA] text-xs transition-colors font-mono"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search ontology...</span>
              <kbd className="px-1 py-0.2 bg-[#202B33] border border-[#293742] rounded-[2px] text-[9px] font-mono text-[#5C7080]">
                ⌘K
              </kbd>
            </button>

            {/* Strix Security Seal Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-[#0D8050]/15 border border-[#0D8050]/40 text-[#0D8050] text-[10px] font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D8050] animate-pulse"></span>
              <span>STRIX SECURED</span>
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              className="p-1.5 rounded-[3px] bg-[#111418] hover:bg-[#202B33] border border-[#293742] text-[#A7B6C2] hover:text-[#F5F8FA] transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="w-3.5 h-3.5" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>

            {/* Cryptographic Simulation Trigger */}
            <button
              onClick={onSimulateOutbreak}
              className="foundry-btn bg-[#106BA3] hover:bg-[#0E5A8A] text-white text-xs px-3 py-1.5 rounded-[3px] shrink-0"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Simulate Outbreak Shock</span>
              <span className="sm:hidden">Simulate</span>
            </button>

          </div>

        </div>

        {/* Mobile Tab Row */}
        <div className="flex lg:hidden items-center overflow-x-auto gap-1 pt-2 border-t border-[#293742] mt-2 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-2.5 py-1 rounded-[2px] text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#106BA3] text-white font-semibold'
                  : 'bg-[#111418] text-[#A7B6C2] border border-[#293742]'
              }`}
            >
              <span className="text-[10px] font-mono mr-1 opacity-70">{tab.code}</span>
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
