import { HealthFacility, ForecastDay, ShapDriver, RoutingResult, AgentTimelineStep, OcrExtractedItem, SystemAlert } from '../types';

export const BRICS_FACILITIES: HealthFacility[] = [
 {
 facility_id: 'PHC-PUN-001',
 name: 'Shirur Sub-District Hospital (Depot)',
 country: 'IND',
 district: 'Pune',
 latitude: 18.8285,
 longitude: 74.3755,
 facility_type: 'DISTRICT_HOSPITAL',
 total_beds: 100,
 occupied_beds: 78,
 icu_beds_total: 12,
 icu_beds_occupied: 8,
 doctors_present: 8,
 nurses_present: 24,
 current_stock_pcm500: 12000,
 days_to_stockout: 35.0,
 risk_tier: 'P2_SURPLUS',
 cascade_risk_score: 0.10
 },
 {
    facility_id: 'PHC-PUN-002',
    name: 'Koregaon Bhima PHC',
    country: 'IND',
    district: 'Pune',
    latitude: 18.6534,
    longitude: 74.0624,
    facility_type: 'PRIMARY_HEALTH_CENTRE',
    total_beds: 24,
    occupied_beds: 19,
    icu_beds_total: 4,
    icu_beds_occupied: 3,
    doctors_present: 2,
    nurses_present: 5,
    current_stock_pcm500: 1450,
    days_to_stockout: 31.4,
    risk_tier: 'P2_SURPLUS',
    cascade_risk_score: 0.32
  },
  {
    facility_id: 'PHC-PUN-003',
    name: 'Shikrapur Health Centre',
    country: 'IND',
    district: 'Pune',
    latitude: 18.7368,
    longitude: 74.1567,
    facility_type: 'PRIMARY_HEALTH_CENTRE',
    total_beds: 24,
    occupied_beds: 0,
    icu_beds_total: 4,
    icu_beds_occupied: 0,
    doctors_present: 2,
    nurses_present: 5,
    current_stock_pcm500: 366,
    days_to_stockout: 12.1,
    risk_tier: 'P3_NORMAL',
    cascade_risk_score: 0.36
  },
  {
    facility_id: 'PHC-PUN-004',
    name: 'Talegaon Dhamdhere PHC',
    country: 'IND',
    district: 'Pune',
    latitude: 18.6789,
    longitude: 74.1512,
    facility_type: 'PRIMARY_HEALTH_CENTRE',
    total_beds: 16,
    occupied_beds: 0,
    icu_beds_total: 0,
    icu_beds_occupied: 0,
    doctors_present: 1,
    nurses_present: 4,
    current_stock_pcm500: 323,
    days_to_stockout: 11.8,
    risk_tier: 'P3_NORMAL',
    cascade_risk_score: 0.36
  },
 {
 facility_id: 'PHC-PUN-005',
 name: 'Wagholi Community Health Centre',
 country: 'IND',
 district: 'Pune',
 latitude: 18.5793,
 longitude: 73.9814,
 facility_type: 'COMMUNITY_HEALTH_CENTRE',
 total_beds: 30,
 occupied_beds: 18,
 icu_beds_total: 4,
 icu_beds_occupied: 2,
 doctors_present: 3,
 nurses_present: 8,
 current_stock_pcm500: 2400,
 days_to_stockout: 15.5,
 risk_tier: 'P2_SURPLUS',
 cascade_risk_score: 0.12
 },
 {
 facility_id: 'PHC-PUN-006',
 name: 'Chakan Primary Health Centre',
 country: 'IND',
 district: 'Pune',
 latitude: 18.7612,
 longitude: 73.8596,
 facility_type: 'PRIMARY_HEALTH_CENTRE',
 total_beds: 25,
 occupied_beds: 23,
 icu_beds_total: 2,
 icu_beds_occupied: 2,
 doctors_present: 2,
 nurses_present: 6,
 current_stock_pcm500: 180,
 days_to_stockout: 1.8,
 risk_tier: 'P0_CRITICAL',
 cascade_risk_score: 0.88
 },
 {
 facility_id: 'PHC-PUN-007',
 name: 'Alandi Devachi Health Post',
 country: 'IND',
 district: 'Pune',
 latitude: 18.6775,
 longitude: 73.8974,
 facility_type: 'PRIMARY_HEALTH_CENTRE',
 total_beds: 18,
 occupied_beds: 12,
 icu_beds_total: 2,
 icu_beds_occupied: 1,
 doctors_present: 2,
 nurses_present: 5,
 current_stock_pcm500: 1250,
 days_to_stockout: 9.0,
 risk_tier: 'P2_SURPLUS',
 cascade_risk_score: 0.22
 },
 {
 facility_id: 'PHC-PUN-008',
 name: 'Khed Rural Hospital',
 country: 'IND',
 district: 'Pune',
 latitude: 18.8471,
 longitude: 73.9015,
 facility_type: 'COMMUNITY_HEALTH_CENTRE',
 total_beds: 50,
 occupied_beds: 30,
 icu_beds_total: 6,
 icu_beds_occupied: 2,
 doctors_present: 4,
 nurses_present: 12,
 current_stock_pcm500: 3800,
 days_to_stockout: 22.0,
 risk_tier: 'P2_SURPLUS',
 cascade_risk_score: 0.14
 },
 {
 facility_id: 'PHC-PUN-009',
 name: 'Manchar Primary Health Centre',
 country: 'IND',
 district: 'Pune',
 latitude: 19.0068,
 longitude: 73.9452,
 facility_type: 'PRIMARY_HEALTH_CENTRE',
 total_beds: 22,
 occupied_beds: 19,
 icu_beds_total: 2,
 icu_beds_occupied: 1,
 doctors_present: 2,
 nurses_present: 5,
 current_stock_pcm500: 290,
 days_to_stockout: 2.8,
 risk_tier: 'P1_WARNING',
 cascade_risk_score: 0.65
 },
 {
 facility_id: 'PHC-PUN-010',
 name: 'Junnar Sub-District Hospital',
 country: 'IND',
 district: 'Pune',
 latitude: 19.2064,
 longitude: 73.8764,
 facility_type: 'COMMUNITY_HEALTH_CENTRE',
 total_beds: 60,
 occupied_beds: 52,
 icu_beds_total: 8,
 icu_beds_occupied: 7,
 doctors_present: 5,
 nurses_present: 16,
 current_stock_pcm500: 350,
 days_to_stockout: 2.5,
 risk_tier: 'P1_WARNING',
 cascade_risk_score: 0.72
 },
  // South Africa & Brazil Facilities for BRICS switcher
  {
    facility_id: 'CHC-TSH-004',
    name: 'Mamelodi West Community Clinic',
    country: 'ZAF',
    district: 'Tshwane',
    latitude: -25.7144,
    longitude: 28.3278,
    facility_type: 'COMMUNITY_HEALTH_CENTRE',
    total_beds: 40,
    occupied_beds: 35,
    icu_beds_total: 4,
    icu_beds_occupied: 3,
    doctors_present: 4,
    nurses_present: 12,
    current_stock_pcm500: 220,
    days_to_stockout: 2.2,
    risk_tier: 'P0_CRITICAL',
    cascade_risk_score: 0.78
  },
  {
    facility_id: 'CHC-TSH-001',
    name: 'Pretoria West Hospital Depot',
    country: 'ZAF',
    district: 'Tshwane',
    latitude: -25.7511,
    longitude: 28.1467,
    facility_type: 'DISTRICT_HOSPITAL',
    total_beds: 120,
    occupied_beds: 95,
    icu_beds_total: 16,
    icu_beds_occupied: 12,
    doctors_present: 10,
    nurses_present: 30,
    current_stock_pcm500: 15000,
    days_to_stockout: 45.0,
    risk_tier: 'P2_SURPLUS',
    cascade_risk_score: 0.08
  },
  {
    facility_id: 'UBS-AMZ-001',
    name: 'Hospital Flutuante Walter Bártolo',
    country: 'BRA',
    district: 'Amazonas',
    latitude: -3.1190,
    longitude: -60.0217,
    facility_type: 'PRIMARY_HEALTH_CENTRE',
    total_beds: 16,
    occupied_beds: 14,
    icu_beds_total: 2,
    icu_beds_occupied: 2,
    doctors_present: 2,
    nurses_present: 4,
    current_stock_pcm500: 180,
    days_to_stockout: 1.9,
    risk_tier: 'P0_CRITICAL',
    cascade_risk_score: 0.82
  }
];

