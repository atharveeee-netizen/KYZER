import React, { useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { MapTab } from './components/tabs/MapTab';
import { ForecastTab } from './components/tabs/ForecastTab';
import { AgentTimelineTab } from './components/tabs/AgentTimelineTab';
import { OcrTab } from './components/tabs/OcrTab';
import { AlertsTab } from './components/tabs/AlertsTab';
import {
  BRICS_FACILITIES,
  MOCK_FORECAST_SERIES,
  MOCK_SHAP_DRIVERS,
  MOCK_ROUTING_RESULT,
  MOCK_AGENT_TIMELINE,
  MOCK_OCR_ITEMS,
  MOCK_ALERTS,
} from './data/mockData';
import { CountryCode, HealthFacility, OcrExtractedItem, SystemAlert } from './types';
import { Activity, ShieldAlert, Bed, Users, Pill, ArrowRight, Zap } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('map');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('IND');
  const [facilities, setFacilities] = useState<HealthFacility[]>(BRICS_FACILITIES);
  const [selectedFacility, setSelectedFacility] = useState<HealthFacility | null>(BRICS_FACILITIES[0]);
  const [alerts, setAlerts] = useState<SystemAlert[]>(MOCK_ALERTS);
  const [timelineSteps, setTimelineSteps] = useState(MOCK_AGENT_TIMELINE);
  const [ocrItems, setOcrItems] = useState<OcrExtractedItem[]>(MOCK_OCR_ITEMS);

  // Filter facilities by country
  const filteredFacilities = facilities.filter(f => f.country === selectedCountry);

  // Simulate pandemic outbreak shock
  const handleSimulateOutbreak = () => {
    // 1. Spikes demand on PHC Shirur & PHC Junnar
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

    // 2. Add an urgent P0 Alert
    const newAlert: SystemAlert = {
      id: `alt-${Date.now()}`,
      facility_id: 'PHC-PUN-001',
      facility_name: 'Primary Health Centre Shirur',
      severity: 'P0',
      timestamp: 'Just now',
      title: 'OUTBREAK SHOCK: Viral Fever Surge Consuming Remaining Stock in 14h',
      description_en: 'Severe viral encephalitis surge detected after 52mm monsoon rainfall. Emergency buffer redistribution mandated immediately from Khed Depot.',
      description_mr: 'तातडीचा इशारा: ५२ मिमी पावसानंतर शिरूर आरोग्य केंद्रात रुग्णांची मोठी गर्दी. औषध साठा १४ तासांत संपणार आहे. खेड डेपोमधून तातडीने पुरवठा सुरू करण्यात आला आहे.',
      description_hi: 'आपातकालीन चेतावनी: शिरूर स्वास्थ्य केंद्र में रोगियों की भारी वृद्धि। खेड केंद्र से तुरंत दवा भेजी जा रही है।',
      acknowledged: false,
    };
    setAlerts(prev => [newAlert, ...prev]);

    // 3. Switch to Agent Timeline tab so user sees agents solving the shock live!
    setActiveTab('timeline');
  };

  const handleRerouteRequest = (blockedRoadName: string) => {
    alert(`Quantum Router rerouting network around: "${blockedRoadName}". Alternate mountain bypass calculated in 14.2ms!`);
  };

  const handleAcknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans">
      
      {/* 🧭 Top Navigation */}
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

      {/* 📊 District KPI Summary Ribbon */}
      <section className="bg-canvas-soft border-b border-hairline px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-muted">Total Facilities:</span>
              <span className="font-semibold text-ink">{filteredFacilities.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-semantic-error"></span>
              <span className="text-muted">P0 Stockout Risk:</span>
              <span className="font-semibold text-semantic-error">
                {filteredFacilities.filter(f => f.risk_tier === 'P0_CRITICAL').length} Clinics
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted">Bed Occupancy:</span>
              <span className="font-semibold text-ink">82.4%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted">7-Day WAPE:</span>
              <span className="font-semibold text-semantic-success">17.48% (Tweedie)</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted text-[11px]">
            <span>Active Optimization:</span>
            <span className="bg-surface-card border border-hairline px-2 py-0.5 rounded-xs text-ink font-semibold">
              IBM Quantum QAOA (Heron r2)
            </span>
          </div>
        </div>
      </section>

      {/* 📱 Main Tab Content Area */}
      <main className="flex-1">
        {activeTab === 'map' && (
          <MapTab
            facilities={filteredFacilities}
            routingResult={MOCK_ROUTING_RESULT}
            onFacilitySelect={setSelectedFacility}
            selectedFacility={selectedFacility}
            onRerouteRequest={handleRerouteRequest}
          />
        )}

        {activeTab === 'forecast' && (
          <ForecastTab
            forecastData={MOCK_FORECAST_SERIES}
            shapDrivers={MOCK_SHAP_DRIVERS}
            facilityName={selectedFacility?.name || 'PHC Shirur'}
          />
        )}

        {activeTab === 'timeline' && (
          <AgentTimelineTab
            timelineSteps={timelineSteps}
            onReRunTimeline={() => {
              alert('Re-executing Forecaster, Detector, Allocator, Supervisor, and Explainer agents...');
            }}
          />
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
            <span>Built by Team KYZER for Build with AI: Code for Communities 2</span>
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
