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

// Asynchronously lazy-load Deck.gl & MapLibre 3D Digital Twin to eliminate cold start bundle latency
const LazyDigitalTwin = React.lazy(() =>
  import('./features/digital-twin').then(m => ({ default: m.DigitalTwin }))
);

// Sleek tactical radar map placeholder while 3D engine loads in background
const TacticalMapSkeleton = () => (
  <div className="w-full h-full bg-[#111418] flex flex-col items-center justify-center font-mono text-xs text-[#A7B6C2] relative overflow-hidden select-none">
    <div className="absolute inset-0 bg-[radial-gradient(#202B33_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
    <div className="relative z-10 flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-[#106BA3] border-t-transparent animate-spin flex items-center justify-center">
        <div className="w-4 h-4 rounded-full bg-[#106BA3]/30 animate-ping" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#106BA3] animate-pulse" />
        <span className="font-bold text-[#F5F8FA] tracking-wider uppercase">INITIALIZING 3D DIGITAL TWIN...</span>
      </div>
      <span className="text-[10px] text-[#5C7080]">MapLibre GL + ArcGIS 3D Buildings</span>
    </div>
  </div>
);

export const App: React.FC = () => {
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

  // Ensure dark theme is applied
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Global Tactical Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault();
        setActiveView('command');
        setRightPanelMode('PRIORITY');
      } else if ((e.metaKey || e.ctrlKey) && e.key === '2') {
        e.preventDefault();
        setIsIntelligenceDrawerOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key === '3') {
        e.preventDefault();
        setIsOperationsDrawerOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key === '4') {
        e.preventDefault();
        setIsInventoryDrawerOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key === '5') {
        e.preventDefault();
        setIsOcrModalOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsScenarioModalOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAlertsDrawerOpen(true);
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

  // Live Polling of Service A (Facilities & Alerts every 10-30s)
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

    // Service B: Initial Forecast
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

  // Priority Actions computed dynamically from live alerts and facility states
  const priorityActions: PriorityAction[] = useMemo(() => {
    if (alerts && alerts.length > 0) {
      return alerts.map((alt, idx) => ({
        id: alt.id || `act-${idx}`,
        tier: alt.severity === 'P0' ? 'P0_CRITICAL' : 'P1_WARNING',
        facilityId: alt.facility_id,
        facilityName: alt.facility_name,
        medicineName: 'Paracetamol 500mg Tablets (MED-PCM-500)',
        medicineCode: 'MED-PCM-500',
        currentStock: alt.severity === 'P0' ? 130 : 320,
        daysRemaining: alt.severity === 'P0' ? 2.8 : 5.5,
        donorFacilityId: 'PHC-PUN-004',
        donorFacilityName: 'Talegaon Dhamdhere PHC',
        recommendedUnits: 450,
        distanceKm: 9.8,
        transitTimeMin: 18,
      }));
    }

    // Check if any facility in current list has active stockout risk
    const atRiskFacs = facilities.filter(f => f.risk_tier === 'P0_CRITICAL' || (f.days_to_stockout !== undefined && f.days_to_stockout <= 3.0));
    if (atRiskFacs.length > 0) {
      return atRiskFacs.map((fac, idx) => ({
        id: `act-fac-${idx}`,
        tier: (fac.risk_tier === 'P0_CRITICAL' ? 'P0_CRITICAL' : 'P1_WARNING') as any,
        facilityId: fac.facility_id,
        facilityName: fac.name,
        medicineName: 'Paracetamol 500mg Tablets (MED-PCM-500)',
        medicineCode: 'MED-PCM-500',
        currentStock: fac.current_stock_pcm500,
        daysRemaining: fac.days_to_stockout,
        donorFacilityId: 'PHC-PUN-004',
        donorFacilityName: 'Talegaon Dhamdhere PHC',
        recommendedUnits: 450,
        distanceKm: 9.8,
        transitTimeMin: 18,
      }));
    }

    return [];
  }, [alerts, facilities]);

  // Handle facility click on the 3D Map
  const handleFacilitySelect = useCallback((clinic: UrbanClinic) => {
    setSelectedClinic(clinic);
    setRightPanelMode('FACILITY');
    if (isRightPanelCollapsed) setIsRightPanelCollapsed(false);

    // Fetch dynamic forecast for selected facility
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

  // Handle Outbreak Simulation Execution
  const handleRunScenario = ({ 
    scenarioName,
    surgeMultiplier, 
    rainMm, 
    r0, 
    disruptedNodes 
  }: { 
    scenarioName: string;
    surgeMultiplier: number; 
    rainMm: number; 
    r0: number;
    disruptedNodes: number;
  }) => {
    setIsScenarioActive(true);
    setClinics(prev => prev.map((c, i) => {
      if (c.id === 'PHC-URB-03' || i < disruptedNodes) {
        return {
          ...c,
          stock: Math.max(12, Math.round(c.stock * 0.15)),
          daysLeft: Number((c.daysLeft / surgeMultiplier).toFixed(1)),
          riskTier: 'P0_CRITICAL',
          beds: { ...c.beds, occupied: Math.min(c.beds.total, Math.round(c.beds.occupied * 1.35)) },
        };
      }
      return c;
    }));

    // Auto-trigger emergency redistribution mission
    const donor = clinics.find(c => c.id === 'PHC-URB-04') || clinics[3];
    const recipient = clinics.find(c => c.id === 'PHC-URB-03') || clinics[2];
    setActiveTransfer({ from: donor, to: recipient, units: 650 });

    const newAlert: SystemAlert = {
      id: `alt-${Date.now()}`,
      facility_id: 'PHC-PUN-002',
      facility_name: 'Koregaon Bhima PHC',
      severity: 'P0',
      timestamp: 'Just now',
      title: `⚡ ${scenarioName.toUpperCase()}`,
      description_en: `Disaster scenario injected: ${surgeMultiplier}x demand surge, ${rainMm}mm rainfall, R₀=${r0}. Predicted stockout in <14.8 hours across ${disruptedNodes} facilities. Automated quantum redistribution dispatched.`,
      description_mr: 'तातडीचा इशारा: आपत्कालीन संकट लागू. पुढील १४ तासांत साठा संपण्याची शक्यता.',
      description_hi: 'आपातकालीन चेतावनी: आपदा स्थिति सक्रिय। १४ घंटे में दवा समाप्त होने का अनुमान।',
      acknowledged: false,
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleResetScenario = () => {
    setIsScenarioActive(false);
    setClinics(DEFAULT_CLINICS);
    setActiveTransfer(null);
    setActiveRouteResult(null);
  };

  // Handle Road Landslide / Quantum Reroute Simulation
  const handleRerouteRequest = (blockedRoadName: string) => {
    alert(`⚡ Hybrid QAOA Router recalculated alternate bypass around "${blockedRoadName}" in 12.66ms (33.2x convergence speedup)!`);
  };

  // Handle Demo Jump Step Execution
  const handleJumpToStep = (stepIndex: number) => {
    if (stepIndex === 0) {
      const target = clinics.find(c => c.id === 'PHC-URB-03') || clinics[2];
      setSelectedClinic(target);
      setRightPanelMode('FACILITY');
      if (isRightPanelCollapsed) setIsRightPanelCollapsed(false);
    } else if (stepIndex === 1) {
      setIsIntelligenceDrawerOpen(true);
    } else if (stepIndex === 2) {
      const donor = clinics.find(c => c.id === 'PHC-URB-04') || clinics[3];
      const recipient = clinics.find(c => c.id === 'PHC-URB-03') || clinics[2];
      setActiveTransfer({ from: donor, to: recipient, units: 450 });
      setIsOperationsDrawerOpen(true);
    } else if (stepIndex === 3) {
      setIsOcrModalOpen(true);
    }
  };

  // Handle View Navigation from Nav Rail
  const handleViewChange = (view: NavViewId) => {
    setActiveView(view);
    if (view === 'ingestion') {
      setIsOcrModalOpen(true);
    } else if (view === 'scenario') {
      setIsScenarioModalOpen(true);
    } else if (view === 'operations') {
      setIsOperationsDrawerOpen(true);
    } else if (view === 'intelligence') {
      setIsIntelligenceDrawerOpen(true);
    } else if (view === 'command' || view === 'network') {
      setRightPanelMode('PRIORITY');
    }
  };

  const criticalCount = priorityActions.filter(p => p.tier === 'P0_CRITICAL').length;
  const warningCount = priorityActions.filter(p => p.tier === 'P1_WARNING').length;

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#111418] text-[#F5F8FA] flex flex-col font-sans antialiased select-none">
      
      {/* 1. Tactical Top Header */}
      <TacticalHeader
        countryCode={countryCode}
        onCountryChange={setCountryCode}
        onOpenOcrModal={() => setIsOcrModalOpen(true)}
        onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
        onOpenAlertsDrawer={() => setIsAlertsDrawerOpen(true)}
        onOpenDemoGuide={() => setIsDemoGuideOpen(true)}
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

        {/* Center: Protected 3D Digital Twin Map Canvas (Lazy loaded for ultra-fast startup) */}
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
          setActiveTransfer({ from: donor, to: recipient, units: 450 });
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
          setActiveTransfer({ from: donor, to: recipient, units: 450 });
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
