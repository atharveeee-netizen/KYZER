import os

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f'Wrote {path}')

# ==============================================================================
# 1. frontend/src/components/public/PublicPortalPage.tsx
# ==============================================================================
public_portal_code = '''import React from 'react';
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
};'''

write('frontend/src/components/public/PublicPortalPage.tsx', public_portal_code)

# ==============================================================================
# 2. frontend/src/components/public/LoginPage.tsx (Government Access Gateway)
# ==============================================================================
login_page_code = '''import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  CheckCircle2, 
  Landmark,
  UserCheck
} from 'lucide-react';

interface LoginPageProps {
  initialRole?: 'facility' | 'district';
  onLoginSuccess: (role: 'facility' | 'district') => void;
  onBackToPublic: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  initialRole = 'facility',
  onLoginSuccess,
  onBackToPublic,
}) => {
  const [role, setRole] = useState<'facility' | 'district'>(initialRole);
  const [facilityId, setFacilityId] = useState<string>('PHC-PUN-002');
  const [userId, setUserId] = useState<string>('OFFICER-PUN-002');
  const [password, setPassword] = useState<string>('••••••••');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(role);
    }, 600);
  };

  const handleQuickDemoLogin = (selectedRole: 'facility' | 'district') => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(selectedRole);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#202124] font-sans antialiased flex flex-col justify-between selection:bg-[#174A7C]/15 selection:text-[#174A7C]">
      
      {/* 1. Top Ribbon */}
      <div className="h-7 bg-[#EFEFEF] border-b border-[#D6D6D6] px-4 sm:px-8 flex items-center justify-between text-xs text-[#5F6368]">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[#202124]">
            KYZER Secure Access Portal
          </span>
          <span className="hidden sm:inline text-[#9AA0A6]">|</span>
          <span className="hidden sm:inline">
            District Healthcare Operations Gateway
          </span>
        </div>
        <button
          onClick={onBackToPublic}
          className="flex items-center gap-1 text-xs text-[#174A7C] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Public Portal</span>
        </button>
      </div>

      {/* 2. Login Gateway Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white border border-[#D6D6D6] rounded-[2px] p-6 sm:p-8 space-y-6 shadow-xs">
          
          {/* Header */}
          <div className="text-center space-y-2 pb-4 border-b border-[#E5E5E5]">
            <div className="w-10 h-10 rounded-[2px] bg-[#174A7C] text-white font-bold text-lg flex items-center justify-center mx-auto">
              K
            </div>
            <h1 className="text-xl font-bold text-[#174A7C] tracking-tight">
              KYZER Access Portal
            </h1>
            <p className="text-xs text-[#5F6368]">
              Sign in to access healthcare supply and district operations.
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F7F7F7] border border-[#D6D6D6] rounded-[2px]">
            <button
              type="button"
              onClick={() => {
                setRole('facility');
                setFacilityId('PHC-PUN-002');
                setUserId('OFFICER-PUN-002');
              }}
              className={`py-2 text-xs font-medium rounded-[2px] transition-colors ${
                role === 'facility'
                  ? 'bg-white text-[#174A7C] border border-[#D6D6D6] shadow-xs font-semibold'
                  : 'text-[#5F6368] hover:text-[#202124]'
              }`}
            >
              Health Facility
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('district');
                setFacilityId('DHO-PUN-001');
                setUserId('ADMIN-PUNE-DIST');
              }}
              className={`py-2 text-xs font-medium rounded-[2px] transition-colors ${
                role === 'district'
                  ? 'bg-white text-[#174A7C] border border-[#D6D6D6] shadow-xs font-semibold'
                  : 'text-[#5F6368] hover:text-[#202124]'
              }`}
            >
              District Admin
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Facility Selector */}
            <div className="space-y-1">
              <label className="font-semibold text-[#202124]">
                {role === 'facility' ? 'Select Health Facility' : 'Administrative District'}
              </label>
              <select
                value={facilityId}
                onChange={(e) => setFacilityId(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#D6D6D6] rounded-[2px] text-xs text-[#202124] focus:outline-none focus:border-[#174A7C]"
              >
                {role === 'facility' ? (
                  <>
                    <option value="PHC-PUN-002">Pune PHC (Koregaon Bhima)</option>
                    <option value="PHC-PUN-004">Pune Rural Centre (Talegaon Dhamdhere)</option>
                    <option value="PHC-PUN-003">Shikrapur Health Centre</option>
                    <option value="PHC-PUN-001">Shirur Sub-District Hospital Depot</option>
                    <option value="PHC-PUN-005">Khed Primary Health Centre</option>
                    <option value="PHC-PUN-006">Manchar Community Health Centre</option>
                  </>
                ) : (
                  <>
                    <option value="DHO-PUN-001">Pune District Health Administration</option>
                    <option value="DHO-MAH-HQ">Maharashtra Public Health Directorate</option>
                  </>
                )}
              </select>
            </div>

            {/* User ID */}
            <div className="space-y-1">
              <label className="font-semibold text-[#202124]">Official User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                className="w-full p-2.5 bg-white border border-[#D6D6D6] rounded-[2px] text-xs text-[#202124] font-mono focus:outline-none focus:border-[#174A7C]"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="font-semibold text-[#202124]">Security Access PIN / Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-2.5 bg-white border border-[#D6D6D6] rounded-[2px] text-xs text-[#202124] font-mono focus:outline-none focus:border-[#174A7C]"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 text-xs font-bold text-white bg-[#174A7C] hover:bg-[#123B63] rounded-[2px] transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Operations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access (For Evaluators / Demo Video) */}
          <div className="pt-3 border-t border-[#E5E5E5] space-y-2">
            <div className="text-[11px] text-[#70757A] text-center font-medium">
              Demo Quick-Access (One-Click)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('facility')}
                className="py-1.5 px-2 text-[11px] font-medium text-[#174A7C] bg-[#174A7C]/5 hover:bg-[#174A7C]/10 border border-[#174A7C]/30 rounded-[2px] transition-colors"
              >
                Sign In: Pune PHC
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('district')}
                className="py-1.5 px-2 text-[11px] font-medium text-[#202124] bg-[#F7F7F7] hover:bg-[#EDEDED] border border-[#D6D6D6] rounded-[2px] transition-colors"
              >
                Sign In: District Admin
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* 3. Simple Government Footer */}
      <footer className="py-4 text-center text-[11px] text-[#70757A] border-t border-[#D6D6D6]">
        KYZER Healthcare Supply Management System · Pune District Operations
      </footer>

    </div>
  );
};'''

