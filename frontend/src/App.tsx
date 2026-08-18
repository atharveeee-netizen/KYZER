import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { DashboardTab } from './components/tabs/DashboardTab';
import { MapTab } from './components/tabs/MapTab';
import { InventoryTab } from './components/tabs/InventoryTab';
import { ForecastTab } from './components/tabs/ForecastTab';
import { RoutesTab } from './components/tabs/RoutesTab';
import { OcrTab } from './components/tabs/OcrTab';
import { AlertsTab } from './components/tabs/AlertsTab';
import {
  BRICS_FACILITIES,
  MOCK_FORECAST_SERIES,
  MOCK_SHAP_DRIVERS,
  MOCK_ROUTING_RESULT,
  MOCK_OCR_ITEMS,
  MOCK_ALERTS,
} from './data/mockData';
import { HealthFacility, OcrExtractedItem, SystemAlert } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [facilities, setFacilities] = useState<HealthFacility[]>(BRICS_FACILITIES);
  const [selectedFacility, setSelectedFacility] = useState<HealthFacility | null>(BRICS_FACILITIES[0]);
  const [alerts, setAlerts] = useState<SystemAlert[]>(MOCK_ALERTS);
  const [ocrItems, setOcrItems] = useState<OcrExtractedItem[]>(MOCK_OCR_ITEMS);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load theme preference and apply to document element
  useEffect(() => {
    const saved = localStorage.getItem('caredom_theme') as 'light' | 'dark' | null;
    if (saved) {
      setTheme(saved);
      if (saved === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('caredom_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Simulate pandemic outbreak shock
  const handleSimulateOutbreak = () => {
    setFacilities(prev => prev.map(fac => {
      if (fac.facility_id === 'PHC-PUN-001') {
        return {
          ...fac,
          current_stock_pcm500: 45,
          days_to_stockout: 0.6,
          risk_tier: 'P0_CRITICAL',
          cascade_risk_score: 0.96,
          occupied_beds: 24, // 100% capacity
          icu_beds_occupied: 4,
        };
      }
      return fac;
    }));

    const newAlert: SystemAlert = {
      id: `alt-${Date.now()}`,
      facility_id: 'PHC-PUN-001',
      facility_name: 'Shirur Sub-District Hospital',
      severity: 'P0',
      timestamp: 'Just now',
      title: 'OUTBREAK SHOCK: Viral Surge Consuming Remaining Stock in 14h',
      description_en: 'Severe viral surge detected after 52mm monsoon rainfall. Emergency buffer redistribution mandated immediately from PHC Khed.',
      description_mr: 'तातडीचा इशारा: ५२ मिमी पावसानंतर शिरूर आरोग्य केंद्रात रुग्णांची मोठी गर्दी. औषध साठा १४ तासांत संपणार आहे. खेड डेपोमधून तातडीने पुरवठा सुरू करण्यात आला आहे.',
      description_hi: 'आपातकालीन चेतावनी: शिरूर स्वास्थ्य केंद्र में रोगियों की भारी वृद्धि। खेड केंद्र से तुरंत दवा भेजी जा रही है।',
      acknowledged: false,
    };
    setAlerts(prev => [newAlert, ...prev]);
    setActiveTab('map');
  };

  const handleRerouteRequest = (blockedRoadName: string) => {
    alert(`Quantum Router recalculated alternate mountain bypass around "${blockedRoadName}" in 12.66ms!`);
  };

  const handleAcknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Navigation with Dark Theme Toggle */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSimulateOutbreak={handleSimulateOutbreak}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Tab Content Area */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <DashboardTab
            facilities={facilities}
            alerts={alerts}
            onNavigateTab={setActiveTab}
            onSimulateOutbreak={handleSimulateOutbreak}
          />
        )}

        {activeTab === 'map' && (
          <MapTab
            facilities={facilities}
            routingResult={MOCK_ROUTING_RESULT}
            onFacilitySelect={setSelectedFacility}
            selectedFacility={selectedFacility}
            onRerouteRequest={handleRerouteRequest}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab facilities={facilities} />
        )}

        {activeTab === 'forecast' && (
          <ForecastTab
            forecastData={MOCK_FORECAST_SERIES}
            shapDrivers={MOCK_SHAP_DRIVERS}
            facilityName={selectedFacility?.name || 'PHC Shirur'}
          />
        )}

        {activeTab === 'routes' && (
          <RoutesTab routingResult={MOCK_ROUTING_RESULT} />
        )}

        {activeTab === 'ocr' && (
          <OcrTab
            initialItems={ocrItems}
            onSaveToDatabase={(updated) => setOcrItems(updated)}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsTab
            alerts={alerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
          />
        )}
      </main>

    </div>
  );
};
