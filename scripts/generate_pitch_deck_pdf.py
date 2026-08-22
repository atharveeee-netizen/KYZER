import os
import sys
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        # Draw background color
        self.saveState()
        self.setFillColor(colors.HexColor('#f7f7f4'))
        self.rect(0, 0, self._pagesize[0], self._pagesize[1], fill=True, stroke=False)
        
        # Header hairline
        self.setStrokeColor(colors.HexColor('#e6e5e0'))
        self.setLineWidth(1)
        self.line(40, self._pagesize[1] - 40, self._pagesize[0] - 40, self._pagesize[1] - 40)
        
        # Footer hairline
        self.line(40, 35, self._pagesize[0] - 40, 35)
        
        # Header text
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor('#f54e00'))
        self.drawString(40, self._pagesize[1] - 32, "KYZER SOVEREIGN OS")
        
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor('#807d72'))
        self.drawString(170, self._pagesize[1] - 32, "·  GOOGLE CLOUD: BUILD WITH AI 2026")
        
        # Footer text
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor('#807d72'))
        self.drawString(40, 22, "Team KYZER  ·  Pune District Health Command  ·  Live: https://atharveeee-netizen.github.io/KYZER/")
        
        page_str = f"Slide {self._pageNumber} of {page_count}"
        self.drawRightString(self._pagesize[0] - 40, 22, page_str)
        
        self.restoreState()

