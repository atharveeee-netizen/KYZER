import React, { useState } from 'react';
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
};
