import os

app_code = '''import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  InventoryDrawer
} from './components/tactical';
import { DigitalTwin, DEFAULT_CLINICS, UrbanClinic } from './features/digital-twin';
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
  const [isScenarioActive, setIsScenarioActive] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // 3. Domain & Telemetry State
  const [countryCode, setCountryCode] = useState<'IND' | 'ZAF' | 'BRA'>('IND');
  const [clinics, setClinics] = useState<UrbanClinic[]>(DEFAULT_CLINICS);
  const [selectedClinic, setSelectedClinic] = useState<UrbanClinic | null>(DEFAULT_CLINICS[2]); // Start with stockout clinic
  const [activeTransfer, setActiveTransfer] = useState<{ from: UrbanClinic; to: UrbanClinic; units: number } | null>(null);
  const [activeRouteResult, setActiveRouteResult] = useState<any>(null);

  // 4. AI & Backend Telemetry State
  const [facilities, setFacilities] = useState<HealthFacility[]>(BRICS_FACILITIES);
  const [alerts, setAlerts] = useState<SystemAlert[]>(MOCK_ALERTS);
  const [ocrItems, setOcrItems] = useState<OcrExtractedItem[]>(MOCK_OCR_ITEMS);
  const [forecastData, setForecastData] = useState(MOCK_FORECAST_SERIES);
  const [shapDrivers, setShapDrivers] = useState(MOCK_SHAP_DRIVERS);
  const [isAiLive, setIsAiLive] = useState(true);

  // Ensure dark theme is applied
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Global Keyboard Shortcuts (Cmd/Ctrl+K for Command Palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initial Fetch from Dual Services (Service A + Service B)
  useEffect(() => {
    let isMounted = true;

    // Service A: Facilities & Alerts
    apiClient.getFacilities().then(data => {
      if (isMounted && data && data.length > 0) {
        setFacilities(data);
      }
    });

    apiClient.getAlerts().then(data => {
      if (isMounted && data && data.length > 0) {
        setAlerts(data);
      }
    });

    // Service B: Initial Forecast
    apiClient.getForecast('PHC-PUN-002').then(res => {
      if (isMounted && res) {
        setForecastData(res.daily_forecast);
        setShapDrivers(res.shap_drivers);
        setIsAiLive(res.is_live);
      }
    });

    // Real-time SSE alert subscription
    const unsubscribe = apiClient.subscribeAlertsStream((incomingAlert) => {
      if (isMounted && incomingAlert) {
        setAlerts(prev => [incomingAlert, ...prev]);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Priority Actions computed from current network state
  const priorityActions: PriorityAction[] = useMemo(() => [
    {
      id: 'act-01',
      tier: 'P0_CRITICAL',
      facilityId: 'PHC-PUN-002',
      facilityName: 'Koregaon Bhima PHC (Mission District)',
      medicineName: 'Amoxicillin 250mg Capsules',
      medicineCode: 'MED-AMX-250',
      currentStock: 85,
      daysRemaining: 0.8,
      donorFacilityId: 'PHC-PUN-004',
      donorFacilityName: 'Talegaon Dhamdhere PHC',
      recommendedUnits: 450,
      distanceKm: 9.8,
      transitTimeMin: 18,
    },
    {
      id: 'act-02',
      tier: 'P1_WARNING',
      facilityId: 'PHC-PUN-003',
      facilityName: 'Shikrapur Primary Health Center',
      medicineName: 'Paracetamol 500mg Tablets',
      medicineCode: 'MED-PCM-500',
      currentStock: 320,
      daysRemaining: 2.2,
      donorFacilityId: 'PHC-PUN-001',
      donorFacilityName: 'Shirur Sub-District Hospital Depot',
      recommendedUnits: 1200,
      distanceKm: 32.4,
      transitTimeMin: 42,
    },
    {
      id: 'act-03',
      tier: 'P1_WARNING',
      facilityId: 'CHC-TSH-004',
      facilityName: 'Mamelodi West Community Clinic',
      medicineName: 'Oral Rehydration Salts (ORS)',
      medicineCode: 'MED-ORS-SCT',
      currentStock: 220,
      daysRemaining: 2.2,
      donorFacilityId: 'CHC-TSH-001',
      donorFacilityName: 'Pretoria West Hospital Depot',
      recommendedUnits: 800,
      distanceKm: 14.2,
      transitTimeMin: 22,
    },
  ], []);

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
  const handleRunScenario = ({ surgeMultiplier, rainMm }: { surgeMultiplier: number; rainMm: number }) => {
    setIsScenarioActive(true);
    setClinics(prev => prev.map(c => {
      if (c.id === 'PHC-URB-03') {
        return {
          ...c,
          stock: 35,
          daysLeft: 0.3,
          riskTier: 'P0_CRITICAL',
          beds: { occupied: 24, total: 24 },
        };
      }
      return c;
    }));

    const newAlert: SystemAlert = {
      id: `alt-${Date.now()}`,
      facility_id: 'PHC-PUN-002',
      facility_name: 'Koregaon Bhima PHC',
      severity: 'P0',
      timestamp: 'Just now',
      title: `MONSOON SURGE SHOCK: ${surgeMultiplier}x Demand Surge (${rainMm}mm Rainfall)`,
      description_en: `Epidemic surge detected. Multi-horizon forecast predicts complete stockout in 7.2 hours. Automated redistribution dispatched.`,
      description_mr: 'तातडीचा इशारा: पावसाळ्यानंतर साथरोग वाढला. पुढील ७ तासांत साठा संपण्याची शक्यता.',
      description_hi: 'आपातकालीन चेतावनी: मानसून के बाद बीमारी में वृद्धि। ७ घंटे में दवा समाप्त होने का अनुमान।',
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

  // Handle View Navigation from Nav Rail
  const handleViewChange = (view: NavViewId) => {
    setActiveView(view);
    if (view === 'ingestion') {
      setIsOcrModalOpen(true);
    } else if (view === 'scenario') {
      setIsScenarioModalOpen(true);
    } else if (view === 'operations') {
      setIsInventoryDrawerOpen(true);
    } else if (view === 'intelligence') {
      setRightPanelMode('FACILITY');
      if (isRightPanelCollapsed) setIsRightPanelCollapsed(false);
    } else if (view === 'command' || view === 'network') {
      setRightPanelMode('PRIORITY');
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#111418] text-[#F5F8FA] flex flex-col font-sans antialiased select-none">
      
      {/* 1. Tactical Top Header */}
      <TacticalHeader
        countryCode={countryCode}
        onCountryChange={setCountryCode}
        onOpenOcrModal={() => setIsOcrModalOpen(true)}
        onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
        onOpenAlertsDrawer={() => setIsAlertsDrawerOpen(true)}
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

        {/* Center: Protected 3D Digital Twin Map Canvas (Permanently Mounted) */}
        <main className="flex-1 h-full relative overflow-hidden bg-[#111418]">
          <DigitalTwin
            clinics={clinics}
            selectedFacility={selectedClinic}
            onFacilitySelect={handleFacilitySelect}
            activeTransfer={activeTransfer}
            activeRouteResult={activeRouteResult}
            onRouteComputed={setActiveRouteResult}
          />
        </main>

        {/* Right Contextual Intelligence & Action Panel */}
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
          onCloseFacility={() => setSelectedClinic(null)}
          onOpenInventoryDrawer={() => setIsInventoryDrawerOpen(true)}
          isCollapsed={isRightPanelCollapsed}
          onToggleCollapse={() => setIsRightPanelCollapsed(prev => !prev)}
        />
      </div>

      {/* 3. Bottom Operational KPI Telemetry Strip */}
      <KpiStrip
        totalFacilities={18}
        criticalCount={priorityActions.filter(p => p.tier === 'P0_CRITICAL').length}
        warningCount={priorityActions.filter(p => p.tier === 'P1_WARNING').length}
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
      />

      <InventoryDrawer
        isOpen={isInventoryDrawerOpen}
        onClose={() => setIsInventoryDrawerOpen(false)}
      />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleViewChange}
        onSimulateOutbreak={() => setIsScenarioModalOpen(true)}
        facilities={facilities}
      />
    </div>
  );
};
'''

with open('frontend/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app_code)
print('App.tsx updated successfully!')