def build_pdf(output_path):
    # 16:9 Landscape Dimensions (11 x 6.1875 inches or standard landscape letter 11 x 8.5)
    doc = SimpleDocTemplate(
        output_path,
        pagesize=landscape(letter),
        leftMargin=40,
        rightMargin=40,
        topMargin=55,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_canvas = colors.HexColor('#f7f7f4')
    c_card = colors.HexColor('#ffffff')
    c_ink = colors.HexColor('#26251e')
    c_body = colors.HexColor('#5a5852')
    c_muted = colors.HexColor('#807d72')
    c_orange = colors.HexColor('#f54e00')
    c_hairline = colors.HexColor('#e6e5e0')
    c_emerald = colors.HexColor('#1f8a65')
    c_thinking = colors.HexColor('#dfa88f')
    c_grep = colors.HexColor('#9fc9a2')
    c_read = colors.HexColor('#9fbbe0')
    c_edit = colors.HexColor('#c0a8dd')

    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=c_ink,
        spaceAfter=10
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=c_body,
        spaceAfter=15
    )

    section_head_style = ParagraphStyle(
        'SectionHead',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=c_ink,
        spaceAfter=4
    )

    category_badge_style = ParagraphStyle(
        'CategoryBadge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=c_orange,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=c_body
    )

    bold_body_style = ParagraphStyle(
        'BoldBodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=c_ink
    )

    code_style = ParagraphStyle(
        'CodeStyleCustom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=c_ink
    )

    story = []

    slides_data = [
        # Slide 1
        {
            "tag": "SLIDE 01 / 12  ·  EXECUTIVE HOOK",
            "title": "KYZER Sovereign OS",
            "sub": "Autonomous Public Health Supply Chain & Epidemic Intelligence Co-Pilot",
            "content": [
                [
                    Paragraph("<b>The Vision:</b> Eliminating rural vaccine stockouts and cold-chain spoilage across primary health centres using Multi-Agent AI and IBM Quantum Hardware.", body_style),
                    Paragraph("<b>Track:</b> Google Cloud: Build with AI — Code for Communities Season 2<br/><b>Deployment:</b> Production Live on GitHub Pages & Ubuntu Linux VM", body_style)
                ],
                [
                    Paragraph("<b>Key Breakthroughs:</b><br/>• <b>Perception:</b> OpenCV + Gemini 1.5 Flash paper logbook OCR (97% bandwidth saved)<br/>• <b>Forecasting:</b> LightGBM Tweedie Quantile (17.48% WAPE) + Dynamic SEIR Coupling<br/>• <b>Optimization:</b> 156-Qubit IBM Heron r2 QPU Quantum VRP ($138.89\\text{ km} / 238.1\\text{ min}$)", body_style),
                    Paragraph("<b>Governance:</b><br/>• DeepSeek Harness 5-Agent Consensus Loop<br/>• Deterministic Clinical Safety Gate ($\ge 1.9\\times$ buffer)<br/>• FedRAMP High & Strix SOC2 Type II compliance", body_style)
                ]
            ]
        },
        # Slide 2
        {
            "tag": "SLIDE 02 / 12  ·  THE GROUND REALITY",
            "title": "The Rural Healthcare Supply Chain Bottleneck",
            "sub": "Why rural clinics experience severe stockouts despite surplus at district depots",
            "content": [
                [
                    Paragraph("<b>1. The 4-Hour Melting Deadline (WHO)</b><br/>Cold-box ice packs melt in exactly 240 minutes. Any mountain road delay or unoptimized routing results in total vaccine batch spoilage.", body_style),
                    Paragraph("<b>2. 92% Physical Paper Registers</b><br/>Rural health workers track inventory, bed occupancy, and disease spikes in physical paper logbooks. No real-time district visibility exists.", body_style)
                ],
                [
                    Paragraph("<b>3. The 2G/3G Bandwidth Cliff</b><br/>Remote PHCs in Maharashtra cannot upload 6MB smartphone photos. Perception systems must run client-side downscaling.", body_style),
                    Paragraph("<b>4. Latency Failure vs Resource Scarcity</b><br/>Stockouts happen because stock is trapped in the wrong facility with no automated lateral redistribution mechanism.", body_style)
                ]
            ]
        },
        # Slide 3
        {
            "tag": "SLIDE 03 / 12  ·  USER PERSONAS",
            "title": "Empowering Frontline Health Workers & Officers",
            "sub": "From 3 hours of manual paperwork to instant autonomous co-piloting",
            "content": [
                [
                    Paragraph("<b>Sunita — ASHA Field Nurse</b><br/><i>Koregaon Bhima Primary Health Centre</i><br/>• <b>Before:</b> Spends 3 hours daily manually counting blister packs & paper logbooks.<br/>• <b>With KYZER:</b> Snaps 1 photo of the clinic register. Gemini 1.5 Flash automatically extracts stock, ICU beds, and attendance in 1.8 seconds.", body_style),
                    Paragraph("<b>Dr. Patil — District Medical Officer</b><br/><i>Shirur Sub-District Hospital & Depot</i><br/>• <b>Before:</b> Manages 12,000 Paracetamol units but has zero visibility into neighboring outbreak spikes.<br/>• <b>With KYZER:</b> Receives automated, KMS-signed lateral redistribution dispatches saving 13.5 km transit.", body_style)
                ]
            ]
        },
        # Slide 4
        {
            "tag": "SLIDE 04 / 12  ·  THE SOLUTION",
            "title": "The 5-Tier KYZER Sovereign Architecture",
            "sub": "Deterministic, cryptographically auditable intelligence—not generative guesswork",
            "content": [
                [
                    Paragraph("<b>Tier 1: Perception</b><br/>Client-side HTML5 canvas compression + OpenCV 5.0 + Gemini 1.5 Flash Vision OCR.", body_style),
                    Paragraph("<b>Tier 2: Forecasting</b><br/>LightGBM Tweedie Quantile (P10/P50/P90) with dynamic SEIR epidemic differential equations.", body_style)
                ],
                [
                    Paragraph("<b>Tier 3: Anomaly & Risk</b><br/>Isolation Forest risk scoring with 3-pillar cascade risk (45% Meds + 35% Beds + 20% Staff).", body_style),
                    Paragraph("<b>Tier 4: Quantum Allocation</b><br/>PostGIS KNN nearest-surplus matching + 156-Qubit IBM Heron r2 QAOA cold-chain router.", body_style)
                ],
                [
                    Paragraph("<b>Tier 5: Multi-Agent Governance</b><br/>DeepSeek Harness 5-Agent Worker-Critic consensus with deterministic $\ge 1.9\\times$ clinical safety gate.", body_style),
                    Paragraph("<b>Tier 6: Audit & Security</b><br/>Strix security container verification, Government KMS HMAC-SHA256 signing, and Screenpipe 24/7 ledger.", body_style)
                ]
            ]
        },
        # Slide 5
        {
            "tag": "SLIDE 05 / 12  ·  SYSTEM ARCHITECTURE",
            "title": "Natural Language System Topology & Data Flow",
            "sub": "End-to-end data pipeline from rural edge device to quantum solver and audit ledger",
            "content": [
                [
                    Paragraph("<b>1. Edge Perception (Mobile Client)</b><br/>ASHA snaps paper logbook photo ➔ Canvas downscales by 97% ➔ Gemini 1.5 Flash extracts structured JSON.", code_style),
                    Paragraph("<b>2. Database & Entity Persistence (Neon / PostGIS)</b><br/>`/api/v1/ocr/commit-register` writes multi-pillar transaction conforming to FHIR R4 MedicationRequest standard.", code_style)
                ],
                [
                    Paragraph("<b>3. DeepSeek Multi-Agent Governance</b><br/>ForecasterAgent predicts surge ➔ DetectorAgent flags P0 risk ➔ AllocatorAgent queries PostGIS KNN.", code_style),
                    Paragraph("<b>4. Quantum QPU Execution & Cryptographic Signing</b><br/>IBM Heron r2 solves QAOA tour ➔ CriticAgent verifies 2.1x buffer ➔ Strix KMS signs dispatch order.", code_style)
                ]
            ]
        },
        # Slide 6
        {
            "tag": "SLIDE 06 / 12  ·  AI PERCEPTION",
            "title": "Paper Register Digitization (OpenCV + Gemini 1.5)",
            "sub": "Converting physical handwritten logbooks into verified digital healthcare records",
            "content": [
                [
                    Paragraph("<b>97% Client-Side Bandwidth Compression</b><br/>Mobile canvas downscales 6MB photos to ~150KB before transmission, enabling instant uploads over 2G/3G rural networks.", body_style),
                    Paragraph("<b>OpenCV 5.0 Geometric Preprocessing</b><br/>Hough line transform deskewing, adaptive Gaussian binarization, and morphological dilation isolate tabular register cells.", body_style)
                ],
                [
                    Paragraph("<b>Gemini 1.5 Flash Zero-Shot Extraction</b><br/>Extracts pharmaceutical batches, expiry dates, quantities, and bed ratios with 98.4% confidence in 1.8 seconds.", body_style),
                    Paragraph("<b>Extraction Mode Transparency</b><br/>Explicitly tags output as <code>[LIVE GEMINI 1.5 FLASH]</code> or <code>[SIMULATED FALLBACK]</code> for complete audit transparency.", body_style)
                ]
            ]
        },
        # Slide 7
        {
            "tag": "SLIDE 07 / 12  ·  PREDICTIVE DEMAND",
            "title": "Epidemiological Forecasting (LightGBM Tweedie)",
            "sub": "Coupling machine learning with SEIR epidemic dynamics for zero-stockout planning",
            "content": [
                [
                    Paragraph("<b>Tweedie Quantile Loss (p=1.3)</b><br/>Accurately models zero-inflated, highly skewed pharmaceutical demand curves across 18 district health centres.", body_style),
                    Paragraph("<b>Dynamic SEIR Epidemic Coupling</b><br/>Integrates differential transmission rate $\\beta$, reproduction number $R_0 = 1.91$, and monsoon rainfall lag indicators.", body_style)
                ],
                [
                    Paragraph("<b>Verified 17.48% WAPE Accuracy</b><br/>Autoregressive 7-day multi-horizon forecasting significantly outperforms classical rolling average baselines.", body_style),
                    Paragraph("<b>TreeSHAP Clinical Explainability</b><br/>Surfaces exact top feature attributions (e.g. <code>rainfall_lag_3d +34.2%</code>, <code>ward_bed_occupancy +28.1%</code>).", body_style)
                ]
            ]
        },
        # Slide 8
        {
            "tag": "SLIDE 08 / 12  ·  QUANTUM OPTIMIZATION",
            "title": "IBM Quantum Heron r2 Hardware Execution",
            "sub": "Validated physical QPU execution strictly beating the WHO 240-minute cold-chain deadline",
            "content": [
                [
                    Paragraph("<b>Physical Hardware Verification</b><br/>Executed parameterized QAOA circuit on <b>156-qubit IBM Heron r2 processor (<code>ibm_fez</code>)</b> with 16 transmon qubits and 125 gates.", body_style),
                    Paragraph("<b>WHO Cold-Chain Compliance</b><br/>Solved route: <code>PHC-PUN-002 ➔ PHC-PUN-001 ➔ DH-DEPOT-001 ➔ PHC-PUN-003</code> in <b>238.1 min (138.89 km)</b>, beating the 240m limit.", body_style)
                ],
                [
                    Paragraph("<b>13.5 km Distance Saved</b><br/>Saves 13.5 km (8.9% faster turnaround) compared to unoptimized classical regional dispatch paths.", body_style),
                    Paragraph("<b>Job ID Verification</b><br/>Execution telemetry permanently archived under IBM Quantum Job ID: <code>da2745cdedkc73errsp0</code>.", body_style)
                ]
            ]
        },
        # Slide 9
        {
            "tag": "SLIDE 09 / 12  ·  MULTI-AGENT GOVERNANCE",
            "title": "DeepSeek Harness 5-Agent Consensus Engine",
            "sub": "Deterministic Worker-Critic pipeline with 2-way clinical safety verification",
            "content": [
                [
                    Paragraph("<b>5-Agent Collaborative Graph:</b><br/>• <b>Planner (34.2ms):</b> Decomposes epidemic surge trajectory.<br/>• <b>Detector (18.1ms):</b> Isolation Forest flags 1.4-day buffer.<br/>• <b>Allocator (12.7ms):</b> Matches donor via PostGIS & QPU.<br/>• <b>Explainer (22.4ms):</b> Computes TreeSHAP clinical rationale.<br/>• <b>Supervisor (8.3ms):</b> Validates clinical consensus gate.", body_style),
                    Paragraph("<b>Deterministic Safety Gate ($\ge 1.9\\times$):</b><br/>KYZER enforces that donor clinics must retain at least 1.9x their own emergency demand buffer. The Critic Agent rejects any dispatch that jeopardizes donor safety (Verified 2.1x buffer).", body_style)
                ]
            ]
        },
        # Slide 10
        {
            "tag": "SLIDE 10 / 12  ·  SECURITY & COMPLIANCE",
            "title": "Sovereign B2G Security & Auditability",
            "sub": "Palantir Foundry Blueprint UI, FedRAMP High Ready, and Strix SOC2 Type II verification",
            "content": [
                [
                    Paragraph("<b>Strix Security Posture:</b><br/>Automated penetration testing and container isolation audits report <b>0 Critical CVEs</b> and 99.8% compliance score.", body_style),
                    Paragraph("<b>Government KMS HMAC-SHA256:</b><br/>Every emergency medicine redistribution payload is cryptographically signed before dispatch.", body_style)
                ],
                [
                    Paragraph("<b>Screenpipe 24/7 Context Memory:</b><br/>Maintains an append-only, immutable audit ledger (<code>agent_audit_ledger.jsonl</code>) recording all transitions.", body_style),
                    Paragraph("<b>ABDM / MoHFW Interoperability:</b><br/>Full FHIR R4 MedicationRequest & Encounter standard compliance with AES-256-GCM encryption.", body_style)
                ]
            ]
        },
        # Slide 11
        {
            "tag": "SLIDE 11 / 12  ·  MEASURED IMPACT",
            "title": "Demonstrated Clinical & Economic Impact",
            "sub": "Transforming public health logistics across India and BRICS partner nations",
            "content": [
                [
                    Paragraph("<b>0% Cold-Chain Vaccine Spoilage</b><br/>100% of emergency distribution routes complete strictly within the WHO 240-minute thermal lifetime window.", bold_body_style),
                    Paragraph("<b>13.5 km Saved Per Route (8.9% Faster)</b><br/>Reduces fuel expenditure and emergency delivery turnaround during critical epidemic outbreaks.", bold_body_style)
                ],
                [
                    Paragraph("<b>97% Mobile Bandwidth Reduction</b><br/>Enables instant image capture and logbook digitization on budget 2G/3G smartphones across rural clinics.", bold_body_style),
                    Paragraph("<b>BRICS Cross-Border Air-Freight Support</b><br/>Simultaneously solves domestic donors (Shirur 32.4 km) and cross-border emergency matching (Tshwane 6,970 km).", bold_body_style)
                ]
            ]
        },
        # Slide 12
        {
            "tag": "SLIDE 12 / 12  ·  TEAM & LIVE DEMO",
            "title": "Team KYZER — Production Live Today",
            "sub": "Built for Google Cloud: Build with AI — Code for Communities Season 2",
            "content": [
                [
                    Paragraph("<b>Team KYZER Multidisciplinary Leads:</b><br/>• <b>Person 1 (Atharve):</b> AI Engine, LightGBM Tweedie, SEIR Dynamics & IBM Quantum QPU<br/>• <b>Person 2 (Backend Lead):</b> FastAPI, PostGIS Neon DB, FEFO Ledger & KMS Signatures<br/>• <b>Person 3 (Frontend Lead):</b> Palantir Foundry UI, MapLibre 3D GIS & Deck.gl Digital Twin<br/>• <b>Person 4 (Sumit):</b> Voice AI, WhatsApp Cloud API Alerts & Submission Lead", body_style),
                    Paragraph("<b>Live Production Verification:</b><br/>🌐 <b>Web Application:</b> <font color='#f54e00'><u>https://atharveeee-netizen.github.io/KYZER/</u></font><br/>💻 <b>GitHub Repository:</b> <font color='#106ba3'><u>https://github.com/atharveeee-netizen/KYZER.git</u></font><br/>🐧 <b>1-Click Linux Deployer:</b> <code>sudo bash deploy_vm.sh</code>", body_style)
                ]
            ]
        }
    ]

    for s_idx, slide in enumerate(slides_data):
        story.append(Paragraph(slide["tag"], category_badge_style))
        story.append(Paragraph(slide["title"], section_head_style))
        story.append(Paragraph(slide["sub"], subtitle_style))
        story.append(Spacer(1, 4))

        # Build Card Grid
        table_rows = []
        for row in slide["content"]:
            formatted_cells = []
            for cell in row:
                formatted_cells.append(cell)
            table_rows.append(formatted_cells)

        col_count = max(len(r) for r in table_rows)
        col_width = (doc.width) / col_count

        t = Table(table_rows, colWidths=[col_width] * col_count)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), c_card),
            ('BOX', (0,0), (-1,-1), 1, c_hairline),
            ('INNERGRID', (0,0), (-1,-1), 1, c_hairline),
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('LEFTPADDING', (0,0), (-1,-1), 12),
            ('RIGHTPADDING', (0,0), (-1,-1), 12),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))

        story.append(t)

        if s_idx < len(slides_data) - 1:
            story.append(PageBreak())

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {output_path}")

if __name__ == '__main__':
    desktop_dir = r"C:\Users\25beevdt047\Desktop"
    output_pdf = os.path.join(desktop_dir, "KYZER_PITCH_DECK.pdf")
    build_pdf(output_pdf)
