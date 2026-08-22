import React, { useState } from 'react';
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
};
