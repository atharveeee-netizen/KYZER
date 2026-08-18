# 📋 PRODUCT REQUIREMENTS DOCUMENT (PRD) — BRICS Federated Edition
**Project Name:** CareDOM (BRICS Smart Health Centre Management)  
**Team Name:** KYZER | **Hackathon:** Build with AI: Code for Communities 2  
**Track:** Track 3 — Smart Health Centre Management & Supply Chain Resilience  
**Target Users:** Primary Health Centre (PHC) administrators, District Health Officers, Field Nurses/ASHAs, Cold-Chain Drivers across BRICS nations.  

---

## 1. Problem Statement
Rural primary health centres across BRICS nations (such as India, South Africa, and Brazil) suffer from critical operational disconnects:
- **60% of rural clinics** experience sudden stockouts of essential medicines (ORS, Antibiotics, Anti-venom).
- **Zero Real-Time Bed Visibility:** District hospitals and community health centres lack visibility into occupied vs available ICU and general beds during disease outbreaks.
- **Absenteeism & Staffing Imbalances:** No automated telemetry for doctor and nursing attendance.
- **Manual Data Traps:** Frontline workers spend 35% of their working hours logging records into physical, water-damaged paper registers.

---

## 2. Core Value Proposition: The 4 Pillars
1. 💊 **Medicine Stocks & Deterministic FEFO Allocation:** Complete batch-level inventory tracking with First-Expired, First-Out queueing.
2. 🛏️ **Real-Time Bed Availability:** Live monitoring of General and ICU bed occupancy rates across districts.
3. 👩‍⚕️ **Staff Attendance Telemetry:** Daily tracking of doctors and nurses present vs expected.
4. 🚚 **Automated Cross-District Resource Redistribution:** PostGIS nearest-neighbor algorithm that calculates the optimal surplus donor clinic within seconds.

---

## 3. Google AI Integration (Mandatory Gate)
- **Google Gemini 1.5 Flash Vision OCR:** Frontline workers take a phone photo of their handwritten paper register. Gemini extracts medicines, bed occupancy, and staff attendance directly into structured JSON, eliminating manual data entry.

---

## 4. Cross-Border BRICS Applicability (20% Scoring Weight)
- Built on the international **HL7 FHIR R4** healthcare standard.
- Multi-nation data support with native country selectors for **India 🇮🇳 (Maharashtra)**, **South Africa 🇿🇦 (Gauteng)**, and **Brazil 🇧🇷 (São Paulo)**.
