# 🏛️ CAREDOM FRONTEND ARCHITECTURE SPECIFICATION (FINAL)
### *Definitive Technical Blueprint for Person 3 (Frontend Lead — Arnav)*

**Project**: CareDOM — Smart Health Centre Management & Autonomous Supply Chain Co-Pilot  
**Team**: KYZER | **Hackathon**: Build with AI: Code for Communities 2  
**Target Platform**: Web SPA / Mobile-First PWA (Vite + React 19 + TypeScript)

---

## 🧭 1. EXECUTIVE SUMMARY & DESIGN PHILOSOPHY

The CareDOM frontend is a **single-pane-of-glass public health command center** designed for district health officers, clinicians, and frontline health workers across low-connectivity BRICS regions.

### Core Architectural Directives:
1. **Zero Bloat, Maximum Speed**: Lightweight (~65 KB bundle) built with **Vite + React 19 + Tailwind CSS v4**. Fast TTI ($< 1.5\text{s}$) on budget laptops and tablets.
2. **100% Free & Open-Source GIS**: Uses **MapLibre GL JS** with open vector tiles (CartoDB Dark/Light). Zero Mapbox/Google Maps API billing locks.
3. **Clinical Trust & Explainability**: Quantile demand forecasts ($P_{10}, P_{50}, P_{90}$) paired with **Game-Theoretic SHAP Feature Importance Badges**.
4. **Frontline Actionability**: 1-Click turn-by-turn **Google Maps GPS Navigation deep links** and **WhatsApp dispatch** for rural delivery drivers.
5. **Human-in-the-Loop Road Feedback**: Frontline workers can click map roads to flag `🚧 Road Blocked (Landslide/Flood)` and trigger instant **$< 200\text{ ms}$ Quantum-Classical rerouting**.

---

