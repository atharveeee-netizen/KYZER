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
      title: 'Scene 1: The Shortage (Problem)',
      time: '0:00 - 0:30',
      badge: 'URGENT SHORTAGE',
      icon: <MapPin className="w-5 h-5 text-[#EF4444]" />,
      headline: 'Koregaon Bhima PHC needs 50 units of Paracetamol 500mg',
      bullets: [
        'Staff nurse notices stock level has fallen to 130 units (under 3 days left).',
        'Traditional depot resupply takes 48 hours; patient demand is surging today.',
        'KYZER immediately identifies the shortage and searches nearby facilities.',
      ],
      actionLabel: 'HIGHLIGHT SHORTAGE ON MAP',
      actionKey: 0,
    },
    {
      number: '02',
      title: 'Scene 2: Finding Nearby Surplus (Search)',
      time: '0:30 - 0:55',
      badge: 'NEARBY STOCK',
      icon: <TrendingUp className="w-5 h-5 text-[#10B981]" />,
      headline: 'Found 820 units available at Talegaon Dhamdhere (9.8 km away)',
      bullets: [
        'Instead of placing a new central order, KYZER checks regional clinic inventory.',
        'PostGIS spatial search resolves Talegaon Dhamdhere at 9.8 km (18 min road transit).',
        'Map renders the exact transit corridor and validates cold-chain safety.',
      ],
      actionLabel: 'VIEW DONOR CORRIDOR',
      actionKey: 1,
    },
    {
      number: '03',
      title: 'Scene 3: Decision & Safety Buffer (Reasoning)',
      time: '0:55 - 1:20',
      badge: 'SAFE BUFFER',
      icon: <Cpu className="w-5 h-5 text-[#38BDF8]" />,
      headline: 'Transferring 50 units still leaves the source centre with 32 units buffer',
      bullets: [
        'Recommended transfer: 50 units Paracetamol (Batch B2408, expiry 2027-04).',
        'Source facility keeps 370 units, comfortably above its own 7-day reserve.',
        'Medical officer reviews the clear reasoning and approves the dispatch.',
      ],
      actionLabel: 'OPEN TRANSFER APPROVAL',
      actionKey: 2,
    },
    {
      number: '04',
      title: 'Scene 4: Action & Result (Resolution)',
      time: '1:20 - 1:45',
      badge: 'RESOLVED',
      icon: <Volume2 className="w-5 h-5 text-[#0F6254]" />,
      headline: '1-Click approval updates inventory and resolves the shortage alert',
      bullets: [
        'Stock transfers instantly in the FEFO ledger with cryptographic verification.',
        'Koregaon Bhima stock increases to safe level; shortage badge flips to Resolved.',
        'Driver receives SMS / WhatsApp navigation link for cold-chain transit.',
      ],
      actionLabel: 'APPROVE & RECORD TRANSFER',
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