export const MOCK_FORECAST_SERIES: ForecastDay[] = [
 { day: 'Day 1', p10: 95, p50: 125, p90: 165 },
 { day: 'Day 2', p10: 110, p50: 145, p90: 210 },
 { day: 'Day 3', p10: 130, p50: 180, p90: 265 },
 { day: 'Day 4', p10: 155, p50: 215, p90: 320 },
 { day: 'Day 5', p10: 170, p50: 240, p90: 360 },
 { day: 'Day 6', p10: 160, p50: 220, p90: 330 },
 { day: 'Day 7', p10: 140, p50: 195, p90: 290 }
];

export const MOCK_SHAP_DRIVERS: ShapDriver[] = [
 {
 feature_name: 'rainfall_lag_3d',
 shap_value: 0.38,
 readable_desc: 'Rainfall spike (+48mm past 3 days) driving monsoon fever caseload',
 direction: 'UP'
 },
 {
 feature_name: 'active_outbreak_r0',
 shap_value: 0.29,
 readable_desc: 'SEIR Outbreak dynamics active (R0 = 1.03, beta = 0.361)',
 direction: 'UP'
 },
 {
 feature_name: 'bed_occupancy_ratio',
 shap_value: 0.18,
 readable_desc: 'Severe bed stress (22/24 occupied = 91.6%) compounding deficit',
 direction: 'UP'
 },
 {
 feature_name: 'rolling_mean_7d',
 shap_value: -0.06,
 readable_desc: 'Baseline seasonal run-rate stabilizer',
 direction: 'DOWN'
 }
];