write('frontend/src/components/public/LoginPage.tsx', login_page_code)

# ==============================================================================
# 3. Update frontend/src/components/tactical/TacticalHeader.tsx (Add Public Portal Switch)
# ==============================================================================
header_code = '''import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Clock, 
  Camera, 
  Zap, 
  CheckCircle2,
  BookOpen,
  LogOut,
  Home
} from 'lucide-react';
import { Button } from '../ui/Button';

interface TacticalHeaderProps {
  districtName?: string;
  countryCode?: 'IND' | 'ZAF' | 'BRA';
  onCountryChange?: (code: 'IND' | 'ZAF' | 'BRA') => void;
  onOpenOcrModal?: () => void;
  onOpenScenarioModal?: () => void;
  onOpenAlertsDrawer?: () => void;
  onOpenDemoGuide?: () => void;
  onExitToPublic?: () => void;
  activeAlertCount?: number;
  isScenarioActive?: boolean;
  onResetScenario?: () => void;
}

export const TacticalHeader: React.FC<TacticalHeaderProps> = ({
  districtName = 'Pune District (MH)',
  countryCode = 'IND',
  onCountryChange,
  onOpenOcrModal,
  onOpenScenarioModal,
  onOpenAlertsDrawer,
  onOpenDemoGuide,
  onExitToPublic,
  activeAlertCount = 4,
  isScenarioActive = false,
  onResetScenario,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-12 bg-[#161616] border-b border-[#393939] px-4 flex items-center justify-between select-none z-30 shrink-0 text-[#F4F4F4] font-sans">
      {/* Left: KYZER Operations Branding & District Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-[2px] bg-[#174A7C] dark:bg-[#6EA8D8] flex items-center justify-center font-bold text-white text-xs">
            K
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-white leading-none">
              KYZER
            </span>
            <span className="text-[11px] text-[#A7B6C2] font-normal leading-none mt-0.5">
              Healthcare Operations Dashboard
            </span>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-[#393939] hidden sm:block mx-1" />

        {/* Live Network Status */}
        <div className="hidden md:flex items-center gap-2 text-xs text-[#C6C6C6]">
          <span className="w-2 h-2 rounded-full bg-[#24A148]" />
          <span>Pune District · 18 health centres online</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 text-xs">
        <div className="hidden lg:flex items-center gap-1.5 text-[#C6C6C6] font-mono text-[11px] px-2.5 py-1 bg-[#262626] border border-[#393939] rounded-[2px]">
          <Clock className="w-3 h-3 text-[#8D8D8D]" />
          <span>{timeStr || '19:58'} IST</span>
        </div>

        {/* Demo Recording Guide */}
        {onOpenDemoGuide && (
          <button
            onClick={onOpenDemoGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-[#262626] hover:bg-[#393939] border border-[#393939] rounded-[2px] transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#6EA8D8]" />
            <span className="hidden sm:inline">Recording Guide</span>
          </button>
        )}

        {/* Register Ingestion CTA */}
        {onOpenOcrModal && (
          <button
            onClick={onOpenOcrModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#174A7C] hover:bg-[#123B63] rounded-[2px] transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Logbook</span>
          </button>
        )}

        {/* Test Shortage Simulation */}
        {isScenarioActive ? (
          <button
            onClick={onResetScenario}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#F1C21B] bg-[#F1C21B]/10 border border-[#F1C21B]/40 rounded-[2px]"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Reset Test</span>
          </button>
        ) : onOpenScenarioModal ? (
          <button
            onClick={onOpenScenarioModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#C6C6C6] hover:text-white bg-[#262626] hover:bg-[#393939] border border-[#393939] rounded-[2px] transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-[#F1C21B]" />
            <span className="hidden md:inline">Simulate Shortage</span>
          </button>
        ) : null}

        {/* Exit to Public Portal */}
        {onExitToPublic && (
          <button
            onClick={onExitToPublic}
            title="Return to Public Portal"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#A7B6C2] hover:text-white bg-[#262626] hover:bg-[#393939] border border-[#393939] rounded-[2px] transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Public Portal</span>
          </button>
        )}
      </div>
    </header>
  );
};'''

