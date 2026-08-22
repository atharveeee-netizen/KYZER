import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  HeartHandshake, 
  ArrowRight, 
  Activity, 
  PhoneCall, 
  MapPin, 
  CheckCircle2, 
  Landmark, 
  Users, 
  Truck, 
  ExternalLink,
  Lock
} from 'lucide-react';

interface PublicPortalPageProps {
  onNavigateToLogin: (role?: 'facility' | 'district') => void;
  onExploreProgrammes?: () => void;
}

export const PublicPortalPage: React.FC<PublicPortalPageProps> = ({
  onNavigateToLogin,
  onExploreProgrammes,
}) => {
  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#202124] font-sans antialiased selection:bg-[#174A7C]/15 selection:text-[#174A7C]">
      
      {/* 1. Top Government / Public Health Context Ribbon (UX4G Standard) */}
      <div className="h-7 bg-[#EFEFEF] border-b border-[#D6D6D6] px-4 sm:px-8 flex items-center justify-between text-xs text-[#5F6368]">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[#202124]">
            India's Public Health Ecosystem
          </span>
          <span className="hidden sm:inline text-[#9AA0A6]">|</span>
          <span className="hidden sm:inline">
            Healthcare Supply Management & Facility Network
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="hidden md:inline">Helpline: <strong className="text-[#202124]">104 / 14555</strong></span>
          <span>District: <strong className="text-[#174A7C]">Pune (Maharashtra)</strong></span>
          <span>English</span>
        </div>
      </div>

      {/* 2. Public Portal Header */}
      <header className="h-16 bg-[#FFFFFF] border-b border-[#D6D6D6] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-8 h-8 rounded-[2px] bg-[#174A7C] flex items-center justify-center font-bold text-white text-base">
            K
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-[#174A7C] leading-none">
                KYZER
              </span>
              <span className="text-xs text-[#5F6368] font-normal leading-none hidden sm:inline">
                Healthcare Supply Management System
              </span>
            </div>
            <span className="text-[11px] text-[#5F6368] leading-none mt-1">
              Pune District Health Administration · 18 Primary Health Centres
            </span>
          </div>
        </div>

        {/* Public Navigation & Access CTA */}
        <div className="flex items-center gap-2 sm:gap-6 text-xs">
          <nav className="hidden md:flex items-center gap-5 text-[#5F6368] font-medium">
            <a href="#hero" className="hover:text-[#174A7C] transition-colors">Home</a>
            <a href="#programmes" className="hover:text-[#174A7C] transition-colors">Health Programmes</a>
            <a href="#network" className="hover:text-[#174A7C] transition-colors">Healthcare Network</a>
            <a href="#gateways" className="hover:text-[#174A7C] transition-colors">Access Portals</a>
            <a href="#about" className="hover:text-[#174A7C] transition-colors">About KYZER</a>
          </nav>

          <button
            onClick={() => onNavigateToLogin('facility')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#174A7C] hover:bg-[#123B63] rounded-[2px] transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Access KYZER</span>
          </button>
        </div>
      </header>

      {/* 3. Hero Section: The Healthcare Story & Institutional Context */}
      <section id="hero" className="py-10 sm:py-14 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Public Purpose */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#174A7C]/10 border border-[#174A7C]/30 text-[#174A7C] text-xs font-medium rounded-[2px]">
              <Activity className="w-3.5 h-3.5" />
              <span>Public Health Infrastructure & Supply Visibility</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#202124] leading-tight">
              Making essential healthcare supplies visible, available, and easier to move.
            </h1>

            <p className="text-sm sm:text-base text-[#5F6368] leading-relaxed">
              KYZER provides a connected digital layer for district health facilities to monitor medicine stock, prevent stockouts, and coordinate peer redistribution across primary health centres.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigateToLogin('facility')}
                className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#174A7C] hover:bg-[#123B63] rounded-[2px] transition-colors flex items-center gap-2"
              >
                <span>Access KYZER Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#programmes"
                className="px-4 py-2.5 text-xs sm:text-sm font-medium text-[#202124] bg-white hover:bg-[#EDEDED] border border-[#D6D6D6] rounded-[2px] transition-colors"
              >
                Explore Health Programmes
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#D6D6D6]">
              <div className="p-3 bg-white border border-[#D6D6D6] rounded-[2px]">
                <div className="text-lg sm:text-xl font-bold text-[#174A7C] font-mono">18</div>
                <div className="text-[11px] text-[#5F6368] mt-0.5">District Health Centres</div>
              </div>
              <div className="p-3 bg-white border border-[#D6D6D6] rounded-[2px]">
                <div className="text-lg sm:text-xl font-bold text-[#2F6B45] font-mono">42+</div>
                <div className="text-[11px] text-[#5F6368] mt-0.5">Essential Medicines</div>
              </div>
              <div className="p-3 bg-white border border-[#D6D6D6] rounded-[2px]">
                <div className="text-lg sm:text-xl font-bold text-[#202124] font-mono">0</div>
                <div className="text-[11px] text-[#5F6368] mt-0.5">Stockout Policy</div>
              </div>
            </div>
          </div>

          {/* Right Column: Documentary Photography Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-[#D6D6D6] rounded-[2px] overflow-hidden shadow-xs">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Prime_Minister_of_India_Narendra_Modi.jpg/640px-Prime_Minister_of_India_Narendra_Modi.jpg"
                alt="Hon'ble Prime Minister Shri Narendra Modi"
                className="w-full h-64 object-cover object-top border-b border-[#D6D6D6]"
              />
              <div className="p-4 space-y-2">
                <div className="text-[11px] font-bold uppercase text-[#174A7C]">National Health Perspective</div>
                <h3 className="text-sm font-bold text-[#202124]">
                  Strengthening healthcare delivery through connected public infrastructure.
                </h3>
                <p className="text-xs text-[#5F6368] leading-relaxed">
                  National digital health programmes increasingly rely on real-time inventory visibility and coordinated supply movement across public health centres to serve every citizen.
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-[#70757A] border-t border-[#E5E5E5]">
                  <span>Prime Minister of India</span>
                  <span>Public Health Context</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Government Health Programmes Section (Yojanas / National Initiatives) */}
      <section id="programmes" className="py-12 bg-white border-y border-[#D6D6D6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-[#E5E5E5]">
            <div>
              <div className="text-xs font-bold uppercase text-[#174A7C]">Related Public Health Ecosystem</div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#202124] mt-1">
                National Health Programmes & Infrastructure
              </h2>
            </div>
            <span className="text-xs text-[#5F6368]">Universal Health Coverage & Access Initiatives</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Programme 1: Ayushman Bharat */}
            <div className="p-4 bg-[#F7F7F7] border border-[#D6D6D6] rounded-[2px] space-y-2">
              <div className="w-8 h-8 rounded-[2px] bg-[#174A7C]/10 flex items-center justify-center text-[#174A7C]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#202124]">Ayushman Bharat (PM-JAY)</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Universal healthcare coverage and Health & Wellness Centres providing comprehensive primary healthcare services.
              </p>
              <div className="text-[11px] text-[#174A7C] font-medium pt-1">Universal Care Coverage</div>
            </div>

            {/* Programme 2: National Health Mission */}
            <div className="p-4 bg-[#F7F7F7] border border-[#D6D6D6] rounded-[2px] space-y-2">
              <div className="w-8 h-8 rounded-[2px] bg-[#2F6B45]/10 flex items-center justify-center text-[#2F6B45]">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#202124]">National Health Mission (NHM)</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Strengthening public health systems, maternal-child health, and free essential medicine delivery across rural India.
              </p>
              <div className="text-[11px] text-[#2F6B45] font-medium pt-1">Primary Health Infrastructure</div>
            </div>

            {/* Programme 3: eSanjeevani */}
            <div className="p-4 bg-[#F7F7F7] border border-[#D6D6D6] rounded-[2px] space-y-2">
              <div className="w-8 h-8 rounded-[2px] bg-[#8A6418]/10 flex items-center justify-center text-[#8A6418]">
                <PhoneCall className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#202124]">eSanjeevani Telemedicine</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                National telemedicine service enabling remote consultations and specialist medical advice for rural health centres.
              </p>
              <div className="text-[11px] text-[#8A6418] font-medium pt-1">Digital Consultation</div>
            </div>

            {/* Programme 4: ABDM */}
            <div className="p-4 bg-[#F7F7F7] border border-[#D6D6D6] rounded-[2px] space-y-2">
              <div className="w-8 h-8 rounded-[2px] bg-[#174A7C]/10 flex items-center justify-center text-[#174A7C]">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#202124]">Digital Health Mission (ABDM)</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Digital health registries, standardized health facility IDs, and interoperable health data infrastructure.
              </p>
              <div className="text-[11px] text-[#174A7C] font-medium pt-1">Digital Health Backbone</div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Healthcare Supply Chain Flow (From Policy to Patient) */}
      <section id="network" className="py-12 px-4 sm:px-8 max-w-6xl mx-auto space-y-6">
        <div className="pb-3 border-b border-[#D6D6D6]">
          <div className="text-xs font-bold uppercase text-[#174A7C]">Operational Hierarchy</div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202124] mt-1">
            Healthcare Supply Chain Integration Chain
          </h2>
          <p className="text-xs text-[#5F6368] mt-1">
            How policy coordinates with facilities and KYZER to ensure continuous medicine availability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
          <div className="p-4 bg-white border border-[#D6D6D6] rounded-[2px] space-y-1">
            <div className="text-[10px] text-[#70757A] font-bold uppercase">1. National Policy</div>
            <div className="text-sm font-bold text-[#174A7C]">MoHFW</div>
            <div className="text-xs text-[#5F6368]">Essential Medicine Guidelines</div>
          </div>

          <div className="p-4 bg-white border border-[#D6D6D6] rounded-[2px] space-y-1">
            <div className="text-[10px] text-[#70757A] font-bold uppercase">2. State Health Dept</div>
            <div className="text-sm font-bold text-[#174A7C]">Maharashtra</div>
            <div className="text-xs text-[#5F6368]">Regional Depot Procurement</div>
          </div>

          <div className="p-4 bg-white border border-[#D6D6D6] rounded-[2px] space-y-1">
            <div className="text-[10px] text-[#70757A] font-bold uppercase">3. District Admin</div>
            <div className="text-sm font-bold text-[#174A7C]">Pune District</div>
            <div className="text-xs text-[#5F6368]">District Health Officer (DHO)</div>
          </div>

          <div className="p-4 bg-white border border-[#D6D6D6] rounded-[2px] space-y-1">
            <div className="text-[10px] text-[#70757A] font-bold uppercase">4. Health Facilities</div>
            <div className="text-sm font-bold text-[#174A7C]">18 PHCs & CHCs</div>
            <div className="text-xs text-[#5F6368]">Frontline Clinical Dispensaries</div>
          </div>

          <div className="p-4 bg-[#174A7C] text-white rounded-[2px] space-y-1">
            <div className="text-[10px] text-[#D6D6D6] font-bold uppercase">5. KYZER Layer</div>
            <div className="text-sm font-bold text-white">Redistribution</div>
            <div className="text-xs text-[#E0E0E0]">Peer Transfer & Run-Rates</div>
          </div>
        </div>
      </section>

      {/* 6. Distinct Stakeholder Access Portals (Gateway Section) */}
      <section id="gateways" className="py-12 bg-white border-y border-[#D6D6D6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 space-y-6">
          <div className="pb-3 border-b border-[#E5E5E5]">
            <div className="text-xs font-bold uppercase text-[#174A7C]">Authorized Gateways</div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#202124] mt-1">
              KYZER System Access Portals
            </h2>
            <p className="text-xs text-[#5F6368] mt-1">
              Select your role to access operational tools, stock registers, and redistribution workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Gateway 1: For Citizens */}
            <div className="p-5 bg-[#F7F7F7] border border-[#D6D6D6] rounded-[2px] space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2F6B45]">
                  <Users className="w-4 h-4" />
                  <span>FOR CITIZENS</span>
                </div>
                <h3 className="text-base font-bold text-[#202124]">Public Healthcare Information</h3>
                <p className="text-xs text-[#5F6368] leading-relaxed">
                  Find nearest primary health centres in Pune district, understand free essential medicine entitlements, and check health programme eligibility.
                </p>
              </div>
              <a
                href="#network"
                className="w-full py-2 text-xs font-medium text-[#202124] bg-white hover:bg-[#EDEDED] border border-[#D6D6D6] rounded-[2px] transition-colors text-center block"
              >
                View Facility Directory
              </a>
            </div>

            {/* Gateway 2: For Health Facilities */}
            <div className="p-5 bg-white border-2 border-[#174A7C] rounded-[2px] space-y-3 flex flex-col justify-between shadow-xs">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#174A7C]">
                  <Building2 className="w-4 h-4" />
                  <span>FOR HEALTH FACILITIES</span>
                </div>
                <h3 className="text-base font-bold text-[#202124]">Facility Stock & Dispensing</h3>
                <p className="text-xs text-[#5F6368] leading-relaxed">
                  Medical officers and pharmacists can log stock balances, scan paper registers, request buffer replenishments, and accept transfers.
                </p>
              </div>
              <button
                onClick={() => onNavigateToLogin('facility')}
                className="w-full py-2.5 text-xs font-bold text-white bg-[#174A7C] hover:bg-[#123B63] rounded-[2px] transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Health Facility Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Gateway 3: For District Administration */}
            <div className="p-5 bg-[#F7F7F7] border border-[#D6D6D6] rounded-[2px] space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#8A6418]">
                  <Landmark className="w-4 h-4" />
                  <span>FOR DISTRICT ADMINISTRATION</span>
                </div>
                <h3 className="text-base font-bold text-[#202124]">District Operations & 3D Map</h3>
                <p className="text-xs text-[#5F6368] leading-relaxed">
                  District Health Officers and logistics coordinators can monitor 18 centres on the 3D map, evaluate shortages, and approve inter-clinic transfers.
                </p>
              </div>
              <button
                onClick={() => onNavigateToLogin('district')}
                className="w-full py-2.5 text-xs font-bold text-[#202124] bg-white hover:bg-[#EDEDED] border border-[#D6D6D6] rounded-[2px] transition-colors flex items-center justify-center gap-1.5"
              >
                <span>District Administration Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 7. About KYZER */}
      <section id="about" className="py-12 px-4 sm:px-8 max-w-6xl mx-auto space-y-4">
        <div className="pb-3 border-b border-[#D6D6D6]">
          <div className="text-xs font-bold uppercase text-[#174A7C]">About the Platform</div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#202124] mt-1">
            KYZER Healthcare Supply Management System
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#5F6368] leading-relaxed">
          <div className="space-y-1.5">
            <h4 className="font-bold text-[#202124] text-sm">Proactive Shortage Prevention</h4>
            <p>
              Rather than waiting for stockout emergencies, KYZER calculates consumption run-rates to identify potential supply shortages 3 to 7 days before medicine bins run empty.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-[#202124] text-sm">Nearest Peer Redistribution</h4>
            <p>
              When a clinic needs supplies, the system identifies the nearest facility with sufficient buffer stock, evaluates road distances and cold-chain safety, and generates verified transfer recommendations.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-[#202124] text-sm">Built for Indian Public Health</h4>
            <p>
              Designed for low-bandwidth rural connectivity, physical register scanning, and seamless coordination across district health administrations.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Public Government-Style Footer */}
      <footer className="bg-[#FFFFFF] border-t border-[#D6D6D6] py-8 px-4 sm:px-8 text-xs text-[#5F6368]">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#174A7C] text-white font-bold flex items-center justify-center text-xs rounded-[2px]">K</div>
                <span className="font-bold text-sm text-[#174A7C]">KYZER</span>
              </div>
              <p className="text-[11px] text-[#70757A] mt-1">Healthcare Supply Management System · Pune District</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-[#174A7C]">
              <button onClick={() => onNavigateToLogin('facility')} className="hover:underline">Health Facility Login</button>
              <button onClick={() => onNavigateToLogin('district')} className="hover:underline">District Admin Login</button>
              <a href="#hero" className="hover:underline">Back to Top</a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#70757A]">
            <p>
              © 2026 KYZER. Operational software for district healthcare supply visibility and peer redistribution.
            </p>
            <p>
              National Health Helpline: 104 / 14555 | Ambulance: 108
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};
