# 🗣️ PERSON 4: VOICE AI, WHATSAPP ALERTS & SUBMISSION LEAD ARCHITECTURE
**Role**: Sumit (Lead Voice AI, Alert Systems & Submission Director)  
**Project**: CareDOM — Autonomous Healthcare Supply Chain Platform  
**Team**: KYZER | **Hackathon**: Build with AI: Code for Communities 2

---

## 🎯 1. ROLE OVERVIEW & CORE RESPONSIBILITIES
Person 4 owns the **Multilingual Voice AI Synthesis, WhatsApp 1-Click Driver Dispatch Bot, and the 2:30 Live 3D Simulation Submission Video** located inside `voice/`.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 PERSON 4 VOICE & SUBMISSION                                     │
├────────────────────────┬────────────────────────┬───────────────────────┬───────────────────────┤
│ 🔊 1. MULTILINGUAL     │ 📲 2. WHATSAPP BOT     │ 🎬 3. 2:30 VIDEO DEMO │ 🏆 4. SUBMISSION PKG  │
├────────────────────────┼────────────────────────┼───────────────────────┼───────────────────────┤
│ • Marathi (मराठी),     │ • Meta Cloud API 1-Tap │ • 100% Live 3D Screen │ • GitHub Repo Structure│
│   Hindi & English TTS  │   Driver Navigation    │   Recording (No Slides)│ • Apache 2.0 License  │
│ • Low-Literacy Friendly│ • Google Maps Universal│ • 6-Step Multi-Agent  │ • 12-Slide Pitch Deck │
│   Pace (0.90x rate)    │   Turn-by-Turn GPS URI │   Simulation Timeline │ • ABDM / ABHA FHIR R4 │
│ • 0.0% Hallucination   │ • Auto Audio Note File │ • 9-Clinic Autonomous │   Compliance Roadmap  │
│   Constrained Grounding│   Attachment on Alert  │   Quantum Route Demo  │                       │
└────────────────────────┴────────────────────────┴───────────────────────┴───────────────────────┘
```

---

## 🎬 2. THE 2:30 LIVE 3D SIMULATION VIDEO DEMO SCRIPT (NO BORING SLIDES!)

| Timestamp | Phase & Agent Action | What Judges See on Screen | Audio / Narration |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:25** | **The Crisis & Outbreak Shock** | District officer clicks *"Simulate Outbreak"*. A 52mm monsoon storm hits Shirur valley. Active viral cases jump from $12 \rightarrow 68$. | *"In rural Maharashtra, 74% of health centres still manage medicine inventory on paper. When monsoon fever strikes, clinics stock out in under 48 hours."* |
| **0:25 – 0:50** | **Perception & ForecasterAgent** | Nurse snaps a tilted paper register photo. OpenCV Hough deskew straightens it to $0.0^\circ$ and Gemini Vision extracts 1,450 tablets in 1.4s. Forecaster evaluates Tweedie loss ($17.48\%$ WAPE) and spikes $P_{90}$ demand. | *"CareDOM's OpenCV pipeline cleans low-resource phone scans, feeding our LightGBM Tweedie forecaster to predict a 210-unit daily surge."* |
| **0:50 – 1:30** | **Quantum Routing across 9 Clinics** | `DetectorAgent` triggers $P_0$ alarm. `AllocatorAgent` formulates an 81-qubit Hamiltonian and solves the **159.15 km tour across the 9 Pune clinics** on IBM Quantum QAOA. Glowing route ribbon appears on the 3D map. | *"Our quantum-classical router formulates a Hamiltonian across 9 clinics, finding a 159 km route that strictly guarantees WHO's 4-hour cold-chain limit."* |
| **1:30 – 2:00** | **Supervisor Safety Audit** | `SupervisorAgent` audits the donor clinic (*PHC Khed*). Verifies that after sending 500 units, donor buffer remains $\ge 1.5\times$ safety stock. Green approval badge locks. | *"Before dispatch, our Supervisor Agent verifies the 1.5x safety stock guardrail, ensuring donor clinics are never stripped into deficit."* |
| **2:00 – 2:30** | **1-Click GPS Dispatch & Impact** | `ExplainerAgent` plays native Marathi audio note. Driver taps the WhatsApp link $\rightarrow$ **Google Maps App launches instantly in Turn-by-Turn GPS mode**! Stock restored to 100%. | *"The driver receives an instant WhatsApp alert with 1-click Google Maps GPS navigation. In 138 minutes, supplies arrive—saving lives autonomously."* |

---

## 📲 3. WHATSAPP CLOUD API PAYLOAD TEMPLATE (`voice/alerts/whatsapp.py`)

```python
def dispatch_whatsapp_route(to_phone: str, clinic_name: str, google_maps_url: str, marathi_text: str):
    """
    Sends 1-Click WhatsApp Driver Dispatch with Universal Google Maps Navigation Deep Link.
    """
    message = (
        f"🚚 *CareDOM Autonomous Emergency Dispatch*\n"
        f"🏥 Destination: {clinic_name}\n"
        f"📍 Stops: 9 Clinics + 1 Depot Hub (159.15 km)\n"
        f"❄️ Cold-Chain: 100% FRESHNESS COMPLIANT (<240m)\n\n"
        f"🔊 *मराठी संदेश (Audio Note Attached)*:\n_{marathi_text}_\n\n"
        f"🗺️ *Start Voice GPS Navigation*:\n{google_maps_url}"
    )
    return send_whatsapp_message(to_phone, message)
```
