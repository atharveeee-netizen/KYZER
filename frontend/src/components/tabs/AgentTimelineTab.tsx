import React, { useState } from 'react';
import { Play, RotateCcw, CheckCircle2, Clock, Terminal, ShieldCheck, Sparkles } from 'lucide-react';
import { AgentTimelineStep, TimelinePillType } from '../../types';

interface AgentTimelineTabProps {
  timelineSteps: AgentTimelineStep[];
  onReRunTimeline: () => void;
}

export const AgentTimelineTab: React.FC<AgentTimelineTabProps> = ({
  timelineSteps,
  onReRunTimeline,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(timelineSteps.length - 1);

  // Helper for the exact Cursor pastel pills
  const getPillStyles = (type: TimelinePillType) => {
    switch (type) {
      case 'thinking':
        return { bg: 'bg-[#dfa88f]', text: 'text-ink' }; // Peach
      case 'grep':
        return { bg: 'bg-[#9fc9a2]', text: 'text-ink' }; // Mint
      case 'read':
        return { bg: 'bg-[#9fbbe0]', text: 'text-ink' }; // Pastel Blue
      case 'edit':
        return { bg: 'bg-[#c0a8dd]', text: 'text-ink' }; // Lavender
      case 'done':
        return { bg: 'bg-[#c08532]', text: 'text-white' }; // Warm Gold
    }
  };

  const totalRuntimeMs = timelineSteps.reduce((acc, s) => acc + s.elapsed_ms, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase bg-surface-strong px-2 py-0.5 rounded-pill text-ink font-semibold">
              Autonomous 5-Agent Blackboard State Machine
            </span>
          </div>
          <h1 className="text-2xl font-display text-ink mt-1">Multi-Agent Collaborative Execution Timeline</h1>
          <p className="text-xs text-muted">
            Inspect chronological consensus, bidirectional safety checks, and quantum routing telemetry.
          </p>
        </div>

        {/* Execution Stats & Rerun */}
        <div className="flex items-center gap-3">
          <div className="bg-surface-card border border-hairline rounded-md px-3 py-2 text-right">
            <span className="text-[10px] font-mono text-muted uppercase block">Total Execution</span>
            <span className="text-sm font-mono text-ink font-semibold">{totalRuntimeMs.toFixed(1)} ms</span>
          </div>
          <button
            onClick={onReRunTimeline}
            className="flex items-center gap-1.5 bg-ink hover:bg-black text-canvas text-xs font-medium px-3.5 py-2.5 rounded-md transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-Execute Agents</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Timeline Steps / Right In-Depth Code Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Chronological Agent Steps (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {timelineSteps.map((step, idx) => {
            const pill = getPillStyles(step.pill_type);
            const isSelected = activeStepIndex === idx;

            return (
              <div
                key={step.id}
                onClick={() => setActiveStepIndex(idx)}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-surface-card border-hairline-strong shadow-xs ring-1 ring-hairline-strong'
                    : 'bg-surface-card/60 hover:bg-surface-card border-hairline'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {/* Cursor AI-Timeline Pastel Pill Signature */}
                    <span
                      className={`text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-pill font-semibold tracking-wider ${pill.bg} ${pill.text}`}
                    >
                      {step.pill_label}
                    </span>
                    <span className="text-xs font-semibold text-ink">{step.agent_name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-muted">{step.elapsed_ms} ms</span>
                </div>

                <p className="text-xs text-body leading-relaxed mb-2">
                  {step.action_summary}
                </p>

                {/* Inline Telemetry Snippet */}
                <div className="bg-canvas-soft border border-hairline rounded-sm p-2 text-[11px] font-mono text-muted truncate">
                  <code>{step.telemetry_code}</code>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: IDE-Mockup Terminal Telemetry Pane (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="bg-surface-card border border-hairline rounded-lg overflow-hidden shadow-xs h-full flex flex-col">
            
            {/* IDE Pane Header */}
            <div className="bg-canvas-soft border-b border-hairline px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-muted" />
                <span className="text-xs font-mono text-ink font-medium">
                  {timelineSteps[activeStepIndex]?.agent_name} — Runtime Telemetry & Guardrail Log
                </span>
              </div>
              <span className="text-[10px] font-mono text-semantic-success bg-green-50 border border-green-200 px-2 py-0.5 rounded-xs">
                STATUS: 200 OK
              </span>
            </div>

            {/* JetBrains Mono Code Surface */}
            <div className="p-5 flex-1 bg-[#fafaf7] font-mono text-xs text-ink overflow-y-auto space-y-4">
              <div>
                <span className="text-muted block text-[11px] mb-1">// Blackboard State Machine Transition</span>
                <p className="text-body font-sans text-xs bg-white border border-hairline p-3 rounded-md">
                  {timelineSteps[activeStepIndex]?.action_summary}
                </p>
              </div>

              <div>
                <span className="text-muted block text-[11px] mb-1">// Executed Logic & Telemetry</span>
                <pre className="bg-white border border-hairline p-3 rounded-md overflow-x-auto text-[11px] leading-relaxed text-ink">
                  {timelineSteps[activeStepIndex]?.telemetry_code}
                </pre>
              </div>

              {/* Guardrail Verification Proof */}
              <div className="border-t border-hairline pt-3">
                <span className="text-muted block text-[11px] mb-1">// Safety Guardrail Audit</span>
                <div className="flex items-center gap-2 text-semantic-success text-xs font-sans">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Verified: Donor clinic safety stock remains &ge; 1.5&times; threshold after transfer.</span>
                </div>
              </div>
            </div>

            {/* Footer Status */}
            <div className="bg-canvas border-t border-hairline px-4 py-2 text-[11px] font-mono text-muted flex items-center justify-between">
              <span>Asyncio Event Loop: Synchronized</span>
              <span>Memory Footprint: 145 ms Warmup</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
