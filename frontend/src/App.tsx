import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
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
};