export const MOCK_ROUTING_RESULT: RoutingResult = {
 scale_tier: 'MICRO_QUANTUM',
 algorithm: 'Google OR-Tools Guided Local Search + OSRM Road Router (CVRPTW)',
 total_distance_km: 79.69,
 total_time_min: 138.4,
 cold_chain_compliant: true,
 runtime_ms: 12.66,
 quantum_mode: 'POSTGIS_KNN_ORTOOLS',
 google_maps_url: 'https://www.google.com/maps/dir/?api=1&origin=18.5612,73.8073&destination=18.5612,73.8073&waypoints=18.8475,73.9167|18.8263,74.3789|19.0142,73.7845&travelmode=driving',
 whatsapp_nav_share_url: 'https://api.whatsapp.com/send?text=%F0%9F%9A%9A%20%2ACareDOM%20Emergency%20Medicine%20Dispatch%2A%0A%F0%9F%93%8D%20Route%3A%20Depot%20%E2%9E%94%20Khed%20%E2%9E%94%20Shirur%20%E2%9E%94%20Ambegaon%0A%E2%9A%A1%20Total%20Distance%3A%2079.69%20km%0A%F0%9F%94%97%20Start%20GPS%20Navigation%3A%20https%3A//www.google.com/maps/dir/%3Fapi%3D1%26origin%3D18.5612%2C73.8073%26destination%3D18.5612%2C73.8073%26waypoints%3D18.8475%2C73.9167%7C18.8263%2C74.3789%7C19.0142%2C73.7845%26travelmode%3Ddriving',
 stops: [
 {
 sequence: 1,
 facility_id: 'PHC-PUN-001',
 name: 'Aundh Central Depot (Origin)',
 arrival_time: '08:00',
 departure_time: '08:30',
 demand_units: 0,
 distance_from_prev_km: 0
 },
 {
 sequence: 2,
 facility_id: 'PHC-PUN-002',
 name: 'PHC Khed (Surplus Collection)',
 arrival_time: '09:15',
 departure_time: '09:35',
 demand_units: -500, // Collected from surplus donor
 distance_from_prev_km: 32.4
 },
 {
 sequence: 3,
 facility_id: 'PHC-PUN-001',
 name: 'PHC Shirur (P0 Critical Delivery)',
 arrival_time: '10:40',
 departure_time: '11:10',
 demand_units: 500, // Delivered to recipient
 distance_from_prev_km: 36.8
 },
 {
 sequence: 4,
 facility_id: 'PHC-PUN-001',
 name: 'Aundh Central Depot (Return)',
 arrival_time: '12:20',
 departure_time: '12:30',
 demand_units: 0,
 distance_from_prev_km: 10.49
 }
 ]
};

