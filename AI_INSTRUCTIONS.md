# 🤖 CareDOM AI Agent Dispatch & Developer Handover Instructions (BRICS Edition)

> **ATTENTION ANY AI CODING ASSISTANT (Cursor, Antigravity, Claude, ChatGPT, Copilot):**  
> If the user states **"I am Person 1"**, **"I am Person 2"**, **"I am Person 3"**, or **"I am Person 4"**, or asks you to work on their tasks, **YOU MUST IMMEDIATELY ADOPT THEIR ROLE, LOAD THEIR HANDOVER SPECIFICATION, AND CONSTRAIN YOUR WORK TO THEIR SUBSYSTEM.**

---

## 🎯 Developer Role Routing Matrix

| Developer Role | Subsystem / Directory | Primary Handover Blueprint | Responsibility |
| :--- | :--- | :--- | :--- |
| **Person 1** | `ai_engine/` | [`docs/team/PERSON_1_AI_OPTIMIZATION_LEAD.md`](docs/team/PERSON_1_AI_OPTIMIZATION_LEAD.md) | **Google Gemini 1.5 Flash Vision OCR (P0)**, LightGBM Demand Forecaster, OR-Tools CVRPTW |
| **Person 2** | `backend/` | [`docs/team/PERSON_2_BACKEND_DATABASE_LEAD.md`](docs/team/PERSON_2_BACKEND_DATABASE_LEAD.md) | FastAPI (ASGI), PostgreSQL 16 + PostGIS, **Beds + Staff + FEFO + Redistribution Engine** |
| **Person 3** | `frontend/` | [`docs/team/PERSON_3_FRONTEND_GIS_LEAD.md`](docs/team/PERSON_3_FRONTEND_GIS_LEAD.md) | React 19 + Vite PWA, **BRICS Switcher (India/South Africa)**, MapLibre GIS, 1-Click Transfer |
| **Person 4** | `voice/` & `docs/` | [`docs/team/PERSON_4_VOICE_ALERTS_SUBMISSION_LEAD.md`](docs/team/PERSON_4_VOICE_ALERTS_SUBMISSION_LEAD.md) | Webhook Alerts, WhatsApp Audio, **12-Slide Pitch Deck, 3-5 Min Video Walkthrough** |

---

## 🛠️ Mandatory Alignment Rules
1. **Google AI Integration Gate:** Gemini 1.5 Flash Vision (`ai_engine/ocr/gemini_extractor.py`) is the primary AI hook.
2. **BRICS Multi-Country Support:** Support `country_code` (`IND`, `ZAF`, `BRA`) across database and UI.
3. **The 3 Pillars:** Must expose and visualize **Medicines + Beds + Staff Attendance**.
4. **Hero Feature:** The `/api/v1/redistribution/suggest` endpoint using PostGIS nearest neighbor spatial matching.
5. **Zero Login Wall:** All dashboard read views must be open for judges without requiring passwords.
