import os

content = '''import React, { useState } from 'react';
import { 
  Bell, 
  Volume2, 
  Play, 
  Square,
  CheckCircle2, 
  Phone, 
  MessageSquare, 
  AlertCircle, 
  ShieldAlert, 
  Sparkles,
  MapPin,
  ArrowRightLeft,
  Navigation
} from 'lucide-react';
import { Drawer } from '../ui/Drawer';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SystemAlert } from '../../types';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: SystemAlert[];
  onAcknowledgeAlert?: (id: string) => void;
  onSelectFacility?: (facilityId: string) => void;
  onDispatchTransfer?: (facilityId: string) => void;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onAcknowledgeAlert,
  onSelectFacility,
  onDispatchTransfer,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<'mr' | 'hi' | 'en'>('mr');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'P0' | 'P1'>('ALL');

  const handleToggleAudio = (id: string, text: string) => {
    if (playingAudioId === id) {
      window.speechSynthesis?.cancel();
      setPlayingAudioId(null);
      return;
    }

    setPlayingAudioId(id);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedLanguage === 'hi' || selectedLanguage === 'mr') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-IN';
      }
      utterance.rate = 0.85; // Low-literacy friendly pace
      utterance.onend = () => setPlayingAudioId(null);
      utterance.onerror = () => setPlayingAudioId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPlayingAudioId(null), 3000);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter === 'ALL') return true;
    return a.severity === severityFilter;
  });

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Decision Center: Real-Time Clinical Triage Alerts"
      subtitle="Multilingual SSE dispatch feed with synthesized Marathi, Hindi, and English voice notes for frontline ASHA health workers"
      badge={
        <Badge variant="danger" dot pulse size="xs">
          {alerts.filter(a => !a.acknowledged).length} UNACKNOWLEDGED
        </Badge>
      }
      width="lg"
    >
      <div className="space-y-4 font-mono text-xs text-[#F5F8FA]">
        
        {/* Controls: Language Selector & Severity Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-2.5 bg-[#111418] border border-[#293742] rounded-[2px]">
          <div className="flex items-center gap-1.5 text-xs text-[#A7B6C2]">
            <Volume2 className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>VOICE LANGUAGE:</span>
            <div className="flex items-center gap-1 ml-1">
              {(['mr', 'hi', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-2 py-0.5 rounded-[1px] text-[10px] font-bold uppercase transition-colors ${
                    selectedLanguage === lang ? 'bg-[#106BA3] text-white' : 'bg-[#202B33] text-[#A7B6C2] hover:text-[#F5F8FA]'
                  }`}
                >
                  {lang === 'mr' ? 'मराठी' : lang === 'hi' ? 'हिंदी' : 'EN'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {(['ALL', 'P0', 'P1'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-0.5 rounded-[1px] text-[10px] font-bold uppercase transition-colors ${
                  severityFilter === sev ? 'bg-[#C23030] text-white' : 'bg-[#202B33] text-[#A7B6C2] hover:text-[#F5F8FA]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts Stream List */}
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const isP0 = alert.severity === 'P0';
            const isPlaying = playingAudioId === alert.id;
            const activeText =
              selectedLanguage === 'mr'
                ? alert.description_mr
                : selectedLanguage === 'hi'
                ? alert.description_hi
                : alert.description_en;

            return (
              <div
                key={alert.id}
                className={`foundry-card p-3.5 space-y-2.5 border-l-4 transition-all ${
                  alert.acknowledged
                    ? 'opacity-60 border-l-[#5C7080] bg-[#111418]'
                    : isP0
                    ? 'border-l-[#C23030] bg-[#C23030]/5'
                    : 'border-l-[#D9822B] bg-[#D9822B]/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={isP0 ? 'danger' : 'warning'} size="xs">
                      {alert.severity} CRITICAL
                    </Badge>
                    <span className="text-[#A7B6C2] text-[10px]">{alert.facility_id}</span>
                  </div>
                  <span className="text-[#A7B6C2] text-[10px]">{alert.timestamp}</span>
                </div>

                <div>
                  <div className="text-xs font-bold text-[#F5F8FA] font-sans">
                    {alert.facility_name}
                  </div>
                  <div className="text-xs font-semibold text-[#D9822B] mt-0.5">
                    {alert.title}
                  </div>
                </div>

                <p className="text-xs text-[#A7B6C2] leading-relaxed bg-[#111418]/60 p-2 rounded-[2px] border border-[#293742]/60">
                  {activeText}
                </p>

                {/* Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#293742]">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleAudio(alert.id, activeText)}
                      className={`px-2.5 py-1 rounded-[2px] text-[10px] font-bold flex items-center gap-1 transition-colors ${
                        isPlaying
                          ? 'bg-[#C23030] text-white animate-pulse'
                          : 'bg-[#106BA3]/20 text-[#38BDF8] hover:bg-[#106BA3]/40 border border-[#106BA3]/40'
                      }`}
                    >
                      {isPlaying ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      <span>{isPlaying ? 'STOP AUDIO' : 'PLAY VOICE NOTE'}</span>
                    </button>

                    {onSelectFacility && (
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => {
                          onSelectFacility(alert.facility_id);
                          onClose();
                        }}
                        leftIcon={<MapPin className="w-3 h-3 text-[#106BA3]" />}
                      >
                        FLY TO NODE
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onDispatchTransfer && !alert.acknowledged && (
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => {
                          onDispatchTransfer(alert.facility_id);
                          onClose();
                        }}
                        leftIcon={<ArrowRightLeft className="w-3 h-3" />}
                      >
                        DISPATCH TRANSFER
                      </Button>
                    )}

                    <Button
                      variant={alert.acknowledged ? "secondary" : "secondary"}
                      size="xs"
                      onClick={() => onAcknowledgeAlert && onAcknowledgeAlert(alert.id)}
                      leftIcon={<CheckCircle2 className={`w-3 h-3 ${alert.acknowledged ? 'text-[#0D8050]' : 'text-[#A7B6C2]'}`} />}
                    >
                      {alert.acknowledged ? 'ACKNOWLEDGED' : 'ACKNOWLEDGE'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Drawer>
  );
};
'''

with open('frontend/src/components/tactical/AlertsDrawer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('AlertsDrawer.tsx written successfully!')