export const MOCK_AGENT_TIMELINE: AgentTimelineStep[] = [
 {
 id: 'step-1',
 agent_name: 'ForecasterAgent',
 pill_type: 'thinking',
 pill_label: 'Thinking',
 action_summary: 'Evaluates 7-day quantile Tweedie loss model (p=1.3) across historical weather and clinic run-rate.',
 telemetry_code: 'LightGBM.predict(quantiles=[0.1, 0.5, 0.9], features=14) -> P50: 145.8, WAPE: 17.48%',
 elapsed_ms: 18.4,
 status: 'COMPLETED'
 },
 {
 id: 'step-2',
 agent_name: 'DetectorAgent',
 pill_type: 'grep',
 pill_label: 'Grepping',
 action_summary: 'Scans 18 per-facility Isolation Forests and compounds non-linear 3-pillar risk score.',
 telemetry_code: 'CascadeRisk.calc(med=0.85, bed=0.91, staff=0.10) -> Composite Score: 0.89 [P0_CRITICAL]',
 elapsed_ms: 42.1,
 status: 'COMPLETED'
 },
 {
 id: 'step-3',
 agent_name: 'AllocatorAgent',
 pill_type: 'read',
 pill_label: 'Reading',
 action_summary: 'Formulates QUBO Hamiltonian and dispatches to IBM Quantum QAOA circuit simulator.',
 telemetry_code: 'QAOA.solve(nodes=4, qubits=16, depth=2) -> Energy: -47.30, Tour: [0, 2, 1, 0], Dist: 79.69km',
 elapsed_ms: 12.66,
 status: 'COMPLETED'
 },
 {
 id: 'step-4',
 agent_name: 'SupervisorAgent',
 pill_type: 'edit',
 pill_label: 'Editing',
 action_summary: 'Audits donor buffer safety stock (1.8x > 1.5x threshold) and locks transfer agreement.',
 telemetry_code: 'SafetyGuardrail.verify(donor="PHC-PUN-002", remaining_buffer=1.8x) -> CONSENSUS_APPROVED',
 elapsed_ms: 5.2,
 status: 'COMPLETED'
 },
 {
 id: 'step-5',
 agent_name: 'ExplainerAgent',
 pill_type: 'done',
 pill_label: 'Done',
 action_summary: 'Synthesizes Marathi/Hindi voice briefings and synthesizes Google Maps GPS deep link.',
 telemetry_code: 'GeminiNarrator.generate(shap_drivers, lang="mr") -> Audio Note Synthesized (24s, 0.0% Hallucination)',
 elapsed_ms: 1240.0,
 status: 'COMPLETED'
 }
];

export const MOCK_OCR_ITEMS: OcrExtractedItem[] = [
 {
 id: 'ocr-1',
 item_code: 'MED-PCM-500',
 item_name: 'Paracetamol 500mg Tablets',
 batch_number: 'B2408',
 quantity: 1450,
 expiry_date: '2026-11-30',
 confidence: 0.984
 },
 {
 id: 'ocr-2',
 item_code: 'MED-AMX-250',
 item_name: 'Amoxicillin 250mg Capsules',
 batch_number: 'B2406',
 quantity: 320,
 expiry_date: '2026-09-30',
 confidence: 0.978
 },
 {
 id: 'ocr-3',
 item_code: 'MED-ORS-SFT',
 item_name: 'ORS Electrolyte Sachet (WHO formula)',
 batch_number: 'B2407',
 quantity: 85,
 expiry_date: '2027-01-15',
 confidence: 0.965
 }
];

export const MOCK_ALERTS: SystemAlert[] = [
 {
 id: 'alt-001',
 facility_id: 'PHC-PUN-001',
 facility_name: 'Primary Health Centre Shirur',
 severity: 'P0',
 timestamp: '10 mins ago',
 title: 'Critical Paracetamol Stockout Imminent (1.8 Days)',
 description_en: 'Severe stock depletion detected. Outbreak surge will consume remaining 145 units in 42 hours. Vehicle #1 dispatched with 500 emergency units from PHC Khed.',
 description_mr: 'सावधान: प्राथमिक आरोग्य केंद्र शिरूर येथे पॅरासिटामॉलचा साठा पुढील ४२ तासांत संपण्याची शक्यता आहे. खेड आरोग्य केंद्राकडून ५०० गोळ्यांचे वाहन क्रमांक १ द्वारे तातडीने वितरण सुरू करण्यात आले आहे.',
 description_hi: 'चेतावनी: प्राथमिक स्वास्थ्य केंद्र शिरूर में पैरासिटामोल का स्टॉक अगले ४२ घंटों में समाप्त होने का अनुमान है। खेड केंद्र से ५०० गोलियां वाहन क्रमांक १ द्वारा भेजी जा रही हैं।',
 audio_url_mr: '#',
 audio_url_hi: '#',
 acknowledged: false
 },
 {
 id: 'alt-002',
 facility_id: 'PHC-PUN-003',
 facility_name: 'Primary Health Centre Junnar',
 severity: 'P1',
 timestamp: '35 mins ago',
 title: 'ICU Bed Surge Warning (5/6 Beds Occupied - 83%)',
 description_en: 'ICU bed capacity approaching critical saturation due to viral encephalitis influx. Alerting District Hospital triage unit.',
 description_mr: 'सूचना: जुन्नर आरोग्य केंद्र आय.सी.यू. बेड्स ८३% भरले आहेत. जिल्हा रुग्णालयास सतर्क करण्यात आले आहे.',
 description_hi: 'सूचना: जुन्नर स्वास्थ्य केंद्र आईसीयू बेड ८३% भर चुके हैं। जिला अस्पताल को सूचित किया गया है।',
 acknowledged: true
 }
];
