# 🖥️ CareDOM Architecture: Person 3 — Frontend & GIS Lead (Updated BRICS Edition)
**Project:** CareDOM — BRICS-Federated Smart Health Centre Management  
**Team:** KYZER | **Hackathon:** Build with AI: Code for Communities 2  
**Role:** Person 3 — Frontend Dashboard, MapLibre GIS, BRICS Switcher & Zero-Auth Judge UX  

---

## 1. 📋 EXECUTIVE SUMMARY & SCOPE
Person 3 creates the visual command center that judges will interact with on the live deployed link.

| Feature | Design Specification | Impact |
| :--- | :--- | :--- |
| **BRICS Switcher** | Top-bar toggle: 🇮🇳 **India (Maharashtra)** \| 🇿🇦 **South Africa (Gauteng)** \| 🇧🇷 **Brazil (São Paulo)** | **20% Cross-Border Score** |
| **3 Core Pillars UI** | Live KPI Cards: **Medicine Stocks** + **Bed Occupancy (ICU/General)** + **Staff Attendance** | **20% Problem-Solution Fit** |
| **Redistribution Action** | 1-click modal: *"Emergency stockout at Dindori PHC -> Transfer 200 units from Nashik CHC (14km away)"* | **Hero Demo Moment** |
| **Zero Login Wall** | Immediate public access with a floating "Judge Demo Persona" pill | **Zero friction evaluation** |
| **GIS Mapping** | **MapLibre GL JS v4** with WebGL rendering & Okabe-Ito colorblind-safe status markers | **60 FPS high-density map** |
| **OCR Register Tool** | Camera upload -> Live Gemini OCR extraction preview -> One-tap commit | **Google AI Visibility** |

---

## 2. 🗺️ DASHBOARD VIEWS & COMPONENT BREAKDOWN

### 1. Header & Global Controls
- **Country Selector:** `[ 🇮🇳 India | 🇿🇦 South Africa | 🇧🇷 Brazil ]`
- **Judge Demo Persona Switcher:** `[ 👨‍⚕️ District Officer | 👩‍⚕️ Clinic Nurse | 🚚 Logistics Director ]`
- **Live System Status:** Green pulse dot indicating active Server-Sent Events (SSE) stream.

### 2. Multi-Pillar Hero Metrics Bar
- 💊 **Medicine Stockouts:** `3 Critical` (Pulsing Red)
- 🛏️ **Bed Occupancy:** `86% Occupied` (34/40 ICU beds in use)
- 👩‍⚕️ **Staff Attendance:** `91% Present` (42/46 doctors on duty)
- 🚚 **Active Transfers:** `2 In Transit` (Cold-chain monitored)

### 3. Interactive MapLibre GIS View
- **Markers:** Clinics color-coded by composite risk:
  - 🔴 **Red:** Zero stock of critical medicine OR 100% ICU bed saturation.
  - 🟡 **Amber:** Low buffer stock (<48 hrs) OR staff shortage.
  - 🟢 **Green:** Stable inventory and capacity.
- **Redistribution Polyline:** Clicking an emergency clinic displays a dashed glowing polyline to the nearest donor clinic with driving distance and transit time.

### 4. Interactive 1-Click Redistribution Modal
When a stockout is selected:
```
┌────────────────────────────────────────────────────────┐
│ 🚨 Automated Cross-District Redistribution             │
├────────────────────────────────────────────────────────┤
│ Destination: Dindori PHC (Stockout: ORS Sachets)       │
│ Recommended Donor: Nashik CHC (Distance: 14.2 km)      │
│ Surplus Available: 850 units (Batch: ORS2409B)         │
│ Estimated Delivery: 25 minutes                         │
│                                                        │
│ [ 🚀 Approve & Dispatch Transfer ]   [ Dismiss ]       │
└────────────────────────────────────────────────────────┘
```

---

## 3. 📁 FOLDER STRUCTURE (`frontend/`)

```text
frontend/
├── public/
│   ├── manifest.json
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── BricsCountrySwitcher.tsx # Multi-nation toggle
│   │   ├── JudgePersonaBar.tsx      # Zero-login demo role switcher
│   │   ├── PillarMetricCards.tsx    # Medicines + Beds + Staff cards
│   │   ├── MapLibreGISMap.tsx       # 50k+ facility WebGL map
│   │   ├── RedistributionModal.tsx  # 1-click PostGIS transfer popup
│   │   └── OCRScanUpload.tsx        # Camera -> Gemini OCR review
│   ├── pages/
│   │   ├── DashboardOverview.tsx
│   │   ├── FacilityDetailView.tsx
│   │   └── OCRUploadView.tsx
│   ├── hooks/
│   │   ├── useSSEAlerts.ts          # Real-time alert listener
│   │   └── useFacilities.ts         # TanStack Query client
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                    # Tailwind CSS v4 & high-contrast theme
├── package.json
└── vite.config.ts
```

---

## 4. ⏱️ PRIORITY TASK ORDER

| Priority | Task | Est. Hours | Impact |
| :--- | :--- | :--- | :--- |
| **P0** | Vite + React 19 shell + BRICS Country Switcher + Judge Persona pill | 2.5 hrs | Core Navigation & Cross-Border |
| **P0** | MapLibre GIS Map with facility risk markers | 3.5 hrs | Core Visual Experience |
| **P0** | 3-Pillar KPI Cards (Stockouts, Beds, Staff Attendance) | 2.0 hrs | 20% Rubric Scope |
| **P1** | 1-Click PostGIS Redistribution Action Modal | 2.0 hrs | Killer Demo Feature |
| **P1** | Mobile Camera OCR upload & table preview integration | 2.0 hrs | Google AI Gate UI |
| **P2** | Real-time SSE alert toasts & audio notification | 1.5 hrs | Live Reactivity |
