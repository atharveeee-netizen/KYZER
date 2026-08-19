import React, { useState } from 'react';
import { ShieldCheck, Search, Moon, Sun, Lock, Building2, Zap } from 'lucide-react';
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
      {/* CLEAN 2-ROW PALANTIR BLUEPRINT HEADER */}
      <header className="bg-[#182026] border-b border-[#293742] w-full text-[#F5F8FA] sticky top-0 z-40">
        
        {/* ROW 1: Branding, Classification, Security Seals & Primary Action */}
        <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between border-b border-[#293742]/60">
          
          {/* Left Agency Identity */}
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 rounded-[2px] bg-[#106BA3] flex items-center justify-center font-bold text-xs text-white">
              C
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs tracking-wider text-[#F5F8FA]">CAREDOM SOVEREIGN OS</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-[2px] bg-[#202B33] text-[#A7B6C2] border border-[#293742] hidden sm:inline-block">
                CONFIDENTIAL // FEDRAMP HIGH
              </span>
            </div>
          </div>

          {/* Right Security Badges & Primary Actions */}
          <div className="flex items-center space-x-2.5">
            
            {/* Strix Security Badge */}
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-[2px] bg-[#0D8050]/15 border border-[#0D8050]/40 text-[#0D8050] text-[10px] font-mono font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0D8050] animate-pulse" />
              <span>STRIX SECURED</span>
            </div>

            {/* Universal Search Command Bar */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-[#111418] border border-[#293742] hover:border-[#106BA3] text-[#A7B6C2] hover:text-white rounded-[2px] text-xs font-mono transition"
            >
              <Search className="w-3 h-3 text-[#5C7080]" />
              <span>Search ontology...</span>
              <kbd className="text-[9px] text-[#5C7080] bg-[#202B33] px-1 rounded-[2px]">⌘K</kbd>
            </button>

            {/* Outbreak Simulation Trigger */}
            <button
              onClick={onSimulateOutbreak}
              className="foundry-btn bg-[#106BA3] hover:bg-[#0E5A8A] text-white text-xs px-3 py-1 rounded-[2px] transition shrink-0"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Simulate Outbreak</span>
              <span className="sm:hidden">Simulate</span>
            </button>

          </div>

        </div>

        {/* ROW 2: Navigation Tabs & Sector Node Indicator */}
        <div className="px-4 sm:px-6 py-1.5 flex items-center justify-between bg-[#111418]/60 overflow-x-auto">
          
          <nav className="flex items-center space-x-1 font-mono text-xs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 rounded-[2px] transition text-xs whitespace-nowrap ${
                    isActive
                      ? 'bg-[#106BA3] text-white font-bold shadow-xs'
                      : 'text-[#A7B6C2] hover:bg-[#202B33] hover:text-white'
                  }`}
                >
                  <span className="opacity-60 mr-1">{tab.code}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-[#5C7080]">
            <span>NODE: PUNE SECTOR [18 PHC]</span>
            <span>•</span>
            <span className="text-[#0D8050]">100% TELEMETRY ACTIVE</span>
          </div>

        </div>

      </header>

      {/* Universal Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onNavigateTab={setActiveTab}
        onSimulateOutbreak={onSimulateOutbreak}
      />
    </>
  );
};
