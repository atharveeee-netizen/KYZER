# 📋 PRODUCT REQUIREMENTS DOCUMENT (PRD) — Research-Backed Edition
**Project Name:** CareDOM (BRICS Smart Health Centre Management & Autonomous Co-Pilot)  
**Team Name:** KYZER | **Hackathon:** Build with AI: Code for Communities 2  
**Track:** Track 3 — Smart Health Centre Management & Supply Chain Resilience  
**Target Users:** Primary Health Centre (PHC) administrators, District Health Officers (DHO), Frontline ASHA Workers, ANMs, Cold-Chain Logistics Drivers.

---

## 1. Executive Summary & Problem Statement

Rural and semi-urban Primary Health Centres (PHCs) and Community Health Centres (CHCs) face recurring operational failures:
- **Catastrophic Medicine Stockouts:** Over 60% of rural clinics face sudden zero-inventory crises for essential medicines (e.g. Paracetamol, Amoxicillin, ORS, Anti-snake venom).
- **Zero Real-Time Bed & Telemetry Visibility:** District authorities have no live visibility into General and ICU bed saturation during localized epidemics.
- **Absenteeism & Staffing Imbalance:** High doctor and nursing deficits in rural clinics lead to preventable mortality.
- **Water-Damaged Paper Register Traps:** Frontline ASHA workers spend 35%+ of their clinical time maintaining physical paper logs, creating a 7–14 day latency before stockouts are reported.

CareDOM acts as an **autonomous clinical supply chain co-pilot**, synthesizing real-time computer vision OCR, quantile demand forecasting, SEIR dynamical epidemic coupling, and hybrid quantum-classical vehicle routing.

---

## 2. The 6 Core Scientific Pillars (Synthesized from 200+ Research Papers)

```
╔══════════════════════════════════╦══════════════════════════════════════════════════════════════════════════════╗
║ PILLAR                           ║ RESEARCH SPECIFICATION & FUNCTIONALITY                                       ║
╠══════════════════════════════════╬══════════════════════════════════════════════════════════════════════════════╣
║ 1. Vision OCR Ingestion          ║ OpenCV CLAHE & Auto-Deskew + Google Gemini 1.5 Flash Vision (98% Field Conf) ║
║ 2. Multi-Horizon Demand Forecast ║ LightGBM Tweedie Quantiles (P10/50/90) + Recursive Autoregressive 7-Day Roll ║
║ 3. Syndromic Outbreak Coupling   ║ Numerical SEIR ODE (L-BFGS-B) + Cross-Drug Epidemic Covariance Matrix         ║
║ 4. 3-Pillar Cascade Risk Engine  ║ Non-Linear Compounding Risk: 1 - (1-m)^1.6 * (1-b)^1.4 * (1-s)^1.2           ║
║ 5. Quantum-Classical Routing     ║ Topographical Ghats Routing (1.38x) + IBM QAOA / D-Wave BQM + OR-Tools CVRPTW║
║ 6. Multilingual XAI & Agents     ║ TreeSHAP Feature Attribution + Dynamic Marathi/Hindi/English Gemini Briefings ║
╚══════════════════════════════════╩══════════════════════════════════════════════════════════════════════════════╝
```

---

## 3. Real-World Dataset Repository Grounding

CareDOM is calibrated and benchmarked **exclusively on verified real-world public datasets**:

| Dataset Name | Source Repository | Content & Metrics |
|--------------|-------------------|-------------------|
| **Pharma Sales Daily Time Series** | `https://github.com/vcerqueira/data/raw/main/pharma.csv` | 45,990 records across 7 ATC drug categories (6 years) |
| **USAID GHSC-PSM Supply Chain** | `https://data.usaid.gov/HIV-AIDS/Supply-Chain-Shipment-Price-Data/` | 50,000+ real shipment lead-time and stockout records |
| **Open-Meteo Historical Climate** | `https://archive-api.open-meteo.com/v1/archive` | 10+ years daily rainfall, humidity, and temperature for Pune |
| **JHU CSSE / IDSP Outbreak Data** | `https://github.com/CSSEGISandData/COVID-19` | Daily district-level epidemiological growth curves |
| **DataMeet India Maps & PHCs** | `https://github.com/datameet/maps` | GeoJSON district boundaries and 30,000+ rural PHC GPS coordinates |
| **Solomon CVRPTW Benchmarks** | `http://vrp.galgos.inf.puc-rio.br/index.php/en/vrp-instances` | Standard vehicle routing benchmark instances (100–1000 nodes) |

---

## 4. User Personas & User Journeys

### Persona 1: Sunita (Frontline ASHA Worker, Rural Pune)
- **Goal:** Report daily drug dispensing and bed status in $<60\text{ seconds}$ without typing on tiny phone keyboards.
- **Journey:** Takes a photo of the clinic paper register $\rightarrow$ OpenCV auto-enhances and Gemini Vision extracts line items $\rightarrow$ Receives instant voice confirmation and Marathi briefing.

### Persona 2: Dr. Ramesh (District Health Officer, Pune District)
- **Goal:** Proactively prevent medicine stockouts 7 days before they occur during monsoon epidemics.
- **Journey:** Views GIS heat map of compound risk $\rightarrow$ Inspects 7-day $P_{10}/P_{50}/P_{90}$ forecast curves $\rightarrow$ Approves quantum-optimized lateral redistribution route with verified cold-chain safety ($<240\text{ min}$).

### Persona 3: Logistics Driver (Cold-Chain Reefer Van)
- **Goal:** Deliver medicines across rural clinics within strict temperature-controlled time windows.
- **Journey:** Receives turn-by-turn route sequence calibrated for Western Ghats road tortuosity ($1.38\times$), ensuring zero vaccine spoilage.

---

## 5. Success Metrics & Non-Negotiable SLAs

- **Forecaster Accuracy:** Weighted Absolute Percentage Error (WAPE) $< 18.0\%$; Median MAPE $< 20.0\%$.
- **Anomaly Detection Precision:** $\ge 75\%$ precision on real facility surge detection (eliminating $80\%+$ false alarms).
- **Cold-Chain Safety:** $100\%$ compliance with WHO 4-hour active transport window for critical vaccines.
- **API Latency:** Master AI Engine loads in $<150\text{ ms}$; full 6-stage pipeline executes in $<2.8\text{ seconds}$.
- **Zero-Downtime Quantum Fallback:** Instantaneous failover to Google OR-Tools Guided Local Search if QPU tokens are unavailable.
