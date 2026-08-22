import os

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f'Wrote {path}')

# ==============================================================================
# 1. frontend/src/components/public/LoginPage.tsx (Demo Credentials: admin / 1234)
# ==============================================================================
login_page_code = '''import React, { useState } from 'react';
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
};'''

write('frontend/src/components/public/LoginPage.tsx', login_page_code)

# ==============================================================================
# 2. Update frontend/src/components/tactical/TacticalHeader.tsx (Logout Action)
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
  onLogout?: () => void;
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

        {/* Return to Public Portal */}
        {onExitToPublic && (
          <button
            onClick={onExitToPublic}
            title="Return to Public Portal"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#A7B6C2] hover:text-white bg-[#262626] hover:bg-[#393939] border border-[#393939] rounded-[2px] transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Portal</span>
          </button>
        )}

        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Logout from KYZER"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#FA4D56] hover:text-white hover:bg-[#DA1E28]/20 border border-[#DA1E28]/30 rounded-[2px] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};'''

write('frontend/src/components/tactical/TacticalHeader.tsx', header_code)

# ==============================================================================
# 3. Update frontend/src/App.tsx (Auth Guard & Logout)
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

  // Check existing session
  useEffect(() => {
    const isAuth = sessionStorage.getItem('kyzer_demo_auth') === 'true';
    if (isAuth && window.location.hash === '#operations') {
      setAppMode('operations');
    }
  }, []);

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

  const handleRerouteRequest = (roadName?: string) => {
    const updated = {
      ...routingResult,
      total_distance_km: Number((routingResult.total_distance_km * 1.1).toFixed(1)),
      total_time_min: Math.round(routingResult.total_time_min * 1.15),
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

  const handleLogout = () => {
    sessionStorage.removeItem('kyzer_demo_auth');
    setAppMode('login');
  };

  const criticalCount = priorityActions.filter(p => p.tier === 'P0_CRITICAL').length;
  const warningCount = priorityActions.filter(p => p.tier === 'P1_WARNING').length;

  // --------------------------------------------------------------------------
  // LAYER 1: PUBLIC GOVERNMENT-STYLE LANDING PAGE
  // --------------------------------------------------------------------------
  if (appMode === 'public') {
    return (
      <PublicPortalPage
        onNavigateToLogin={() => setAppMode('login')}
      />
    );
  }

  // --------------------------------------------------------------------------
  // LAYER 2: SECURE KYZER LOGIN / ACCESS GATEWAY (admin / 1234)
  // --------------------------------------------------------------------------
  if (appMode === 'login') {
    return (
      <LoginPage
        onLoginSuccess={() => setAppMode('operations')}
        onBackToPublic={() => setAppMode('public')}
      />
    );
  }

  // --------------------------------------------------------------------------
  // LAYER 3: KYZER OPERATIONS SYSTEM (3D MAP + CONTEXTUAL PANELS)
  // --------------------------------------------------------------------------
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#111418] text-[#F5F8FA] flex flex-col font-sans antialiased select-none">
      
      {/* 1. Tactical Top Header with Return to Public Portal & Logout */}
      <TacticalHeader
        countryCode={countryCode}
        onCountryChange={setCountryCode}
        onOpenOcrModal={() => setIsOcrModalOpen(true)}
        onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
        onOpenAlertsDrawer={() => setIsAlertsDrawerOpen(true)}
        onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
        onExitToPublic={() => setAppMode('public')}
        onLogout={handleLogout}
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

print('Demo authentication gateway applied successfully!')