write('frontend/src/components/tactical/TacticalHeader.tsx', header_code)

# ==============================================================================
# 4. frontend/src/App.tsx (Full 3-Layer Product Architecture Router)
# ==============================================================================
app_code = '''import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { 
  TacticalHeader, 
  TacticalNavRail, 
  NavViewId,
  KpiStrip, 
  ContextualRightPanel, 
  RightPanelMode,
  PriorityAction,
  ScenarioModal,
  OcrIngestionModal,
  AlertsDrawer,
  InventoryDrawer,
  IntelligenceDrawer,
  OperationsDrawer,
  DemoGuideModal
} from './components/tactical';
import { PublicPortalPage } from './components/public/PublicPortalPage';
import { LoginPage } from './components/public/LoginPage';
import { DEFAULT_CLINICS, UrbanClinic } from './features/digital-twin/defaultData';
import { CommandPalette } from './components/ui/CommandPalette';
import {
  BRICS_FACILITIES,
  MOCK_FORECAST_SERIES,
  MOCK_SHAP_DRIVERS,
  MOCK_ROUTING_RESULT,
  MOCK_OCR_ITEMS,
  MOCK_ALERTS,
} from './data/mockData';
import { HealthFacility, OcrExtractedItem, SystemAlert } from './types';
import { apiClient } from './services/api';

// Asynchronously lazy-load Deck.gl & MapLibre 3D Digital Twin
const LazyDigitalTwin = React.lazy(() =>
  import('./features/digital-twin').then(m => ({ default: m.DigitalTwin }))
);

const TacticalMapSkeleton = () => (
  <div className="w-full h-full bg-[#111418] flex flex-col items-center justify-center font-mono text-xs text-[#A7B6C2] relative overflow-hidden select-none">
    <div className="absolute inset-0 bg-[radial-gradient(#202B33_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
    <div className="relative z-10 flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-[#174A7C] border-t-transparent animate-spin flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-[#174A7C]/30 animate-ping" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#174A7C] animate-pulse" />
        <span className="font-bold text-[#F5F8FA] tracking-wider uppercase">INITIALIZING 3D DIGITAL TWIN...</span>
      </div>
      <span className="text-[10px] text-[#5C7080]">MapLibre GL + 3D Building Extrusions</span>
    </div>
  </div>
);

export type AppExperienceMode = 'public' | 'login' | 'operations';

export const App: React.FC = () => {
  // 0. Three-Layer Experience Router State (Default: Public Portal)
  const [appMode, setAppMode] = useState<AppExperienceMode>('public');
  const [userRole, setUserRole] = useState<'facility' | 'district'>('facility');

  // 1. Navigation & Shell Layout State
  const [activeView, setActiveView] = useState<NavViewId>('command');
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>('PRIORITY');

  // 2. Modals & Drawers
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);
  const [isInventoryDrawerOpen, setIsInventoryDrawerOpen] = useState(false);
  const [isIntelligenceDrawerOpen, setIsIntelligenceDrawerOpen] = useState(false);
  const [isOperationsDrawerOpen, setIsOperationsDrawerOpen] = useState(false);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState(false);
  const [isScenarioActive, setIsScenarioActive] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // 3. Domain & Telemetry State
  const [countryCode, setCountryCode] = useState<'IND' | 'ZAF' | 'BRA'>('IND');
  const [clinics, setClinics] = useState<UrbanClinic[]>(DEFAULT_CLINICS);
  const [selectedClinic, setSelectedClinic] = useState<UrbanClinic | null>(DEFAULT_CLINICS[2]);
  const [activeTransfer, setActiveTransfer] = useState<{ from: UrbanClinic; to: UrbanClinic; units: number } | null>(null);
  const [activeRouteResult, setActiveRouteResult] = useState<any>(null);
  const [routingResult, setRoutingResult] = useState(MOCK_ROUTING_RESULT);

  // 4. AI & Backend Telemetry State
  const [facilities, setFacilities] = useState<HealthFacility[]>(BRICS_FACILITIES);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [ocrItems, setOcrItems] = useState<OcrExtractedItem[]>(MOCK_OCR_ITEMS);
  const [forecastData, setForecastData] = useState(MOCK_FORECAST_SERIES);
  const [shapDrivers, setShapDrivers] = useState(MOCK_SHAP_DRIVERS);
  const [isAiLive, setIsAiLive] = useState(true);

  // Switch HTML theme class based on active layer
  useEffect(() => {
    if (appMode === 'operations') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appMode]);

  // Global Tactical Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsOcrModalOpen(false);
        setIsScenarioModalOpen(false);
        setIsAlertsDrawerOpen(false);
        setIsInventoryDrawerOpen(false);
        setIsIntelligenceDrawerOpen(false);
        setIsOperationsDrawerOpen(false);
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live Polling of Facilities & Alerts
  useEffect(() => {
    let isMounted = true;

    const fetchLiveTelemetry = () => {
      apiClient.getFacilities().then(data => {
        if (isMounted && data && data.length > 0) {
          setFacilities(data);
        }
      });

      apiClient.getAlerts().then(data => {
        if (isMounted && data) {
          setAlerts(data);
        }
      });
    };

    fetchLiveTelemetry();
    const interval = setInterval(fetchLiveTelemetry, 15000);

    // Initial Forecast
    apiClient.getForecast('PHC-PUN-002').then(res => {
      if (isMounted && res) {
        setForecastData(res.daily_forecast);
        setShapDrivers(res.shap_drivers);
        setIsAiLive(res.is_live);
      }
    });

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Priority Actions computed dynamically
  const priorityActions: PriorityAction[] = useMemo(() => {
    return [
      {
        id: 'act-001',
        tier: 'P0_CRITICAL',
        facilityId: 'PHC-PUN-002',
        facilityName: 'Pune PHC (Koregaon Bhima)',
        medicineName: 'Paracetamol 500mg Tablets (MED-PCM-500)',
        medicineCode: 'MED-PCM-500',
        currentStock: 130,
        daysRemaining: 2.8,
        donorFacilityId: 'PHC-PUN-004',
        donorFacilityName: 'Pune Rural Centre (Talegaon Dhamdhere)',
        recommendedUnits: 50,
        distanceKm: 8.4,
        transitTimeMin: 18,
      },
      {
        id: 'act-002',
        tier: 'P1_WARNING',
        facilityId: 'PHC-PUN-006',
        facilityName: 'Manchar Community Health Centre',
        medicineName: 'IV Infusion Set 0.9% Normal Saline',
        medicineCode: 'MED-IV-001',
        currentStock: 190,
        daysRemaining: 4.2,
        donorFacilityId: 'PHC-PUN-005',
        donorFacilityName: 'Khed Primary Health Centre',
        recommendedUnits: 20,
        distanceKm: 14.2,
        transitTimeMin: 24,
      }
    ];
  }, []);

  // Handle facility click on 3D Map
  const handleFacilitySelect = useCallback((clinic: UrbanClinic) => {
    setSelectedClinic(clinic);
    setRightPanelMode('FACILITY');
    if (isRightPanelCollapsed) setIsRightPanelCollapsed(false);

    apiClient.getForecast(clinic.id).then(res => {
      if (res) {
        setForecastData(res.daily_forecast);
        setShapDrivers(res.shap_drivers);
      }
    });
  }, [isRightPanelCollapsed]);

  // Handle Priority Action Review
  const handleReviewAction = (action: PriorityAction) => {
    const target = clinics.find(c => c.id === action.facilityId) || clinics[2];
    setSelectedClinic(target);
    setRightPanelMode('FACILITY');
    if (isRightPanelCollapsed) setIsRightPanelCollapsed(false);
  };

  // Handle Dispatching an Emergency Route
  const handleDispatchAction = (action: PriorityAction) => {
    const donor = clinics.find(c => c.id === 'PHC-URB-04') || clinics[3];
    const recipient = clinics.find(c => c.id === 'PHC-URB-03') || clinics[2];

    setActiveTransfer({
      from: donor,
      to: recipient,
      units: action.recommendedUnits,
    });
    setRightPanelMode('MISSION');
    if (isRightPanelCollapsed) setIsRightPanelCollapsed(false);
  };

  const handleRunScenario = (params: any) => {
    setIsScenarioActive(true);
    setIsScenarioModalOpen(false);
    setSelectedClinic(clinics[2]);
    setRightPanelMode('PRIORITY');
    if (isRightPanelCollapsed) setIsRightPanelCollapsed(false);
  };

  const handleResetScenario = () => {
    setIsScenarioActive(false);
    setActiveTransfer(null);
    setActiveRouteResult(null);
    setRightPanelMode('PRIORITY');
  };

  const handleRerouteRequest = (originId: string, destId: string) => {
    const updated = {
      ...routingResult,
      total_distance_km: (routingResult.total_distance_km * 1.1).toFixed(1),
      estimated_transit_time_min: Math.round(routingResult.estimated_transit_time_min * 1.15),
      risk_level: 'LOW' as const,
    };
    setRoutingResult(updated as any);
  };

  const handleJumpToStep = (stepIndex: number) => {
    setIsDemoGuideOpen(false);
    if (stepIndex === 0) {
      setSelectedClinic(clinics[2]);
      setRightPanelMode('PRIORITY');
      if (isRightPanelCollapsed) setIsRightPanelCollapsed(false);
    } else if (stepIndex === 1) {
      setIsIntelligenceDrawerOpen(true);
    } else if (stepIndex === 2) {
      const donor = clinics.find(c => c.id === 'PHC-URB-04') || clinics[3];
      const recipient = clinics.find(c => c.id === 'PHC-URB-03') || clinics[2];
      setActiveTransfer({ from: donor, to: recipient, units: 50 });
      setIsOperationsDrawerOpen(true);
    } else if (stepIndex === 3) {
      setIsOcrModalOpen(true);
    }
  };

  const handleViewChange = (view: NavViewId) => {
    setActiveView(view);
    if (view === 'ingestion') {
      setIsOcrModalOpen(true);
    } else if (view === 'scenario') {
      setIsScenarioModalOpen(true);
    } else if (view === 'operations') {
      setIsOperationsDrawerOpen(true);
    } else if (view === 'intelligence') {
      setIsInventoryDrawerOpen(true);
    } else if (view === 'command' || view === 'network') {
      setRightPanelMode('PRIORITY');
    }
  };

  const criticalCount = priorityActions.filter(p => p.tier === 'P0_CRITICAL').length;
  const warningCount = priorityActions.filter(p => p.tier === 'P1_WARNING').length;

  // --------------------------------------------------------------------------
  // LAYER 1: PUBLIC GOVERNMENT-STYLE LANDING PAGE
  // --------------------------------------------------------------------------
  if (appMode === 'public') {
    return (
      <PublicPortalPage
        onNavigateToLogin={(role = 'facility') => {
          setUserRole(role);
          setAppMode('login');
        }}
      />
    );
  }

  // --------------------------------------------------------------------------
  // LAYER 2: SECURE KYZER LOGIN / ACCESS GATEWAY
  // --------------------------------------------------------------------------
  if (appMode === 'login') {
    return (
      <LoginPage
        initialRole={userRole}
        onLoginSuccess={(role) => {
          setUserRole(role);
          setAppMode('operations');
        }}
        onBackToPublic={() => setAppMode('public')}
      />
    );
  }

  // --------------------------------------------------------------------------
  // LAYER 3: KYZER OPERATIONS SYSTEM (3D MAP + CONTEXTUAL PANELS)
  // --------------------------------------------------------------------------
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#111418] text-[#F5F8FA] flex flex-col font-sans antialiased select-none">
      
      {/* 1. Tactical Top Header with Return to Public Portal */}
      <TacticalHeader
        countryCode={countryCode}
        onCountryChange={setCountryCode}
        onOpenOcrModal={() => setIsOcrModalOpen(true)}
        onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
        onOpenAlertsDrawer={() => setIsAlertsDrawerOpen(true)}
        onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
        onExitToPublic={() => setAppMode('public')}
        activeAlertCount={alerts.filter(a => !a.acknowledged).length}
        isScenarioActive={isScenarioActive}
        onResetScenario={handleResetScenario}
      />

      {/* 2. Main Operating Viewport (Nav Rail + 3D Map + Contextual Right Panel) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Navigation Rail */}
        <TacticalNavRail
          activeView={activeView}
          onViewChange={handleViewChange}
          isCollapsed={isNavCollapsed}
          onToggleCollapse={() => setIsNavCollapsed(prev => !prev)}
        />

        {/* Center: 3D Digital Twin Map Canvas */}
        <main className="flex-1 h-full relative overflow-hidden bg-[#111418]">
          <Suspense fallback={<TacticalMapSkeleton />}>
            <LazyDigitalTwin
              clinics={clinics}
              selectedFacility={selectedClinic}
              onFacilitySelect={handleFacilitySelect}
              activeTransfer={activeTransfer}
              activeRouteResult={activeRouteResult}
              onRouteComputed={setActiveRouteResult}
            />
          </Suspense>
        </main>

        {/* Right: High-Density Contextual Operational Panel */}
        <ContextualRightPanel
          mode={rightPanelMode}
          onModeChange={setRightPanelMode}
          priorityActions={priorityActions}
          selectedFacility={selectedClinic}
          forecastData={forecastData}
          shapDrivers={shapDrivers}
          activeRouteResult={activeRouteResult}
          activeTransfer={activeTransfer}
          onSelectAction={handleReviewAction}
          onDispatchAction={handleDispatchAction}
          onCloseFacility={() => setRightPanelMode('PRIORITY')}
          onOpenFullForecast={() => setIsIntelligenceDrawerOpen(true)}
          onOpenInventoryDrawer={() => setIsInventoryDrawerOpen(true)}
          isCollapsed={isRightPanelCollapsed}
          onToggleCollapse={() => setIsRightPanelCollapsed(prev => !prev)}
        />
      </div>

      {/* 3. Bottom Tactical Telemetry KPI Strip */}
      <KpiStrip
        totalFacilities={facilities.length || 18}
        criticalCount={criticalCount}
        warningCount={warningCount}
        activeTransfersCount={activeTransfer ? 1 : 0}
        coldChainTemp="+4.2°C"
        isAiLive={isAiLive}
      />

      {/* 4. Slide-Over Drawers & Modals */}
      <OcrIngestionModal
        isOpen={isOcrModalOpen}
        onClose={() => setIsOcrModalOpen(false)}
        onCommitSuccess={(items) => setOcrItems(items)}
      />

      <ScenarioModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        onRunScenario={handleRunScenario}
      />

      <AlertsDrawer
        isOpen={isAlertsDrawerOpen}
        onClose={() => setIsAlertsDrawerOpen(false)}
        alerts={alerts}
        onAcknowledgeAlert={(id) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a))}
        onSelectFacility={(facId) => {
          const target = clinics.find(c => c.id === facId || c.name.toLowerCase().includes(facId.toLowerCase())) || clinics[2];
          setSelectedClinic(target);
          setRightPanelMode('FACILITY');
          if (isRightPanelCollapsed) setIsRightPanelCollapsed(false);
        }}
        onDispatchTransfer={(facId) => {
          const donor = clinics.find(c => c.id === 'PHC-URB-04') || clinics[3];
          const recipient = clinics.find(c => c.id === facId || c.id === 'PHC-URB-03') || clinics[2];
          setActiveTransfer({ from: donor, to: recipient, units: 50 });
          setRightPanelMode('MISSION');
          if (isRightPanelCollapsed) setIsRightPanelCollapsed(false);
        }}
      />

      <InventoryDrawer
        isOpen={isInventoryDrawerOpen}
        onClose={() => setIsInventoryDrawerOpen(false)}
        onInitiateTransfer={(code, fromId, toId) => {
          const donor = clinics.find(c => c.id === fromId) || clinics[3];
          const recipient = clinics.find(c => c.id === toId) || clinics[2];
          setActiveTransfer({ from: donor, to: recipient, units: 50 });
          setRightPanelMode('MISSION');
          if (isRightPanelCollapsed) setIsRightPanelCollapsed(false);
        }}
      />

      <IntelligenceDrawer
        isOpen={isIntelligenceDrawerOpen}
        onClose={() => setIsIntelligenceDrawerOpen(false)}
        facilityName={selectedClinic?.name || 'Koregaon Bhima PHC'}
        facilityId={selectedClinic?.id || 'PHC-PUN-002'}
        forecastData={forecastData}
        shapDrivers={shapDrivers}
        isAiLive={isAiLive}
      />

      <OperationsDrawer
        isOpen={isOperationsDrawerOpen}
        onClose={() => setIsOperationsDrawerOpen(false)}
        routingResult={routingResult}
        isLive={isAiLive}
        onSimulateReroute={handleRerouteRequest}
      />

      <DemoGuideModal
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
        onJumpToStep={handleJumpToStep}
      />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={(tab: string) => {
          if (tab === 'ocr') setIsOcrModalOpen(true);
          else if (tab === 'inventory') setIsInventoryDrawerOpen(true);
          else if (tab === 'alerts') setIsAlertsDrawerOpen(true);
          else if (tab === 'forecast') {
            setRightPanelMode('FACILITY');
            if (isRightPanelCollapsed) setIsRightPanelCollapsed(false);
          } else if (tab === 'routes') {
            setRightPanelMode('MISSION');
            if (isRightPanelCollapsed) setIsRightPanelCollapsed(false);
          } else {
            setRightPanelMode('PRIORITY');
          }
        }}
        onSimulateOutbreak={() => setIsScenarioModalOpen(true)}
      />
    </div>
  );
};'''

write('frontend/src/App.tsx', app_code)

print('Complete 3-Layer Product Architecture built successfully!')