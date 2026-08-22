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
                
                {/* Visual Composite representing Public Health Delivery */}
                <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-[#E9EEF3]">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Prime_Minister_of_India_Narendra_Modi.jpg/640px-Prime_Minister_of_India_Narendra_Modi.jpg"
                    alt="Indian Public Health Leadership & Delivery"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* Floating Institutional Caption Card */}
                <div className="p-4 bg-white border-t border-[#D6D6D6] space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-[#202124]">Shri Narendra Modi</h3>
                      <p className="text-[11px] text-[#5F6368]">Prime Minister of India</p>
                    </div>
                    <span className="text-[10px] text-[#174A7C] font-semibold bg-[#174A7C]/10 px-2 py-0.5 rounded-[2px]">
                      National Health Mission
                    </span>
                  </div>
                  <p className="text-xs text-[#5F6368] leading-relaxed pt-1">
                    Building a healthier India through strong public health infrastructure, supply chain visibility, and universal primary healthcare delivery.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. National Health Programmes Section */}
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
              <div className="w-8 h-8 rounded-[2px] bg-[#174A7C]/10 flex items-center justify-center text-[#174A7C]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#202124]">Ayushman Bharat (PM-JAY)</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Health coverage and financial protection for millions of families across India.
              </p>
              <a href="#programmes" className="text-xs text-[#174A7C] font-medium hover:underline inline-flex items-center gap-1 pt-1">
                <span>Learn more</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {/* Card 2: National Health Mission */}
            <div className="p-4 bg-white border border-[#D6D6D6] rounded-[2px] space-y-2 hover:border-[#174A7C] transition-colors">
              <div className="w-8 h-8 rounded-[2px] bg-[#D9381E]/10 flex items-center justify-center text-[#D9381E]">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#202124]">National Health Mission (NHM)</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Strengthening healthcare systems and improving health outcomes in rural and urban areas.
              </p>
              <a href="#programmes" className="text-xs text-[#174A7C] font-medium hover:underline inline-flex items-center gap-1 pt-1">
                <span>Learn more</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {/* Card 3: eSanjeevani */}
            <div className="p-4 bg-white border border-[#D6D6D6] rounded-[2px] space-y-2 hover:border-[#174A7C] transition-colors">
              <div className="w-8 h-8 rounded-[2px] bg-[#0A70F5]/10 flex items-center justify-center text-[#0A70F5]">
                <Stethoscope className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#202124]">eSanjeevani Telemedicine</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Consult doctors online from the comfort of your home and local health centres.
              </p>
              <a href="#programmes" className="text-xs text-[#174A7C] font-medium hover:underline inline-flex items-center gap-1 pt-1">
                <span>Learn more</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            {/* Card 4: Digital Health Mission */}
            <div className="p-4 bg-white border border-[#D6D6D6] rounded-[2px] space-y-2 hover:border-[#174A7C] transition-colors">
              <div className="w-8 h-8 rounded-[2px] bg-[#2F6B45]/10 flex items-center justify-center text-[#2F6B45]">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[#202124]">Digital Health Mission (ABDM)</h3>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Building digital infrastructure for seamless healthcare delivery and health records.
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
};'''

write('frontend/src/components/public/PublicPortalPage.tsx', public_portal_code)

# ==============================================================================
# 2. frontend/src/components/public/LoginPage.tsx (Split layout matching Image 2)
# ==============================================================================
login_page_code = '''import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onBackToPublic: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onBackToPublic,
}) => {
  const [userType, setUserType] = useState<string>('Health Facility Officer');
  const [facility, setFacility] = useState<string>('Pune PHC (PHC-PUN-002)');
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('1234');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      if (username.trim() === 'admin' && password === '1234') {
        sessionStorage.setItem('kyzer_demo_auth', 'true');
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setErrorMsg('Invalid username or password.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#202124] font-sans antialiased flex flex-col justify-between selection:bg-[#174A7C]/15 selection:text-[#174A7C]">
      
      {/* 1. Top Government Context Ribbon */}
      <div className="h-7 bg-[#0A3A6B] text-white px-4 sm:px-8 flex items-center justify-between text-xs font-normal">
        <div className="flex items-center gap-3">
          <span className="font-medium text-white">
            (2) KYZER ACCESS GATEWAY / LOGIN
          </span>
          <span className="hidden sm:inline opacity-60">|</span>
          <span className="hidden sm:inline text-white/90">
            District Operations Portal
          </span>
        </div>
        <button
          onClick={onBackToPublic}
          className="flex items-center gap-1 text-xs text-white hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Public Portal</span>
        </button>
      </div>

      {/* 2. Login Gateway Container (Split Card Layout) */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl bg-white border border-[#D6D6D6] rounded-[2px] overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Login Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-5">
            
            {/* Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-[#0A3A6B]">
                  KYZER
                </span>
                <span className="text-xs text-[#5F6368]">
                  Healthcare Supply Management System
                </span>
              </div>
              <h1 className="text-xl font-bold text-[#202124] tracking-tight mt-3">
                KYZER Access Portal
              </h1>
              <p className="text-xs text-[#5F6368] mt-0.5">
                Sign in to access healthcare supply and district operations.
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-[#A33A3A]/10 border border-[#A33A3A]/30 text-[#A33A3A] text-xs rounded-[2px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              
              {/* User Type */}
              <div className="space-y-1">
                <label className="font-semibold text-[#202124]">User Type</label>
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#D6D6D6] rounded-[2px] text-xs text-[#202124] focus:outline-none focus:border-[#0A3A6B]"
                >
                  <option value="Health Facility Officer">Health Facility Officer</option>
                  <option value="District Administrator">District Administrator</option>
                </select>
              </div>

              {/* Facility */}
              <div className="space-y-1">
                <label className="font-semibold text-[#202124]">Facility</label>
                <select
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#D6D6D6] rounded-[2px] text-xs text-[#202124] focus:outline-none focus:border-[#0A3A6B]"
                >
                  <option value="Pune PHC (PHC-PUN-002)">Pune PHC (PHC-PUN-002)</option>
                  <option value="Pune Rural Centre (PHC-PUN-004)">Pune Rural Centre (PHC-PUN-004)</option>
                  <option value="Shikrapur Health Centre (PHC-PUN-003)">Shikrapur Health Centre (PHC-PUN-003)</option>
                  <option value="Shirur Sub-District Depot (PHC-PUN-001)">Shirur Sub-District Depot (PHC-PUN-001)</option>
                </select>
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="font-semibold text-[#202124]">User ID</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  required
                  placeholder="admin"
                  className="w-full p-2.5 bg-white border border-[#D6D6D6] rounded-[2px] text-xs text-[#202124] focus:outline-none focus:border-[#0A3A6B]"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="font-semibold text-[#202124]">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    required
                    placeholder="1234"
                    className="w-full p-2.5 pr-9 bg-white border border-[#D6D6D6] rounded-[2px] text-xs text-[#202124] font-mono focus:outline-none focus:border-[#0A3A6B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-[#5F6368] hover:text-[#202124]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 text-xs font-bold text-white bg-[#0A3A6B] hover:bg-[#082D53] rounded-[2px] transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Demo Access Notice */}
            <div className="pt-2 text-center text-[11px] text-[#70757A]">
              Demo access for project demonstration (admin / 1234)
            </div>

            <div className="pt-1">
              <button
                onClick={onBackToPublic}
                className="text-xs text-[#0A3A6B] hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back to Public Portal</span>
              </button>
            </div>

          </div>

          {/* Right Column: Secure Access Info (Tinted Background) */}
          <div className="lg:col-span-5 bg-[#F0F5FA] border-t lg:border-t-0 lg:border-l border-[#D6D6D6] p-6 sm:p-8 flex flex-col justify-center space-y-5">
            <div className="w-12 h-12 rounded-full bg-[#0A3A6B]/10 flex items-center justify-center text-[#0A3A6B]">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-bold text-[#202124]">Secure Access</h2>
              <p className="text-xs text-[#5F6368] leading-relaxed">
                Authorized health facility officers and district administrators only.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-[#5F6368] pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0A3A6B] shrink-0" />
                <span>Data is protected</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0A3A6B] shrink-0" />
                <span>Secure & encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0A3A6B] shrink-0" />
                <span>Authorized access only</span>
              </div>
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
# 3. Update frontend/src/components/tactical/TacticalHeader.tsx (Grey Test Shortage)
# ==============================================================================
header_code = '''import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Clock, 
  Camera, 
  Sliders, 
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
  onLogout?: () => void;
  activeAlertCount?: number;
  isScenarioActive?: boolean;
  onResetScenario?: () => void;
}

export const TacticalHeader: React.FC<TacticalHeaderProps> = ({
  districtName = 'Pune District',
  countryCode = 'IND',
  onCountryChange,
  onOpenOcrModal,
  onOpenScenarioModal,
  onOpenAlertsDrawer,
  onOpenDemoGuide,
  onExitToPublic,
  onLogout,
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
      {/* Left: KYZER Branding & District Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-tight text-white leading-none">
            KYZER
          </span>
        </div>

        <div className="h-4 w-[1px] bg-[#393939] hidden sm:block mx-1" />

        {/* Live Network Status */}
        <div className="hidden md:flex items-center gap-2 text-xs text-[#C6C6C6]">
          <span>Pune District • 18 Health Facilities Online</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 text-xs">
        {/* Demo Recording Guide */}
        {onOpenDemoGuide && (
          <button
            onClick={onOpenDemoGuide}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#C6C6C6] hover:text-white bg-[#262626] hover:bg-[#393939] border border-[#393939] rounded-[2px] transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#8D8D8D]" />
            <span className="hidden sm:inline">Recording Guide</span>
          </button>
        )}

        {/* Register Ingestion CTA */}
        {onOpenOcrModal && (
          <button
            onClick={onOpenOcrModal}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#C6C6C6] hover:text-white bg-[#262626] hover:bg-[#393939] border border-[#393939] rounded-[2px] transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-[#8D8D8D]" />
            <span>Scan Logbook</span>
          </button>
        )}

        {/* Test Shortage Simulation (GREY ICON AND BORDER) */}
        {isScenarioActive ? (
          <button
            onClick={onResetScenario}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#C6C6C6] bg-[#262626] border border-[#393939] rounded-[2px]"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#8D8D8D]" />
            <span>Reset Test</span>
          </button>
        ) : onOpenScenarioModal ? (
          <button
            onClick={onOpenScenarioModal}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#C6C6C6] hover:text-white bg-[#262626] hover:bg-[#393939] border border-[#393939] rounded-[2px] transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-[#8D8D8D]" />
            <span className="hidden md:inline">Test Shortage</span>
          </button>
        ) : null}

        {/* Return to Public Portal */}
        {onExitToPublic && (
          <button
            onClick={onExitToPublic}
            title="Return to Public Portal"
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#A7B6C2] hover:text-white bg-[#262626] hover:bg-[#393939] border border-[#393939] rounded-[2px] transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-[#8D8D8D]" />
            <span className="hidden xl:inline">Portal</span>
          </button>
        )}

        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Logout from KYZER"
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#C6C6C6] hover:text-white bg-[#262626] hover:bg-[#393939] border border-[#393939] rounded-[2px] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-[#8D8D8D]" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};'''

write('frontend/src/components/tactical/TacticalHeader.tsx', header_code)

print('Master Visual Polish applied successfully!')