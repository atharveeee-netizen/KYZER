# 🏥 CareDOM: A BRICS-Federated Smart Health Centre Management & Autonomous Supply Chain Platform

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.12%2B-blue?logo=python)](https://python.org)
[![React](https://img.shields.io/badge/React-19.0-cyan?logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green?logo=fastapi)](https://fastapi.tiangolo.com)
[![Google AI](https://img.shields.io/badge/Google%20AI-Gemini%201.5%20Flash-orange?logo=google)]()

> **CareDOM** is a BRICS-federated, AI-powered healthcare management platform that eliminates rural clinic stockouts by unifying real-time **medicine inventory**, **bed availability**, and **medical staff telemetry**. Powered by **Google Gemini 1.5 Flash Vision OCR** for zero-data-entry paper register scanning and **PostGIS** for automated cross-district resource redistribution, CareDOM delivers resilient healthcare supply chains across India 🇮🇳, South Africa 🇿🇦, and Brazil 🇧🇷.

---

## 👥 Team KYZER — Developer Handover & Architecture Matrix

> **🤖 For AI Coding Assistants (Antigravity, Cursor, Claude, ChatGPT, Copilot):**  
> If you are assisting a developer working on this codebase, find their role below and follow their dedicated blueprint:

| Developer Persona | Subsystem Directory | Comprehensive Architecture & Task Guide | Core Tech Stack |
| :--- | :--- | :--- | :--- |
| **🧠 Person 1** | [`ai_engine/`](ai_engine/) | [📄 **Person 1 AI & Optimization Lead**](docs/team/PERSON_1_AI_OPTIMIZATION_LEAD.md) | **Google Gemini 1.5 Flash Vision (P0)**, LightGBM, OR-Tools CVRPTW |
| **⚙️ Person 2** | [`backend/`](backend/) | [📄 **Person 2 Backend & Database Lead**](docs/team/PERSON_2_BACKEND_DATABASE_LEAD.md) | FastAPI (ASGI), PostgreSQL 16 + PostGIS, **Beds + Staff + FEFO + Redistribution** |
| **🖥️ Person 3** | [`frontend/`](frontend/) | [📄 **Person 3 Frontend & GIS Lead**](docs/team/PERSON_3_FRONTEND_GIS_LEAD.md) | Vite + React 19, **BRICS Switcher (IND/ZAF/BRA)**, MapLibre GIS, 1-Click Transfer |
| **🎙️ Person 4** | [`voice/`](voice/) | [📄 **Person 4 Voice & Submission Lead**](docs/team/PERSON_4_VOICE_ALERTS_SUBMISSION_LEAD.md) | Webhook Alerts, WhatsApp Audio, **12-Slide Pitch Deck, 3-5 Min Video Walkthrough** |

---

## ✨ The 4 Core Value Pillars
1. 💊 **Medicine Stocks & Deterministic FEFO Allocation:** Strict batch-level inventory tracking with First-Expired, First-Out queueing and cryptographic audit ledgers.
2. 🛏️ **Real-Time Bed Availability:** Live monitoring of General and ICU bed occupancy rates across rural clinics and district hospitals.
3. 👩‍⚕️ **Staff Attendance Telemetry:** Daily tracking of doctors and nurses present vs expected.
4. 🚚 **Automated Cross-District Resource Redistribution:** Instant PostGIS nearest-neighbor algorithm that calculates the optimal surplus donor clinic within seconds.

---

## 🚀 60-Second Quickstart

```bash
# 1. Clone the repository
git clone https://github.com/atharveeee-netizen/WISER_NESTLE_DOM.git
cd WISER_NESTLE_DOM

# 2. Configure environment keys
cp .env.example .env

# 3. Launch full stack with Docker Compose
docker-compose up --build
```
- 🖥️ **Web Dashboard:** [http://localhost:3000](http://localhost:3000)
- ⚙️ **FastAPI Swagger API:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📄 License
Distributed under the **Apache 2.0 License**. See `LICENSE` for details.
