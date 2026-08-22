import React from 'react';
import { ArrowRight } from 'lucide-react';

interface PublicPortalPageProps {
  onNavigateToLogin: (role?: 'facility' | 'district') => void;
  onExploreProgrammes?: () => void;
}

export const PublicPortalPage: React.FC<PublicPortalPageProps> = ({
  onNavigateToLogin,
}) => {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#202124] font-sans antialiased selection:bg-[#174A7C]/15 selection:text-[#174A7C]">
      
      {/* 1. Small Government-Style Utility Header */}
      <div className="h-7 bg-[#F0F0F0] border-b border-[#E0E0E0] px-4 sm:px-8 flex items-center text-xs text-[#5F6368]">
        <span className="font-medium text-[#5F6368]">
          Government Health Services
        </span>
      </div>

      {/* 2. Main KYZER Header */}
      <header className="h-16 bg-[#FFFFFF] border-b border-[#D6D6D6] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-[2px] bg-[#174A7C] flex items-center justify-center font-bold text-white text-sm">
            K
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-[#174A7C] leading-none">
              KYZER
            </span>
            <span className="text-[11px] text-[#5F6368] leading-none mt-1">
              Healthcare Supply Management
            </span>
          </div>
        </div>

        {/* Simple Navigation */}
        <div className="flex items-center gap-5 text-xs">
          <nav className="hidden sm:flex items-center gap-4 text-[#5F6368] font-medium">
            <a href="#about" className="hover:text-[#174A7C] transition-colors">About</a>
            <a href="#about" className="hover:text-[#174A7C] transition-colors">Help</a>
          </nav>

          <button
            onClick={() => onNavigateToLogin('facility')}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0A3A6B] hover:bg-[#082D53] rounded-[2px] transition-colors"
          >
            Access KYZER
          </button>
        </div>
      </header>

      {/* 3. Simple Hero */}
      <section id="hero" className="bg-[#F7F7F7] border-b border-[#D6D6D6] py-12 lg:py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Text & Single CTA */}
            <div className="lg:col-span-7 space-y-4">
              <div className="text-xs font-bold text-[#174A7C] uppercase tracking-wider">
                KYZER
              </div>

              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#202124] leading-tight">
                Healthcare supply management<br className="hidden sm:inline" /> for district health facilities.
              </h1>

              <p className="text-sm text-[#5F6368] leading-relaxed max-w-lg">
                Monitor stock, identify shortages and move available supplies where they are needed.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => onNavigateToLogin('facility')}
                  className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#0A3A6B] hover:bg-[#082D53] rounded-[2px] transition-colors inline-flex items-center gap-2"
                >
                  <span>Access KYZER</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: Public Health Photograph & Small Factual Caption */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-[#D6D6D6] rounded-[2px] overflow-hidden">
                <div className="h-64 sm:h-72 w-full overflow-hidden bg-[#E9EEF3]">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Prime_Minister_of_India_Narendra_Modi.jpg/640px-Prime_Minister_of_India_Narendra_Modi.jpg"
                    alt="Public Health Context"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="p-3 bg-white border-t border-[#D6D6D6]">
                  <div className="text-xs font-bold text-[#202124]">Shri Narendra Modi</div>
                  <div className="text-[11px] text-[#5F6368]">Prime Minister of India</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. How KYZER helps */}
      <section className="py-12 bg-white border-b border-[#D6D6D6] px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <h2 className="text-lg font-bold text-[#202124]">
            How KYZER helps
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-[#5F6368]">
            <div className="space-y-1 p-4 bg-[#F7F7F7] border border-[#D6D6D6] rounded-[2px]">
              <div className="font-bold text-sm text-[#202124] uppercase tracking-wide">STOCK</div>
              <p className="text-xs text-[#5F6368] pt-1">See what is available.</p>
            </div>

            <div className="space-y-1 p-4 bg-[#F7F7F7] border border-[#D6D6D6] rounded-[2px]">
              <div className="font-bold text-sm text-[#202124] uppercase tracking-wide">SHORTAGES</div>
              <p className="text-xs text-[#5F6368] pt-1">Identify facilities running low.</p>
            </div>

            <div className="space-y-1 p-4 bg-[#F7F7F7] border border-[#D6D6D6] rounded-[2px]">
              <div className="font-bold text-sm text-[#202124] uppercase tracking-wide">REDISTRIBUTION</div>
              <p className="text-xs text-[#5F6368] pt-1">Find nearby available stock.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Related health programmes */}
      <section className="py-8 bg-[#F7F7F7] border-b border-[#D6D6D6] px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="font-semibold text-[#202124]">
            Related health programmes
          </div>

          <div className="flex flex-wrap items-center gap-5 sm:gap-8 text-xs text-[#5F6368]">
            <span>Ayushman Bharat</span>
            <span>NHM</span>
            <span>eSanjeevani</span>
            <span>ABDM</span>
          </div>
        </div>
      </section>

      {/* 6. Who uses KYZER? */}
      <section id="about" className="py-12 bg-white border-b border-[#D6D6D6] px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <h2 className="text-lg font-bold text-[#202124]">
            Who uses KYZER?
          </h2>

          <p className="text-xs sm:text-sm text-[#5F6368] leading-relaxed max-w-2xl">
            Health facilities monitor stock and request supplies. District teams identify shortages and coordinate transfers.
          </p>

          <div className="pt-2">
            <button
              onClick={() => onNavigateToLogin('facility')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0A3A6B] hover:bg-[#082D53] rounded-[2px] transition-colors"
            >
              Access KYZER
            </button>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-8 bg-white text-xs text-[#5F6368] px-4 sm:px-8 border-t border-[#E5E5E5]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-baseline justify-between gap-3">
          <div>
            <div className="font-bold text-sm text-[#174A7C]">KYZER</div>
            <p className="text-[11px] text-[#5F6368] mt-0.5">
              Healthcare supply management for district health facilities.
            </p>
          </div>
          <div className="text-[11px] text-[#9AA0A6]">
            © 2026 KYZER
          </div>
        </div>
      </footer>

    </div>
  );
};
