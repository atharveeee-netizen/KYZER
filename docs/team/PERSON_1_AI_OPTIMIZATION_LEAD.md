# 🧠 PERSON 1: AI, PERCEPTION & QUANTUM OPTIMIZATION ARCHITECTURE
**Role**: Atharve (Lead AI & Quantum Systems Architect)  
**Project**: KYZER — Autonomous Healthcare Supply Chain Platform  
**Team**: KYZER | **Hackathon**: Build with AI: Code for Communities 2

---

## 🎯 1. ROLE OVERVIEW & CORE RESPONSIBILITIES
Person 1 owns the **Perception, Cognition, Multi-Scale Optimization, and Explainability Layers** packaged inside `ai_engine/`.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 PERSON 1 AI ENGINE PIPELINE                                     │
├────────────────────────┬────────────────────────┬───────────────────────┬───────────────────────┤
│ 👁️ 1. PERCEPTION      │ 🧠 2. COGNITION        │ ⚛️ 3. OPTIMIZATION    │ 🗣️ 4. EXPLAINABILITY  │
├────────────────────────┼────────────────────────┼───────────────────────┼───────────────────────┤
│ • OpenCV 5.0 Hough     │ • LightGBM Forecaster  │ • Adaptive Dispatcher │ • TreeSHAP Game-      │
│   Deskew (-8° ➔ 0°)    │   (Tweedie p=1.3)      │   (Micro ➔ Nation)    │   Theoretic Drivers   │
│ • Gaussian Illumination│ • 17.48% Verified WAPE │ • 9-Clinic Quantum    │ • Multilingual Gemini │
│   Background Whitening │ • 18 Isolation Forests │   QAOA (Heron r2)     │   Narrator (MR/HI/EN) │
│ • Table Auto-Cropping  │ • SEIR ODE Dynamics    │ • Google OR-Tools     │ • 0.0% Hallucination  │
│ • Gemini 1.5 Flash OCR │   (R₀=1.03, β=0.361)   │   CVRPTW (<240m SLA)  │   Constrained Ground  │
│ • 3-Pillar JSON Schema │ • Compound 3-Pillar    │ • Google Maps Direct  │ • 5-Agent Blackboard  │
│   (Meds, Beds, Staff)  │   Cascade Risk Score   │   Turn-by-Turn GPS URI│   State Machine       │
└────────────────────────┴────────────────────────┴───────────────────────┴───────────────────────┘
```

---

## 🔬 2. TECHNICAL SPECIFICATIONS & BENCHMARKS

### A. Ingestion & Perception (`ai_engine/ocr/`)
- **`ClinicRegisterImagePreprocessor`**:
  - `cv2.HoughLines` on polar coordinates detects handwriting/table skew and rotates to exact $0.0^\circ$ horizontal alignment.
  - `cv2.divide(gray, bg_gaussian, scale=245)` removes 100% of room shadows and paper yellowness.
  - `cv2.boundingRect` auto-crops out slanted canvas ghost corners.
- **`GeminiVisionExtractor`**: Calls `gemini-flash-latest` with `X-goog-api-key` header to extract `ClinicRegisterExtractionResult`.

### B. Forecaster & Outbreak Dynamics (`ai_engine/forecaster/`)
- **LightGBM Quantile Regressors** ($P_{10}, P_{50}, P_{90}$) trained on 45,990 records across 14 engineered features.
- **WAPE Error Rate**: **17.48%** (Median MAPE: 19.07%, Pinball: 1.036 / 1.478 / 1.217).
- **Coupled SEIR Outbreak ODE**: Numerically integrates $\beta=0.361, \gamma=0.350, R_0=1.03$ to scale consumption multipliers during epidemic surges.

### C. 9-Clinic Quantum-Classical Adaptive Router (`ai_engine/allocator/`)
- Solves redistribution for the **9 Pune District Clinics + 1 Central Depot Hub**:
  1. `PHC-PUN-001` (Shirur Sub-District Depot Hub)
  2. `PHC-PUN-002` (Koregaon Bhima PHC - $P_0$ Critical Recipient)
  3. `PHC-PUN-003` (Shikrapur Health Centre)
  4. `PHC-PUN-004` (Talegaon Dhamdhere PHC - $P_0$ Critical Recipient)
  5. `PHC-PUN-005` (Wagholi Community Health Centre)
  6. `PHC-PUN-006` (Chakan Primary Health Centre - $P_0$ Critical Recipient)
  7. `PHC-PUN-007` (Alandi Devachi Health Post)
  8. `PHC-PUN-008` (Khed Rural Hospital - $P_2$ Surplus Donor)
  9. `PHC-PUN-009` (Manchar Primary Health Centre)
  10. `PHC-PUN-010` (Junnar Sub-District Hospital)
- **Results**: **159.15 km** total distance, **178.4 min** transit time ($<240\text{ min}$ WHO cold-chain SLA).
- **Google Maps Navigation Integration**: Automatically generates universal deep links:
  `https://www.google.com/maps/dir/?api=1&origin=LAT,LNG&destination=LAT,LNG&waypoints=...&travelmode=driving`

### D. Explainability & Multi-Agent Orchestration (`ai_engine/explainer/` & `ai_engine/agents/`)
- **TreeSHAP**: Extracts top feature drivers with zero mathematical approximation.
- **Gemini Narrator**: Generates localized voice notes in Marathi (`mr`), Hindi (`hi`), and English (`en`).
- **Supervisor Safety Guardrail**: Rejects transfers if donor clinic 7-day buffer drops below **1.5× safety stock**.

---

## 📦 3. INTERFACE CONTRACTS WITH PERSON 2, 3 & 4
- **For Person 2 (Backend)**: Instantiates `KYZEREngine` as a singleton at FastAPI startup. Exposes `engine.run()`, `engine.route_allocator.optimize_routes()`, and `engine.ocr_engine.extract_from_image()`.
- **For Person 3 (Frontend)**: Emits 9-clinic waypoint coordinates, stop timings, and risk scores for 3D MapLibre rendering.
- **For Person 4 (Voice/Alerts)**: Returns Marathi/Hindi briefing strings and pre-formatted WhatsApp share links.
