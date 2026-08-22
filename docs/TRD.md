# ⚙️ TECHNICAL REQUIREMENTS DOCUMENT (TRD) — Research-Backed Edition
**Project Name:** KYZER (BRICS Smart Health Centre Management & Autonomous Co-Pilot)  
**Team Name:** KYZER | **Hackathon:** Build with AI: Code for Communities 2  

---

## 1. System Architecture & Component Mapping

```
                                    ┌────────────────────────────────────────────────────────┐
                                    │               KYZER SYSTEM ARCHITECTURE              │
                                    └───────────────────────────┬────────────────────────────┘
                                                                │
                 ┌──────────────────────────────────────────────┼──────────────────────────────────────────────┐
                 ▼                                              ▼                                              ▼
    ┌─────────────────────────┐                    ┌─────────────────────────┐                    ┌─────────────────────────┐
    │  CLIENT LAYER (PERSON 3)│                    │  API LAYER (PERSON 2)   │                    │  VOICE LAYER (PERSON 4) │
    │  • React 19 + Vite SPA  │ ◄─── REST / SSE ───┤  • FastAPI (ASGI)       │ ◄─── Webhooks ────┤  • IndicWhisper ASR     │
    │  • MapLibre GL GIS      │                    │  • SQLAlchemy 2.0 Async │                    │  • Meta WhatsApp Cloud  │
    │  • Offline-First Dexie  │                    │  • PostgreSQL + PostGIS │                    │  • MSG91 DLT SMS Gateway│
    └─────────────────────────┘                    └────────────┬────────────┘                    └─────────────────────────┘
                                                                │
                                                                ▼
                                    ┌────────────────────────────────────────────────────────┐
                                    │             AI & QUANTUM ENGINE (PERSON 1)             │
                                    │             ai_engine/engine.py: KYZEREngine         │
                                    └───────────────────────────┬────────────────────────────┘
                                                                │
                 ┌───────────────────────┬──────────────────────┼───────────────────────┬────────────────────────┐
                 ▼                       ▼                      ▼                       ▼                        ▼
        ┌─────────────────┐    ┌──────────────────┐   ┌──────────────────┐   ┌────────────────────┐   ┌───────────────────┐
        │ Vision Ingestion│    │ Demand Forecaster│   │ Cascade Risk     │   │ Quantum Routing    │   │ Explainability    │
        │ • OpenCV CLAHE  │    │ • LightGBM       │   │ • 3-Pillar Non-  │   │ • IBM Heron QAOA   │   │ • TreeSHAP Values │
        │ • Gemini 1.5    │    │   Tweedie Loss   │   │   Linear Copula  │   │ • D-Wave BQM       │   │ • Marathi/Hindi/  │
        │   Flash Vision  │    │ • SEIR ODE L-BFGS│   │ • IsoForest      │   │ • OR-Tools CVRPTW  │   │   English Narrator│
        └─────────────────┘    └──────────────────┘   └──────────────────┘   └────────────────────┘   └───────────────────┘
```

---

## 2. Mathematical Formulations

### 2.1 Demand Forecaster: Tweedie Compound Poisson-Gamma & Quantile Pinball
- **Tweedie Loss ($p=1.3$)**:
  $$\mathcal{L}_{\text{Tweedie}}(y, \mu) = 2 \left( \frac{y \mu^{1-p}}{1-p} - \frac{\mu^{2-p}}{2-p} - \frac{y^{2-p}}{(1-p)(2-p)} \right)$$
- **Quantile Pinball Loss ($\alpha \in \{0.10, 0.50, 0.90\}$)**:
  $$\mathcal{L}_\alpha(y, \hat{y}_\alpha) = \max(\alpha (y - \hat{y}_\alpha), (1 - \alpha)(\hat{y}_\alpha - y))$$
- **Recursive Autoregressive Horizon**:
  $$\hat{y}_{t+d} = f\left( X_t \cup \{\text{lag}_1 = \hat{y}_{t+d-1}, \text{rolling\_mean}_7 = \frac{1}{7} \sum_{k=1}^7 \hat{y}_{t+d-k}\} \right)$$

### 2.2 Cross-Drug Syndromic Covariance Matrix
$$\hat{y}_{i, \text{adjusted}} = \hat{y}_i \cdot \left(1 + \min\left(0.35, \frac{I_t}{50}\right) \cdot \frac{1}{|K_i|} \sum_{k \in K_i} \rho_{i,k}\right)$$

### 2.3 Non-Linear Compounding Cascade Risk
$$\text{Risk}_{\text{composite}} = 1 - (1 - m)^{1.6} \cdot (1 - b)^{1.4} \cdot (1 - s)^{1.2}$$
where $m = \text{Medicine Vulnerability}, b = \text{Bed Occupancy Stress}, s = \text{Staff Shortage Deficit}$.

### 2.4 Topographical Road Tortuosity
$$D_{\text{road}}(i, j) = D_{\text{Haversine}}(i, j) \times \tau_{\text{district}}$$
where $\tau_{\text{Pune}} = 1.38, \tau_{\text{Satara}} = 1.45, \tau_{\text{Default}} = 1.30$.

---

## 3. REST API Contract Specification (Person 2 Integration)

```
╔═══════════════════════╦═════════════════════════════════════╦═══════════════════════════════════════════════════════╗
║ HTTP ROUTE            ║ INPUT PAYLOAD                       ║ OUTPUT SCHEMA (KYZEREngine Response)                ║
╠═══════════════════════╬═════════════════════════════════════╬═══════════════════════════════════════════════════════╣
║ POST /api/v1/ai/run   ║ {                                   ║ {                                                     ║
║                       ║   "facility_id": "PHC-PUN-002",     ║   "status": "SUCCESS",                                ║
║                       ║   "item_code": "MED-PCM-500",       ║   "execution_time_ms": 2715.6,                        ║
║                       ║   "country_code": "IND"             ║   "ocr_telemetry": { ... },                           ║
║                       ║ }                                   ║   "demand_forecast": { P10/P50/P90 arrays },          ║
║                       ║                                     ║   "systemic_risk": { 3-pillar compound scores },      ║
║                       ║                                     ║   "route_optimization": { ordered stops, km, min },   ║
║                       ║                                     ║   "clinical_explainability": { Marathi, Hindi, EN }   ║
║                       ║                                     ║ }                                                     ║
╚═══════════════════════╩═════════════════════════════════════╩═══════════════════════════════════════════════════════╝
```

---

## 4. Hardware Profiles & Deployment Topology

- **Docker Container:** `python:3.10-slim` with pre-compiled wheels for LightGBM, Qiskit Aer, and OpenCV.
- **Memory Footprint:** $< 512\text{ MB}$ RAM on cold startup.
- **Model Bundle Pre-loading:** Serialized `.pkl` artifacts pre-loaded into memory in $\sim 145\text{ ms}$.
