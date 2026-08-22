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
  Stethoscope,
  ChevronDown,
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
    <div className="min-h-screen bg-[#FFFFFF] text-[#202124] font-sans antialiased selection:bg-[#174A7C]/15 selection:text-[#174A7C]">
      
      {/* 1. Top Government Information Ribbon */}
      <div className="h-7 bg-[#174A7C] text-white px-4 sm:px-8 flex items-center justify-between text-xs font-normal">
        <div className="flex items-center gap-3">
          <span className="font-medium text-white">
            India's Public Health Ecosystem
          </span>
          <span className="hidden sm:inline opacity-60">|</span>
          <span className="hidden sm:inline text-white/90">
            Healthcare Supply Management & Facility Network
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-white/90">
          <span className="hidden md:inline">Helpline: <strong className="text-white font-semibold">104 / 14555</strong></span>
          <span className="hidden sm:inline">District: <strong className="text-white font-semibold">Pune (Maharashtra)</strong></span>
          <div className="flex items-center gap-1 cursor-pointer">
            <span>English</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </div>
        </div>
      </div>

      {/* 2. Main Public Header */}
      <header className="h-16 bg-[#FFFFFF] border-b border-[#D6D6D6] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-8 h-8 rounded-[2px] bg-[#174A7C] flex items-center justify-center font-bold text-white text-base">
            K
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg tracking-tight text-[#174A7C] leading-none">
                KYZER
              </span>
              <span className="text-xs text-[#5F6368] font-normal leading-none hidden sm:inline">
                Healthcare Supply Management System
              </span>
            </div>
            <span className="text-[11px] text-[#70757A] leading-none mt-1">
              Pune District Health Administration · 18 Primary Health Centres
            </span>
          </div>
        </div>

        {/* Public Navigation */}
        <div className="flex items-center gap-2 sm:gap-6 text-xs">
          <nav className="hidden md:flex items-center gap-6 text-[#5F6368] font-medium">
            <a href="#hero" className="text-[#174A7C] font-semibold border-b-2 border-[#174A7C] pb-0.5">Home</a>
            <a href="#programmes" className="hover:text-[#174A7C] transition-colors">Programmes</a>
            <a href="#network" className="hover:text-[#174A7C] transition-colors">Healthcare Network</a>
            <a href="#about" className="hover:text-[#174A7C] transition-colors">About KYZER</a>
          </nav>

          <button
            onClick={() => onNavigateToLogin('facility')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0A3A6B] hover:bg-[#082D53] rounded-[2px] transition-colors shadow-xs"
          >
            <span>Access KYZER</span>
          </button>
        </div>
      </header>

      {/* 3. Hero Section (Composite Banner matching Reference) */}
      <section id="hero" className="relative bg-[#F7F7F7] border-b border-[#D6D6D6] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Headline & Copy */}
            <div className="lg:col-span-6 space-y-4 z-10">
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#202124] leading-tight">
                Making essential healthcare supplies visible, available and easier to move.
              </h1>

              <p className="text-sm text-[#5F6368] leading-relaxed max-w-xl">
                KYZER helps health facilities monitor stock, identify shortages and coordinate redistribution across the district healthcare network.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigateToLogin('facility')}
                  className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#0A3A6B] hover:bg-[#082D53] rounded-[2px] transition-colors flex items-center gap-2"
                >
                  <span>Access KYZER</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#programmes"
                  className="px-4 py-2.5 text-xs sm:text-sm font-medium text-[#202124] bg-white hover:bg-[#EDEDED] border border-[#D6D6D6] rounded-[2px] transition-colors"
                >
                  Explore Programmes
                </a>
              </div>
            </div>

            {/* Right: Photographic Montage & Modi Caption Card */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-[2px] overflow-hidden border border-[#D6D6D6] bg-white shadow-xs">
                
                {/* Visual Composite representing Public Health Delivery (Natural lighting, 0 gradients) */}
                <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-[#E9EEF3]">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Prime_Minister_of_India_Narendra_Modi.jpg/640px-Prime_Minister_of_India_Narendra_Modi.jpg"
                    alt="Indian Public Health Leadership & Delivery"
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Neutral Institutional Caption Card */}
                <div className="p-4 bg-white border-t border-[#D6D6D6] space-y-1">
                  <div>
                    <h3 className="text-xs font-bold text-[#202124]">Shri Narendra Modi</h3>
                    <p className="text-[11px] text-[#5F6368]">Prime Minister of India</p>
                  </div>
                  <p className="text-xs text-[#5F6368] leading-relaxed pt-1">
                    India's public health system connects national policy, state health departments, district administration and frontline health centres.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. National Health Programmes Section (Neutral Grey Icons) */}
      <section id="programmes" className="py-10 bg-white border-b border-[#D6D6D6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
            <h2 className="text-lg font-bold text-[#202124]">
              National Health Programmes
            </h2>
            <a href="#programmes" className="text-xs text-[#174A7C] font-medium hover:underline flex items-center gap-1">
              <span>View all programmes</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Ayushman Bharat */}
            <div className="p-4 bg-white border border-[#D6D6D6] rounded-[2px] space-y-2 hover:border-[#174A7C] transition-colors">
              <div className="w-8 h-8 rounded-[2px] bg-[#F0F0F0] flex items-center justify-center text-[#7A7A7A]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#202124]">Ayushman Bharat (PM-JAY)</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Health coverage and financial protection for families across India.
              </p>
              <a href="#programmes" className="text-xs text-[#174A7C] font-medium hover:underline inline-flex items-center gap-1 pt-1">
                <span>Learn more</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {/* Card 2: National Health Mission */}
            <div className="p-4 bg-white border border-[#D6D6D6] rounded-[2px] space-y-2 hover:border-[#174A7C] transition-colors">
              <div className="w-8 h-8 rounded-[2px] bg-[#F0F0F0] flex items-center justify-center text-[#7A7A7A]">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#202124]">National Health Mission (NHM)</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Strengthening public healthcare delivery and essential medicine supply.
              </p>
              <a href="#programmes" className="text-xs text-[#174A7C] font-medium hover:underline inline-flex items-center gap-1 pt-1">
                <span>Learn more</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {/* Card 3: eSanjeevani */}
            <div className="p-4 bg-white border border-[#D6D6D6] rounded-[2px] space-y-2 hover:border-[#174A7C] transition-colors">
              <div className="w-8 h-8 rounded-[2px] bg-[#F0F0F0] flex items-center justify-center text-[#7A7A7A]">
                <Stethoscope className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#202124]">eSanjeevani Telemedicine</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Consult doctors online from local health centres and clinics.
              </p>
              <a href="#programmes" className="text-xs text-[#174A7C] font-medium hover:underline inline-flex items-center gap-1 pt-1">
                <span>Learn more</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {/* Card 4: Digital Health Mission */}
            <div className="p-4 bg-white border border-[#D6D6D6] rounded-[2px] space-y-2 hover:border-[#174A7C] transition-colors">
              <div className="w-8 h-8 rounded-[2px] bg-[#F0F0F0] flex items-center justify-center text-[#7A7A7A]">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#202124]">Digital Health Mission (ABDM)</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Digital health registries and facility-level health records.
              </p>
              <a href="#programmes" className="text-xs text-[#174A7C] font-medium hover:underline inline-flex items-center gap-1 pt-1">
                <span>Learn more</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* 5. From Policy to Patient Integration Chain */}
      <section id="network" className="py-8 bg-[#F7F7F7] border-b border-[#D6D6D6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-4">
          <div className="text-xs font-bold uppercase text-[#5F6368] tracking-wider">
            From Policy to Patient
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-3 bg-white border border-[#D6D6D6] rounded-[2px] flex items-center gap-2.5">
              <Landmark className="w-4 h-4 text-[#5F6368] shrink-0" />
              <div>
                <div className="font-semibold text-[#202124]">National Policy</div>
                <div className="text-[11px] text-[#5F6368]">MoHFW</div>
              </div>
            </div>

            <div className="p-3 bg-white border border-[#D6D6D6] rounded-[2px] flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-[#5F6368] shrink-0" />
              <div>
                <div className="font-semibold text-[#202124]">State Health Dept</div>
                <div className="text-[11px] text-[#5F6368]">Maharashtra</div>
              </div>
            </div>

            <div className="p-3 bg-white border border-[#D6D6D6] rounded-[2px] flex items-center gap-2.5">
              <Landmark className="w-4 h-4 text-[#5F6368] shrink-0" />
              <div>
                <div className="font-semibold text-[#202124]">District Admin</div>
                <div className="text-[11px] text-[#5F6368]">Pune District</div>
              </div>
            </div>

            <div className="p-3 bg-white border border-[#D6D6D6] rounded-[2px] flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-[#5F6368] shrink-0" />
              <div>
                <div className="font-semibold text-[#202124]">18 Health Facilities</div>
                <div className="text-[11px] text-[#5F6368]">(PHCs & CHCs)</div>
              </div>
            </div>

            <div className="p-3 bg-[#0A3A6B] text-white rounded-[2px] flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-white shrink-0" />
              <div>
                <div className="font-semibold text-white">KYZER Layer</div>
                <div className="text-[11px] text-white/80">Redistribution</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Stakeholder Gateways & Leadership */}
      <section className="py-10 bg-white border-b border-[#D6D6D6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: For Citizens */}
            <div className="border border-[#D6D6D6] rounded-[2px] overflow-hidden flex flex-col justify-between bg-white">
              <div>
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80"
                  alt="Citizens & Healthcare Services"
                  className="w-full h-36 object-cover border-b border-[#D6D6D6]"
                />
                <div className="p-4 space-y-2.5">
                  <h3 className="text-sm font-bold text-[#202124]">For Citizens</h3>
                  <ul className="text-xs text-[#5F6368] space-y-1.5">
                    <li>• Find health services</li>
                    <li>• Understand health programmes</li>
                    <li>• Locate nearby facilities</li>
                    <li>• Health helpline: <strong>104 / 14555</strong></li>
                  </ul>
                </div>
              </div>
              <div className="p-4 pt-0">
                <a href="#network" className="text-xs text-[#174A7C] font-medium hover:underline inline-flex items-center gap-1">
                  <span>Learn more</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Card 2: For Health Facilities */}
            <div className="border border-[#D6D6D6] rounded-[2px] overflow-hidden flex flex-col justify-between bg-white">
              <div>
                <img
                  src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80"
                  alt="Primary Health Centre"
                  className="w-full h-36 object-cover border-b border-[#D6D6D6]"
                />
                <div className="p-4 space-y-2.5">
                  <h3 className="text-sm font-bold text-[#202124]">For Health Facilities</h3>
                  <ul className="text-xs text-[#5F6368] space-y-1.5">
                    <li>• View inventory and stock status</li>
                    <li>• Raise stock requests</li>
                    <li>• Find nearby available stock</li>
                    <li>• Coordinate transfers</li>
                  </ul>
                </div>
              </div>
              <div className="p-4 pt-0">
                <button
                  onClick={() => onNavigateToLogin('facility')}
                  className="w-full py-2 text-xs font-semibold text-white bg-[#0A3A6B] hover:bg-[#082D53] rounded-[2px] transition-colors"
                >
                  Health Facility Login
                </button>
              </div>
            </div>

            {/* Card 3: For District Administration */}
            <div className="border border-[#D6D6D6] rounded-[2px] overflow-hidden flex flex-col justify-between bg-white">
              <div>
                <img
                  src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80"
                  alt="District Health Administration"
                  className="w-full h-36 object-cover border-b border-[#D6D6D6]"
                />
                <div className="p-4 space-y-2.5">
                  <h3 className="text-sm font-bold text-[#202124]">For District Administration</h3>
                  <ul className="text-xs text-[#5F6368] space-y-1.5">
                    <li>• District-wide stock visibility</li>
                    <li>• Monitor shortages and requests</li>
                    <li>• Approve and track transfers</li>
                    <li>• Data for better decisions</li>
                  </ul>
                </div>
              </div>
              <div className="p-4 pt-0">
                <button
                  onClick={() => onNavigateToLogin('district')}
                  className="w-full py-2 text-xs font-semibold text-white bg-[#0A3A6B] hover:bg-[#082D53] rounded-[2px] transition-colors"
                >
                  District Admin Login
                </button>
              </div>
            </div>

            {/* Card 4: Public Health Leadership & Administration */}
            <div className="border border-[#D6D6D6] rounded-[2px] p-4 flex flex-col justify-between bg-[#F7F7F7]">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#202124]">
                    Public Health Leadership & Administration
                  </h3>
                  <p className="text-[11px] text-[#5F6368] mt-0.5">
                    Coordinated multi-echelon public health hierarchy
                  </p>
                </div>

                <div className="space-y-2.5 text-xs text-[#5F6368]">
                  <div>
                    <div className="font-semibold text-[#202124]">National</div>
                    <div>Government of India</div>
                    <div>Ministry of Health & Family Welfare</div>
                  </div>

                  <div>
                    <div className="font-semibold text-[#202124]">State</div>
                    <div>Maharashtra Health Department</div>
                  </div>

                  <div>
                    <div className="font-semibold text-[#202124]">District</div>
                    <div>Pune District Health Administration</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#D6D6D6]">
                <a href="#about" className="text-xs text-[#174A7C] font-semibold hover:underline inline-flex items-center gap-1">
                  <span>About KYZER</span>
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. About KYZER */}
      <section id="about" className="py-10 bg-white border-b border-[#D6D6D6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-4">
          <div className="pb-2 border-b border-[#E5E5E5]">
            <h2 className="text-base font-bold text-[#202124]">
              About KYZER
            </h2>
          </div>
          <p className="text-xs text-[#5F6368] leading-relaxed max-w-4xl">
            KYZER is an operational software system designed for district health networks. It calculates medicine consumption run-rates, forecasts demand, and coordinates peer-to-peer redistribution between nearby primary health centres to prevent stockouts before they occur.
          </p>
        </div>
      </section>

      {/* 8. Public Government-Style Footer */}
      <footer className="bg-[#0A3A6B] text-white py-6 px-4 sm:px-8 text-xs font-normal">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold text-sm text-white">KYZER – Healthcare Supply Management System</div>
            <div className="text-[11px] text-white/80 mt-0.5">© 2026 KYZER. All rights reserved.</div>
          </div>
          <div className="flex items-center gap-5 text-xs text-white/90">
            <a href="#about" className="hover:underline">Privacy</a>
            <a href="#about" className="hover:underline">Accessibility</a>
            <a href="#about" className="hover:underline">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
