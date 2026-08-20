import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  TrendingUp, 
  Truck, 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Play, 
  Cpu,
  Layers,
  Activity,
  ShieldCheck,
  Volume2
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface DemoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToStep: (stepIndex: number) => void;
}

export const DemoGuideModal: React.FC<DemoGuideModalProps> = ({
  isOpen,
  onClose,
  onJumpToStep,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      number: '01',
      title: 'Real-Time 3D Digital Twin & Stockout Triage',
      time: '0:00 - 0:45',
      badge: 'GIS & DECK.GL',
      icon: <MapPin className="w-5 h-5 text-[#38BDF8]" />,
      headline: 'Autonomous Monitoring Across 18 Rural Facilities in Pune District',
      bullets: [
        'Permanent 3D geospatial canvas rendering MapLibre Dark Matter + ArcGIS 3D Buildings.',
        'Koregaon Bhima PHC flagged with pulsing red ground radar: 0.3 days buffer stock remaining.',
        'Contextual Right Panel displays high-density telemetry: 79% bed occupancy, 2 doctors on duty.',
      ],
      actionLabel: 'INSPECT STOCKOUT NODE',
      actionKey: 0,
    },
    {
      number: '02',
      title: 'LightGBM Tweedie Forecaster & TreeSHAP Explainability',
      time: '0:45 - 1:30',
      badge: '17.48% WAPE',
      icon: <TrendingUp className="w-5 h-5 text-[#0D8050]" />,
      headline: 'Probabilistic Demand Bands with Epidemic SEIR ODE Coupling',
      bullets: [
        '7-day quantile demand forecasting (P10 minimum / P50 expected / P90 epidemic surge).',
        'TreeSHAP feature waterfall reveals why: Outbreak Surge (+42.1%) and Monsoon Rain (+31.0%).',
        'Interactive What-If counterfactual slider demonstrates real-time curve recalibration.',
      ],
      actionLabel: 'OPEN ML EXPLAINABILITY',
      actionKey: 1,
    },
    {
      number: '03',
      title: 'Quantum-Hybrid Peer Redistribution (QAOA + OR-Tools)',
      time: '1:30 - 2:15',
      badge: '33.2x SPEEDUP',
      icon: <Cpu className="w-5 h-5 text-[#C678DD]" />,
      headline: 'Hybrid QAOA + OR-Tools CVRPTW with Thermal Cold-Chain Safety',
      bullets: [
        'Stage 1 QUBO matrix matches surplus donor (Talegaon Dhamdhere PHC-PUN-004, 9.8 km) in 12.66ms.',
        'Stage 2 OSRM street-snapped graph router renders 60fps vehicle transit along SH-27.',
        'Cold-chain sensor integration enforces WHO 240-min +2°C to +8°C temperature safety limit.',
      ],
      actionLabel: 'DISPATCH QUANTUM ROUTE',
      actionKey: 2,
    },
    {
      number: '04',
      title: 'Multimodal Register Ingestion & Multilingual Voice Alerts',
      time: '2:15 - 3:00',
      badge: 'GEMINI 1.5 FLASH',
      icon: <Volume2 className="w-5 h-5 text-[#D9822B]" />,
      headline: 'Zero-Paperwork Ingestion for Frontline Nurses with ASHA Voice Synthesis',
      bullets: [
        'Client-side compressed canvas OCR extracts 4 pharmaceutical batches with 96.4% confidence.',
        'Decision Center dispatches Marathi, Hindi, and English voice notes for non-literate workers.',
        'One-click Google Maps Navigation GPS link and WhatsApp Driver Dispatch integration.',
      ],
      actionLabel: 'VIEW OCR & VOICE DISPATCH',
      actionKey: 3,
    },
  ];

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleExecuteStep = () => {
    onJumpToStep(currentStep);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hackathon Evaluation: 3-Minute Guided Demo Flow"
      subtitle="Interactive pitch guide demonstrating KYZER's end-to-end AI healthcare supply chain intelligence"
      badge={<Badge variant="primary" size="xs">JUDGE WALKTHROUGH MODE</Badge>}
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`w-6 h-6 rounded-full text-[10px] font-bold transition-all ${
                  currentStep === i
                    ? 'bg-[#106BA3] text-white scale-110'
                    : 'bg-[#202B33] text-[#A7B6C2] hover:text-[#F5F8FA]'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button variant="secondary" size="xs" onClick={handlePrev} leftIcon={<ArrowLeft className="w-3 h-3" />}>
                PREVIOUS
              </Button>
            )}
            <Button
              variant="primary"
              size="xs"
              onClick={handleExecuteStep}
              leftIcon={<Play className="w-3 h-3 text-[#38BDF8]" />}
            >
              {step.actionLabel}
            </Button>
            <Button variant="secondary" size="xs" onClick={handleNext} rightIcon={<ArrowRight className="w-3 h-3" />}>
              {currentStep === steps.length - 1 ? 'FINISH' : 'NEXT STEP'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 font-mono text-xs text-[#F5F8FA]">
        
        {/* Step Header Card */}
        <div className="p-3.5 bg-[#111418] border border-[#293742] rounded-[2px] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#106BA3] text-white font-bold rounded-[1px] text-[10px]">
                STEP {step.number} / 04
              </span>
              <span className="text-[10px] text-[#A7B6C2]">TIME: {step.time}</span>
            </div>
            <Badge variant="success" size="xs">{step.badge}</Badge>
          </div>

          <div className="flex items-start gap-3 pt-1">
            <div className="p-2 bg-[#202B33] border border-[#293742] rounded-[2px] shrink-0 mt-0.5">
              {step.icon}
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F5F8FA] font-sans">{step.title}</h2>
              <p className="text-xs text-[#38BDF8] mt-0.5">{step.headline}</p>
            </div>
          </div>
        </div>

        {/* Bullet Points */}
        <div className="foundry-card p-3.5 space-y-2.5 bg-[#182026]">
          <div className="text-[10px] uppercase font-bold text-[#A7B6C2] tracking-wider">
            WHAT THE EVALUATORS SEE:
          </div>
          <div className="space-y-2 font-sans">
            {step.bullets.map((b, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#F5F8FA]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0D8050] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
