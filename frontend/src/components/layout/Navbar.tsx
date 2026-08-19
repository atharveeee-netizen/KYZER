import React, { useState } from 'react';
import { Zap, Sun, Moon, Radio, Volume2, Mic } from 'lucide-react';

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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const tabs = [
    { id: 'dashboard', code: '01', label: 'DASHBOARD', kanji: '統括' },
    { id: 'map', code: '02', label: '3D.GIS', kanji: '地図' },
    { id: 'inventory', code: '03', label: 'FEFO.STOCK', kanji: '在庫' },
    { id: 'forecast', code: '04', label: 'TWEEDIE.AI', kanji: '予測' },
    { id: 'routes', code: '05', label: 'VRP.ROUTES', kanji: '経路' },
    { id: 'ocr', code: '06', label: 'OCR.VISION', kanji: '画像' },
  ];

  const handleVoiceToggle = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  return (
    <header className="bg-canvas-soft border-b-2 border-[#111111] dark:border-[#4d535a] sticky top-0 z-50 px-3 sm:px-6 py-2.5 transition-colors font-mono">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Left: Japanese Minimalist Editorial Typography + Teenage Engineering Wordmark */}
        <div className="flex items-center gap-3">
          <div className="te-screw hidden sm:inline-flex"></div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="te-tape bg-yellow-400 text-black px-2 py-0.5 text-[10px] sm:text-xs">
                KYZER // OP-24
              </span>
              <span className="font-extrabold tracking-tight text-ink text-sm sm:text-base font-mono">
                CAREDOM
              </span>
              <span className="text-[9px] text-zinc-400 font-normal hidden md:inline select-none">
                自律医療物流 // SYS.01
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-ping"></span>
              <span className="text-[9px] font-mono text-muted tracking-widest uppercase">
                HERON-QPU // READY [18 PHC]
              </span>
            </div>
          </div>
        </div>

        {/* Center: Tactile Hardware Step Sequencer Tabs (21st.dev + Teenage Engineering) */}
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
                <span className={`text-[8px] opacity-60 ml-0.5 ${isActive ? 'text-white' : 'text-zinc-600'}`}>
                  {tab.kanji}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right: Audio Waveform Synthesizer + Theme Toggle + Shock Trigger */}
        <div className="flex items-center gap-2">
          
          {/* Open-LLM-VTuber / Voice Audio Stream Waveform Visualizer */}
          <button
            onClick={handleVoiceToggle}
            title="ASHA Voice Alert Synthesizer (Sarvam Bulbul / IndicTTS)"
            className={`te-btn p-1.5 px-2 text-xs flex items-center gap-1.5 transition-all ${
              isPlayingAudio 
                ? 'bg-emerald-500 text-black border-black' 
                : 'bg-surface-card hover:bg-surface-strong text-ink'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-black animate-pulse" />
                <div className="flex items-end gap-0.5 h-3 w-8">
                  <span className="w-1 bg-black h-2 animate-[bounce_0.6s_infinite]"></span>
                  <span className="w-1 bg-black h-3 animate-[bounce_0.4s_infinite]"></span>
                  <span className="w-1 bg-black h-1.5 animate-[bounce_0.5s_infinite]"></span>
                  <span className="w-1 bg-black h-2.5 animate-[bounce_0.3s_infinite]"></span>
                </div>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-muted" />
                <span className="hidden sm:inline text-[10px]">VOICE</span>
              </>
            )}
          </button>

          {/* Hardware Theme Toggle */}
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
            className="te-btn flex items-center gap-1.5 bg-[#FF5500] hover:bg-[#ff3700] active:translate-y-0.5 text-white text-xs px-3 py-1.5 shrink-0 shadow-[2px_2px_0px_#000]"
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
