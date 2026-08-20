import React, { useState } from 'react';
import { 
  Zap, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2, 
  CloudRain, 
  Activity, 
  ShieldAlert, 
  TrendingUp,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunScenario: (params: { 
    scenarioName: string;
    surgeMultiplier: number; 
    rainMm: number; 
    r0: number;
    disruptedNodes: number;
  }) => void;
  isSimulating?: boolean;
}

export const ScenarioModal: React.FC<ScenarioModalProps> = ({
  isOpen,
  onClose,
  onRunScenario,
  isSimulating = false,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<'MONSOON' | 'DENGUE' | 'BLOCKADE' | 'CUSTOM'>('MONSOON');
  const [surgeMultiplier, setSurgeMultiplier] = useState<number>(3.2);
  const [rainMm, setRainMm] = useState<number>(180.0);
  const [r0, setR0] = useState<number>(2.45);
  const [disruptedNodes, setDisruptedNodes] = useState<number>(3);

  const handleSelectPreset = (preset: 'MONSOON' | 'DENGUE' | 'BLOCKADE' | 'CUSTOM') => {
    setSelectedPreset(preset);
    if (preset === 'MONSOON') {
      setSurgeMultiplier(3.2);
      setRainMm(180.0);
      setR0(2.15);
      setDisruptedNodes(3);
    } else if (preset === 'DENGUE') {
      setSurgeMultiplier(4.1);
      setRainMm(65.0);
      setR0(2.95);
      setDisruptedNodes(5);
    } else if (preset === 'BLOCKADE') {
      setSurgeMultiplier(1.8);
      setRainMm(15.0);
      setR0(1.4);
      setDisruptedNodes(8);
    }
  };

  const handleExecute = () => {
    const nameMap = {
      MONSOON: 'Monsoon Cloudburst & Flash Flooding (180mm Rain)',
      DENGUE: 'Vector-Borne Epidemic Surge (R0=2.95, 4.1x Inflow)',
      BLOCKADE: 'Highway Arterial Blockade (Peer Transfer Mode)',
      CUSTOM: `Custom Crisis Simulation (${surgeMultiplier}x Surge)`,
    };

    onRunScenario({
      scenarioName: nameMap[selectedPreset],
      surgeMultiplier,
      rainMm,
      r0,
      disruptedNodes,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Scenario Laboratory: Climate Shock & Epidemic Surge Sandbox"
      subtitle="Stress-test the 18-node healthcare network against severe monsoon flash floods, disease waves, and logistics bottlenecks"
      badge={<Badge variant="danger" size="xs">SEIR ODE COUPLING</Badge>}
      maxWidth="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            CANCEL
          </Button>
          <Button
            variant="danger"
            onClick={handleExecute}
            isLoading={isSimulating}
            leftIcon={<Zap className="w-3.5 h-3.5" />}
          >
            INJECT CRISIS SCENARIO INTO DIGITAL TWIN
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-xs font-mono text-[#F5F8FA]">
        
        {/* Disaster Preset Buttons */}
        <div className="space-y-1.5">
          <label className="text-[10px] text-[#A7B6C2] uppercase font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#D9822B]" />
            <span>Select Disaster Scenario Preset:</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleSelectPreset('MONSOON')}
              className={`p-2.5 rounded-[2px] border text-left transition-all ${
                selectedPreset === 'MONSOON'
                  ? 'border-[#38BDF8] bg-[#106BA3]/20'
                  : 'border-[#293742] bg-[#111418] hover:border-[#5C7080]'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-[#38BDF8]">
                <CloudRain className="w-3.5 h-3.5" />
                <span>Monsoon Flood</span>
              </div>
              <div className="text-[10px] text-[#A7B6C2] mt-1">180mm rain · 3 nodes cut off</div>
            </button>

            <button
              onClick={() => handleSelectPreset('DENGUE')}
              className={`p-2.5 rounded-[2px] border text-left transition-all ${
                selectedPreset === 'DENGUE'
                  ? 'border-[#C23030] bg-[#C23030]/20'
                  : 'border-[#293742] bg-[#111418] hover:border-[#5C7080]'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-[#C23030]">
                <Activity className="w-3.5 h-3.5" />
                <span>Dengue Wave</span>
              </div>
              <div className="text-[10px] text-[#A7B6C2] mt-1">R₀=2.95 · 4.1x consumption</div>
            </button>

            <button
              onClick={() => handleSelectPreset('BLOCKADE')}
              className={`p-2.5 rounded-[2px] border text-left transition-all ${
                selectedPreset === 'BLOCKADE'
                  ? 'border-[#D9822B] bg-[#D9822B]/20'
                  : 'border-[#293742] bg-[#111418] hover:border-[#5C7080]'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-[#D9822B]">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Depot Freeze</span>
              </div>
              <div className="text-[10px] text-[#A7B6C2] mt-1">100% lateral peer routing</div>
            </button>
          </div>
        </div>

        {/* Live Parameter Sliders */}
        <div className="p-3 bg-[#111418] border border-[#293742] rounded-[2px] space-y-3">
          <div className="flex items-center justify-between border-b border-[#293742] pb-1.5">
            <span className="font-bold text-[#F5F8FA] text-xs">DYNAMIC SIMULATION PARAMETERS</span>
            <span className="text-[10px] text-[#0D8050]">RECALCULATES REAL-TIME</span>
          </div>

          {/* Surge Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#A7B6C2]">Patient Intake Surge Multiplier:</span>
              <span className="font-bold text-[#C23030]">{surgeMultiplier.toFixed(1)}x NORMAL</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="5.0"
              step="0.1"
              value={surgeMultiplier}
              onChange={(e) => {
                setSelectedPreset('CUSTOM');
                setSurgeMultiplier(parseFloat(e.target.value));
              }}
              className="w-full accent-[#C23030]"
            />
          </div>

          {/* Rainfall Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#A7B6C2]">24-Hour Monsoon Precipitation:</span>
              <span className="font-bold text-[#38BDF8]">{rainMm.toFixed(0)} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="300"
              step="10"
              value={rainMm}
              onChange={(e) => {
                setSelectedPreset('CUSTOM');
                setRainMm(parseFloat(e.target.value));
              }}
              className="w-full accent-[#38BDF8]"
            />
          </div>

          {/* R0 Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#A7B6C2]">SEIR Transmission Rate (R₀):</span>
              <span className="font-bold text-[#D9822B]">{r0.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="4.0"
              step="0.05"
              value={r0}
              onChange={(e) => {
                setSelectedPreset('CUSTOM');
                setR0(parseFloat(e.target.value));
              }}
              className="w-full accent-[#D9822B]"
            />
          </div>
        </div>

        {/* Projected Impact Matrix Strip */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2 bg-[#202B33] border border-[#293742] rounded-[2px]">
            <div className="text-[8px] text-[#A7B6C2]">ESTIMATED TIME TO OUTAGE</div>
            <div className="text-xs font-bold text-[#C23030] mt-0.5">&lt; 14.8 Hours</div>
          </div>
          <div className="p-2 bg-[#202B33] border border-[#293742] rounded-[2px]">
            <div className="text-[8px] text-[#A7B6C2]">NETWORK AT RISK</div>
            <div className="text-xs font-bold text-[#D9822B] mt-0.5">{disruptedNodes} Facilities</div>
          </div>
          <div className="p-2 bg-[#202B33] border border-[#293742] rounded-[2px]">
            <div className="text-[8px] text-[#A7B6C2]">EMERGENCY RELOCATION</div>
            <div className="text-xs font-bold text-[#38BDF8] mt-0.5">1,250 Units</div>
          </div>
          <div className="p-2 bg-[#202B33] border border-[#293742] rounded-[2px]">
            <div className="text-[8px] text-[#A7B6C2]">ROUTING ALGORITHM</div>
            <div className="text-xs font-bold text-[#C678DD] mt-0.5">IBM Heron QAOA</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
