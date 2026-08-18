import React, { useState } from 'react';
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
import { CountryCode, HealthFacility, OcrExtractedItem, SystemAlert } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('IND');
  const [facilities, setFacilities] = useState<HealthFacility[]>(BRICS_FACILITIES);
  const [selectedFacility, setSelectedFacility] = useState<HealthFacility | null>(BRICS_FACILITIES[0]);
  const [alerts, setAlerts] = useState<SystemAlert[]>(MOCK_ALERTS);
  const [ocrItems, setOcrItems] = useState<OcrExtractedItem[]>(MOCK_OCR_ITEMS);

  // Filter facilities by country
  const filteredFacilities = facilities.filter(f => f.country === selectedCountry);

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
      facility_name: 'Primary Health Centre Shirur',
      severity: 'P0',
      timestamp: 'Just now',
      title: 'OUTBREAK SHOCK: Viral Encephalitis Surge Consuming Remaining Stock in 14h',
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
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans">
      
      {/* 🧭 Top Navigation with Cursor Orange Primary Accent */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedCountry={selectedCountry}
        setSelectedCountry={(c) => {
          setSelectedCountry(c);
          const first = facilities.find(f => f.country === c);
          if (first) setSelectedFacility(first);
        }}
        onSimulateOutbreak={handleSimulateOutbreak}
      />

      {/* 📱 Main Tab Content Area */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <DashboardTab
            facilities={filteredFacilities}
            alerts={alerts}
            onNavigateTab={setActiveTab}
            onSimulateOutbreak={handleSimulateOutbreak}
          />
        )}

        {activeTab === 'map' && (
          <MapTab
            facilities={filteredFacilities}
            routingResult={MOCK_ROUTING_RESULT}
            onFacilitySelect={setSelectedFacility}
            selectedFacility={selectedFacility}
            onRerouteRequest={handleRerouteRequest}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab facilities={filteredFacilities} />
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

      {/* 📄 Cursor Editorial Footer */}
      <footer className="bg-canvas border-t border-hairline px-6 py-4 mt-auto text-xs text-muted">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-ink">CareDOM</span>
            <span>·</span>
            <span>Team KYZER · Build with AI: Code for Communities 2</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Google Gemini Vision</span>
            <span>LightGBM (17.48% WAPE)</span>
            <span>IBM Quantum QAOA</span>
            <span>Google Maps GPS Deep Links</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
