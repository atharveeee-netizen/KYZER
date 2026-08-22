# 🗺️ PERSON 3: FRONTEND & 3D GIS DASHBOARD ARCHITECTURE
**Role**: Arnav (Lead Frontend & Geospatial Systems Engineer)  
**Project**: KYZER — Autonomous Healthcare Supply Chain Platform  
**Team**: KYZER | **Hackathon**: Build with AI: Code for Communities 2

---

## 🎯 1. ROLE OVERVIEW & CORE RESPONSIBILITIES
Person 3 owns the **6-Tab Public Health Command Dashboard** built in `frontend/` adhering to the **Cursor Design System** and **MapLibre 3D Vector GIS**.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 PERSON 3 FRONTEND ARCHITECTURE                                  │
├────────────────────────┬────────────────────────┬───────────────────────┬───────────────────────┤
│ 🎨 1. CURSOR DESIGN    │ 🗺️ 2. 3D GIS & FLEET   │ 📈 3. FORECASTER & XAI│ 📸 4. REGISTER OCR    │
├────────────────────────┼────────────────────────┼───────────────────────┼───────────────────────┤
│ • Warm Cream Floor     │ • MapLibre 3D Vector   │ • Recharts P10/P50/P90│ • OpenCV Clean Scan   │
│   (#f7f7f4)            │   Map (Pitch: 60°)     │   Quantile Area Band  │   Side-by-Side View   │
│ • White Cards with 1px │ • 9-Clinic Autonomous  │ • TreeSHAP Clinical   │ • 3-Pillar Data Grid  │
│   Hairline Borders     │   AI Route Polyline    │   Driver Badges       │   (Meds, Beds, Staff) │
│ • Cursor Orange Primary│ • 1-Click Google Maps  │ • Coupled SEIR Out-   │ • Editable Quantities │
│   CTA Pill (#f54e00)   │   Turn-by-Turn GPS     │   break Diagnostics   │ • 1-Click Commit to   │
│ • Inter Display 400    │ • Human-in-the-Loop    │ • Live Multi-Agent    │   PostgreSQL Database │
│   + JetBrains Mono Code│   Road Blocker Modal   │   Timeline Pastels    │                       │
└────────────────────────┴────────────────────────┴───────────────────────┴───────────────────────┘
```

---

## 🗂️ 2. THE 6 DEDICATED TABS IMPLEMENTED

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [ 📊 Dashboard ] [ 🗺️ GIS Map ] [ 📋 Inventory ] [ 📈 Forecast ] [ 🚚 Routes ] [ 📸 OCR Ingestion ]   │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **`DashboardTab.tsx`**: Executive summary with 4 KPI cards (Total Clinics, $P_0$ Critical Risk, Bed Occupancy, WAPE $17.48\%$) + SSE Alert Ticker.
2. **`MapTab.tsx`**: 3D perspective MapLibre map (`pitch: 60°`, `bearing: -15°`) with 3D building extrusions, color-coded status markers (🔴 $P_0$, 🟡 $P_1$, 🟢 $P_2$), and the **"🤖 AI Agent Self-Plan 9-Clinic Route"** interactive simulation button.
3. **`InventoryTab.tsx`**: FEFO pharmaceutical inventory table with medicine search, facility filters, expiry countdowns, and a manual reallocation modal.
4. **`ForecastTab.tsx`**: Recharts quantile area band ($P_{10}, P_{50}, P_{90}$) with TreeSHAP explainability pills (0.0% Hallucination) and SEIR outbreak metrics.
5. **`RoutesTab.tsx`**: Active & past redistribution itinerary with cold-chain freshness validation ($<240\text{ min}$ SLA) and **1-Click WhatsApp Driver Dispatch**.
6. **`OcrTab.tsx`**: Side-by-side OpenCV $-8.0^\circ \rightarrow 0.0^\circ$ deskewed scan preview + editable data grid for nurse auditing.

---

## 🌐 3. CLOUD HOSTING & REPO STRUCTURE
- **GitHub Pages Hosting**: `https://atharveeee-netizen.github.io/KYZER/` (Bundled with Vite `base: './'` and `.nojekyll`).
- **Dependencies**: React 18, MapLibre GL JS, Recharts, Tailwind CSS v4, Lucide React.
