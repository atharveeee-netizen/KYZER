import React from 'react';
import { Zap, Sun, Moon, Radio } from 'lucide-react';

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
  const tabs = [
    { id: 'dashboard', code: '01', label: 'DASHBOARD' },
    { id: 'map', code: '02', label: '3D.GIS' },
    { id: 'inventory', code: '03', label: 'FEFO.STOCK' },
    { id: 'forecast', code: '04', label: 'TWEEDIE.AI' },
    { id: 'routes', code: '05', label: 'VRP.ROUTES' },
    { id: 'ocr', code: '06', label: 'OCR.VISION' },
  ];

  return (
    <header className="bg-canvas-soft border-b-2 border-[#111111] dark:border-[#4d535a] sticky top-0 z-50 px-4 sm:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Teenage Engineering Industrial Chassis Wordmark */}
        <div className="flex items-center gap-3">
          <div className="te-screw hidden sm:inline-flex"></div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="te-tape bg-yellow-400 text-black px-2 py-0.5 text-xs">
                KYZER // OP-24
              </span>
              <span className="font-extrabold tracking-tight text-ink text-sm sm:text-base font-mono">
                CAREDOM.SYS
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[9px] font-mono text-muted tracking-widest uppercase">
                HERON-QPU // READY [18 PHC]
              </span>
            </div>
          </div>
        </div>

        {/* Center: Tactile Hardware Step Sequencer Tabs */}
        <nav className="hidden lg:flex items-center bg-[#111111] dark:bg-[#18191b] p-1 border-2 border-[#111111] dark:border-[#4d535a] shadow-[2px_2px_0px_#000]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-mono font-bold tracking-tight transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#FF5500] text-white shadow-inner font-extrabold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
                }`}
              >
                <span className={`text-[9px] ${isActive ? 'text-black/80 font-mono' : 'text-zinc-500'}`}>
                  {tab.code}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Tactile Hardware Controls */}
        <div className="flex items-center gap-2">
          
          {/* Hardware Toggle Theme Switch */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            className="te-btn p-1.5 bg-surface-card hover:bg-surface-strong text-ink transition-colors flex items-center justify-center"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-ink" />
            ) : (
              <Sun className="w-4 h-4 text-yellow-400" />
            )}
          </button>

          {/* Physical Outbreak Push Trigger Button */}
          <button
            onClick={onSimulateOutbreak}
            className="te-btn flex items-center gap-1.5 bg-[#FF5500] hover:bg-[#ff3700] active:translate-y-0.5 text-white text-xs px-3.5 py-1.5 shrink-0 shadow-[2px_2px_0px_#000]"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline font-mono">SIM.SHOCK [!]</span>
            <span className="sm:hidden font-mono">SHOCK</span>
          </button>

          <div className="te-screw hidden sm:inline-flex"></div>
        </div>

      </div>

      {/* Mobile Responsive Step Sequencer Bar with Gradient Mask */}
      <div className="flex lg:hidden items-center overflow-x-auto gap-1 pt-2 border-t border-hairline mt-2 scrollbar-none [mask-image:linear-gradient(to_right,black_85%,transparent_100%)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-2.5 py-1 text-xs font-mono font-bold uppercase transition-all ${
              activeTab === tab.id
                ? 'bg-[#FF5500] text-white border border-black shadow-[1px_1px_0px_#000]'
                : 'bg-surface-card text-body border border-hairline'
            }`}
          >
            <span className="text-[9px] opacity-70 mr-1">{tab.code}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
