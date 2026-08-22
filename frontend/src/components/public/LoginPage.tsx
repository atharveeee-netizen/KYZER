import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  AlertCircle,
  KeyRound,
  UserCheck
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onBackToPublic: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onBackToPublic,
}) => {
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('1234');
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
      
      {/* 1. Top Government Ribbon */}
      <div className="h-7 bg-[#EFEFEF] border-b border-[#D6D6D6] px-4 sm:px-8 flex items-center justify-between text-xs text-[#5F6368]">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[#202124]">
            KYZER Access Portal
          </span>
          <span className="hidden sm:inline text-[#9AA0A6]">|</span>
          <span className="hidden sm:inline">
            Healthcare Supply & District Operations Gateway
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
            <div>
              <span className="text-xs font-semibold uppercase text-[#5F6368] tracking-wider">
                KYZER
              </span>
              <h1 className="text-xl font-bold text-[#174A7C] tracking-tight">
                Healthcare Supply Management System
              </h1>
            </div>
            <p className="text-xs text-[#5F6368] pt-1">
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
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Username */}
            <div className="space-y-1">
              <label className="font-semibold text-[#202124]">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                required
                placeholder="Enter username (admin)"
                className="w-full p-2.5 bg-white border border-[#D6D6D6] rounded-[2px] text-xs text-[#202124] focus:outline-none focus:border-[#174A7C]"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="font-semibold text-[#202124]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                required
                placeholder="Enter password (1234)"
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
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Demo Note */}
          <div className="pt-3 border-t border-[#E5E5E5] text-center space-y-1">
            <div className="text-[11px] text-[#70757A]">
              Demo access for project demonstration
            </div>
            <div className="text-[11px] font-mono text-[#5F6368]">
              Username: <strong className="text-[#174A7C]">admin</strong> &nbsp;|&nbsp; Password: <strong className="text-[#174A7C]">1234</strong>
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