## 🗺️ 2. DASHBOARD WIREFRAME & COMPONENT LAYOUT

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🏥 CareDOM — Smart Health Centre Management & Supply Chain Co-Pilot         [ 🇮🇳 IND | 🇿🇦 ZAF | 🇧🇷 BRA ] │
├────────────────────────┬───────────────────────────────────────────────┬───────────────────────────────┤
│ 📊 DISTRICT HEALTH KPIs│ 🗺️ INTERACTIVE GIS MAP (MapLibre GL JS)       │ 📈 7-DAY DEMAND FORECAST      │
│                        │                                               │                               │
│ Total Clinics:   18    │   [PHC-PUN-004] (🟡 P1 Warning)               │ 1500┤        ... P90 (Surge)  │
│ Critical (P0):    2 🔴 │         ▲                                     │ 1000┤───────•   P50 (Median) │
│ Beds Occupied:  82% 🟡 │        / \                                    │  500┤  .....•   P10 (Lower)  │
│ Staff Present:  91% 🟢 │       /   \  Route: 79.69 km (138 min)        │    0└────────────────────    │
│ 7-Day WAPE:  17.48% 🟢 │  [DH-DEPOT] ────▶ [PHC-PUN-001] (🔴 P0)       │      Day 1  3  5  7          │
│ ────────────────────── │                     │                         │ ───────────────────────────── │
│ 📸 OCR INGESTION       │                     ▼                         │ 💡 TOP SHAP DRIVERS           │
│ [ 📤 Upload Register ] │                [PHC-PUN-002] (🟢 Surplus)     │ • Rainfall lag 3d: +48mm      │
│ (CamScanner + Gemini)  │                                               │ • Active viral cases: +24%    │
│                        │ ───────────────────────────────────────────── │ ───────────────────────────── │
│ 📋 FEFO INVENTORY GRID │ 📲 DRIVER DISPATCH ACTIONS                    │ 🚨 REAL-TIME SSE ALERTS       │
│ PCM-500: 1,450 (Nov26) │ [ 📍 Open Google Maps GPS ]                   │ 🔴 [P0 CRITICAL] PHC Shirur   │
│ AMX-250:   320 (Sep26) │ [ 💬 Send WhatsApp to Driver ]                │    PCM-500 stockout in 48h.   │
│ ORS Pkt:    85 ⚠️ (Low)│ [ 🚧 Flag Road Blocked / Reroute ]            │ 🔊 [▶ Play Marathi Voice Note]│
└────────────────────────┴───────────────────────────────────────────────┴───────────────────────────────┘
```

---

## 🧩 3. COMPONENT BREAKDOWN & TECHNICAL SPECS

### Component 1: `DistrictMap.tsx` (MapLibre Vector GIS)
- **Library**: `maplibre-gl` + `react-map-gl`
- **Features**:
  - Renders 18 BRICS health facilities (10 IND, 5 ZAF, 3 BRA) with dynamic camera panning on country switch.
  - Custom SVG HTML markers color-coded by compound risk:
    - 🔴 **Red Pulse (P0)**: Critical stockout ($\le 2\text{ days}$) or bed occupancy $>90\%$.
    - 🟡 **Amber (P1)**: Moderate risk / Depletes in 5–7 days.
    - 🟢 **Green (P2)**: Safe buffer / Verified redistribution donor.
  - Glowing **Quantum Route Polyline Layer** connecting stops in numerical order (`1 ➔ 2 ➔ 3`).
  - **Road Blocker Mode**: Clicking any road waypoint prompts: *"Mark this road as blocked due to monsoon flood/landslide?"* $\rightarrow$ triggers `POST /api/v1/routing/recalculate`.

### Component 2: `ForecastCurve.tsx` (Recharts 7-Day Quantile Band)
- **Library**: `recharts` (`AreaChart`, `ResponsiveContainer`)
- **Features**:
  - Shaded confidence gradient between $P_{10}$ (lower) and $P_{90}$ (upper monsoon stress).
  - Crisp solid curve for $P_{50}$ median demand.
  - Interactive hover tooltip showing exact expected tablet counts per day.

### Component 3: `ShapDrivers.tsx` (Clinical Explainability Badges)
- **Features**:
  - Displays top 3 feature drivers extracted from TreeSHAP (e.g., `💧 Rainfall Lag: +48mm (+32%)`, `🦠 Active Outbreak: +24%`, `📉 Stock Run-rate`).
  - Guarantees **0.0% Hallucination** because badges bind directly to backend Shapley weights.

### Component 4: `AlertFeed.tsx` & `VoicePlayer.tsx` (Real-Time SSE & Audio)
- **Protocol**: **Server-Sent Events (SSE)** via `EventSource('/api/v1/alerts/stream')`.
- **Features**:
  - Live animated feed of P0/P1 emergency notifications.
  - Embedded HTML5 Audio player with 1-click playback of synthesized **Marathi (मराठी), Hindi, and English voice notes**.

### Component 5: `DriverDispatchBar.tsx` (1-Click Turn-by-Turn GPS)
- **Features**:
  - Direct link to `google_maps_url`: Opens Google Maps voice navigation with pre-loaded waypoints on driver's Android/iPhone.
  - Direct link to `whatsapp_nav_share_url`: Dispatches the route directly to driver's WhatsApp in 1 tap.

### Component 6: `RegisterUploadModal.tsx` (OpenCV + Gemini OCR Ingestion)
- **Features**:
  - Drag-and-drop / Mobile camera photo upload.
  - Live side-by-side visual preview: **Raw Upload** vs **OpenCV Hough-Deskewed Clean Scan**.
  - Editable data grid allowing nurses to audit/adjust extracted quantities before committing to the database.

---

## 🔌 4. BACKEND API INTEGRATION CONTRACTS (PERSON 2 ➔ PERSON 3)

| Endpoint | Method | Purpose | Response Payload Key Fields |
| :--- | :--- | :--- | :--- |
| `/api/v1/facilities` | `GET` | Fetch all 18 clinics (filtered by `?country=IND`) | `facility_id, name, lat, lon, risk_tier, stock_level` |
| `/api/v1/ai/run` | `POST` | Execute full AI pipeline on facility | `demand_forecast, compound_risk, route_optimization, narrative` |
| `/api/v1/forecast/{id}`| `GET` | 7-day quantile prediction | `item_code, p10, p50, p90, wape_score, shap_top_drivers` |
| `/api/v1/route` | `POST` | Solve Quantum-Classical route | `total_distance_km, ordered_facilities, google_maps_url, whatsapp_nav_share_url` |
| `/api/v1/ocr/upload` | `POST` | Ingest photo of clinic register | `medicines, bed_occupancy, staff_present, enhanced_image_url` |
| `/api/v1/alerts/stream`| `GET (SSE)` | Real-time live emergency event stream | `event: "P0_ALERT", data: { facility_id, message, marathi_audio_url }` |

---

## 📦 5. FOLDER STRUCTURE (`frontend/`)

```
frontend/
├── public/
│   ├── favicon.ico
│   └── manifest.json             # PWA metadata
├── src/
│   ├── api/
│   │   ├── client.ts             # Axios instance + error interceptors
│   │   ├── facilities.ts         # Facility query hooks
│   │   ├── forecast.ts           # Forecast & SHAP hooks
│   │   ├── routing.ts            # Route optimization & blocker hooks
│   │   └── sse.ts                # Server-Sent Events listener hook
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx        # Title + BRICS Switcher (IND / ZAF / BRA)
│   │   │   └── KPISummary.tsx    # District summary metric cards
│   │   ├── map/
│   │   │   ├── DistrictMap.tsx   # MapLibre GL Canvas & Vector Tiles
│   │   │   ├── ClinicPin.tsx     # Color-coded P0/P1/P2 SVG markers
│   │   │   ├── RoutePolyline.tsx # Glowing cyan route overlay
│   │   │   └── RoadBlocker.tsx   # Frontline road feedback modal
│   │   ├── charts/
│   │   │   ├── ForecastBand.tsx  # Recharts P10/P50/P90 Area Chart
│   │   │   └── ShapPills.tsx     # Feature importance badges
│   │   ├── alerts/
│   │   │   ├── AlertStream.tsx   # SSE live ticker
│   │   │   └── VoiceNote.tsx     # Marathi/Hindi audio player widget
│   │   ├── ocr/
│   │   │   └── RegisterModal.tsx # Upload modal + Side-by-side verification
│   │   └── dispatch/
│   │       └── DriverNav.tsx     # 1-Click Google Maps & WhatsApp bar
│   ├── stores/
│   │   └── useCareDomStore.ts    # Zustand global state (active clinic, country)
│   ├── types/
│   │   └── api.ts                # TypeScript interfaces matching backend models
│   ├── App.tsx                   # Main Dashboard Shell
│   ├── main.tsx
│   └── index.css                 # Tailwind CSS design tokens
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🛠️ 6. EXACT `package.json` FOR PERSON 3

```json
{
  "name": "caredom-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.28.0",
    "axios": "^1.6.8",
    "clsx": "^2.1.0",
    "lucide-react": "^0.359.0",
    "maplibre-gl": "^4.1.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-map-gl": "^7.1.7",
    "recharts": "^2.12.3",
    "tailwind-merge": "^2.2.2",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.4.3",
    "vite": "^5.2.0"
  }
}
```

---

## 🏁 7. STEP-BY-STEP BUILD ORDER FOR PERSON 3:

1. **Sprint Hour 1**: Set up Vite + React + Tailwind + install dependencies.
2. **Sprint Hour 2**: Build `DistrictMap.tsx` with MapLibre GL, load the 10 Pune clinics from `brics_facilities_seed.json`, and render color-coded pins.
3. **Sprint Hour 3**: Build `ForecastBand.tsx` with Recharts ($P_{10}/P_{50}/P_{90}$) and `ShapPills.tsx`.
4. **Sprint Hour 4**: Connect `DistrictMap.tsx` with route polyline, add the **"📍 Open Google Maps GPS"** button and road-blocker modal.
5. **Sprint Hour 5**: Build `RegisterModal.tsx` for OCR upload and `AlertStream.tsx` with Marathi audio playback.
